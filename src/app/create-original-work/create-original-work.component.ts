import { Component, EventEmitter, Output, Input, OnInit  } from '@angular/core';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { environment } from 'src/environments/environment';
import ObjectId from 'bson-objectid';

@Component({
  selector: 'app-create-original-work',
  templateUrl: './create-original-work.component.html',
  styleUrls: ['./create-original-work.component.css']
})
export class CreateOriginalWorkComponent {

  constructor(private router: Router) {

  }
  localStorUsername: any = undefined;
  isLoggedIn = false;
  ngOnInit(): void {
    const username = localStorage.getItem("username");
    const userid = localStorage.getItem("userid");
    
    if (username || userid) {
      this.isLoggedIn = true;
      //redirect to onboarding when not logged in?
      // this.router.navigate(['/onboarding']);
    }
    if(username){
      this.localStorUsername = username;
    }
  }

  isButtonSaveClicked = false;
  isPublished = false;
  entireOriginalInput = '';
  originalSection1 = '';
  originalSection2 = '';
  inputText: string = '';
  inputTextinArray: string[] = [];
  inputTextinArrayWithBreak: string = '';
  selectedTitle = '';

  // var for selcting line to publish
  selectedLineIndex = -1;
  lineSelected = false;
  startIndexofSelected = -1;
  endIndexofSelected = -1;
  sectionBeforeStartIndex = 0;
  sectionBeforeEndIndex = 0;
  sectionBefore: string = " ";
  sectionAfterStartIndex = 0;
  sectionAfterEndIndex = 0;
  sectionAfter: string = " ";
  inputTextinString = "";
  inputValuesRevealed:any;

  newParagraphObjectId: any = " ";
  inputs = [{ value: '' },{ value: '' },{ value: '' }];

  // ------ Flask "POST" : Post Original paragraph -------------------
  publishNewParagraph() {
    console.log("Publish new paragraph.");
    // const objectId = new ObjectId();
    // this.newParagraphObjectId = objectId;
    let paragraph = {
      "title": this.selectedTitle,
      "title_index": this.selectedLineIndex,
      "paragraphArray": this.inputTextinArray,
      "paragraph": this.inputTextinString,
      "id": Date.now().toString(),
      "creator_id": localStorage.getItem('userid'),
      "creator_username": this.localStorUsername,
      "reveal_score_to_public": 0,
      "parallel_sentences": [
        {
          // "id": this.newParagraphObjectId,
          "sentence": this.selectedTitle,
        }
      ],
      "revealed": this.inputValuesRevealed
    }
    this.postParagraph(paragraph);
    this.isPublished = true;
  }

  postParagraph(paragraph: any) {
    console.log('Posting paragraph.')
    fetch((environment.apiUrl + "/api/v1/post-paragraph"), {
      method: 'POST',
      mode: 'cors',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paragraph)
  }
  )
  .then((response) => response.json())
  .then((data => {
    this.newParagraphObjectId = data._id;
    this.postWorkIdToUser(this.newParagraphObjectId, this.localStorUsername);
  }
  ))
  }

   // ------ Flask "POST" : Post work _id to user database -------------------
   postWorkIdToUser(workId: any, userName: any) {
    console.log('Posting work _id to user database.')
    const data = {
      workId: workId,
      userName: userName,
    };
    fetch((environment.apiUrl + "/api/v1/post-work-id-to-user"), {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(data)
    }
    )
    .then((response) => console.log(response))
  }
  
  getInputText(){
    this.inputs.forEach(input => this.inputTextinArray.push(input.value))
    console.log("this.inputTextinArray is: " + this.inputTextinArray);
  }

  onLineClick(index : number) {
    this.selectedLineIndex = index;
    this.lineSelected = true;
    this.selectedTitle = this.inputTextinArray[this.selectedLineIndex];
    this.inputTextinString = this.inputTextinArray.join('')
    console.log("title sentence is" + this.selectedTitle);

    //calculate revealed object
    this.inputValuesRevealed = this.inputTextinArray.map(
      (line: string, i: number) => [{index_interval_start: 0, index_interval_end: line.length, revealed_score: 0}]
    )
    this.inputValuesRevealed[index][0].revealed_score = 1;
  }

  // ------ for input text fields -------
  
  addInput() {
    this.inputs.push({ value: '' });
    // this.inputValues[this.items.indexOf(item)].push('');
  }
  
  removeInput(index: number) {
    this.inputs.splice(index, 1);
    // this.inputValues[this.items.indexOf(item)].splice(index, 1);
  }

  hasValidInputs() {
    const nonEmptyInputs = this.inputs.filter(i => i.value !== '');
    // console.log(nonEmptyInputs.length);
    return nonEmptyInputs.length >= 2;
  }

  enableSaveButton() {
    this.isButtonSaveClicked = true;
  }

  // ------ for routing --------
  goToOwnerView() {
    this.router.navigate(['/create-interaction-work', this.newParagraphObjectId], { queryParams: {fromCreateOriginalWork: true}});
  }

  goToNewComponent(){
    const id = this.newParagraphObjectId;
    this.router.navigate(['/create-interaction-work'], { queryParams: {fromCreateOriginalWork: true}});
  }

  signOut() {
    localStorage.removeItem("userid");
    localStorage.removeItem("username");
    this.router.navigate(['/onboarding']);
  }

  goToHome() { // go to home instead
    this.router.navigate(['']);
  }

  goToOnboarding(){
    this.router.navigate(['/onboarding']);
  }

  goToStarter(){
    this.router.navigate(['/starter']);
  }
}

