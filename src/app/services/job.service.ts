import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from './api';

export interface ApiJob {
  id: string;
  client_id: string;
  title: string;
  category: string;
  employment_type: string;
  budget: number;
  currency: string;
  description: string;
  status: 'open' | 'interviewing' | 'closed';
  applicant_count: number;
  shortlisted_count: number;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    name: string;
    title?: string;
  };
}

export interface CreateJobPayload {
  title: string;
  category: string;
  employment_type: string;
  budget: string | number;
  description: string;
  currency?: string;
}

export interface ApplyJobPayload {
  full_name: string;
  cover_letter?: string;
  cv_filename?: string;
}

@Injectable({ providedIn: 'root' })
export class JobService {
  constructor(private readonly api: Api) {}

  listJobs(params?: { status?: string; clientId?: string }): Observable<ApiJob[]> {
    return this.api.get<ApiJob[]>('/jobs', {
      status: params?.status,
      client_id: params?.clientId,
    });
  }

  getJob(jobId: string): Observable<ApiJob> {
    return this.api.get<ApiJob>(`/jobs/${jobId}`);
  }

  createJob(payload: CreateJobPayload): Observable<ApiJob> {
    return this.api.post<ApiJob>('/jobs', payload);
  }

  applyToJob(jobId: string, payload: ApplyJobPayload): Observable<Record<string, unknown>> {
    return this.api.post<Record<string, unknown>>(`/jobs/${jobId}/apply`, payload);
  }
}
