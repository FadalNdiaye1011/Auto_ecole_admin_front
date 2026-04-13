import { Injectable } from '@angular/core';
import { AuthService } from '../../feature/auth/services/auth.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {

  constructor(private authService: AuthService) {}

  isAdmin(): boolean {
    return this.authService.getUser()?.is_admin === true;
  }

  /** Liste des permissions de l'utilisateur courant. */
  getPermissions(): string[] {
    if (this.isAdmin()) return [];   // admin bypasse tout
    return this.authService.getUser()?.permissions ?? [];
  }

  /** Vérifie si l'utilisateur possède UNE permission précise. */
  has(permission: string): boolean {
    if (this.isAdmin()) return true;
    return this.getPermissions().includes(permission);
  }

  /** Vérifie si l'utilisateur possède AU MOINS UNE des permissions listées. */
  hasAny(permissions: string | string[]): boolean {
    if (this.isAdmin()) return true;
    const list = Array.isArray(permissions) ? permissions : [permissions];
    return list.some(p => this.getPermissions().includes(p));
  }

  /** Vérifie si l'utilisateur possède TOUTES les permissions listées. */
  hasAll(permissions: string[]): boolean {
    if (this.isAdmin()) return true;
    return permissions.every(p => this.getPermissions().includes(p));
  }
}
