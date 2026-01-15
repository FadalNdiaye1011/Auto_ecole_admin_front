export interface AutoEcole {
  id: number;
  nom: string;
  numero: string;
  logo: string;
  region_id: number;
  region: string;
  created_at: string;
  updated_at: string;
}

export interface Region {
  id: number;
  libelle: string;
  auto_ecoles: AutoEcole[];
}

export interface ApiResponse {
  message: string;
  status: boolean;
  code: number;
  data: Region[];
}
