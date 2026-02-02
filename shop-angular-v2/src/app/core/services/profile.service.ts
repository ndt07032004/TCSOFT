import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface UserProfileDto {
    fullName: string;
    phone: string;
    address: string;
    email?: string;
    username?: string;
    avatar?: string;
}

export interface ChangePasswordDto {
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    constructor(private apiService: ApiService) { }

    getProfile(): Observable<UserProfileDto> {
        return this.apiService.get<UserProfileDto>('Profiles/me');
    }

    updateProfile(data: UserProfileDto): Observable<any> {
        return this.apiService.put('Profiles/update-me', data);
    }

    changePassword(data: ChangePasswordDto): Observable<any> {
        return this.apiService.post('Profiles/change-password', data);
    }
}
