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
      title: 'Welcome to KhedMap',
      description: 'Find vetted talent or land paid work fast. Create a profile, pick your fields, and get a feed that feels tailored from day one.',
      btn: 'next'
    },
    {
      title: 'Work Runs Smoothly',
      description: 'Built-in briefs, chat, milestones, and payouts keep everyone aligned. Less back-and-forth, more shipped work.',
      btn: 'next'
    },
    {
      title: 'Quality Checked',
      description: 'Profiles, gigs, and store items are reviewed by our team. You get notified the moment something goes live.',
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
