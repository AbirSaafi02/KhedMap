import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  homeOutline, chatbubbleOutline, personOutline,
  storefrontOutline, addCircleOutline, notificationsOutline,
  searchOutline, chevronForwardOutline, heartOutline,
  briefcaseOutline
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
  userName = 'Mustapha';

  freelancers = [
    { id: 'freelancer-1', name: 'Adam', job: 'UI/UX Designer · 2 years exp' },
    { id: 'freelancer-2', name: 'Arwa', job: 'Backend Developer' },
    { id: 'freelancer-3', name: 'Mariem', job: 'Mobile Developer' },
  ];

  recommendations = [
    { id: 'freelancer-4', name: 'Ala', title: 'UI/UX Designer', bio: 'Passionate about creating intuitive and engaging user experiences', tags: ['Design'], rating: '4.9' },
    { id: 'freelancer-5', name: 'Moataz', title: 'Translator', bio: 'Professional translator german, spanish and arabic with 3 years exp', tags: ['Translator'], rating: '4.7' },
    { id: 'freelancer-6', name: 'Sarra', title: 'Developer', bio: 'Full stack developer specialized in mobile and web apps', tags: ['Dev'], rating: '4.8' },
  ];

  categories = ['All', 'Design', 'Web Dev', 'Video Editor', 'Marketing'];
  activeCategory = 'All';

  constructor(private router: Router) {
    addIcons({ 
      homeOutline, chatbubbleOutline, personOutline,
      storefrontOutline, addCircleOutline, notificationsOutline,
      searchOutline, chevronForwardOutline, heartOutline,
      briefcaseOutline
    });
  }

  openNotifications() {
    this.router.navigate(['/notifications'], { queryParams: { role: 'client' } });
  }

  goTo(page: string) {
    if (page === '/store') {
      this.router.navigate(['/store'], { queryParams: { role: 'client' } });
    } else if (page === '/notifications') {
      this.openNotifications();
    } else {
      this.router.navigate([page]);
    }
  }
  openFreelancer(id: string) {
    this.router.navigate(['/client/freelancer', id]);
  }
  setTab(tab: string) { this.activeTab = tab; }
  setCategory(cat: string) { this.activeCategory = cat; }
}
