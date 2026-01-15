import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() showHeader: boolean = true;
  @Output() closed = new EventEmitter<void>();

  closing: boolean = false;

  onClose(): void {
    this.closing = true;
    setTimeout(() => {
      this.closed.emit();
      this.closing = false;
    }, 200);
  }
}
