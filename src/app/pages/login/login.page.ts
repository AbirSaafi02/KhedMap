import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, IonInput, IonItem, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eye, eyeOff } from 'ionicons/icons';

import { Auth } from '../../services/auth';

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
  errorMessage = '';
  infoMessage = '';
  submitting = false;

  constructor(private router: Router, private auth: Auth, private route: ActivatedRoute) {
    addIcons({ eye, eyeOff });

    this.route.queryParamMap.subscribe(params => {
      if (params.get('pending') !== '1') {
        this.infoMessage = '';
        return;
      }

      const role = this.formatRole(params.get('role') || 'account');
      this.infoMessage = `Your ${role} account was created and is waiting for admin approval.`;
    });
  }

  login() {
    if (!this.email || !this.password || this.submitting) {
      return;
    }

    this.errorMessage = '';
    this.submitting = true;

    this.auth.login({
      email: this.email.trim(),
      password: this.password,
    }).subscribe({
      next: user => {
        this.submitting = false;
        this.router.navigate([this.auth.routeForRole(user.role)]);
      },
      error: error => {
        this.submitting = false;
        this.errorMessage = this.auth.errorMessage(error);
      },
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  private formatRole(role: string): string {
    return role ? `${role.charAt(0).toUpperCase()}${role.slice(1)}` : 'Account';
  }
}
