// src/app/core/services/supplier.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SupplierDto, SupplierFilterDto } from '../models/supplier.interface';
import { HttpResponseData } from '../models/http-response.interface';
import { environment } from '../../../environments/environment.development';
import {  PagedResultDto } from '../models/paged-results.interface';


@Injectable({
  providedIn: 'root',
})
export class SupplierService {
    private readonly apiUrl = environment.APIurl;
  private baseUrl = environment.APIurl + '/Supplier';

  constructor(private http: HttpClient) {}

  getPagedSuppliers(filter: SupplierFilterDto): Observable<{
    success: boolean;
    responsCode: number;
    message?: string;
    data: SupplierDto[];
    pagination: PagedResultDto<SupplierDto>;
  }> {
    let params = new HttpParams()
      .set('pageNumber', filter.pageNumber.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);
    if (filter.active !== undefined && filter.active !== null)
      params = params.set('active', filter.active.toString());
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);

    return this.http.get<any>(`${this.baseUrl}/paged`, { params });
  }

  getSupplierById(id: number): Observable<HttpResponseData<SupplierDto>> {
    return this.http.get<HttpResponseData<SupplierDto>>(`${this.baseUrl}/${id}`);
  }

  createSupplier(supplier: Omit<SupplierDto, 'id'>): Observable<HttpResponseData<SupplierDto>> {
    return this.http.post<HttpResponseData<SupplierDto>>(this.baseUrl, supplier);
  }

  updateSupplier(id: number, supplier: SupplierDto): Observable<HttpResponseData<SupplierDto>> {
    return this.http.put<HttpResponseData<SupplierDto>>(`${this.baseUrl}/${id}`, supplier);
  }

  deleteSupplier(id: number): Observable<HttpResponseData<SupplierDto>> {
    return this.http.delete<HttpResponseData<SupplierDto>>(`${this.baseUrl}/${id}`);
  }

  toggleSupplierStatus(id: number): Observable<HttpResponseData<SupplierDto>> {
    return this.http.patch<HttpResponseData<SupplierDto>>(
      `${this.baseUrl}/${id}/toggle-status`,
      {}
    );
  }
}