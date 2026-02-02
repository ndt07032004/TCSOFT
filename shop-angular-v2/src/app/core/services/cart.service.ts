import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { ToastService } from './toast.service';
import { CartResult, AddToCartDto, UpdateCartDto } from '../../shared/models/cart.model';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartSubject = new BehaviorSubject<CartResult | null>(null);
    public cart$ = this.cartSubject.asObservable();

    private cartCountSubject = new BehaviorSubject<number>(0);
    public cartCount$ = this.cartCountSubject.asObservable();

    constructor(
        private apiService: ApiService,
        private toastService: ToastService
    ) { }

    getCart(): Observable<CartResult> {
        return this.apiService.get<CartResult>('carts/my-cart').pipe(
            tap(cart => {
                this.cartSubject.next(cart);
                this.updateCartCount(cart);
            })
        );
    }

    addToCart(item: AddToCartDto): Observable<any> {
        console.log('Original Item:', item);

        // Clean PascalCase payload
        const payload = {
            IdSP: Number(item.idSP), // Ensure number
            Quantity: Number(item.quantity || 1) // Ensure number
        };
        console.log('Sending Payload:', JSON.stringify(payload));

        // Swagger: POST /api/Carts
        return this.apiService.post('carts', payload).pipe(
            tap({
                next: () => {
                    console.log('AddToCart Success');
                    this.toastService.success('Thêm vào giỏ hàng thành công');
                },
                error: (err) => {
                    console.error('AddToCart Error Details:', err);
                    const msg = err.error?.message || err.error?.title || JSON.stringify(err.error);
                    this.toastService.error(`Lỗi thêm giỏ hàng: ${msg}`);
                }
            }),
            tap(() => this.getCart().subscribe())
        );
    }

    updateCartItem(productId: number, quantity: number): Observable<any> {
        // Swagger: PUT /api/Carts/update-quantity
        // Explicitly map to PascalCase
        const payload = {
            IdSP: productId,
            Quantity: quantity
        };
        return this.apiService.put('carts/update-quantity', payload).pipe(
            tap(() => this.getCart().subscribe())
        );
    }

    removeFromCart(productId: number): Observable<any> {
        // Swagger: DELETE /api/Carts/remove-product/{idSP}
        return this.apiService.delete(`carts/remove-product/${productId}`).pipe(
            tap(() => this.getCart().subscribe())
        );
    }

    clearCart(): void {
        this.cartSubject.next(null);
        this.cartCountSubject.next(0);
    }

    private updateCartCount(cart: CartResult): void {
        if (!cart || !cart.details) {
            this.cartCountSubject.next(0);
            return;
        }
        const count = cart.details.reduce((sum, item) => sum + item.quantity, 0);
        this.cartCountSubject.next(count);
    }
}
