// src/app/core/services/user.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import {
  AddUserDto,
  PagedUsersResponse,
  User,
  UserFilterDto,
} from '../models/user.interface';
import { HttpResponseData } from '../models/http-response.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = environment.APIurl;
  private baseUrl = environment.APIurl + '/Auth';
  private homeUrl = environment.APIurl + '/Home';
  private userUrl = environment.APIurl + '/User';

  constructor(private http: HttpClient) {}

  /** Get paginated users with filters */
  getPagedUsers(filter: UserFilterDto): Observable<PagedUsersResponse> {
    let params = new HttpParams()
      .set('pageNumber', filter.pageNumber.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);
    if (filter.roleId != null) params = params.set('roleId', filter.roleId.toString());
    if (filter.active != null) params = params.set('active', filter.active.toString());
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);

    return this.http.get<PagedUsersResponse>(`${this.userUrl}/paged`, { params });
  }

  /** Get single user by ID */
  getUserById(id: number): Observable<HttpResponseData<User>> {
    return this.http.get<HttpResponseData<User>>(`${this.userUrl}/${id}`);
  }

  /** Register / create a new user */
  addUser(userData: AddUserDto): Observable<HttpResponseData<User>> {
    console.log('Adding user with data:', userData);
    return this.http.post<HttpResponseData<User>>(`${this.baseUrl}/register`, userData);
  }

  /** Update existing user */
  updateUser(id: number, userData: AddUserDto): Observable<HttpResponseData<User>> {
    console.log('Updating user with ID:', id, 'Data:', userData);
    return this.http.put<HttpResponseData<User>>(`${this.userUrl}/${id}`, userData);
  }

  /** Delete user */
  deleteUser(id: number): Observable<HttpResponseData<void>> {
    return this.http.delete<HttpResponseData<void>>(`${this.userUrl}/${id}`);
  }

  /** Toggle active / inactive */
  toggleUserStatus(id: number): Observable<HttpResponseData<User>> {
    return this.http.patch<HttpResponseData<User>>(`${this.userUrl}/${id}/toggle-status`, {});
  }

  // ── legacy helpers kept for backward-compat ──────────────────────────────

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.homeUrl}/Users`);
  }
}