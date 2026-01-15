export interface Examen {
  id: string
  libelle: string
  montant_vendu:number
  unite_expiration:string
  duree_expiration:number
  categorie_examen_id: string
  created_at: string
  updated_at: string
  questions: Question[]
}


export interface Question {
  id: string
  question: string
  image: any
  examen_id: string
  created_at: string
  updated_at: string
  choices: Choice[]
}

export interface Choice {
  id: string
  choice_examen: string
  is_correct: number
  examen_question_id: string
  created_at: string
  updated_at: string
}
