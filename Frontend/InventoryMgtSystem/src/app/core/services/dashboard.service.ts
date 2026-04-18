import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { User } from '../models/user.interface';
import { HttpResponseData } from '../models/http-response.interface';
import { DashboardQueryParams, DashboardSummary } from '../models/dashboard.interface';

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


  //#region Dashboard Data Fetching Methods

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
 //#endregion

 //#region Dashboad Summary 
  getDashboardSummary(
    params: DashboardQueryParams = {}
  ): Observable<HttpResponseData<DashboardSummary>> {
 
    let httpParams = new HttpParams();
    if (params.lowStockThreshold != null)
      httpParams = httpParams.set('lowStockThreshold', params.lowStockThreshold);
    if (params.recentUserCount != null)
      httpParams = httpParams.set('recentUserCount', params.recentUserCount);
    if (params.topProductCount != null)
      httpParams = httpParams.set('topProductCount', params.topProductCount);
    if (params.trendDays != null)
      httpParams = httpParams.set('trendDays', params.trendDays);
 
    return this.http.get<HttpResponseData<DashboardSummary>>(
      `${this.dashboard}/summary`,
      { params: httpParams }
    );
  }
 //#endregion
}

