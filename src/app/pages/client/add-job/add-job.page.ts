import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { JobService } from '../../../services/job.service';

@Component({
  selector: 'app-add-job',
  templateUrl: './add-job.page.html',
  styleUrls: ['./add-job.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon],
})
export class AddJobPage {
  submitted = false;
  errorMessage = '';

  job = {
    title: '',
    type: '',
    employment: '',
    salary: '',
    tag: '',
    bio: ''
  };

  employmentTypes = ['Full Time', 'Part Time', 'Freelance', 'Internship'];
  jobTypes = ['Design', 'Development', 'Marketing', 'Video Editing', 'Translation', 'DevOps'];

  selectedEmployment = '';
  selectedType = '';

  constructor(private router: Router, private jobs: JobService) {
    addIcons({ arrowBackOutline, checkmarkCircleOutline });
  }

  goBack() { this.router.navigate(['/client/home']); }

  submit() {
    if (this.job.title && this.selectedType && this.selectedEmployment) {
      this.jobs.createJob({
        title: this.job.title,
        category: this.selectedType,
        employment_type: this.selectedEmployment,
        budget: this.job.salary || 0,
        description: this.job.bio || 'New job posted by client',
        currency: 'DT',
      }).subscribe({
        next: () => {
          this.errorMessage = '';
          this.submitted = true;
          setTimeout(() => {
            this.router.navigate(['/client/home']);
          }, 2000);
        },
        error: () => {
          this.errorMessage = 'Unable to publish this job right now.';
        },
      });
    }
  }
}
