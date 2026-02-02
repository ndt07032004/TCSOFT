import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { OrderResponse } from '../../../shared/models/order.model';

@Component({
    selector: 'app-my-orders',
    templateUrl: './my-orders.component.html'
})
export class MyOrdersComponent implements OnInit {
    orders: OrderResponse[] = [];
    loading = false;
    activeStatus = 'ALL';

    // Tabs for order statuses
    tabs = [
        { id: 'ALL', name: 'Tất cả' },
        { id: 'ChoXacNhan', name: 'Chờ xác nhận' },
        { id: 'DaXacNhan', name: 'Đã xác nhận' },
        { id: 'DaVanChuyen', name: 'Đang vận chuyển' },
        { id: 'DaNhanHang', name: 'Đã nhận hàng' },
        { id: 'DaHuy', name: 'Đã hủy' }
    ];

    constructor(
        private orderService: OrderService,
        private productService: ProductService,
        private router: Router,
        private toastService: ToastService,
        private cartService: CartService
    ) { }

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders() {
        this.loading = true;
        this.orderService.getMyOrders({ pageSize: 50 }).subscribe({
            next: (res) => {
                this.orders = res.items || [];
                // Fetch images for items
                this.orders.forEach(order => {
                    if (order.items) {
                        order.items.forEach(item => {
                            this.loadProductImage(item);
                        });
                    }
                });
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    loadProductImage(item: any) {
        if (item.idSP) {
            this.productService.getProductById(item.idSP).subscribe({
                next: (product) => {
                    if (product.imageUrl) {
                        item.productImage = product.imageUrl;
                    }
                }
            });
        }
    }

    get filteredOrders() {
        if (this.activeStatus === 'ALL') return this.orders;
        return this.orders.filter(o => o.status === this.activeStatus);
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'ChoXacNhan':
            case 'CHOXACNHAN': return 'Chờ xác nhận';
            case 'DaXacNhan':
            case 'DAXACNHAN': return 'Đã xác nhận';
            case 'DaVanChuyen':
            case 'DAVANCHUYEN': return 'Đang vận chuyển';
            case 'DaNhanHang':
            case 'DANHANHANG': return 'Đã nhận hàng';
            case 'DaHuy':
            case 'DAHUY': return 'Đã hủy';
            default: return status;
        }
    }

    cancelOrder(orderId: number): void {
        if (!confirm('Bạn có chắc muốn hủy đơn hàng này không?')) return;

        this.loading = true;
        this.orderService.updateOrderStatus(orderId, 'DaHuy').subscribe({
            next: () => {
                this.toastService.success('Hủy đơn hàng thành công');
                this.loadOrders();
            },
            error: (err) => {
                this.loading = false;
                this.toastService.error('Không thể hủy đơn hàng: ' + (err.error?.message || 'Lỗi hệ thống'));
            }
        });
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'DaNhanHang':
            case 'DANHANHANG': return 'text-green-600';
            case 'DaHuy':
            case 'DAHUY': return 'text-red-600';
            case 'ChoXacNhan':
            case 'CHOXACNHAN': return 'text-yellow-600';
            case 'DaXacNhan':
            case 'DAXACNHAN':
            case 'DaVanChuyen':
            case 'DAVANCHUYEN': return 'text-blue-600';
            default: return 'text-slate-600';
        }
    }

    buyAgain(orderId: number) {
        this.loading = true;
        this.orderService.reOrder(orderId).subscribe({
            next: (res) => {
                this.loading = false;
                this.toastService.success(res.message || 'Đã thêm sản phẩm vào giỏ hàng!');

                // Refresh cart count immediately
                this.cartService.getCart().subscribe();

                this.router.navigate(['/cart']); // Navigate to Cart
            },
            error: (err) => {
                this.loading = false;
                this.toastService.error('Lỗi mua lại: ' + (err.error?.message || 'Lỗi hệ thống'));
            }
        });
    }
}
