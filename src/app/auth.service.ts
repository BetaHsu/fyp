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

  userStatus: any;
  instruction: string = " ";

  signup(username: string, email: string, password: string): any {
    return fetch((environment.apiUrl + "/api/v1/signup"), {
      method: 'POST',
      mode: 'cors',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password, isSigningUp: true })
    })
    .then(async (response) => { // return another promise
      const json = await response.json(); // wait until the Promise:response.json() is done, put into var json
      if (response.ok) { //200-299 (successful)
        json.instruction = "Successfully signed up";
      } else {
        json.instruction = "Failed to sign up"
      }
      return json; //convert response body, JSON-formatted string, to JavaScript object
    })
  }

  signin(username: string, email: string, password: string) {
    return fetch((environment.apiUrl + "/api/v1/signup"), {
      method: 'POST',
      mode: 'cors',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password, isSigningUp: false })
    })
      .then(async (response) => { // return another promise
        // let temp:any = {hi: "beta"};
        // temp.instruction = "sth";
        // Response object contains response body, headers, status code
        const json = await response.json(); // wait until the Promise:response.json() is done, put into var json
        if (response.ok) { //200-299 (successful)
          json.instruction = " ";
        } else {
          json.instruction = "Failed to sign in"
        }
        return json; //convert response body, JSON-formatted string, to JavaScript object
      })
  }

  getInstruction(): string {
    return this.instruction;
  }
}
