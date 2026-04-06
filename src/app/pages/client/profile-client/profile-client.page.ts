import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, chatbubbleOutline, personOutline,
  storefrontOutline, createOutline, briefcaseOutline,
  chevronForwardOutline, logOutOutline, starOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-profile-client',
  templateUrl: './profile-client.page.html',
  styleUrls: ['./profile-client.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
})
export class ProfileClientPage {
  activeTab = 'profile';

  profile = {
    name: 'Mustapha Ben Ali',
    title: 'Client · Startup Founder',
    jobs: '8',
    spent: '3200 DT',
    reviews: '12'
  };

  constructor(private router: Router) {
    addIcons({
      homeOutline, chatbubbleOutline, personOutline,
      storefrontOutline, createOutline, briefcaseOutline,
      chevronForwardOutline, logOutOutline, starOutline
    });
  }

  goTo(page: string) {
    if (page === '/store') {
      this.router.navigate(['/store'], { queryParams: { role: 'client' } });
    } else {
      this.router.navigate([page]);
    }
  }
  setTab(tab: string) { this.activeTab = tab; }

  logout() {
    this.router.navigate(['/login']);
  }
}
