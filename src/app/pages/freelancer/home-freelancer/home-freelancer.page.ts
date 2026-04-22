import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  briefcaseOutline,
  chatbubbleOutline,
  chevronForwardOutline,
  homeOutline,
  notificationsOutline,
  personOutline,
  searchOutline,
  storefrontOutline,
} from 'ionicons/icons';

import { Auth } from '../../../services/auth';
import { DashboardService, FreelancerDashboard } from '../../../services/dashboard.service';
import { Job } from '../../../models/job.model';

type ClientCard = {
  name: string;
  job: string;
};

type Recommendation = {
  id: string;
  name: string;
  bio: string;
  tags: string[];
  budget: string;
};

@Component({
  selector: 'app-home-freelancer',
  templateUrl: './home-freelancer.page.html',
  styleUrls: ['./home-freelancer.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
})
export class HomeFreelancerPage implements OnInit {
  activeTab = 'home';
  userName = 'Mayssa';
  notificationsCount = 0;
  unreadMessagesCount = 0;
  status = { account: 'Pending', gigsPending: 2, unread: 4 };

  clients: ClientCard[] = [];

  recommendations: Recommendation[] = [];

  categories = ['All', 'Design', 'Web Dev', 'Video Editor', 'Marketing'];
  activeCategory = 'All';

  jobBoard: Job[] = [];

  constructor(
    private readonly router: Router,
    private readonly dashboard: DashboardService,
    private readonly auth: Auth,
  ) {
    addIcons({
      briefcaseOutline,
      chatbubbleOutline,
      chevronForwardOutline,
      homeOutline,
      notificationsOutline,
      personOutline,
      searchOutline,
      storefrontOutline,
    });
  }

  ngOnInit(): void {
    this.userName = this.auth.currentUser?.name || this.userName;

    this.dashboard.getDashboard<FreelancerDashboard>().subscribe({
      next: (data: FreelancerDashboard) => {
        this.userName = this.auth.currentUser?.name || this.userName;
        this.notificationsCount = data.notifications.filter((item: Record<string, unknown>) => !item['is_read']).length;
        this.unreadMessagesCount = Number(data.stats.unread_messages || 0);
        this.status = {
          account: this.formatStatus(this.auth.currentUser?.status || 'approved'),
          gigsPending: data.gigs.filter((item: Record<string, unknown>) => item['status'] === 'pending').length,
          unread: this.unreadMessagesCount,
        };

        this.jobBoard = data.open_jobs.map((item: Record<string, unknown>) => ({
          id: String(item['id'] || ''),
          title: String(item['title'] || 'Job'),
          status: String(item['status'] || 'open') as Job['status'],
          posted: 'New',
          budget: this.formatMoney(Number(item['budget'] || 0), String(item['currency'] || 'DT')),
          applicants: Number(item['applicant_count'] || 0),
          shortlisted: Number(item['shortlisted_count'] || 0),
          notes: String(((item['client'] || {}) as Record<string, unknown>)['name'] || item['description'] || ''),
        }));

        this.clients = data.open_jobs
          .map((item: Record<string, unknown>) => {
            const client = (item['client'] || {}) as Record<string, unknown>;
            return {
              name: String(client['name'] || 'Client'),
              job: `${String(item['category'] || 'General')} | ${this.formatMoney(Number(item['budget'] || 0), String(item['currency'] || 'DT'))}`,
            };
          })
          .filter((item: ClientCard, index: number, list: ClientCard[]) => list.findIndex((other: ClientCard) => other.name === item.name) === index);

        this.recommendations = data.open_jobs.map((item: Record<string, unknown>) => {
          const client = (item['client'] || {}) as Record<string, unknown>;
          return {
            id: String(item['id'] || ''),
            name: String(client['name'] || 'Client'),
            bio: String(item['description'] || 'New opportunity waiting for your proposal.'),
            tags: [String(item['category'] || 'General'), String(item['employment_type'] || 'Freelance')],
            budget: this.formatMoney(Number(item['budget'] || 0), String(item['currency'] || 'DT')),
          };
        });

        const dynamicCategories = this.recommendations.reduce<string[]>((accumulator, item) => {
          accumulator.push(...item.tags);
          return accumulator;
        }, []);
        this.categories = ['All', ...new Set(dynamicCategories)];
      },
      error: () => {
        this.auth.me().subscribe({
          next: user => {
            this.userName = user.name;
          },
        });
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

  openJob(jobId?: string) {
    if (!jobId) {
      return;
    }
    this.router.navigate(['/freelancer/job-detail', jobId]);
  }

  openApply(jobId?: string) {
    if (!jobId) {
      return;
    }
    this.router.navigate(['/freelancer/apply-job', jobId]);
  }

  openGigComposer() {
    this.router.navigate(['/freelancer/add-gig']);
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  setCategory(category: string) {
    this.activeCategory = category;
  }

  get filteredRecommendations(): Recommendation[] {
    if (this.activeCategory === 'All') {
      return this.recommendations;
    }

    return this.recommendations.filter(item => item.tags.includes(this.activeCategory));
  }

  private formatMoney(value: number, currency: string): string {
    return `${value.toLocaleString()} ${currency}`;
  }

  private formatStatus(status: string): string {
    return status ? `${status.charAt(0).toUpperCase()}${status.slice(1)}` : 'Approved';
  }
}
