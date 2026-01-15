import { Component, signal } from '@angular/core';
import { CoursService } from '../../services/cours.service';
import { CategorieCours } from '../../interfaces/categorie-cours';
import { ResponseData } from '../../../../core/interfaces/response-data';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';
import { TableColumn } from '../../../../core/interfaces/table-column';
import { Cours } from '../../interfaces/cours';
import { AlertService } from '../../../../core/services/Alert/alert.service';

@Component({
  selector: 'app-cours',
  standalone: false,
  templateUrl: './cours.component.html',
  styleUrl: './cours.component.css'
})
export class CoursComponent {

  // Variables d'état
  isLoading = true; // Indique si le chargement est en cours
  isSubmitting = false; // Indique si une soumission est en cours
  activeTab: 'form' | 'list' = 'form'; // Onglet actif (formulaire ou liste)

  // Variables pour les modals
  showEditModal = false; // Affiche le modal d'édition
  showDeleteModal = false; // Affiche le modal de suppression
  showManageCoursesModal = false; // Affiche le modal de gestion des cours
  modalClosing = false; // Indique si un modal est en train de se fermer
  categoryToEdit: CategorieCours | null = null; // Catégorie à éditer
  categoryToDelete: CategorieCours | null = null; // Catégorie à supprimer
  selectedCategory: CategorieCours | null = null; // Catégorie sélectionnée

  // Variables pour la gestion des cours
  selectedFile: File | null = null; // Fichier sélectionné pour un cours
  isEditingCourse = false; // Indique si un cours est en mode édition
  courseToEdit: Cours | null = null; // Cours à éditer
  

  // Variables pour les toasts
  showToast = false; // Affiche le toast
  toastMessage = ''; // Message du toast
  toastTimeout: any = null; // Timeout pour le toast

  // Variables pour la suppression
  isDeleting = false; // Indique si une suppression est en cours

  // Variables pour la recherche
  searchQuery: string = ''; // Requête de recherche
  filteredCourses: Cours[] = []; // Cours filtrés selon la recherche

  // Variables pour les formulaires
  categoryForm: FormGroup; // Formulaire pour ajouter une catégorie
  editForm: FormGroup; // Formulaire pour éditer une catégorie
  courseForm: FormGroup; // Formulaire pour ajouter/éditer un cours

  // Colonnes du tableau
  tableColumns: TableColumn[] = [
    { key: 'libelle', label: 'Libellé' },
  ];

  // Liste des catégories
  categories = signal<CategorieCours[]>([]);

  constructor(
    private categorieService: CoursService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private alertService: AlertService
  ) {
    // Initialisation des formulaires
    this.categoryForm = this.fb.group({
      libelle: ['', Validators.required]
    });

    this.editForm = this.fb.group({
      id: [''],
      libelle: ['', Validators.required]
    });

    this.courseForm = this.fb.group({
      libelle: ['', Validators.required],
      description: [''],
      prix: [0],
      duree_expiration: [0, Validators.required],
      unite_expiration: ['jours', Validators.required],
    });
  }

  // Méthode appelée à l'initialisation du composant
  ngOnInit(): void {
    this.loadCategories();
  }

  // Charge les catégories depuis le service
  loadCategories(): void {
    this.isLoading = true;
    this.categorieService.getData<ResponseData<CategorieCours[]>>('categorie-cours').subscribe({
      next: (data: ResponseData<CategorieCours[]>) => {
        this.categories.set(data.data);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
        this.toastService.error('Erreur lors du chargement des catégories');
      }
    });
  }

  // Ajoute une nouvelle catégorie
  addCategory(): void {
    if (this.categoryForm.valid) {
      this.isLoading = true;
      const newCategory: CategorieCours = { id: '', libelle: this.categoryForm.value.libelle };

      this.categorieService.postData<CategorieCours, ResponseData<CategorieCours>>('categorie-cours', newCategory).subscribe({
        next: (data: ResponseData<CategorieCours>) => {
          this.categories.update(categories => [...categories, data.data]);
          this.categoryForm.reset();
          this.isLoading = false;
          this.toastService.success('Catégorie ajoutée avec succès');
        },
        error: (err: any) => {
          console.error(err);
          this.isLoading = false;
          this.toastService.error('Erreur lors de l\'ajout de la catégorie');
        }
      });
    }
  }

  // Ouvre le modal d'édition pour une catégorie
  openEditModal(category: CategorieCours): void {
    this.categoryToEdit = { ...category };
    this.editForm.patchValue({
      id: category.id,
      libelle: category.libelle
    });
    this.showEditModal = true;
  }

  // Ferme le modal d'édition
  closeEditModal(): void {
    this.modalClosing = true;
    setTimeout(() => {
      this.showEditModal = false;
      this.modalClosing = false;
      this.categoryToEdit = null;
      this.editForm.reset();
    }, 200);
  }

  // Sauvegarde les modifications d'une catégorie
  saveCategory(): void {
    if (this.editForm.valid && this.categoryToEdit) {
      const updatedCategory: CategorieCours = {
        id: this.editForm.value.id,
        libelle: this.editForm.value.libelle
      };

      this.categorieService.putData<CategorieCours, ResponseData<CategorieCours>>(`categorie-cours/${updatedCategory.id}`, updatedCategory).subscribe({
        next: (data: ResponseData<CategorieCours>) => {
          this.categories.update(categories =>
            categories.map(c => c.id === updatedCategory.id ? data.data : c)
          );
          this.closeEditModal();
          this.toastService.success('Catégorie mise à jour avec succès');
        },
        error: (err: any) => {
          console.error(err);
          this.toastService.error('Erreur lors de la mise à jour de la catégorie');
        }
      });
    }
  }

