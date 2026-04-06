import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, sendOutline,
  ellipsisVerticalOutline, callOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon],
})
export class ChatPage {
  @ViewChild('messagesArea') messagesArea!: ElementRef;
  message = '';

  messages = [
    { text: 'Hello! I saw your job posting and I am very interested.', mine: false, time: '10:00' },
    { text: 'Great! Can you tell me more about your experience?', mine: true, time: '10:02' },
    { text: 'I have 3 years of experience in UI/UX design. I worked on several mobile apps.', mine: false, time: '10:04' },
    { text: 'That sounds perfect! Can you share your portfolio?', mine: true, time: '10:05' },
    { text: 'Of course! Here is my Behance link: behance.net/mayssa', mine: false, time: '10:07' },
    { text: 'Impressive work! When can you start?', mine: true, time: '10:10' },
    { text: 'I can start next week if that works for you 😊', mine: false, time: '10:12' },
  ];

  constructor(private router: Router) {
    addIcons({ arrowBackOutline, sendOutline, ellipsisVerticalOutline, callOutline });
  }

  goBack() { history.back(); }

  sendMessage() {
    if (this.message.trim()) {
      this.messages.push({
        text: this.message.trim(),
        mine: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      this.message = '';
      setTimeout(() => {
        if (this.messagesArea) {
          this.messagesArea.nativeElement.scrollTop = this.messagesArea.nativeElement.scrollHeight;
        }
      }, 100);
    }
  }

  onKeyPress(event: any) {
    if (event.key === 'Enter') this.sendMessage();
  }
}