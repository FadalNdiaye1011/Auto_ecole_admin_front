import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExamenRoutingModule } from './examen-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { CategorieSkelletonComponent } from '../../shared/components/categorie-skelleton/categorie-skelleton.component';
import { ExamenComponent } from './components/examen/examen.component';
import { FormTestExamenSkelletonComponent } from '../../shared/components/form-test-examen-skelleton/form-test-examen-skelleton.component';
import { ListSkelletonComponent } from '../../shared/components/list-skelleton/list-skelleton.component';


@NgModule({
  declarations: [
    ExamenComponent
  ],
  imports: [
    CommonModule,
    ExamenRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    LoaderComponent,
    ModalComponent,
    ConfirmModalComponent,
    DataTableComponent,
    EmptyStateComponent,
    CategorieSkelletonComponent,
    FormTestExamenSkelletonComponent,
    ListSkelletonComponent,
  ]
})
export class ExamenModule { }
