import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Subject, takeUntil, timer } from 'rxjs';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' | 'info' = 'success';
  @Input() duration: number = 3000;

  visible: boolean = false;
  private destroy$ = new Subject<void>();

  get iconPath(): string {
    switch(this.type) {
      case 'success':
        return 'M5 13l4 4L19 7';
      case 'error':
        return 'M6 18L18 6M6 6l12 12';
      case 'info':
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return 'M5 13l4 4L19 7';
    }
  }

  ngOnInit(): void {
    this.show();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  show(): void {
    this.visible = true;

    timer(this.duration)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.visible = false;
      });
  }
}
