import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  briefcaseOutline,
  checkmarkOutline,
  closeOutline,
  logOutOutline,
  personOutline,
  storefrontOutline,
  warningOutline,
} from 'ionicons/icons';

import { Auth } from '../../../services/auth';
import { AdminDashboard, DashboardService } from '../../../services/dashboard.service';

type ReviewStatus = 'Pending' | 'Approved' | 'Rejected';
type ReviewItemType = 'user' | 'gig' | 'product' | 'report';

interface Freelancer {
  id: string;
  name: string;
  field: string;
  status: ReviewStatus;
  itemType: ReviewItemType;
}

interface Gig {
  id: string;
  title: string;
  owner: string;
  price: string;
  status: ReviewStatus;
  itemType: ReviewItemType;
}

interface StoreProduct {
  id: string;
  title: string;
  seller: string;
  price: string;
  status: ReviewStatus;
  itemType: ReviewItemType;
}

interface Report {
  id: string;
  from: string;
  about: string;
  reason: string;
  status: ReviewStatus;
  itemType: ReviewItemType;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule],
})
export class AdminDashboardPage implements OnInit {
  freelancers: Freelancer[] = [
    { id: 'seed-freelancer-1', name: 'Mayssa', field: 'UI/UX', status: 'Pending', itemType: 'user' },
    { id: 'seed-freelancer-2', name: 'Adam', field: 'Web Dev', status: 'Pending', itemType: 'user' },
  ];

  gigs: Gig[] = [
    { id: 'seed-gig-1', title: 'Mobile UI Design', owner: 'Mayssa', price: '150 DT', status: 'Pending', itemType: 'gig' },
    { id: 'seed-gig-2', title: 'Brand Identity', owner: 'Sara', price: '200 DT', status: 'Pending', itemType: 'gig' },
  ];

  products: StoreProduct[] = [
    { id: 'seed-product-1', title: 'Figma UI Kit', seller: 'Yacine', price: '60 DT', status: 'Pending', itemType: 'product' },
  ];

  reports: Report[] = [
    { id: 'seed-report-1', from: 'Client A', about: 'Gig #123', reason: 'Late delivery', status: 'Pending', itemType: 'report' },
  ];

  categories = ['Design', 'Web Dev', 'Video', 'Marketing'];

  commission = {
    estimated: '0 DT',
    recentUsers: 0,
    openReports: 0,
  };

  constructor(
    private readonly dashboard: DashboardService,
    private readonly auth: Auth,
    private readonly router: Router,
  ) {
    addIcons({
      briefcaseOutline,
      checkmarkOutline,
      closeOutline,
      logOutOutline,
      personOutline,
      storefrontOutline,
      warningOutline,
    });
  }

  ngOnInit(): void {
    this.dashboard.getAdminOverview().subscribe({
      next: (data: AdminDashboard) => {
        this.applyDashboard(data);
      },
    });
  }

  approve(item: Freelancer | Gig | StoreProduct | Report) {
    this.review(item, 'approved');
  }

  reject(item: Freelancer | Gig | StoreProduct | Report) {
    this.review(item, 'rejected');
  }

  get pendingFreelancersCount(): number {
    return this.freelancers.filter(item => item.status === 'Pending').length;
  }

  get pendingGigsCount(): number {
    return this.gigs.filter(item => item.status === 'Pending').length;
  }

  get pendingProductsCount(): number {
    return this.products.filter(item => item.status === 'Pending').length;
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.auth.clearSession();
        this.router.navigate(['/login']);
      },
    });
  }

  private applyDashboard(data: AdminDashboard): void {
    this.freelancers = data.pending_accounts.map((item: Record<string, unknown>) => ({
      id: String(item['id'] || ''),
      name: String(item['name'] || 'Pending account'),
      field: String(item['title'] || this.joinTags(item['specialties'])),
      status: 'Pending',
      itemType: 'user',
    }));

    this.gigs = data.pending_gigs.map((item: Record<string, unknown>) => {
      const owner = (item['owner'] || {}) as Record<string, unknown>;
      return {
        id: String(item['id'] || ''),
        title: String(item['title'] || 'Gig'),
        owner: String(owner['name'] || 'Freelancer'),
        price: this.formatMoney(Number(item['price'] || 0), String(item['currency'] || 'DT')),
        status: 'Pending',
        itemType: 'gig',
      };
    });

    this.products = data.pending_products.map((item: Record<string, unknown>) => {
      const seller = (item['seller'] || {}) as Record<string, unknown>;
      return {
        id: String(item['id'] || ''),
        title: String(item['title'] || 'Product'),
        seller: String(seller['name'] || 'Seller'),
        price: this.formatMoney(Number(item['price'] || 0), String(item['currency'] || 'DT')),
        status: 'Pending',
        itemType: 'product',
      };
    });

    this.reports = data.reports.map((item: Record<string, unknown>) => {
      const reporter = (item['reporter'] || {}) as Record<string, unknown>;
      return {
        id: String(item['id'] || ''),
        from: String(reporter['name'] || 'Reporter'),
        about: String(item['target_label'] || item['target_type'] || 'Report'),
        reason: String(item['reason'] || 'Needs review'),
        status: 'Pending',
        itemType: 'report',
      };
    });

    this.categories = [...new Set([
      ...this.gigs.map(item => item.title.split(' ')[0]),
      ...this.products.map(item => item.title.split(' ')[0]),
      'Moderation',
    ])];

    this.commission = {
      estimated: this.formatMoney(data.stats.estimated_revenue, 'DT'),
      recentUsers: data.recent_users.length,
      openReports: data.reports.length,
    };
  }

  private review(item: Freelancer | Gig | StoreProduct | Report, status: 'approved' | 'rejected'): void {
    const nextStatus: ReviewStatus = status === 'approved' ? 'Approved' : 'Rejected';

    this.dashboard.reviewItem(item.itemType, item.id, status).subscribe({
      next: () => {
        item.status = nextStatus;
        this.removeReviewedItem(item);
      },
    });
  }

  private removeReviewedItem(item: Freelancer | Gig | StoreProduct | Report): void {
    if (item.itemType === 'user') {
      this.freelancers = this.freelancers.filter(entry => entry.id !== item.id);
      return;
    }

    if (item.itemType === 'gig') {
      this.gigs = this.gigs.filter(entry => entry.id !== item.id);
      return;
    }

    if (item.itemType === 'product') {
      this.products = this.products.filter(entry => entry.id !== item.id);
      return;
    }

    this.reports = this.reports.filter(entry => entry.id !== item.id);
  }

  private formatMoney(value: number, currency: string): string {
    return `${value.toLocaleString()} ${currency}`;
  }

  private joinTags(tags: unknown): string {
    if (!Array.isArray(tags)) {
      return 'General';
    }

    return tags.length ? tags.join(' · ') : 'General';
  }
}
