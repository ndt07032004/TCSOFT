import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password';
import { ProfileComponent } from './features/user/profile/profile.component';
import { MyOrdersComponent } from './features/user/my-orders/my-orders.component';
import { OrderDetailComponent } from './features/user/order-detail/order-detail.component';
import { authGuard } from './core/guards/auth.guard';
import { ProductsComponent } from './features/shop/products/products';
import { DashboardComponent } from './features/admin/dashboard/dashboard';
import { AdminProductsComponent } from './features/admin/products/admin-products';
import { AdminOrdersComponent } from './features/admin/orders/admin-orders';
import { AdminUsersComponent } from './features/admin/users/admin-users';
import { AdminStaffsComponent } from './features/admin/staffs/admin-staffs';
import { AdminImportsComponent } from './features/admin/imports/admin-imports';
import { AdminRolesComponent } from './features/admin/roles/admin-roles';
import { AdminRevenueComponent } from './features/admin/revenue/admin-revenue';
import { adminGuard } from './core/guards/admin.guard';

import { ProductDetailComponent } from './features/shop/product-detail/product-detail';

import { CartComponent } from './features/shop/cart/cart';
import { CheckoutComponent } from './features/shop/checkout/checkout';

const routes: Routes = [
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'user/account/profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'user/purchase', component: MyOrdersComponent, canActivate: [authGuard] },
  { path: 'user/purchase/order/:id', component: OrderDetailComponent, canActivate: [authGuard] },
  { path: 'products', component: ProductsComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  {
    path: 'cart',
    component: CartComponent,
    canActivate: [authGuard]
  },

  {
    path: 'checkout',
    component: CheckoutComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    redirectTo: 'admin/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'admin/dashboard',
    component: DashboardComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/products',
    component: AdminProductsComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/orders',
    component: AdminOrdersComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/users',
    component: AdminUsersComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/staffs',
    component: AdminStaffsComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/imports',
    component: AdminImportsComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/roles',
    component: AdminRolesComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/revenue',
    component: AdminRevenueComponent,
    canActivate: [adminGuard]
  },
  // Add more routes as needed
  { path: '**', redirectTo: '/products' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
