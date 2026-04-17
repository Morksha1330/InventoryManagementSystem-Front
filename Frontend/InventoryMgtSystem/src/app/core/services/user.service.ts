import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AddUserDto, User } from '../models/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
private readonly apiUrl = environment.APIurl
    private baseUrl = environment.APIurl + '/Auth';
    private homeUrl = environment.APIurl + '/Home';


  constructor(private http: HttpClient) { }

  // Add new User
  // addUser(UserData: AddUserDto): Observable<User> {
  //   return this.http.post<User>(this.apiUrl, UserData);
  // }

  addUser(UserData: AddUserDto): Observable<User> {
    console.log('Adding user with data:', UserData);
    console.log('API URL:', `${this.baseUrl}/register`);
    return this.http.post<User>(`${this.baseUrl}/register`, UserData);
  }

  // Get all Users (optional)
  getUsers(): Observable<User[]> {
    // return this.http.get<User[]>(this.apiUrl);
    return this.http.get<User[]>(`${this.homeUrl}/Users`);
  }

  // Get User by id (optional)
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // Update User (optional)
  updateUser(id: number, UserData: AddUserDto): Observable<User> {
    return this.http.put<User>(`${this.homeUrl}/${UserData.id}`, UserData);
  }

  // Delete User (optional)
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
