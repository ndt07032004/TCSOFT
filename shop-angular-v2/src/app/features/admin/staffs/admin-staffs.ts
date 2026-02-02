import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StaffService } from '../../../core/services/staff.service';
import { RoleService } from '../../../core/services/role.service'; // Import RoleService
import { ToastService } from '../../../core/services/toast.service';
import { Staff, StaffCreate, StaffUpdate } from '../../../shared/models/user.model';
import { Role } from '../../../shared/models/role.model'; // Import Role
import { PagedResult } from '../../../shared/models/pagination.model';

@Component({
    selector: 'app-admin-staffs',
    templateUrl: './admin-staffs.html',
    styleUrls: ['./admin-staffs.scss']
})
export class AdminStaffsComponent implements OnInit {
    staffs: Staff[] = [];
    loading = false;
    submitting = false;

    // Pagination
    currentPage = 1;
    pageSize = 10;
    totalPages = 0;
    totalCount = 0;

    // Form
    showForm = false;
    staffForm: FormGroup;
    editingStaff: Staff | null = null;

    searchTerm = '';

    // Roles
    roles: Role[] = [];

    constructor(
        private staffService: StaffService,
        private roleService: RoleService,
        private fb: FormBuilder,
        private toastService: ToastService
    ) {
        this.staffForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            fullName: ['', Validators.required],
            phone: ['', Validators.required],
            address: ['', Validators.required],
            salary: [0, [Validators.required, Validators.min(0)]],
            roleId: [null, Validators.required],
            password: ['']
        });
    }

    ngOnInit(): void {
        this.loadRoles();
        this.loadStaffs();
    }

    loadRoles(): void {
        this.roleService.getRoles().subscribe({
            next: (roles) => {
                this.roles = roles;
            },
            error: (err) => console.error('Error loading roles:', err)
        });
    }

    loadStaffs(): void {
        this.loading = true;
        const params: any = {
            pageNumber: this.currentPage,
            pageSize: this.pageSize
        };

        if (this.searchTerm) {
            params.search = this.searchTerm;
        }

        this.staffService.getStaffs(params).subscribe({
            next: (result: PagedResult<Staff>) => {
                this.staffs = result.items;
                this.totalCount = result.totalCount;
                this.totalPages = result.totalPages;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading staffs:', err);
                this.loading = false;
            }
        });
    }

    onSearch(): void {
        this.currentPage = 1;
        this.loadStaffs();
    }

    openCreateForm(): void {
        this.editingStaff = null;
        this.staffForm.reset({ salary: 0 });

        // Password required for create
        this.staffForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        this.staffForm.get('password')?.updateValueAndValidity();

        this.showForm = true;
    }

    openEditForm(staff: Staff): void {
        this.editingStaff = staff;
        this.staffForm.patchValue({
            email: staff.email,
            fullName: staff.fullName,
            phone: staff.phone,
            address: staff.address,
            salary: staff.salary,
            roleId: staff.roleId,
            password: ''
        });

        // Password optional for edit
        this.staffForm.get('password')?.clearValidators();
        this.staffForm.get('password')?.setValidators([Validators.minLength(6)]);
        this.staffForm.get('password')?.updateValueAndValidity();

        // Disable email
        this.staffForm.get('email')?.disable();

        this.showForm = true;
    }

    closeForm(): void {
        this.showForm = false;
        this.editingStaff = null;
        this.staffForm.reset();
    }

    submitForm(): void {
        if (this.staffForm.invalid) {
            this.toastService.warning('Vui lòng kiểm tra lại thông tin!');
            return;
        }

        this.submitting = true;
        const formValue = this.staffForm.getRawValue();

        if (this.editingStaff) {
            // Update
            const updateData: StaffUpdate = {
                fullName: formValue.fullName,
                phone: formValue.phone,
                address: formValue.address,
                salary: formValue.salary,
                roleId: formValue.roleId,
                password: formValue.password || undefined
            };

            this.staffService.updateStaff(this.editingStaff.idStaff, updateData).subscribe({
                next: () => {
                    this.toastService.success('Cập nhật nhân viên thành công!');
                    this.closeForm();
                    this.loadStaffs();
                    this.submitting = false;
                },
                error: (err) => {
                    console.error('Error updating staff:', err);
                    this.toastService.error('Lỗi cập nhật: ' + (err.error?.message || err.message));
                    this.submitting = false;
                }
            });
        } else {
            // Create
            const createData: StaffCreate = {
                email: formValue.email,
                password: formValue.password,
                fullName: formValue.fullName,
                phone: formValue.phone,
                address: formValue.address,
                salary: formValue.salary,
                roleId: formValue.roleId
            };

            this.staffService.createStaff(createData).subscribe({
                next: () => {
                    this.toastService.success('Thêm nhân viên thành công!');
                    this.closeForm();
                    this.loadStaffs();
                    this.submitting = false;
                },
                error: (err) => {
                    console.error('Error creating staff:', err);
                    this.toastService.error('Lỗi thêm mới: ' + (err.error?.message || err.message));
                    this.submitting = false;
                }
            });
        }
    }

    deleteStaff(staff: Staff): void {
        if (!confirm(`Bạn có chắc muốn xóa nhân viên "${staff.fullName}"?`)) return;

        this.staffService.deleteStaff(staff.idStaff).subscribe({
            next: () => {
                this.toastService.success('Đã xóa nhân viên!');
                this.loadStaffs();
            },
            error: (err) => {
                console.error('Error deleting staff:', err);
                this.toastService.error('Không thể xóa nhân viên: ' + (err.error?.message || err.message));
            }
        });
    }

    getRoleName(roleId: number): string {
        const role = this.roles.find(r => r.id === roleId);
        return role ? role.title : 'Unknown';
    }

    goToPage(page: number): void {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.loadStaffs();
    }
}
