import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';
import { CreateOriginalWorkComponent } from './create-original-work/create-original-work.component';
import { CreateInteractionWorkComponent } from './create-interaction-work/create-interaction-work.component';
import { OnboardingComponent } from './onboarding/onboarding.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CreateOriginalWorkComponent,
    CreateInteractionWorkComponent,
    OnboardingComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    DragDropModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
