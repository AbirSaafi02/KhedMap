import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, callOutline, ellipsisVerticalOutline, sendOutline } from 'ionicons/icons';

import { ConversationService } from '../../services/conversation.service';
import { Auth } from '../../services/auth';

type ChatMessage = {
  text: string;
  mine: boolean;
  time: string;
};

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon],
})
export class ChatPage {
  @ViewChild('messagesArea') messagesArea!: ElementRef;

  partnerId = '';
  contactName = 'Chat';
  message = '';
  messages: ChatMessage[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly auth: Auth,
    private readonly conversations: ConversationService,
  ) {
    addIcons({ arrowBackOutline, callOutline, ellipsisVerticalOutline, sendOutline });

    this.route.queryParams.subscribe(params => {
      this.partnerId = String(params['partnerId'] || '');
      this.contactName = String(params['partnerName'] || 'Chat');
      if (this.partnerId) {
        this.loadConversation();
      }
    });
  }

  goBack() {
    history.back();
  }

  sendMessage() {
    const content = this.message.trim();
    if (!content || !this.partnerId) {
      return;
    }

    this.conversations.sendMessage(this.partnerId, content).subscribe({
      next: conversation => {
        this.message = '';
        this.contactName = conversation.partner?.name || this.contactName;
        this.messages = conversation.messages.map(item => ({
          text: item.content,
          mine: item.sender_id === this.auth.currentUser?.id,
          time: this.timeOnly(item.created_at),
        }));
        this.scrollToBottom();
      },
    });
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  private loadConversation(): void {
    this.conversations.getConversation(this.partnerId).subscribe({
      next: conversation => {
        this.contactName = conversation.partner?.name || this.contactName;
        this.messages = conversation.messages.map(item => ({
          text: item.content,
          mine: item.sender_id === this.auth.currentUser?.id,
          time: this.timeOnly(item.created_at),
        }));
        this.scrollToBottom();
      },
    });
  }

  private timeOnly(value: string): string {
    return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesArea?.nativeElement) {
        this.messagesArea.nativeElement.scrollTop = this.messagesArea.nativeElement.scrollHeight;
      }
    }, 50);
  }
}
