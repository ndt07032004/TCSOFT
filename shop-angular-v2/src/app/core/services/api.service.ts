import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    get<T>(endpoint: string, params?: any): Observable<T> {
        let httpParams = new HttpParams();
        if (params) {
            Object.keys(params).forEach(key => {
                if (params[key] !== null && params[key] !== undefined) {
                    httpParams = httpParams.set(key, params[key].toString());
                }
            });
        }

        return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params: httpParams }) as Observable<T>;
    }

    post<T>(endpoint: string, body: any, options?: any): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, options) as Observable<T>;
    }

    put<T>(endpoint: string, body: any): Observable<T> {
        return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body) as Observable<T>;
    }

    // Upload file with FormData
    postFormData<T>(endpoint: string, formData: FormData): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}/${endpoint}`, formData) as Observable<T>;
    }

    // Update with FormData
    putFormData<T>(path: string, body: FormData): Observable<T> {
        return this.http.put<T>(`${this.baseUrl}/${path}`, body);
    }

    patch<T>(path: string, body: any, options?: any): Observable<T> {
        return this.http.patch<T>(`${this.baseUrl}/${path}`, body, options) as Observable<T>;
    }

    delete<T>(path: string): Observable<T> {
        return this.http.delete<T>(`${this.baseUrl}/${path}`);
    }
}
