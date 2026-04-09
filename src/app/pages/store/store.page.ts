import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  searchOutline, cartOutline, heartOutline,
  starOutline, homeOutline, storefrontOutline,
  chatbubbleOutline, personOutline, briefcaseOutline,
  addOutline, closeOutline, cloudUploadOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';

type Role = 'freelancer' | 'client';

@Component({
  selector: 'app-store',
  templateUrl: './store.page.html',
  styleUrls: ['./store.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon],
})
export class StorePage {
  activeTab = 'store';
  activeCategory = 'All';
  showSellModal = false;
  sellSubmitted = false;
  showBuyModal = false;
  buySubmitted = false;
  selectedProduct: any = null;

  // New product form
  newProduct = {
    title: '',
    category: 'UI Kits',
    price: '',
    description: ''
  };

  productCategories = ['UI Kits', 'Templates', 'Logos', 'Photos', 'Videos'];

  categories = ['All', 'Templates', 'UI Kits', 'Logos', 'Photos', 'Videos'];

  products = [
    { title: 'Mobile UI Kit Pro', category: 'UI Kits', price: '49 DT', rating: '4.9', sales: 120, seller: 'Mayssa' },
    { title: 'Logo Pack Premium', category: 'Logos', price: '25 DT', rating: '4.8', sales: 85, seller: 'Karim' },
    { title: 'Landing Page Template', category: 'Templates', price: '35 DT', rating: '5.0', sales: 200, seller: 'Sara' },
    { title: 'Social Media Pack', category: 'Photos', price: '20 DT', rating: '4.7', sales: 64, seller: 'Amine' },
    { title: 'Dashboard UI Kit', category: 'UI Kits', price: '60 DT', rating: '4.9', sales: 95, seller: 'Mayssa' },
    { title: 'Brand Identity Kit', category: 'Logos', price: '45 DT', rating: '4.8', sales: 42, seller: 'Yacine' },
  ];

  featured = [
    { title: 'Complete Figma UI System', price: '99 DT', seller: 'Mayssa', rating: '5.0' },
    { title: 'E-commerce Template Bundle', price: '75 DT', seller: 'Sara', rating: '4.9' },
  ];

  role: Role = 'client';

  constructor(private router: Router, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      const paramRole = params['role'] as Role | undefined;
      const storedRole = localStorage.getItem('currentRole') as Role | 'admin' | null;

      if (paramRole) {
        this.role = paramRole;
      } else if (storedRole === 'freelancer' || storedRole === 'client') {
        this.role = storedRole;
      } else {
        this.role = 'client';
      }

      localStorage.setItem('currentRole', this.role);
    });
    addIcons({
      searchOutline, cartOutline, heartOutline,
      starOutline, homeOutline, storefrontOutline,
      chatbubbleOutline, personOutline, briefcaseOutline,
      addOutline, closeOutline, cloudUploadOutline,
      checkmarkCircleOutline
    });
  }

  goTo(page: string) {
    this.router.navigate([page], { queryParams: { role: this.role } });
  }
  setTab(tab: string) { this.activeTab = tab; }
  setCategory(cat: string) { this.activeCategory = cat; }

  get filteredProducts() {
    if (this.activeCategory === 'All') return this.products;
    return this.products.filter(p => p.category === this.activeCategory);
  }

  getCommission(): string {
    if (!this.newProduct.price) return '0 DT';
    const price = parseFloat(this.newProduct.price);
    return (price * 0.15).toFixed(2) + ' DT';
  }

  getEarnings(): string {
    if (!this.newProduct.price) return '0 DT';
    const price = parseFloat(this.newProduct.price);
    return (price * 0.85).toFixed(2) + ' DT';
  }

  openBuy(product: any) {
    this.selectedProduct = product;
    this.buySubmitted = false;
    this.showBuyModal = true;
  }

  confirmBuy() {
    this.buySubmitted = true;
    setTimeout(() => {
      this.showBuyModal = false;
      this.selectedProduct = null;
      this.buySubmitted = false;
    }, 1500);
  }

  submitProduct() {
    if (this.newProduct.title && this.newProduct.price) {
      this.sellSubmitted = true;
      setTimeout(() => {
        this.showSellModal = false;
        this.sellSubmitted = false;
        this.newProduct = { title: '', category: 'UI Kits', price: '', description: '' };
      }, 2000);
    }
  }
}
