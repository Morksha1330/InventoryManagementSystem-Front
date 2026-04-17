import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { User } from '../models/user.interface';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  [x: string]: any;
  private readonly apiUrl = environment.APIurl
    private baseUrl = environment.APIurl + '/Auth';
    private homeUrl = environment.APIurl + '/Home';
    private dashboard = environment.APIurl + '/Dashboard';


  constructor(private http: HttpClient) { }

TotalUserCount(): Observable<number> {
    return this.http.get<number>(`${this.dashboard}/UserCount`);
  }

TotalProductCount(): Observable<number> {
    return this.http.get<number>(`${this.dashboard}/ProductCount`);
  }

TotalCategoryCount(): Observable<number> {
    return this.http.get<number>(`${this.dashboard}/CategoryCount`);
  }

TotalCustomerCount(): Observable<number> {
    return this.http.get<number>(`${this.dashboard}/customerCount`);
  }

TotalSalesCount(): Observable<number> {
    return this.http.get<number>(`${this.dashboard}/totalSales`);
  }

TotalExpenseCount(): Observable<number> {
    return this.http.get<number>(`${this.dashboard}/totalExpenses`);
  }

TopSellingProducts(): Observable<string> {
    return this.http.get<string>(`${this.dashboard}/TopSellingProd`,
      {responseType: 'text' as 'json'}
    );
  }

}