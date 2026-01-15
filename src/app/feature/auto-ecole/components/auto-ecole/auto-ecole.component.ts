import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import { ToastComponent } from '../../../../shared/components/toast/toast.component';
import { AutoEcole, Region } from '../../interfaces/auto-ecole';
import { AutoEcoleService } from '../../services/auto-ecole.service';

@Component({
  selector: 'app-auto-ecole',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, ToastComponent],
  templateUrl: './auto-ecole.component.html',
  styleUrls: ['./auto-ecole.component.css']
})
export class AutoEcoleComponent implements OnInit {
  regions: Region[] = [];
  selectedRegion: Region | null = null;
  isLoading = false;
  searchTerm = '';
  sortOrder = 'recent';
  currentTab: 'list' | 'add' | 'stats' | 'view' | 'edit' = 'list';

  // Toast notifications
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'success';
  showToast = false;

  // Données pour le formulaire
  selectedAutoEcole: AutoEcole | null = null;
  formData: {
    nom: string;
    numero: string;
    region_id: number | null;
    logo: File | null;
    logoPreview: string;
  } = {
    nom: '',
    numero: '',
    region_id: null,
    logo: null,
    logoPreview: ''
  };

  // Pour le modal de visualisation
  viewModalOpen = false;
  autoEcoleToView: AutoEcole | null = null;

  tableColumns = [
    { key: 'libelle', label: 'Libellé' },
  ];

  constructor(private autoEcoleService: AutoEcoleService) {}

  ngOnInit(): void {
    this.loadRegions();
  }

