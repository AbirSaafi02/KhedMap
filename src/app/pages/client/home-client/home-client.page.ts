import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  briefcaseOutline,
  chatbubbleOutline,
  chevronForwardOutline,
  heartOutline,
  homeOutline,
  notificationsOutline,
  personOutline,
  searchOutline,
  storefrontOutline,
} from 'ionicons/icons';

import { Auth } from '../../../services/auth';
import { ClientDashboard, DashboardService } from '../../../services/dashboard.service';

type FreelancerCard = {
  id: string;
  name: string;
  job: string;
  avatarUrl?: string;
};

type RecommendationCard = {
  id: string;
  name: string;
  title: string;
  bio: string;
  tags: string[];
  rating: string;
  avatarUrl?: string;
};

@Component({
  selector: 'app-home-client',
  templateUrl: './home-client.page.html',
  styleUrls: ['./home-client.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
})
export class HomeClientPage implements OnInit {
  activeTab = 'home';
  userName = 'Mustapha';

  freelancers: FreelancerCard[] = [
    { id: 'freelancer-1', name: 'Adam', job: 'UI/UX Designer / 2 years exp' },
    { id: 'freelancer-2', name: 'Arwa', job: 'Backend Developer' },
    { id: 'freelancer-3', name: 'Mariem', job: 'Mobile Developer' },
  ];

  recommendations: RecommendationCard[] = [
    { id: 'freelancer-4', name: 'Ala', title: 'UI/UX Designer', bio: 'Passionate about creating intuitive and engaging user experiences', tags: ['Design'], rating: '4.9' },
    { id: 'freelancer-5', name: 'Moataz', title: 'Translator', bio: 'Professional translator german, spanish and arabic with 3 years exp', tags: ['Translator'], rating: '4.7' },
    { id: 'freelancer-6', name: 'Sarra', title: 'Developer', bio: 'Full stack developer specialized in mobile and web apps', tags: ['Development'], rating: '4.8' },
  ];

  categories = ['All', 'Design', 'Development', 'Marketing'];
  activeCategory = 'All';

  constructor(
    private readonly router: Router,
    private readonly dashboard: DashboardService,
    private readonly auth: Auth,
  ) {
    addIcons({
      addCircleOutline,
      briefcaseOutline,
      chatbubbleOutline,
      chevronForwardOutline,
      heartOutline,
      homeOutline,
      notificationsOutline,
      personOutline,
      searchOutline,
      storefrontOutline,
    });
  }

  ngOnInit(): void {
    this.userName = this.auth.currentUser?.name || this.userName;

    this.dashboard.getDashboard<ClientDashboard>().subscribe({
      next: (data: ClientDashboard) => {
        this.userName = this.auth.currentUser?.name || this.userName;

        this.freelancers = data.freelancers.map((item: Record<string, unknown>) => {
          const specialties = Array.isArray(item['specialties']) ? item['specialties'] as string[] : [];
          const title = String(item['title'] || 'Freelancer');
          const summary = specialties.length ? specialties.slice(0, 2).join(' / ') : title;

          return {
            id: String(item['id'] || ''),
            name: String(item['name'] || 'Freelancer'),
            job: summary || title,
            avatarUrl: String(item['avatar_url'] || ''),
          };
        });

        this.recommendations = data.gigs.map((item: Record<string, unknown>) => {
          const owner = (item['owner'] || {}) as Record<string, unknown>;
          return {
            id: String(owner['id'] || ''),
            name: String(owner['name'] || 'Freelancer'),
            title: String(item['title'] || 'Gig'),
            bio: String(item['description'] || 'Available for new work.'),
            tags: [String(item['category'] || 'General')],
            rating: item['rating'] ? String(item['rating']) : 'New',
            avatarUrl: String(owner['avatar_url'] || ''),
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

  openFreelancer(id: string) {
    this.router.navigate(['/client/freelancer', id]);
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  setCategory(category: string) {
    this.activeCategory = category;
  }

  get filteredRecommendations(): RecommendationCard[] {
    if (this.activeCategory === 'All') {
      return this.recommendations;
    }

    return this.recommendations.filter(item => item.tags.includes(this.activeCategory));
  }
}
