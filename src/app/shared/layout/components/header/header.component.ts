import { Component, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, finalize, Subscription } from 'rxjs';
import { AlertService } from '../../../../core/services/Alert/alert.service';
import { AuthService } from '../../../../feature/auth/services/auth.service';
import { SessionService } from '../../../../core/services/session.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() menuToggled = new EventEmitter<void>();

  currentPageTitle = 'Dashboard';
  userName = '';
  userInitials = '';
  unreadNotifications = 3;
  profileMenuOpen = false;
  pageProgress = 0;
  isLoading = false;
  isRefreshing = false;

  private sub!: Subscription;

  constructor(
    private router: Router,
    private alertService: AlertService,
    private authservice: AuthService,
    private sessionService: SessionService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.sub = this.authservice.user$.subscribe(user => this.updateUserDisplay(user));

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const urlSegments = event.url.split('/');
      if (urlSegments.length > 1) {
        this.setPageTitle(urlSegments[1]);
      }
    });

    this.animateProgressBar();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private updateUserDisplay(user: any): void {
    if (!user) return;
    const nom = user.nom ?? '';
    const prenom = user.prenom ?? '';
    this.userName = [prenom, nom].filter(Boolean).join(' ') || user.email || '';
    this.userInitials = ((prenom[0] ?? '') + (nom[0] ?? '')).toUpperCase() || 'U';
  }

  refreshPermissions(): void {
    this.isRefreshing = true;
    this.authservice.refreshMe().pipe(
      finalize(() => this.isRefreshing = false)
    ).subscribe({
      next: () => this.toastService.success('Permissions mises à jour'),
      error: () => {}   // 401 handled by interceptor (redirect to login)
    });
  }

  // Fermer le menu profil quand on clique en dehors
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Logique pour fermer le menu si on clique en dehors
  }

  setPageTitle(pageName: string): void {
    // Convertir le premier caractère en majuscule
    if (pageName) {
      const formattedName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
      this.currentPageTitle = formattedName;
    } else {
      this.currentPageTitle = 'Dashboard';
    }

    // Réinitialiser et animer la barre de progression
    this.pageProgress = 0;
    this.animateProgressBar();
  }

  toggleMobileMenu(): void {
    this.menuToggled.emit();
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  // logout(): void {
  //   // Logique de déconnexion
  //   this.router.navigate(['/auth/login']);
  // }


  logout(): void {
    this.alertService.showConfirmation("Déconnexion", "Voulez-vous vraiment vous déconnecter ?").then((result) => {
      if (result.isConfirmed) {  // Vérifiez si l'utilisateur a confirmé
        const token = this.authservice.getToken();

        if (!token) {
          this.alertService.showAlert({
            title: "Erreur",
            text: "Token introuvable, déconnexion impossible",
            icon: "error"
          });
          return;
        }

        const data = {
          'token': token
        }

        this.isLoading = true;
        // Envoyez un objet vide comme données, le token sera dans le header
        this.authservice.postData('users/logout', data).pipe(
          finalize(() => this.isLoading = false)
        ).subscribe({
          next: (response: any) => {
            if (response.status) {
              this.sessionService.cancel();
              this.authservice.clearSession();
              this.router.navigate(['/auth/login']);
            } else {
              this.alertService.showAlert({
                title: "Erreur",
                text: "La déconnexion a échoué",
                icon: "error"
              });
            }
          },
          error: (error) => {
            console.log(error);
            this.alertService.showAlert({
              title: "Erreur",
              text: error.message || "Une erreur est survenue lors de la déconnexion",
              icon: "warning"
            });
          }
        });
      }
    });
  }

  private animateProgressBar(): void {
    // Animation de la barre de progression
    setTimeout(() => { this.pageProgress = 30; }, 100);
    setTimeout(() => { this.pageProgress = 60; }, 200);
    setTimeout(() => { this.pageProgress = 100; }, 400);
  }
}
