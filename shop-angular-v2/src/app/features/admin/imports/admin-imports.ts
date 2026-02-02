import { Component, OnInit } from '@angular/core';
import { ImportService } from '../../../core/services/import.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Import, ImportCreate, ImportItemCreate } from '../../../shared/models/import.model';
import { Product } from '../../../shared/models/product.model';
import { getCategoryLabel, getColorLabel } from '../../../shared/models/enums';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-admin-imports',
    templateUrl: './admin-imports.html',
    styleUrls: ['./admin-imports.scss']
})
export class AdminImportsComponent implements OnInit {
    imports: Import[] = [];
    loading = false;

    // Create Import logic
    showCreateModal = false;
    submitting = false;

    // Data for creation
    products: Product[] = [];
    importItems: any[] = []; // Temporary structure for UI: { productId: number, quantity: number, price: number }

    selectedImport: Import | null = null;
    showDetailsModal = false;

    constructor(
        private importService: ImportService,
        private productService: ProductService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        this.loadImports();
        this.loadProducts();
    }

    loadImports(): void {
        this.loading = true;
        this.importService.getImports().subscribe({
            next: (data) => {
                // API might return array directly or wrapped. 
                // Based on my service implementation which expects Import[], let's assume array.
                // If it's PagedResult, we need to adjust service or here.
                // Let's handle both just in case or assume array as per prev thought.
                this.imports = Array.isArray(data) ? data : (data as any).items || [];
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading imports:', err);
                this.loading = false;
            }
        });
    }

    loadProducts(): void {
        // Get list of products for the dropdown
        // Fetch larger page size to ensure new products appear
        this.productService.getProducts({ pageNumber: 1, pageSize: 1000, isGrouped: false }).subscribe({
            next: (res) => {
                const items = (res as any).items || res;
                // Sort by name for easier searching
                this.products = items.sort((a: any, b: any) => a.name.localeCompare(b.name));
            }
        });
    }

    openCreateModal(): void {
        // Reload products to ensure we have the latest list
        this.loadProducts();

        this.importItems = [
            { productId: null, quantity: 1, importPrice: 0 }
        ];
        this.showCreateModal = true;
    }

    closeCreateModal(): void {
        this.showCreateModal = false;
        this.importItems = [];
    }

    addItemRow(): void {
        this.importItems.push({ productId: null, quantity: 1, importPrice: 0 });
    }

    removeItemRow(index: number): void {
        this.importItems.splice(index, 1);
    }

    onProductChange(item: any): void {
        if (!item.productId) return;

        const product = this.products.find(p => p.idSP === Number(item.productId));
        if (product) {
            // Check if product has 'importPrice'. 
            // In the Product interface from file view, it has 'price' (selling price).
            // 'importPrice' is only in ProductCreate interface.
            // But API response likely includes it if backend sends it. 
            // If strictly typed, we might not see it, but we can cast or fallback to 0.
            // Let's check if 'importPrice' exists on the runtime object or fallback to 0.
            // Or maybe the user means Selling Price? Usually Import Price.
            // Let's try to access importPrice or 0.

            // To be safe with TS, cast to any
            const p = product as any;
            item.importPrice = p.importPrice || 0;

            // If importPrice is missing, maybe default to 0 or leave it editable. 
            // Better to show 0 so user knows they need to input.
        }
    }

    get totalImportCost(): number {
        return this.importItems.reduce((sum, item) => sum + (item.quantity * item.importPrice), 0);
    }

    submitImport(): void {
        // Validate
        const validItems = this.importItems.filter(i => i.productId && i.quantity > 0 && i.importPrice >= 0);

        if (validItems.length === 0) {
            this.toastService.warning('Vui lòng chọn ít nhất 1 sản phẩm hợp lệ');
            return;
        }

        this.submitting = true;
        const createData: ImportCreate = {
            items: validItems.map(i => ({
                idSP: Number(i.productId),
                quantity: i.quantity,
                importPrice: i.importPrice
            }))
        };

        this.importService.createImport(createData).subscribe({
            next: () => {
                this.toastService.success('Tạo phiếu nhập thành công!');
                this.closeCreateModal();
                this.loadImports();
                this.submitting = false;
            },
            error: (err) => {
                console.error('Error creating import:', err);
                this.toastService.error('Lỗi: ' + (err.error?.message || err.message));
                this.submitting = false;
            }
        });
    }

    viewDetails(imp: Import): void {
        this.selectedImport = imp;
        this.showDetailsModal = true;
    }

    exportToExcel(): void {
        if (!this.selectedImport || !this.selectedImport.details) return;

        // Prepare data
        const data = this.selectedImport.details.map((item, index) => {
            const product = this.products.find(p => p.idSP === item.idSP);

            return {
                'STT': index + 1,
                'Tên sản phẩm': item.productName,
                'Danh mục': product ? getCategoryLabel(product.category) : '',
                'Kích thước': product ? product.size : '',
                'Màu sắc': product ? getColorLabel(product.color) : '',
                'Số lượng': item.quantity,
                'Giá nhập': item.importPrice,
                'Thành tiền': item.subTotal
            };
        });

        // Create worksheet
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

        // Adjust column widths
        const wscols = [
            { wch: 5 },  // STT
            { wch: 40 }, // Ten san pham
            { wch: 15 }, // Danh muc
            { wch: 10 }, // Kich thuoc
            { wch: 10 }, // Mau sac
            { wch: 10 }, // So luong
            { wch: 15 }, // Gia nhap
            { wch: 15 }  // Thanh tien
        ];
        ws['!cols'] = wscols;

        // Create workbook
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Chi tiết phiếu nhập');

        // Save file
        const fileName = `PhieuNhap_${this.selectedImport.idImport}_${new Date().getTime()}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }

    exportListToExcel(): void {
        if (!this.imports || this.imports.length === 0) {
            this.toastService.warning('Không có dữ liệu để xuất');
            return;
        }

        // Prepare data
        const data = this.imports.map(item => ({
            'Mã Phiếu': item.idImport,
            'Ngày nhập': new Date(item.importDate).toLocaleString('vi-VN'),
            'Người nhập': item.email,
            'Tổng chi phí': item.totalCost
        }));

        // Create worksheet
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

        // Adjust column widths
        const wscols = [
            { wch: 10 }, // Ma Phieu
            { wch: 20 }, // Ngay nhap
            { wch: 30 }, // Nguoi nhap
            { wch: 15 }  // Tong chi phi
        ];
        ws['!cols'] = wscols;

        // Create workbook
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Danh sách phiếu nhập');

        // Save file
        const fileName = `DanhSachPhieuNhap_${new Date().getTime()}.xlsx`;
        XLSX.writeFile(wb, fileName);
    }

    closeDetailsModal(): void {
        this.showDetailsModal = false;
        this.selectedImport = null;
    }
}
