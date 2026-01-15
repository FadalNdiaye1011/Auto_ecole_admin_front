import { Component, signal } from '@angular/core';
import { CategorieExamen } from '../../interfaces/categorie-examen';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Examen } from '../../interfaces/examen';
import { TestServiceService } from '../../../test/services/test-service.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AlertService } from '../../../../core/services/Alert/alert.service';
import { ResponseData } from '../../../../core/interfaces/response-data';

@Component({
  selector: 'app-examen',
  standalone: false,
  templateUrl: './examen.component.html',
  styleUrl: './examen.component.css'
})
export class ExamenComponent {

  // Variables d'état
  isLoading = true;
  isSubmitting = false;
  isDeleting = false;
  activeTab: 'form' | 'list' = 'form';

  // Variables pour les modals
  showEditModal = false;
  showDeleteModal = false;
  showManageExamenModal = false;
  modalClosing = false;
  categoryToEdit: CategorieExamen | null = null;
  categoryToDelete: CategorieExamen | null = null;
  selectedCategory: CategorieExamen | null = null;

  // Variables pour la gestion des examens
  selectedFile: File | null = null;
  isEditingExamen = false;
  examenToEdit: any = null;

  // Stockage des images de questions avec leur prévisualisation
  questionImages: Map<number, { file: File | null, preview: string | null, existingUrl?: string }> = new Map();

  // Variables pour les formulaires
  categoryForm: FormGroup;
  editForm: FormGroup;
  examenForm: FormGroup;

  examens = signal<Examen[]>([]);

  // Colonnes du tableau
  tableColumns = [
    { key: 'libelle', label: 'Libellé' },
  ];

  // Variables pour le modal de visualisation de l'examen
  showViewExamenModal = false;
  selectedExamen: any = null;

  // Liste des catégories
  categories = signal<CategorieExamen[]>([]);

