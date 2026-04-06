import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, cloudUploadOutline, checkmarkCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-apply-job',
  templateUrl: './apply-job.page.html',
  styleUrls: ['./apply-job.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonButton],
})
export class ApplyJobPage {
  name = '';
  description = '';
  cvFileName = '';
  submitted = false;

  constructor(private router: Router) {
    addIcons({ arrowBackOutline, cloudUploadOutline, checkmarkCircleOutline });
  }

  goBack() { this.router.navigate(['/freelancer/job-detail']); }

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
    if (this.name) {
      this.submitted = true;
      setTimeout(() => {
        this.router.navigate(['/freelancer/home']);
      }, 2000);
    }
  }
}