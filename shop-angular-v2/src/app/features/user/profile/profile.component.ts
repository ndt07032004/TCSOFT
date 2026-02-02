import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService, UserProfileDto } from '../../../core/services/profile.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
    profileForm: FormGroup;
    passwordForm: FormGroup;
    user: UserProfileDto | null = null;
    loading = false;
    activeTab = 'profile'; // 'profile' | 'password'

    showOldPassword = false;
    showNewPassword = false;
    showConfirmPassword = false;

    constructor(
        private fb: FormBuilder,
        private profileService: ProfileService,
        private toastService: ToastService
    ) {
        this.profileForm = this.fb.group({
            fullName: ['', Validators.required],
            phone: ['', [Validators.pattern('^[0-9]{10}$')]],
            address: [''],
            email: [{ value: '', disabled: true }], // Email typically read-only
            username: [{ value: '', disabled: true }] // Username typically read-only
        });

        this.passwordForm = this.fb.group({
            oldPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required]
        }, { validator: this.passwordMatchValidator });
    }

    ngOnInit(): void {
        this.loadProfile();
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('newPassword')?.value === g.get('confirmPassword')?.value
            ? null : { mismatch: true };
    }

    loadProfile() {
        this.loading = true;
        this.profileService.getProfile().subscribe({
            next: (data) => {
                this.user = data;
                this.profileForm.patchValue({
                    fullName: data.fullName,
                    phone: data.phone,
                    address: data.address,
                    email: data.email,
                    username: data.username
                });
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    updateProfile() {
        if (this.profileForm.invalid) return;
        this.loading = true;
        this.profileService.updateProfile(this.profileForm.getRawValue()).subscribe({
            next: () => {
                this.toastService.success('Cập nhật thông tin thành công!');
                this.loading = false;
            },
            error: (err) => {
                this.toastService.error('Cập nhật thất bại: ' + (err.error?.message || 'Lỗi không xác định'));
                this.loading = false;
            }
        });
    }

    changePassword() {
        if (this.passwordForm.invalid) return;
        this.loading = true;
        this.profileService.changePassword(this.passwordForm.value).subscribe({
            next: () => {
                this.toastService.success('Đổi mật khẩu thành công!');
                this.passwordForm.reset();
                this.loading = false;
            },
            error: (err) => {
                this.toastService.error('Đổi mật khẩu thất bại: ' + (err.error?.message || 'Lỗi không xác định'));
                this.loading = false;
            }
        });
    }
}
