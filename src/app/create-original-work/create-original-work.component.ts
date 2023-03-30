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
  workTitle: string = 'A long journey from bush to concrete';
  i = 0;

  view = 0;
  views = ['Interaction', 'Community', 'Public', 'Owner'];
  dropdownActive = false;

  paragraph: any = undefined;

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
  example_paragraph = document.getElementById('paragraph');
  text = "Through decades that ran like rivers, endless rivers of endless woes. "
  metadata = [
    { index_interval_start: 0, index_interval_end: 5, revealed_score: 1 },
    { index_interval_start: 6, index_interval_end: this.text.length, revealed_score: 0 },
  ];
  
  get output(): string {
    let spanIndex = 0;
    let output = '';
    this.metadata.forEach((data) => {
      // add visible span
      if (data.revealed_score === 1) {
        const visibleSpan = `<span class="visible">${this.text.slice(data.index_interval_start, data.index_interval_end)}</span>`;
        output += visibleSpan;
      }
      // add hidden span
      if (data.revealed_score === 0) {
        const hiddenSpan = `<span class="hidden">${this.text.slice(data.index_interval_start, data.index_interval_end)}</span>`;
        output += hiddenSpan;
      }
    });
    return output;
  }

  ngOnInit(): void {
    this.getParagraph();
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
    // if (this.sorted) {
      // iterate through items[], create new array containing only the text property of each object
      this.inputTextResorted = this.items.map(item => item.text);
      console.log(this.inputTextResorted);
    // }
  }

  // getValue(val1:string, val2:string, val3:string) {
  //   console.warn(val1);
  //   this.displayVal = val1 + '\n' + val2 + '\n' + val3;
  // }
  getTitle(val:string) {
    this.displayTitle = val;
  }
}


