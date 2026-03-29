import { Component, signal } from '@angular/core';
import { CategorieTest } from '../../interfaces/categorie-test';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Test } from '../../interfaces/test';
import { TestServiceService } from '../../services/test-service.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AlertService } from '../../../../core/services/Alert/alert.service';
import { ResponseData } from '../../../../core/interfaces/response-data';

@Component({
  selector: 'app-test',
  standalone: false,
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent {

  // ── État général ────────────────────────────────────────────
  isLoading = true;
  isSubmitting = false;
  isDeleting = false;
  activeTab: 'form' | 'list' = 'form';

  // ── Modals catégories ───────────────────────────────────────
  showEditModal = false;
  showDeleteModal = false;
  showManageTestModal = false;
  modalClosing = false;
  categoryToEdit: CategorieTest | null = null;
  categoryToDelete: CategorieTest | null = null;
  selectedCategory: CategorieTest | null = null;

  // ── État édition test ───────────────────────────────────────
  isEditingTest = false;
  testToEdit: any = null;

  // ── Images : exercice et questions ─────────────────────────
  exerciceImages: Map<number, { file: File | null; preview: string | null; existingUrl?: string }> = new Map();
  questionImages: Map<string, { file: File | null; preview: string | null; existingUrl?: string }> = new Map();

  // ── Formulaires ─────────────────────────────────────────────
  categoryForm: FormGroup;
  editForm: FormGroup;
  testForm: FormGroup;

  tests = signal<Test[]>([]);
  categories = signal<CategorieTest[]>([]);

  // ── Modal visualisation ─────────────────────────────────────
  showViewTestModal = false;
  selectedTest: any = null;

  tableColumns = [{ key: 'libelle', label: 'Libellé' }];

  constructor(
    private testService: TestServiceService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private alertService: AlertService
  ) {
    this.categoryForm = this.fb.group({ libelle: ['', Validators.required] });
    this.editForm     = this.fb.group({ id: [''], libelle: ['', Validators.required] });
    this.testForm     = this._buildTestForm();
  }

  ngOnInit(): void { this.loadCategories(); }

  // ────────────────────────────────────────────────────────────
  // HELPERS FORMULAIRE
  // ────────────────────────────────────────────────────────────

  private _buildTestForm(): FormGroup {
    return this.fb.group({
      libelle:    ['', Validators.required],
      exercices:  this.fb.array([])
    });
  }

  get exercices(): FormArray {
    return this.testForm.get('exercices') as FormArray;
  }

  getQuestions(eIdx: number): FormArray {
    return this.exercices.at(eIdx).get('questions') as FormArray;
  }

  getChoices(eIdx: number, qIdx: number): FormArray {
    return this.getQuestions(eIdx).at(qIdx).get('choices') as FormArray;
  }

  // ── Exercice ────────────────────────────────────────────────

  addExercice(): void {
    this.exercices.push(this.fb.group({
      id:        [null],
      libelle:   ['', Validators.required],
      image:     [null],
      ordre:     [this.exercices.length + 1],
      questions: this.fb.array([])
    }));
  }

  removeExercice(eIdx: number): void {
    this.exercices.removeAt(eIdx);
    this.exerciceImages.delete(eIdx);
    const newEImg = new Map<number, any>();
    this.exerciceImages.forEach((v, k) => newEImg.set(k > eIdx ? k - 1 : k, v));
    this.exerciceImages = newEImg;
    const newQImg = new Map<string, any>();
    this.questionImages.forEach((v, k) => {
      const [ei, qi] = k.split('_').map(Number);
      if (ei === eIdx) return;
      newQImg.set(`${ei > eIdx ? ei - 1 : ei}_${qi}`, v);
    });
    this.questionImages = newQImg;
  }

  // ── Question ────────────────────────────────────────────────

  addQuestion(eIdx: number): void {
    this.getQuestions(eIdx).push(this.fb.group({
      id:       [null],
      question: ['', Validators.required],
      image:    [null],
      ordre:    [this.getQuestions(eIdx).length + 1],
      choices:  this.fb.array([])
    }));
  }

  removeQuestion(eIdx: number, qIdx: number): void {
    this.getQuestions(eIdx).removeAt(qIdx);
    this.questionImages.delete(`${eIdx}_${qIdx}`);
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
      id:          [null],
      choice_test: ['', Validators.required],
      is_correct:  [false]
    }));
  }

  removeChoice(eIdx: number, qIdx: number, cIdx: number): void {
    this.getChoices(eIdx, qIdx).removeAt(cIdx);
  }

  // ── Images exercice ─────────────────────────────────────────

  onExerciceImageChange(event: any, eIdx: number): void {
    const file: File = event.target.files[0];
    if (!file || !this._validateImage(file)) return;
    const reader = new FileReader();
    reader.onload = (e: any) => this.exerciceImages.set(eIdx, { file, preview: e.target.result });
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
    if (!file || !this._validateImage(file)) return;
    const key = `${eIdx}_${qIdx}`;
    const reader = new FileReader();
    reader.onload = (e: any) => this.questionImages.set(key, { file, preview: e.target.result });
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
    if (file.size > 4 * 1024 * 1024) { this.toastService.error('Image max 4 Mo'); return false; }
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      this.toastService.error('JPG, PNG ou WebP uniquement'); return false;
    }
    return true;
  }

  // ────────────────────────────────────────────────────────────
  // CHARGEMENT
  // ────────────────────────────────────────────────────────────

  loadCategories(): void {
    this.isLoading = true;
    this.testService.getData<ResponseData<CategorieTest[]>>('categories-test').subscribe({
      next: (data) => { this.categories.set(data.data); this.isLoading = false; },
      error: (err) => { console.error(err); this.isLoading = false; this.toastService.error('Erreur chargement'); }
    });
  }

  // ────────────────────────────────────────────────────────────
  // CRUD CATÉGORIE
  // ────────────────────────────────────────────────────────────

  addCategory(): void {
    if (!this.categoryForm.valid) return;
    this.isLoading = true;
    const payload: CategorieTest = { id: '', libelle: this.categoryForm.value.libelle };
    this.testService.postData<CategorieTest, ResponseData<CategorieTest>>('categories-test', payload).subscribe({
      next: (data) => { this.categories.update(c => [...c, data.data]); this.categoryForm.reset(); this.isLoading = false; this.toastService.success('Catégorie ajoutée'); },
      error: (err) => { console.error(err); this.isLoading = false; this.toastService.error('Erreur ajout'); }
    });
  }

  openEditModal(category: CategorieTest): void {
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
    const updated: CategorieTest = { id: this.editForm.value.id, libelle: this.editForm.value.libelle };
    this.testService.putData<CategorieTest, ResponseData<CategorieTest>>(`categories-test/${updated.id}`, updated).subscribe({
      next: (data) => { this.categories.update(cats => cats.map(c => c.id === updated.id ? data.data : c)); this.closeEditModal(); this.toastService.success('Mise à jour réussie'); },
      error: (err) => { console.error(err); this.toastService.error('Erreur mise à jour'); }
    });
  }

  openDeleteModal(category: CategorieTest): void { this.categoryToDelete = category; this.showDeleteModal = true; }

  closeDeleteModal(): void {
    this.modalClosing = true;
    setTimeout(() => { this.showDeleteModal = false; this.modalClosing = false; this.categoryToDelete = null; }, 200);
  }

  confirmDelete(): void {
    if (!this.categoryToDelete) return;
    this.isDeleting = true;
    this.testService.deleteData<string, ResponseData<CategorieTest>>('categories-test', this.categoryToDelete.id).subscribe({
      next: () => { this.categories.update(cats => cats.filter(c => c.id !== this.categoryToDelete?.id)); this.isDeleting = false; this.closeDeleteModal(); this.toastService.success('Catégorie supprimée'); },
      error: (err) => { console.error(err); this.isDeleting = false; this.toastService.error('Erreur suppression'); }
    });
  }

  // ────────────────────────────────────────────────────────────
  // GESTION TESTS
  // ────────────────────────────────────────────────────────────

  openManageTestsModal(category: CategorieTest): void {
    this.selectedCategory = category;
    this.showManageTestModal = true;
    if ((category as any).tests) this.tests.set((category as any).tests);
    else if ((category as any).test) this.tests.set((category as any).test);
  }

  closeManageTestModal(): void {
    this.showManageTestModal = false;
    this.selectedCategory = null;
    this.resetTestForm();
    this.isEditingTest = false;
    this.testToEdit = null;
  }

  openEditTestModal(test: any): void {
    this.isEditingTest = true;
    this.testToEdit = test;
    this.isSubmitting = true;

    this.testService.getData<ResponseData<Test>>(`tests/${test.id}`).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        const details: any = response.data;

        this.testForm = this._buildTestForm();
        this.exerciceImages.clear();
        this.questionImages.clear();
        this.testForm.patchValue({ libelle: details.libelle });

        (details.exercices || []).forEach((exercice: any, eIdx: number) => {
          const eGroup = this.fb.group({
            id:        [exercice.id],
            libelle:   [exercice.libelle, Validators.required],
            image:     [exercice.image],
            ordre:     [exercice.ordre],
            questions: this.fb.array([])
          });
          if (exercice.image) this.exerciceImages.set(eIdx, { file: null, preview: null, existingUrl: exercice.image });
          (this.testForm.get('exercices') as FormArray).push(eGroup);

          (exercice.questions || []).forEach((question: any, qIdx: number) => {
            const qGroup = this.fb.group({
              id:       [question.id],
              question: [question.question, Validators.required],
              image:    [question.image],
              ordre:    [question.ordre],
              choices:  this.fb.array([])
            });
            if (question.image) this.questionImages.set(`${eIdx}_${qIdx}`, { file: null, preview: null, existingUrl: question.image });
            (eGroup.get('questions') as FormArray).push(qGroup);

            (question.choices || []).forEach((choice: any) => {
              (qGroup.get('choices') as FormArray).push(this.fb.group({
                id:          [choice.id],
                choice_test: [choice.choice_test, Validators.required],
                is_correct:  [choice.is_correct]
              }));
            });
          });
        });

        this.activeTab = 'form';
      },
      error: (err) => { this.isSubmitting = false; console.error(err); this.toastService.error('Erreur chargement du test'); }
    });
  }

  cancelEdit(): void { this.isEditingTest = false; this.testToEdit = null; this.resetTestForm(); }

  resetTestForm(): void {
    this.testForm = this._buildTestForm();
    this.exerciceImages.clear();
    this.questionImages.clear();
  }

  // ── Sauvegarde ──────────────────────────────────────────────

  saveTest(): void {
    if (!this.testForm.valid || !this.selectedCategory) return;

    const fd = new FormData();
    fd.append('libelle', this.testForm.value.libelle);
    fd.append('categorie_test_id', this.selectedCategory.id);

    this.testForm.value.exercices.forEach((exercice: any, eIdx: number) => {
      if (exercice.id) fd.append(`exercices[${eIdx}][id]`, exercice.id);
      fd.append(`exercices[${eIdx}][libelle]`, exercice.libelle);
      fd.append(`exercices[${eIdx}][ordre]`, String(eIdx + 1));

      const eImg = this.exerciceImages.get(eIdx);
      if (eImg?.file)         fd.append(`exercices[${eIdx}][image]`, eImg.file);
      else if (eImg?.existingUrl) fd.append(`exercices[${eIdx}][existing_image]`, eImg.existingUrl);

      exercice.questions.forEach((question: any, qIdx: number) => {
        if (question.id) fd.append(`exercices[${eIdx}][questions][${qIdx}][id]`, question.id);
        fd.append(`exercices[${eIdx}][questions][${qIdx}][question]`, question.question);
        fd.append(`exercices[${eIdx}][questions][${qIdx}][ordre]`, String(qIdx + 1));

        const qImg = this.questionImages.get(`${eIdx}_${qIdx}`);
        if (qImg?.file)          fd.append(`exercices[${eIdx}][questions][${qIdx}][image]`, qImg.file);
        else if (qImg?.existingUrl) fd.append(`exercices[${eIdx}][questions][${qIdx}][existing_image]`, qImg.existingUrl);

        question.choices.forEach((choice: any, cIdx: number) => {
          if (choice.id) fd.append(`exercices[${eIdx}][questions][${qIdx}][choices][${cIdx}][id]`, choice.id);
          fd.append(`exercices[${eIdx}][questions][${qIdx}][choices][${cIdx}][choice_test]`, choice.choice_test);
          fd.append(`exercices[${eIdx}][questions][${qIdx}][choices][${cIdx}][is_correct]`,  choice.is_correct ? '1' : '0');
        });
      });
    });

    this.isSubmitting = true;

    if (this.isEditingTest && this.testToEdit) {
      this.testService.postData<FormData, ResponseData<Test>>(`tests/${this.testToEdit.id}`, fd).subscribe({
        next: (data) => {
          this.toastService.success(data.message);
          this.isSubmitting = false;
          this._updateTestInList(data.data);
          this.cancelEdit();
        },
        error: (err) => { console.error(err); this.toastService.error('Erreur mise à jour'); this.isSubmitting = false; }
      });
    } else {
      this.testService.postData<FormData, ResponseData<Test>>('tests', fd).subscribe({
        next: (data) => {
          this.toastService.success(data.message);
          this.isSubmitting = false;
          const cat = this.selectedCategory as any;
          if (cat?.tests) { cat.tests.push(data.data); this.tests.set(cat.tests); }
          else if (cat?.test) { cat.test.push(data.data); this.tests.set(cat.test); }
          this.resetTestForm();
        },
        error: (err) => { console.error(err); this.toastService.error('Erreur création'); this.isSubmitting = false; }
      });
    }
  }

  private _updateTestInList(updated: any): void {
    const cat = this.selectedCategory as any;
    const list: any[] = cat?.tests || cat?.test || [];
    const idx = list.findIndex((t: any) => t.id === this.testToEdit?.id);
    if (idx !== -1) { list[idx] = updated; this.tests.set([...list]); }
  }

  deleteTest(test: any): void {
    this.alertService.showConfirmation('Suppression', 'Êtes-vous sûr de vouloir supprimer ce test ?').then((result) => {
      if (!result.isConfirmed) return;
      this.isSubmitting = true;
      this.testService.deleteData<string, ResponseData<Test>>('tests', test.id).subscribe({
        next: () => {
          this.toastService.success('Test supprimé');
          this.isSubmitting = false;
          this.tests.update(ts => ts.filter((t: any) => t.id !== test.id));
        },
        error: (err) => { console.error(err); this.toastService.error('Erreur suppression'); this.isSubmitting = false; }
      });
    });
  }

  // ── Modal visualisation ─────────────────────────────────────

  viewTest(test: any): void { this.selectedTest = test; this.showViewTestModal = true; }
  closeViewTestModal(): void { this.showViewTestModal = false; this.selectedTest = null; }

  // ── Utilitaires ─────────────────────────────────────────────

  getExercices(test: any): any[]   { return test?.exercices || []; }
  getExercicesCount(test: any): number { return test?.exercices?.length || 0; }
  totalQuestions(test: any): number {
    return (test?.exercices || []).reduce((acc: number, ex: any) => acc + (ex.questions?.length || 0), 0);
  }
}
