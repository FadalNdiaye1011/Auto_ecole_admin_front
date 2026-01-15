import { Examen } from "./examen"

export interface CategorieExamen {
    id: string
    libelle: string
    examen?: Examen[]
}
