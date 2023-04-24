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
  alreadyRefreshed = false;
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
      // console.log("Refreshing page..." + this.alreadyRefreshed)
      // if (params['refresh'] && !this.alreadyRefreshed) {
      //   this.alreadyRefreshed = true;
      //   location.reload();
      // }
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
    this.initializeInputValues();
    // for (let i = 0; i < this.items.length; i++) {
    //   const item = this.items[i];
    //   const values = item.inputs.map(input => input.value);
    //   this.inputValues.push(values);
    // }
  }
  initializeInputValues() {
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
    {  id: 'text2', rows: '2',  inputs: [{ value: ''}], disabled: true, text:'sth2'},
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

  lastUpdateTime : any = undefined;;

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
      this.lastUpdateTime = new Date(data.lastUpdate);
      this.revealedObject = data.revealed;
      this.indexOfTitle = data.title_index;
      this.originalParagraphId = data._id;  
      this.paragraphArray = data.paragraphArray;
      // if(this.lastUpdateTime){
        let newRevealedObject;
        const currentTime = new Date();
        const hoursSinceLastUpdate = (currentTime.getTime() - this.lastUpdateTime.getTime()) / (1000 * 60 * 60 * 12);
        console.log(`7 Hours since last update: ${hoursSinceLastUpdate}`);
        // for (let i = 0; i<hoursSinceLastUpdate; i++ ){
        //   newRevealedObject = this.PassTimeToHide(this.revealedObject);
        //   this.revealedObject = newRevealedObject;
        // }
        // console.log("newRevealedObject is: " + newRevealedObject);
        let isShowNotHide = false;
        
        // this.postHiddenToChange(this.originalParagraphId, newRevealedObject);
        // this.postRevealedToChange(this.originalParagraphId, selectedLineIndex, lineArrayCopy, isShowNotHide);
      // } else {
        this.generateParagraph(this.revealedObject);
      // }
      this.paragraph = data;
      
      this.paragraphArrayInString = data.paragraph;
      
      // console.log("data.revealed is: " + data.revealed)
      this.allParallelSentencesSent = data.parallel_sentences.map((obj: {id:string, sentence:string})=> obj.sentence);
      this.allParallelSentencesId = data.parallel_sentences.map((obj: {id:string, sentence:string})=> obj.id);
      this.currentId = this.route.snapshot.params['id'];
      console.log("allParallelSentences sentence length are:" + this.allParallelSentencesSent.length);
      this.allParallel = data.parallel_sentences; // entire parallel_sentences Object, no use for now
      
      this.currentTitle = this.items[1].inputs[0].value = data.title;
      console.log("currentTitle is update to: "+ this.currentTitle);
      
      console.log("originalParagraphId is: "+ this.originalParagraphId);
      this.renderParallel(this.allParallelSentencesSent);
      
      this.newRevealScoreToPublic = data.reveal_score_to_public;
      this.calRevealScoreToPublic(this.revealedObject);
    }));
  }
  postHiddenToChange(originalParagraphId:any, newRevealedObject: any) {
    console.log('Posting hidden.')
    const data = {
      originalParagraphId: originalParagraphId,
      newRevealedObject: newRevealedObject,
    };
    fetch((environment.apiUrl + "/api/v1/post-hidden-to-change"), {
      method: 'POST',
      mode: 'cors',
      // headers: {
      //   "Content-Type": "application/json",
      // },
      body: JSON.stringify(data)
    })
    .then((response) => response.json())
    .then((data) => {
      let updatedRevealedObject = newRevealedObject;
      console.log("updated RevealedObject!")
      this.generateParagraph(updatedRevealedObject);
      // this.calRevealScoreToPublic(updatedRevealedObject); 
    })
    .catch((error) => console.error(error));
  }

  // ------ Flask "POST" : Post new reveal object after showing or hiding -------------------
  postRevealedToChange(originalParagraphId:any, selectedLineIndex:any, lineArrayCopy:any, isShownotHide:boolean){
    console.log('Posting new Revealed to hidden.')
    const data = {
      originalParagraphId: originalParagraphId,
      selectedLineIndex: selectedLineIndex,
      lineArrayCopy: lineArrayCopy
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
      let updatedRevealedObject = data.updated_revealed_array;
      console.log("updatedRevealedObject.length is: " + updatedRevealedObject.length)
      this.calRevealScoreToPublic(updatedRevealedObject); 
    })
    .catch((error) => console.error(error));
  }

  generateParagraph(revealedObject: any) {
    // if revealed score 1 show (start~end) text, if reveal score 0 hide (start~end) rect boxes
    console.log("Generating paragraph")
    for (let i=0; i<this.paragraphArray.length; i++) {
      let line = this.paragraphArray[i];
      console.log("line is: " + line);
      let sections = revealedObject[i];
      let sectionStrings:string[] = [];
      for (let j=0; j<sections.length; j++) {
        let section = sections[j];
        console.log("line[" + i + "] section[" + j + "](start, end) is: " + section.index_interval_start, section.index_interval_end);
        let sectionText = line.substring(section.index_interval_start, section.index_interval_end);
        console.log("sectionText is: " + sectionText);
        let sectionClass;
        if (section.revealed_score == 1) {
          sectionClass = 'substring--visible';
        } else {
          sectionClass = 'substring--hidden';
        }
        let sectionString = `<span class="${sectionClass}">${sectionText}</span>`;
        console.log(" lnie " + i + " section " + j + "sectionString is: " + sectionString);
        sectionStrings.push(sectionString);
      }
      console.log(" sectionString is: " + sectionStrings);
      this.output += sectionStrings.join('') + '<br>';
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
        // getRewritingWork();
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
  calRevealScoreToPublic(revealedObject:any) {
    // calculate totalCount & titleCount
    // let totalCounts = revealedObject[revealedObject.length-1].index_interval_end;
    // let titleCounts = revealedObject[indexOfTitle].index_interval_end - revealedObject[indexOfTitle].index_interval_start;
    console.log("totalCounts from array is: " + this.paragraphArrayInString.length);
    let totalCounts = 0;
    for (let i = 0; i < revealedObject.length; i++) {
      const lineArray = revealedObject[i];
      for (let j = 0; j < lineArray.length; j++) {
        const obj = lineArray[j];
        totalCounts += obj.index_interval_end - obj.index_interval_start;
      }
    }
    console.log("totalCounts is: " + totalCounts);

    let titleCounts = 0;
    for (let j = 0; j < revealedObject[this.indexOfTitle].length; j++) {
      const obj = revealedObject[this.indexOfTitle][j];
      titleCounts += obj.index_interval_end - obj.index_interval_start;
    }
    console.log("titleCounts is: " + titleCounts);

    let totalShow = 0;
    for (let i = 0; i < revealedObject.length; i++) {
      const lineArray = revealedObject[i];
      for (let j = 0; j < lineArray.length; j++) {
        const obj = lineArray[j];
        if (obj.revealed_score === 1) {
          totalShow += obj.index_interval_end - obj.index_interval_start;
        }
      }
    }
    console.log("totalShow is: " + totalShow);
    let totalHide = 0;
    for (let i = 0; i < revealedObject.length; i++) {
      const lineArray = revealedObject[i];
      for (let j = 0; j < lineArray.length; j++) {
        const obj = lineArray[j];
        if (obj.revealed_score === 0) {
          totalHide += obj.index_interval_end - obj.index_interval_start;
        }
      }
    }
    console.log("totalHide is: " + totalHide);
    //collect indexs of objects that has a revealed_score == 0
    // let index_of_hidden_reveals = revealedObject.map((obj, idx) => obj.revealed_score == 0 ? idx : -1).filter(idx => idx != -1);
    //collect indexs of objects that has a revealed_score == 1
    // let index_of_shown_reveals = revealedObject.map((obj, idx) => obj.revealed_score == 1 ? idx : -1).filter(idx => idx != -1);

    // let index_of_shown_reveals_exclude_title = index_of_shown_reveals.filter((element) => element !== indexOfTitle);
    // let revealedCounts = 0 ;
    // index_of_shown_reveals_exclude_title.forEach(index => {
    //   const obj = revealedObject[index];
    //   const counts = obj.index_interval_end - obj.index_interval_start;
    //   revealedCounts += counts;
    // })
    let percentage = ((totalShow-titleCounts)/(totalCounts-titleCounts))*100;
    // console.log("typeof temp is: " + typeof percentage)
    this.newRevealScoreToPublic= +percentage.toFixed(1);
    // this.newRevealScoreToPublic;
    console.log("newRevealScoreToPublic is: " + this.newRevealScoreToPublic);
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

  



  // ------------- To show -----------------
  contributeToShow() { // 0 => (0, 1, 0)
    console.log("contributeToShow working.");
    let insertRevealed;
    let selectedLineArray;
    let chosenIndex;
    let selectedLineIndex = -1;
    while (true) {
      let isValidLine = false
      while(!isValidLine) {
        // keep randomly select a line until it contain at least one revealed_score = 0
        console.log("indexOfTitle is: " + this.indexOfTitle)
        let randomLineIndex = Math.floor(Math.random() * this.revealedObject.length);
        while (randomLineIndex == this.indexOfTitle) {
          randomLineIndex = Math.floor(Math.random() * this.revealedObject.length);
        }
        console.log("randomLineIndex is :" + randomLineIndex);
        const candidateLineArray = this.revealedObject[randomLineIndex];
        isValidLine = candidateLineArray.some(element => element.revealed_score == 0);
        if (isValidLine) {
          selectedLineArray = candidateLineArray;
          selectedLineIndex = randomLineIndex;
        }
        console.log("selectedLineIndex is :" + selectedLineIndex);
      }
      //collect indexs of objects that has a revealed_score == 0
      const index_of_hidden_reveals = selectedLineArray.map((obj, idx) => obj.revealed_score == 0 ? idx : -1).filter(idx => idx != -1);
      console.log("index_of_hidden_reveals length is :" + index_of_hidden_reveals.length);
  
      //chosen object index to be replaced by 3 object
      const chosenIndex = index_of_hidden_reveals[Math.floor(Math.random() * index_of_hidden_reveals.length)];
      console.log("chosenIndex is :" + chosenIndex);
      const chosenObject = selectedLineArray[chosenIndex];
      const chosenStart = selectedLineArray[chosenIndex].index_interval_start;
      console.log("chosenStart is :" + chosenStart);
      const chosenEnd = selectedLineArray[chosenIndex].index_interval_end;
      console.log("chosenEnd is :" + chosenEnd);
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
      insertRevealed = [
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
      //find matches, if so break and redo whole function again
      const matches = insertRevealed.filter(obj => obj.index_interval_start === chosenStart && obj.index_interval_end === chosenEnd);
      if (matches.length === 0) {
        break;
      }
    }
    const lineArrayCopy = selectedLineArray.slice();
    // remove one from the chosenIndex and insert the entire insertRevealed array
    lineArrayCopy.splice(chosenIndex, 1, ...insertRevealed);

    let isShowNotHide = true;
    this.postRevealedToChange(this.originalParagraphId, selectedLineIndex, lineArrayCopy, isShowNotHide);
  }

  // ------------- To hide -----------------
  PassTimeToHide(currentRevealedObject: any) { // 1 => (1, 0, 1)
    console.log("PassTimeToHide working.");
    let insertRevealed;
    let selectedLineArray;
    let chosenIndex;
    let selectedLineIndex = -1;
    while (true) {
      let isValidLine = false
      while(!isValidLine) {
        // keep randomly select a line until it contain at least one revealed_score = 0
        console.log("indexOfTitle is: " + this.indexOfTitle)
        let randomLineIndex = Math.floor(Math.random() * currentRevealedObject.length);
        while (randomLineIndex == this.indexOfTitle) {
          randomLineIndex = Math.floor(Math.random() * currentRevealedObject.length);
        }
        console.log("randomLineIndex is :" + randomLineIndex);
        const candidateLineArray = currentRevealedObject[randomLineIndex];
        isValidLine = candidateLineArray.some(element => element.revealed_score == 1);
        if (isValidLine) {
          selectedLineArray = candidateLineArray;
          selectedLineIndex = randomLineIndex;
        }
        console.log("selectedLineIndex is :" + selectedLineIndex);
      }
      //collect indexs of objects that has a revealed_score == 1
      const index_of_shown_reveals = selectedLineArray.map((obj, idx) => obj.revealed_score == 1 ? idx : -1).filter(idx => idx != -1);
      console.log("index_of_hidden_reveals length is :" + index_of_shown_reveals.length);
  
      
      //chosen object index to be replaced by 3 object
      const chosenIndex = index_of_shown_reveals[Math.floor(Math.random() * index_of_shown_reveals.length)];
      console.log("chosenIndex is :" + chosenIndex);
      const chosenObject = selectedLineArray[chosenIndex];
      const chosenStart = selectedLineArray[chosenIndex].index_interval_start;
      console.log("chosenStart is :" + chosenStart);
      const chosenEnd = selectedLineArray[chosenIndex].index_interval_end;
      console.log("chosenEnd is :" + chosenEnd);
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
      insertRevealed = [
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
      ];
      //find matches, if so break and redo whole function again
      const matches = insertRevealed.filter(obj => obj.index_interval_start === chosenStart && obj.index_interval_end === chosenEnd);
      if (matches.length === 0) {
        break;
      }
    }

    const lineArrayCopy = selectedLineArray.slice();
    // remove one from the chosenIndex and insert the entire insertRevealed array
    lineArrayCopy.splice(chosenIndex, 1, ...insertRevealed);
    currentRevealedObject[selectedLineIndex] = lineArrayCopy;
    console.log("this.revealedObject updated!");
    return currentRevealedObject;
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
        if(inputs[j].value){
          this.resortedInputValues.push(inputs[j].value);
        }
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
    console.log("rendering parallel");
    if (allParallelSentencesSent.length > 1){ // if not only itself
      this.lastParallelSent = allParallelSentencesSent[allParallelSentencesSent.length-1];
      
      this.lastParallelId = this.allParallelSentencesId[allParallelSentencesSent.length-1];
      this.otherParallelTextId = this.allParallelSentencesId.slice(1, -1);
      this.otherParallelText = allParallelSentencesSent.slice(1, -1); // without 1st and last
      console.log("otherParallelText is:" + this.otherParallelText);
      this.otherParallelTextWithBreak = this.otherParallelText.join("<br>");
      this.otherParallelTextWithSpanBreak = "<span class=substring--hidden>" + this.otherParallelTextWithBreak + "</span>";
      // console.log("otherParallelTextWithBreak is:" + this.otherParallelTextWithBreak);
      // console.log("otherParallelTextWithSpanBreak is:" + this.otherParallelTextWithSpanBreak);
      // console.log("lastParallel is:" + this.lastParallelSent);
    }
    else {
      this.lastParallelSent = " ";
      this.lastParallelId = " ";
    }
    console.log("lastParallelSent is: " + this.lastParallelSent);
    console.log("lastParallelId is: " + this.lastParallelId);
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
    // const navigationExtras: NavigationExtras = {
    //   queryParams: { 'refresh': new Date().getTime() } // Add a timestamp query parameter to force refresh
    // };
    // const extras: NavigationExtras = {
    //   skipLocationChange: true,
    // };
    // this.router.navigate(['/create-interaction-work', paragraphId], {queryParams: {myVar: 2}});//, ...navigationExtras
    
    this.router.navigate(['/create-interaction-work', paragraphId], { queryParams: { myVar: 2 }}).then(() => {
      // window.location.reload();
    });
    this.output = "";
    this.allParallelSentencesSent = [];
    this.allParallelSentencesId = [];
    this.inputValues = [];
    this.inputValues.fill([]);
    // this.getParagraph(paragraphId);
    Promise.all([this.getUserWorks(this.localStorUsername), this.getParagraph(paragraphId)])
    .then(() => {
      this.getUserRestriction();
    })
    this.initializeInputValues();
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

  goToStarter(){
    this.router.navigate(['/starter']);
  }

  signOut() {
    localStorage.removeItem("userid");
    localStorage.removeItem("username");
    this.router.navigate(['/onboarding']);
  }

  hasNonEmptyInputs(): boolean {
    return this.items[0].inputs.some(input => input.value !== '') &&
           this.items[2].inputs.some(input => input.value !== '');
  }




  // -------- Hide and Show functions ----------------
  // makeRevealedFromParagraph(
  //   paragraph: readonly string[],
  //   titleIndex: number
  // ): RevealedObject[][] {
  //   return paragraph.map<RevealedObject[]>((line, idx) => {
  //     if (idx === titleIndex) {
  //       return [
  //         {
  //           index_interval_start: 0,
  //           index_interval_end: line.length,
  //           revealed_score: 1,
  //           is_title: true,
  //         },
  //       ];
  //     }
  
  //     return [
  //       {
  //         index_interval_start: 0,
  //         index_interval_end: line.length,
  //         revealed_score: 0,
  //       },
  //     ];
  //   });
  // }
  
  // // get the indices of all RevealedObjects in an array with a specific revealed_score, not including titles
  // findRevealedObjectIndices(
  //   revealed: RevealedObject[],
  //   revealed_score: 0 | 1
  // ): number[] {
  //   return revealed
  //     .map((obj, idx) =>
  //       obj.revealed_score === revealed_score && !obj.is_title ? idx : -1
  //     )
  //     .filter((idx) => idx !== -1);
  // }
  
  // // runs findRevealedObjectIndices for each line, returning a nested array where the first level is a line, and the second level are the indices of revealed objects
  // findLinesRevealedObjectIndices(
  //   revealed: RevealedObject[][],
  //   revealed_score: 0 | 1
  // ): number[][] {
  //   return revealed.map((line) =>
  //     this.findRevealedObjectIndices(line, revealed_score)
  //   );
  // }
  
  // // gets the indices of all lines which contain at least one RevealedObject with a specific revealed_score
  // findRevealedObjectArrayLineIndices(
  //   revealed: RevealedObject[][],
  //   revealed_score: 0 | 1
  // ): number[] {
  //   const lineIndicesArray = this.findLinesRevealedObjectIndices(
  //     revealed,
  //     revealed_score
  //   );
  //   return lineIndicesArray
  //     .map((lineIndices, idx) => (lineIndices.length !== 0 ? idx : -1))
  //     .filter((idx) => idx !== -1);
  // }
  
  // // random integer up to but not including max
  // randomInteger(max: number): number {
  //   return Math.floor(Math.random() * max);
  // }
  
  // // random integer starting from and including min, and up to but not including max
  // randomIntegerBetween(min: number, max: number): number {
  //   min = Math.ceil(min);
  //   max = Math.floor(max);
  //   return Math.floor(Math.random() * (max - min) + min);
  // }
  
  // // returns a copy of an array of RevealedObjects where the object at the specified index is split at a random point in the interval
  // // the middle object in the split will have the opposite revealed score of the original object
  // splitRevealedAtIndex(
  //   revealed: RevealedObject[],
  //   index: number
  // ): RevealedObject[] {
  //   // make a copy
  //   const result = revealed.slice();
  //   const object = result[index];
  //   // the index isn't valid, don't change anything
  //   if (!object || object.is_title) return result;
  
  //   const old_revealed_score = object.revealed_score;
  //   // hide a reveal or reveal a hide, depending on the old score
  //   const new_revealed_score: 0 | 1 = old_revealed_score === 1 ? 0 : 1;
  
  //   // shouldn't be, but maybe empty interval or single character, if that's the case just change the revealed score and return
  //   if (object.index_interval_end - object.index_interval_start <= 1) {
  //     result[index] = {
  //       ...object,
  //       revealed_score: new_revealed_score,
  //     };
  
  //     return result;
  //   }
  
  //   const random_start = this.randomIntegerBetween(
  //     object.index_interval_start,
  //     object.index_interval_end
  //   );
  //   const random_end = this.randomIntegerBetween(
  //     random_start + 1,
  //     object.index_interval_end
  //   );
  
  //   const new_objects: RevealedObject[] = [];
  
  //   // only add a split for the start if the random start isn't the original start
  //   if (random_start != object.index_interval_start) {
  //     new_objects.push({
  //       index_interval_start: object.index_interval_start,
  //       index_interval_end: random_start,
  //       revealed_score: old_revealed_score,
  //     });
  //   }
  //   new_objects.push({
  //     index_interval_start: random_start,
  //     index_interval_end: random_end,
  //     revealed_score: new_revealed_score,
  //   });
  //   // only add a split for the end if the random end isn't the original end
  //   if (random_end != object.index_interval_end) {
  //     new_objects.push({
  //       index_interval_start: random_end,
  //       index_interval_end: object.index_interval_end,
  //       revealed_score: old_revealed_score,
  //     });
  //   }
  
  //   // replace the original object in the result with the new objects from the split
  //   result.splice(index, 1, ...new_objects);
  
  //   return result;
  // }
  
  // // title: 'Your title'
  // // paragraphArray: [ 'This is a line', 'This is another line', 'Your title', 'This is NOT the title' ]
  
  // // takes an array of RevealedObjects and merges any with the same revealed score
  // mergeByRevealedScores(revealed: RevealedObject[]): RevealedObject[] {
  //   const copy: Array<RevealedObject | undefined> = revealed.slice();
  //   // sort by the interval start, so overlapping intervals will be next to each other
  //   // a! means that we know none of the array is undefined yet
  //   copy.sort((a, b) => a!.index_interval_start - b!.index_interval_start);
  
  //   // merges before into current, and current into after, so that there are no gaps
  //   // skips to i = 1 because it checks before: (i - 1)
  //   for (let i = 1; i < copy.length; i++) {
  //     const before = copy[i - 1];
  //     const after = copy[i + 1];
  //     const current = copy[i];
  
  //     // (0, 1) (1, 5)
  //     // (0, 5)
  //     if (current && before && before.revealed_score === current.revealed_score) {
  //       current.index_interval_start = Math.min(
  //         current.index_interval_start,
  //         before.index_interval_start
  //       );
  //       current.index_interval_end = Math.max(
  //         current.index_interval_end,
  //         before.index_interval_end
  //       );
  
  //       // merge before into current
  //       copy[i - 1] = undefined;
  //       copy[i] = current;
  //     }
  //     if (current && after && after.revealed_score === current.revealed_score) {
  //       after.index_interval_start = Math.min(
  //         after.index_interval_start,
  //         current.index_interval_start
  //       );
  //       after.index_interval_end = Math.max(
  //         after.index_interval_end,
  //         current.index_interval_end
  //       );
  
  //       // merge current into after
  //       copy[i] = undefined;
  //       copy[i + 1] = after;
  //     }
  //   }
  
  //   return copy.filter((x): x is RevealedObject => x != null);
  // }
  
  // // chooses a random line index where that line contains a RevealedObject with a specific revealed_score, if there are no such lines returns -1
  // chooseRandomLineIndexWithRevealedScore(
  //   revealed: RevealedObject[][],
  //   revealed_score: 0 | 1
  // ): number {
  //   const lineIndices = this.findRevealedObjectArrayLineIndices(
  //     revealed,
  //     revealed_score
  //   );
  //   const randomLineIndex = lineIndices[this.randomInteger(lineIndices.length)];
  //   return randomLineIndex ?? -1;
  // }
}


