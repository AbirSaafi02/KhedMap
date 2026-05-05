import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  briefcaseOutline,
  cashOutline,
  checkmarkOutline,
  closeOutline,
  logOutOutline,
  personOutline,
  storefrontOutline,
  warningOutline,
} from 'ionicons/icons';

import { Auth } from '../../../services/auth';
import { AdminDashboard, DashboardService } from '../../../services/dashboard.service';

type ReviewItemType = 'user' | 'gig' | 'product' | 'report';

interface PendingAccount {
  id: string;
  name: string;
  role: string;
  details: string;
  itemType: ReviewItemType;
}

interface GigReview {
  id: string;
  title: string;
  owner: string;
  price: string;
  itemType: ReviewItemType;
}

interface StoreProduct {
  id: string;
  title: string;
  seller: string;
  price: string;
  itemType: ReviewItemType;
}

interface ReportReview {
  id: string;
  from: string;
  about: string;
  reason: string;
  itemType: ReviewItemType;
}

interface RecentOrder {
  id: string;
  title: string;
  client: string;
  seller: string;
  gross: string;
  fee: string;
  payout: string;
  status: string;
}

interface RecentUser {
  id: string;
  name: string;
  role: string;
  title: string;
  status: string;
}

interface WalletSummary {
  balance: string;
  released: string;
  pending: string;
  gross: string;
  payouts: string;
  ordersCount: number;
  activeOrders: number;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule],
})
export class AdminDashboardPage implements OnInit {
  pendingAccounts: PendingAccount[] = [];
  gigs: GigReview[] = [];
  products: StoreProduct[] = [];
  reports: ReportReview[] = [];
  recentOrders: RecentOrder[] = [];
  recentUsers: RecentUser[] = [];
  userMix: Array<{ label: string; count: number }> = [];
  wallet: WalletSummary = {
    balance: '0 DT',
    released: '0 DT',
    pending: '0 DT',
    gross: '0 DT',
    payouts: '0 DT',
    ordersCount: 0,
    activeOrders: 0,
  };
  errorMessage = '';

  constructor(
    private readonly dashboard: DashboardService,
    private readonly auth: Auth,
    private readonly router: Router,
  ) {
    addIcons({
      briefcaseOutline,
      cashOutline,
      checkmarkOutline,
      closeOutline,
      logOutOutline,
      personOutline,
      storefrontOutline,
      warningOutline,
    });
  }

  ngOnInit(): void {
    this.loadOverview();
  }

  get pendingAccountsCount(): number {
    return this.pendingAccounts.length;
  }

  get pendingGigsCount(): number {
    return this.gigs.length;
  }

  get pendingProductsCount(): number {
    return this.products.length;
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

  approve(item: PendingAccount | GigReview | StoreProduct | ReportReview) {
    this.review(item, 'approved');
  }

  reject(item: PendingAccount | GigReview | StoreProduct | ReportReview) {
    this.review(item, 'rejected');
  }

  private applyDashboard(data: AdminDashboard): void {
    this.errorMessage = '';
    this.pendingAccounts = data.pending_accounts.map((item: Record<string, unknown>) => ({
      id: String(item['id'] || ''),
      name: String(item['name'] || 'Pending account'),
      role: this.formatRole(String(item['role'] || 'freelancer')),
      details: String(item['title'] || this.joinTags(item['specialties'])),
      itemType: 'user',
    }));

    this.gigs = data.pending_gigs.map((item: Record<string, unknown>) => {
      const owner = (item['owner'] || {}) as Record<string, unknown>;
      return {
        id: String(item['id'] || ''),
        title: String(item['title'] || 'Gig'),
        owner: String(owner['name'] || 'Freelancer'),
        price: this.formatMoney(Number(item['price'] || 0), String(item['currency'] || 'DT')),
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
        itemType: 'report',
      };
    });

    this.recentOrders = data.recent_orders.map((item: Record<string, unknown>) => {
      const client = (item['client'] || {}) as Record<string, unknown>;
      const seller = (item['seller'] || {}) as Record<string, unknown>;
      return {
        id: String(item['id'] || ''),
        title: String(item['title'] || 'Order'),
        client: String(client['name'] || 'Client'),
        seller: String(seller['name'] || 'Seller'),
        gross: this.formatMoney(Number(item['price'] || 0), String(item['currency'] || 'DT')),
        fee: this.formatMoney(Number(item['platform_fee'] || 0), String(item['currency'] || 'DT')),
        payout: this.formatMoney(Number(item['seller_earnings'] || 0), String(item['currency'] || 'DT')),
        status: String(item['status'] || 'Pending'),
      };
    });

    this.recentUsers = data.recent_users.map((item: Record<string, unknown>) => ({
      id: String(item['id'] || ''),
      name: String(item['name'] || 'User'),
      role: this.formatRole(String(item['role'] || 'user')),
      title: String(item['title'] || 'KhedMap member'),
      status: String(item['status'] || 'pending'),
    }));

    this.userMix = Object.entries(data.user_counts || {}).map(([label, count]) => ({
      label: this.formatRole(label),
      count,
    }));

    this.wallet = {
      balance: this.formatMoney(data.wallet.wallet_balance, 'DT'),
      released: this.formatMoney(data.wallet.released_balance, 'DT'),
      pending: this.formatMoney(data.wallet.pending_balance, 'DT'),
      gross: this.formatMoney(data.wallet.gross_volume, 'DT'),
      payouts: this.formatMoney(data.wallet.seller_payouts, 'DT'),
      ordersCount: data.wallet.orders_count,
      activeOrders: data.wallet.active_orders,
    };
  }

  private review(item: PendingAccount | GigReview | StoreProduct | ReportReview, status: 'approved' | 'rejected'): void {
    this.dashboard.reviewItem(item.itemType, item.id, status).subscribe({
      next: () => {
        this.removeReviewedItem(item);
      },
    });
  }

  private removeReviewedItem(item: PendingAccount | GigReview | StoreProduct | ReportReview): void {
    if (item.itemType === 'user') {
      this.pendingAccounts = this.pendingAccounts.filter(entry => entry.id !== item.id);
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

    return tags.length ? tags.join(' / ') : 'General';
  }

  private formatRole(role: string): string {
    return role ? `${role.charAt(0).toUpperCase()}${role.slice(1)}` : 'User';
  }

  private loadOverview(useFallback = false): void {
    const request = useFallback
      ? this.dashboard.getDashboard<AdminDashboard>()
      : this.dashboard.getAdminOverview();

    request.subscribe({
      next: (data: AdminDashboard) => {
        this.applyDashboard(data);
      },
      error: error => {
        this.handleOverviewError(error, useFallback);
      },
    });
  }

  private handleOverviewError(error: unknown, usedFallback: boolean): void {
    if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)) {
      this.auth.clearSession();
      this.router.navigate(['/login']);
      return;
    }

    if (!usedFallback) {
      this.loadOverview(true);
      return;
    }

    this.errorMessage = 'Admin dashboard data could not be loaded right now. Please refresh and try again.';
  }
}
