import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ParentService } from '../../../core/services/parent.service';
import { ResponseData } from '../../../core/interfaces/response-data';
import { AdminUser, Permission, PermissionsApiResponse } from '../interfaces/admin-user';

export interface CreateUserPayload {
  nom: string;
  prenom: string;
  email: string;
  numero: string;
  password: string;
  password_confirmation: string;
}

@Injectable({ providedIn: 'root' })
export class UserManagementService extends ParentService {

  getUsers(): Observable<ResponseData<AdminUser[]>> {
    return this.getData<ResponseData<AdminUser[]>>('admin/users');
  }

  createUser(data: CreateUserPayload): Observable<ResponseData<AdminUser>> {
    return this.postData<CreateUserPayload, ResponseData<AdminUser>>('admin/users', data);
  }

  deleteUser(id: number): Observable<ResponseData<any>> {
    return this.deleteData<number, ResponseData<any>>('admin/users', id);
  }

  /** Retourne { all: [...], grouped: [...] } */
  getAvailablePermissions(): Observable<ResponseData<PermissionsApiResponse>> {
    return this.getData<ResponseData<PermissionsApiResponse>>('admin/permissions');
  }

  syncPermissions(userId: number, permissions: string[]): Observable<ResponseData<AdminUser>> {
    return this.putData<{ permissions: string[] }, ResponseData<AdminUser>>(
      `admin/users/${userId}/permissions`,
      { permissions }
    );
  }
}
