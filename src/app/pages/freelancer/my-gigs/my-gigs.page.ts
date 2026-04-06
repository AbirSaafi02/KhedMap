import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, chatbubbleOutline, personOutline,
  storefrontOutline, briefcaseOutline, addOutline,
  starOutline, timeOutline, cashOutline, trashOutline,
  createOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-my-gigs',
  templateUrl: './my-gigs.page.html',
  styleUrls: ['./my-gigs.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
})
export class MyGigsPage {
  activeTab = 'gigs';

  gigs = [
    {
      title: 'I will design a modern mobile UI',
      category: 'Design',
      price: '150 DT',
      delivery: '3 days',
      rating: '4.9',
      orders: 12,
      active: true
    },
    {
      title: 'I will create a Figma prototype',
      category: 'Design',
      price: '80 DT',
      delivery: '2 days',
      rating: '4.7',
      orders: 8,
      active: true
    },
    {
      title: 'I will design your brand identity',
      category: 'Design',
      price: '200 DT',
      delivery: '5 days',
      rating: '5.0',
      orders: 5,
      active: false
    },
  ];

  constructor(private router: Router) {
    addIcons({
      homeOutline, chatbubbleOutline, personOutline,
      storefrontOutline, briefcaseOutline, addOutline,
      starOutline, timeOutline, cashOutline, trashOutline,
      createOutline
    });
  }

  goTo(page: string) {
    if (page === '/store') {
      this.router.navigate(['/store'], { queryParams: { role: 'freelancer' } });
    } else {
      this.router.navigate([page]);
    }
  }
  setTab(tab: string) { this.activeTab = tab; }

  toggleGig(gig: any) {
    gig.active = !gig.active;
  }
}
