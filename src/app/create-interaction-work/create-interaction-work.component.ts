import { Component, EventEmitter, Output  } from '@angular/core';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { getParagraph } from '../services/database-service';

@Component({
  selector: 'app-create-interaction-work',
  templateUrl: './create-interaction-work.component.html',
  styleUrls: ['./create-interaction-work.component.css']
})
export class CreateInteractionWorkComponent {
  title = 'fyp';
  workTitle: string = 'A long journey from bush to concrete';
  i = 0;
  view = 0;
  views = ['Interaction', 'Community', 'Public', 'Owner'];
  dropdownActive = false;
  user: string | undefined = undefined;
  input: string = " ";
  displayVal= '';
  displayTitle = '';
  rewritingSection1 = '';
  rewritingSection2 = '';
  sorted = false;
  inputTextResorted : string[] = [];
  @Output() viewSelected = new EventEmitter<string>();

  items = [
    { id: 'text1', rows: '8', cols: '38', placeholder: 'Enter 1st section of rewriting work', text: this.rewritingSection1 },
    { id: 'text2', rows: '1', cols: '38', text: this.workTitle },
    { id: 'text3', rows: '8', cols: '38', placeholder: 'Enter 2nd section of rewriting work', text: this.rewritingSection2 }
  ];

  toggleDropdown() {
    // Toggle the dropdown
    this.dropdownActive = !this.dropdownActive
    console.log(this.dropdownActive)
  }

  getParagraph() {
    console.log(getParagraph())
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

    // Remove the dragged item from the array
    this.items.splice(event.previousIndex, 1);
    // Insert the dragged item at the target index
    this.items.splice(event.currentIndex, 0, draggedItem);

    // If the target item is defined, swap text values of the dragged item and the target item
    if (targetItem) {
      const temp = draggedItem.text;
      draggedItem.text = targetItem.text;
      targetItem.text = temp;
    }
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
    this.sorted = true;
  }

  getSortedItems() {
    if (this.sorted) {
      // iterate through items[]], create new array containing only the text property of each object
      this.inputTextResorted = this.items.map(item => item.text);
    }
  }

  getValue(val1:string, val2:string, val3:string) {
    console.warn(val1);
    this.displayVal = val1 + '\n' + val2 + '\n' + val3;
  }
  getTitle(val:string) {
    this.displayTitle = val;
  }
}

