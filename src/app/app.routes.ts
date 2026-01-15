import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './shared/layout/components/admin-layout/admin-layout.component';
import { authGuard } from './core/guards/Auth/auth.guard';
import { notRetainAuthGuard } from './core/guards/NoteRetainAuth/not-retain-auth.guard';

export const routes: Routes = [
  // Routes pour les utilisateurs non authentifiés
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate : [notRetainAuthGuard],
    loadChildren: () => import('./feature/auth/auth.module').then(m => m.AuthModule)
  },

  // Routes pour les utilisateurs authentifiés (avec AdminLayout)
  {
    path: '',
    component: AdminLayoutComponent, // Layout avec sidebar et header
    canActivate: [authGuard],      // Protection par AuthGuard
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./feature/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'cours',
        loadChildren: () => import('./feature/cours/cours.module').then(m => m.CoursModule)
      },
      {
        path: 'tests',
        loadChildren: () => import('./feature/test/test.module').then(m => m.TestModule)
      },
      {
        path: 'examens',
        loadChildren: () => import('./feature/examen/examen.module').then(m => m.ExamenModule)
      },
      {
        path: 'panneaux',
        loadChildren: () => import('./feature/panneau/panneau.module').then(m => m.PanneauModule)
      },
      {
        path: 'auto-ecole',
        loadChildren: () => import('./feature/auto-ecole/auto-ecole.module').then(m => m.AutoEcoleModule)
      },

    ]
  },

  // Redirection page non trouvée
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
