import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { CustomerDto, CustomerFilterDto } from '../models/customer.interface';
import { HttpResponseData } from '../models/http-response.interface';

export interface PagedCustomerResponse {
  success: boolean;
  responsCode: number;
  message: string;
  data: CustomerDto[];
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
export class CustomerService {
  private customerUrl = environment.APIurl + '/Customer';

  constructor(private http: HttpClient) {}

  getPagedCustomers(filter: CustomerFilterDto): Observable<PagedCustomerResponse> {
    let params = new HttpParams()
      .set('pageNumber', filter.pageNumber.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);
    if (filter.active !== undefined && filter.active !== null)
      params = params.set('active', filter.active.toString());
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);

    return this.http.get<PagedCustomerResponse>(`${this.customerUrl}/paged`, { params });
  }

  getCustomerById(id: number): Observable<HttpResponseData<CustomerDto>> {
    return this.http.get<HttpResponseData<CustomerDto>>(`${this.customerUrl}/${id}`);
  }

  createCustomer(customer: Omit<CustomerDto, 'id'>): Observable<HttpResponseData<CustomerDto>> {
    return this.http.post<HttpResponseData<CustomerDto>>(this.customerUrl, customer);
  }

  updateCustomer(id: number, customer: CustomerDto): Observable<HttpResponseData<CustomerDto>> {
    return this.http.put<HttpResponseData<CustomerDto>>(`${this.customerUrl}/${id}`, customer);
  }

  toggleCustomerStatus(id: number): Observable<HttpResponseData<CustomerDto>> {
    return this.http.patch<HttpResponseData<CustomerDto>>(`${this.customerUrl}/${id}/toggle-status`, {});
  }
}