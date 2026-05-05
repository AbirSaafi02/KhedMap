import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from './api';

export type OrderStatus = 'Pending' | 'In Progress' | 'Completed' | 'Refused';

export interface MarketplaceUser {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
  specialties?: string[];
  resume_url?: string;
  avatar_url?: string;
}

export interface MarketplaceGig {
  id: string;
  freelancer_id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  delivery: string;
  status: string;
  rating: number;
  order_count: number;
  in_store: boolean;
  allow_messaging: boolean;
  created_at: string;
  updated_at: string;
  owner?: MarketplaceUser;
}

export interface MarketplaceProduct {
  id: string;
  seller_id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  status: string;
  rating: number;
  sales_count: number;
  created_at: string;
  updated_at: string;
  seller?: MarketplaceUser;
}

export interface MarketplaceOrder {
  id: string;
  source_type: 'gig' | 'product';
  source_id: string;
  title: string;
  client_id: string;
  seller_id: string;
  message: string;
  price: number;
  currency: string;
  delivery: string;
  status: OrderStatus;
  platform_fee_rate: number;
  platform_fee: number;
  seller_earnings: number;
  created_at: string;
  updated_at: string;
}

export interface CreateGigPayload {
  title: string;
  category: string;
  description: string;
  price: string | number;
  delivery: string;
  in_store?: boolean;
  allow_messaging?: boolean;
  currency?: string;
}

export interface CreateProductPayload {
  title: string;
  category: string;
  description: string;
  price: string | number;
  currency?: string;
}

@Injectable({ providedIn: 'root' })
export class MarketplaceService {
  constructor(private readonly api: Api) {}

  listFreelancers(): Observable<MarketplaceUser[]> {
    return this.api.get<MarketplaceUser[]>('/freelancers');
  }

  getFreelancer(id: string): Observable<MarketplaceUser> {
    return this.api.get<MarketplaceUser>(`/freelancers/${id}`);
  }

  listGigs(params?: { status?: string; freelancerId?: string }): Observable<MarketplaceGig[]> {
    return this.api.get<MarketplaceGig[]>('/gigs', {
      status: params?.status,
      freelancer_id: params?.freelancerId,
    });
  }

  getGig(id: string): Observable<MarketplaceGig> {
    return this.api.get<MarketplaceGig>(`/gigs/${id}`);
  }

  createGig(payload: CreateGigPayload): Observable<MarketplaceGig> {
    return this.api.post<MarketplaceGig>('/gigs', payload);
  }

  orderGig(gigId: string, message: string): Observable<MarketplaceOrder> {
    return this.api.post<MarketplaceOrder>(`/gigs/${gigId}/order`, { message });
  }

  listProducts(params?: { status?: string; sellerId?: string }): Observable<MarketplaceProduct[]> {
    return this.api.get<MarketplaceProduct[]>('/products', {
      status: params?.status,
      seller_id: params?.sellerId,
    });
  }

  getProduct(id: string): Observable<MarketplaceProduct> {
    return this.api.get<MarketplaceProduct>(`/products/${id}`);
  }

  createProduct(payload: CreateProductPayload): Observable<MarketplaceProduct> {
    return this.api.post<MarketplaceProduct>('/products', payload);
  }

  buyProduct(productId: string): Observable<MarketplaceOrder> {
    return this.api.post<MarketplaceOrder>(`/products/${productId}/buy`);
  }

  listOrders(): Observable<MarketplaceOrder[]> {
    return this.api.get<MarketplaceOrder[]>('/orders');
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<MarketplaceOrder> {
    return this.api.patch<MarketplaceOrder>(`/orders/${orderId}`, { status });
  }
}
