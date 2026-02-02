import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Review {
    idReview?: number;
    idUser?: number;
    idSP: number;
    rating: string; // "ONE", "TWO", "THREE", "FOUR", "FIVE"
    comment: string;
    user?: any; // To display user info
    product?: any;
    createdAt?: string; // If available
}

@Injectable({
    providedIn: 'root'
})
export class ReviewService {
    private readonly ENDPOINT = 'Reviews';

    constructor(private apiService: ApiService) { }

    getAllReviews(): Observable<Review[]> {
        return this.apiService.get<Review[]>(this.ENDPOINT);
    }

    getReviewById(id: number): Observable<Review> {
        return this.apiService.get<Review>(`${this.ENDPOINT}/${id}`);
    }

    createReview(review: Review): Observable<Review> {
        return this.apiService.post<Review>(this.ENDPOINT, review);
    }

    updateReview(id: number, review: Review): Observable<Review> {
        return this.apiService.put<Review>(`${this.ENDPOINT}/${id}`, review);
    }

    deleteReview(id: number): Observable<any> {
        return this.apiService.delete<any>(`${this.ENDPOINT}/${id}`);
    }
}