  constructor(
    private categorieService: TestServiceService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private alertService: AlertService
  ) {
    this.categoryForm = this.fb.group({
      libelle: ['', Validators.required]
    });

    this.editForm = this.fb.group({
      id: [''],
      libelle: ['', Validators.required]
    });

    this.examenForm = this.fb.group({
      libelle: ['', Validators.required],
      montant_vendu: [0, Validators.required],
      unite_expiration: ['jours', Validators.required],
      duree_expiration: [0, Validators.required],
      questions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  get questions(): FormArray {
    return this.examenForm.get('questions') as FormArray;
  }

  getChoices(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('choices') as FormArray;
  }

  addQuestion(): void {
    const questionGroup = this.fb.group({
      id: [null],
      question: ['', Validators.required],
      image: [null],
      choices: this.fb.array([])
    });

    this.questions.push(questionGroup);
    this.examenForm.markAsTouched();
    this.examenForm.updateValueAndValidity();
  }

  addChoice(questionIndex: number): void {
    const choices = this.getChoices(questionIndex);
    const choiceGroup = this.fb.group({
      id: [null],
      choice_examen: ['', Validators.required],
      is_correct: [false]
    });

    choices.push(choiceGroup);
    this.examenForm.markAsTouched();
    this.examenForm.updateValueAndValidity();
  }

  removeQuestion(questionIndex: number): void {
    this.questions.removeAt(questionIndex);
    // Nettoyer l'image associée
    this.questionImages.delete(questionIndex);

    // Réorganiser les index des images restantes
    const updatedImages = new Map();
    this.questionImages.forEach((value, key) => {
      if (key > questionIndex) {
        updatedImages.set(key - 1, value);
      } else {
        updatedImages.set(key, value);
      }
    });
    this.questionImages = updatedImages;
  }

  removeChoice(questionIndex: number, choiceIndex: number): void {
    const choices = this.getChoices(questionIndex);
    choices.removeAt(choiceIndex);
  }

  // Gestion de l'upload d'image pour une question
  onQuestionImageChange(event: any, questionIndex: number): void {
    const file = event.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.toastService.error('L\'image ne doit pas dépasser 2MB');
        return;
      }

      // Vérifier le type de fichier
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        this.toastService.error('Seuls les fichiers JPG et PNG sont acceptés');
        return;
      }

      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.questionImages.set(questionIndex, {
          file: file,
          preview: e.target.result
        });
      };
      reader.readAsDataURL(file);

      // Mettre à jour le FormControl
      this.questions.at(questionIndex).patchValue({ image: file });
    }
  }

  // Obtenir la prévisualisation de l'image d'une question
  getQuestionImagePreview(questionIndex: number): string | null {
    const imageData = this.questionImages.get(questionIndex);
    return imageData?.preview || imageData?.existingUrl || null;
  }

  // Supprimer l'image d'une question
  removeQuestionImage(questionIndex: number): void {
    this.questionImages.delete(questionIndex);
    this.questions.at(questionIndex).patchValue({ image: null });
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categorieService.getData<ResponseData<CategorieExamen[]>>('categories-examen').subscribe({
      next: (data: ResponseData<CategorieExamen[]>) => {
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

  addCategory(): void {
    if (this.categoryForm.valid) {
      this.isLoading = true;
      const newCategory: CategorieExamen = { id: '', libelle: this.categoryForm.value.libelle };

      this.categorieService.postData<CategorieExamen, ResponseData<CategorieExamen>>('categories-examen', newCategory).subscribe({
        next: (data: ResponseData<CategorieExamen>) => {
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

  openEditModal(category: CategorieExamen): void {
    this.categoryToEdit = { ...category };
    this.editForm.patchValue({
      id: category.id,
      libelle: category.libelle
    });
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.modalClosing = true;
    setTimeout(() => {
      this.showEditModal = false;
      this.modalClosing = false;
      this.categoryToEdit = null;
      this.editForm.reset();
    }, 200);
  }

  saveCategory(): void {
    if (this.editForm.valid && this.categoryToEdit) {
      const updatedCategory: CategorieExamen = {
        id: this.editForm.value.id,
        libelle: this.editForm.value.libelle
      };

      this.categorieService.putData<CategorieExamen, ResponseData<CategorieExamen>>(`categories-examen/${updatedCategory.id}`, updatedCategory).subscribe({
        next: (data: ResponseData<CategorieExamen>) => {
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

  openDeleteModal(category: CategorieExamen): void {
    this.categoryToDelete = category;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.modalClosing = true;
    setTimeout(() => {
      this.showDeleteModal = false;
      this.modalClosing = false;
      this.categoryToDelete = null;
    }, 200);
  }

  confirmDelete(): void {
    if (this.categoryToDelete) {
      this.isDeleting = true;

      this.categorieService.deleteData<string, ResponseData<CategorieExamen>>(`categories-examen`, this.categoryToDelete.id).subscribe({
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

  openManageExamensModal(category: CategorieExamen): void {
    this.selectedCategory = category;
    this.showManageExamenModal = true;
    console.log(category);
    if (category.examen) {
      this.examens.set(category.examen);
    }
  }

  openEditExamenModal(examen: any): void {
    this.isEditingExamen = true;
    this.examenToEdit = examen;
    this.isSubmitting = true;

    this.categorieService.getData<ResponseData<Examen>>(`examens/${examen.id}`).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        const examenDetails = response.data;

        this.examenForm = this.fb.group({
          libelle: [examenDetails.libelle, Validators.required],
          montant_vendu: [examenDetails.montant_vendu, Validators.required],
          unite_expiration: [examenDetails.unite_expiration, Validators.required],
          duree_expiration: [examenDetails.duree_expiration, Validators.required],
          questions: this.fb.array([])
        });

        // Nettoyer les images précédentes
        this.questionImages.clear();

        examenDetails.questions.forEach((question: any, index: number) => {
          const questionGroup = this.fb.group({
            id: [question.id],
            question: [question.question, Validators.required],
            image: [question.image],
            choices: this.fb.array([])
          });

          // Si une image existe déjà, la stocker pour l'affichage
          if (question.image) {
            this.questionImages.set(index, {
              file: null,
              preview: null,
              existingUrl: question.image
            });
          }

          const choicesArray = questionGroup.get('choices') as FormArray;
          question.choices.forEach((choice: any) => {
            choicesArray.push(this.fb.group({
              id: [choice.id],
              choice_examen: [choice.choice_examen, Validators.required],
              is_correct: [choice.is_correct]
            }));
          });

          (this.examenForm.get('questions') as FormArray).push(questionGroup);
        });

        this.activeTab = 'form';
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        this.toastService.error('Erreur lors du chargement des détails de l\'examen');
      }
    });
  }

  viewExamen(examen: any): void {
    this.selectedExamen = examen;
    this.showViewExamenModal = true;
  }

  closeViewExamenModal(): void {
    this.showViewExamenModal = false;
    this.selectedExamen = null;
  }

  cancelEdit(): void {
    this.isEditingExamen = false;
    this.examenToEdit = null;
    this.resetExamenForm();
  }

  closeManageExamenModal(): void {
    this.showManageExamenModal = false;
    this.selectedCategory = null;
    this.resetExamenForm();
    this.isEditingExamen = false;
    this.examenToEdit = null;
  }

  resetExamenForm(): void {
    this.examenForm.reset({
      libelle: '',
      montant_vendu: 0,
      unite_expiration: 'jours',
      duree_expiration: 0
    });

    while (this.questions.length !== 0) {
      this.questions.removeAt(0);
    }

    // Nettoyer les images
    this.questionImages.clear();
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  saveExamen(): void {
    if (this.examenForm.valid && this.selectedCategory) {
      const formData = new FormData();
      formData.append('libelle', this.examenForm.value.libelle);
      formData.append('montant_vendu', this.examenForm.value.montant_vendu);
      formData.append('unite_expiration', this.examenForm.value.unite_expiration);
      formData.append('duree_expiration', this.examenForm.value.duree_expiration);
      formData.append('categorie_examen_id', this.selectedCategory.id);

      this.examenForm.value.questions.forEach((question: any, index: number) => {
        if (question.id) {
          formData.append(`questions[${index}][id]`, question.id);
        }

        formData.append(`questions[${index}][question]`, question.question);

        // Gestion de l'image de la question
        const imageData = this.questionImages.get(index);
        if (imageData?.file) {
          // Nouvelle image uploadée
          formData.append(`questions[${index}][image]`, imageData.file);
        } else if (imageData?.existingUrl && !imageData.file) {
          // Image existante (en mode édition)
          formData.append(`questions[${index}][existing_image]`, imageData.existingUrl);
        }

        question.choices.forEach((choice: any, choiceIndex: number) => {
          if (choice.id) {
            formData.append(`questions[${index}][choices][${choiceIndex}][id]`, choice.id);
          }

          formData.append(`questions[${index}][choices][${choiceIndex}][choice_examen]`, choice.choice_examen);
          formData.append(`questions[${index}][choices][${choiceIndex}][is_correct]`, choice.is_correct ? '1' : '0');
        });
      });

      if (this.isEditingExamen && this.examenToEdit) {
        this.isSubmitting = true;
        this.categorieService.postData<FormData, ResponseData<Examen>>(`examens/${this.examenToEdit.id}`, formData).subscribe({
          next: (data: ResponseData<Examen>) => {
            this.toastService.success(data.message);
            this.isSubmitting = false;
            if (this.selectedCategory?.examen) {
              const index = this.selectedCategory.examen.findIndex(c => c.id === this.examenToEdit?.id);
              if (index !== -1) {
                this.selectedCategory.examen[index] = data.data;
                this.examens.set(this.selectedCategory.examen);
              }
            }
            this.cancelEdit();
          },
          error: (err: any) => {
            console.error(err);
            this.toastService.error('Erreur lors de la mise à jour de l\'examen');
            this.isSubmitting = false;
          }
        });
      } else {
        this.isSubmitting = true;
        this.categorieService.postData<FormData, ResponseData<Examen>>('examens', formData).subscribe({
          next: (data: ResponseData<Examen>) => {
            this.toastService.success(data.message);
            this.isSubmitting = false;
            if (this.selectedCategory?.examen) {
              this.selectedCategory.examen.push(data.data);
              this.examens.set(this.selectedCategory.examen);
            }
            this.resetExamenForm();
          },
          error: (err: any) => {
            console.error(err);
            this.toastService.error(err.message);
            this.isSubmitting = false;
          }
        });
      }
    }
  }

  deleteExamen(examen: any): void {
    this.alertService.showConfirmation("Suppression", "Êtes-vous sûr de vouloir supprimer cet examen ?").then((result) => {
      if (result.isConfirmed) {
        this.isSubmitting = true;
        this.categorieService.deleteData<string, ResponseData<Examen>>(`examens`, examen.id).subscribe({
          next: () => {
            this.toastService.success('Examen supprimé avec succès');
            this.isSubmitting = false;
            if (this.selectedCategory?.examen) {
              this.selectedCategory.examen = this.supprimerParId(this.selectedCategory.examen, examen.id);
              this.examens.set(this.selectedCategory.examen || []);
            }
          },
          error: (err: any) => {
            console.error(err);
            this.toastService.error('Erreur lors de la suppression de l\'examen');
            this.isSubmitting = false;
          }
        });
      }
    });
  }

  supprimerParId(tableau: any, id: string) {
    return tableau.filter((objet: { id: string; }) => objet.id !== id);
  }
}
