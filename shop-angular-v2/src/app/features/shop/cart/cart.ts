import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { ToastService } from '../../../core/services/toast.service';
import { CartResult, CartDetailResult } from '../../../shared/models/cart.model';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.html',
    styleUrls: ['./cart.scss']
})
export class CartComponent implements OnInit {
    cart: CartResult | null = null;
    loading = false;
    selectedItems: Set<number> = new Set();

    constructor(
        private cartService: CartService,
        private router: Router,
        private confirmService: ConfirmService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        this.loadCart();
    }

    loadCart(): void {
        this.loading = true;
        this.cartService.getCart().subscribe({
            next: (res) => {
                this.cart = res;
                this.loading = false;
            },
            error: (err) => {
                console.error('Lỗi tải giỏ hàng:', err);
                this.loading = false;
            }
        });
    }

    getImageUrl(path: string | null | undefined): string {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        const prefix = cleanPath.startsWith('images/') ? '' : 'images/products/';
        return `${environment.imageBaseUrl}/${prefix}${cleanPath}`;
    }

    updateQuantity(item: CartDetailResult, newQuantity: number): void {
        if (newQuantity < 1) return;

        this.cartService.updateCartItem(item.idSP, newQuantity).subscribe({
            next: () => {
                this.loadCart();
            },
            error: (err) => {
                this.toastService.error(err.error?.message || 'Không thể cập nhật số lượng');
            }
        });
    }

    async removeItem(productId: number): Promise<void> {
        const confirmed = await this.confirmService.confirm('Bạn có chắc muốn xóa sản phẩm này?');
        if (!confirmed) return;

        this.cartService.removeFromCart(productId).subscribe({
            next: () => {
                this.selectedItems.delete(productId);
                this.toastService.success('Đã xóa sản phẩm khỏi giỏ hàng');
                this.loadCart();
            },
            error: (err) => {
                this.toastService.error(err.error?.message || 'Không thể xóa sản phẩm');
            }
        });
    }

    // Selection Logic
    toggleSelection(itemId: number): void {
        if (this.selectedItems.has(itemId)) {
            this.selectedItems.delete(itemId);
        } else {
            this.selectedItems.add(itemId);
        }
    }

    toggleAll(): void {
        if (this.isAllSelected) {
            this.selectedItems.clear();
        } else {
            this.cart?.details.forEach(item => this.selectedItems.add(item.idSP));
        }
    }

    get isAllSelected(): boolean {
        if (!this.cart || this.cart.details.length === 0) return false;
        return this.cart.details.every(item => this.selectedItems.has(item.idSP));
    }

    isSelected(itemId: number): boolean {
        return this.selectedItems.has(itemId);
    }

    get totalSelectedPrice(): number {
        if (!this.cart) return 0;
        return this.cart.details
            .filter(item => this.selectedItems.has(item.idSP))
            .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    get selectedCount(): number {
        return this.selectedItems.size;
    }

    async removeSelected(): Promise<void> {
        if (this.selectedItems.size === 0) return;

        const confirmed = await this.confirmService.confirm(`Bạn có chắc muốn xóa ${this.selectedItems.size} sản phẩm đã chọn?`);
        if (!confirmed) return;

        // Basic implementation:
        const itemsToRemove = Array.from(this.selectedItems);
        let completed = 0;
        itemsToRemove.forEach(id => {
            this.cartService.removeFromCart(id).subscribe({
                next: () => {
                    this.selectedItems.delete(id);
                    completed++;
                    if (completed === itemsToRemove.length) {
                        this.toastService.success('Đã xóa các sản phẩm được chọn');
                        this.loadCart();
                    }
                }
            });
        });
    }

    checkout(): void {
        if (this.selectedItems.size === 0) {
            this.toastService.warning('Vui lòng chọn ít nhất một sản phẩm để mua hàng');
            return;
        }
        const items = Array.from(this.selectedItems).join(',');
        this.router.navigate(['/checkout'], { queryParams: { items } });
    }
}
