# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:4200
npm run build      # Production build → dist/auto-ecole/
npm test           # Unit tests with Karma/Jasmine
npm run lint       # ESLint (angular-eslint) on src/**/*.ts and src/**/*.html
ng generate component path/to/name  # Scaffold a new component
```

Run a single spec file:
```bash
ng test --include='**/cours.service.spec.ts'
```

## Architecture

### Module structure

The app uses **feature modules with lazy loading** nested under an `AdminLayoutComponent` shell. All protected routes require `authGuard`; the `/auth` path uses `notRetainAuthGuard` to redirect already-authenticated users away.

```
src/app/
  core/             # Guards, interceptors, base service, shared interfaces
  feature/          # One NgModule per domain: auth, dashboard, cours, test, examen, panneau, auto-ecole, user
  shared/
    components/     # Standalone reusable UI components
    layout/         # AdminLayout + Header + Sidebar (NgModule)
    directives/     # permission.directive
```

### Base service pattern

Every feature service extends `ParentService` (`core/services/parent.service.ts`), which wraps `HttpClient` with typed helpers (`getData`, `postData`, `putData`, `deleteData`, `show`). All calls are relative to `environment.apiRoot` (`https://backendauto.quincailleriekeurserignefallou.com/api/`).

### Auth

- JWT token stored in `localStorage` under key `${appName}_token` (e.g., `autoEcole_token`).
- User object stored under `autoEcole_user`.
- `injectTokenInterceptor` automatically adds `Authorization: Bearer <token>` to every request.
- `captErrorInterceptor` handles API error responses globally.

### Shared UI components (standalone)

| Component | Purpose |
|-----------|---------|
| `DataTableComponent` | Generic list/table with edit/delete/view actions |
| `ModalComponent` / `ModalFormComponent` | Generic modal wrappers |
| `ConfirmDialogComponent` / `ConfirmModalComponent` | Delete confirmations |
| `ToastComponent` | Notification toasts (via `ToastService`) |
| `AlertService` | Wraps SweetAlert2 for confirm dialogs |
| `SearchFilterComponent` | Live search input |
| `EmptyStateComponent` | Empty list placeholder |
| Skeleton components | `CategorieSkelleton`, `ListSkelleton`, `FormTestExamenSkelleton` |

### State management

Feature components use Angular **signals** (`signal<T[]>`, `.set()`, `.update()`) for local reactive state. No external state library is used.

### Feature module conventions

Feature components are **not standalone** (declared in their NgModule). Shared standalone components are imported directly into each feature module's `imports` array.

Each feature module follows the same pattern:
- `interfaces/` — domain types (e.g., `Cours`, `CategorieCours`)
- `services/feature.service.ts` — extends `ParentService`
- `components/feature/` — main component (CRUD pattern: categories + items within a category)

### Deployment

Docker multi-stage build: Node 20 Alpine → Angular production build → Nginx Alpine serving `dist/auto-ecole/browser`. Kubernetes manifests are in `k8s/`.
