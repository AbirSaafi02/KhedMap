import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { briefcaseOutline, checkmarkCircleOutline, timeOutline, closeCircleOutline, personOutline, arrowBackOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { JobService } from '../../../services/job.service';
import { Job } from '../../../models/job.model';

@Component({
  selector: 'app-posted-jobs',
  templateUrl: './posted-jobs.page.html',
  styleUrls: ['./posted-jobs.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule]
})
export class PostedJobsPage {

  filter: 'all' | 'open' | 'interviewing' | 'closed' = 'all';

  jobs: Job[] = [];

  constructor(private router: Router, private jobsService: JobService) {
    addIcons({ briefcaseOutline, checkmarkCircleOutline, timeOutline, closeCircleOutline, personOutline, arrowBackOutline });
    this.jobsService.getJobs().subscribe(list => (this.jobs = list));
  }

  setFilter(f: typeof this.filter) {
    this.filter = f;
  }

  get filteredJobs() {
    if (this.filter === 'all') return this.jobs;
    return this.jobs.filter(j => j.status === this.filter);
  }

  goBack() {
    this.router.navigate(['/client/home']);
  }
}
