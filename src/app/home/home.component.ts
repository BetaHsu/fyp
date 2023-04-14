import { Component,  OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.getAllParagraphId();
  }

  paragraphId1:string = '64213a30f469dbb6b971a5fd';
  paragraphId2:string = '643402a13129325350281be3';
  paragraphId3:string = '64392ea3e1a8bd4d4c3f4269';
  idArray:string[] = [];
  titleArray:string[] = [];
  temp:string[] = [];

  // ------ Flask "GET" : get all paragraph-------------------

  getAllParagraphId() {
    console.log('Getting all paragraph')
    fetch((environment.apiUrl + "/api/v1/get-all-paragraph-id"), {
        method: 'GET',
        mode: 'cors'
    }
    )
    .then((response) => response.json()) 
    // turn json string to JS object
    .then((data => {
      console.log("array of objects w/ _id & title is: " + data)
      this.idArray = data.map((obj: { _id: any }) => obj._id.$oid);
      this.titleArray = data.map((obj: { title: any }) => obj.title);
      console.log(this.idArray);
      console.log(this.titleArray);
    }));
  }

  viewParagraph(paragraphId: string){
    this.router.navigate(['/create-interaction-work', paragraphId]);
  }

  signOut() {
    localStorage.removeItem("userid");
    localStorage.removeItem("username");
    this.router.navigate(['/onboarding']);
  }
  
}
