import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, checkmarkCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-add-gig',
  templateUrl: './add-gig.page.html',
  styleUrls: ['./add-gig.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon],
})
export class AddGigPage {
  submitted = false;

  gig = {
    title: '',
    description: '',
    price: '',
    delivery: '',
  };

  categories = ['Design', 'Development', 'Marketing', 'Video Editing', 'Translation', 'DevOps', 'Content Writing', 'Tech & AI'];
  deliveryOptions = ['1 day', '2 days', '3 days', '5 days', '7 days', '14 days'];

  selectedCategory = '';
  selectedDelivery = '';

  constructor(private router: Router) {
    addIcons({ arrowBackOutline, checkmarkCircleOutline });
  }

  goBack() { this.router.navigate(['/freelancer/my-gigs']); }

  submit() {
    if (this.gig.title && this.selectedCategory && this.gig.price && this.selectedDelivery) {
      this.submitted = true;
      setTimeout(() => {
        this.router.navigate(['/freelancer/my-gigs']);
      }, 2000);
    }
  }
}