import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, IonInput, IonItem, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eye, eyeOff } from 'ionicons/icons';

import { Auth } from '../../services/auth';

type Role = 'freelancer' | 'client' | 'admin';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonButton, IonInput, IonItem, IonIcon],
})
export class RegisterPage {
  name = '';
  phone = '';
  email = '';
  password = '';
  selectedRole: Role = 'freelancer';
  bio = '';
  resumeUrl = '';
  avatarFileName = '';
  agreed = true;
  showPassword = false;
  errorMessage = '';
  submitting = false;

  constructor(private router: Router, private auth: Auth) {
    addIcons({ eye, eyeOff });
  }

  get isFreelancer(): boolean { return this.selectedRole === 'freelancer'; }
  get isClient(): boolean { return this.selectedRole === 'client'; }
  get isAdmin(): boolean { return this.selectedRole === 'admin'; }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.avatarFileName = file ? file.name : '';
  }

  register() {
    if (!this.name || !this.email || !this.password || !this.agreed || this.submitting) {
      return;
    }

    if (this.selectedRole === 'admin') {
      this.errorMessage = 'Admin accounts are created separately. Use the seeded admin login for the demo.';
      return;
    }

    this.errorMessage = '';
    this.submitting = true;

    this.auth.register({
      name: this.name.trim(),
      email: this.email.trim(),
      password: this.password,
      role: this.selectedRole,
      phone: this.phone.trim(),
      bio: this.bio.trim(),
      resume_url: this.resumeUrl.trim(),
    }).subscribe({
      next: user => {
        this.submitting = false;

        if (user.role === 'freelancer') {
          this.router.navigate(['/field-select'], {
            queryParams: { role: user.role },
          });
          return;
        }

        this.router.navigate([this.auth.routeForRole(user.role)]);
      },
      error: error => {
        this.submitting = false;
        this.errorMessage = this.auth.errorMessage(error);
      },
    });
  }

  goToLogin() { this.router.navigate(['/login']); }
}
