import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Product, ProductCreate } from '../../shared/models/product.model';
import { PagedResult, PaginationParams } from '../../shared/models/pagination.model';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private endpoint = 'products';

    constructor(private apiService: ApiService) { }

    getProducts(params?: any): Observable<PagedResult<Product>> {
        return this.apiService.get<PagedResult<Product>>(this.endpoint, params);
    }

    getProductById(id: number): Observable<Product> {
        return this.apiService.get<Product>(`${this.endpoint}/${id}`);
    }

    createProduct(product: ProductCreate): Observable<Product> {
        const formData = new FormData();
        formData.append('name', product.name);
        formData.append('price', product.price.toString());
        formData.append('importPrice', product.importPrice.toString());
        formData.append('stockQuantity', product.stockQuantity.toString());
        formData.append('category', product.category);
        formData.append('size', product.size);
        formData.append('color', product.color);
        formData.append('description', product.description || '');

        if (product.styleId) {
            formData.append('styleId', product.styleId);
        }

        if (product.imageFile) {
            formData.append('imageFile', product.imageFile);
        }

        return this.apiService.postFormData<Product>(this.endpoint, formData);
    }

    updateProduct(id: number, product: ProductCreate): Observable<boolean> {
        const formData = new FormData();
        formData.append('idSP', id.toString());
        formData.append('name', product.name);
        formData.append('price', product.price.toString());
        formData.append('importPrice', product.importPrice.toString());
        formData.append('stockQuantity', product.stockQuantity.toString());
        formData.append('category', product.category);
        formData.append('size', product.size);
        formData.append('color', product.color);
        formData.append('description', product.description || '');

        if (product.styleId) {
            formData.append('styleId', product.styleId);
        }

        if (product.imageFile) {
            formData.append('imageFile', product.imageFile);
        }

        return this.apiService.putFormData<boolean>(`${this.endpoint}/${id}`, formData);
    }

    deleteProduct(id: number): Observable<boolean> {
        return this.apiService.delete<boolean>(`${this.endpoint}/${id}`);
    }
}
