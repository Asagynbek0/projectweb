import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Station {
  id: number;
  name: string;
  aqi?: number;
  status?: string;
  district?: string;
}

export interface Reading {
  id: number;
  station: number;
  station_name: string;
  aqi: number;
  pm25: number | null;
  pm10: number | null;
  no2: number | null;
  o3: number | null;
  co: number | null;
  category: string;
  recorded_at: string;
  source?: string;
}


export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getStations(): Observable<Station[]> {
    return this.http.get<Station[]>(`${this.baseUrl}/stations/`);
  }

  getReadings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/readings/`);
  }

  getReadingsByStation(stationId: number): Observable<Reading[]> {
  return this.http.get<Reading[]>(`${this.baseUrl}/readings/?station=${stationId}`);
  }

  getAirSummary(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/air-summary/`);
  }

  login(data: LoginData): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login/`, data);
  }

  register(data: RegisterData): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register/`, data);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/logout/`, {});
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/me/`);
  }
}