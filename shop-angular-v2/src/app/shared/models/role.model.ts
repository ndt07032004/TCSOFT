export interface Role {
    id: number;
    title: string;
    description: string;
    permissions: string[];
}

export interface RoleCreate {
    title: string;
    description: string;
}

export interface RoleUpdate {
    title: string;
    description: string;
}

export interface RolePermissionsUpdate {
    permissions: string[];
}

export const AVAILABLE_PERMISSIONS = [
    { value: 'dashboard_view', label: 'Xem Dashboard' },

    { value: 'product_view', label: 'Xem sản phẩm' },
    { value: 'product_create', label: 'Thêm sản phẩm' },
    { value: 'product_post', label: 'Đăng sản phẩm' },
    { value: 'product_edit', label: 'Sửa sản phẩm' },
    { value: 'product_delete', label: 'Xóa sản phẩm' },

    { value: 'order_view', label: 'Xem đơn hàng' },
    { value: 'order_edit', label: 'Sửa đơn hàng' },
    { value: 'order_update_status', label: 'Cập nhật trạng thái đơn' },
    { value: 'order_delete', label: 'Xóa đơn hàng' },

    { value: 'user_view', label: 'Xem người dùng' },
    { value: 'user_create', label: 'Tạo người dùng' },
    { value: 'user_edit', label: 'Sửa người dùng' },
    { value: 'user_update', label: 'Cập nhật người dùng' },
    { value: 'user_delete', label: 'Xóa người dùng' },

    { value: 'staff_view', label: 'Xem nhân viên' },
    { value: 'staff_create', label: 'Tạo nhân viên' },
    { value: 'staff_update', label: 'Sửa nhân viên' },
    { value: 'staff_delete', label: 'Xóa nhân viên' },

    { value: 'role_view', label: 'Xem vai trò' },
    { value: 'role_permission', label: 'Quản lý phân quyền' },

    { value: 'revenue_view', label: 'Xem thống kê' },
    { value: 'import_view', label: 'Quản lý nhập kho' }
];
