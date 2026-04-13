import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../feature/auth/services/auth.service';
import { PermissionService } from '../../../../core/services/permission.service';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
  /** Permission requise pour voir cet élément (ex: 'cours.view'). Absent = visible par tous. */
  permission?: string;
  /** Si true, visible uniquement pour les administrateurs. */
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {

  isExpanded = true;
  mobileMenuOpen = false;

  @Output() sidebarToggled = new EventEmitter<boolean>();

  private readonly allMenuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      permission: 'dashboard.view',
      icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
    },
    {
      label: 'Cours',
      route: '/cours',
      permission: 'cours.view',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
    },
    {
      label: 'Tests',
      route: '/tests',
      permission: 'tests.view',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
    },
    {
      label: 'Examens',
      route: '/examens',
      permission: 'examens.view',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      label: 'Panneaux',
      route: '/panneaux',
      permission: 'panneaux.view',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z'
    },
    {
      label: 'Auto École',
      route: '/auto-ecole',
      permission: 'auto_ecole.view',
      icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
    },
    {
      label: 'Utilisateurs',
      route: '/users',
      adminOnly: true,
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'
    },
  ];

  menuItems: MenuItem[] = [];
  private sub!: Subscription;

  constructor(private permissionService: PermissionService, private authService: AuthService) {}

  ngOnInit(): void {
    if (window.innerWidth < 1024) {
      this.isExpanded = false;
    }
    this.sub = this.authService.user$.subscribe(() => this.buildMenu());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private buildMenu(): void {
    this.menuItems = this.allMenuItems.filter(item => {
      if (item.adminOnly) return this.permissionService.isAdmin();
      if (item.permission) return this.permissionService.has(item.permission);
      return true;
    });
  }

  toggleSidebar(): void {
    this.isExpanded = !this.isExpanded;
    this.sidebarToggled.emit(this.isExpanded);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
