import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon, IonToast } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cashOutline, chatbubbleOutline, personOutline, starOutline, timeOutline } from 'ionicons/icons';

import { MarketplaceService } from '../../../services/marketplace.service';

@Component({
  selector: 'app-gig-detail',
  templateUrl: './gig-detail.page.html',
  styleUrls: ['./gig-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonToast],
})
export class GigDetailPage {
  gig = {
    id: '',
    ownerId: '',
    title: 'Gig',
    owner: 'Freelancer',
    price: '0 DT',
    delivery: '3 days',
    rating: '4.9',
    description: 'Description...',
  };
  showToast = false;
  toastMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly marketplace: MarketplaceService,
    private readonly router: Router,
  ) {
    addIcons({ cashOutline, chatbubbleOutline, personOutline, starOutline, timeOutline });
    const id = this.route.snapshot.paramMap.get('id') || '';
    if (id) {
      this.marketplace.getGig(id).subscribe({
        next: gig => {
          this.gig = {
            id: gig.id,
            ownerId: gig.owner?.id || gig.freelancer_id,
            title: gig.title,
            owner: gig.owner?.name || 'Freelancer',
            price: `${gig.price.toLocaleString()} ${gig.currency}`,
            delivery: gig.delivery,
            rating: gig.rating ? gig.rating.toFixed(1) : 'New',
            description: gig.description || 'Description...',
          };
        },
      });
    }
  }

  order() {
    this.marketplace.orderGig(this.gig.id, 'New gig order').subscribe({
      next: () => {
        this.toastMessage = 'Commande envoyee';
        this.showToast = true;
      },
    });
  }

  message() {
    this.router.navigate(['/chat'], {
      queryParams: { partnerId: this.gig.ownerId, partnerName: this.gig.owner },
    });
  }
}
