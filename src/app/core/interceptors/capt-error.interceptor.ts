import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../feature/auth/services/auth.service';
import { SessionService } from '../services/session.service';
import { ToastService } from '../services/toast.service';

export const captErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router         = inject(Router);
  const toastService   = inject(ToastService);
  const authService    = inject(AuthService);
  const sessionService = inject(SessionService);

  return next(req).pipe(
    catchError(error => {
      switch (error.status) {

        case 401:
          // Token expiré ou invalide → déconnexion et redirection
          sessionService.cancel();
          authService.clearSession();
          router.navigate(['/auth/login']);
          break;

        case 403:
          // Permission manquante
          toastService.error('Accès refusé : vous n\'avez pas la permission d\'effectuer cette action.');
          break;

        case 422:
          // Erreur de validation Laravel — chaque composant gère ses champs via setErrors().
          // On n'affiche rien ici pour éviter le double affichage.
          break;

        case 500:
        case 503:
          toastService.error('Erreur serveur. Veuillez réessayer plus tard.');
          break;
      }

      // On relaie toujours l'erreur pour que les composants puissent la traiter
      return throwError(() => error);
    })
  );
};
