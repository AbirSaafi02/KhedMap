import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Job, JobStatus } from '../models/job.model';

@Injectable({ providedIn: 'root' })
export class JobService {
  private readonly jobs$ = new BehaviorSubject<Job[]>([
    {
      id: 'job-101',
      title: 'Fintech landing redesign',
      status: 'open',
      posted: 'Today',
      budget: '1 200 DT',
      applicants: 8,
      shortlisted: 3,
      notes: 'Need polished hero + pricing, ship in 5 days',
    },
    {
      id: 'job-102',
      title: 'Mobile onboarding screens',
      status: 'interviewing',
      posted: 'Yesterday',
      budget: '750 DT',
      applicants: 12,
      shortlisted: 4,
      notes: '3 screens + motion handoff',
    },
    {
      id: 'job-099',
      title: 'Brand identity refresh',
      status: 'closed',
      posted: '2 days ago',
      budget: '2 000 DT',
      applicants: 15,
      shortlisted: 5,
      notes: 'Closed – picked a freelancer',
    },
  ]);

  getJobs(): Observable<Job[]> {
    return this.jobs$.asObservable();
  }

  getOpenJobs(): Observable<Job[]> {
    return this.jobs$.asObservable();
  }

  addJob(job: Job) {
    const current = this.jobs$.getValue();
    this.jobs$.next([job, ...current]);
  }

  updateStatus(id: string, status: JobStatus) {
    const next = this.jobs$.getValue().map(j => (j.id === id ? { ...j, status } : j));
    this.jobs$.next(next);
  }
}
