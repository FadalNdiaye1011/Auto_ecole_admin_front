import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './shared/layout/components/admin-layout/admin-layout.component';
import { ForbiddenComponent } from './shared/components/forbidden/forbidden.component';
import { authGuard } from './core/guards/Auth/auth.guard';
import { notRetainAuthGuard } from './core/guards/NoteRetainAuth/not-retain-auth.guard';
import { adminGuard } from './core/guards/admin/admin.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [

  // Redirection par défaut
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // Authentification (non connectés uniquement)
  {
    path: 'auth',
    canActivate: [notRetainAuthGuard],
    loadChildren: () => import('./feature/auth/auth.module').then(m => m.AuthModule)
  },

  // Page d'accès refusé (accessible à tous les utilisateurs connectés)
  { path: '403', component: ForbiddenComponent },

  // Zone protégée — connexion requise
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [permissionGuard],
        data: { permission: 'dashboard.view' },
        loadChildren: () => import('./feature/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'cours',
        canActivate: [permissionGuard],
        data: { permission: 'cours.view' },
        loadChildren: () => import('./feature/cours/cours.module').then(m => m.CoursModule)
      },
      {
        path: 'tests',
        canActivate: [permissionGuard],
        data: { permission: 'tests.view' },
        loadChildren: () => import('./feature/test/test.module').then(m => m.TestModule)
      },
      {
        path: 'examens',
        canActivate: [permissionGuard],
        data: { permission: 'examens.view' },
        loadChildren: () => import('./feature/examen/examen.module').then(m => m.ExamenModule)
      },
      {
        path: 'panneaux',
        canActivate: [permissionGuard],
        data: { permission: 'panneaux.view' },
        loadChildren: () => import('./feature/panneau/panneau.module').then(m => m.PanneauModule)
      },
      {
        path: 'auto-ecole',
        canActivate: [permissionGuard],
        data: { permission: 'auto_ecole.view' },
        loadChildren: () => import('./feature/auto-ecole/auto-ecole.module').then(m => m.AutoEcoleModule)
      },
      // Gestion des utilisateurs — admin uniquement
      {
        path: 'users',
        canActivate: [adminGuard],
        loadChildren: () => import('./feature/user/user.module').then(m => m.UserModule)
      },
    ]
  },

  // Fallback
  { path: '**', redirectTo: 'auth/login' }
];
