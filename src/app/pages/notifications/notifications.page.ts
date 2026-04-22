import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  arrowBackOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  notificationsOutline,
  timeOutline,
} from 'ionicons/icons';

import { Auth } from '../../services/auth';
import { AppNotification, NotificationService } from '../../services/notification.service';

type Role = 'freelancer' | 'client' | 'admin';
type Status = 'pending' | 'approved' | 'rejected';

interface AlertItem {
  title: string;
  message: string;
  status: Status;
  type: string;
  date: string;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
})
export class NotificationsPage implements OnInit {
  role: Role = 'freelancer';
  alerts: AlertItem[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly auth: Auth,
    private readonly notifications: NotificationService,
  ) {
    addIcons({
      alertCircleOutline,
      arrowBackOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      notificationsOutline,
      timeOutline,
    });
  }

  ngOnInit() {
    const roleParam = this.route.snapshot.queryParamMap.get('role') as Role | null;
    const currentRole = this.auth.currentUser?.role;
    const storedRole = localStorage.getItem('currentRole') as Role | null;
    this.role = roleParam || (currentRole as Role) || storedRole || 'freelancer';

    this.notifications.listNotifications().subscribe({
      next: notifications => {
        this.alerts = notifications.map((item: AppNotification) => ({
          title: item.title,
          message: item.message,
          status: this.normalizeStatus(item.status),
          type: item.kind,
          date: this.relativeDate(item.created_at),
        }));
        this.notifications.markAllAsRead().subscribe();
      },
    });
  }

  goHome() {
    if (this.role === 'client') this.router.navigate(['/client/home']);
    else if (this.role === 'admin') this.router.navigate(['/admin/dashboard']);
    else this.router.navigate(['/freelancer/home']);
  }

  private normalizeStatus(status: string): Status {
    if (status === 'rejected') return 'rejected';
    if (status === 'approved' || status === 'info') return 'approved';
    return 'pending';
  }

  private relativeDate(value: string): string {
    const date = new Date(value);
    const diffHours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 24) return 'Today';
    if (diffHours < 48) return 'Yesterday';
    return `${Math.floor(diffHours / 24)} days ago`;
  }
}
