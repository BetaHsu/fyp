import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  items = [
    { placeholder: 'Enter text 1', text: '123' },
    { placeholder: 'Enter text 2', text: '456' },
    { placeholder: 'Enter text 3', text: '789' },
  ];

  private sortedItems: string[] = [];

  drop(event: CdkDragDrop<any[]>) {
    const draggedItem = this.items[event.previousIndex];
    const targetItem = this.items[event.currentIndex];

    // Remove the dragged item from the array
    this.items.splice(event.previousIndex, 1);
    // Insert the dragged item at the target index
    this.items.splice(event.currentIndex, 0, draggedItem);

    // If the target item is defined, swap the text values of the dragged item and the target item
    if (targetItem) {
      const temp = draggedItem.text;
      draggedItem.text = targetItem.text;
      targetItem.text = temp;
    }

    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
  }

  getSortedItems() {
    this.sortedItems = this.items.map(item => item.text);
    console.log(this.sortedItems);
  }
}
