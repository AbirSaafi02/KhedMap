import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';

interface ApiEnvelope<T> {
  data: T;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Api {
  constructor(private readonly http: HttpClient) {}

  get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Observable<T> {
    return this.http
      .get<ApiEnvelope<T>>(this.url(path), {
        params: this.toParams(params),
        withCredentials: true,
      })
      .pipe(map(response => response.data));
  }

  post<T>(path: string, body: unknown = {}): Observable<T> {
    return this.http
      .post<ApiEnvelope<T>>(this.url(path), body, {
        withCredentials: true,
      })
      .pipe(map(response => response.data));
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .patch<ApiEnvelope<T>>(this.url(path), body, {
        withCredentials: true,
      })
      .pipe(map(response => response.data));
  }

  private url(path: string): string {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${environment.apiUrl}${normalized}`;
  }

  private toParams(params?: Record<string, string | number | boolean | undefined>): HttpParams | undefined {
    if (!params) {
      return undefined;
    }

    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') {
        continue;
      }
      httpParams = httpParams.set(key, String(value));
    }

    return httpParams;
  }
}
