import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginData {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getDistricts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/districts/`);
  }

  getDistrictById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/districts/${id}/`);
  }

  login(data: LoginData): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login/`, data);
  }
}