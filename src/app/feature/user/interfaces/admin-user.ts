export interface AdminUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  numero: string;
  is_admin: boolean;
  permissions: string[];   // noms des permissions, ex: ['cours.view', 'cours.create']
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;            // 'cours.create'
  label: string;           // 'Créer des cours'
  module: string;          // 'cours'
  action: 'view' | 'create' | 'edit' | 'delete';
}

/** Groupe retourné par GET /api/admin/permissions dans data.grouped */
export interface ApiPermissionGroup {
  module: string;
  permissions: Permission[];
}

/** data.grouped + label ajouté côté frontend */
export interface PermissionGroup {
  module: string;
  label: string;
  permissions: Permission[];
}

/** Structure complète de data pour GET /api/admin/permissions */
export interface PermissionsApiResponse {
  all: Permission[];
  grouped: ApiPermissionGroup[];
}
