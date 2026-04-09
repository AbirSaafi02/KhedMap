import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, chatbubbleOutline, personOutline,
  storefrontOutline, briefcaseOutline, createOutline,
  starOutline, chevronForwardOutline, logOutOutline, notificationsOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-profile-freelancer',
  templateUrl: './profile-freelancer.page.html',
  styleUrls: ['./profile-freelancer.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
})
export class ProfileFreelancerPage {
  activeTab = 'profile';

  profile = {
    name: 'Mayssa Sayah',
    title: 'UI/UX Designer',
    bio: 'Passionate UI/UX designer with 3 years of experience creating intuitive and engaging digital experiences. Specialized in mobile and web design.',
    rating: '4.9',
    jobs: '23',
    reviews: '18',
    status: 'Pending admin review',
    fields: ['Design', 'Product', 'Motion'],
    cvUrl: 'cv-mayssa.pdf',
    email: 'mayssa@khedmap.tn'
  };

  verifications = [
    { label: 'Identity check', status: 'Pending', action: 'Upload ID' },
    { label: 'Portfolio link', status: 'Submitted', action: 'Edit' },
    { label: 'Store seller mode', status: 'Enabled', action: 'View guidelines' },
  ];

  constructor(private router: Router) {
    addIcons({
      homeOutline, chatbubbleOutline, personOutline,
      storefrontOutline, briefcaseOutline, createOutline,
      starOutline, chevronForwardOutline, logOutOutline, notificationsOutline
    });
  }

  openNotifications() {
    this.router.navigate(['/notifications'], { queryParams: { role: 'freelancer' } });
  }

  goTo(page: string) {
    if (page === '/store') {
      this.router.navigate(['/store'], { queryParams: { role: 'freelancer' } });
    } else if (page === '/notifications') {
      this.openNotifications();
    } else {
      this.router.navigate([page]);
    }
  }
  setTab(tab: string) { this.activeTab = tab; }

  logout() {
    this.router.navigate(['/login']);
  }
}
