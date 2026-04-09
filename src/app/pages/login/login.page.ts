import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, IonInput, IonItem, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eye, eyeOff } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonButton, IonInput, IonItem, IonIcon],
})
export class LoginPage {
  email = '';
  password = '';
  showPassword = false;
  selectedRole: 'freelancer' | 'client' | 'admin' = 'freelancer';

  constructor(private router: Router) {
    addIcons({ eye, eyeOff });
  }

login() {
  if (!this.email || !this.password) return;
  localStorage.setItem('currentRole', this.selectedRole);

  if (this.selectedRole === 'freelancer') {
    this.router.navigate(['/freelancer/home']);
  } else if (this.selectedRole === 'client') {
    this.router.navigate(['/client/home']);
  } else {
    this.router.navigate(['/admin/dashboard']);
  }
}
  goToRegister() { this.router.navigate(['/register']); }}
