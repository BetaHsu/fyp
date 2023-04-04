import { Component, EventEmitter, Output, Input  } from '@angular/core';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-create-original-work',
  templateUrl: './create-original-work.component.html',
  styleUrls: ['./create-original-work.component.css']
})
export class CreateOriginalWorkComponent {
  title = 'fyp';
  workTitle: string = ' ';
  user: string | undefined = undefined;
  i = 0;

  // var for drop down list to change view
  view = 0;
  views = ['Interaction', 'Community', 'Public', 'Owner'];
  dropdownActive = false;

  // var for Drag and Drop input fields
  input: string = " ";
  displayVal= '';
  displayTitle = '';
  rewritingSection1 = '';
  rewritingSection2 = '';
  sorted = false;
  inputTextResorted : string[] = [];
  disabledItemId = 'text2';
  buttonText: string = 'Save';
  items = [
    { id: 'text1', rows: '6',  placeholder: 'Enter 1st section of original work', text: this.rewritingSection1, disabled: false  },
    { id: 'text2', rows: '2',  placeholder: 'This will be the title (only sentence that is visible to public by default) of this work', text: this.workTitle, disabled: false },
    { id: 'text3', rows: '6',  placeholder: 'Enter 2nd section of original work', text: this.rewritingSection2, disabled: false }
  ];

  // var for fetching paragraphs from database
  paragraph: any = undefined; //entire paragraph data structure
  entireParagraph: any = undefined;
  revealedArray: any = undefined;
  output: string = '';
  @Output() viewSelected = new EventEmitter<string>();

  // var for testing revealing & hidding sections of paragraph
  text = "Through decades that ran like rivers, endless rivers of endless woes. Through pick and shovel sjambok and jail. O such a long long journey! When the motor-car came, the sledge and the ox-cart began to die. But for a while the bicycle made"
  metadata = [
    { index_interval_start: 0, index_interval_end: 45, revealed_score: 1 },
    { index_interval_start: 45, index_interval_end: 80, revealed_score: 0 }
  ];

  // ------ Paragraph Database ----------------

  // fetch paragraph database when loaded
  ngOnInit(): void {
    this.getParagraph();
    this.generateParagraph();
  }
  getParagraph() {
    //console.log(getParagraph())
    console.log('Getting paragraph')
    fetch("/api/v1/get-paragraph", {
        method: 'GET',
        mode: 'cors'
    }
    )
    .then((response) => response.json())
    .then((data => {
      this.paragraph = data;
      this.entireParagraph = data.paragraph;
      this.revealedArray = data.revealed;
      console.log(this.paragraph);
      console.log(this.revealedArray);
    }));
  }

  generateParagraph() {
    // ?? why simply changing metadata to this.revealedArray then data type is wrong ??
    if (this.revealedArray) {
      // this.revealedArray.forEach((data: { index_interval_start: number, index_interval_end: number, revealed_score: number }) => {
      //   this.output += '<span class=' + (data.revealed_score ? "substring--visible" : "substring--hidden") + '>' + this.text.substring(data.index_interval_start, data.index_interval_end) + '</span>'
      // })
      console.log("this.revealedArray is defined!");
    }
  }

  getTitle(val:string) {
    this.displayTitle = val;
  }

  // ------ Resort input fields ----------------

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

  // if click button, get resorted texts, update button text, disable edit for text fields
  getSortedItems() {
    // if (this.sorted) {
      // iterate through items[], create new array containing only the text property of each object
      this.inputTextResorted = this.items.map(item => item.text).join('\n').split('\n');
      this.buttonText = 'Publish';
      this.items[0].disabled = this.items[1].disabled = this.items[2].disabled = true;
      console.log(this.inputTextResorted);
    // }
  }

  hideResortableList(form: HTMLFormElement) {
    form.hidden = true;
  }


}

