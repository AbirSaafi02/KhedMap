export type JobStatus = 'open' | 'interviewing' | 'closed';

export interface Job {
  id: string;
  title: string;
  status: JobStatus;
  posted: string;
  budget: string;
  applicants: number;
  shortlisted: number;
  notes: string;
}
