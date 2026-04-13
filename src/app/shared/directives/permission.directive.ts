import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../feature/auth/services/auth.service';
import { PermissionService } from '../../core/services/permission.service';

/**
 * Directive structurelle qui affiche l'élément uniquement si l'utilisateur
 * possède la (ou au moins une des) permission(s) requise(s).
 *
 * Usage :
 *   <button *appPermission="'cours.create'">Créer</button>
 *   <div    *appPermission="['cours.edit', 'cours.delete']">...</div>
 *   <span   *appPermission="'admin'">Admin only</span>
 */
@Directive({
  selector: '[appPermission]',
  standalone: true
})
export class PermissionDirective implements OnInit, OnDestroy {

  @Input('appPermission') permission!: string | string[];

  private sub!: Subscription;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.sub = this.authService.user$.subscribe(() => this.updateView());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private updateView(): void {
    const allowed = this.permission === 'admin'
      ? this.permissionService.isAdmin()
      : this.permissionService.hasAny(this.permission);

    if (allowed) {
      if (!this.viewContainer.length) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    } else {
      this.viewContainer.clear();
    }
  }
}
