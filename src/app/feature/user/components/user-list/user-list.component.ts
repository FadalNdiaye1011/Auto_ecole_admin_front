import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminUser, PermissionGroup } from '../../interfaces/admin-user';
import { UserManagementService } from '../../services/user-management.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AlertService } from '../../../../core/services/Alert/alert.service';

const MODULE_LABELS: Record<string, string> = {
  dashboard:  'Tableau de bord',
  cours:      'Cours',
  examens:    'Examens',
  tests:      'Tests',
  panneaux:   'Panneaux',
  auto_ecole: 'Auto-École',
};

const MODULE_BADGE_CLASSES: Record<string, string> = {
  dashboard:  'bg-green-100 text-green-700',
  cours:      'bg-blue-100 text-blue-700',
  examens:    'bg-violet-100 text-violet-700',
  tests:      'bg-amber-100 text-amber-700',
  panneaux:   'bg-orange-100 text-orange-700',
  auto_ecole: 'bg-teal-100 text-teal-700',
};

const ACTION_LABELS: Record<string, string> = {
  view:   'Consulter',
  create: 'Créer',
  edit:   'Modifier',
  delete: 'Supprimer',
};

@Component({
  selector: 'app-user-list',
  standalone: false,
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {

  users: AdminUser[] = [];
  permissionGroups: PermissionGroup[] = [];

  isLoadingUsers = true;
  isSubmitting = false;

  // ── Modale Créer un utilisateur ──────────────────────────────────────
  showCreateModal = false;
  createForm: FormGroup;

  // ── Modale Gérer les permissions ─────────────────────────────────────
  showPermissionsModal = false;
  selectedUser: AdminUser | null = null;
  /** État des checkboxes : permission.name → coché/décoché */
  permissionState: Record<string, boolean> = {};
  isSavingPermissions = false;

  readonly actionLabels = ACTION_LABELS;

  constructor(
    private userService: UserManagementService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private alertService: AlertService
  ) {
    this.createForm = this.fb.group({
      nom:                   ['', Validators.required],
      prenom:                ['', Validators.required],
      email:                 ['', [Validators.required, Validators.email]],
      numero:                ['', Validators.required],
      password:              ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadPermissions();
  }

  // ── Chargement ───────────────────────────────────────────────────────

  loadUsers(): void {
    this.isLoadingUsers = true;
    this.userService.getUsers().subscribe({
      next: (res) => {
        this.users = res.data;
        this.isLoadingUsers = false;
      },
      error: () => {
        this.isLoadingUsers = false;
        this.toastService.error('Erreur lors du chargement des utilisateurs');
      }
    });
  }

  loadPermissions(): void {
    this.userService.getAvailablePermissions().subscribe({
      next: (res) => {
        // On utilise le `grouped` retourné par l'API et on ajoute le label FR
        this.permissionGroups = res.data.grouped.map(g => ({
          module: g.module,
          label: MODULE_LABELS[g.module] ?? g.module,
          permissions: g.permissions
        }));
      },
      error: () => this.toastService.error('Erreur lors du chargement des permissions')
    });
  }

  // ── Badges colorés par module ────────────────────────────────────────

  /** Extrait les modules uniques présents dans la liste de permissions d'un utilisateur. */
  getModuleBadges(permissions: string[]): { module: string; label: string; count: number }[] {
    const counts: Record<string, number> = {};
    for (const p of permissions) {
      const module = p.split('.')[0];
      counts[module] = (counts[module] ?? 0) + 1;
    }
    return Object.entries(counts).map(([module, count]) => ({
      module,
      label: MODULE_LABELS[module] ?? module,
      count
    }));
  }

  getModuleBadgeClass(module: string): string {
    return MODULE_BADGE_CLASSES[module] ?? 'bg-gray-100 text-gray-600';
  }

  // ── Créer un utilisateur ─────────────────────────────────────────────

  openCreateModal(): void {
    this.createForm.reset();
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.userService.createUser(this.createForm.value).subscribe({
      next: (res) => {
        this.users = [...this.users, res.data];
        this.closeCreateModal();
        this.toastService.success('Utilisateur créé avec succès');
        this.isSubmitting = false;
      },
      error: (err) => {
        // 422 : erreurs de validation Laravel → affichage champ par champ
        if (err.status === 422 && err.error?.errors) {
          Object.entries(err.error.errors).forEach(([field, messages]) => {
            const control = this.createForm.get(field);
            if (control) control.setErrors({ serverError: (messages as string[])[0] });
          });
        } else {
          this.toastService.error(err.error?.message ?? 'Erreur lors de la création');
        }
        this.isSubmitting = false;
      }
    });
  }

  // ── Gérer les permissions ────────────────────────────────────────────

  openPermissionsModal(user: AdminUser): void {
    this.selectedUser = user;
    this.permissionState = {};
    user.permissions.forEach(p => this.permissionState[p] = true);
    this.showPermissionsModal = true;
  }

  closePermissionsModal(): void {
    this.showPermissionsModal = false;
    this.selectedUser = null;
    this.permissionState = {};
  }

  togglePermission(name: string): void {
    this.permissionState = { ...this.permissionState, [name]: !this.permissionState[name] };
  }

  toggleModule(group: PermissionGroup): void {
    const allSelected = group.permissions.every(p => this.permissionState[p.name]);
    const next = { ...this.permissionState };
    group.permissions.forEach(p => next[p.name] = !allSelected);
    this.permissionState = next;
  }

  isModuleFullySelected(group: PermissionGroup): boolean {
    return group.permissions.length > 0 &&
           group.permissions.every(p => this.permissionState[p.name]);
  }

  isModulePartiallySelected(group: PermissionGroup): boolean {
    const n = group.permissions.filter(p => this.permissionState[p.name]).length;
    return n > 0 && n < group.permissions.length;
  }

  countSelectedPermissions(): number {
    return Object.values(this.permissionState).filter(Boolean).length;
  }

  countSelectedInGroup(group: PermissionGroup): number {
    return group.permissions.filter(p => this.permissionState[p.name]).length;
  }

  savePermissions(): void {
    if (!this.selectedUser) return;
    this.isSavingPermissions = true;
    const permissions = Object.entries(this.permissionState)
      .filter(([, v]) => v)
      .map(([k]) => k);

    this.userService.syncPermissions(this.selectedUser.id, permissions).subscribe({
      next: (res) => {
        const idx = this.users.findIndex(u => u.id === this.selectedUser!.id);
        if (idx !== -1) {
          this.users = [
            ...this.users.slice(0, idx),
            { ...this.users[idx], permissions: res.data.permissions },
            ...this.users.slice(idx + 1)
          ];
        }
        this.closePermissionsModal();
        this.toastService.success('Permissions mises à jour');
        this.isSavingPermissions = false;
      },
      error: () => {
        this.toastService.error('Erreur lors de la mise à jour des permissions');
        this.isSavingPermissions = false;
      }
    });
  }

  // ── Supprimer ────────────────────────────────────────────────────────

  deleteUser(user: AdminUser): void {
    this.alertService.showConfirmation(
      'Supprimer l\'utilisateur',
      `Supprimer "${user.nom} ${user.prenom}" ? Cette action est irréversible.`
    ).then(result => {
      if (result.isConfirmed) {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.users = this.users.filter(u => u.id !== user.id);
            this.toastService.success('Utilisateur supprimé');
          },
          error: () => this.toastService.error('Erreur lors de la suppression')
        });
      }
    });
  }

  trackById(_: number, item: AdminUser): number { return item.id; }
}
