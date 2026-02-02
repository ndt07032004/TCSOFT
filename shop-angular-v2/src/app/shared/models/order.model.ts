// Order DTOs matching backend

export interface OrderRequest {
    items: OrderDetailRequest[];
    receiverName: string;
    receiverPhone: string;
    shippingAddress: string;
    orderNotes?: string;
}

export interface OrderDetailRequest {
    idSP: number;
    quantity: number;
}

export interface OrderResponse {
    idDH: number;
    idUser: number;
    orderDate: string;
    totalPrice: number;
    status: string;
    receiverName: string;
    receiverPhone: string;
    shippingAddress: string;
    orderNotes: string;
    items: OrderDetailResponse[];
}

export interface OrderDetailResponse {
    idOrderDetail: number;
    idSP: number;
    productName: string;
    quantity: number;
    price: number;
    subTotal: number;
    productImage?: string; // Client-side populated
}

// Helper types for UI
export type OrderStatus = 'ChoXacNhan' | 'DaXacNhan' | 'DaVanChuyen' | 'DaNhanHang' | 'DaHuy';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    'ChoXacNhan': 'Chờ xác nhận',
    'DaXacNhan': 'Đã xác nhận',
    'DaVanChuyen': 'Đang vận chuyển',
    'DaNhanHang': 'Đã nhận hàng',
    'DaHuy': 'Đã hủy'
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
    'ChoXacNhan': 'bg-yellow-100 text-yellow-800',
    'DaXacNhan': 'bg-blue-100 text-blue-800',
    'DaVanChuyen': 'bg-indigo-100 text-indigo-800',
    'DaNhanHang': 'bg-green-100 text-green-800',
    'DaHuy': 'bg-red-100 text-red-800'
};
