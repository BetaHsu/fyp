import { Component, EventEmitter, Output, Input, OnInit  } from '@angular/core';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-create-original-work',
  templateUrl: './create-original-work.component.html',
  styleUrls: ['./create-original-work.component.css']
})
export class CreateOriginalWorkComponent {

  constructor(private router: Router) {

  }
  localStorUsername: any = undefined;
  ngOnInit(): void {
    const temp = localStorage.getItem("username")
    if(temp){
      this.localStorUsername = temp;
    }
  }

  isButtonSaveClicked = false;
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

  // ------ Flask "POST" : Post paragraph -------------------
  publishNewParagraph() {
    console.log("Publish new paragraph.");
    let paragraph = {
      "title": this.selectedTitle,
      "title_interval_start": this.startIndexofSelected,
      "title_interval_end": this.endIndexofSelected,
      "paragraph": this.inputTextinArrayWithBreak,
      "id": Date.now(),
      "creator_id": localStorage.getItem('userid'),
      "parallel_sentences": [
        this.selectedTitle
      ],
      "revealed": [
          {
              "index_interval_start": this.sectionBeforeStartIndex,
              "index_interval_end": this.sectionBeforeEndIndex,
              "revealed_score": 0,
          },
          {
              "index_interval_start": this.startIndexofSelected,
              "index_interval_end": this.endIndexofSelected,
              "revealed_score": 1,
          },
          {
            "index_interval_start": this.sectionAfterStartIndex,
            "index_interval_end": this.sectionAfterEndIndex,
            "revealed_score": 0,
          }
      ]
  }
    this.postParagraph(paragraph);
  }
  postParagraph(paragraph: any) {
    console.log('Posting paragraph.')
    fetch((environment.apiUrl + "/api/v1/post-paragraph"), {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(paragraph)
  }
  )
  .then((response) => console.log(response))
  }

  goToNewComponent(){
    this.router.navigate(['/create-interaction-work']);
  }

  enableSaveButton() {
    this.isButtonSaveClicked = true;
  }

  getInputText(){
    this.inputTextinArray = this.inputText.split('\n');
    console.log("entire input text is: " + this.inputTextinArray);
  }

  onLineClick(index : number) {
    this.selectedLineIndex = index;
    this.lineSelected = true;
    this.selectedTitle = this.inputTextinArray[this.selectedLineIndex];
    this.inputTextinArrayWithBreak = this.inputTextinArray.join('<br>')

    console.log("title sentence is" + this.selectedTitle);
    console.log("type of inputTextinArray is: " + typeof this.inputTextinArray);
    console.log("type of inputTextinArrayWithBreak is: " + typeof this.inputTextinArrayWithBreak);

    this.startIndexofSelected = this.inputTextinArrayWithBreak.indexOf(this.selectedTitle);
    this.endIndexofSelected = this.startIndexofSelected + this.selectedTitle.length -1;

    this.sectionBeforeStartIndex = 0;
    this.sectionBeforeEndIndex = this.startIndexofSelected - 1;
    this.sectionBefore = this.inputTextinArrayWithBreak.slice(this.sectionBeforeStartIndex, this.sectionBeforeEndIndex + 1);
    this.sectionAfterStartIndex = this.endIndexofSelected + 1;
    this.sectionAfterEndIndex = this.inputTextinArrayWithBreak.length - 1;
    this.sectionAfter = this.inputTextinArrayWithBreak.slice(this.sectionAfterStartIndex, this.sectionAfterEndIndex + 1);
  }

  goToOwnerView() {
    this.router.navigate(['/create-interaction-work'], { queryParams: {fromCreateOriginalWork: true}})
  }

  signOut() {
    localStorage.removeItem("userid");
    localStorage.removeItem("username");
    this.router.navigate(['/onboarding']);
  }
}

