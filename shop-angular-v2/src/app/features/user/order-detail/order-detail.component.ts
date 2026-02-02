import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { OrderResponse } from '../../../shared/models/order.model';

@Component({
    selector: 'app-order-detail',
    templateUrl: './order-detail.component.html'
})
export class OrderDetailComponent implements OnInit {
    order: OrderResponse | null = null;
    loading = false;

    constructor(
        private route: ActivatedRoute,
        private orderService: OrderService,
        private productService: ProductService,
        private toastService: ToastService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadOrderDetail(Number(id));
        }
    }

    loadOrderDetail(id: number) {
        this.loading = true;
        this.orderService.getOrderById(id).subscribe({
            next: (res) => {
                this.order = res;
                if (this.order && this.order.items) {
                    this.order.items.forEach(item => this.loadProductImage(item));
                }
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    cancelOrder(orderId: number): void {
        if (!confirm('Bạn có chắc muốn hủy đơn hàng này không?')) return;

        this.loading = true;
        this.orderService.updateOrderStatus(orderId, 'DaHuy').subscribe({
            next: () => {
                this.toastService.success('Hủy đơn hàng thành công');
                this.loadOrderDetail(orderId);
            },
            error: (err) => {
                this.loading = false;
                this.toastService.error('Không thể hủy đơn hàng: ' + (err.error?.message || 'Lỗi hệ thống'));
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
}
