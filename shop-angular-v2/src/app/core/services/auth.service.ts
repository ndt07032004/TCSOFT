import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, switchMap, map, of } from 'rxjs';
import { ApiService } from './api.service';
import { LoginDto, TokenResponse, ForgotPasswordDto, ResetPasswordDto, DecodedToken, RegisterDto, VerifyOtpDto } from '../../shared/models/auth.model';
import { jwtDecode } from 'jwt-decode';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<DecodedToken | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    private permissionsSubject = new BehaviorSubject<string[]>([]);
    public permissions$ = this.permissionsSubject.asObservable();

    constructor(
        private apiService: ApiService,
        private router: Router
    ) {
        // Initialize user from storage (check both)
        this.loadUserFromToken();
    }

    login(loginDto: LoginDto, rememberMe: boolean): Observable<TokenResponse> {
        return this.apiService.post<TokenResponse>('Auth/login', loginDto)
            .pipe(
                tap(response => {
                    this.setTokens(response, rememberMe);
                }),
                switchMap(response => {
                    // Load user and wait for permissions
                    const token = response.accessToken;
                    if (token) {
                        try {
                            const decoded = jwtDecode<DecodedToken>(token);
                            this.currentUserSubject.next(decoded);
                            // Wait for permissions to load
                            return this.loadPermissions(decoded).pipe(
                                map(() => response)
                            );
                        } catch {
                            this.clearTokens();
                            throw new Error('Invalid token');
                        }
                    }
                    return of(response);
                })
            );
    }

    logout(): void {
        // Call backend logout endpoint
        this.apiService.post('Auth/logout', {}).subscribe({
            next: () => {
                this.clearTokens();
                this.router.navigate(['/login']);
            },
            error: () => {
                // Even if backend fails, clear local tokens
                this.clearTokens();
                this.router.navigate(['/login']);
            }
        });
    }

    forgotPassword(dto: ForgotPasswordDto): Observable<any> {
        return this.apiService.post('Auth/forgot-password', dto);
    }

    verifyOtp(dto: VerifyOtpDto): Observable<{ token: string }> {
        return this.apiService.post('Auth/verify-otp', dto);
    }

    resetPassword(dto: ResetPasswordDto, resetToken: string): Observable<TokenResponse> {
        // Send reset token in Authorization header
        const options = {
            headers: { 'Authorization': `Bearer ${resetToken}` }
        };
        return this.apiService.post<TokenResponse>('Auth/reset-password', dto, options)
            .pipe(
                tap(response => {
                    this.setTokens(response, true); // Default to local storage for reset password flow or keep session? Let's use local for persistence.
                    this.loadUserFromToken();
                })
            );
    }

    refreshToken(): Observable<TokenResponse> {
        const accessToken = this.getAccessToken();
        const refreshToken = this.getRefreshToken();

        if (!accessToken || !refreshToken) {
            this.clearTokens();
            throw new Error('No tokens available');
        }

        return this.apiService.post<TokenResponse>('auth/refresh', {
            accessToken,
            refreshToken
        }).pipe(
            tap(response => {
                // Determine where to save based on where we found the old tokens
                const isLocal = !!localStorage.getItem('accessToken');
                this.setTokens(response, isLocal);
                this.loadUserFromToken();
            })
        );
    }

    isAuthenticated(): boolean {
        const token = this.getAccessToken();
        if (!token) return false;

        try {
            const decoded = jwtDecode<DecodedToken>(token);
            const isExpired = decoded.exp * 1000 < Date.now();
            return !isExpired;
        } catch {
            return false;
        }
    }

    getCurrentUser(): DecodedToken | null {
        return this.currentUserSubject.value;
    }

    getUserRole(): string | null {
        const user = this.getCurrentUser();
        return user ? user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] : null;
    }

    isAdmin(): boolean {
        const role = this.getUserRole();
        return role === 'Admin';
    }

    isStaff(): boolean {
        const role = this.getUserRole();
        return role === 'Staff';
    }

    isUser(): boolean {
        const role = this.getUserRole();
        return role === 'User';
    }

    hasPermission(permission: string): boolean {
        // 1. Admin bypass
        if (this.isAdmin()) return true;

        const permissions = this.permissionsSubject.value;

        // 2. Staff Safety Net: If permissions are empty (API failed), 
        // grant access to the core Management Hub items so the user isn't locked out.
        if (this.isStaff() && permissions.length === 0) {
            const coreHub = [
                'dashboard_view', 'product_view', 'order_view', 'user_view',
                'revenue_view', 'import_view', 'staff_view'
            ];
            if (coreHub.includes(permission)) return true;
        }

        // 3. Regular check
        return permissions.includes(permission);
    }

    hasAnyPermission(permissions: string[]): boolean {
        if (this.isAdmin()) return true;
        return permissions.some(p => this.hasPermission(p));
    }

    hasAllPermissions(permissions: string[]): boolean {
        if (this.isAdmin()) return true;
        return permissions.every(p => this.hasPermission(p));
    }

    getPermissions(): string[] {
        return this.permissionsSubject.value;
    }

    private setTokens(response: TokenResponse, rememberMe: boolean): void {
        if (rememberMe) {
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            // Ensure session is clear
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
        } else {
            sessionStorage.setItem('accessToken', response.accessToken);
            sessionStorage.setItem('refreshToken', response.refreshToken);
            // Ensure local is clear
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    }

    private clearTokens(): void {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        this.currentUserSubject.next(null);
        this.permissionsSubject.next([]);
    }

    private loadUserFromToken(): void {
        const token = this.getAccessToken();
        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                this.currentUserSubject.next(decoded);
                // Subscribe to load permissions
                this.loadPermissions(decoded).subscribe();
            } catch {
                this.clearTokens();
            }
        }
    }

    private loadPermissions(user: DecodedToken): Observable<void> {
        const roleClaim = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
        const currentUserRole = user[roleClaim];

        // Admin role has all permissions automatically
        if (currentUserRole === 'Admin') {
            this.permissionsSubject.next(['*']);
            return of(void 0);
        }

        // Initialize with empty for Staff/User, let API populate it
        this.permissionsSubject.next([]);

        const u = user as any;
        const roleId = u.roleId || u.RoleId || u.idRole || u.roleid;

        if (roleId && currentUserRole === 'Staff') {
            return new Observable(observer => {
                import('./role.service').then(({ RoleService }) => {
                    const roleService = new RoleService(this.apiService);
                    roleService.getRoleById(Number(roleId)).subscribe({
                        next: (role) => {
                            const perms = role.permissions || [];
                            console.log('Successfully loaded specific permissions from backend for role ' + roleId + ':', perms);
                            this.permissionsSubject.next(perms);

                            observer.next();
                            observer.complete();
                        },
                        error: (err) => {
                            console.error('Roles API error (likely 403 or 404):', err);
                            observer.next();
                            observer.complete();
                        }
                    });
                }).catch(err => {
                    console.error('Failed to dynamic import RoleService:', err);
                    observer.next();
                    observer.complete();
                });
            });
        }

        return of(void 0);
    }

    getAccessToken(): string | null {
        return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    }

    getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    }

    register(registerDto: RegisterDto): Observable<TokenResponse> {
        return this.apiService.post<TokenResponse>('Users', registerDto)
            .pipe(
                tap(response => {
                    this.setTokens(response, true); // Default register to persistent for now? Or session? Let's say persistent for ease.
                    this.loadUserFromToken();
                })
            );
    }
}
