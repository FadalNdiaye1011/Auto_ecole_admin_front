import { Cours } from "./cours";

export interface CategorieCours {
  id: string;
  libelle: string;
  created_at?: string;
  updated_at?: string;
  cours?:Cours[];
}

