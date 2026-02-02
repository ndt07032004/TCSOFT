import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Import, ImportCreate } from '../../shared/models/import.model';
import { PagedResult } from '../../shared/models/pagination.model';

@Injectable({
    providedIn: 'root'
})
export class ImportService {
    private endpoint = 'Imports';

    constructor(private apiService: ApiService) { }

    getImports(params?: any): Observable<any> {
        // API docs show returns array directly or PagedResult?
        // Let's assume PagedResult based on others, but docs showed array in Example Value. 
        // Docs: "Schema [ { ... } ]" (Array) usually means no pagination wrapper or Example Value is just array.
        // But "Parameters: No parameters" in Try it out for GET /api/Imports.
        // Wait, the API docs pasted earlier:
        // GET /api/Imports
        // Parameters: No parameters in Try it out
        // Response: [ ... ] (Array of Import)
        // If it returns a list directly, we simplify using any[] or Import[]
        return this.apiService.get<Import[]>(this.endpoint, params);
    }

    getImportById(id: number): Observable<Import> {
        return this.apiService.get<Import>(`${this.endpoint}/${id}`);
    }

    createImport(data: ImportCreate): Observable<Import> {
        return this.apiService.post<Import>(this.endpoint, data);
    }
}
