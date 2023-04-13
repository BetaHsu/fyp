import { Component } from '@angular/core';
import { AuthService } from '../auth.service'; 

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

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    // Sign Up
    if (this.isSigningUp) {
      //take instruciton from json result
      this.authService.signup(this.username, this.email, this.password).then(({instruction}:any) => {
        this.errorMessage = instruction;
      })
    
    // Sign In
    } else {
      this.authService.signin(this.username, this.email, this.password).then((user: { userid: string; instruction:string }) => {
        //take iuserid & nstruciton from json result
        if (user.userid) {
          //so userid can be accessed/used across application in different components and services
          localStorage.setItem("userid", user.userid)
          // localStorage.removeItem("userid") 
          // localStorage.setItem("username", user.name) 
          // const temp = localStorage.getItem("userid")
          // if(temp){
          //   this.currentUserId = temp
          // }
          
        }
        this.errorMessage = user.instruction;
      })
    }
  }
  toggleSignIn(): void {
    this.isSigningUp = !this.isSigningUp;
  }
}

