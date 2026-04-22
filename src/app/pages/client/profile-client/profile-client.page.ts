import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  briefcaseOutline,
  chatbubbleOutline,
  chevronForwardOutline,
  createOutline,
  homeOutline,
  logOutOutline,
  notificationsOutline,
  personOutline,
  starOutline,
  storefrontOutline,
} from 'ionicons/icons';

import { Auth, AuthUser } from '../../../services/auth';
import { ClientDashboard, DashboardService } from '../../../services/dashboard.service';

@Component({
  selector: 'app-profile-client',
  templateUrl: './profile-client.page.html',
  styleUrls: ['./profile-client.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
})
export class ProfileClientPage implements OnInit {
  activeTab = 'profile';

  profile = {
    name: 'Client',
    roleLabel: 'Client account',
    title: 'Project lead',
    bio: 'Organize briefs, approvals, and hiring updates from one clean profile.',
    jobs: '0',
    spent: '0 DT',
    reviews: '0',
    status: 'Approved',
    email: '',
    phone: '',
    avatarUrl: '',
    fields: [] as string[],
  };

  constructor(
    private readonly router: Router,
    private readonly auth: Auth,
    private readonly dashboard: DashboardService,
  ) {
    addIcons({
      briefcaseOutline,
      chatbubbleOutline,
      chevronForwardOutline,
      createOutline,
      homeOutline,
      logOutOutline,
      notificationsOutline,
      personOutline,
      starOutline,
      storefrontOutline,
    });
  }

  ngOnInit(): void {
    this.applyUser(this.auth.currentUser);

    this.auth.me().subscribe({
      next: user => {
        this.applyUser(user);
      },
    });

    this.dashboard.getDashboard<ClientDashboard>().subscribe({
      next: data => {
        this.profile = {
          ...this.profile,
          jobs: String(data.jobs.length),
          spent: `${data.stats.spend.toLocaleString()} DT`,
          reviews: String(data.orders.length),
        };
      },
    });
  }

  openNotifications() {
    this.router.navigate(['/notifications'], { queryParams: { role: 'client' } });
  }

  goTo(page: string) {
    if (page === '/store') {
      this.router.navigate(['/store'], { queryParams: { role: 'client' } });
    } else if (page === '/notifications') {
      this.openNotifications();
    } else {
      this.router.navigate([page]);
    }
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        this.auth.clearSession();
        this.router.navigate(['/login']);
      },
    });
  }

  private applyUser(user: AuthUser | null): void {
    if (!user) {
      return;
    }

    this.profile = {
      ...this.profile,
      name: user.name || this.profile.name,
      roleLabel: this.describeRole(user.role),
      title: user.title?.trim() || 'Project lead',
      bio: user.bio?.trim() || 'Organize briefs, approvals, and hiring updates from one clean profile.',
      status: this.formatStatus(user.status),
      email: user.email || '',
      phone: user.phone?.trim() || '',
      avatarUrl: user.avatar_url || '',
      fields: Array.isArray(user.specialties) ? user.specialties : [],
    };
  }

  private describeRole(role: string): string {
    if (role === 'admin') {
      return 'Admin account';
    }
    if (role === 'freelancer') {
      return 'Freelancer account';
    }
    return 'Client account';
  }

  private formatStatus(status: string | undefined): string {
    if (!status) {
      return 'Approved';
    }

    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}