  // Ouvre le modal de suppression pour une catégorie
  openDeleteModal(category: CategorieCours): void {
    this.categoryToDelete = category;
    this.showDeleteModal = true;
  }

  // Ferme le modal de suppression
  closeDeleteModal(): void {
    this.modalClosing = true;
    setTimeout(() => {
      this.showDeleteModal = false;
      this.modalClosing = false;
      this.categoryToDelete = null;
    }, 200);
  }

  // Confirme la suppression d'une catégorie
  confirmDelete(): void {
    if (this.categoryToDelete) {
      this.isDeleting = true;

      this.categorieService.deleteData<string, ResponseData<CategorieCours>>(`categorie-cours`, this.categoryToDelete.id).subscribe({
        next: () => {
          this.categories.update(categories =>
            categories.filter(c => c.id !== this.categoryToDelete?.id)
          );
          this.isDeleting = false;
          this.closeDeleteModal();
          this.toastService.success('Catégorie supprimée avec succès');
        },
        error: (err: any) => {
          console.error(err);
          this.isDeleting = false;
          this.toastService.error('Erreur lors de la suppression de la catégorie');
        }
      });
    }
  }

  // Ouvre le modal de gestion des cours pour une catégorie
  openManageCoursesModal(category: CategorieCours): void {
    this.selectedCategory = category;
    this.showManageCoursesModal = true;
    this.filteredCourses = category.cours ? [...category.cours] : [];
  }

  // Ferme le modal de gestion des cours
  closeManageCoursesModal(): void {
    this.showManageCoursesModal = false;
    this.selectedCategory = null;
    this.courseForm.reset();
    this.isEditingCourse = false;
    this.courseToEdit = null;
  }

  // Annule l'édition d'un cours
  cancelEdit(): void {
    this.isEditingCourse = false;
    this.courseForm.reset();
  }

  // Gère le changement de fichier pour un cours
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  // Sauvegarde un cours (ajout ou édition)
  saveCourse(): void {
    if (this.courseForm.valid && this.selectedCategory) {
      const formData = new FormData();
      formData.append('libelle', this.courseForm.value.libelle);
      formData.append('description', this.courseForm.value.description);
      formData.append('prix', this.courseForm.value.prix.toString());
      formData.append('duree_expiration', this.courseForm.value.duree_expiration.toString());
      formData.append('unite_expiration', this.courseForm.value.unite_expiration);
      formData.append('categorie_cours_id', this.selectedCategory.id);
      if (this.selectedFile) {
        formData.append('fichier', this.selectedFile);
      }

      if (this.isEditingCourse && this.courseToEdit) {
        this.isSubmitting = true;

        // Modifier un cours existant
        this.categorieService.postData<FormData, ResponseData<Cours>>(`cours/${this.courseToEdit.id}`, formData).subscribe({
          next: (data: ResponseData<Cours>) => {
            if (this.filteredCourses) {
              const index = this.filteredCourses.findIndex(c => c.id === this.courseToEdit?.id);
              if (index !== -1) {
                this.filteredCourses[index] = data.data;
              }
            }
            this.cancelEdit();
            this.toastService.success('Cours mis à jour avec succès');
            this.isSubmitting = false;
          },
          error: (err: any) => {
            console.log(err);
            this.isSubmitting = false;
            this.toastService.error(err.message);
          }
        });
      } else {
        // Ajouter un nouveau cours
        this.isSubmitting = true;
        this.categorieService.postData<FormData, ResponseData<Cours>>('cours', formData).subscribe({
          next: (data: ResponseData<Cours>) => {
            this.selectedCategory?.cours?.push(data.data);
            this.filteredCourses.push(data.data);
            this.toastService.success('Cours ajouté avec succès');
            this.isSubmitting = false;
          },
          error: (err: any) => {
            this.toastService.error(err.message);
            this.isSubmitting = false;
          }
        });
      }
    }
  }

  // Ouvre le mode édition pour un cours
  editCourse(cours: Cours): void {
    this.isEditingCourse = true;
    this.courseToEdit = cours;
    this.courseForm.patchValue({
      libelle: cours.libelle,
      description: cours.description,
      prix: cours.prix,
      duree_expiration: cours.duree_expiration,
      unite_expiration: cours.unite_expiration,
    });
  }

  // Supprime un cours
  deleteCourse(cours: Cours): void {
    this.alertService.showConfirmation("Supression", "Êtes-vous sûr de vouloir supprimer ce cours ?").then((result) => {
      if (result.isConfirmed) {
        this.isSubmitting = true;
        this.categorieService.deleteData<string, ResponseData<Cours>>(`cours`, cours.id).subscribe({
          next: () => {
            if (this.selectedCategory?.cours) {
              this.selectedCategory.cours = this.supprimerParId(this.selectedCategory.cours, cours.id);
              if (this.selectedCategory.cours) {
                this.filteredCourses = this.selectedCategory.cours;
              }
            }
            this.toastService.success('Cours supprimé avec succès');
            this.isSubmitting = false;
          },
          error: (err: any) => {
            this.toastService.error(err.message);
            this.isSubmitting = false;
          },
        });
      }
    });
  }

  // Filtre les cours en fonction de la recherche
  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.filterCourses();
  }

  // Applique le filtre de recherche aux cours
  filterCourses(): void {
    if (this.selectedCategory?.cours) {
      this.filteredCourses = this.selectedCategory.cours.filter(cours =>
        cours.libelle.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredCourses = [];
    }
  }

  // Supprime un élément d'un tableau par son ID
  supprimerParId(tableau: any, id: string) {
    return tableau.filter((objet: { id: string; }) => objet.id !== id);
  }
}
