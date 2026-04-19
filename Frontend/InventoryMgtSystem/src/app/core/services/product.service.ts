// src/app/core/services/product.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { HttpResponseData } from '../models/http-response.interface';
import { ProductDTO, ProductFilterDto } from '../models/product.interface';

// Shape returned by GET /api/product/paged
export interface PagedProductResponse {
  success: boolean;
  responsCode: number;
  message?: string;
  data: ProductDTO[];
  pagination: {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly base = `${environment.APIurl}/product`;

  constructor(private http: HttpClient) {}

  /** GET /api/product/paged */
  getPagedProducts(filter: ProductFilterDto): Observable<PagedProductResponse> {
    let params = new HttpParams()
      .set('pageNumber', filter.pageNumber.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);
    if (filter.categoryId != null) params = params.set('categoryId', filter.categoryId.toString());
    if (filter.active != null) params = params.set('active', filter.active.toString());
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);

    return this.http.get<PagedProductResponse>(`${this.base}/paged`, { params });
  }

  /** GET /api/product/:id */
  getProductById(id: number): Observable<HttpResponseData<ProductDTO>> {
    return this.http.get<HttpResponseData<ProductDTO>>(`${this.base}/${id}`);
  }

  /** POST /api/product */
  addProduct(dto: ProductDTO): Observable<HttpResponseData<ProductDTO>> {
    return this.http.post<HttpResponseData<ProductDTO>>(this.base, dto);
  }

  /** PUT /api/product */
  updateProduct(dto: ProductDTO): Observable<HttpResponseData<ProductDTO>> {
    return this.http.put<HttpResponseData<ProductDTO>>(this.base, dto);
  }

  /** DELETE /api/product/:id */
  deleteProduct(id: number): Observable<HttpResponseData<ProductDTO>> {
    return this.http.delete<HttpResponseData<ProductDTO>>(`${this.base}/${id}`);
  }
}