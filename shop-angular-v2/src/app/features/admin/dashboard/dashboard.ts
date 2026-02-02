import { Component, OnInit } from '@angular/core';
import { forkJoin, catchError, of } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { OrderService } from '../../../core/services/order.service';
import { UserService } from '../../../core/services/user.service';
import { RevenueService } from '../../../core/services/revenue.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
    stats = {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalUsers: 0,
        lowStockCount: 0,
        lastUpdate: new Date()
    };
    loading = true;
    userPermissions: string[] = [];

    constructor(
        private productService: ProductService,
        private orderService: OrderService,
        private userService: UserService,
        private revenueService: RevenueService,
        public authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadStats();

        // Subscribe to permissions to ensure UI updates when they load
        this.authService.permissions$.subscribe(permissions => {
            this.userPermissions = permissions;
            console.log('Dashboard permissions updated:', permissions);
        });

        // Debug: Log roles
        console.log('=== DASHBOARD DEBUG ===');
        console.log('User role:', this.authService.getUserRole());
        console.log('Is Admin:', this.authService.isAdmin());
        console.log('Is Staff:', this.authService.isStaff());
    }

    loadStats(): void {
        this.loading = true;

        const header = { pageNumber: 1, pageSize: 1 };
        const fromDate = '2024-01-01';
        const toDate = new Date().toISOString().split('T')[0];

        // Fetch up to 100 products to calculate low stock count
        const productParams = { pageNumber: 1, pageSize: 100 };

        const safeProducts$ = this.productService.getProducts(productParams).pipe(catchError(() => of({ items: [], totalCount: 0 })));
        const safeOrders$ = this.orderService.getAllOrders(header).pipe(catchError(() => of({ totalCount: 0 })));
        const safeUsers$ = this.userService.getUsers(header).pipe(catchError(() => of({ totalCount: 0 })));
        const safeRevenue$ = this.revenueService.getRevenue(fromDate, toDate).pipe(catchError(() => of({ totalRevenue: 0 })));

        forkJoin({
            products: safeProducts$,
            orders: safeOrders$,
            users: safeUsers$,
            revenue: safeRevenue$
        }).subscribe({
            next: (res: any) => {
                const products = res.products?.items || [];
                this.stats.totalProducts = res.products?.totalCount || 0;
                this.stats.totalOrders = res.orders?.totalCount || 0;
                this.stats.totalUsers = res.users?.totalCount || 0;

                // Calculate low stock (quantity < 10)
                this.stats.lowStockCount = products.filter((p: any) => p.stockQuantity < 10).length;

                const revenueData = res.revenue;
                if (Array.isArray(revenueData)) {
                    this.stats.totalRevenue = revenueData.reduce((sum: number, item: any) => sum + (item.revenue || item.totalRevenue || 0), 0);
                } else {
                    this.stats.totalRevenue = revenueData?.totalRevenue || 0;
                }

                this.stats.lastUpdate = new Date();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading dashboard stats:', err);
                this.loading = false;
            }
        });
    }

    showCard(permission: string): boolean {
        // Use AuthService's robust hasPermission which includes fallback for Staff
        return this.authService.hasPermission(permission);
    }

    hasAnyVisibleCard(): boolean {
        const cards = ['product_view', 'order_view', 'user_view', 'staff_view', 'role_view', 'revenue_view', 'import_view'];
        return cards.some(c => this.showCard(c));
    }
}
