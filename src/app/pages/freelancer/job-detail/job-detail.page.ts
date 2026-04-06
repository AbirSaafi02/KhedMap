import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, bookmarkOutline, locationOutline,
  timeOutline, cashOutline, personOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.page.html',
  styleUrls: ['./job-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonButton],
})
export class JobDetailPage {

  job = {
    title: 'UI/UX Designer Needed',
    client: 'Mustapha',
    location: 'Tunis, Tunisia',
    type: 'Full Time',
    salary: '1500 DT / month',
    tags: ['Design', 'Figma', 'Mobile'],
    description: 'We are looking for a talented UI/UX designer to join our team. You will be responsible for creating intuitive and engaging user interfaces for our mobile and web applications. The ideal candidate has strong visual design skills and experience with Figma.',
    requirements: [
      'At least 2 years of experience in UI/UX design',
      'Proficiency in Figma or Adobe XD',
      'Strong portfolio of design projects',
      'Good communication skills',
    ]
  };

  constructor(private router: Router) {
    addIcons({
      arrowBackOutline, bookmarkOutline, locationOutline,
      timeOutline, cashOutline, personOutline
    });
  }

  goBack() { this.router.navigate(['/freelancer/home']); }
  applyJob() { this.router.navigate(['/freelancer/apply-job']); }
}