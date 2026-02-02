import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { OrderResponse, OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../../shared/models/order.model';
import { PagedResult } from '../../../shared/models/pagination.model';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-admin-orders',
    templateUrl: './admin-orders.html',
    styleUrls: ['./admin-orders.scss']
})
export class AdminOrdersComponent implements OnInit {
    orders: OrderResponse[] = [];
    loading = false;
    exporting = false;

    // Filter for export
    filterFromDate = '';
    filterToDate = '';

    currentPage = 1;
    pageSize = 10;
    totalPages = 0;
    totalCount = 0;

    selectedOrder: OrderResponse | null = null;
    showDetailsModal = false;

    statusLabels = ORDER_STATUS_LABELS;
    statusColors = ORDER_STATUS_COLORS;

    // Available statuses for filter and update
    statuses: OrderStatus[] = ['ChoXacNhan', 'DaXacNhan', 'DaVanChuyen', 'DaNhanHang', 'DaHuy'];
    selectedStatusFilter = '';

    searchTerm = '';

    constructor(
        private orderService: OrderService,
        private toast: ToastService,
        private confirmService: ConfirmService
    ) { }

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders(): void {
        this.loading = true;
        const params: any = {
            pageNumber: this.currentPage,
            pageSize: this.pageSize
        };

        if (this.searchTerm) {
            params.search = this.searchTerm;
        }

        if (this.selectedStatusFilter) {
            params.status = this.selectedStatusFilter;
        }

        if (this.filterFromDate) {
            params.FromDate = this.filterFromDate;
        }

        if (this.filterToDate) {
            params.ToDate = this.filterToDate;
        }

        this.orderService.getAllOrders(params).subscribe({
            next: (result: PagedResult<OrderResponse>) => {
                this.orders = result.items;
                this.totalCount = result.totalCount;
                this.totalPages = result.totalPages;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading orders:', err);
                this.toast.error('Lỗi khi tải danh sách đơn hàng!');
                this.loading = false;
            }
        });
    }

    resetFilters(): void {
        this.filterFromDate = '';
        this.filterToDate = '';
        this.selectedStatusFilter = '';
        this.searchTerm = '';
        this.onSearch();
    }

    onSearch(): void {
        this.currentPage = 1;
        this.loadOrders();
    }

    viewDetails(order: OrderResponse): void {
        this.selectedOrder = order;
        this.showDetailsModal = true;
    }

    closeDetailsModal(): void {
        this.showDetailsModal = false;
        this.selectedOrder = null;
    }

    printOrder(): void {
        const order = this.selectedOrder;
        if (!order) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            this.toast.error('Vui lòng cho phép popup để in hóa đơn!');
            return;
        }

