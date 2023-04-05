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
  isButtonSaveClicked = false;
  lineSelected = false;
  entireOriginalInput = '';
  originalSection1 = '';
  originalSection2 = '';
  inputText: string = '';
  selectedLine = '';

  enableSaveButton() {
    this.isButtonSaveClicked = true;
    // this.displayText = this.inputText;
  }
  getSelectedLine() {
    this.lineSelected = true;
    console.log("title sentence is" + this.selectedLine);
  }

  goToOwnerView() {

  }
}

