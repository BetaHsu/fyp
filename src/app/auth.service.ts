import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface AuthResponse {
  // define the shape of the response from the API
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // private baseUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) { }

  signup(email: string, password: string): Observable<AuthResponse> {
    // make HTTP POST requests to /api/signup endpoints of  Flask backend API
    // passing in the email and password parameters as JSON in the request body
    return this.http.post<AuthResponse>('/api/signup', { email, password });
  }

  signin(email: string, password: string): Observable<AuthResponse> {
    // make HTTP POST requests to /api/signin endpoints of  Flask backend API
    // passing in the email and password parameters as JSON in the request body
    return this.http.post<AuthResponse>('/api/signin', { email, password });
  }
}
