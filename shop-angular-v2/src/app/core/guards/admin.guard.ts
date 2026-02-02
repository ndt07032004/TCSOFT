import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
        router.navigate(['/login']);
        return false;
    }

    // Admin users always have access
    if (authService.isAdmin()) {
        return true;
    }

    // Staff users have access (either by role or by having permissions)
    // This allows access even if permissions are still loading
    if (authService.isStaff()) {
        return true;
    }

    // If not admin or staff, check for specific admin-level permissions
    const adminPermissions = ['dashboard_view', 'product_view', 'order_view', 'user_view', 'staff_view', 'role_permission'];
    if (authService.hasAnyPermission(adminPermissions)) {
        return true;
    }

    router.navigate(['/']);
    return false;
};
