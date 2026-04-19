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

import { Auth } from '../../../services/auth';
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
    title: 'Freelancer',
    bio: 'Freelancer profile',
    rating: '0.0',
    jobs: '0',
    reviews: '0',
    status: 'approved',
    fields: [] as string[],
    cvUrl: '',
    email: '',
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
    this.auth.me().subscribe({
      next: user => {
        this.profile = {
          ...this.profile,
          name: user.name,
          title: user.title || 'Freelancer',
          bio: user.bio || 'Available for new projects.',
          status: user.status,
          fields: user.specialties || [],
          cvUrl: user.resume_url || '',
          email: user.email,
        };
      },
    });

    this.dashboard.getDashboard<FreelancerDashboard>().subscribe({
      next: data => {
        this.profile = {
          ...this.profile,
          rating: data.gigs.length
            ? (data.gigs.reduce((sum, item: Record<string, unknown>) => sum + Number(item['rating'] || 0), 0) / data.gigs.length).toFixed(1)
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
}
