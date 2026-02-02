import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Role, RoleCreate, RoleUpdate } from '../../shared/models/role.model';

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    private endpoint = 'Roles';

    constructor(private apiService: ApiService) { }

    getRoles(): Observable<Role[]> {
        return this.apiService.get<Role[]>(this.endpoint).pipe(
            map(roles => roles.map(role => this.parseRolePermissions(role)))
        );
    }

    getRoleById(id: number): Observable<Role> {
        return this.apiService.get<Role>(`${this.endpoint}/${id}`).pipe(
            map(role => this.parseRolePermissions(role))
        );
    }

    private parseRolePermissions(role: Role): Role {
        const r = role as any;
        // Handle both PascalCase and camelCase from backend
        let perms = r.permissions || r.Permissions;

        if (typeof perms === 'string') {
            perms = perms.trim();
            if (perms === '') {
                role.permissions = [];
            } else if (perms.startsWith('[')) {
                try {
                    role.permissions = JSON.parse(perms);
                } catch (e) {
                    console.error('Failed to parse JSON permissions:', perms);
                    role.permissions = [];
                }
            } else {
                // Handle CSV format like "view,edit,delete"
                role.permissions = perms.split(',').map((p: string) => p.trim()).filter((p: string) => p);
            }
        } else if (Array.isArray(perms)) {
            role.permissions = perms;
        } else {
            role.permissions = [];
        }

        console.log(`Parsed permissions for role ${role.title}:`, role.permissions);
        return role;
    }

    createRole(role: RoleCreate): Observable<Role> {
        return this.apiService.post<Role>(this.endpoint, role);
    }

    updateRole(id: number, role: RoleUpdate): Observable<void> {
        return this.apiService.put<void>(`${this.endpoint}/${id}`, role);
    }

    deleteRole(id: number): Observable<void> {
        return this.apiService.delete<void>(`${this.endpoint}/${id}`);
    }

    updatePermissions(id: number, permissions: string[]): Observable<void> {
        // Backend expects an object (UpdatePermissionsDto) with a 'Permissions' property.
        // We send both cases to ensure compatibility regardless of backend JSON serializer settings.
        const payload = { permissions: permissions, Permissions: permissions };
        console.log('Sending wrapped permission payload to backend for role ID ' + id + ':', payload);
        return this.apiService.patch<void>(`${this.endpoint}/update-permissions/${id}`, payload);
    }
}
