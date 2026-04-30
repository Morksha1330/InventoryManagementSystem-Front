import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment.development';
import { LoginRequest, LoginResponse } from '../models/auth.interface';
import { User } from '../models/user.interface';
import { HttpResponseData } from '../models/http-response.interface';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private baseUrl = environment.APIurl + '/Auth';
    private readonly TOKEN_KEY = 'auth_token';

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    private tokenSubject = new BehaviorSubject<string | null>(null);

    public currentUser$ = this.currentUserSubject.asObservable();
    public isAuthenticated$ = this.currentUser$.pipe(map(user => !!user));

    constructor(
        private http: HttpClient,
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: any
    ) {
        this.loadTokenFromStorage();
    }

    //#region Token & Cookie Management
    private getStoredToken(): string | null {
        if (!isPlatformBrowser(this.platformId)) return null;
        return this.getCookie(this.TOKEN_KEY) || localStorage.getItem(this.TOKEN_KEY);
    }

    private getCookie(name: string): string | null {
        if (!isPlatformBrowser(this.platformId)) return null;
        const match = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith(name + '='));
        return match ? match.split('=')[1] : null;
    }

    private setCookie(name: string, value: string, days: number = 7): void {
        if (!isPlatformBrowser(this.platformId)) return;
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${value};expires=${expires};path=/;secure;samesite=strict`;
    }

    private deleteCookie(name: string): void {
        if (!isPlatformBrowser(this.platformId)) return;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/`;
    }
    //#endregion

    //#region Token Decode & User Management
    private isTokenExpired(token: string): boolean {
        try {
            const decoded: any = jwtDecode(token);
            return decoded.exp < Math.floor(Date.now() / 1000);
        } catch {
            return true;
        }
    }

    private loadUserFromToken(token: string): void {
        try {
            const decoded: any = jwtDecode(token);
            const user: User = {
                id: decoded.id || decoded.Id,
                username: decoded.username || decoded.Username || decoded.unique_name,
                name: decoded.name || decoded.Name || decoded.firstName,
                email: decoded.email || decoded.Email,
                role: decoded.role || decoded.Role,
                epF_No: decoded.epF_No || decoded.EPF_No,
                active: decoded.active || decoded.Active,
                status: undefined,
                phone: '',
                Activebool: decoded.active === 'true' || decoded.active === true
            };
            this.currentUserSubject.next(user);
        } catch (error) {
            console.error('Error loading user from token:', error);
            this.clearAuth();
        }
    }

    private loadTokenFromStorage(): void {
        const token = this.getStoredToken();
        if (token && !this.isTokenExpired(token)) {
            this.tokenSubject.next(token);
            this.loadUserFromToken(token);
        } else {
            this.clearAuth();
        }
    }
    //#endregion

    //#region API Calls
    login(credentials: LoginRequest): Observable<HttpResponseData<LoginResponse>> {
        return this.http.post<HttpResponseData<LoginResponse>>(
            `${this.baseUrl}/login`,
            credentials
        ).pipe(
            map(response => {
                if (response.success && response.result?.token) {
                    this.setAuth(response.result.token, response.result.user);
                }
                return response;
            })
        );
    }

    register(userData: any): Observable<HttpResponseData<any>> {
        return this.http.post<HttpResponseData<any>>(`${this.baseUrl}/register`, userData);
    }

    changePassword(passwordData: any): Observable<HttpResponseData<any>> {
        return this.http.post<HttpResponseData<any>>(`${this.baseUrl}/change`, passwordData);
    }
    //#endregion

    //#region Auth Helpers
    private setAuth(token: string, user: any): void {
        if (isPlatformBrowser(this.platformId)) {
            this.setCookie(this.TOKEN_KEY, token, 7);
            localStorage.setItem(this.TOKEN_KEY, token);
        }
        this.tokenSubject.next(token);
        
        // Map user from response to User interface
        const mappedUser: User = {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.roleName,
            epF_No: user.epF_No,
            active: user.active,
            status: undefined,
            phone: '',
            Activebool: user.active === 'true' || user.active === true
        };
        this.currentUserSubject.next(mappedUser);
    }

    logout(): void {
        this.clearAuth();
        this.router.navigate(['/auth']);
    }

    private clearAuth(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.deleteCookie(this.TOKEN_KEY);
            localStorage.removeItem(this.TOKEN_KEY);
        }
        this.tokenSubject.next(null);
        this.currentUserSubject.next(null);
    }

    getToken(): string | null { 
        return this.tokenSubject.value; 
    }
    
    getCurrentUserValue(): User | null { 
        return this.currentUserSubject.value; 
    }
    //#endregion

    //#region Role Checks
    hasRole(role: string): boolean {
        const user = this.getCurrentUserValue();
        if (!user) return false;
        
        // Convert role to string if it's number
        const userRole = user.role?.toString();
        const requiredRole = role.toString();
        
        return userRole === requiredRole;
    }

    hasAnyRole(roles: string[]): boolean {
        const user = this.getCurrentUserValue();
        if (!user) return false;
        
        const userRole = user.role?.toString();
        return roles.some(role => userRole === role.toString());
    }

    canAccess(requiredRole: string): boolean {
        const user = this.getCurrentUserValue();
        if (!user) return false;
        
        // Define role hierarchy (adjust numbers based on your role levels)
        const roleHierarchy: Record<string, number> = { 
            'User': 1, 
            'Operator': 2, 
            'Manager': 3, 
            'Admin': 4 
        };
        
        const userRoleLevel = roleHierarchy[user.role?.toString()] || 0;
        const requiredRoleLevel = roleHierarchy[requiredRole.toString()] || 0;
        
        return userRoleLevel >= requiredRoleLevel;
    }
    //#endregion
}