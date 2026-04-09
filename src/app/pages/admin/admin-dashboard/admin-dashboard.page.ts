import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkOutline,
  closeOutline,
  personOutline,
  briefcaseOutline,
  storefrontOutline,
  warningOutline,
  logOutOutline,
} from 'ionicons/icons';

type ReviewStatus = 'Pending' | 'Approved' | 'Rejected';

interface Freelancer {
  name: string;
  field: string;
  status: ReviewStatus;
}

interface Gig {
  title: string;
  owner: string;
  price: string;
  status: ReviewStatus;
}

interface StoreProduct {
  title: string;
  seller: string;
  price: string;
  status: ReviewStatus;
}

interface Report {
  from: string;
  about: string;
  reason: string;
  status: ReviewStatus;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule]
})
export class AdminDashboardPage {

  freelancers: Freelancer[] = [
    { name: 'Mayssa', field: 'UI/UX', status: 'Pending' },
    { name: 'Adam', field: 'Web Dev', status: 'Pending' },
  ];

  gigs: Gig[] = [
    { title: 'Mobile UI Design', owner: 'Mayssa', price: '150 DT', status: 'Pending' },
    { title: 'Brand Identity', owner: 'Sara', price: '200 DT', status: 'Pending' },
  ];

  products: StoreProduct[] = [
    { title: 'Figma UI Kit', seller: 'Yacine', price: '60 DT', status: 'Pending' },
  ];

  reports: Report[] = [
    { from: 'Client A', about: 'Gig #123', reason: 'Late delivery', status: 'Pending' },
  ];

  categories = ['Design', 'Web Dev', 'Video', 'Marketing'];

  commission = {
    today: '480 DT',
    month: '6 200 DT',
    pendingPayouts: 12
  };

  constructor() {
    addIcons({ checkmarkOutline, closeOutline, personOutline, briefcaseOutline, storefrontOutline, warningOutline, logOutOutline });
  }

  approve(item: { status: ReviewStatus }) {
    item.status = 'Approved';
  }

  reject(item: { status: ReviewStatus }) {
    item.status = 'Rejected';
  }

  get pendingFreelancersCount(): number {
    return this.freelancers.filter(f => f.status === 'Pending').length;
  }

  get pendingGigsCount(): number {
    return this.gigs.filter(g => g.status === 'Pending').length;
  }

  get pendingProductsCount(): number {
    return this.products.filter(p => p.status === 'Pending').length;
  }

  logout() {
    localStorage.removeItem('currentRole');
    window.location.href = '/login';
  }
}