  // Méthode pour afficher un toast
  displayToast(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    // Réinitialiser après 3 secondes
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  loadRegions(): void {
    this.isLoading = true;
    this.autoEcoleService.getRegionsWithAutoEcoles().subscribe({
      next: (response) => {
        console.log('✅ Réponse API:', response);
        if (response.status) {
          this.regions = response.data;
          console.log('✅ Régions chargées:', this.regions);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des régions:', error);
        this.displayToast('Erreur lors du chargement des régions', 'error');
        this.isLoading = false;
      }
    });
  }

  selectRegion(region: Region): void {
    console.log('🔍 Région sélectionnée:', region);
    this.selectedRegion = region;
    this.currentTab = 'list';
    this.formData.region_id = region.id;
  }

  closeModal(): void {
    this.selectedRegion = null;
    this.selectedAutoEcole = null;
    this.searchTerm = '';
    this.sortOrder = 'recent';
    this.currentTab = 'list';
    this.resetForm();
    this.viewModalOpen = false;
    this.autoEcoleToView = null;
  }

  setTab(tab: 'list' | 'add' | 'stats' | 'view' | 'edit'): void {
    this.currentTab = tab;
  }

  get filteredAutoEcoles(): AutoEcole[] {
    if (!this.selectedRegion) return [];

    let filtered = this.selectedRegion.auto_ecoles;

    if (this.searchTerm) {
      filtered = filtered.filter(ae =>
        ae.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        ae.numero.includes(this.searchTerm)
      );
    }

    // Appliquer le tri
    if (this.sortOrder === 'recent') {
      filtered = filtered.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (this.sortOrder === 'oldest') {
      filtered = filtered.sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (this.sortOrder === 'name') {
      filtered = filtered.sort((a, b) => a.nom.localeCompare(b.nom));
    }

    return filtered;
  }

  // MODAL DE VISUALISATION
  onViewAutoEcole(autoEcole: AutoEcole): void {
    console.log('👁️ Voir auto-école:', autoEcole);
    this.autoEcoleToView = autoEcole;
    this.viewModalOpen = true;
  }

  closeViewModal(): void {
    this.viewModalOpen = false;
    this.autoEcoleToView = null;
  }

  // MODIFICATION
  onEditAutoEcole(autoEcole: AutoEcole): void {
    console.log('✏️ Modifier auto-école:', autoEcole);
    this.selectedAutoEcole = autoEcole;
    this.formData = {
      nom: autoEcole.nom,
      numero: autoEcole.numero,
      region_id: autoEcole.region_id,
      logo: null,
      logoPreview: autoEcole.logo ? autoEcole.logo : ''
    };
    this.currentTab = 'add';
  }

  // SUPPRESSION
  onDeleteAutoEcole(autoEcole: AutoEcole): void {
    if (confirm(`Voulez-vous vraiment supprimer "${autoEcole.nom}" ? Cette action est irréversible.`)) {
      console.log('🗑️ Suppression auto-école:', autoEcole);

      this.autoEcoleService.deleteAutoEcole(autoEcole.id).subscribe({
        next: (response) => {
          console.log('✅ Auto-école supprimée:', response);
          if (response.status) {
            // Mettre à jour la liste localement
            if (this.selectedRegion) {
              this.selectedRegion.auto_ecoles = this.selectedRegion.auto_ecoles.filter(
                ae => ae.id !== autoEcole.id
              );
            }
            this.displayToast('Auto-école supprimée avec succès!', 'success');
          } else {
            this.displayToast('Erreur lors de la suppression: ' + response.message, 'error');
          }
        },
        error: (error) => {
          console.error('❌ Erreur suppression:', error);
          this.displayToast('Erreur lors de la suppression. Veuillez réessayer.', 'error');
        }
      });
    }
  }

  // GESTION DU FORMULAIRE
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.formData.logo = file;

      // Prévisualisation
      const reader = new FileReader();
      reader.onload = () => {
        this.formData.logoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  resetForm(): void {
    this.formData = {
      nom: '',
      numero: '',
      region_id: this.selectedRegion?.id || null,
      logo: null,
      logoPreview: ''
    };
    this.selectedAutoEcole = null;
  }

  // SOUMISSION DU FORMULAIRE (Ajout ou Modification)
  onSubmit(): void {
    if (!this.formData.nom || !this.formData.numero || !this.formData.region_id) {
      this.displayToast('Veuillez remplir tous les champs obligatoires (*)', 'error');
      return;
    }

    // Créer FormData pour l'envoi multipart/form-data
    const formDataToSend = new FormData();
    formDataToSend.append('nom', this.formData.nom);
    formDataToSend.append('numero', this.formData.numero);
    formDataToSend.append('region_id', this.formData.region_id.toString());

    if (this.formData.logo) {
      formDataToSend.append('logo', this.formData.logo);
    }

    if (this.selectedAutoEcole) {
      // MODIFICATION
      this.autoEcoleService.updateAutoEcole(this.selectedAutoEcole.id, formDataToSend).subscribe({
        next: (response) => {
          console.log('✅ Auto-école modifiée:', response);
          if (response.status) {
            // Mettre à jour la liste localement
            if (this.selectedRegion && response.data) {
              const index = this.selectedRegion.auto_ecoles.findIndex(
                ae => ae.id === this.selectedAutoEcole?.id
              );
              if (index !== -1) {
                this.selectedRegion.auto_ecoles[index] = response.data;
              }
            }
            this.displayToast('Auto-école modifiée avec succès!', 'success');
            this.setTab('list');
            this.resetForm();
          } else {
            this.displayToast('Erreur: ' + response.message, 'error');
          }
        },
        error: (error) => {
          console.error('❌ Erreur modification:', error);
          this.displayToast('Erreur lors de la modification. Veuillez réessayer.', 'error');
        }
      });
    } else {
      // AJOUT
      this.autoEcoleService.createAutoEcole(formDataToSend).subscribe({
        next: (response) => {
          console.log('✅ Auto-école créée:', response);
          if (response.status) {
            // Ajouter à la liste localement
            if (this.selectedRegion && response.data) {
              this.selectedRegion.auto_ecoles.push(response.data);
            }
            this.displayToast('Auto-école créée avec succès!', 'success');
            this.setTab('list');
            this.resetForm();
          } else {
            this.displayToast('Erreur: ' + response.message, 'error');
          }
        },
        error: (error) => {
          console.error('❌ Erreur création:', error);
          this.displayToast('Erreur lors de la création. Veuillez réessayer.', 'error');
        }
      });
    }
  }
}
