import { Component, EventEmitter, Output, Input, OnInit} from '@angular/core';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { environment } from 'src/environments/environment';
import ObjectId from 'bson-objectid';
import { FormControl, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-create-interaction-work',
  templateUrl: './create-interaction-work.component.html',
  styleUrls: ['./create-interaction-work.component.css'],
})
export class CreateInteractionWorkComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router, private fb: FormBuilder) {
  }

  // Initialize: load paragraph database & check if route from create-original-work or home
  ngOnInit(): void {
    const username = localStorage.getItem("username");
    const userid = localStorage.getItem("userid");
    
    if (!username || !userid) {
      this.isLoggedIn = false;
    }
    const currentParagraphId = this.route.snapshot.params['id'];
    console.log("currentParagraphId is: " + currentParagraphId);
    this.route.queryParams.subscribe(params => {
      if (params['fromCreateOriginalWork'] === 'true') {
        this.view = 3;
      }
      const myVar = parseInt(params['myVar']);
      this.view = myVar;
    })
    const currentUsername = localStorage.getItem("username")
    if(currentUsername){
      this.localStorUsername = currentUsername;
    }

    Promise.all([this.getUserWorks(this.localStorUsername), this.getParagraph(currentParagraphId)])
    .then(() => {
      this.getUserRestriction();
    })

    //fade after 24 
    setInterval(() => {
      // this.PassTimeToHide();
    }, 24 * 60 * 60 * 1000) // every 24 hours (24 hr * 60 min * 60 sec * 1000 millisec)

    // initialize inputValues array with default values
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const values = item.inputs.map(input => input.value);
      this.inputValues.push(values);
    }
  }
  title = 'fyp';
  user: string | undefined = undefined;
  i = 0;
  localStorUsername: any = undefined;
  isLoggedIn = true;

  // var for GET paragraphs from database
  originalParagraphId: any = undefined;
  paragraph: any = undefined; //entire paragraph database
  currentTitle: string = " "; //current paragraph title
  originalCreator: any = undefined;
  currentRevealScoreToPublic: number = 0;
  allParallel: any = undefined; //entire parallel Object, not .sentence
  currentId: string = " ";
  titleStart = -1;
  titleEnd = -1;

  // var for drop down list to change view
  view = 2;
  views = ['Interaction', 'Community', 'Public', 'Owner'];
  dropdownActive = false;
  isButtonSaveClicked = false;

  // var for restriction views
  getUserWorksReady = false;
  userWorks:string[]=[];
  allParallelSentencesSent : string[] = [];
  allParallelSentencesId : string[] = [];
  can_access_views = [false, false, true, false]; //true, false, true, false

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

  //var for resorting inputs texts
  resortedInputValues:string[] = [];
  resortedInputValuesString = '';
  inputValues:string[][] = [];
  allInputFields : string[] = [];
  showList = true;
  items = [
    { id: 'text1', rows: '6',  inputs: [{ value: '' },{ value: '' }], disabled: false, text:'sth1'  },
    {  id: 'text2', rows: '2',  inputs: [{ value: this.currentTitle}], disabled: true, text:'sth2'},
    { id: 'text3', rows: '6',  inputs: [{ value: '' },{ value: '' }], disabled: false, text:'sth3'  }
  ];
  resortedInputValuesRevealed:{index_interval_start: number, index_interval_end: number, revealed_score: number}[][] = [];

  // var for selcting line to publish
  selectedLineIndex = -1;
  lineSelected = false;
  nextSentenceForParallel = '';
  startIndexofSelected = -1;
  endIndexofSelected = -1;

  entireParagraphWithBreak: any = undefined; // paragraph.paragraph in the database itself is already w/ break
  entireParagraphWithoutBreak: any = undefined; // remove <br> from paragraph.paragraph
  entireParagraphWithSpanBreak: any = undefined; // for displaying paragraph w/ hidden or visible score
  output: string = '';
  @Output() viewSelected = new EventEmitter<string>();
  newParagraphId: any = " ";

  // var for reveal by user contribution & Fade Away by time Section
  revealedObject:any = undefined;
  index_of_hidden_reveals: any = [];
  index_of_shown_reveals: any = [];
  index_of_shown_reveals_exclude_title: any = [];

  // var for calculate reveal score
  indexOfTitle = -1;
  newRevealScoreToPublic = 0;

  // var for testing revealing & hidding sections of paragraph
  fullParagraph : any = undefined;
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
    return fetch((environment.apiUrl + "/api/v1/get-user-works/" + username), {
        method: 'GET',
        mode: 'cors'
    }
    )
    .then((response) => response.json()) 
    .then(data => {
      this.userWorks = data as string[];
      this.getUserWorksReady = true;
      console.log("user's works is" + this.userWorks);
      // return this.userWorks;
    });
  }

  paragraphArray:string[] = [];
  paragraphArrayInString = "";

  // ------ Flask "GET" : get paragraph-------------------
  getParagraph(paragraphId: string) {
    console.log('Getting paragraph')
    return fetch((environment.apiUrl + "/api/v1/get-paragraph/" + paragraphId), {
        method: 'GET',
        mode: 'cors'
    }
    )
    .then((response) => response.json()) 
    .then((data => {
      this.paragraph = data;
      this.paragraphArray = data.paragraphArray;
      this.paragraphArrayInString = this.paragraphArray.join('<br>');
      this.revealedObject = data.revealed;
      // console.log("data.revealed is: " + data.revealed)
      this.allParallelSentencesSent = data.parallel_sentences.map((obj: {id:string, sentence:string})=> obj.sentence);
      this.allParallelSentencesId = data.parallel_sentences.map((obj: {id:string, sentence:string})=> obj.id);
      this.currentId = this.route.snapshot.params['id'];
      console.log("allParallelSentences sentence length are:" + this.allParallelSentencesSent.length);
      this.allParallel = data.parallel_sentences; // entire parallel_sentences Object, no use for now
      this.generateParagraph();
      this.currentTitle = this.items[1].inputs[0].value = data.title;
      console.log("currentTitle is update to: "+ this.currentTitle);
      this.originalParagraphId = data._id;  
      this.renderParallel(this.allParallelSentencesSent);
      this.indexOfTitle = data.title_index;
      this.newRevealScoreToPublic = data.reveal_score_to_public;
    }));
  }
  generateParagraph() {
    // if revealed score 1 show (start~end) text, if reveal score 0 hide (start~end) rect boxes
    console.log("Generating paragraph")
    // console.log("revealedObject is: " + this.revealedObject);
    // console.log("paragraphArray is: " + this.paragraphArray);
    for (let i=0; i<this.paragraphArray.length; i++) {
      let line = this.paragraphArray[i];
      let sections = this.revealedObject[i];
      let scetionStrings:string[] = [];
      for (let j=0; j<sections.length; j++) {
        let section = sections[j];
        let sectionText = line.substring(section.index_interval_start, section.index_interval_end);
        let sectionClass = section.revealed_score === 1 ? 'substring--visible' : 'substring--hidden';
        scetionStrings.push(`<span class="${sectionClass}">${sectionText}</span>`);
      }
      this.output += scetionStrings.join('') + '<br>';
    }
    console.log("output is: " + this.output);
  }

  // corresponded to change views = ['Interaction', 'Community', 'Public', 'Owner'];
  getUserRestriction() {
    console.log("getUserRestriction calling")
    // if (this.getUserWorksReady) {
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
    // }
  }

  // ------ Flask "POST" : Post paragraph -------------------
  publishNewParagraph() {
    console.log("Publish new paragraph.");
    let paragraph = {
      "title": this.nextSentenceForParallel,
      // "title_interval_start": this.startIndexofSelected,
      // "title_interval_end": this.endIndexofSelected,
      "title_index": this.selectedLineIndex,
      "paragraphArray": this.resortedInputValues,
      "paragraph": this.resortedInputValuesString,
      "id": Date.now().toString(),
      "creator_id": localStorage.getItem('userid'),
      "creator_username": this.localStorUsername,
      "reveal_score_to_public": 0,
      "parallel_sentences": [
        {
          // "id": " ",
          "sentence": this.nextSentenceForParallel,
        }
      ],
      "revealed": this.resortedInputValuesRevealed
    }
    this.postParagraph(paragraph);
    // this.contributeToShow(); ! uncommand this when done testing!
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
    })
    .then((response) => response.json())
    .then((data => {
      this.newParagraphId = data._id;
      this.postSentenceToParallel(this.originalParagraphId, this.newParagraphId, this.nextSentenceForParallel);
      this.postWorkIdToUser(this.newParagraphId, this.localStorUsername);
    }
    ))
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
    })
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

  // ----------- Flask "POST" : Post new score -------------------
  calRevealScoreToPublic(revealedObject:any, indexOfTitle:any) {
    // calculate totalCount & titleCount
    let totalCounts = revealedObject[revealedObject.length-1].index_interval_end;
    let titleCounts = revealedObject[indexOfTitle].index_interval_end - revealedObject[indexOfTitle].index_interval_start;
    console.log("titleCounts is: " + titleCounts);
    console.log("totalCounts is: " + totalCounts);

    //collect indexs of objects that has a revealed_score == 0
    // let index_of_hidden_reveals = revealedObject.map((obj, idx) => obj.revealed_score == 0 ? idx : -1).filter(idx => idx != -1);
    //collect indexs of objects that has a revealed_score == 1
    let index_of_shown_reveals = revealedObject.map((obj, idx) => obj.revealed_score == 1 ? idx : -1).filter(idx => idx != -1);

    let index_of_shown_reveals_exclude_title = index_of_shown_reveals.filter((element) => element !== indexOfTitle);
    let revealedCounts = 0 ;
    index_of_shown_reveals_exclude_title.forEach(index => {
      const obj = revealedObject[index];
      const counts = obj.index_interval_end - obj.index_interval_start;
      revealedCounts += counts;
    })
    console.log("revealedCharacters is: " + revealedCounts);
    let percentage = ((revealedCounts)/(totalCounts-titleCounts))*100;
    // console.log("typeof temp is: " + typeof percentage)
    // console.log("percentage is: " + percentage)
    this.newRevealScoreToPublic= +percentage.toFixed(1);
    console.log("newRevealScoreToPublic is: " + this.newRevealScoreToPublic);
    // post newScore to database `reveal_score_to_public`
    this.postNewScore(this.originalParagraphId, this.newRevealScoreToPublic);
  }
  postNewScore(originalParagraphId:any, newRevealScoreToPublic:any) {
    console.log('Posting new score.')
    const data = {
      originalParagraphId: originalParagraphId,
      newRevealScoreToPublic: newRevealScoreToPublic,
    };
    fetch((environment.apiUrl + "/api/v1/post-new-score"), {
      method: 'POST',
      mode: 'cors',
      // headers: {
      //   "Content-Type": "application/json",
      // },
      body: JSON.stringify(data)
    })
    .then((response) => console.log(response))
  }

  // ------ Flask "POST" : Post new reveal object after showing or hiding -------------------
  postRevealedToChange(originalParagraphId:any, chosenIndex: any, insertRevealed: any, isShownotHide:boolean){
    console.log('Posting new Revealed to hidden.')
    const data = {
      originalParagraphId: originalParagraphId,
      chosenIndex: chosenIndex,
      insertRevealed: insertRevealed
    };
    fetch((environment.apiUrl + "/api/v1/post-revealed-to-change"), {
      method: 'POST',
      mode: 'cors',
      // headers: {
      //   "Content-Type": "application/json",
      // },
      body: JSON.stringify(data)
    })
    .then((response) => response.json())
    .then((data) => {
      // Check if matching_item_exist is true or false
      let matchingItemExist = data.matching_item_exist;
      let updatedRevealedObject = data.updated_revealed_array;
      console.log("matching Item Exist? " + matchingItemExist);
      console.log("updatedRevealedArray length is " + updatedRevealedObject.length);
      if (matchingItemExist) { //redo again if matchingItemExist
        matchingItemExist = false;
        if (isShownotHide == true){
          console.log("automatically calling contributeToShow() again!!")
          this.contributeToShow();
        } else {
          console.log("automatically calling PassTimeToHide() again!!")
          this.PassTimeToHide();
        }
      } else { // assign updatedRevealedObject & newindexOfTitle as parameters for calRevealScoreToPublic()
        let newindexOfTitle = updatedRevealedObject.findIndex((obj) => obj.index_interval_start === this.titleStart && obj.index_interval_end === this.titleEnd);
        this.calRevealScoreToPublic(updatedRevealedObject, newindexOfTitle); 
      }
    })
    .catch((error) => console.error(error));
  }



  // ------------- To show -----------------
  contributeToShow() { // 0 => (0, 1, 0)
    // keep randomly select a line until it contain at least one revealed_score = 0
    let isValidLine = false
    let selectedLineIndex = -1;
    let selectedLineArray;
    while(!isValidLine) {
      const randomLineIndex = Math.floor(Math.random() * this.revealedObject.length);
      const candidateLineArray = this.revealedObject[randomLineIndex];
      isValidLine = candidateLineArray.some(element => element.revealed_score === 0);
      if (isValidLine) {
        selectedLineArray = candidateLineArray;
        selectedLineIndex = randomLineIndex;
      }
    }
    //collect indexs of objects that has a revealed_score == 0
    const index_of_hidden_reveals = selectedLineArray.map((obj, idx) => obj.revealed_score == 0 ? idx : -1).filter(idx => idx != -1);

    //collect indexs of objects that has a revealed_score == 1
    // const index_of_shown_reveals = selectedLineArray.map((obj, idx) => obj.revealed_score == 1 ? idx : -1).filter(idx => idx != -1);
    // title sentence excluded
    // this.index_of_shown_reveals_exclude_title = this.index_of_shown_reveals.filter((element) => element !== this.indexOfTitle);

    //chosen object index to be replaced by 3 object
    const chosenIndex = this.index_of_hidden_reveals[Math.floor(Math.random() * this.index_of_hidden_reveals.length)];
    const chosenStart = selectedLineArray[chosenIndex].index_interval_start;
    const chosenEnd = selectedLineArray[chosenIndex].index_interval_end;
    const range = chosenEnd - chosenStart + 1;
    const randomValue1 = Math.floor(Math.random() * range) + chosenStart;
    const randomValue2 = Math.floor(Math.random() * range) + chosenStart;

    let smallRandom: number;
    let bigRandom: number;
    if (randomValue1 > randomValue2) {
      bigRandom = randomValue1;
      smallRandom = randomValue2;
    } else {
      bigRandom = randomValue2;
      smallRandom = randomValue1;
    }
    console.log("smallRandom is: " + smallRandom);
    console.log("bigRandom is: " + bigRandom);
    const insertRevealed = [
      {
        "index_interval_start": chosenStart,
        "index_interval_end": smallRandom,
        "revealed_score": 0,
      },
      {
        "index_interval_start": smallRandom,
        "index_interval_end": bigRandom,
        "revealed_score": 1,
      },
      {
        "index_interval_start": bigRandom,
        "index_interval_end": chosenEnd,
        "revealed_score": 0,
      }
    ];
    const lineArrayCopy = selectedLineArray.slice();
    // remove one from the chosenIndex and insert the entire insertRevealed array
    lineArrayCopy.splice(chosenIndex, 1, ...insertRevealed);

    let isShowNotHide = true;
    this.postRevealedToChange(this.originalParagraphId, selectedLineIndex, lineArrayCopy, isShowNotHide);
  }

  // ------------- To hide -----------------
  PassTimeToHide() { // 1 => (1, 0, 1)
    //collect indexs of objects that has a revealed_score == 1
    console.log("PassTimeToHide working.");
    console.log("index_of_shown_reveals_exclude_title.length is: " + this.index_of_shown_reveals_exclude_title.length);
    //chosen object index to be replaced by 3 object
    const chosenIndex = this.index_of_shown_reveals_exclude_title[Math.floor(Math.random() * this.index_of_shown_reveals_exclude_title.length)];
    console.log("chosenIndex in PassTimeToHide is: " + chosenIndex);
    if(!chosenIndex) return;
    const chosenStart = this.revealedObject[chosenIndex].index_interval_start;
    console.log("chosenStart in PassTimeToHide is: " + chosenStart);
    const chosenEnd = this.revealedObject[chosenIndex].index_interval_end;
    console.log("chosenEnd in PassTimeToHide is: " + chosenEnd);
    const range = chosenEnd - chosenStart + 1;
    const randomValue1 = Math.floor(Math.random() * range) + chosenStart;
    const randomValue2 = Math.floor(Math.random() * range) + chosenStart;

    let smallRandom: number;
    let bigRandom: number;
    if (randomValue1 > randomValue2) {
      bigRandom = randomValue1;
      smallRandom = randomValue2;
    } else {
      bigRandom = randomValue2;
      smallRandom = randomValue1;
    }
    console.log("smallRandom is: " + smallRandom);
    console.log("bigRandom is: " + bigRandom);
    let insertRevealed = [
      {
        "index_interval_start": chosenStart,
        "index_interval_end": smallRandom,
        "revealed_score": 1,
      },
      {
        "index_interval_start": smallRandom,
        "index_interval_end": bigRandom,
        "revealed_score": 0,
      },
      {
        "index_interval_start": bigRandom,
        "index_interval_end": chosenEnd,
        "revealed_score": 1,
      }
    ]
    let isShowNotHide = false;
    this.postRevealedToChange(this.originalParagraphId, chosenIndex, insertRevealed, isShowNotHide);
  }

  // -------- For resortable input fields --------------------------------
  onDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
    moveItemInArray(this.inputValues, event.previousIndex, event.currentIndex);
  }

  getSortedItems() { //if click button, get resorted texts, update button
    // iterate through items[], create inputTextResorted[] containing only text property of each object
    // numbers of elements in inputTextResorted[] = number of lines of user input rewriting work 
    for (let i = 0; i < this.items.length; i++) {
      const inputs = this.items[i].inputs;
      for (let j = 0; j < inputs.length; j++) {
        this.resortedInputValues.push(inputs[j].value);
      }
    }
    this.resortedInputValuesString = this.resortedInputValues.join('');

    console.log("resortedInputValues is: " + this.resortedInputValues); // is an array
    console.log("resortedInputValuesString is: " + this.resortedInputValuesString); // is a string

    this.items[0].disabled = this.items[1].disabled = this.items[2].disabled = true;
    this.isButtonSaveClicked = true;
    this.interactionInstruction1 = "Select one sentence as title. This will be the only visible text among all by default and will be used to continue the parallel piece.";
  }

  inputFields = [
    { value: '' },
    { value: '' }
  ];

  addField(item:any) {
    item.inputs.push({ value: '' });
  }

  removeField(item:any, index: number) {
    item.inputs.splice(index, 1);
  }

  saveInputFieldsValues() {
    this.allInputFields = this.inputFields.map(field => field.value);
  }

  addInput(item: any) {
    item.inputs.push({ value: '' });
    this.inputValues[this.items.indexOf(item)].push('');
  }
  
  removeInput(item: any, index: number) {
    item.inputs.splice(index, 1);
    this.inputValues[this.items.indexOf(item)].splice(index, 1);
  }

  hideResortableList() {
    this.showList = false;
  }
  
  // For assigning line for next paragraph title & get all other parameters needed
  onLineClick(index : number) { //0-4, 4-8, 8-12
    this.selectedLineIndex = index;
    this.lineSelected = true;
    this.nextSentenceForParallel = this.resortedInputValues[this.selectedLineIndex];

    //calculate new revealed object
    this.resortedInputValuesRevealed = this.resortedInputValues.map(
      (line: string, i: number) => [{index_interval_start: 0, index_interval_end: line.length, revealed_score: 0}]
    )
    this.resortedInputValuesRevealed[index][0].revealed_score = 1;
  }

  // ------ For render parallel sentences & links to each work ------------
  lastParallelSent:string=" ";
  lastParallelId:string=" ";
  otherParallelText:string[] = [];
  otherParallelTextId:string[] = [];
  parallelPlaceholderLstring:string=" ";
  otherParallelTextWithBreak:string=" ";
  otherParallelTextWithSpanBreak:string=" ";

  renderParallel(allParallelSentencesSent:any){
    if (allParallelSentencesSent.length > 1){
      this.lastParallelSent = allParallelSentencesSent[allParallelSentencesSent.length-1];
      this.lastParallelId = this.allParallelSentencesId[allParallelSentencesSent.length-1];
      // console.log("lastParallel is:" + this.lastParallelSent);
    }
    this.otherParallelTextId = this.allParallelSentencesId.slice(1, -1);
    this.otherParallelText = allParallelSentencesSent.slice(1, -1); // without 1st and 2nd
    // console.log("otherParallelText is:" + this.otherParallelText);
    this.otherParallelTextWithBreak = this.otherParallelText.join("<br>");
    this.otherParallelTextWithSpanBreak = "<span class=substring--hidden>" + this.otherParallelTextWithBreak + "</span>";
    // console.log("otherParallelTextWithBreak is:" + this.otherParallelTextWithBreak);
    // console.log("otherParallelTextWithSpanBreak is:" + this.otherParallelTextWithSpanBreak);
  }

  // ------ For DropDown for different views -------------------
  toggleDropdown() {// Toggle the dropdown
    this.dropdownActive = !this.dropdownActive;
    // console.log(this.dropdownActive);
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

  // -------------- For routing ------------------- 
  goToEachParallel(paragraphId: string) {
    const extras: NavigationExtras = {
      skipLocationChange: true,
    };
    // this.router.navigate(['/create-interaction-work', paragraphId], {queryParams: {myVar: 2}});
    this.router.navigate(['/create-interaction-work', paragraphId], { queryParams: { myVar: 2 }, skipLocationChange: true });
  }

  goToHome() { // go to home instead
    this.router.navigate(['']);
  }

  goToOnboarding(){
    this.router.navigate(['/onboarding']);
  }

  goToCreateOriginal(){
    this.router.navigate(['/create-original-work']);
  }

  signOut() {
    localStorage.removeItem("userid");
    localStorage.removeItem("username");
    this.router.navigate(['/onboarding']);
  }
}


