// toast.service.ts
import { Injectable, ComponentRef, ApplicationRef, createComponent, EnvironmentInjector } from '@angular/core';
import { ToastComponent } from '../../shared/components/toast/toast.component';


export interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastRef: ComponentRef<ToastComponent> | null = null;

  constructor(
    private appRef: ApplicationRef,
    private environmentInjector: EnvironmentInjector
  ) {}

  show(options: ToastOptions): void {
    // Remove existing toast if any
    this.clear();

    // Create new toast component
    this.toastRef = createComponent(ToastComponent, {
      environmentInjector: this.environmentInjector
    });

    // Set input properties
    this.toastRef.instance.message = options.message;
    this.toastRef.instance.type = options.type || 'success';
    this.toastRef.instance.duration = options.duration || 3000;

    // Add to DOM
    document.body.appendChild(this.toastRef.location.nativeElement);

    // Attach to application change detection
    this.appRef.attachView(this.toastRef.hostView);

    // Auto cleanup
    setTimeout(() => {
      this.clear();
    }, (options.duration || 3000) + 500);
  }

  clear(): void {
    if (this.toastRef) {
      // Remove from DOM
      const element = this.toastRef.location.nativeElement;
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }

      // Detach from application and destroy
      this.appRef.detachView(this.toastRef.hostView);
      this.toastRef.destroy();
      this.toastRef = null;
    }
  }

  success(message: string, duration?: number): void {
    this.show({ message, type: 'success', duration });
  }

  error(message: string, duration?: number): void {
    this.show({ message, type: 'error', duration });
  }

  info(message: string, duration?: number): void {
    this.show({ message, type: 'info', duration });
  }
}
