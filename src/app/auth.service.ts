import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

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


  signup(email: string, password: string): any {
    return fetch((environment.apiUrl + "/api/v1/signup"), {
      method: 'POST',
      mode: 'cors',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, isSigningUp: true })
    })
      .then((response) => response.json())

  }

  signin(email: string, password: string): any {
    return fetch((environment.apiUrl + "/api/v1/signup"), {
      method: 'POST',
      mode: 'cors',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, isSigningUp: false })
    })
      .then((response) => response.json())
  }
}
