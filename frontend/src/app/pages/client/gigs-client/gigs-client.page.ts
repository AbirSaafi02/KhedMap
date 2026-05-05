import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonToast } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  briefcaseOutline,
  cashOutline,
  chatbubbleOutline,
  homeOutline,
  notificationsOutline,
  personOutline,
  searchOutline,
  starOutline,
  storefrontOutline,
  timeOutline,
} from 'ionicons/icons';

import { MarketplaceGig, MarketplaceService } from '../../../services/marketplace.service';

type GigCard = {
  id: string;
  title: string;
  category: string;
  price: string;
  delivery: string;
  rating: string;
  owner: string;
};

@Component({
  selector: 'app-gigs-client',
  templateUrl: './gigs-client.page.html',
  styleUrls: ['./gigs-client.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonToast],
})
export class GigsClientPage implements OnInit {
  activeTab = 'gigs';
  showToast = false;
  toastMessage = 'Order placed';
  gigs: GigCard[] = [];

  constructor(private readonly router: Router, private readonly marketplace: MarketplaceService) {
    addIcons({
      briefcaseOutline,
      cashOutline,
      chatbubbleOutline,
      homeOutline,
      notificationsOutline,
      personOutline,
      searchOutline,
      starOutline,
      storefrontOutline,
      timeOutline,
    });
  }

  ngOnInit(): void {
    this.marketplace.listGigs({ status: 'approved' }).subscribe({
      next: gigs => {
        this.gigs = gigs.map((gig: MarketplaceGig) => ({
          id: gig.id,
          title: gig.title,
          category: gig.category,
          price: `${gig.price.toLocaleString()} ${gig.currency}`,
          delivery: gig.delivery,
          rating: gig.rating ? gig.rating.toFixed(1) : 'New',
          owner: gig.owner?.name || 'Freelancer',
        }));
      },
    });
  }

  goTo(page: string) {
    if (page === '/store') {
      this.router.navigate(['/store'], { queryParams: { role: 'client' } });
    } else if (page === '/notifications') {
      this.router.navigate(['/notifications'], { queryParams: { role: 'client' } });
    } else {
      this.router.navigate([page]);
    }
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  order(gig: GigCard) {
    this.marketplace.orderGig(gig.id, 'New gig order').subscribe({
      next: () => {
        this.toastMessage = `Commande envoyee a ${gig.owner}`;
        this.showToast = true;
      },
    });
  }

  openDetail(gig: GigCard) {
    this.router.navigate(['/client/gig-detail', gig.id]);
  }
}
