import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Staff, StaffCreate, StaffUpdate } from '../../shared/models/user.model';
import { PagedResult } from '../../shared/models/pagination.model';

@Injectable({
    providedIn: 'root'
})
export class StaffService {
    private endpoint = 'Staffs';

    constructor(private apiService: ApiService) { }

    getStaffs(params?: any): Observable<PagedResult<Staff>> {
        return this.apiService.get<PagedResult<Staff>>(this.endpoint, params);
    }

    getStaffById(id: number): Observable<Staff> {
        return this.apiService.get<Staff>(`${this.endpoint}/${id}`);
    }

    createStaff(staff: StaffCreate): Observable<Staff> {
        return this.apiService.post<Staff>(this.endpoint, staff);
    }

    updateStaff(id: number, staff: StaffUpdate): Observable<void> {
        return this.apiService.put<void>(`${this.endpoint}/${id}`, staff);
    }

    deleteStaff(id: number): Observable<void> {
        return this.apiService.delete<void>(`${this.endpoint}/${id}`);
    }
}
