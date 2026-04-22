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
import { DashboardService, FreelancerDashboard } from '../../../services/dashboard.service';

@Component({
  selector: 'app-profile-freelancer',
  templateUrl: './profile-freelancer.page.html',
  styleUrls: ['./profile-freelancer.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
})
export class ProfileFreelancerPage implements OnInit {
  activeTab = 'profile';

  profile = {
    name: 'Freelancer',
    roleLabel: 'Freelancer account',
    title: 'Freelancer',
    bio: 'Available for new projects.',
    rating: '0.0',
    jobs: '0',
    reviews: '0',
    status: 'Approved',
    fields: [] as string[],
    cvUrl: '',
    email: '',
    phone: '',
    avatarUrl: '',
  };

  verifications = [
    { label: 'Identity check', status: 'Pending', action: 'Review status' },
    { label: 'Portfolio link', status: 'Submitted', action: 'Open profile' },
    { label: 'Store seller mode', status: 'Enabled', action: 'Go to store' },
  ];

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

    this.dashboard.getDashboard<FreelancerDashboard>().subscribe({
      next: data => {
        this.profile = {
          ...this.profile,
          rating: data.gigs.length
            ? (
                data.gigs.reduce((sum, item: Record<string, unknown>) => sum + Number(item['rating'] || 0), 0) /
                data.gigs.length
              ).toFixed(1)
            : '0.0',
          jobs: String(data.orders.length),
          reviews: String(data.applications.length),
        };
      },
    });
  }

  openNotifications() {
    this.router.navigate(['/notifications'], { queryParams: { role: 'freelancer' } });
  }

  goTo(page: string) {
    if (page === '/store') {
      this.router.navigate(['/store'], { queryParams: { role: 'freelancer' } });
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
      title: user.title?.trim() || 'Freelancer',
      bio: user.bio?.trim() || 'Available for new projects.',
      status: this.formatStatus(user.status),
      fields: Array.isArray(user.specialties) ? user.specialties : [],
      cvUrl: user.resume_url || '',
      email: user.email || '',
      phone: user.phone?.trim() || '',
      avatarUrl: user.avatar_url || '',
    };
  }

  private describeRole(role: string): string {
    if (role === 'admin') {
      return 'Admin account';
    }
    if (role === 'client') {
      return 'Client account';
    }
    return 'Freelancer account';
  }

  private formatStatus(status: string | undefined): string {
    if (!status) {
      return 'Approved';
    }

    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}
