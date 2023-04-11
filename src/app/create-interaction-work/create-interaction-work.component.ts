import { Component, EventEmitter, Output, Input, OnInit  } from '@angular/core';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-create-interaction-work',
  templateUrl: './create-interaction-work.component.html',
  styleUrls: ['./create-interaction-work.component.css'],
})
export class CreateInteractionWorkComponent implements OnInit {
  constructor(private route: ActivatedRoute) {

  }
  // initialize: load paragraph database & check if route from create-original-work page
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['fromCreateOriginalWork'] === 'true') {
        this.view = 3;
      }
    })
    this.getParagraph();
  }

  title = 'fyp';
  workTitle: string = 'A long journey from bush to concrete';
  user: string | undefined = undefined;
  i = 0;

  // var for drop down list to change view
  view = 0;
  views = ['Interaction', 'Community', 'Public', 'Owner'];
  dropdownActive = false;
  isButtonSaveClicked = false;

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
    { id: 'text2', rows: '2',  text: this.workTitle, disabled: true },
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

  // var for fetching paragraphs from database
  paragraph: any = undefined; //entire paragraph data structure
  paragraphTest = "Through decades that ran like rivers, endless rivers of endless woes. Through pick and shovel sjambok and jail. O such a long long journey! When the motor-car came, the sledge and the ox-cart began to die. But for a while the bicycle made in Britain, was the dream of every village boy. With the arrival of the bus, the city was brought into the village, and we began to yearn for the place behind the horizons. Such a long travail it was. A long journey from bush to concrete. "
        
  // entireParagraph: any = undefined;
  entireParagraphWithBreak: any = undefined; // paragraph.paragraph in the database itself is already w/ break
  entireParagraphWithoutBreak: any = undefined; // remove <br> from paragraph.paragraph
  entireParagraphWithSpanBreak: any = undefined; // for displaying paragraph w/ hidden or visible score
  output: string = '';
  @Output() viewSelected = new EventEmitter<string>();

  // var for testing revealing & hidding sections of paragraph
  fullParagraph : any = undefined;
  metadata = [
    { index_interval_start: 0, index_interval_end: 45, revealed_score: 1 },
    { index_interval_start: 45, index_interval_end: 80, revealed_score: 0 }
  ];

  currentReveal = 0;
  interactionInstruction1 = "Create rewriting of the piece using title sentence";

  testAPI() {
    //throw new Error('Method not implemented.');
    fetch((environment.apiUrl + "/api/test"), {
      method: 'GET',
      mode: 'cors'
    })
    .then((response) => response.json).then((json) => console.log(json))
  }

  // ------ Flask "GET" : get paragraph-------------------

  getParagraph() {
    console.log('Getting paragraph')
    fetch((environment.apiUrl + "/api/v1/get-paragraph"), {
        method: 'GET',
        mode: 'cors'
    }
    )
    .then((response) => response.json())
    .then((data => {
      this.paragraph = data;
      this.generateParagraph();
    }));
  }

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
    // this.entireParagraphWithBreak = text.replace(/([.,;?!])(\s|$)/g, '$1<br>');
    // this.entireParagraphWithSpanBreak = this.output.replace(/([.,;?!])(\s|$)/g, '$1<br>');
  }


  // ------ Flask "POST" : Post paragraph -------------------
  publishNewParagraph() {
    console.log("Publish new paragraph.");
    console.log(this.inputTextResorted);
    let paragraph = {
      "title": this.nextSentenceForParallel,
      "title_interval_start": this.startIndexofSelected,
      "title_interval_end": this.endIndexofSelected,
      "paragraph": this.inputTextResorted.join('<br>'),
      "id": Date.now(),
      "creator_id": localStorage.getItem('userid'),
      "parallel_sentences": [
        this.nextSentenceForParallel
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
    this.postSentenceToParallel(this.nextSentenceForParallel)
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

  // ------ Flask "POST" : Post sentence to parallel -------------------

  postSentenceToParallel(sentence: any) {
    console.log('Posting sentence to parallel.')
    fetch((environment.apiUrl + "/api/v1/post-sentence-to-parallel"), {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(sentence)
  }
  )
  .then((response) => console.log(response))
  }


  // ------ DropDown for different views -------------------

  toggleDropdown() {
    // Toggle the dropdown
    this.dropdownActive = !this.dropdownActive;
    console.log(this.dropdownActive);
  }
  setView(newView: number) {
    // Close the dropdown
    this.dropdownActive = false;
    // Update the view
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

  // ------ Resort input fields --------------------------------

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
    // if (this.sorted) {
      // iterate through items[], create inputTextResorted[] containing only the text property of each object
      // numbers of elements in inputTextResorted[] is same as number of lines the rewriting work 
      this.inputTextResorted = this.items.map(item => item.text).join('\n').split('\n');
      this.inputTextResortedWithBreak = this.inputTextResorted.join('<br>')
      // this.inputTextResortedInLines = this.items.map(item => item.text.split('\n'));
      // this.inputTextResortedInOneString = this.inputTextResortedInLines.flatMap(lines => lines).join('\n');

      this.items[0].disabled = this.items[1].disabled = this.items[2].disabled = true;
      this.isButtonSaveClicked = true;
      this.interactionInstruction1 = "Select one sentence as title. This will be the only visible text among all by default and will be used to continue the parallel piece.";
      this.currentReveal = 100;
      console.log("inputTextResortedWithBreak is" + this.inputTextResortedWithBreak);
    // }
  }

  // click on line from rewriting as published title
  onLineClick(index : number) {
    this.selectedLineIndex = index;
    this.lineSelected = true;
    
    this.nextSentenceForParallel = this.inputTextResorted[this.selectedLineIndex];
    this.startIndexofSelected = this.inputTextResortedWithBreak.indexOf(this.nextSentenceForParallel);
    this.endIndexofSelected = this.startIndexofSelected + this.nextSentenceForParallel.length -1;

    this.sectionBeforeStartIndex = 0;
    this.sectionBeforeEndIndex = this.startIndexofSelected - 1;
    this.sectionBefore = this.inputTextResortedWithBreak.slice(this.sectionBeforeStartIndex, this.sectionBeforeEndIndex + 1);
    this.sectionAfterStartIndex = this.endIndexofSelected + 1;
    this.sectionAfterEndIndex = this.inputTextResortedWithBreak.length - 1;
    this.sectionAfter = this.inputTextResortedWithBreak.slice(this.sectionAfterStartIndex, this.sectionAfterEndIndex + 1);
  }

  hideResortableList(form: HTMLFormElement) {
    form.hidden = true;
  }
}

