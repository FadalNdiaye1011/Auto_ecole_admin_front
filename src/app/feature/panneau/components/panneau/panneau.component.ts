import { Component, signal } from '@angular/core';
import { CategoriePanneau } from '../../interfaces/categorie-panneau';
import { Panneaux } from '../../interfaces/panneau';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableColumn } from '../../../../shared/components/data-table/data-table.component';
import { PanneauService } from '../../services/panneau.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AlertService } from '../../../../core/services/Alert/alert.service';
import { ResponseData } from '../../../../core/interfaces/response-data';

@Component({
  selector: 'app-panneau',
  standalone: false,
  templateUrl: './panneau.component.html',
  styleUrl: './panneau.component.css'
})
export class PanneauComponent {

  // Variables d'état
  isLoading = true; // Indique si le chargement est en cours
  isSubmitting = false; // Indique si une soumission est en cours
  activeTab: 'form' | 'list' | 'view' | 'add' = 'form';
  // Add this property to your PanneauComponent class
  viewMode: 'grid' | 'list' = 'grid'; // Default to grid view
  isAddTabActive: boolean = true;

  // Variables pour les modals
  showEditModal = false; // Affiche le modal d'édition
  showDeleteModal = false; // Affiche le modal de suppression
  showManagePanneauxModal = false; // Affiche le modal de gestion des cours
  modalClosing = false; // Indique si un modal est en train de se fermer
  categoryToEdit: CategoriePanneau | null = null; // Catégorie à éditer
  categoryToDelete: CategoriePanneau | null = null; // Catégorie à supprimer


  // Variables pour le modal de gestion des panneaux
  showManagePanneauModal = false;
  panneauxForm: FormGroup;
  selectedCategory: any;
  panneaux: Panneaux[] = [];
  selectedImages: File[] = [];
  imagePreviews: string[] = [];




  // Variables pour les toasts
  showToast = false; // Affiche le toast
  toastMessage = ''; // Message du toast
  toastTimeout: any = null; // Timeout pour le toast

  // Variables pour la suppression
  isDeleting = false; // Indique si une suppression est en cours

  // Variables pour les formulaires
  categoryForm: FormGroup; // Formulaire pour ajouter une catégorie
  editForm: FormGroup; // Formulaire pour éditer une catégorie
  isEditingPanneaux = false; // Indique si un cours est en mode édition
  editPanneauForm: FormGroup;
  panneauToEdit:Panneaux | null = null


  // Colonnes du tableau
  tableColumns: TableColumn[] = [
    { key: 'libelle', label: 'Libellé' },
  ];

  // Liste des catégories
  categories = signal<CategoriePanneau[]>([]);


  constructor(
    private categorieService: PanneauService,
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

      // Initialisation du formulaire pour les panneaux
    this.panneauxForm = this.fb.group({
      libelle: ['', Validators.required],
      description: ['']
    });

    this.editPanneauForm = this.fb.group({
      id: [''],
      libelle: ['', Validators.required],
      description: [''],
      imagePreview: [''],
      image: [null],
    });

  }

  // Méthode appelée à l'initialisation du composant
  ngOnInit(): void {
    this.loadCategories();
    this.initForm();
  }


  initForm(): void {
    this.panneauxForm = this.fb.group({
      panneaux: this.fb.array([])
    });
  }

  // Getter pour accéder facilement au FormArray
  get panneauxArray(): FormArray {
    return this.panneauxForm.get('panneaux') as FormArray;
  }

  // Créer un nouveau groupe de formulaire pour un panneau
  createPanneauFormGroup(): FormGroup {
    return this.fb.group({
      libelle: ['', Validators.required],
      description: [''],
      image: [null, Validators.required],
      imagePreview: ['']
    });
  }

