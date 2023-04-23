import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-starter',
  templateUrl: './starter.component.html',
  styleUrls: ['./starter.component.css']
})
export class StarterComponent {
  constructor(private router: Router) {
  }

  goToOnboarding(){
    this.router.navigate(['/onboarding']);
  }
  goToHome() { // go to home instead
    this.router.navigate(['']);
  }
}