        const itemsHtml = order.items?.map((item, index) => `
            <tr class="border-b border-slate-100">
                <td class="py-3 text-sm text-center font-bold text-slate-500">${index + 1}</td>
                <td class="py-3 text-sm font-bold text-slate-700">${item.productName}</td>
                <td class="py-3 text-sm text-center font-medium text-slate-600">${item.quantity}</td>
                <td class="py-3 text-sm text-right font-medium text-slate-600">${new Intl.NumberFormat('vi-VN').format(item.price)}₫</td>
                <td class="py-3 text-sm text-right font-black text-slate-900">${new Intl.NumberFormat('vi-VN').format(item.subTotal)}₫</td>
            </tr>
        `).join('') || '';

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Hóa đơn #${order.idDH}</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
                <style>
                    @media print {
                        .no-print { display: none; }
                        body { -webkit-print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body class="bg-white text-slate-900 p-10 max-w-3xl mx-auto font-sans">
                <!-- Header -->
                <div class="flex justify-between items-start mb-8 border-b border-slate-900 pb-6">
                    <div>
                        <h1 class="text-3xl font-black uppercase tracking-tighter mb-1">Hóa Đơn Bán Hàng</h1>
                        <p class="text-sm font-bold text-slate-500">Mã đơn: #${order.idDH}</p>
                        <p class="text-sm font-medium text-slate-500">Ngày đặt: ${new Date(order.orderDate).toLocaleString('vi-VN')}</p>
                    </div>
                    <div class="text-right">
                        <h2 class="text-xl font-black text-rose-600 uppercase tracking-widest">HTTL SHOP</h2>
                        <p class="text-xs font-bold text-slate-400 mt-1">Chuyên cung cấp thời trang cao cấp</p>
                    </div>
                </div>

                <!-- Info -->
                <div class="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Người nhận</h3>
                        <p class="font-bold text-sm">${order.receiverName}</p>
                        <p class="text-sm text-slate-600">${order.receiverPhone}</p>
                        <p class="text-sm text-slate-600">${order.shippingAddress}</p>
                    </div>
                    <div>
                        <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Trạng thái</h3>
                        <span class="inline-block px-3 py-1 rounded border border-slate-200 text-xs font-bold uppercase">
                            ${this.getStatusLabel(order.status)}
                        </span>
                        <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mt-4 mb-1">Ghi chú</h3>
                        <p class="text-sm italic text-slate-500">${order.orderNotes || 'Không có'}</p>
                    </div>
                </div>

                <!-- Table -->
                <table class="w-full mb-8">
                    <thead>
                        <tr class="border-b-2 border-slate-900">
                            <th class="py-2 text-xs font-black text-slate-400 uppercase tracking-widest text-center w-10">STT</th>
                            <th class="py-2 text-xs font-black text-slate-400 uppercase tracking-widest text-left">Sản phẩm</th>
                            <th class="py-2 text-xs font-black text-slate-400 uppercase tracking-widest text-center w-20">SL</th>
                            <th class="py-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right w-32">Đơn giá</th>
                            <th class="py-2 text-xs font-black text-slate-400 uppercase tracking-widest text-right w-32">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <!-- Footer -->
                <div class="flex justify-end border-t border-slate-900 pt-6">
                    <div class="text-right">
                        <p class="text-sm font-bold text-slate-500 mb-1">Tổng tiền thanh toán</p>
                        <p class="text-3xl font-black text-rose-600 tracking-tighter">${new Intl.NumberFormat('vi-VN').format(order.totalPrice)}₫</p>
                    </div>
                </div>
                
                <div class="mt-12 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    Cảm ơn quý khách đã mua hàng tại HTTL SHOP!
                </div>

                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    }

    async updateStatus(order: OrderResponse, newStatus: string): Promise<void> {
        const confirmed = await this.confirmService.confirm(
            `Bạn có chắc muốn cập nhật trạng thái đơn #${order.idDH} thành "${this.getStatusLabel(newStatus)}"?`,
            'Xác nhận cập nhật'
        );

        if (!confirmed) {
            // Reset select if cancelled - simple reload to restore UI state
            this.loadOrders();
            return;
        }

        this.orderService.updateOrderStatus(order.idDH, newStatus).subscribe({
            next: () => {
                this.toast.success('Cập nhật trạng thái thành công!');
                this.loadOrders();
                if (this.selectedOrder && this.selectedOrder.idDH === order.idDH) {
                    this.selectedOrder.status = newStatus; // Update modal if open
                }
            },
            error: (err) => {
                console.error('Error updating status:', err);
                this.toast.error('Không thể cập nhật trạng thái: ' + (err.error?.message || err.message));
                this.loadOrders(); // Revert UI
            }
        });
    }

    getStatusLabel(status: string): string {
        return this.statusLabels[status as OrderStatus] || status;
    }

    getStatusColor(status: string): string {
        return this.statusColors[status as OrderStatus] || '';
    }

    async deleteOrder(order: OrderResponse): Promise<void> {
        const confirmed = await this.confirmService.confirm(
            `Bạn có chắc muốn xóa đơn hàng #${order.idDH}?`,
            'Xác nhận xóa',
            'Xóa đơn hàng',
            'Thôi'
        );

        if (!confirmed) return;

        this.orderService.deleteOrder(order.idDH).subscribe({
            next: () => {
                this.toast.success('Đã xóa đơn hàng thành công!');
                this.loadOrders();
                this.closeDetailsModal();
            },
            error: (err) => {
                console.error('Error deleting order:', err);
                this.toast.error('Không thể xóa đơn hàng. Vui lòng thử lại!');
            }
        });
    }

    goToPage(page: number): void {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.loadOrders();
    }

    exportData(): void {
        this.exporting = true;
        const pageSize = 50; // Safe chunk size
        const allOrders: OrderResponse[] = [];

        // BUILD EXPORT PARAMS BASED ON CURRENT UI FILTERS
        // This ensures export matches exactly what user sees (or searches)
        const baseParams: any = { pageSize: pageSize };

        if (this.searchTerm) baseParams.search = this.searchTerm;
        if (this.selectedStatusFilter) baseParams.status = this.selectedStatusFilter;
        if (this.filterFromDate) baseParams.FromDate = this.filterFromDate;
        if (this.filterToDate) baseParams.ToDate = this.filterToDate;

        const fetchPage = (page: number) => {
            const params = { ...baseParams, pageNumber: page };

            this.orderService.getAllOrders(params).subscribe({
                next: (result) => {
                    allOrders.push(...result.items);

                    if (page < result.totalPages) {
                        fetchPage(page + 1);
                    } else {
                        this.processExport(allOrders);
                    }
                },
                error: (err) => {
                    console.error('Export fetch error:', err);
                    this.toast.error('Lỗi tải dữ liệu xuất Excel (trang ' + page + ')');
                    this.exporting = false;
                }
            });
        };

        fetchPage(1);
    }

    processExport(orders: OrderResponse[]): void {
        if (orders.length === 0) {
            this.toast.warning('Không có dữ liệu nào để xuất theo bộ lọc hiện tại!');
            this.exporting = false;
            return;
        }

        const dataToExport: any[] = [];

        orders.forEach(order => {
            if (order.items && order.items.length > 0) {
                order.items.forEach(item => {
                    dataToExport.push({
                        'Mã Đơn': order.idDH,
                        'Ngày Đặt': new Date(order.orderDate).toLocaleString('vi-VN'),
                        'Khách Hàng': order.receiverName,
                        'SĐT': order.receiverPhone,
                        'Địa Chỉ': order.shippingAddress,
                        'Sản Phẩm': item.productName,
                        'Số Lượng': item.quantity,
                        'Đơn Giá': item.price,
                        'Thành Tiền SP': item.subTotal,
                        'Tổng Tiền Đơn': order.totalPrice,
                        'Trạng Thái': this.getStatusLabel(order.status),
                        'Ghi Chú': order.orderNotes || ''
                    });
                });
            } else {
                dataToExport.push({
                    'Mã Đơn': order.idDH,
                    'Ngày Đặt': new Date(order.orderDate).toLocaleString('vi-VN'),
                    'Khách Hàng': order.receiverName,
                    'SĐT': order.receiverPhone,
                    'Địa Chỉ': order.shippingAddress,
                    'Sản Phẩm': '',
                    'Số Lượng': 0,
                    'Đơn Giá': 0,
                    'Thành Tiền SP': 0,
                    'Tổng Tiền Đơn': order.totalPrice,
                    'Trạng Thái': this.getStatusLabel(order.status),
                    'Ghi Chú': order.orderNotes || ''
                });
            }
        });

        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);

        const wscols = [
            { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 15 },
            { wch: 30 }, { wch: 30 }, { wch: 10 }, { wch: 15 },
            { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 30 }
        ];
        ws['!cols'] = wscols;

        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'DonHang');

        const timestamp = new Date().getTime();
        const fromStr = this.filterFromDate || 'Start';
        const toStr = this.filterToDate || 'End';
        XLSX.writeFile(wb, `DanhSachDonHang_${fromStr}_to_${toStr}_${timestamp}.xlsx`);

        this.toast.success('Xuất file Excel thành công!');
        this.exporting = false;
    }
}
