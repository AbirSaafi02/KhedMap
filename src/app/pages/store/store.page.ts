import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  arrowBackOutline,
  briefcaseOutline,
  cartOutline,
  chatbubbleOutline,
  checkmarkCircleOutline,
  closeOutline,
  cloudUploadOutline,
  heartOutline,
  homeOutline,
  personOutline,
  searchOutline,
  starOutline,
  storefrontOutline,
} from 'ionicons/icons';

import { Auth } from '../../services/auth';
import { DashboardService } from '../../services/dashboard.service';
import { MarketplaceProduct, MarketplaceService } from '../../services/marketplace.service';

type Role = 'freelancer' | 'client';

type ProductCard = {
  id: string;
  title: string;
  category: string;
  amount: number;
  currency: string;
  price: string;
  rating: string;
  sales: number;
  seller: string;
};

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
  searchTerm = '';
  showSellModal = false;
  sellSubmitted = false;
  showBuyModal = false;
  buySubmitted = false;
  selectedProduct: ProductCard | null = null;
  cartCount = 0;
  unreadMessagesCount = 0;

  newProduct = {
    title: '',
    category: 'UI Kits',
    price: '',
    description: '',
  };

  productCategories = ['UI Kits', 'Templates', 'Logos', 'Photos', 'Videos'];
  categories = ['All'];
  products: ProductCard[] = [];
  featured: ProductCard[] = [];
  role: Role = 'client';

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly auth: Auth,
    private readonly dashboard: DashboardService,
    private readonly marketplace: MarketplaceService,
  ) {
    this.route.queryParams.subscribe(params => {
      const paramRole = params['role'] as Role | undefined;
      const currentRole = this.auth.currentUser?.role;
      const storedRole = localStorage.getItem('currentRole') as Role | 'admin' | null;

      if (paramRole) {
        this.role = paramRole;
      } else if (currentRole === 'freelancer' || currentRole === 'client') {
        this.role = currentRole;
      } else if (storedRole === 'freelancer' || storedRole === 'client') {
        this.role = storedRole;
      } else {
        this.role = 'client';
      }

      localStorage.setItem('currentRole', this.role);
      this.loadUnreadMessages();
    });

    addIcons({
      addOutline,
      arrowBackOutline,
      briefcaseOutline,
      cartOutline,
      chatbubbleOutline,
      checkmarkCircleOutline,
      closeOutline,
      cloudUploadOutline,
      heartOutline,
      homeOutline,
      personOutline,
      searchOutline,
      starOutline,
      storefrontOutline,
    });

    this.loadProducts();
    this.marketplace.listOrders().subscribe({
      next: orders => {
        this.cartCount = orders.length;
      },
    });
  }

  goTo(page: string) {
    this.router.navigate([page], { queryParams: { role: this.role } });
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  setCategory(cat: string) {
    this.activeCategory = cat;
  }

  get filteredProducts() {
    return this.products.filter(product => {
      const categoryMatches = this.activeCategory === 'All' || product.category === this.activeCategory;
      const searchMatches = !this.searchTerm.trim()
        || `${product.title} ${product.seller}`.toLowerCase().includes(this.searchTerm.trim().toLowerCase());
      return categoryMatches && searchMatches;
    });
  }

  getCommission(): string {
    if (!this.newProduct.price) return '0 DT';
    const price = parseFloat(this.newProduct.price);
    return `${(price * 0.15).toFixed(2)} DT`;
  }

  getEarnings(): string {
    if (!this.newProduct.price) return '0 DT';
    const price = parseFloat(this.newProduct.price);
    return `${(price * 0.85).toFixed(2)} DT`;
  }

  openBuy(product: ProductCard) {
    this.selectedProduct = product;
    this.buySubmitted = false;
    this.showBuyModal = true;
  }

  confirmBuy() {
    if (!this.selectedProduct) {
      return;
    }
    this.marketplace.buyProduct(this.selectedProduct.id).subscribe({
      next: () => {
        this.buySubmitted = true;
        this.cartCount += 1;
        setTimeout(() => {
          this.showBuyModal = false;
          this.selectedProduct = null;
          this.buySubmitted = false;
          this.loadProducts();
        }, 1500);
      },
    });
  }

  goBack() {
    this.router.navigate([this.role === 'freelancer' ? '/freelancer/home' : '/client/home']);
  }

  submitProduct() {
    if (this.newProduct.title && this.newProduct.price) {
      this.marketplace.createProduct({
        title: this.newProduct.title,
        category: this.newProduct.category,
        price: this.newProduct.price,
        description: this.newProduct.description,
        currency: 'DT',
      }).subscribe({
        next: () => {
          this.sellSubmitted = true;
          setTimeout(() => {
            this.showSellModal = false;
            this.sellSubmitted = false;
            this.newProduct = { title: '', category: 'UI Kits', price: '', description: '' };
            this.loadProducts();
          }, 2000);
        },
      });
    }
  }

  private loadProducts(): void {
    this.marketplace.listProducts({ status: 'approved' }).subscribe({
      next: products => {
        this.products = products.map((product: MarketplaceProduct) => ({
          id: product.id,
          title: product.title,
          category: product.category,
          amount: product.price,
          currency: product.currency,
          price: `${product.price.toLocaleString()} ${product.currency}`,
          rating: product.rating ? product.rating.toFixed(1) : 'New',
          sales: product.sales_count,
          seller: product.seller?.name || 'Seller',
        }));
        this.featured = [...this.products]
          .sort((left, right) => right.sales - left.sales)
          .slice(0, 3);
        this.categories = ['All', ...new Set(this.products.map(product => product.category))];
      },
    });
  }

  get selectedServiceFee(): string {
    if (!this.selectedProduct) {
      return '0 DT';
    }

    return `${(this.selectedProduct.amount * 0.15).toFixed(2)} ${this.selectedProduct.currency}`;
  }

  get selectedTotal(): string {
    if (!this.selectedProduct) {
      return '0 DT';
    }

    return `${(this.selectedProduct.amount * 1.15).toFixed(2)} ${this.selectedProduct.currency}`;
  }

  private loadUnreadMessages(): void {
    this.dashboard.getDashboard<{ stats?: { unread_messages?: number } }>().subscribe({
      next: data => {
        this.unreadMessagesCount = Number(data?.stats?.unread_messages || 0);
      },
      error: () => {
        this.unreadMessagesCount = 0;
      },
    });
  }
}
