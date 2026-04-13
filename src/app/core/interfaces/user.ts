export interface User {
  id: number
  nom: string
  prenom: string
  email: string
  numero: string
  provider: string
  provider_id: string
  is_admin: boolean
  permissions: string[]  // ex: ['cours.view', 'cours.create']
  created_at: string
  updated_at: string
}
