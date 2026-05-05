import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { briefcase, person, shield } from 'ionicons/icons';

@Component({
  selector: 'app-role-select',
  templateUrl: './role-select.page.html',
  styleUrls: ['./role-select.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonButton, IonIcon],
})
export class RoleSelectPage {
  selectedRole: string = '';

  constructor(private router: Router) {
    addIcons({ briefcase, person, shield });
  }

  selectRole(role: string) {
    this.selectedRole = role;
  }

choose() {
    if (this.selectedRole === 'freelancer' || this.selectedRole === 'client' || this.selectedRole === 'admin') {
      this.router.navigate(['/register'], { queryParams: { role: this.selectedRole } });
    }
  }

  goToLogin() { this.router.navigate(['/login']); }
}
