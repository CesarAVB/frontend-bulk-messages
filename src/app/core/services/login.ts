import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly loginUrl = environment.loginUrl;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    const payload: LoginRequest = { email, password };
    return this.http.post<LoginResponse>(this.loginUrl, payload);
  }
}
