import { Component,  OnInit, ChangeDetectorRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  localStorUsername: any = undefined;

  isLoggedIn = true;
  ngOnInit(): void {
    const username = localStorage.getItem("username");
    const userid = localStorage.getItem("userid");
    
    if (!username || !userid) {
      this.isLoggedIn = false;
      //redirect to onboarding when not logged in?
      // this.router.navigate(['/onboarding']);
    }

    if(username){
      this.localStorUsername = username;
    }

    Promise.all([
      this.getAllParagraphId(), 
      this.isLoggedIn ? this.getUserWorks(this.localStorUsername) : Promise.resolve()
    ])
    .then(() => {
      if(this.isLoggedIn) {
        this.getUserRestriction();
      }
    })

    console.log("isWho is:" + this.isWho)
  }

  paragraphId1:string = '64213a30f469dbb6b971a5fd';
  paragraphId2:string = '643402a13129325350281be3';
  paragraphId3:string = '64392ea3e1a8bd4d4c3f4269';
  idArray:string[] = [];
  titleArray:string[] = [];
  parallelSentencesArray:string[][] = [];
  revealScoreToPublicArray:string[] = [];
  temp:string[] = [];

  // ------ Flask "GET" : get all paragraph-------------------

  getAllParagraphId() {
    console.log('Getting all paragraph')
    return fetch((environment.apiUrl + "/api/v1/get-all-paragraph-id"), {
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
      this.parallelSentencesArray = data.map((obj: { parallel_sentences: any[] }) => 
        obj.parallel_sentences.map((idObj: { id: string }) => idObj.id)
      );
      this.parallelSentencesArray = data.reduce((acc: any[], obj: { parallel_sentences: any[] }) => {
        const sentences = obj.parallel_sentences.map((sentObj: {id: string})=>sentObj.id);
        acc.push(sentences);
        return acc;
      }, []);
      this.revealScoreToPublicArray = data.map((obj: { reveal_score_to_public: any }) => obj.reveal_score_to_public);
      // console.log("idArray is:" + this.idArray);
      // console.log("titleArray is:" + this.titleArray);
      // console.log("parallelSentencesArray[0] is:" + this.parallelSentencesArray[0]);
      // console.log("parallelSentencesArray[0][2] is:" + this.parallelSentencesArray[0][2]);
      // console.log("parallelSentencesArray is:" + this.parallelSentencesArray);
    }));
  }

  // ------ Flask "GET" : Get user works -------------------
  userWorks:string[]=[];
  getUserWorks(username: string) {
    console.log('Getting User work ids')
    return fetch((environment.apiUrl + "/api/v1/get-user-works/" + username), {
        method: 'GET',
        mode: 'cors'
    }
    )
    .then((response) => response.json()) 
    .then(data => {
      this.userWorks = data as string[];
    });
  }

  // correspond to views = ['Owner', 'Community','Interaction'];
  can_access_views = [true, false, false];
  canAccessView:string[] = [];
  isWho:boolean[][] = [];
  getUserRestriction() {
    console.log("getUserRestriction calling")
    for (let i = 0; i < this.parallelSentencesArray.length; i++) {
      if (this.userWorks.includes(this.idArray[i])){ 
        // is owner
        this.canAccessView[i] = "Owner";
        this.isWho[i] = [true, false, false]; // ['Owner', 'Community', 'Interaction']
      } else if (this.parallelSentencesArray[i].some(element => this.userWorks.includes(element))) { 
        // is community member
        this.canAccessView[i] = "Community";
        this.isWho[i] = [false, true, false]; // ['Owner', 'Community', 'Interaction']
      } else { // is general public
        this.canAccessView[i] = "Interaction";
        this.isWho[i] = [false, false, true]; // ['Owner', 'Community', 'Interaction']
      }
    }
    this.cdr.detectChanges();
    console.log(this.canAccessView);
  }

  viewParagraph(paragraphId: string){
    this.router.navigate(['/create-interaction-work', paragraphId], {queryParams: {myVar: 2}});
  }

  signOut() {
    localStorage.removeItem("userid");
    localStorage.removeItem("username");
    this.router.navigate(['/onboarding']);
  }

  onClickOwner(paragraphId: string) {
    this.router.navigate(['/create-interaction-work', paragraphId], {queryParams: {myVar: 3}});
  }
  onClickCommunity(paragraphId: string) {
    this.router.navigate(['/create-interaction-work', paragraphId], {queryParams: {myVar: 1}});
  }
  onClickInteraction(paragraphId: string) {
    this.router.navigate(['/create-interaction-work', paragraphId], {queryParams: {myVar: 0}});
  }
  goToOnboarding(){
    this.router.navigate(['/onboarding']);
  }
  goToCreateOriginal(){
    this.router.navigate(['/create-original-work']);
  }

  goToStarter(){
    this.router.navigate(['/starter']);
  }
}
