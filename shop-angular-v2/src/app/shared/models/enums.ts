// Enums matching backend (returned as strings in JSON)

export enum OrderStatus {
    ChoXacNhan = 'ChoXacNhan',
    DaXacNhan = 'DaXacNhan',
    DaVanChuyen = 'DaVanChuyen',
    DaNhanHang = 'DaNhanHang',
    DaHuy = 'DaHuy'
}

export enum ProductSize {
    M = 'M',
    L = 'L',
    XL = 'XL',
    XXL = 'XXL'
}

export enum ProductColor {
    DEN = 'DEN',
    TRANG = 'TRANG',
    DO = 'DO',
    XANH_DUONG = 'XANH_DUONG',
    XANH_LA = 'XANH_LA',
    VANG = 'VANG',
    CAM = 'CAM',
    TIM = 'TIM',
    HONG = 'HONG',
    NAU = 'NAU',
    XAM = 'XAM',
    BE = 'BE'
}

export enum ProductCategory {
    AO_NAM = 'AO_NAM',
    AO_NU = 'AO_NU',
    QUAN_NAM = 'QUAN_NAM',
    QUAN_NU = 'QUAN_NU',
    PHU_KIEN = 'PHU_KIEN',
    GIAY_DEP = 'GIAY_DEP'
}

export enum StarRating {
    ONE = 'ONE',
    TWO = 'TWO',
    THREE = 'THREE',
    FOUR = 'FOUR',
    FIVE = 'FIVE'
}

// Helper functions for enum display
export function getOrderStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
        [OrderStatus.ChoXacNhan]: 'Chờ xác nhận',
        [OrderStatus.DaXacNhan]: 'Đã xác nhận',
        [OrderStatus.DaVanChuyen]: 'Đang vận chuyển',
        [OrderStatus.DaNhanHang]: 'Đã nhận hàng',
        [OrderStatus.DaHuy]: 'Đã hủy'
    };
    return labels[status];
}

export function getCategoryLabel(category: ProductCategory): string {
    const labels: Record<ProductCategory, string> = {
        [ProductCategory.AO_NAM]: 'Áo Nam',
        [ProductCategory.AO_NU]: 'Áo Nữ',
        [ProductCategory.QUAN_NAM]: 'Quần Nam',
        [ProductCategory.QUAN_NU]: 'Quần Nữ',
        [ProductCategory.PHU_KIEN]: 'Phụ Kiện',
        [ProductCategory.GIAY_DEP]: 'Giày Dép'
    };
    return labels[category];
}

export function getColorLabel(color: ProductColor): string {
    const labels: Record<ProductColor, string> = {
        [ProductColor.DEN]: 'Đen',
        [ProductColor.TRANG]: 'Trắng',
        [ProductColor.DO]: 'Đỏ',
        [ProductColor.XANH_DUONG]: 'Xanh Dương',
        [ProductColor.XANH_LA]: 'Xanh Lá',
        [ProductColor.VANG]: 'Vàng',
        [ProductColor.CAM]: 'Cam',
        [ProductColor.TIM]: 'Tím',
        [ProductColor.HONG]: 'Hồng',
        [ProductColor.NAU]: 'Nâu',
        [ProductColor.XAM]: 'Xám',
        [ProductColor.BE]: 'Be'
    };
    return labels[color];
}
