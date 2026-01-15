import { Component, ViewChild } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: false,
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  @ViewChild(SidebarComponent) sidebar!: SidebarComponent;
  isSidebarExpanded = true;

  onSidebarToggled(isExpanded: boolean): void {
    this.isSidebarExpanded = isExpanded;
  }


  constructor() { }

  ngOnInit(): void {
  }

  // onSidebarToggled(expanded: boolean): void {
  //   // Ajuster éventuellement la disposition en fonction de l'état de la sidebar
  //   console.log('Sidebar expanded:', expanded);
  // }

  toggleMobileMenu(): void {
    if (this.sidebar) {
      this.sidebar.toggleMobileMenu();
    }
  }

}
