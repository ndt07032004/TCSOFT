import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../shared/models/product.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card';
import { getCategoryLabel } from '../../../shared/models/enums';

@Component({
  selector: 'app-products',
  templateUrl: './products.html',
  styleUrls: ['./products.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;

  currentPage = 1;
  pageSize = 12;
  totalCount = 0;
  totalPages = 0;

  filters = {
    search: '',
    category: '',
    minPrice: null as number | null,
    maxPrice: null as number | null,
    sortBy: ''
  };

  categories = [
    { value: 'AO_NAM', label: 'Áo Nam' },
    { value: 'AO_NU', label: 'Áo Nữ' },
    { value: 'QUAN_NAM', label: 'Quần Nam' },
    { value: 'QUAN_NU', label: 'Quần Nữ' },
    { value: 'PHU_KIEN', label: 'Phụ Kiện' },
    { value: 'GIAY_DEP', label: 'Giày Dép' }
  ];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private toastService: ToastService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      if (params['search']) {
        this.filters.search = params['search'];
      } else {
        this.filters.search = '';
      }
      this.currentPage = 1;
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.loading = true;

    const params: any = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };

    if (this.filters.search) params.search = this.filters.search;
    if (this.filters.category) params.category = this.filters.category;
    if (this.filters.minPrice !== null && this.filters.minPrice !== undefined) params.minPrice = this.filters.minPrice;
    if (this.filters.maxPrice !== null && this.filters.maxPrice !== undefined) params.maxPrice = this.filters.maxPrice;
    if (this.filters.sortBy) params.sortBy = this.filters.sortBy;

    this.productService.getProducts(params).subscribe({
      next: (result) => {
        this.products = result.items;
        this.totalCount = result.totalCount;
        this.totalPages = result.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadProducts();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  addToCart(productId: number): void {
    this.cartService.addToCart({ idSP: productId }).subscribe({
      next: () => {
        this.toastService.success('Đã thêm vào giỏ hàng!');
      },
      error: (err) => {
        this.toastService.error(err.message || 'Không thể thêm vào giỏ hàng');
      }
    });
  }
}
