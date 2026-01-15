import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PanneauRoutingModule } from './panneau-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { CategorieSkelletonComponent } from '../../shared/components/categorie-skelleton/categorie-skelleton.component';
import { PanneauComponent } from './components/panneau/panneau.component';


@NgModule({
  declarations: [
    PanneauComponent
  ],
  imports: [
    CommonModule,
    PanneauRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    LoaderComponent,
    ModalComponent,
    ConfirmModalComponent,
    DataTableComponent,
    EmptyStateComponent,
    CategorieSkelletonComponent,
  ]
})
export class PanneauModule { }
