import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const permissionGuard: CanActivateFn = (route) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
        router.navigate(['/login']);
        return false;
    }

    const requiredPermissions = route.data['permissions'] as string[];

    if (!requiredPermissions || requiredPermissions.length === 0) {
        // No specific permissions required, just need to be authenticated
        return true;
    }

    // Admin bypass - they have all permissions
    if (authService.isAdmin()) {
        return true;
    }

    // Check if user has all required permissions
    if (authService.hasAllPermissions(requiredPermissions)) {
        return true;
    }

    // User doesn't have required permissions
    router.navigate(['/']);
    return false;
};
