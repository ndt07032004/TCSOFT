import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.html'
})
export class ForgotPasswordComponent {
    form: FormGroup;
    otpForm: FormGroup;
    loading = false;
    submitted = false;
    otpSubmitted = false;
    successMessage = '';
    error = '';
    step = 1; // 1: Email input, 2: OTP input

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.form = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });

        this.otpForm = this.fb.group({
            otpCode: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    get f() { return this.form.controls; }
    get o() { return this.otpForm.controls; }

    onSubmit() {
        this.submitted = true;
        this.error = '';
        this.successMessage = '';

        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        this.authService.forgotPassword(this.form.value)
            .subscribe({
                next: () => {
                    this.successMessage = 'Mã xác thực OTP đã được gửi đến email của bạn. Vui lòng kiểm tra và nhập mã bên dưới.';
                    this.loading = false;
                    this.step = 2; // Switch to OTP step
                },
                error: error => {
                    this.error = error.error?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
                    this.loading = false;
                }
            });
    }

    onVerifyOtp() {
        this.otpSubmitted = true;
        this.error = '';

        if (this.otpForm.invalid) {
            return;
        }

        this.loading = true;
        const verifyDto = {
            email: this.form.get('email')?.value?.trim(),
            otpCode: this.otpForm.get('otpCode')?.value?.trim()
        };

        this.authService.verifyOtp(verifyDto)
            .subscribe({
                next: (res) => {
                    this.loading = false;
                    // Navigate to reset password with token
                    this.router.navigate(['/reset-password'], { queryParams: { token: res.token } });
                },
                error: (error) => {
                    this.error = error.error?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.';
                    this.loading = false;
                }
            });
    }
}
