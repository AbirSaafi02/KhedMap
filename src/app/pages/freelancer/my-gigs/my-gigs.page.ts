import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonToast } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  briefcaseOutline,
  chatbubbleOutline,
  createOutline,
  homeOutline,
  notificationsOutline,
  personOutline,
  storefrontOutline,
  trashOutline,
} from 'ionicons/icons';

import { DashboardService, FreelancerDashboard } from '../../../services/dashboard.service';
import { MarketplaceService, OrderStatus } from '../../../services/marketplace.service';

type GigOrder = {
  id: string;
  clientId: string;
  client: string;
  message: string;
  price: string;
  delivery: string;
  status: OrderStatus;
};

type Gig = {
  id: string;
  title: string;
  category: string;
  price: string;
  delivery: string;
  rating: string;
  orders: number;
  active: boolean;
  ordersList: GigOrder[];
};

@Component({
  selector: 'app-my-gigs',
  templateUrl: './my-gigs.page.html',
  styleUrls: ['./my-gigs.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonToast],
})
export class MyGigsPage implements OnInit {
  activeTab = 'gigs';
  showToast = false;
  toastMessage = '';
  gigs: Gig[] = [];

  constructor(
    private readonly router: Router,
    private readonly dashboard: DashboardService,
    private readonly marketplace: MarketplaceService,
  ) {
    addIcons({
      addOutline,
      briefcaseOutline,
      chatbubbleOutline,
      createOutline,
      homeOutline,
      notificationsOutline,
      personOutline,
      storefrontOutline,
      trashOutline,
    });
  }

  ngOnInit(): void {
    this.loadDashboard();
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

  setTab(tab: string) {
    this.activeTab = tab;
  }

  accept(order: GigOrder) {
    this.updateOrder(order, 'In Progress', 'Order accepted');
  }

  refuse(order: GigOrder) {
    this.updateOrder(order, 'Refused', 'Order refused');
  }

  openChat(order: GigOrder) {
    this.router.navigate(['/chat'], {
      queryParams: { partnerId: order.clientId, partnerName: order.client },
    });
  }

  get totalOrders(): number {
    return this.gigs.reduce((sum, gig) => sum + gig.ordersList.length, 0);
  }

  get averageRating(): string {
    if (!this.gigs.length) {
      return '0.0';
    }
    const total = this.gigs.reduce((sum, gig) => sum + Number(gig.rating || 0), 0);
    return (total / this.gigs.length).toFixed(1);
  }

  private loadDashboard(): void {
    this.dashboard.getDashboard<FreelancerDashboard>().subscribe({
      next: data => {
        const gigOrders = data.orders.filter((item: Record<string, unknown>) => item['source_type'] === 'gig');
        this.gigs = data.gigs.map((item: Record<string, unknown>) => ({
          id: String(item['id'] || ''),
          title: String(item['title'] || 'Gig'),
          category: String(item['category'] || 'General'),
          price: `${Number(item['price'] || 0).toLocaleString()} ${String(item['currency'] || 'DT')}`,
          delivery: String(item['delivery'] || '3 days'),
          rating: Number(item['rating'] || 0).toFixed(1),
          orders: Number(item['order_count'] || 0),
          active: String(item['status'] || '').toLowerCase() === 'approved',
          ordersList: gigOrders
            .filter((order: Record<string, unknown>) => String(order['source_id'] || '') === String(item['id'] || ''))
            .map((order: Record<string, unknown>) => {
              const client = (order['client'] || {}) as Record<string, unknown>;
              return {
                id: String(order['id'] || ''),
                clientId: String(client['id'] || order['client_id'] || ''),
                client: String(client['name'] || 'Client'),
                message: String(order['message'] || 'New order'),
                price: `${Number(order['price'] || 0).toLocaleString()} ${String(order['currency'] || 'DT')}`,
                delivery: String(order['delivery'] || '3 days'),
                status: String(order['status'] || 'Pending') as OrderStatus,
              };
            }),
        }));
      },
    });
  }

  private updateOrder(order: GigOrder, status: OrderStatus, message: string): void {
    this.marketplace.updateOrderStatus(order.id, status).subscribe({
      next: () => {
        this.gigs = this.gigs.map(gig => ({
          ...gig,
          ordersList: gig.ordersList.map(entry => (
            entry.id === order.id ? { ...entry, status } : entry
          )),
        }));
        this.toastMessage = message;
        this.showToast = true;
      },
    });
  }
}
