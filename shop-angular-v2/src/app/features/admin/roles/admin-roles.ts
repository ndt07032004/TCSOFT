import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoleService } from '../../../core/services/role.service';
import { ToastService } from '../../../core/services/toast.service';
import { Role, AVAILABLE_PERMISSIONS, RolePermissionsUpdate } from '../../../shared/models/role.model';

@Component({
    selector: 'app-admin-roles',
    templateUrl: './admin-roles.html',
    styleUrls: ['./admin-roles.scss']
})
export class AdminRolesComponent implements OnInit {
    roles: Role[] = [];
    loading = false;
    submitting = false;

    // Form for Role Create/Edit
    showForm = false;
    roleForm: FormGroup;
    editingRole: Role | null = null;

    // Permissions
    availablePermissions = AVAILABLE_PERMISSIONS;
    selectedRoleForPermissions: Role | null = null;
    showPermissionsModal = false;
    permissionsForm: FormGroup;

    constructor(
        private roleService: RoleService,
        private fb: FormBuilder,
        private toastService: ToastService
    ) {
        this.roleForm = this.fb.group({
            title: ['', Validators.required],
            description: ['']
        });

        this.permissionsForm = this.fb.group({
            // We'll dynamically add controls or manage selection differently
            // Using a simple array for selection state might be easier
        });
    }

    ngOnInit(): void {
        this.loadRoles();
    }

    loadRoles(): void {
        this.loading = true;
        this.roleService.getRoles().subscribe({
            next: (data) => {
                this.roles = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading roles:', err);
                this.loading = false;
            }
        });
    }

    openCreateForm(): void {
        this.editingRole = null;
        this.roleForm.reset();
        this.showForm = true;
    }

    openEditForm(role: Role): void {
        this.editingRole = role;
        this.roleForm.patchValue({
            title: role.title,
            description: role.description
        });
        this.showForm = true;
    }

    closeForm(): void {
        this.showForm = false;
        this.editingRole = null;
        this.roleForm.reset();
    }

    submitForm(): void {
        if (this.roleForm.invalid) return;

        this.submitting = true;
        const formValue = this.roleForm.getRawValue();

        if (this.editingRole) {
            this.roleService.updateRole(this.editingRole.id, formValue).subscribe({
                next: () => {
                    this.toastService.success('Cập nhật vai trò thành công!');
                    this.closeForm();
                    this.loadRoles();
                    this.submitting = false;
                },
                error: (err) => {
                    console.error('Error updating role:', err);
                    this.toastService.error('Lỗi: ' + (err.error?.message || err.message));
                    this.submitting = false;
                }
            });
        } else {
            this.roleService.createRole(formValue).subscribe({
                next: () => {
                    this.toastService.success('Tạo vai trò thành công!');
                    this.closeForm();
                    this.loadRoles();
                    this.submitting = false;
                },
                error: (err) => {
                    console.error('Error creating role:', err);
                    this.toastService.error('Lỗi: ' + (err.error?.message || err.message));
                    this.submitting = false;
                }
            });
        }
    }

    deleteRole(role: Role): void {
        if (!confirm(`Bạn có chắc muốn xóa vai trò "${role.title}"?`)) return;

        this.roleService.deleteRole(role.id).subscribe({
            next: () => {
                this.toastService.success('Đã xóa vai trò!');
                this.loadRoles();
            },
            error: (err) => {
                console.error('Error deleting role:', err);
                this.toastService.error('Không thể xóa vai trò: ' + (err.error?.message || err.message));
            }
        });
    }

    // Permissions Logic
    userPermissions: string[] = []; // Temporary storage for selected permissions in modal

    openPermissionsModal(role: Role): void {
        this.selectedRoleForPermissions = role;
        // userPermissions needs to be initialized from role.permissions
        // role.permissions is either string[] or string, handled by service to be string[] mostly.
        // But let's be safe.
        let perms: string[] = [];
        if (Array.isArray(role.permissions)) {
            perms = role.permissions;
        } else if (typeof role.permissions === 'string') {
            // Fallback if service didn't catch it
            perms = (role.permissions as string).split(',');
        }

        this.userPermissions = [...perms];
        this.showPermissionsModal = true;
    }

    closePermissionsModal(): void {
        this.showPermissionsModal = false;
        this.selectedRoleForPermissions = null;
        this.userPermissions = [];
    }

    togglePermission(permValue: string): void {
        const index = this.userPermissions.indexOf(permValue);
        if (index > -1) {
            this.userPermissions.splice(index, 1);
        } else {
            this.userPermissions.push(permValue);
        }
    }

    isPermissionSelected(permValue: string): boolean {
        return this.userPermissions.includes(permValue);
    }

    savePermissions(): void {
        if (!this.selectedRoleForPermissions) return;

        const csvFormat = this.userPermissions.join(',');
        console.log('Saving permissions for role:', this.selectedRoleForPermissions.id);
        console.log('Payload format (CSV):', csvFormat);

        this.submitting = true;
        this.roleService.updatePermissions(this.selectedRoleForPermissions.id, this.userPermissions).subscribe({
            next: () => {
                console.log('Permissions saved successfully!');
                this.toastService.success('Cập nhật phân quyền thành công!');
                this.closePermissionsModal();
                this.loadRoles();
                this.submitting = false;
            },
            error: (err) => {
                console.error('Error updating permissions:', err);
                this.toastService.error('Lỗi khi lưu phân quyền: ' + (err.error?.message || err.message));
                this.submitting = false;
            }
        });
    }
}
