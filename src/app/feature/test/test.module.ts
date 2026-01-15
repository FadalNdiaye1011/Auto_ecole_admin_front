import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TestRoutingModule } from './test-routing.module';
import { TestComponent } from './components/test/test.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { CategorieSkelletonComponent } from '../../shared/components/categorie-skelleton/categorie-skelleton.component';
import { FormTestExamenSkelletonComponent } from '../../shared/components/form-test-examen-skelleton/form-test-examen-skelleton.component';


@NgModule({
  declarations: [
    TestComponent
  ],
  imports: [
    CommonModule,
    TestRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    LoaderComponent,
    ModalComponent,
    ConfirmModalComponent,
    DataTableComponent,
    EmptyStateComponent,
    CategorieSkelletonComponent,
    FormTestExamenSkelletonComponent
  ]
})
export class TestModule { }
