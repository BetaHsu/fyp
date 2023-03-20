import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateInteractionWorkComponent } from './create-interaction-work/create-interaction-work.component';
import { CreateOriginalWorkComponent } from './create-original-work/create-original-work.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent },
  {
    path: 'create-original-work', 
    component: CreateOriginalWorkComponent
  },
  {
    path: 'create-interaction-work', 
    component: CreateInteractionWorkComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }