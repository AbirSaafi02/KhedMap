import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, bookmarkOutline, locationOutline,
  timeOutline, cashOutline, personOutline
} from 'ionicons/icons';
import { JobService } from '../../../services/job.service';

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.page.html',
  styleUrls: ['./job-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonButton],
})
export class JobDetailPage {
  jobId = '';

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

  constructor(private router: Router, private route: ActivatedRoute, private jobs: JobService) {
    addIcons({
      arrowBackOutline, bookmarkOutline, locationOutline,
      timeOutline, cashOutline, personOutline
    });

    this.jobId = this.route.snapshot.paramMap.get('id') || '';
    if (this.jobId) {
      this.jobs.getJob(this.jobId).subscribe({
        next: job => {
          this.job = {
            title: job.title,
            client: job.client?.name || 'Client',
            location: 'Remote / Tunisia',
            type: job.employment_type,
            salary: `${job.budget.toLocaleString()} ${job.currency}`,
            tags: [job.category, job.employment_type, `${job.applicant_count} applicants`],
            description: job.description || 'No description provided yet.',
            requirements: [
              `Category: ${job.category}`,
              `Employment: ${job.employment_type}`,
              `Budget: ${job.budget.toLocaleString()} ${job.currency}`,
              `Applications so far: ${job.applicant_count}`,
            ],
          };
        },
      });
    }
  }

  goBack() { this.router.navigate(['/freelancer/home']); }
  applyJob() { this.router.navigate(['/freelancer/apply-job', this.jobId]); }
}
