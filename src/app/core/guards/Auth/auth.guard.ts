import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../../feature/auth/services/auth.service';


export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isAuthenticate()) {
    return true;
  }
  const returnUrl = encodeURIComponent(state.url);
    router.navigate(['/auth/login'], { queryParams: { returnUrl } });
    return false;
};
