import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { User, UserCreate, UserUpdate } from '../../../shared/models/user.model';
import { PagedResult } from '../../../shared/models/pagination.model';

@Component({
    selector: 'app-admin-users',
    templateUrl: './admin-users.html',
    styleUrls: ['./admin-users.scss']
})
export class AdminUsersComponent implements OnInit {
    users: User[] = [];
    loading = false;
    submitting = false;

    // Pagination
    currentPage = 1;
    pageSize = 10;
    totalPages = 0;
    totalCount = 0;

    // Form
    showForm = false;
    userForm: FormGroup;
    editingUser: User | null = null;

    searchTerm = '';

    constructor(
        private userService: UserService,
        private fb: FormBuilder,
        private toastService: ToastService
    ) {
        this.userForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            fullName: ['', Validators.required],
            phone: ['', Validators.required],
            address: ['', Validators.required],
            password: ['']
        });
    }

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers(): void {
        this.loading = true;
        const params: any = {
            pageNumber: this.currentPage,
            pageSize: this.pageSize
        };

        if (this.searchTerm) {
            params.search = this.searchTerm;
        }

        this.userService.getUsers(params).subscribe({
            next: (result: PagedResult<User>) => {
                this.users = result.items;
                this.totalCount = result.totalCount;
                this.totalPages = result.totalPages;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading users:', err);
                this.loading = false;
            }
        });
    }

    onSearch(): void {
        this.currentPage = 1;
        this.loadUsers();
    }

    openCreateForm(): void {
        this.editingUser = null;
        this.userForm.reset();

        // Set validation for password (required for create)
        this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        this.userForm.get('password')?.updateValueAndValidity();

        this.showForm = true;
    }

    openEditForm(user: User): void {
        this.editingUser = user;
        this.userForm.patchValue({
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            address: user.address,
            password: '' // Password optional for edit
        });

        // Remove required validator for password in edit mode
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.setValidators([Validators.minLength(6)]); // Only length check if provided
        this.userForm.get('password')?.updateValueAndValidity();

        // Disable email in edit mode if backend doesn't allow changing it (usually true for ID/Account link)
        this.userForm.get('email')?.disable();

        this.showForm = true;
    }

    closeForm(): void {
        this.showForm = false;
        this.editingUser = null;
        this.userForm.reset();
    }

    submitForm(): void {
        if (this.userForm.invalid) {
            this.toastService.warning('Vui lòng kiểm tra lại thông tin!');
            return;
        }

        this.submitting = true;
        const formValue = this.userForm.getRawValue(); // Use getRawValue to include disabled fields if needed, mostly for email

        if (this.editingUser) {
            // Update
            const updateData: UserUpdate = {
                fullName: formValue.fullName,
                phone: formValue.phone,
                address: formValue.address,
                password: formValue.password || undefined
            };

            this.userService.updateUser(this.editingUser.idUser, updateData).subscribe({
                next: () => {
                    this.toastService.success('Cập nhật người dùng thành công!');
                    this.closeForm();
                    this.loadUsers();
                    this.submitting = false;
                },
                error: (err) => {
                    console.error('Error updating user:', err);
                    this.toastService.error('Lỗi cập nhật: ' + (err.error?.message || err.message));
                    this.submitting = false;
                }
            });
        } else {
            // Create
            const createData: UserCreate = {
                email: formValue.email,
                password: formValue.password,
                fullName: formValue.fullName,
                phone: formValue.phone,
                address: formValue.address
            };

            this.userService.createUser(createData).subscribe({
                next: () => {
                    this.toastService.success('Thêm người dùng thành công!');
                    this.closeForm();
                    this.loadUsers();
                    this.submitting = false;
                },
                error: (err) => {
                    console.error('Error creating user:', err);
                    this.toastService.error('Lỗi thêm mới: ' + (err.error?.message || err.message));
                    this.submitting = false;
                }
            });
        }
    }

    deleteUser(user: User): void {
        if (!confirm(`Bạn có chắc muốn xóa người dùng "${user.fullName}"?`)) return;

        this.userService.deleteUser(user.idUser).subscribe({
            next: () => {
                this.toastService.success('Đã xóa người dùng!');
                this.loadUsers();
            },
            error: (err) => {
                console.error('Error deleting user:', err);
                this.toastService.error('Không thể xóa người dùng: ' + (err.error?.message || err.message));
            }
        });
    }

    goToPage(page: number): void {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.loadUsers();
    }
}
