import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;

    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login({ email, password }, rememberMe).subscribe({
      next: () => {
        this.toast.success('Đăng nhập thành công!');
        // Redirect based on role
        const role = this.authService.getUserRole();
        if (role === 'Admin' || role === 'Staff') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/shop/products']);
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.loading = false;

        // Detailed error for user
        if (err.status === 401 || err.status === 400) {
          this.toast.error('Tài khoản hoặc mật khẩu không chính xác!');
        } else {
          const msg = err.error?.message || err.message || 'Lỗi kết nối server';
          this.toast.error(`Đăng nhập thất bại: ${msg}`);
        }
      }
    });
  }
}
