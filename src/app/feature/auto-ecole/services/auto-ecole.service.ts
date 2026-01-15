import { Injectable } from '@angular/core';
import { ParentService } from '../../../core/services/parent.service';
import { Observable } from 'rxjs';
import { ApiResponse, AutoEcole, Region } from '../interfaces/auto-ecole';

@Injectable({
  providedIn: 'root'
})
export class AutoEcoleService extends ParentService {

  private baseUrl = 'auto-ecoles';

  // Récupérer toutes les régions avec leurs auto-écoles
  getRegionsWithAutoEcoles(): Observable<ApiResponse> {
    return this.getData<ApiResponse>(this.baseUrl);
  }

  // Créer une nouvelle auto-école
  createAutoEcole(formData: FormData): Observable<any> {
    return this.postData<FormData, any>(this.baseUrl, formData);
  }

  // Mettre à jour une auto-école
  updateAutoEcole(id: number, formData: FormData): Observable<any> {
    return this.postData<FormData, any>(`${this.baseUrl}/${id}`, formData);
  }

  // Supprimer une auto-école
  deleteAutoEcole(id: number): Observable<any> {
    return this.deleteData<number, any>(this.baseUrl, id);
  }

  // Récupérer une auto-école par ID
  getAutoEcoleById(id: number): Observable<any> {
    return this.show<any>(this.baseUrl, id);
  }
}
