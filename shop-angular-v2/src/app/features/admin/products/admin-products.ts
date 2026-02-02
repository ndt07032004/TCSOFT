import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../shared/models/product.model';
import { PagedResult } from '../../../shared/models/pagination.model';
import { getCategoryLabel, getColorLabel, ProductCategory, ProductColor } from '../../../shared/models/enums';

@Component({
    selector: 'app-admin-products',
    templateUrl: './admin-products.html',
    styleUrls: ['./admin-products.scss']
})
export class AdminProductsComponent implements OnInit {
    products: Product[] = [];
    loading = false;

    currentPage = 1;
    pageSize = 10;
    totalPages = 0;
    totalCount = 0;

    searchTerm = '';
    selectedCategory = '';

    showModal = false;
    selectedProduct: Product | null = null;
    variantTemplate: Product | null = null;

    categories = Object.values(ProductCategory).map(value => ({
        value,
        label: getCategoryLabel(value as ProductCategory)
    }));

    constructor(
        private productService: ProductService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        this.loadProducts();
    }

    loadProducts(): void {
        this.loading = true;
        const params: any = {
            pageNumber: this.currentPage,
            pageSize: this.pageSize
        };

        if (this.searchTerm) params.search = this.searchTerm;
        if (this.selectedCategory) params.category = this.selectedCategory;

        this.productService.getProducts(params).subscribe({
            next: (result: PagedResult<Product>) => {
                this.products = result.items;
                this.totalCount = result.totalCount;
                this.totalPages = result.totalPages;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading products:', err);
                this.toastService.error('Không thể tải sản phẩm');
                this.loading = false;
            }
        });
    }

    onSearch(): void {
        this.currentPage = 1;
        this.loadProducts();
    }

    openAddModal(): void {
        this.selectedProduct = null;
        this.variantTemplate = null;
        this.showModal = true;
    }

    openEditModal(product: Product): void {
        this.selectedProduct = product;
        this.variantTemplate = null;
        this.showModal = true;
    }

    openVariantModal(product: Product): void {
        this.selectedProduct = null;
        this.variantTemplate = product;
        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false;
        this.selectedProduct = null;
        this.variantTemplate = null;
    }

    onModalClose(refresh: boolean): void {
        this.showModal = false;
        this.selectedProduct = null;
        this.variantTemplate = null;
        if (refresh) {
            this.loadProducts();
        }
    }

    deleteProduct(product: Product): void {
        if (!confirm(`Bạn có chắc muốn xóa "${product.name}"?`)) return;

        this.productService.deleteProduct(product.idSP).subscribe({
            next: () => {
                this.toastService.success('Đã xóa sản phẩm!');
                this.loadProducts();
            },
            error: (err) => {
                console.error('Error deleting product:', err);
                this.toastService.error('Không thể xóa sản phẩm');
            }
        });
    }

    goToPage(page: number): void {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.loadProducts();
    }

    applyFilters(): void {
        this.currentPage = 1;
        this.loadProducts();
    }

    getCategoryLabel(category: string): string {
        return getCategoryLabel(category as ProductCategory) || category;
    }

    getColorLabel(color: string): string {
        return getColorLabel(color as ProductColor) || color;
    }
}
