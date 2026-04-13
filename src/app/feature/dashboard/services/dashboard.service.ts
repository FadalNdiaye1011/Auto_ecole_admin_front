import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ParentService } from '../../../core/services/parent.service';
import { ResponseData } from '../../../core/interfaces/response-data';
import { DashboardData } from '../interfaces/dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends ParentService {

  getDashboard(): Observable<ResponseData<DashboardData>> {
    return this.getData<ResponseData<DashboardData>>('dashboard');
  }
}
