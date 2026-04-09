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
import { JobService } from '../../../services/job.service';
import { Job } from '../../../models/job.model';

@Component({
  selector: 'app-home-freelancer',
  templateUrl: './home-freelancer.page.html',
  styleUrls: ['./home-freelancer.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
})
export class HomeFreelancerPage {
  activeTab = 'home';
  userName = 'Mayssa';
  notificationsCount = 3;
  status = { account: 'Pending', gigsPending: 2, unread: 4 };

  clients = [
    { name: 'Wail', job: 'Needs a UI/UX designer full time' },
    { name: 'Ahmed', job: 'Needs a part time video editor' },
  ];

  recommendations = [
    { name: 'Abir', bio: 'Hiring 2 graphic designers + 1 web dev for a 2-week sprint.', tags: ['Design', 'Web Dev'], budget: '1200 DT' },
    { name: 'Koussay', bio: 'Need a UI/UX designer for a SaaS onboarding flow.', tags: ['Designer'], budget: '700 DT' },
    { name: 'Faten', bio: 'Launching a brand, need marketing automation + visuals.', tags: ['Marketing'], budget: '900 DT' },
  ];

  categories = ['All', 'Design', 'Web Dev', 'Video Editor', 'Marketing'];
  activeCategory = 'All';

  jobBoard: Job[] = [];

  constructor(private router: Router, private jobs: JobService) {
    addIcons({ 
      homeOutline, chatbubbleOutline, personOutline, 
      storefrontOutline, notificationsOutline, searchOutline,
      chevronForwardOutline, briefcaseOutline
    });

    this.jobs.getJobs().subscribe(list => {
      this.jobBoard = list.filter(j => j.status !== 'closed');
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

  openJob() { this.router.navigate(['/freelancer/job-detail']); }
  openApply() { this.router.navigate(['/freelancer/apply-job']); }
  openGigComposer() { this.router.navigate(['/freelancer/add-gig']); }

  setTab(tab: string) { this.activeTab = tab; }
  setCategory(cat: string) { this.activeCategory = cat; }
}
