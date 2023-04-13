import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private router: Router) {}

  paragraphId1:string = '64213a30f469dbb6b971a5fd';
  paragraphId2:string = '643402a13129325350281be3';

  viewParagraph(paragraphId: string){
    this.router.navigate(['/create-interaction-work', paragraphId]);
  }
  
}
