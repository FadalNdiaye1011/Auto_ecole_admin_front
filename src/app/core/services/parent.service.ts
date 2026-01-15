import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ParentService {

  private url: string = environment.apiRoot

  constructor(private http: HttpClient) { }

  get gethttp() {
    return this.http;
  }

  getData<T>(uri: string): Observable<T> {
    return this.http.get<T>(this.url + uri).pipe(
      tap(value => {
        console.log(value);
      })
    );
  }

  postData<E, R>(uri: string, data: E): Observable<R> {
    console.log(data);

    return this.http.post<R>(this.url + uri, data).pipe(
      tap(value => console.log(value)
      )
    );
  }

  putData<E, R>(uri: string, data: E): Observable<R> {
    return this.http.put<R>(this.url + uri, data).pipe(
      tap(value => console.log(value)
      )
    );
  }

  deleteData<E, R>(uri: string, id: E): Observable<R> {
    return this.http.delete<R>(this.url + uri + `/${id}`);
  }

  show<T>(uri: string, id: string | number): Observable<T> {
    return this.http.get<T>(this.url + uri + `/${id}`).pipe(
      tap(value => console.log(value))
    );
  }

  getRole(uri:string): Observable<string> {
    return this.getData<string>(uri);
  }

}
