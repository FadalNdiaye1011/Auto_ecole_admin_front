import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  imports: [ModalComponent,CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.css'
})
export class ConfirmModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Confirmer la suppression';
  @Input() message: string = 'Êtes-vous sûr de vouloir supprimer';
  @Input() itemName?: string; // Rendre itemName optionnel
  @Input() confirmMessage: string = ' ? Cette action est irréversible.';
  @Input() confirmText: string = 'Supprimer';
  @Input() cancelText: string = 'Annuler';
  @Input() isProcessing: boolean = false;

  @Output() cancelled = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  onCancel(): void {
    this.cancelled.emit();
  }

  onConfirm(): void {
    this.confirmed.emit();
  }
}
