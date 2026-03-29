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

  // ── État général ────────────────────────────────────────────
  isLoading = true;
  isSubmitting = false;
  isDeleting = false;
  activeTab: 'form' | 'list' = 'form';

  // ── Modals catégories ───────────────────────────────────────
  showEditModal = false;
  showDeleteModal = false;
  showManageExamenModal = false;
  modalClosing = false;
  categoryToEdit: CategorieExamen | null = null;
  categoryToDelete: CategorieExamen | null = null;
  selectedCategory: CategorieExamen | null = null;

  // ── État édition examen ─────────────────────────────────────
  isEditingExamen = false;
  examenToEdit: any = null;

  // ── Images : exercice et questions ─────────────────────────
  // Clé : index exercice → image de l'exercice
  exerciceImages: Map<number, { file: File | null; preview: string | null; existingUrl?: string }> = new Map();
  // Clé : "exerciceIndex_questionIndex" → image de la question
  questionImages: Map<string, { file: File | null; preview: string | null; existingUrl?: string }> = new Map();

  // ── Formulaires ─────────────────────────────────────────────
  categoryForm: FormGroup;
  editForm: FormGroup;
  examenForm: FormGroup;

  examens = signal<Examen[]>([]);
  categories = signal<CategorieExamen[]>([]);

  // ── Modal visualisation ─────────────────────────────────────
  showViewExamenModal = false;
  selectedExamen: any = null;

  tableColumns = [{ key: 'libelle', label: 'Libellé' }];

  constructor(
    private categorieService: TestServiceService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private alertService: AlertService
  ) {
    this.categoryForm = this.fb.group({ libelle: ['', Validators.required] });
    this.editForm     = this.fb.group({ id: [''], libelle: ['', Validators.required] });
    this.examenForm   = this._buildExamenForm();
  }

  ngOnInit(): void { this.loadCategories(); }

  // ────────────────────────────────────────────────────────────
  // HELPERS FORMULAIRE
  // ────────────────────────────────────────────────────────────

  private _buildExamenForm(): FormGroup {
    return this.fb.group({
      libelle:           ['', Validators.required],
      montant_vendu:     [0, Validators.required],
      unite_expiration:  ['jours', Validators.required],
      duree_expiration:  [0, Validators.required],
      exercices:         this.fb.array([])
    });
  }

  get exercices(): FormArray {
    return this.examenForm.get('exercices') as FormArray;
  }

  getQuestions(exerciceIndex: number): FormArray {
    return this.exercices.at(exerciceIndex).get('questions') as FormArray;
  }

  getChoices(exerciceIndex: number, questionIndex: number): FormArray {
    return this.getQuestions(exerciceIndex).at(questionIndex).get('choices') as FormArray;
  }

  // ── Exercice ────────────────────────────────────────────────

  addExercice(): void {
    const group = this.fb.group({
      id:        [null],
      libelle:   ['', Validators.required],
      image:     [null],
      ordre:     [this.exercices.length + 1],
      questions: this.fb.array([])
    });
    this.exercices.push(group);
  }

  removeExercice(eIdx: number): void {
    this.exercices.removeAt(eIdx);
    this.exerciceImages.delete(eIdx);

    // Réindexer exerciceImages et questionImages
    const newEImages = new Map<number, any>();
    this.exerciceImages.forEach((v, k) => newEImages.set(k > eIdx ? k - 1 : k, v));
    this.exerciceImages = newEImages;

    const newQImages = new Map<string, any>();
    this.questionImages.forEach((v, k) => {
      const [ei, qi] = k.split('_').map(Number);
      if (ei === eIdx) return;
      newQImages.set(`${ei > eIdx ? ei - 1 : ei}_${qi}`, v);
    });
    this.questionImages = newQImages;
  }

  // ── Question ────────────────────────────────────────────────

  addQuestion(eIdx: number): void {
    const group = this.fb.group({
      id:       [null],
      question: ['', Validators.required],
      image:    [null],
      ordre:    [this.getQuestions(eIdx).length + 1],
      choices:  this.fb.array([])
    });
    this.getQuestions(eIdx).push(group);
  }

  removeQuestion(eIdx: number, qIdx: number): void {
    this.getQuestions(eIdx).removeAt(qIdx);
    this.questionImages.delete(`${eIdx}_${qIdx}`);

    // Réindexer les questions au-delà
    const updated = new Map<string, any>();
    this.questionImages.forEach((v, k) => {
      const [ei, qi] = k.split('_').map(Number);
      if (ei === eIdx && qi === qIdx) return;
      updated.set(ei === eIdx && qi > qIdx ? `${ei}_${qi - 1}` : k, v);
    });
    this.questionImages = updated;
  }

  // ── Choix ───────────────────────────────────────────────────

  addChoice(eIdx: number, qIdx: number): void {
    this.getChoices(eIdx, qIdx).push(this.fb.group({
      id:            [null],
      choice_examen: ['', Validators.required],
      is_correct:    [false]
    }));
  }

  removeChoice(eIdx: number, qIdx: number, cIdx: number): void {
    this.getChoices(eIdx, qIdx).removeAt(cIdx);
  }

  // ── Images exercice ─────────────────────────────────────────

  onExerciceImageChange(event: any, eIdx: number): void {
    const file: File = event.target.files[0];
    if (!file) return;
    if (!this._validateImage(file)) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.exerciceImages.set(eIdx, { file, preview: e.target.result });
    };
    reader.readAsDataURL(file);
    this.exercices.at(eIdx).patchValue({ image: file });
  }

  getExerciceImagePreview(eIdx: number): string | null {
    const d = this.exerciceImages.get(eIdx);
    return d?.preview || d?.existingUrl || null;
  }

  removeExerciceImage(eIdx: number): void {
    this.exerciceImages.delete(eIdx);
    this.exercices.at(eIdx).patchValue({ image: null });
  }

  // ── Images question ─────────────────────────────────────────

  onQuestionImageChange(event: any, eIdx: number, qIdx: number): void {
    const file: File = event.target.files[0];
    if (!file) return;
    if (!this._validateImage(file)) return;
    const key = `${eIdx}_${qIdx}`;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.questionImages.set(key, { file, preview: e.target.result });
    };
    reader.readAsDataURL(file);
    this.getQuestions(eIdx).at(qIdx).patchValue({ image: file });
  }

  getQuestionImagePreview(eIdx: number, qIdx: number): string | null {
    const d = this.questionImages.get(`${eIdx}_${qIdx}`);
    return d?.preview || d?.existingUrl || null;
  }

  removeQuestionImage(eIdx: number, qIdx: number): void {
    this.questionImages.delete(`${eIdx}_${qIdx}`);
    this.getQuestions(eIdx).at(qIdx).patchValue({ image: null });
  }

  private _validateImage(file: File): boolean {
    if (file.size > 4 * 1024 * 1024) {
      this.toastService.error('L\'image ne doit pas dépasser 4 Mo');
      return false;
    }
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      this.toastService.error('Seuls JPG, PNG et WebP sont acceptés');
      return false;
    }
    return true;
  }

  // ────────────────────────────────────────────────────────────
  // CHARGEMENT
  // ────────────────────────────────────────────────────────────

  loadCategories(): void {
    this.isLoading = true;
    this.categorieService.getData<ResponseData<CategorieExamen[]>>('categories-examen').subscribe({
      next: (data) => { this.categories.set(data.data); this.isLoading = false; },
      error: (err) => { console.error(err); this.isLoading = false; this.toastService.error('Erreur lors du chargement'); }
    });
  }

  // ────────────────────────────────────────────────────────────
  // CRUD CATÉGORIE
  // ────────────────────────────────────────────────────────────

  addCategory(): void {
    if (!this.categoryForm.valid) return;
    this.isLoading = true;
    const payload: CategorieExamen = { id: '', libelle: this.categoryForm.value.libelle };
    this.categorieService.postData<CategorieExamen, ResponseData<CategorieExamen>>('categories-examen', payload).subscribe({
      next: (data) => {
        this.categories.update(c => [...c, data.data]);
        this.categoryForm.reset();
        this.isLoading = false;
        this.toastService.success('Catégorie ajoutée');
      },
      error: (err) => { console.error(err); this.isLoading = false; this.toastService.error('Erreur lors de l\'ajout'); }
    });
  }

  openEditModal(category: CategorieExamen): void {
    this.categoryToEdit = { ...category };
    this.editForm.patchValue({ id: category.id, libelle: category.libelle });
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.modalClosing = true;
    setTimeout(() => { this.showEditModal = false; this.modalClosing = false; this.categoryToEdit = null; this.editForm.reset(); }, 200);
  }

  saveCategory(): void {
    if (!this.editForm.valid || !this.categoryToEdit) return;
    const updated: CategorieExamen = { id: this.editForm.value.id, libelle: this.editForm.value.libelle };
    this.categorieService.putData<CategorieExamen, ResponseData<CategorieExamen>>(`categories-examen/${updated.id}`, updated).subscribe({
      next: (data) => {
        this.categories.update(cats => cats.map(c => c.id === updated.id ? data.data : c));
        this.closeEditModal();
        this.toastService.success('Catégorie mise à jour');
      },
      error: (err) => { console.error(err); this.toastService.error('Erreur mise à jour'); }
    });
  }

  openDeleteModal(category: CategorieExamen): void { this.categoryToDelete = category; this.showDeleteModal = true; }

  closeDeleteModal(): void {
    this.modalClosing = true;
    setTimeout(() => { this.showDeleteModal = false; this.modalClosing = false; this.categoryToDelete = null; }, 200);
  }

  confirmDelete(): void {
    if (!this.categoryToDelete) return;
    this.isDeleting = true;
    this.categorieService.deleteData<string, ResponseData<CategorieExamen>>('categories-examen', this.categoryToDelete.id).subscribe({
      next: () => {
        this.categories.update(cats => cats.filter(c => c.id !== this.categoryToDelete?.id));
        this.isDeleting = false;
        this.closeDeleteModal();
        this.toastService.success('Catégorie supprimée');
      },
      error: (err) => { console.error(err); this.isDeleting = false; this.toastService.error('Erreur suppression'); }
    });
  }

  // ────────────────────────────────────────────────────────────
  // GESTION EXAMENS
  // ────────────────────────────────────────────────────────────

  openManageExamensModal(category: CategorieExamen): void {
    this.selectedCategory = category;
    this.showManageExamenModal = true;
    if (category.examen) this.examens.set(category.examen);
  }

  closeManageExamenModal(): void {
    this.showManageExamenModal = false;
    this.selectedCategory = null;
    this.resetExamenForm();
    this.isEditingExamen = false;
    this.examenToEdit = null;
  }

  openEditExamenModal(examen: any): void {
    this.isEditingExamen = true;
    this.examenToEdit = examen;
    this.isSubmitting = true;

    this.categorieService.getData<ResponseData<Examen>>(`examens/${examen.id}`).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        const details = response.data;

        this.examenForm = this._buildExamenForm();
        this.exerciceImages.clear();
        this.questionImages.clear();

        // Pré-remplir libelle, montant, etc.
        this.examenForm.patchValue({
          libelle:          details.libelle,
          montant_vendu:    details.montant_vendu,
          unite_expiration: details.unite_expiration,
          duree_expiration: details.duree_expiration,
        });

        // Pré-remplir exercices → questions → choix
        (details as any).exercices?.forEach((exercice: any, eIdx: number) => {
          const eGroup = this.fb.group({
            id:        [exercice.id],
            libelle:   [exercice.libelle, Validators.required],
            image:     [exercice.image],
            ordre:     [exercice.ordre],
            questions: this.fb.array([])
          });

          if (exercice.image) {
            this.exerciceImages.set(eIdx, { file: null, preview: null, existingUrl: exercice.image });
          }

          (this.examenForm.get('exercices') as FormArray).push(eGroup);

          exercice.questions?.forEach((question: any, qIdx: number) => {
            const qGroup = this.fb.group({
              id:       [question.id],
              question: [question.question, Validators.required],
              image:    [question.image],
              ordre:    [question.ordre],
              choices:  this.fb.array([])
            });

            if (question.image) {
              this.questionImages.set(`${eIdx}_${qIdx}`, { file: null, preview: null, existingUrl: question.image });
            }

            (eGroup.get('questions') as FormArray).push(qGroup);

            question.choices?.forEach((choice: any) => {
              (qGroup.get('choices') as FormArray).push(this.fb.group({
                id:            [choice.id],
                choice_examen: [choice.choice_examen, Validators.required],
                is_correct:    [choice.is_correct]
              }));
            });
          });
        });

        this.activeTab = 'form';
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        this.toastService.error('Erreur lors du chargement de l\'examen');
      }
    });
  }

  cancelEdit(): void {
    this.isEditingExamen = false;
    this.examenToEdit = null;
    this.resetExamenForm();
  }

  resetExamenForm(): void {
    this.examenForm = this._buildExamenForm();
    this.exerciceImages.clear();
    this.questionImages.clear();
  }

  // ── Sauvegarde (création + modification) ────────────────────

  saveExamen(): void {
    if (!this.examenForm.valid || !this.selectedCategory) return;

    const fd = new FormData();
    fd.append('libelle',            this.examenForm.value.libelle);
    fd.append('montant_vendu',      this.examenForm.value.montant_vendu);
    fd.append('unite_expiration',   this.examenForm.value.unite_expiration);
    fd.append('duree_expiration',   this.examenForm.value.duree_expiration);
    fd.append('categorie_examen_id', this.selectedCategory.id);

    this.examenForm.value.exercices.forEach((exercice: any, eIdx: number) => {
      if (exercice.id) fd.append(`exercices[${eIdx}][id]`, exercice.id);
      fd.append(`exercices[${eIdx}][libelle]`, exercice.libelle);
      fd.append(`exercices[${eIdx}][ordre]`,   eIdx + 1 + '');

      const eImg = this.exerciceImages.get(eIdx);
      if (eImg?.file) {
        fd.append(`exercices[${eIdx}][image]`, eImg.file);
      } else if (eImg?.existingUrl && !eImg.file) {
        fd.append(`exercices[${eIdx}][existing_image]`, eImg.existingUrl);
      }

      exercice.questions.forEach((question: any, qIdx: number) => {
        if (question.id) fd.append(`exercices[${eIdx}][questions][${qIdx}][id]`, question.id);
        fd.append(`exercices[${eIdx}][questions][${qIdx}][question]`, question.question);
        fd.append(`exercices[${eIdx}][questions][${qIdx}][ordre]`,    qIdx + 1 + '');

        const qImg = this.questionImages.get(`${eIdx}_${qIdx}`);
        if (qImg?.file) {
          fd.append(`exercices[${eIdx}][questions][${qIdx}][image]`, qImg.file);
        } else if (qImg?.existingUrl && !qImg.file) {
          fd.append(`exercices[${eIdx}][questions][${qIdx}][existing_image]`, qImg.existingUrl);
        }

        question.choices.forEach((choice: any, cIdx: number) => {
          if (choice.id) fd.append(`exercices[${eIdx}][questions][${qIdx}][choices][${cIdx}][id]`, choice.id);
          fd.append(`exercices[${eIdx}][questions][${qIdx}][choices][${cIdx}][choice_examen]`, choice.choice_examen);
          fd.append(`exercices[${eIdx}][questions][${qIdx}][choices][${cIdx}][is_correct]`,    choice.is_correct ? '1' : '0');
        });
      });
    });

    this.isSubmitting = true;

    if (this.isEditingExamen && this.examenToEdit) {
      this.categorieService.postData<FormData, ResponseData<Examen>>(`examens/${this.examenToEdit.id}`, fd).subscribe({
        next: (data) => {
          this.toastService.success(data.message);
          this.isSubmitting = false;
          if (this.selectedCategory?.examen) {
            const idx = this.selectedCategory.examen.findIndex(c => c.id === this.examenToEdit?.id);
            if (idx !== -1) { this.selectedCategory.examen[idx] = data.data; this.examens.set(this.selectedCategory.examen); }
          }
          this.cancelEdit();
        },
        error: (err) => { console.error(err); this.toastService.error('Erreur mise à jour'); this.isSubmitting = false; }
      });
    } else {
      this.categorieService.postData<FormData, ResponseData<Examen>>('examens', fd).subscribe({
        next: (data) => {
          this.toastService.success(data.message);
          this.isSubmitting = false;
          if (this.selectedCategory?.examen) {
            this.selectedCategory.examen.push(data.data);
            this.examens.set(this.selectedCategory.examen);
          }
          this.resetExamenForm();
        },
        error: (err) => { console.error(err); this.toastService.error('Erreur création'); this.isSubmitting = false; }
      });
    }
  }

  deleteExamen(examen: any): void {
    this.alertService.showConfirmation('Suppression', 'Êtes-vous sûr de vouloir supprimer cet examen ?').then((result) => {
      if (!result.isConfirmed) return;
      this.isSubmitting = true;
      this.categorieService.deleteData<string, ResponseData<Examen>>('examens', examen.id).subscribe({
        next: () => {
          this.toastService.success('Examen supprimé');
          this.isSubmitting = false;
          if (this.selectedCategory?.examen) {
            this.selectedCategory.examen = this.selectedCategory.examen.filter((e: any) => e.id !== examen.id);
            this.examens.set(this.selectedCategory.examen);
          }
        },
        error: (err) => { console.error(err); this.toastService.error('Erreur suppression'); this.isSubmitting = false; }
      });
    });
  }

  // ── Modal visualisation ─────────────────────────────────────

  viewExamen(examen: any): void { this.selectedExamen = examen; this.showViewExamenModal = true; }
  closeViewExamenModal(): void  { this.showViewExamenModal = false; this.selectedExamen = null; }

  // ── Utilitaire ──────────────────────────────────────────────


  totalQuestions(examen: any): number {
    return (examen?.exercices || []).reduce((acc: number, ex: any) => acc + (ex.questions?.length || 0), 0);
  }

  getExercices(examen: any): any[] {
    return examen?.exercices || [];
  }

  getExercicesCount(examen: any): number {
    return examen?.exercices?.length || 0;
  }
}
