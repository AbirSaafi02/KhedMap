import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, chatbubbleOutline, personOutline,
  storefrontOutline, briefcaseOutline, searchOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-messages-freelancer',
  templateUrl: './messages-freelancer.page.html',
  styleUrls: ['./messages-freelancer.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
})
export class MessagesFreelancerPage {
  activeTab = 'messages';

  conversations = [
    { name: 'Koussay', last: 'I just sent your money thank you', time: '2m', unread: true },
    { name: 'Rachid', last: 'Can you send the files please?', time: '15m', unread: true },
    { name: 'Rania', last: 'The project looks amazing!', time: '1h', unread: false },
    { name: 'Mounir', last: 'When can you start?', time: '2h', unread: false },
    { name: 'Salma', last: 'Thank you for your work!', time: '3h', unread: false },
    { name: 'Yacine', last: 'I will review it tomorrow', time: '5h', unread: false },
  ];

  constructor(private router: Router) {
    addIcons({
      homeOutline, chatbubbleOutline, personOutline,
      storefrontOutline, briefcaseOutline, searchOutline
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
}
