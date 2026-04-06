import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent],
})
export class OnboardingPage {
  currentSlide = 0;

  slides = [
    {
      title: 'Empowerment',
      description: 'Discover new opportunities and take control of your freelance journey with our powerful search and match capabilities.',
      btn: 'next'
    },
    {
      title: 'Connectivity',
      description: 'Easily find and communicate with clients, manage projects, and build lasting professional relationships.',
      btn: 'finish'
    },
    {
      title: 'Start your Career with us',
      description: 'Start your career with us today. Connect with opportunities and success awaits. Let\'s begin now!',
      btn: 'get started'
    }
  ];

  constructor(private router: Router) {}

  next() {
    if (this.currentSlide < this.slides.length - 1) {
      this.currentSlide++;
    }
  }

  prev() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  }

  finish() {
    this.router.navigate(['/register']);
  }

  skip() {
    this.router.navigate(['/login']);
  }
}