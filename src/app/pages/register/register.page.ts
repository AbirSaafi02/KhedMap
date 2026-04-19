import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, IonInput, IonItem, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eye, eyeOff } from 'ionicons/icons';

import { Auth } from '../../services/auth';

type Role = 'freelancer' | 'client' | 'admin';

const ROLE_FIELDS: Record<Role, string[]> = {
  freelancer: ['Development', 'Design', 'Marketing', 'Engineering', 'DevOps', 'Content Writing', 'Tech & AI', 'Video Editing'],
  client: ['Design', 'Development', 'Marketing', 'Video Editing', 'Translation', 'DevOps', 'Tech & AI'],
  admin: ['Moderation', 'Support', 'Operations', 'Trust & Safety', 'Finance'],
};

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

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
  title = '';
  selectedRole: Role = 'freelancer';
  bio = '';
  resumeUrl = '';
  avatarFileName = '';
  avatarUrl = '';
  selectedFields: string[] = [];
  agreed = true;
  showPassword = false;
  errorMessage = '';
  successMessage = '';
  submitting = false;

  constructor(
    private readonly router: Router,
    private readonly auth: Auth,
    private readonly route: ActivatedRoute,
  ) {
    addIcons({ eye, eyeOff });

    this.route.queryParamMap.subscribe(params => {
      const role = params.get('role');
      if (role === 'freelancer' || role === 'client' || role === 'admin') {
        this.setRole(role);
      }

      const fields = params.get('fields');
      if (fields) {
        const allowed = new Set(this.availableFields);
        this.selectedFields = fields
          .split(',')
          .map(item => item.trim())
          .filter(item => item && allowed.has(item));
      }
    });
  }

  get isFreelancer(): boolean { return this.selectedRole === 'freelancer'; }
  get isClient(): boolean { return this.selectedRole === 'client'; }
  get isAdmin(): boolean { return this.selectedRole === 'admin'; }
  get availableFields(): string[] { return ROLE_FIELDS[this.selectedRole]; }

  setRole(role: Role): void {
    this.selectedRole = role;
    const allowed = new Set(this.availableFields);
    this.selectedFields = this.selectedFields.filter(field => allowed.has(field));
  }

  hasField(field: string): boolean {
    return this.selectedFields.includes(field);
  }

  toggleField(field: string): void {
    if (this.hasField(field)) {
      this.selectedFields = this.selectedFields.filter(item => item !== field);
      return;
    }

    this.selectedFields = [...this.selectedFields, field];
  }

  async onAvatarSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      this.avatarFileName = '';
      this.avatarUrl = '';
      return;
    }

    if (file.size > MAX_AVATAR_BYTES) {
      this.errorMessage = 'Profile photo must be smaller than 2 MB.';
      this.avatarFileName = '';
      this.avatarUrl = '';
      input.value = '';
      return;
    }

    try {
      this.avatarUrl = await this.readFileAsDataUrl(file);
      this.avatarFileName = file.name;
      this.errorMessage = '';
    } catch {
      this.errorMessage = 'We could not read that image. Please try another file.';
      this.avatarFileName = '';
      this.avatarUrl = '';
      input.value = '';
    }
  }

  register(): void {
    if (!this.name || !this.email || !this.password || !this.agreed || this.submitting) {
      return;
    }

    if (!this.isAdmin && this.selectedFields.length === 0) {
      this.errorMessage = 'Choose at least one field before creating your account.';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.submitting = true;

    this.auth.register({
      name: this.name.trim(),
      email: this.email.trim(),
      password: this.password,
      role: this.selectedRole,
      phone: this.phone.trim(),
      title: this.title.trim(),
      bio: this.bio.trim(),
      resume_url: this.resumeUrl.trim(),
      avatar_url: this.avatarUrl,
      specialties: this.selectedFields,
    }).subscribe({
      next: result => {
        this.submitting = false;
        this.successMessage = result.message;
        this.router.navigate(['/login'], {
          queryParams: {
            pending: '1',
            role: result.user.role,
          },
        });
      },
      error: error => {
        this.submitting = false;
        this.errorMessage = this.auth.errorMessage(error);
      },
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('file-read-failed'));
      reader.readAsDataURL(file);
    });
  }
}
