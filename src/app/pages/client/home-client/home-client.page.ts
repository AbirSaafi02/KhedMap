import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  homeOutline, chatbubbleOutline, personOutline,
  storefrontOutline, addCircleOutline, notificationsOutline,
  searchOutline, chevronForwardOutline, heartOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-home-client',
  templateUrl: './home-client.page.html',
  styleUrls: ['./home-client.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
})
export class HomeClientPage {
  activeTab = 'home';

  freelancers = [
    { name: 'Adam', job: 'UI/UX Designer · 2 years exp' },
    { name: 'Arwa', job: 'Backend Developer' },
    { name: 'Mariem', job: 'Mobile Developer' },
  ];

  recommendations = [
    { name: 'Ala', title: 'UI/UX Designer', bio: 'Passionate about creating intuitive and engaging user experiences', tags: ['Design'], rating: '4.9' },
    { name: 'Moataz', title: 'Translator', bio: 'Professional translator german, spanish and arabic with 3 years exp', tags: ['Translator'], rating: '4.7' },
    { name: 'Sarra', title: 'Developer', bio: 'Full stack developer specialized in mobile and web apps', tags: ['Dev'], rating: '4.8' },
  ];

  categories = ['All', 'Design', 'Web Dev', 'Video Editor', 'Marketing'];
  activeCategory = 'All';

  constructor(private router: Router) {
    addIcons({ 
      homeOutline, chatbubbleOutline, personOutline,
      storefrontOutline, addCircleOutline, notificationsOutline,
      searchOutline, chevronForwardOutline, heartOutline
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
  setCategory(cat: string) { this.activeCategory = cat; }
}
