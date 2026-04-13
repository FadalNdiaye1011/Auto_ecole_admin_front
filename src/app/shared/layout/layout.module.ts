import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { PermissionDirective } from '../directives/permission.directive';


@NgModule({
  declarations: [
    HeaderComponent,
    SidebarComponent,
    AdminLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    PermissionDirective,
  ],
  exports: [
    AdminLayoutComponent,
    PermissionDirective,   // ré-exporté pour les modules qui importent LayoutModule
  ],
})
export class LayoutModule { }
