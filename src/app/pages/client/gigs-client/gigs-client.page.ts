import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonToast } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline, briefcaseOutline, starOutline,
  cashOutline, timeOutline, personOutline,
  homeOutline, storefrontOutline, chatbubbleOutline, notificationsOutline
} from 'ionicons/icons';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-gigs-client',
  templateUrl: './gigs-client.page.html',
  styleUrls: ['./gigs-client.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonToast],
})
export class GigsClientPage {
  activeTab = 'gigs';
  showToast = false;
  toastMessage = 'Order placed';

  gigs = [
    { id: 'gig-1', title: 'Modern mobile UI design', category: 'Design', price: '150 DT', delivery: '3 days', rating: '4.9', owner: 'Mayssa' },
    { id: 'gig-2', title: 'Figma prototype in 48h', category: 'Design', price: '80 DT', delivery: '2 days', rating: '4.7', owner: 'Yacine' },
    { id: 'gig-3', title: 'Brand identity package', category: 'Branding', price: '200 DT', delivery: '5 days', rating: '5.0', owner: 'Sara' },
    { id: 'gig-4', title: 'Full-stack web app', category: 'Web Dev', price: '320 DT', delivery: '7 days', rating: '4.8', owner: 'Adam' },
  ];

  constructor(private router: Router, private orders: OrderService) {
    addIcons({
      searchOutline, briefcaseOutline, starOutline,
      cashOutline, timeOutline, personOutline,
      homeOutline, storefrontOutline, chatbubbleOutline, notificationsOutline
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

  setTab(tab: string) { this.activeTab = tab; }

  order(gig: any) {
    this.orders.addOrder({
      gigId: gig.id,
      client: 'Client',
      message: 'Nouvelle commande',
      price: gig.price,
      delivery: gig.delivery,
      status: 'Pending'
    });
    this.toastMessage = `Commande envoyee a ${gig.owner}`;
    this.showToast = true;
  }

  openDetail(gig: any) {
    this.router.navigate(['/client/gig-detail', gig.id]);
  }
}
