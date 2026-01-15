import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ExamenComponent} from '../examen/components/examen/examen.component';
import {AutoEcoleComponent} from './components/auto-ecole/auto-ecole.component';

const routes: Routes = [
  {
    path:'',
    component:AutoEcoleComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AutoEcoleRoutingModule { }
