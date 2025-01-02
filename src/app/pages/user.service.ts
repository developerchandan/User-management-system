import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';


@Injectable({
  providedIn: 'root',
})
export class UserService {

  private apiURLUsers = environment.apiUrl + 'user';

  constructor(private http: HttpClient) {}

  getUserList(page: number = 1, pageSize: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get(`${this.apiURLUsers}/list`, { params });
  }

  getUserById(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiURLUsers}/list/${userId}`);
  }
  addUser(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiURLUsers}/add`, userData);
  }
  updateUser(userId: string, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiURLUsers}/update/${userId}`, userData);
  }
  updateUserStatus(id: string, status: string) {
    return this.http.put(`${this.apiURLUsers}/update-status/${id}`, { status });
  }
}
