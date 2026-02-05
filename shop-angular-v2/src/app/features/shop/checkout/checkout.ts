import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { CartDetailResult } from '../../../shared/models/cart.model';
import { ToastService } from '../../../core/services/toast.service';
import { OrderRequest } from '../../../shared/models/order.model';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-checkout',
    templateUrl: './checkout.html',
    styleUrls: ['./checkout.scss']
})
export class CheckoutComponent implements OnInit {
    @ViewChild('checkoutForm') checkoutForm!: NgForm;

    cartItems: CartDetailResult[] = [];
    loading = false;

    // Thêm biến theo dõi phương thức thanh toán
    paymentMethod: 'COD' | 'QR' = 'COD';

    orderData = {
        receiverName: '',
        receiverPhone: '',
        shippingAddress: '',
        orderNotes: ''
    };

    constructor(
        private cartService: CartService,
        private orderService: OrderService,
        private toastService: ToastService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.loadCart();
    }

    loadCart(): void {
        this.cartService.getCart().subscribe({
            next: (cart) => {
                if (!cart || !cart.details || cart.details.length === 0) {
                    this.router.navigate(['/cart']);
                    return;
                }

                // Filter by query params if present
                this.route.queryParams.subscribe((params: any) => {
                    const itemsStr = params['items'];
                    if (itemsStr) {
                        const ids = itemsStr.split(',').map((id: string) => +id);
                        this.cartItems = cart.details.filter(item => ids.includes(item.idSP));
                        if (this.cartItems.length === 0) {
                            this.router.navigate(['/cart']);
                        }
                    } else {
                        this.cartItems = cart.details;
                    }
                });
            },
            error: () => {
                this.router.navigate(['/cart']);
            }
        });
    }

    calculateTotal(): number {
        return this.cartItems.reduce((sum, item) => sum + item.subTotal, 0);
    }

    getImageUrl(path: string | null | undefined): string {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        const prefix = cleanPath.startsWith('images/') ? '' : 'images/products/';
        return `${environment.imageBaseUrl}/${prefix}${cleanPath}`;
    }

    // Hàm chọn phương thức thanh toán
    setPaymentMethod(method: 'COD' | 'QR'): void {
        this.paymentMethod = method;
    }

    onSubmit(): void {
        if (this.checkoutForm.invalid) {
            // Touched all fields to show errors
            Object.keys(this.checkoutForm.controls).forEach(key => {
                this.checkoutForm.controls[key].markAsTouched();
            });
            return;
        }

        this.loading = true;

        // Xử lý logic đính kèm phương thức thanh toán vào Ghi chú (OrderNotes)
        // để không cần sửa Backend
        const methodPrefix = this.paymentMethod === 'QR' ? '[THANH TOÁN QR] ' : '[COD] ';
        const finalNotes = methodPrefix + (this.orderData.orderNotes || '');

        const orderRequest: OrderRequest = {
            receiverName: this.orderData.receiverName,
            receiverPhone: this.orderData.receiverPhone,
            shippingAddress: this.orderData.shippingAddress,
            orderNotes: finalNotes, // Sử dụng ghi chú đã xử lý
            items: this.cartItems.map(item => ({
                idSP: item.idSP,
                quantity: item.quantity
            }))
        };

        this.orderService.createOrder(orderRequest).subscribe({
            next: (res) => {
                this.loading = false;
                this.toastService.success('Đặt hàng thành công! Mã đơn hàng: #' + res.idDH);
                this.cartService.clearCart(); // Clear local cart
                this.router.navigate(['/products']);
            },
            error: (err) => {
                this.loading = false;
                console.error(err);
                this.toastService.error('Đặt hàng thất bại: ' + (err.error?.message || err.message));
            }
        });
    }
}
