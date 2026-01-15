import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, finalize } from 'rxjs';
import { AlertService } from '../../../../core/services/Alert/alert.service';
import { AuthService } from '../../../../feature/auth/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Output() menuToggled = new EventEmitter<void>();

  currentPageTitle = 'Dashboard';
  userName = 'Jean Dupont';
  userInitials = 'JD';
  unreadNotifications = 3;
  profileMenuOpen = false;
  pageProgress = 0;
  isLoading: boolean = false;

  constructor(private router: Router,private alertService:AlertService,private authservice:AuthService) { }

  ngOnInit(): void {
    // Surveiller les changements de route pour mettre à jour le titre
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Extraire le nom de la page à partir de l'URL
      const urlSegments = event.url.split('/');
      if (urlSegments.length > 1) {
        const pageName = urlSegments[1];
        this.setPageTitle(pageName);
      }
    });

    // Animation initiale de la barre de progression
    this.animateProgressBar();
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
              localStorage.clear();
              this.router.navigate(['/auth/login'])
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
