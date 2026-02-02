import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { ApiService } from './api.service';
import { OrderRequest, OrderResponse } from '../../shared/models/order.model';
import { PagedResult } from '../../shared/models/pagination.model';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    constructor(private apiService: ApiService) { }

    // Admin/Staff - Get all orders
    getAllOrders(params?: any): Observable<PagedResult<OrderResponse>> {
        return this.apiService.get<PagedResult<OrderResponse>>('Orders', params);
    }

    // User - Get my orders
    getMyOrders(params?: any): Observable<PagedResult<OrderResponse>> {
        return this.apiService.get<PagedResult<OrderResponse>>('Orders/my-orders', params);
    }

    // Get order by ID
    getOrderById(id: number): Observable<OrderResponse> {
        return this.apiService.get<OrderResponse>(`Orders/${id}`);
    }

    // Get order details (specific endpoint)
    getOrderDetails(id: number): Observable<any> {
        return this.apiService.get<any>(`Orders/${id}/details`);
    }

    // Create new order
    createOrder(order: OrderRequest): Observable<OrderResponse> {
        return this.apiService.post<OrderResponse>('Orders', order);
    }

    // Update order status
    updateOrderStatus(id: number, status: string): Observable<void> {
        // Backend expects string body "Status", not JSON object { status: "Status" }
        // We must set Content-Type: application/json explicitly because we are sending a primitive string as body
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.apiService.patch<void>(`Orders/${id}/status`, `"${status}"`, { headers });
    }

    // Delete order
    deleteOrder(id: number): Observable<boolean> {
        return this.apiService.delete<boolean>(`Orders/${id}`);
    }

    // Re-order (Buy Again)
    reOrder(id: number): Observable<any> {
        return this.apiService.post(`Orders/re-order/${id}`, {});
    }
}
