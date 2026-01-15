import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CategorieTest } from '../../interfaces/categorie-test';
import { ResponseData } from '../../../../core/interfaces/response-data';
import { ToastService } from '../../../../core/services/toast.service';
import { AlertService } from '../../../../core/services/Alert/alert.service';
import { TestServiceService } from '../../services/test-service.service';
import { Test } from '../../interfaces/test';

@Component({
  selector: 'app-test',
  standalone: false,
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {

  // Variables d'état
  isLoading = true;
  isSubmitting = false;
  isDeleting = false;
  activeTab: 'form' | 'list' = 'form';

  // Variables pour les modals
  showEditModal = false;
  showDeleteModal = false;
  showManageTestsModal = false;
  modalClosing = false;
  categoryToEdit: CategorieTest | null = null;
  categoryToDelete: CategorieTest | null = null;
  selectedCategory: CategorieTest | null = null;

  // Variables pour la gestion des tests
  selectedFile: File | null = null;
  isEditingTest = false;
  testToEdit: any = null;

  // Stockage des images de questions avec leur prévisualisation
  questionImages: Map<number, { file: File | null, preview: string | null, existingUrl?: string }> = new Map();

  // Variables pour les formulaires
  categoryForm: FormGroup;
  editForm: FormGroup;
  testForm: FormGroup;

  tests = signal<Test[]>([]);

  // Colonnes du tableau
  tableColumns = [
    { key: 'libelle', label: 'Libellé' },
  ];

  // Variables pour le modal de visualisation du test
  showViewTestModal = false;
  selectedTest: any = null;

  // Liste des catégories
  categories = signal<CategorieTest[]>([]);

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

    this.testForm = this.fb.group({
      libelle: ['', Validators.required],
      questions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  get questions(): FormArray {
    return this.testForm.get('questions') as FormArray;
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
    this.testForm.markAsTouched();
    this.testForm.updateValueAndValidity();
  }

  addChoice(questionIndex: number): void {
    const choices = this.getChoices(questionIndex);
    const choiceGroup = this.fb.group({
      id: [null],
      choice_test: ['', Validators.required],
      is_correct: [false]
    });

    choices.push(choiceGroup);
    this.testForm.markAsTouched();
    this.testForm.updateValueAndValidity();
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
    this.categorieService.getData<ResponseData<CategorieTest[]>>('categories-test').subscribe({
      next: (data: ResponseData<CategorieTest[]>) => {
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
      const newCategory: CategorieTest = { id: '', libelle: this.categoryForm.value.libelle };

      this.categorieService.postData<CategorieTest, ResponseData<CategorieTest>>('categories-test', newCategory).subscribe({
        next: (data: ResponseData<CategorieTest>) => {
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

  openEditModal(category: CategorieTest): void {
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
      const updatedCategory: CategorieTest = {
        id: this.editForm.value.id,
        libelle: this.editForm.value.libelle
      };

      this.categorieService.putData<CategorieTest, ResponseData<CategorieTest>>(`categories-test/${updatedCategory.id}`, updatedCategory).subscribe({
        next: (data: ResponseData<CategorieTest>) => {
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

  openDeleteModal(category: CategorieTest): void {
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

      this.categorieService.deleteData<string, ResponseData<CategorieTest>>(`categories-test`, this.categoryToDelete.id).subscribe({
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

  openManageTestsModal(category: CategorieTest): void {
    this.selectedCategory = category;
    this.showManageTestsModal = true;
    console.log(category);
    if (category.tests) {
      this.tests.set(category.tests);
    }
  }

  openEditTestModal(test: any): void {
    this.isEditingTest = true;
    this.testToEdit = test;
    this.isSubmitting = true;

    this.categorieService.getData<ResponseData<Test>>(`tests/${test.id}`).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        const testDetails = response.data;

        this.testForm = this.fb.group({
          libelle: [testDetails.libelle, Validators.required],
          questions: this.fb.array([])
        });

        // Nettoyer les images précédentes
        this.questionImages.clear();

        testDetails.questions.forEach((question: any, index: number) => {
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
              choice_test: [choice.choice_test, Validators.required],
              is_correct: [choice.is_correct]
            }));
          });

          (this.testForm.get('questions') as FormArray).push(questionGroup);
        });

        this.activeTab = 'form';
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        this.toastService.error('Erreur lors du chargement des détails du test');
      }
    });
  }

  viewTest(test: any): void {
    this.selectedTest = test;
    this.showViewTestModal = true;
  }

  closeViewTestModal(): void {
    this.showViewTestModal = false;
    this.selectedTest = null;
  }

  cancelEdit(): void {
    this.isEditingTest = false;
    this.testToEdit = null;
    this.resetTestForm();
  }

  closeManageTestsModal(): void {
    this.showManageTestsModal = false;
    this.selectedCategory = null;
    this.resetTestForm();
    this.isEditingTest = false;
    this.testToEdit = null;
  }

  resetTestForm(): void {
    this.testForm.reset({
      libelle: ''
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

  saveTest(): void {
    if (this.testForm.valid && this.selectedCategory) {
      const formData = new FormData();
      formData.append('libelle', this.testForm.value.libelle);
      formData.append('categorie_test_id', this.selectedCategory.id);

      this.testForm.value.questions.forEach((question: any, index: number) => {
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

          formData.append(`questions[${index}][choices][${choiceIndex}][choice_test]`, choice.choice_test);
          formData.append(`questions[${index}][choices][${choiceIndex}][is_correct]`, choice.is_correct ? '1' : '0');
        });
      });

      if (this.isEditingTest && this.testToEdit) {
        this.isSubmitting = true;
        this.categorieService.postData<FormData, ResponseData<any>>(`tests/${this.testToEdit.id}`, formData).subscribe({
          next: (data: ResponseData<any>) => {
            this.toastService.success('Test mis à jour avec succès');
            this.isSubmitting = false;
            if (this.selectedCategory?.tests) {
              const index = this.selectedCategory.tests.findIndex(c => c.id === this.testToEdit?.id);
              if (index !== -1) {
                this.selectedCategory.tests[index] = data.data;
              }
            }
            this.cancelEdit();
          },
          error: (err: any) => {
            console.error(err);
            this.toastService.error('Erreur lors de la mise à jour du test');
            this.isSubmitting = false;
          }
        });
      } else {
        this.isSubmitting = true;
        this.categorieService.postData<FormData, ResponseData<any>>('tests', formData).subscribe({
          next: (data: ResponseData<any>) => {
            this.toastService.success('Test ajouté avec succès');
            this.isSubmitting = false;
            if (this.selectedCategory?.tests) {
              this.selectedCategory.tests.push(data.data);
              this.tests.set(this.selectedCategory.tests);
            }
            this.resetTestForm();
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

  deleteTest(test: any): void {
    this.alertService.showConfirmation("Suppression", "Êtes-vous sûr de vouloir supprimer ce test ?").then((result) => {
      if (result.isConfirmed) {
        this.isSubmitting = true;
        this.categorieService.deleteData<string, ResponseData<any>>(`tests`, test.id).subscribe({
          next: () => {
            this.toastService.success('Test supprimé avec succès');
            this.isSubmitting = false;
            if (this.selectedCategory?.tests) {
              this.selectedCategory.tests = this.supprimerParId(this.selectedCategory.tests, test.id);
              this.tests.set(this.selectedCategory.tests || []);
            }
          },
          error: (err: any) => {
            console.error(err);
            this.toastService.error('Erreur lors de la suppression du test');
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
