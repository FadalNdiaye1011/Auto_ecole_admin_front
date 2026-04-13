import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { ParentService } from '../../../core/services/parent.service';
import { ResponseData } from '../../../core/interfaces/response-data';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends ParentService{

  uriLogin: string = "login";
  uriLogout : string =  "logout";

  private userSubject = new BehaviorSubject<any>(this.getUser());
  readonly user$ = this.userSubject.asObservable();

  isAuthenticate(): boolean {
    return localStorage.getItem(environment.appName + "_token") != null;
  }

  getToken(): string {
    if (this.isAuthenticate()) {
      return localStorage.getItem(environment.appName + "_token")!
    }
    return "";
  }

  getUser(): any {
    return JSON.parse(localStorage.getItem(environment.appName + "_user")!);
  }

  updateUserInLocalStorage(user: any): void {
    localStorage.setItem(environment.appName + "_user", JSON.stringify(user));
    this.userSubject.next(user);
  }

  saveLoginTime(): void {
    localStorage.setItem(environment.appName + '_login_time', Date.now().toString());
  }

  getLoginTime(): number | null {
    const val = localStorage.getItem(environment.appName + '_login_time');
    return val ? parseInt(val, 10) : null;
  }

  clearSession(): void {
    localStorage.removeItem(environment.appName + '_token');
    localStorage.removeItem(environment.appName + '_user');
    localStorage.removeItem(environment.appName + '_login_time');
    this.userSubject.next(null);
  }

  refreshMe(): Observable<void> {
    return this.getData<ResponseData<any>>('me').pipe(
      tap(res => {
        const current = this.getUser() ?? {};
        this.updateUserInLocalStorage({ ...current, ...res.data });
      }),
      map(() => undefined)
    );
  }
}
