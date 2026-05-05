import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon, IonToast } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, briefcaseOutline, chatbubbleOutline, starOutline } from 'ionicons/icons';

import { Auth } from '../../../services/auth';
import { MarketplaceService } from '../../../services/marketplace.service';

@Component({
  selector: 'app-freelancer-detail',
  templateUrl: './freelancer-detail.page.html',
  styleUrls: ['./freelancer-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonToast],
})
export class FreelancerDetailPage {
  clientName = 'Client';
  freelancer = {
    id: '',
    name: 'Freelancer',
    title: 'Freelancer',
    rating: '4.9',
    jobs: 0,
    bio: 'Freelancer profile',
    tags: [] as string[],
    avatarUrl: '',
  };
  highlights: string[] = [];
  showToast = false;
  toastMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly auth: Auth,
    private readonly marketplace: MarketplaceService,
  ) {
    addIcons({ arrowBackOutline, briefcaseOutline, chatbubbleOutline, starOutline });
    this.clientName = this.auth.currentUser?.name || 'Client';

    const id = this.route.snapshot.paramMap.get('id') || '';
    if (id) {
      this.marketplace.getFreelancer(id).subscribe({
        next: freelancer => {
          const specialties = freelancer.specialties || [];
          this.freelancer = {
            id: freelancer.id,
            name: freelancer.name,
            title: freelancer.title || 'Freelancer',
            rating: '4.9',
            jobs: specialties.length || 1,
            bio: freelancer.bio || 'Available for new projects.',
            tags: specialties.length ? specialties : ['General'],
            avatarUrl: freelancer.avatar_url || '',
          };
          this.highlights = [
            `${freelancer.name} works in ${this.freelancer.tags.join(', ')}`,
            freelancer.resume_url ? `Resume on file: ${freelancer.resume_url}` : 'Resume available on request',
            freelancer.phone ? `Direct contact: ${freelancer.phone}` : 'Messaging available through KhedMap',
          ];
        },
      });
    }
  }

  goBack() {
    this.router.navigate(['/client/home']);
  }

  contact() {
    this.router.navigate(['/chat'], {
      queryParams: { partnerId: this.freelancer.id, partnerName: this.freelancer.name },
    });
  }

  hire() {
    this.contact();
  }
}
