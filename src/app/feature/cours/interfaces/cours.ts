export interface Cours {
  id: string;
  libelle: string;
  description: string;
  fichier?: File | string;
  prix: number;
  categorie_cours_id: string | number;
  unite_expiration: string;
  duree_expiration: number;
  created_at?: string;
  updated_at?: string;
}
