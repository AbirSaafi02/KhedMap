import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type OrderStatus = 'Pending' | 'In Progress' | 'Completed' | 'Refused';

export interface Order {
  id: string;
  gigId: string;
  client: string;
  message: string;
  price: string;
  delivery: string;
  status: OrderStatus;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private orders$ = new BehaviorSubject<Order[]>([
    { id: 'ord-1', gigId: 'gig-1', client: 'Adam', message: 'Need a fintech app redesign', price: '150 DT', delivery: '3 days', status: 'Pending' },
    { id: 'ord-2', gigId: 'gig-1', client: 'Sara', message: 'Add onboarding screens', price: '80 DT', delivery: '2 days', status: 'In Progress' },
    { id: 'ord-3', gigId: 'gig-2', client: 'Marwen', message: 'Prototype for landing page', price: '80 DT', delivery: '2 days', status: 'Completed' },
  ]);

  getOrders(): Observable<Order[]> {
    return this.orders$.asObservable();
  }

  addOrder(order: Omit<Order, 'id'>) {
    const id = `ord-${Date.now()}`;
    this.orders$.next([...this.orders$.value, { ...order, id }]);
  }

  updateStatus(orderId: string, status: OrderStatus) {
    this.orders$.next(
      this.orders$.value.map(o => o.id === orderId ? { ...o, status } : o)
    );
  }
}
