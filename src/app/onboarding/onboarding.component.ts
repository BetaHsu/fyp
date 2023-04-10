import { Component } from '@angular/core';
import { AuthService } from '../auth.service'; 

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent {
  email: string = '';
  password: string = '';
  isSigningUp: boolean = true;
  message: string = '';

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    // Sign Up
    if (this.isSigningUp) {
      this.authService.signup(this.email, this.password)
        .subscribe(
          response => {
            this.message = response.message;
          },
          error => {
            this.message = error.error.message;
          }
        );
    // Sign In
    } else {
      this.authService.signin(this.email, this.password)
        .subscribe(
          response => {
            this.message = response.message;
          },
          error => {
            this.message = error.error.message;
          }
        );
    }
  }
  toggleSignIn(): void {
    this.isSigningUp = !this.isSigningUp;
  }
}

