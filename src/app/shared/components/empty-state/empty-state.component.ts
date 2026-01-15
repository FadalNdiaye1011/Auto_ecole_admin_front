import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css'
})
export class EmptyStateComponent {
  @Input() title: string = 'Aucune donnée disponible';
  @Input() message: string = 'Aucune donnée à afficher pour le moment';
  @Input() customIcon: boolean = false;
}
