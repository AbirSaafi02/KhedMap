import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { MarketplaceService } from '../../../services/marketplace.service';

@Component({
  selector: 'app-add-gig',
  templateUrl: './add-gig.page.html',
  styleUrls: ['./add-gig.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon],
})
export class AddGigPage {
  submitted = false;
  errorMessage = '';

  gig = {
    title: '',
    description: '',
    price: '',
    delivery: '',
    inStore: true,
    allowMessaging: true,
  };

  categories = ['Design', 'Development', 'Marketing', 'Video Editing', 'Translation', 'DevOps', 'Content Writing', 'Tech & AI'];
  deliveryOptions = ['1 day', '2 days', '3 days', '5 days', '7 days', '14 days'];

  selectedCategory = '';
  selectedDelivery = '';
  attachmentNames: string[] = [];

  constructor(private router: Router, private readonly marketplace: MarketplaceService) {
    addIcons({ arrowBackOutline, checkmarkCircleOutline });
  }

  goBack() { this.router.navigate(['/freelancer/my-gigs']); }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.attachmentNames = files.map(f => f.name);
  }

  submit() {
    if (this.gig.title && this.selectedCategory && this.gig.price && this.selectedDelivery) {
      this.marketplace.createGig({
        title: this.gig.title,
        category: this.selectedCategory,
        description: this.gig.description,
        price: this.gig.price,
        delivery: this.selectedDelivery,
        in_store: this.gig.inStore,
        allow_messaging: this.gig.allowMessaging,
        currency: 'DT',
      }).subscribe({
        next: () => {
          this.errorMessage = '';
          this.submitted = true;
          setTimeout(() => {
            this.router.navigate(['/freelancer/my-gigs']);
          }, 2000);
        },
        error: () => {
          this.errorMessage = 'Unable to publish this gig right now.';
        },
      });
    }
  }
}
