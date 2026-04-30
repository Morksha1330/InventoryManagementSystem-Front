// src/app/core/services/category.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryDTO, CategoryFilterDto } from '../models/category.interface';
import { environment } from '../../../environments/environment.development';
import { HttpResponseData } from '../models/http-response.interface';

export interface PagedCategoryResponse {
  success: boolean;
  responsCode: number;
  message?: string;
  data: CategoryDTO[];
  pagination: {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly apiUrl = environment.APIurl;
  private baseUrl = environment.APIurl + '/Auth';
  private homeUrl = environment.APIurl + '/Home';
  private userUrl = environment.APIurl + '/User';
  private categoryUrl = environment.APIurl + '/Category';

  constructor(private http: HttpClient) {}

  getPagedCategories(filter: CategoryFilterDto): Observable<PagedCategoryResponse> {
    let params = new HttpParams()
      .set('pageNumber', filter.pageNumber.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);
    if (filter.active !== undefined && filter.active !== null)
      params = params.set('active', filter.active.toString());
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);

    return this.http.get<PagedCategoryResponse>(`${this.categoryUrl}/paged`, { params });
  }

  getCategoryById(id: number): Observable<HttpResponseData<CategoryDTO>> {
    return this.http.get<HttpResponseData<CategoryDTO>>(`${this.categoryUrl}/${id}`);
  }

  addCategory(dto: CategoryDTO): Observable<HttpResponseData<CategoryDTO>> {
    return this.http.post<HttpResponseData<CategoryDTO>>(this.categoryUrl, dto);
  }

  updateCategory(dto: CategoryDTO): Observable<HttpResponseData<CategoryDTO>> {
    return this.http.put<HttpResponseData<CategoryDTO>>(this.categoryUrl, dto);
  }

  deleteCategory(id: number): Observable<HttpResponseData<CategoryDTO>> {
    return this.http.delete<HttpResponseData<CategoryDTO>>(`${this.categoryUrl}/${id}`);
  }
}