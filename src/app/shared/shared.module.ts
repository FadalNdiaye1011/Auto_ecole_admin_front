import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from './layout/layout.module';
import { ConfirmModalComponent } from './components/confirm-modal/confirm-modal.component';



@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    LayoutModule,
  ],
  exports :[
    LayoutModule,
  ]
})
export class SharedModule { }
