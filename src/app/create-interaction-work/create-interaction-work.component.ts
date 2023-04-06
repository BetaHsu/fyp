import { Component, EventEmitter, Output, Input, OnInit  } from '@angular/core';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create-interaction-work',
  templateUrl: './create-interaction-work.component.html',
  styleUrls: ['./create-interaction-work.component.css'],
})
export class CreateInteractionWorkComponent implements OnInit {
  source = '';

  constructor(private route: ActivatedRoute) {

  }
  // when loaded:
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
  disabledItemId = 'text2';
  // buttonText: string = 'Save';
  items = [
    { id: 'text1', rows: '6',  placeholder: 'Enter 1st section of rewriting work', text: this.rewritingSection1, disabled: false  },
    { id: 'text2', rows: '2',  text: this.workTitle, disabled: true },
    { id: 'text3', rows: '6',  placeholder: 'Enter 2nd section of rewriting work', text: this.rewritingSection2, disabled: false }
  ];
  // var for selcting line to publish
  selectedLineIndex = -1;
  lineSelected = false;
  nextSentenceForParallel = '';

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
  // fullParagraph = "Through decades that ran like rivers, endless rivers of endless woes. Through pick and shovel sjambok and jail. O such a long long journey! When the motor-car came, the sledge and the ox-cart began to die. But for a while the bicycle made in Britain, was the dream of every village boy. With the arrival of the bus, the city was brought into the village, and we began to yearn for the place behind the horizons. Such a long travail it was. A long journey from bush to concrete. "
  fullParagraph : any = undefined;
  metadata = [
    { index_interval_start: 0, index_interval_end: 45, revealed_score: 1 },
    { index_interval_start: 45, index_interval_end: 80, revealed_score: 0 }
  ];

  currentReveal = 0;
  interactionInstruction1 = "Create rewriting of the piece using title sentence";

  // ------ GETTING & POSTING to Paragraph Database -------------------------------

  

  // ------ Flask "GET" : get paragraph-------------------

  getParagraph() {
    console.log('Getting paragraph')
    fetch("/api/v1/get-paragraph", {
        method: 'GET',
        mode: 'cors'
    }
    )
    .then((response) => response.json())
    .then((data => {
      this.paragraph = data;
      // this.entireParagraph = data.paragraph;
      // console.log(this.paragraph);
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
    // following-to-be-auto-calculated-by-code
    let paragraph = {
      "title": 'the title rewriting user select',
      "title_interval_start": 439,
      "title_interval_end": 476,
      "paragraph": this.inputTextResorted.join('<br>'),
      "id": Date.now(),
      "creator_id": "yun",
      "parallel_sentences": [
        "the title rewriting user select"
      ],
      "revealed": [
          {
              "index_interval_start": 0,
              "index_interval_end": 20,
              "revealed_score": 0,
          },
          {
              "index_interval_start": 20,
              "index_interval_end": 476,
              "revealed_score": 1,
          },
          {
            "index_interval_start": 20,
            "index_interval_end": 476,
            "revealed_score": 0,
          }
      ]
  }
    this.postParagraph(paragraph);
    this.postSentenceToParallel(this.nextSentenceForParallel)
  }
  postParagraph(paragraph: any) {
    console.log('Posting paragraph.')
    fetch("/api/v1/post-paragraph", {
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
    fetch("/api/v1/post-sentence-to-parallel", {
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
      // iterate through items[], create new array containing only the text property of each object
      this.inputTextResorted = this.items.map(item => item.text).join('\n').split('\n');
      this.items[0].disabled = this.items[1].disabled = this.items[2].disabled = true;
      this.isButtonSaveClicked = true;
      this.interactionInstruction1 = "Select one sentence as title. This will be the only visible text among all by default and will be used to continue the parallel piece.";
      this.currentReveal = 100;
      console.log("this.paragraph.paragraph is:" + this.paragraph.paragraph);
      console.log("this.entireParagraphWithBreak is:" + this.entireParagraphWithBreak);
      console.log("this.entireParagraphWithoutBreak is:" + this.entireParagraphWithoutBreak);
      console.log("this.entireParagraphWithSpanBreak is:" + this.entireParagraphWithSpanBreak);
    // }
  }

  // click on line from rewriting as published title
  onLineClick(index : number) {
    this.selectedLineIndex = index;
    this.lineSelected = true;
    this.nextSentenceForParallel = this.inputTextResorted[this.selectedLineIndex];
  }

  hideResortableList(form: HTMLFormElement) {
    form.hidden = true;
  }
}

