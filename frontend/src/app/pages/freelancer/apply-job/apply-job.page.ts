import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, cloudUploadOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { Auth } from '../../../services/auth';
import { JobService } from '../../../services/job.service';

@Component({
  selector: 'app-apply-job',
  templateUrl: './apply-job.page.html',
  styleUrls: ['./apply-job.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonButton],
})
export class ApplyJobPage {
  jobId = '';
  name = '';
  description = '';
  cvFileName = '';
  submitted = false;
  errorMessage = '';

  constructor(private router: Router, private route: ActivatedRoute, private auth: Auth, private jobs: JobService) {
    addIcons({ arrowBackOutline, cloudUploadOutline, checkmarkCircleOutline });
    this.jobId = this.route.snapshot.paramMap.get('id') || '';
    this.name = this.auth.currentUser?.name || '';
  }

  goBack() { this.router.navigate(['/freelancer/job-detail', this.jobId]); }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.cvFileName = file.name;
    }
  }

  triggerFileInput() {
    const input = document.getElementById('cvInput') as HTMLInputElement;
    input.click();
  }

  submit() {
    if (this.name && this.jobId) {
      this.jobs.applyToJob(this.jobId, {
        full_name: this.name,
        cover_letter: this.description,
        cv_filename: this.cvFileName,
      }).subscribe({
        next: () => {
          this.errorMessage = '';
          this.submitted = true;
          setTimeout(() => {
            this.router.navigate(['/freelancer/home']);
          }, 2000);
        },
        error: () => {
          this.errorMessage = 'Unable to submit your application right now.';
        },
      });
    }
  }
}
