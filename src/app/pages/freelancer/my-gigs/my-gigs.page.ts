import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonToast } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, chatbubbleOutline, personOutline,
  storefrontOutline, briefcaseOutline, addOutline,
  trashOutline, createOutline, notificationsOutline
} from 'ionicons/icons';
import { OrderService, Order } from '../../../services/order.service';

type Gig = {
  id: string;
  title: string;
  category: string;
  price: string;
  delivery: string;
  rating: string;
  orders: number;
  active: boolean;
  ordersList: Order[];
};

@Component({
  selector: 'app-my-gigs',
  templateUrl: './my-gigs.page.html',
  styleUrls: ['./my-gigs.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonToast],
})
export class MyGigsPage {
  activeTab = 'gigs';
  showToast = false;
  toastMessage = '';

  gigs: Gig[] = [
    {
      id: 'gig-1',
      title: 'I will design a modern mobile UI',
      category: 'Design',
      price: '150 DT',
      delivery: '3 days',
      rating: '4.9',
      orders: 12,
      active: true,
      ordersList: []
    },
    {
      id: 'gig-2',
      title: 'I will create a Figma prototype',
      category: 'Design',
      price: '80 DT',
      delivery: '2 days',
      rating: '4.7',
      orders: 8,
      active: true,
      ordersList: []
    },
    {
      id: 'gig-3',
      title: 'I will design your brand identity',
      category: 'Design',
      price: '200 DT',
      delivery: '5 days',
      rating: '5.0',
      orders: 5,
      active: false,
      ordersList: []
    },
  ];

  constructor(private router: Router, private orders: OrderService) {
    addIcons({
      homeOutline, chatbubbleOutline, personOutline,
      storefrontOutline, briefcaseOutline, addOutline,
      trashOutline, createOutline, notificationsOutline
    });

    this.orders.getOrders().subscribe(list => {
      this.gigs = this.gigs.map(g => ({
        ...g,
        ordersList: list.filter(o => o.gigId === g.id)
      }));
    });
  }

  goTo(page: string) {
    if (page === '/store') {
      this.router.navigate(['/store'], { queryParams: { role: 'freelancer' } });
    } else if (page === '/notifications') {
      this.router.navigate(['/notifications'], { queryParams: { role: 'freelancer' } });
    } else {
      this.router.navigate([page]);
    }
  }
  setTab(tab: string) { this.activeTab = tab; }

  accept(order: Order) {
    this.orders.updateStatus(order.id, 'In Progress');
    this.toast('Commande acceptee');
  }

  refuse(order: Order) {
    this.orders.updateStatus(order.id, 'Refused');
    this.toast('Commande refusee');
  }

  openChat(order: Order) {
    this.router.navigate(['/chat'], { queryParams: { with: order.client } });
  }

  private toast(msg: string) {
    this.toastMessage = msg;
    this.showToast = true;
  }
}
