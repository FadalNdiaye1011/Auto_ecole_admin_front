import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  template?: TemplateRef<any>;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.css'
})
export class DataTableComponent {
  @Input() items: any[] = [];
  @Input() title: string = 'Liste';
  @Input() labelKey: string = 'libelle';
  @Input() subLabelKey: string = 'created_at';
  @Input() itemCountLabel: string = 'élément(s) disponible(s)';
  @Input() emptyMessage: string = 'Aucun élément disponible';
  @Input() showItemCount: boolean = true;
  @Input() showEditButton: boolean = true;
  @Input() showDeleteButton: boolean = true;
  @Input() itemTemplate: TemplateRef<any> | null = null;
  @Input() columns: TableColumn[] = [];
  @Input() useTableMode: boolean = false;

  @Output() editItem = new EventEmitter<any>();
  @Output() deleteItem = new EventEmitter<any>();

  @Input() showViewButton: boolean = false;
  @Output() viewItem = new EventEmitter<any>();




  currentSortColumn: string | null = null;
  currentSortDirection: 'asc' | 'desc' = 'asc';

  getItemLabel(item: any): string {
    return item[this.labelKey] || 'Sans titre';
  }

  getItemSubLabel(item: any): string {
    return item[this.subLabelKey] || '';
  }

  getCellValue(item: any, column: TableColumn): string {
    return item[column.key] || '';
  }

  onEdit(item: any): void {
    this.editItem.emit(item);
  }

  onDelete(item: any): void {
    this.deleteItem.emit(item);
  }

  onView(item: any): void {
    this.viewItem.emit(item);
  }

}
