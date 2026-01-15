import { CanActivateFn, Router } from '@angular/router';

import { inject } from '@angular/core';
import { AuthService } from '../../../feature/auth/services/auth.service';

export const notRetainAuthGuard: CanActivateFn = (route, state) => {
    const autService = inject(AuthService);
    const router = inject(Router);

    if(autService.isAuthenticate()){
      router.navigateByUrl("dashboard");
      return false;
    }
    return true;
};
