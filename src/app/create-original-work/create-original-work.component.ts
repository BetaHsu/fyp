import { Component } from '@angular/core';

@Component({
  selector: 'app-create-original-work',
  templateUrl: './create-original-work.component.html',
  styleUrls: ['./create-original-work.component.css']
})
export class CreateOriginalWorkComponent {
  title = 'fyp';
  i = 0;
  user: string | undefined = undefined;

  getData() {
    console.log('Hi Yun ' + this.i);
    this.i++;
    this.user = 'Yun Chu'
  }
}
