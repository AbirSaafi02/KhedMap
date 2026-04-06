import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  homeOutline, chatbubbleOutline, personOutline, 
  storefrontOutline, notificationsOutline, searchOutline,
  chevronForwardOutline, briefcaseOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-home-freelancer',
  templateUrl: './home-freelancer.page.html',
  styleUrls: ['./home-freelancer.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
})
export class HomeFreelancerPage {
  activeTab = 'home';

  clients = [
    { name: 'Wail', job: 'Needs a UI/UX designer full time' },
    { name: 'Ahmed', job: 'Needs a part time video editor' },
  ];

  recommendations = [
    { name: 'Abir', bio: 'I need 2 graphic designers and a web developer', tags: ['Design', 'Web Dev'] },
    { name: 'Koussay', bio: 'I need a UI/UX designer', tags: ['Designer'] },
    { name: 'Faten', bio: 'I am a business owner looking for marketing assistance', tags: ['Marketing'] },
  ];

  categories = ['All', 'Design', 'Web Dev', 'Video Editor', 'Marketing'];
  activeCategory = 'All';

  constructor(private router: Router) {
    addIcons({ 
      homeOutline, chatbubbleOutline, personOutline, 
      storefrontOutline, notificationsOutline, searchOutline,
      chevronForwardOutline, briefcaseOutline
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
  setCategory(cat: string) { this.activeCategory = cat; }
}
