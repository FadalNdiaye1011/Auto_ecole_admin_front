import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../feature/auth/services/auth.service';
import { PermissionService } from '../services/permission.service';

/**
 * Guard de permission sur les routes.
 *
 * Usage dans app.routes.ts :
 *   {
 *     path: 'cours',
 *     data: { permission: 'cours.view' },
 *     canActivate: [permissionGuard],
 *     loadChildren: ...
 *   }
 *
 * - Si pas connecté      → /auth/login
 * - Si pas la permission → /403
 * - Sinon               → accès accordé
 */
export const permissionGuard: CanActivateFn = (route, _state) => {
  const authService       = inject(AuthService);
  const permissionService = inject(PermissionService);
  const router            = inject(Router);

  if (!authService.isAuthenticate()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const permission = route.data['permission'] as string | undefined;

  if (!permission || permissionService.has(permission)) {
    return true;
  }

  router.navigate(['/403']);
  return false;
};
