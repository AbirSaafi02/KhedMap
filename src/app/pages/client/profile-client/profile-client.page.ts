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
    title: 'Client',
    jobs: '0',
    spent: '0 DT',
    reviews: '0',
    status: 'approved',
    email: '',
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
    this.auth.me().subscribe({
      next: user => {
        this.profile = {
          ...this.profile,
          name: user.name,
          title: `${user.role} · ${user.title || 'Client'}`,
          status: user.status,
          email: user.email,
        };
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
}
