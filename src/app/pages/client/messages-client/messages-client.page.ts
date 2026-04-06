import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, chatbubbleOutline, personOutline,
  storefrontOutline, searchOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-messages-client',
  templateUrl: './messages-client.page.html',
  styleUrls: ['./messages-client.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
})
export class MessagesClientPage {
  activeTab = 'messages';

  conversations = [
    { name: 'Sahil', last: 'I just sent your money thank you', time: '2m', unread: true },
    { name: 'Rachid', last: 'I finished the design, please check', time: '15m', unread: true },
    { name: 'Rania', last: 'The project looks amazing!', time: '1h', unread: false },
    { name: 'Mounir', last: 'When do you need it done?', time: '2h', unread: false },
    { name: 'Salma', last: 'Thank you for the opportunity!', time: '3h', unread: false },
    { name: 'Yacine', last: 'I will send the files tomorrow', time: '5h', unread: false },
  ];

  constructor(private router: Router) {
    addIcons({
      homeOutline, chatbubbleOutline, personOutline,
      storefrontOutline, searchOutline
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
}
