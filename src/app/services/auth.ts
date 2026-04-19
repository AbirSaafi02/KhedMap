import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Api } from './api';

export type UserRole = 'freelancer' | 'client' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  phone?: string;
  title?: string;
  bio?: string;
  specialties?: string[];
  resume_url?: string;
  avatar_url?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'freelancer' | 'client';
  phone?: string;
  bio?: string;
  resume_url?: string;
  title?: string;
  specialties?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly storageKey = 'currentUser';
  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(this.readStoredUser());

  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly api: Api) {}

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  login(payload: LoginPayload): Observable<AuthUser> {
    return this.api.post<AuthUser>('/auth/login', payload).pipe(
      tap(user => this.persistUser(user)),
    );
  }

  register(payload: RegisterPayload): Observable<AuthUser> {
    return this.api.post<AuthUser>('/auth/register', payload).pipe(
      tap(user => this.persistUser(user)),
    );
  }

  me(): Observable<AuthUser> {
    return this.api.get<AuthUser>('/me').pipe(
      tap(user => this.persistUser(user)),
    );
  }

  updateProfile(payload: Partial<AuthUser>): Observable<AuthUser> {
    return this.api.patch<AuthUser>('/me', payload).pipe(
      tap(user => this.persistUser(user)),
    );
  }

  logout(): Observable<{ ok: boolean }> {
    return this.api.post<{ ok: boolean }>('/auth/logout').pipe(
      tap(() => this.clearSession()),
    );
  }

  clearSession(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem('currentRole');
    this.currentUserSubject.next(null);
  }

  routeForRole(role: UserRole): string {
    if (role === 'client') {
      return '/client/home';
    }
    if (role === 'admin') {
      return '/admin/dashboard';
    }
    return '/freelancer/home';
  }

  errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.error || error.message || 'Request failed.';
    }
    return 'Request failed.';
  }

  private persistUser(user: AuthUser): void {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    localStorage.setItem('currentRole', user.role);
    this.currentUserSubject.next(user);
  }

  private readStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
