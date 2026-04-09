import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon, IonToast } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { timeOutline, cashOutline, starOutline, personOutline, chatbubbleOutline } from 'ionicons/icons';
import { OrderService } from '../../../services/order.service';

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
    title: 'Gig',
    owner: 'Freelancer',
    price: '0 DT',
    delivery: '3 days',
    rating: '4.9',
    description: 'Description...',
  };
  showToast = false;
  toastMessage = '';

  constructor(private route: ActivatedRoute, private orders: OrderService, private router: Router) {
    addIcons({ timeOutline, cashOutline, starOutline, personOutline, chatbubbleOutline });
    const id = this.route.snapshot.paramMap.get('id') || 'gig-1';
    this.gig = {
      id,
      title: 'Modern mobile UI design',
      owner: 'Mayssa',
      price: '150 DT',
      delivery: '3 days',
      rating: '4.9',
      description: 'Design complet d’app mobile avec flows, styleguide et prototypage Figma.',
    };
  }

  order() {
    this.orders.addOrder({
      gigId: this.gig.id,
      client: 'Client',
      message: 'Nouvelle commande',
      price: this.gig.price,
      delivery: this.gig.delivery,
      status: 'Pending'
    });
    this.toastMessage = 'Commande envoyée';
    this.showToast = true;
  }

  message() {
    this.router.navigate(['/chat'], { queryParams: { with: this.gig.owner } });
  }
}
