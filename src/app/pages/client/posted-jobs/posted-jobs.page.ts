import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { briefcaseOutline, checkmarkCircleOutline, timeOutline, closeCircleOutline, personOutline, arrowBackOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { JobService } from '../../../services/job.service';
import { Job } from '../../../models/job.model';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-posted-jobs',
  templateUrl: './posted-jobs.page.html',
  styleUrls: ['./posted-jobs.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule]
})
export class PostedJobsPage implements OnInit {

  filter: 'all' | 'open' | 'interviewing' | 'closed' = 'all';

  jobs: Job[] = [];

  constructor(private router: Router, private jobsService: JobService, private auth: Auth) {
    addIcons({ briefcaseOutline, checkmarkCircleOutline, timeOutline, closeCircleOutline, personOutline, arrowBackOutline });
  }

  ngOnInit(): void {
    this.loadJobs(this.auth.currentUser?.id);
    if (!this.auth.currentUser) {
      this.auth.me().subscribe({
        next: user => this.loadJobs(user.id),
      });
    }
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

  private loadJobs(clientId?: string): void {
    this.jobsService.listJobs({ clientId }).subscribe({
      next: list => {
        this.jobs = list.map(item => ({
          id: item.id,
          title: item.title,
          status: item.status,
          posted: this.relativeDate(item.created_at),
          budget: `${item.budget.toLocaleString()} ${item.currency}`,
          applicants: item.applicant_count,
          shortlisted: item.shortlisted_count,
          notes: item.description || 'Job posted by client',
        }));
      },
    });
  }

  private relativeDate(value: string): string {
    const createdAt = new Date(value);
    const diffMs = Date.now() - createdAt.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  }
}
