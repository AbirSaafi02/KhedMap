import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, IonInput, IonItem, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eye, eyeOff } from 'ionicons/icons';

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
  showPassword = false;

  constructor(private router: Router) {
    addIcons({ eye, eyeOff });
  }

  register() {
    if (this.name && this.email && this.password) {
      this.router.navigate(['/role-select']);
    }
  }

  goToLogin() { this.router.navigate(['/login']); }
}