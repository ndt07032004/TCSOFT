import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.html'
})
export class ResetPasswordComponent implements OnInit {
    form: FormGroup;
    loading = false;
    submitted = false;
    successMessage = '';
    error = '';
    token = '';

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService
    ) {
        this.form = this.fb.group({
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        }, {
            validator: this.mustMatch('newPassword', 'confirmPassword')
        });
    }

    ngOnInit(): void {
        this.token = this.route.snapshot.queryParams['token'];
        if (!this.token) {
            this.error = 'Token không hợp lệ hoặc bị thiếu.';
        }
    }

    get f() { return this.form.controls; }

    mustMatch(controlName: string, matchingControlName: string) {
        return (formGroup: FormGroup) => {
            const control = formGroup.controls[controlName];
            const matchingControl = formGroup.controls[matchingControlName];

            if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
                return;
            }

            if (control.value !== matchingControl.value) {
                matchingControl.setErrors({ mustMatch: true });
            } else {
                matchingControl.setErrors(null);
            }
        }
    }

    onSubmit() {
        this.submitted = true;
        this.error = '';
        this.successMessage = '';

        if (this.form.invalid || !this.token) {
            return;
        }

        this.loading = true;
        this.authService.resetPassword(this.form.value, this.token)
            .subscribe({
                next: () => {
                    this.successMessage = 'Đặt lại mật khẩu thành công! Đang chuyển hướng...';
                    this.loading = false;
                    setTimeout(() => {
                        this.router.navigate(['/login']);
                    }, 3000);
                },
                error: error => {
                    this.error = error.error?.message || 'Đặt lại mật khẩu thất bại.';
                    this.loading = false;
                }
            });
    }
}
