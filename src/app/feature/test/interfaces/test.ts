export interface Test {
  id: string
  libelle: string
  categorie_test_id: string
  created_at: string
  updated_at: string
  category: Category
  questions: Question[]
}


export interface Category {
  id: string
  libelle: string
  created_at: string
  updated_at: string
}

export interface Question {
  id: string
  question: string
  image: any
  test_id: string
  created_at: string
  updated_at: string
  choices: Choice[]
}

export interface Choice {
  id: string
  choice_test: string
  is_correct: number
  test_question_id: string
  created_at: string
  updated_at: string
}
