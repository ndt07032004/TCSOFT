import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class RevenueService {
    private endpoint = 'Revenue';

    constructor(private apiService: ApiService) { }

    getRevenue(fromDate: string, toDate: string): Observable<any> {
        return this.apiService.get<any>(this.endpoint, { fromDate, toDate });
    }
}
