import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { UserRoutingModule } from './user-routing.module';
import { UserListComponent } from './components/user-list/user-list.component';
import { PermissionDirective } from '../../shared/directives/permission.directive';


@NgModule({
  declarations: [
    UserListComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UserRoutingModule,
    PermissionDirective,
  ]
})
export class UserModule { }
