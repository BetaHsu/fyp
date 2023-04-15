import { Component, EventEmitter, Output, Input, OnInit} from '@angular/core';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import ObjectId from 'bson-objectid';
// import { Promise } from 'es6-promise';

@Component({
  selector: 'app-create-interaction-work',
  templateUrl: './create-interaction-work.component.html',
  styleUrls: ['./create-interaction-work.component.css'],
})
export class CreateInteractionWorkComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {

  }
  // Initialize: load paragraph database & check if route from create-original-work page 
  // & get username from local storage
  ngOnInit(): void {
    const currentParagraphId = this.route.snapshot.params['id'];
    console.log("currentParagraphId is: " + currentParagraphId);
    this.route.queryParams.subscribe(params => {
      if (params['fromCreateOriginalWork'] === 'true') {
        this.view = 3;
      }
    })
    const currentUsername = localStorage.getItem("username")
    if(currentUsername){
      this.localStorUsername = currentUsername;
    }
    this.getParagraph(currentParagraphId);
    this.getUserWorks(this.localStorUsername);
  }

  title = 'fyp';
  user: string | undefined = undefined;
  i = 0;
  localStorUsername: any = undefined;

  // var for GET paragraphs from database
  originalParagraphId: any = undefined;
  paragraph: any = undefined; //entire paragraph database
  currentTitle: string = " "; //current paragraph title
  originalCreator: any = undefined;
  currentRevealScoreToPublic = 0;
  allParallel: any = undefined; //entire parallel Object, not .sentence
  currentId: string = " ";

  // var for drop down list to change view
  view = 0;
  views = ['Interaction', 'Community', 'Public', 'Owner'];
  dropdownActive = false;
  isButtonSaveClicked = false;

  // var for restriction views
  getUserWorksReady = false;
  userWorks:string[]=[];
  allParallelSentencesSent : string[] = [];
  allParallelSentencesId : string[] = [];
  can_access_views = [true, false, true, false];

  // var for Drag and Drop input fields
  input: string = " ";
  displayVal= '';
  displayTitle = '';
  rewritingSection1 = '';
  rewritingSection2 = '';
  sorted = false;
  inputTextResorted : string[] = [];
  inputTextResortedWithBreak: string = " "; // resorted text w/ <br> in between each lines as one single string
  // inputTextResortedInLines : string[][] = []; //an array of arrays of strings
  disabledItemId = 'text2';
  items = [
    { id: 'text1', rows: '6',  placeholder: 'Enter 1st section of rewriting work', text: this.rewritingSection1, disabled: false  },
    { id: 'text2', rows: '2',  text: this.currentTitle, disabled: true },
    { id: 'text3', rows: '6',  placeholder: 'Enter 2nd section of rewriting work', text: this.rewritingSection2, disabled: false }
  ];

  // var for selcting line to publish
  selectedLineIndex = -1;
  lineSelected = false;
  nextSentenceForParallel = '';
  startIndexofSelected = -1;
  endIndexofSelected = -1;
  sectionBeforeStartIndex = 0;
  sectionBeforeEndIndex = 0;
  sectionBefore: string = " ";
  sectionAfterStartIndex = 0;
  sectionAfterEndIndex = 0;
  sectionAfter: string = " ";

  entireParagraphWithBreak: any = undefined; // paragraph.paragraph in the database itself is already w/ break
  entireParagraphWithoutBreak: any = undefined; // remove <br> from paragraph.paragraph
  entireParagraphWithSpanBreak: any = undefined; // for displaying paragraph w/ hidden or visible score
  output: string = '';
  @Output() viewSelected = new EventEmitter<string>();

  newParagraphId: any = " ";

  // var for testing revealing & hidding sections of paragraph
  fullParagraph : any = undefined;
  metadata = [
    { index_interval_start: 0, index_interval_end: 45, revealed_score: 1 },
    { index_interval_start: 45, index_interval_end: 80, revealed_score: 0 }
  ];

  interactionInstruction1 = "Create rewriting of the piece using title sentence";

  testAPI() {
    fetch((environment.apiUrl + "/api/test"), {
      method: 'GET',
      mode: 'cors'
    })
    .then((response) => response.json).then((json) => console.log(json))
  }

  // ------ Notes: ------------
  // User Database: id is ['_id'] from MongoDB ObjectId
  // Paragraph Database: id is ['_id'] from MongoDB ObjectId & another no-use ['id'] from dateTime just in case 
  // LocalStorage store creator id & username once sign in, check from Inspect->Application->LocalStorage
  
  // ------ Flask "GET" : Get user works -------------------
  getUserWorks(username: string) {
    console.log('Getting User work ids')
    fetch((environment.apiUrl + "/api/v1/get-user-works/" + username), {
        method: 'GET',
        mode: 'cors'
    }
    )
    .then((response) => response.json()) 
    .then(data => {
      this.userWorks = data as string[];
      this.getUserWorksReady = true;
      // console.log("user's works is" + this.userWorks);

      // return this.userWorks;
    });
  }

  // ------ Flask "GET" : get paragraph-------------------

  getParagraph(paragraphId: string) {
    console.log('Getting paragraph')
    fetch((environment.apiUrl + "/api/v1/get-paragraph/" + paragraphId), {
        method: 'GET',
        mode: 'cors'
    }
    )
    .then((response) => response.json()) 
    .then((data => {
      this.paragraph = data;
      this.allParallelSentencesSent = data.parallel_sentences.map((obj: {id:string, sentence:string})=> obj.sentence);
      this.allParallelSentencesId = data.parallel_sentences.map((obj: {id:string, sentence:string})=> obj.id);
      this.currentId = this.route.snapshot.params['id'];
      // console.log("currentId is:" + this.currentId);
      console.log("allParallelSentences sentence are:" + this.allParallelSentencesSent);
      this.allParallel = data.parallel_sentences; // entire parallel_sentences Object, no use for now
      this.generateParagraph();
      this.items[1].text = this.currentTitle = data.title;
      this.originalParagraphId = data._id;  
      // if (this.getUserWorksReady) {
        this.getUserRestriction();
      // }
      // return this.allParallelSentencesId;
    }));
  }

  // Promise.all([getUserWorks(this.localStorUsername), getParagraph(this.route.snapshot.params['id'])])
  //   .then(() => {
  //     getUserRestriction();
  //   })
  

  generateParagraph() {
    // if revealed score 1 show (start~end) text, if reveal score 0 hide (start~end) rect boxes
    console.log("Generating paragraph")
    let text = this.paragraph.paragraph;

    if (this.paragraph.revealed) {
      this.paragraph.revealed.forEach((data: { index_interval_start: number, index_interval_end: number, revealed_score: number }) => {
        this.output += '<span class=' + (data.revealed_score ? "substring--visible" : "substring--hidden") + '>' 
        + text.substring(data.index_interval_start, data.index_interval_end) + '</span>'
      })
    }
    this.entireParagraphWithBreak = text;
    this.entireParagraphWithoutBreak = text.replace(/<br>/g, '')
    this.entireParagraphWithSpanBreak = this.output;
    this.currentRevealScoreToPublic = this.paragraph.reveal_score_to_public;
    this.originalCreator = this.paragraph.creator_username;
    console.log("entireParagraphWithoutBreak is: " + this.entireParagraphWithoutBreak);
    console.log("entireParagraphWithSpanBreak is: " + this.entireParagraphWithSpanBreak);
    // this.entireParagraphWithBreak = text.replace(/([.,;?!])(\s|$)/g, '$1<br>');
    // this.entireParagraphWithSpanBreak = this.output.replace(/([.,;?!])(\s|$)/g, '$1<br>');
  }

  // corresponded to change views = ['Interaction', 'Community', 'Public', 'Owner'];
  getUserRestriction() {
    if (this.getUserWorksReady) {
      console.log("this.userWork is:" + this.userWorks);
      console.log("this.currentId is:" + this.currentId);
      console.log("this.allParallelSentencesId is:" + this.allParallelSentencesId);
      if (this.userWorks.includes(this.currentId)){ 
        // is owner
        this.can_access_views = [false, false, true, true];
        console.log("is owner!")
      } else if (this.allParallelSentencesId.some(element => this.userWorks.includes(element))) { 
        // is community member
        this.can_access_views = [false, true, true, false];
        console.log("is community member!")
      } else { // is general public
        this.can_access_views = [true, false, true, false];
        console.log("is public!")
      }
    }
  }
  
  // ------ Flask "POST" : Post paragraph -------------------
  publishNewParagraph() {
    console.log("Publish new paragraph.");
    // console.log(this.inputTextResorted);
    const { ObjectId } = require('bson');
    const objectId = new ObjectId();
    this.newParagraphId = objectId;
    let paragraph = {
      "title": this.nextSentenceForParallel,
      "title_interval_start": this.startIndexofSelected,
      "title_interval_end": this.endIndexofSelected,
      "paragraph": this.inputTextResorted.join('<br>'),
      "_id": this.newParagraphId,
      "id": Date.now().toString(),
      "creator_id": localStorage.getItem('userid'),
      "creator_username": this.localStorUsername,
      "reveal_score_to_public": 0,
      "parallel_sentences": [
        {
          "id": this.newParagraphId,
          "sentence": this.nextSentenceForParallel,
        }
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
    this.postSentenceToParallel(this.originalParagraphId, this.newParagraphId, this.nextSentenceForParallel);
    this.postWorkIdToUser(this.newParagraphId, this.localStorUsername);
  }

  postParagraph(paragraph: any) {
    console.log('Posting paragraph.')
    fetch((environment.apiUrl + "/api/v1/post-paragraph"), {
      method: 'POST',
      mode: 'cors',
      // headers: {
      //   "Content-Type": "application/json",
      // },
      body: JSON.stringify(paragraph)
  }
  )
  .then((response) => console.log(response))
  }

  // ------ Flask "POST" : Post sentence to parallel -------------------

  postSentenceToParallel(originalParagraphId:any, newParagraphId:any, sentence: any) {
    console.log('Posting sentence to parallel.')
    const data = {
      originalParagraphId: originalParagraphId,
      newParagraphId: newParagraphId,
      sentence: sentence
    };
    fetch((environment.apiUrl + "/api/v1/post-sentence-to-parallel"), {
      method: 'POST',
      mode: 'cors',
      // headers: {
      //   "Content-Type": "application/json",
      // },
      body: JSON.stringify(data)
    }
  )
  .then((response) => console.log(response))
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

  // ------ DropDown for different views -------------------

  toggleDropdown() {// Toggle the dropdown
    this.dropdownActive = !this.dropdownActive;
    console.log(this.dropdownActive);
  }
  setView(newView: number) { // Close the dropdown & update view
    this.dropdownActive = false;
    this.view = newView;
  }
  changetoPublishView() {
    this.view = 1;
  }
  changetoInteractionView() {
    this.view = 0;
  }
  getTitle(val:string) {
    this.displayTitle = val;
  }

  // ------ Resortable input fields --------------------------------

  drop(event: CdkDragDrop<any[]>) {
    const draggedItem = this.items[event.previousIndex];
    const targetItem = this.items[event.currentIndex];
    const movedItem = this.items[event.previousIndex];
    if (movedItem.disabled) {
      return;
    }
    // Remove the dragged item from the array
    this.items.splice(event.previousIndex, 1);
    // Insert the dragged item at the target index
    this.items.splice(event.currentIndex, 0, draggedItem);

    moveItemInArray(this.items, event.previousIndex, event.currentIndex);

    // If target item is defined, swap properties of dragged <->> target item
    if (targetItem) {
      // swap text value
      const tempText = draggedItem.text;
      draggedItem.text = targetItem.text;
      targetItem.text = tempText;
      // swap rows
      const temprows = draggedItem.rows;
      draggedItem.rows = targetItem.rows;
      targetItem.rows = temprows;
      // swap placeholder
      const tempPlaceholder = draggedItem.placeholder;
      draggedItem.placeholder = targetItem.placeholder;
      targetItem.placeholder = tempPlaceholder;
      // swap disabled property
      const tempDisabled = draggedItem.disabled;
      draggedItem.disabled = targetItem.disabled;
      targetItem.disabled = tempDisabled;
    }
    this.sorted = true;
  }

  // if click button, get resorted texts, update button
  getSortedItems() {
    // iterate through items[], create inputTextResorted[] containing only text property of each object
    // numbers of elements in inputTextResorted[] = number of lines of user input rewriting work 
    this.inputTextResorted = this.items.map(item => item.text).join('\n').split('\n');
    this.inputTextResortedWithBreak = this.inputTextResorted.join('<br>')
    // this.inputTextResortedInLines = this.items.map(item => item.text.split('\n'));
    // this.inputTextResortedInOneString = this.inputTextResortedInLines.flatMap(lines => lines).join('\n');

    this.items[0].disabled = this.items[1].disabled = this.items[2].disabled = true;
    this.isButtonSaveClicked = true;
    this.interactionInstruction1 = "Select one sentence as title. This will be the only visible text among all by default and will be used to continue the parallel piece.";
  }

  // assign the line that is clicked as published title
  onLineClick(index : number) {
    this.selectedLineIndex = index;
    this.lineSelected = true;
    
    this.nextSentenceForParallel = this.inputTextResorted[this.selectedLineIndex];
    this.startIndexofSelected = this.inputTextResortedWithBreak.indexOf(this.nextSentenceForParallel);
    this.endIndexofSelected = this.startIndexofSelected + this.nextSentenceForParallel.length;

    this.sectionBeforeStartIndex = 0;
    this.sectionBeforeEndIndex = this.startIndexofSelected;
    this.sectionBefore = this.inputTextResortedWithBreak.slice(this.sectionBeforeStartIndex, this.sectionBeforeEndIndex + 1);
    this.sectionAfterStartIndex = this.endIndexofSelected;
    this.sectionAfterEndIndex = this.inputTextResortedWithBreak.length;
    this.sectionAfter = this.inputTextResortedWithBreak.slice(this.sectionAfterStartIndex, this.sectionAfterEndIndex + 1);
  }

  hideResortableList(form: HTMLFormElement) {
    form.hidden = true;
  }

  signOut() {
    localStorage.removeItem("userid");
    localStorage.removeItem("username");
    this.router.navigate(['/onboarding']);
  }
}

