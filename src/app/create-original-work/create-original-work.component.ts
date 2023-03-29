import { Component } from '@angular/core';
// import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-create-original-work',
  templateUrl: './create-original-work.component.html',
  styleUrls: ['./create-original-work.component.css']
})
export class CreateOriginalWorkComponent {
  email = '';
  firstName= '';
  myText: string = 'My Component is ready hihi';

  title:string = "this is my title";

  sortableList = [
    'Box 1',
    'Box 2',
    'Box 3',
    'Box 4',
    'Box 5',
  ];

  // title = 'fyp';
  // i = 0;
  // user: string | undefined = undefined;

  // getData() {
  //   console.log('Hi Yun ' + this.i);
  //   this.i++;
  //   this.user = 'Yun Chu'
  // }
}
