import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from './api';

export interface ClientDashboard {
  stats: {
    active_jobs: number;
    total_applicants: number;
    spend: number;
    unread_notifications: number;
    unread_messages: number;
    pending_applications: number;
  };
  jobs: Record<string, unknown>[];
  applications: Record<string, unknown>[];
  gigs: Record<string, unknown>[];
  products: Record<string, unknown>[];
  freelancers: Record<string, unknown>[];
  orders: Record<string, unknown>[];
  notifications: Record<string, unknown>[];
  conversations: Record<string, unknown>[];
  job_categories: string[];
  employment_types: string[];
}

export interface FreelancerDashboard {
  stats: {
    active_gigs: number;
    submitted_applications: number;
    open_orders: number;
    earnings: number;
    wallet_balance: number;
    unread_messages: number;
  };
  open_jobs: Record<string, unknown>[];
  gigs: Record<string, unknown>[];
  products: Record<string, unknown>[];
  orders: Record<string, unknown>[];
  applications: Record<string, unknown>[];
  notifications: Record<string, unknown>[];
  conversations: Record<string, unknown>[];
  gig_categories: string[];
  product_categories: string[];
  order_statuses: string[];
}

export interface AdminDashboard {
  stats: {
    pending_accounts: number;
    pending_gigs: number;
    pending_products: number;
    open_reports: number;
    estimated_revenue: number;
    wallet_balance: number;
    wallet_pending: number;
    gross_volume: number;
    active_orders: number;
  };
  pending_accounts: Record<string, unknown>[];
  pending_gigs: Record<string, unknown>[];
  pending_products: Record<string, unknown>[];
  reports: Record<string, unknown>[];
  recent_orders: Record<string, unknown>[];
  recent_users: Record<string, unknown>[];
  user_counts: Record<string, number>;
  wallet: {
    gross_volume: number;
    wallet_balance: number;
    released_balance: number;
    pending_balance: number;
    seller_payouts: number;
    orders_count: number;
    completed_orders: number;
    active_orders: number;
    refused_orders: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private readonly api: Api) {}

  getDashboard<T>(): Observable<T> {
    return this.api.get<T>('/dashboard');
  }

  getAdminOverview(): Observable<AdminDashboard> {
    return this.api.get<AdminDashboard>('/admin/overview');
  }

  reviewItem(
    itemType: 'user' | 'gig' | 'product' | 'report',
    itemId: string,
    status: 'approved' | 'rejected',
  ): Observable<Record<string, unknown>> {
    return this.api.post<Record<string, unknown>>(`/admin/review/${itemType}/${itemId}`, { status });
  }
}
