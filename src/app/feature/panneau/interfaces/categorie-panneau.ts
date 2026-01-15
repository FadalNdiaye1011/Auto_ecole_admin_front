import { Panneaux } from "./panneau"

export interface CategoriePanneau {
  id: string
  libelle: string
  created_at?: string
  updated_at?: string
  panneaux?: Panneaux[]
}
