import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  briefcaseOutline,
  chatbubbleOutline,
  homeOutline,
  notificationsOutline,
  personOutline,
  searchOutline,
  storefrontOutline,
} from 'ionicons/icons';

import { Conversation, ConversationService } from '../../../services/conversation.service';

type ConversationCard = {
  partnerId: string;
  name: string;
  last: string;
  time: string;
  unread: boolean;
};

@Component({
  selector: 'app-messages-client',
  templateUrl: './messages-client.page.html',
  styleUrls: ['./messages-client.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
})
export class MessagesClientPage implements OnInit {
  activeTab = 'messages';
  conversations: ConversationCard[] = [];

  constructor(private readonly router: Router, private readonly conversationService: ConversationService) {
    addIcons({
      briefcaseOutline,
      chatbubbleOutline,
      homeOutline,
      notificationsOutline,
      personOutline,
      searchOutline,
      storefrontOutline,
    });
  }

  ngOnInit(): void {
    this.conversationService.listConversations().subscribe({
      next: conversations => {
        this.conversations = conversations.map((conversation: Conversation) => ({
          partnerId: conversation.partner?.id || '',
          name: conversation.partner?.name || 'Conversation',
          last: conversation.last_message || 'No messages yet',
          time: this.relativeTime(conversation.updated_at),
          unread: false,
        }));
      },
    });
  }

  goTo(page: string) {
    if (page === '/store') {
      this.router.navigate(['/store'], { queryParams: { role: 'client' } });
    } else if (page === '/notifications') {
      this.router.navigate(['/notifications'], { queryParams: { role: 'client' } });
    } else {
      this.router.navigate([page]);
    }
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  openConversation(conversation: ConversationCard) {
    this.router.navigate(['/chat'], {
      queryParams: { partnerId: conversation.partnerId, partnerName: conversation.name },
    });
  }

  private relativeTime(value: string): string {
    const date = new Date(value);
    const diffMinutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / (1000 * 60)));
    if (diffMinutes < 60) return `${diffMinutes}m`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  }
}
