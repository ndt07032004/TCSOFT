import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';

registerLocaleData(localeVi, 'vi');

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { JwtInterceptor } from './core/interceptors/jwt.interceptor';

// Components
import { HeaderComponent } from './shared/components/header/header';
import { FooterComponent } from './shared/components/footer/footer';
import { ProductCardComponent } from './shared/components/product-card/product-card';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password';
import { ProfileComponent } from './features/user/profile/profile.component';
import { MyOrdersComponent } from './features/user/my-orders/my-orders.component';
import { OrderDetailComponent } from './features/user/order-detail/order-detail.component';
import { ProductsComponent } from './features/shop/products/products';
import { ProductDetailComponent } from './features/shop/product-detail/product-detail';
import { CartComponent } from './features/shop/cart/cart';
import { CheckoutComponent } from './features/shop/checkout/checkout';
import { ToastComponent } from './shared/components/toast/toast';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';

// Admin Components
import { DashboardComponent } from './features/admin/dashboard/dashboard';
import { AdminProductsComponent } from './features/admin/products/admin-products';
import { ProductFormComponent } from './features/admin/products/product-form/product-form';
import { AdminOrdersComponent } from './features/admin/orders/admin-orders';
import { AdminUsersComponent } from './features/admin/users/admin-users';
import { AdminStaffsComponent } from './features/admin/staffs/admin-staffs';
import { AdminImportsComponent } from './features/admin/imports/admin-imports';
import { AdminRolesComponent } from './features/admin/roles/admin-roles';
import { AdminRevenueComponent } from './features/admin/revenue/admin-revenue';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    ProductCardComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    ProfileComponent,
    MyOrdersComponent,
    OrderDetailComponent,
    ProductsComponent,
    ProductDetailComponent,
    CartComponent,
    CheckoutComponent,
    ToastComponent,
    ConfirmDialogComponent,
    DashboardComponent,
    AdminProductsComponent,
    ProductFormComponent,
    AdminOrdersComponent,
    AdminUsersComponent,
    AdminStaffsComponent,
    AdminImportsComponent,
    AdminRolesComponent,
    AdminRevenueComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    { provide: LOCALE_ID, useValue: 'vi' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
