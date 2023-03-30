import { Component, EventEmitter, Output, Input  } from '@angular/core';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-create-interaction-work',
  templateUrl: './create-interaction-work.component.html',
  styleUrls: ['./create-interaction-work.component.css'],
})
export class CreateInteractionWorkComponent {
  title = 'fyp';
  workTitle: string = 'A long journey from bush to concrete';
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
    { id: 'text1', rows: '4', cols: '73', placeholder: 'Enter 1st section of rewriting work', text: this.rewritingSection1, disabled: false  },
    { id: 'text2', rows: '4', cols: '73', text: this.workTitle, disabled: true },
    { id: 'text3', rows: '4', cols: '73', placeholder: 'Enter 2nd section of rewriting work', text: this.rewritingSection2, disabled: false }
  ];
  // @ViewChild('resortableList') resortableList: any;
  // hideInputFields = false;

  // var for fetching paragraphs from database
  paragraph: any = undefined;
  output: string = '';
  @Output() viewSelected = new EventEmitter<string>();

  // var for testing revealing & hidding sections of paragraph
  text = "Through decades that ran like rivers, endless rivers of endless woes. Through pick and shovel sjambok and jail. O such a long long journey! When the motor-car came, the sledge and the ox-cart began to die. But for a while the bicycle made"
  metadata = [
    { index_interval_start: 0, index_interval_end: 45, revealed_score: 1 },
    { index_interval_start: 45, index_interval_end: 80, revealed_score: 0 }
  ];
  
  ngOnInit(): void {
    this.getParagraph();
    this.generateParagraph();
  }

  generateParagraph() {
    this.metadata.forEach((data) => {
      this.output += '<span class=' + (data.revealed_score ? "substring--visible" : "substring--hidden") + '>' + this.text.substring(data.index_interval_start, data.index_interval_end) + '</span>'
    })
    console.log(this.output)
  }

  toggleDropdown() {
    // Toggle the dropdown
    this.dropdownActive = !this.dropdownActive
    console.log(this.dropdownActive)
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
      console.log(data)
    }));
  }

  setView(newView: number) {
    // Close the dropdown
    this.dropdownActive = false
    // Update the view
    this.view = newView
  }

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

    // If target item is defined, swap properties of the dragged item and the target item
    if (targetItem) {
      // swap text value
      const tempText = draggedItem.text;
      draggedItem.text = targetItem.text;
      targetItem.text = tempText;
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

  getTitle(val:string) {
    this.displayTitle = val;
  }
}