  // Charge les catégories depuis le service
  loadCategories(): void {
    this.isLoading = true;
    this.categorieService.getData<ResponseData<CategoriePanneau[]>>('panneaux').subscribe({
      next: (data: ResponseData<CategoriePanneau[]>) => {
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
      const newCategory: CategoriePanneau = { id: '', libelle: this.categoryForm.value.libelle };

      this.categorieService.postData<CategoriePanneau, ResponseData<CategoriePanneau>>('panneaux/categorie', newCategory).subscribe({
        next: (data: ResponseData<CategoriePanneau>) => {
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
  openEditModal(category: CategoriePanneau): void {
    this.categoryToEdit = { ...category };
    this.editForm.patchValue({
      id: category.id,
      libelle: category.libelle
    });
    this.showEditModal = true;
  }


  // Sauvegarde les modifications d'une catégorie
  saveCategory(): void {
    if (this.editForm.valid && this.categoryToEdit) {
      const updatedCategory: CategoriePanneau = {
        id: this.editForm.value.id,
        libelle: this.editForm.value.libelle
      };

      this.categorieService.putData<CategoriePanneau, ResponseData<CategoriePanneau>>(`panneaux/categorie/${updatedCategory.id}`, updatedCategory).subscribe({
        next: (data: ResponseData<CategoriePanneau>) => {
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
  openDeleteModal(category: CategoriePanneau): void {
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

      this.categorieService.deleteData<string, ResponseData<CategoriePanneau>>(`panneaux/categorie`, this.categoryToDelete.id).subscribe({
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


// Ajouter un nouveau panneau au FormArray
addPanneauField(): void {
  this.panneauxArray.push(this.createPanneauFormGroup());
}

// Supprimer un panneau du FormArray
removePanneauField(index: number): void {
  this.panneauxArray.removeAt(index);
}

// Ouvrir le modal et initialiser les données
openManagePanneauModal(category: CategoriePanneau): void {
  this.selectedCategory = category;
  this.showManagePanneauModal = true;
  this.activeTab = 'add'
  this.initForm(); // Réinitialiser le formulaire
  this.addPanneauField(); // Ajouter au moins un champ de panneau
}

// Fermer le modal
closeManagePanneauModal(): void {
  this.showManagePanneauModal = false;
  this.selectedCategory = null;
  this.activeTab = 'add'
  this.initForm();
  this.isEditingPanneaux = false;
}

// Handle drag and drop for image upload
onImageDrop(event: DragEvent, index: number): void {
  event.preventDefault();
  event.stopPropagation();

  if (event.dataTransfer && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];

    // Check if the file is an image
    if (file.type.startsWith('image/')) {
      const panneauFormGroup = this.panneauxArray.at(index) as FormGroup;
      panneauFormGroup.patchValue({ image: file });

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        panneauFormGroup.patchValue({ imagePreview: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }
}

// Trigger file input click
triggerFileInput(index: number): void {
  const fileInputs = document.querySelectorAll('input[type="file"]');
  (fileInputs[index] as HTMLElement).click();
}

// Remove image from a panneau
removeImage(index: number, event: Event): void {
  event.stopPropagation(); // Prevent the click from bubbling to the parent
  const panneauFormGroup = this.panneauxArray.at(index) as FormGroup;
  panneauFormGroup.patchValue({
    image: null,
    imagePreview: null
  });
}

// Gérer la sélection d'image pour un panneau spécifique
onImageSelected(event: any, index: number): void {
  const file = event.target.files[0];
  if (file) {
    const panneauFormGroup = this.panneauxArray.at(index) as FormGroup;
    panneauFormGroup.patchValue({ image: file });

    // Créer une prévisualisation
    const reader = new FileReader();
    reader.onload = () => {
      panneauFormGroup.patchValue({ imagePreview: reader.result as string });
    };
    reader.readAsDataURL(file);
  }
}


triggerFileInputEdit(): void {
  const fileInput = document.querySelector('input[type="file"]') as HTMLElement;
  fileInput.click();
}

onImageSelectedEdit(event: any): void {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      this.editPanneauForm.patchValue({
        image: file,
        imagePreview: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  }
}

removeImageEdit(event: Event): void {
  event.stopPropagation();
  this.editPanneauForm.patchValue({
    image: null,
    imagePreview: null
  });
}

markAllAsTouchedEdit(): void {
  Object.keys(this.editPanneauForm.controls).forEach(key => {
    this.editPanneauForm.get(key)?.markAsTouched();
  });
}

// Soumettre le formulaire pour ajouter des panneaux
submitPanneaux(): void {
  if (this.panneauxForm.valid && this.selectedCategory) {
    const formData = new FormData();
    formData.append('categorie_panneau_id', this.selectedCategory.id);

    this.panneauxArray.controls.forEach((control, index) => {
      const panneauValue = control.value;
      formData.append(`panneaux[${index}][libelle]`, panneauValue.libelle);
      formData.append(`panneaux[${index}][description]`, panneauValue.description || '');
      formData.append(`panneaux[${index}][image]`, panneauValue.image);
    });
    this.isSubmitting  = true;
    this.categorieService.postData<any, any>(`panneaux`, formData).subscribe({
      next: (response) => {
        console.log(response);
        // Mise à jour de la liste des panneaux dans la catégorie
        if (this.selectedCategory && response.data) {
          if (!this.selectedCategory.panneaux) {
            this.selectedCategory.panneaux = [];
          }
          // this.selectedCategory.panneaux = [...this.selectedCategory.panneaux, ...response.data];
          this.selectedCategory.panneaux = response.data
        }

        this.toastService.success('Panneaux ajoutés avec succès');
        this.initForm();
        this.addPanneauField();
        this.isSubmitting  = false;
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Erreur lors de l\'ajout des panneaux');
        this.isSubmitting  = false;
      }
    });
  } else {
    this.markAllAsTouched();
    this.toastService.error('Veuillez remplir correctement tous les champs requis');
  }
}

editPanneaux(): void {
  if (this.editPanneauForm.valid) {
    const formData = new FormData();
    const panneauData = this.editPanneauForm.value;
    formData.append('libelle', panneauData.libelle);
    formData.append('image', panneauData.image);
    formData.append('description', panneauData.description || '');
    if (panneauData.image) {
      formData.append('image', panneauData.image);
    }

    this.isSubmitting = true;
    this.categorieService.postData<FormData,ResponseData<Panneaux>>(`panneaux/${panneauData.id}`, formData).subscribe({
      next: (response) => {
        // Mettre à jour la liste des panneaux dans la catégorie
        const updatedPanneau = response.data;
        const index = this.selectedCategory.panneaux.findIndex((p: { id: any; }) => p.id === updatedPanneau.id);
        if (index !== -1) {
          this.selectedCategory.panneaux[index] = updatedPanneau;
        }

        this.toastService.success('Panneau mis à jour avec succès');
        this.closeEditModal();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Erreur lors de la mise à jour du panneau');
        this.isSubmitting = false;
      }
    });
  } else {
    this.markAllAsTouchedEdit();
    this.toastService.error('Veuillez remplir correctement tous les champs requis');
  }
}

closeEditModal(): void {
  this.isEditingPanneaux = false;
  this.panneauToEdit = null;
  this.editPanneauForm.reset(); // Réinitialiser le formulaire
}



// Marquer tous les champs comme touchés pour afficher les erreurs
// Correction de la méthode markAllAsTouched()
markAllAsTouched(): void {
  this.panneauxArray.controls.forEach(control => {
    // Vérifier si le contrôle est un FormGroup
    if (control instanceof FormGroup) {
      Object.keys(control.controls).forEach(key => {
        control.get(key)?.markAsTouched();
      });
    }
  });
}


// Edit an existing panneau
editPanneau(panneau:Panneaux): void {
  // Find the panneau in the selected category
  const panneauToEdit = this.selectedCategory?.panneaux?.find((p: { id: string | number; }) => p.id === panneau.id);

  if (panneauToEdit) {
    // Switch to edit mode (same as add tab but with pre-filled data)
    this.activeTab = 'add';
    this.isAddTabActive = true;


    // Patch the form with the panneau data
    this.editPanneauForm.patchValue({
      id: panneauToEdit.id,
      libelle: panneauToEdit.libelle,
      description: panneauToEdit.description,
      imagePreview: panneauToEdit.image
    });
    this.isEditingPanneaux = true;
  }
}

// Supprimer un panneau existant
deletePanneau(panneauId: string): void {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce panneau ?')) {
    this.isSubmitting  = true;
    this.categorieService.deleteData<any, any>('panneaux', panneauId).subscribe({
      next: () => {
        // Mettre à jour la liste des panneaux
        if (this.selectedCategory && this.selectedCategory.panneaux) {
          this.selectedCategory.panneaux = this.selectedCategory.panneaux.filter((p: { id: string; }) => p.id !== panneauId);
        }
        this.toastService.success('Panneau supprimé avec succès');
        this.isSubmitting  = false;
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Erreur lors de la suppression du panneau');
        this.isSubmitting  = false;
      }
    });
  }
}

  // Supprime un élément d'un tableau par son ID
  supprimerParId(tableau: any, id: string) {
    return tableau.filter((objet: { id: string; }) => objet.id !== id);
  }
}
