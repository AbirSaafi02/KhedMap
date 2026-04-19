import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from './api';

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  kind: string;
  status: string;
  is_read: boolean;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private readonly api: Api) {}

  listNotifications(): Observable<AppNotification[]> {
    return this.api.get<AppNotification[]>('/notifications');
  }
}
