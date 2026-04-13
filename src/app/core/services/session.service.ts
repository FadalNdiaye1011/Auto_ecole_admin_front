import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../feature/auth/services/auth.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class SessionService {

  /** Durée maximale d'une session : 1 heure */
  private static readonly DURATION = 60 * 60 * 1000;

  private timerId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  /**
   * Démarre (ou redémarre) le timer de session.
   * Calcule le temps restant à partir du timestamp sauvegardé au moment du login.
   */
  start(): void {
    this.cancel();

    const loginTime = this.authService.getLoginTime();
    const elapsed   = loginTime ? Date.now() - loginTime : 0;
    const remaining = SessionService.DURATION - elapsed;

    if (remaining <= 0) {
      this.expire();
      return;
    }

    this.timerId = setTimeout(() => this.expire(), remaining);
  }

  /** Annule le timer en cours (ex : lors d'une déconnexion manuelle). */
  cancel(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private expire(): void {
    if (!this.authService.isAuthenticate()) return; // déjà déconnecté
    this.cancel();
    this.authService.clearSession();
    this.toastService.info('Votre session a expiré. Veuillez vous reconnecter.');
    this.router.navigate(['/auth/login']);
  }
}
