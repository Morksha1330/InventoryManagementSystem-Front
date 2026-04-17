import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { LoginRequest, LoginResponse } from '../models/auth.interface';
import { User } from '../models/user.interface';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private baseUrl = environment.APIurl + '/Auth';

    constructor(private http: HttpClient) { }

    // login method here
    login(data: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(
            `${this.baseUrl}/login`,
            data
        ).pipe(
            tap(res => {
                if (res?.result?.token) {
                    this.setToken(res.result.token);
                }
            })
        );
    }

    // TOKEN STORAGE
    setToken(token: string) {
        localStorage.setItem('token', token);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    // 🚪 LOGOUT
    logout() {
        localStorage.removeItem('token');
    }

    // ✅ CHECK LOGIN
    isLoggedIn(): boolean {
        return !!this.getToken();
    }

     // Get all Users (optional)
    getUsers(): Observable<User[]> {
        // return this.http.get<User[]>(this.apiUrl);
        return this.http.get<User[]>(`${this.baseUrl}/Users`);
      }
    
    
}
