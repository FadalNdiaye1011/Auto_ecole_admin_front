import { Injectable } from '@angular/core';
import Swal, { SweetAlertOptions } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {


  showAlert(options: SweetAlertOptions): Promise<any> {
    return Swal.fire(options);
  }

  // Fonction pour afficher une boîte de dialogue de confirmation personnalisée
  showConfirmation(title: string, text: string): Promise<any> {
    const confirmationOptions: SweetAlertOptions = {
      title: title,
      text: text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, proceed!"
    };

    return this.showAlert(confirmationOptions);
  }

  timerAlert(options: SweetAlertOptions): Promise<any> {
    return Swal.fire(options)
  }
}
