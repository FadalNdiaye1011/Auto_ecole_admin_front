import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../../feature/auth/services/auth.service';
import { PermissionService } from '../../services/permission.service';

/**
 * Guard réservé aux administrateurs (is_admin = true).
 * Redirige vers /dashboard si l'utilisateur est connecté mais n'est pas admin.
 */
export const adminGuard: CanActivateFn = (_route, _state) => {
  const authService      = inject(AuthService);
  const permissionService = inject(PermissionService);
  const router           = inject(Router);

  if (!authService.isAuthenticate()) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (!permissionService.isAdmin()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
