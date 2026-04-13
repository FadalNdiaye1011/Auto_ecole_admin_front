export interface DashboardKpis {
  total_utilisateurs: number;
  nouveaux_utilisateurs_mois: number;
  nouveaux_utilisateurs_semaine: number;
  total_cours_vendus: number;
  cours_vendus_mois: number;
  total_examens_achetes: number;
  examens_achetes_mois: number;
  revenus_cours: number;
  revenus_examens: number;
  revenus_total: number;
  revenus_mois: number;
  total_tentatives_tests: number;
  tentatives_tests_mois: number;
  total_tentatives_examens: number;
  tentatives_examens_mois: number;
  total_cours: number;
  total_examens: number;
}

export interface RevenuMensuel {
  mois: string;
  periode: string;
  revenus_cours: number;
  revenus_examens: number;
  revenus_total: number;
  ventes_cours: number;
  ventes_examens: number;
}

export interface TopCours {
  id: string;
  libelle: string;
  prix: number;
  categorie: string;
  total_ventes: number;
  revenus_generes: number;
}

export interface TopExamen {
  id: string;
  libelle: string;
  montant_vendu: number;
  categorie: string;
  total_achats: number;
  revenus_generes: number;
  total_tentatives: number;
}

export interface TopUtilisateurDepenses {
  id: number;
  nom: string;
  email: string;
  total_depense: number;
  cours_achetes: number;
  examens_achetes: number;
}

export interface TopUtilisateurActivite {
  id: number;
  nom: string;
  email: string;
  tentatives_tests: number;
  tentatives_examens: number;
  total_activite: number;
}

export interface VenteCategorie {
  id: string;
  libelle: string;
  total_ventes?: number;
  total_achats?: number;
  revenus: number;
}

export interface ActiviteFlux {
  type: 'achat_cours' | 'achat_examen' | 'tentative_test' | 'tentative_examen' | 'inscription';
  date: string;
  utilisateur: string;
  email: string;
  cours?: string | null;
  examen?: string | null;
  test?: string | null;
  montant?: number | null;
  expiration?: string | null;
}

export interface TauxParItem {
  id: string;
  libelle: string;
  total_tentatives: number;
  taux_reussite: number;
}

export interface TauxReussite {
  taux_global: number;
  taux_global_examens: number;
  taux_global_tests: number;
  par_examen: TauxParItem[];
  par_test: TauxParItem[];
}

export interface DashboardData {
  kpis: DashboardKpis;
  revenus_mensuels: RevenuMensuel[];
  top_cours: TopCours[];
  top_examens: TopExamen[];
  top_utilisateurs: {
    par_depenses: TopUtilisateurDepenses[];
    par_activite: TopUtilisateurActivite[];
  };
  ventes_par_categorie: {
    cours: VenteCategorie[];
    examens: VenteCategorie[];
  };
  activite_recente: {
    flux: ActiviteFlux[];
    derniers_achats_cours: any[];
    derniers_achats_examens: any[];
    dernieres_tentatives_tests: any[];
    dernieres_tentatives_examens: any[];
    derniers_inscrits: any[];
  };
  taux_reussite: TauxReussite;
}
