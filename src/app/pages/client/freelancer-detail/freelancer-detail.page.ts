import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon, IonToast } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { starOutline, briefcaseOutline, chatbubbleOutline, arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-freelancer-detail',
  templateUrl: './freelancer-detail.page.html',
  styleUrls: ['./freelancer-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonToast],
})
export class FreelancerDetailPage {
  clientName = 'Mustapha';
  freelancer = {
    id: '',
    name: 'Freelancer',
    title: 'UI/UX Designer',
    rating: '4.9',
    jobs: 23,
    bio: 'Designer passionne par les interfaces mobiles et web. Specialiste des maquettes claires, prototypes interactifs et handoffs propres.',
    tags: ['Design', 'Figma', 'Prototype'],
  };
  highlights: string[] = [
    'Mobile-first UI, web dashboards, and design systems',
    'Figma files structured for easy handoff to developers',
    'Supports briefs, wireframes, UI, prototype, and QA passes',
  ];
  showToast = false;
  toastMessage = '';

  constructor(private route: ActivatedRoute, private router: Router) {
    addIcons({ starOutline, briefcaseOutline, chatbubbleOutline, arrowBackOutline });
    const id = this.route.snapshot.paramMap.get('id') || 'freelancer-1';
    this.freelancer = {
      ...this.freelancer,
      id,
      name: 'Mayssa',
      title: 'UI/UX Designer',
      bio: '3 years experience, focused on mobile flows and product onboarding. Delivers clean Figma files and clickable prototypes.',
    };
  }

  goBack() {
    this.router.navigate(['/client/home']);
  }

  contact() {
    this.router.navigate(['/chat'], { queryParams: { with: this.freelancer.name } });
  }

  hire() {
    this.toastMessage = 'Demande envoyée';
    this.showToast = true;
  }
}
