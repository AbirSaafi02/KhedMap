import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  briefcaseOutline,
  chatbubbleOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  personOutline,
  timeOutline,
} from 'ionicons/icons';

import { ClientDashboard, DashboardService } from '../../../services/dashboard.service';
import { JobApplication, JobService } from '../../../services/job.service';

type JobApplicationCard = {
  id: string;
  freelancerId: string;
  freelancerName: string;
  freelancerTitle: string;
  coverLetter: string;
  cvFileName: string;
  createdAt: string;
  status: string;
  specialties: string[];
};

type ClientJobCard = {
  id: string;
  title: string;
  status: 'open' | 'interviewing' | 'closed';
  posted: string;
  budget: string;
  applicants: number;
  shortlisted: number;
  notes: string;
  applications: JobApplicationCard[];
};

@Component({
  selector: 'app-posted-jobs',
  templateUrl: './posted-jobs.page.html',
  styleUrls: ['./posted-jobs.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule],
})
export class PostedJobsPage implements OnInit {
  filter: 'all' | 'open' | 'interviewing' | 'closed' = 'all';
  jobs: ClientJobCard[] = [];
  reviewingId = '';

  constructor(
    private readonly router: Router,
    private readonly jobsService: JobService,
    private readonly dashboard: DashboardService,
  ) {
    addIcons({
      arrowBackOutline,
      briefcaseOutline,
      chatbubbleOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      personOutline,
      timeOutline,
    });
  }

  ngOnInit(): void {
    this.loadJobs();
  }

  setFilter(f: typeof this.filter) {
    this.filter = f;
  }

  get filteredJobs() {
    if (this.filter === 'all') {
      return this.jobs;
    }

    return this.jobs.filter(job => job.status === this.filter);
  }

  goBack() {
    this.router.navigate(['/client/home']);
  }

  reviewApplication(job: ClientJobCard, application: JobApplicationCard, status: 'accepted' | 'rejected') {
    if (this.reviewingId === application.id) {
      return;
    }

    this.reviewingId = application.id;
    this.jobsService.reviewApplication(application.id, status).subscribe({
      next: (updated: JobApplication) => {
        this.jobs = this.jobs.map(entry => {
          if (entry.id !== job.id) {
            return entry;
          }

          const applications = entry.applications.map(item => (
            item.id === application.id ? { ...item, status: updated.status } : item
          ));

          return {
            ...entry,
            status: status === 'accepted' ? 'interviewing' : entry.status,
            shortlisted: applications.filter(item => item.status === 'accepted' || item.status === 'shortlisted').length,
            applications,
          };
        });
        this.reviewingId = '';
      },
      error: () => {
        this.reviewingId = '';
      },
    });
  }

  messageFreelancer(application: JobApplicationCard) {
    this.router.navigate(['/chat'], {
      queryParams: {
        partnerId: application.freelancerId,
        partnerName: application.freelancerName,
      },
    });
  }

  private loadJobs(): void {
    this.dashboard.getDashboard<ClientDashboard>().subscribe({
      next: data => {
        this.jobs = data.jobs.map((item: Record<string, unknown>) => {
          const applications = Array.isArray(item['applications']) ? item['applications'] as Record<string, unknown>[] : [];
          return {
            id: String(item['id'] || ''),
            title: String(item['title'] || 'Job'),
            status: String(item['status'] || 'open') as ClientJobCard['status'],
            posted: this.relativeDate(String(item['created_at'] || '')),
            budget: `${Number(item['budget'] || 0).toLocaleString()} ${String(item['currency'] || 'DT')}`,
            applicants: Number(item['applicant_count'] || applications.length),
            shortlisted: Number(item['shortlisted_count'] || 0),
            notes: String(item['description'] || 'Job posted by client'),
            applications: applications.map((application: Record<string, unknown>) => {
              const freelancer = (application['freelancer'] || {}) as Record<string, unknown>;
              const specialties = Array.isArray(freelancer['specialties']) ? freelancer['specialties'] as string[] : [];
              return {
                id: String(application['id'] || ''),
                freelancerId: String(freelancer['id'] || application['freelancer_id'] || ''),
                freelancerName: String(freelancer['name'] || application['full_name'] || 'Freelancer'),
                freelancerTitle: String(freelancer['title'] || 'Freelancer'),
                coverLetter: String(application['cover_letter'] || 'No cover letter shared.'),
                cvFileName: String(application['cv_filename'] || ''),
                createdAt: this.relativeDate(String(application['created_at'] || '')),
                status: this.normalizeApplicationStatus(String(application['status'] || 'pending')),
                specialties,
              };
            }),
          };
        });
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

  private normalizeApplicationStatus(status: string): string {
    if (status === 'shortlisted') {
      return 'accepted';
    }

    return status || 'pending';
  }
}
