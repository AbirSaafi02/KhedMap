import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-field-select',
  templateUrl: './field-select.page.html',
  styleUrls: ['./field-select.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonButton],
})
export class FieldSelectPage {
  fields = [
    'Development', 'Design', 'Marketing', 'Engineering',
    'DevOps', 'Content Writing', 'Tech & AI', 'Video Editing'
  ];

  selectedFields: string[] = [];
  role: string = 'freelancer';

  constructor(private router: Router, private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      this.role = params['role'] || 'freelancer';
    });
  }

  toggleField(field: string) {
    if (this.selectedFields.includes(field)) {
      this.selectedFields = this.selectedFields.filter(f => f !== field);
    } else {
      this.selectedFields.push(field);
    }
  }

  isSelected(field: string): boolean {
    return this.selectedFields.includes(field);
  }

  choose() {
    if (this.selectedFields.length > 0) {
      if (this.role === 'client') {
        this.router.navigate(['/client/home']);
      } else {
        this.router.navigate(['/freelancer/home']);
      }
    }
  }

  goToLogin() { this.router.navigate(['/login']); }
}
