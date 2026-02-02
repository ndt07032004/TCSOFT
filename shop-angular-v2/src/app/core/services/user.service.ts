import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, UserCreate, UserUpdate } from '../../shared/models/user.model';
import { PagedResult } from '../../shared/models/pagination.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private endpoint = 'Users';

    constructor(private apiService: ApiService) { }

    getUsers(params?: any): Observable<PagedResult<User>> {
        return this.apiService.get<PagedResult<User>>(this.endpoint, params);
    }

    getUserById(id: number): Observable<User> {
        return this.apiService.get<User>(`${this.endpoint}/${id}`);
    }

    createUser(user: UserCreate): Observable<any> {
        return this.apiService.post<any>(this.endpoint, user);
    }

    updateUser(id: number, user: UserUpdate): Observable<void> {
        return this.apiService.put<void>(`${this.endpoint}/${id}`, user);
    }

    deleteUser(id: number): Observable<void> {
        return this.apiService.delete<void>(`${this.endpoint}/${id}`);
    }
}
