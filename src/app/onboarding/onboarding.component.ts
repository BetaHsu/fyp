import { Component } from '@angular/core';
import { AuthService } from '../auth.service'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent {

  username: string = '';
  email: string = '';
  password: string = '';
  isSigningUp: boolean = true;
  message: string = '';
  errorMessage : string = '';
  signInSuccess = false;
  signUpSuccess = false;
  isErrorMessage = false;
  signInAfterSignUp = false;
  justSignedUp = false;

  constructor(private authService: AuthService, private router: Router) { }

  isLoggedIn = true;
  ngOnInit(): void {
    const username = localStorage.getItem("username");
    const userid = localStorage.getItem("userid");
    
    if (!username || !userid) {
      this.isLoggedIn = false;
      //redirect to onboarding when not logged in?
      // this.router.navigate(['/onboarding']);
    }
  }

  onSubmit(): void {
    // Sign Up
    if (this.isSigningUp) {
      //take instruciton from json result
      this.authService.signup(this.username, this.email, this.password).then((status: {signUpSuccess: boolean; instruction:string}) => {
        if (status.signUpSuccess) {
          this.signUpSuccess = true;
          this.signInAfterSignUp = true;
          this.justSignedUp = true;
        }
        this.errorMessage = status.instruction;
      })
    
    // Sign In
    } else {
      this.authService.signin(this.username, this.email, this.password).then((user: { userid: string; username: string; instruction:string }) => {
        //take iuserid & nstruciton from json result
        if (user.userid) { // if successful
          //so userid can be accessed/used across application in different components and services
          localStorage.setItem("userid", user.userid)
          localStorage.setItem("username", user.username) 
          this.signInSuccess = true;
        } else {
          this.isErrorMessage = true;
        }
        this.errorMessage = user.instruction;
      })
    }

    console.log("button is clicked!")
  }
  toggleSignIn(): void {
    this.isSigningUp = !this.isSigningUp;
  }
  goToCreateOriginalWork() {
    this.router.navigate(['/create-original-work']);
  }
  goToHome() {
    this.router.navigate(['']);
  }
  signOut() {
    localStorage.removeItem("userid");
    localStorage.removeItem("username");
    this.router.navigate(['/onboarding']);
  }
  temporarilyHideItself() {
    this.signInAfterSignUp = false
  }
}

