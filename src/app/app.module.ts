import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';
import { CreateOriginalWorkComponent } from './create-original-work/create-original-work.component';
import { CreateInteractionWorkComponent } from './create-interaction-work/create-interaction-work.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CreateOriginalWorkComponent,
    CreateInteractionWorkComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
