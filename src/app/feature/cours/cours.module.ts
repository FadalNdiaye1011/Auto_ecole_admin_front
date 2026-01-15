import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoursRoutingModule } from './cours-routing.module';
import { CoursComponent } from './components/cours/cours.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { CategorieSkelletonComponent } from '../../shared/components/categorie-skelleton/categorie-skelleton.component';
import { ListSkelletonComponent } from '../../shared/components/list-skelleton/list-skelleton.component';


@NgModule({
  declarations: [
    CoursComponent
  ],
  imports: [
    CommonModule,
    CoursRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    LoaderComponent,
    ModalComponent,
    ConfirmModalComponent,
    DataTableComponent,
    EmptyStateComponent,
    CategorieSkelletonComponent,
    ListSkelletonComponent
  ]
})
export class CoursModule { }
