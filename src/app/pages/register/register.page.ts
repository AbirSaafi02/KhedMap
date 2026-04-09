import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, IonInput, IonItem, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eye, eyeOff } from 'ionicons/icons';

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

  constructor(private router: Router) {
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
    if (!this.name || !this.email || !this.password || !this.agreed) return;

    localStorage.setItem('currentRole', this.selectedRole);

    if (this.selectedRole === 'freelancer') {
      this.router.navigate(['/field-select']);
    } else if (this.selectedRole === 'client') {
      this.router.navigate(['/client/home']);
    } else {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  goToLogin() { this.router.navigate(['/login']); }
}
