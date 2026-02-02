import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.html'
})
export class RegisterComponent {
    registerForm: FormGroup;
    loading = false;
    submitted = false;
    error = '';
    showPassword = false;
    showConfirmPassword = false;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private authService: AuthService,
        private toastService: ToastService
    ) {
        this.registerForm = this.formBuilder.group({
            fullName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', Validators.required],
            address: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        }, {
            validator: this.mustMatch('password', 'confirmPassword')
        });
    }

    get f() { return this.registerForm.controls; }

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

        if (this.registerForm.invalid) {
            return;
        }

        this.loading = true;

        // Clean DTO for backend (remove confirmPassword)
        const formValue = this.registerForm.value;
        const registerDto = {
            email: formValue.email,
            password: formValue.password,
            fullName: formValue.fullName,
            phone: formValue.phone,
            address: formValue.address
        };

        this.authService.register(registerDto)
            .subscribe({
                next: () => {
                    this.toastService.success('Đăng ký thành công!');
                    this.router.navigate(['/']);
                },
                error: (error: any) => {
                    this.error = error.error?.message || 'Đăng ký thất bại! Vui lòng thử lại.';
                    this.loading = false;
                }
            });
    }
}
