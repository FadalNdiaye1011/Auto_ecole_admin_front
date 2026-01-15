import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PanneauComponent } from './components/panneau/panneau.component';

const routes: Routes = [
  {
    path:'',
    component:PanneauComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PanneauRoutingModule { }
