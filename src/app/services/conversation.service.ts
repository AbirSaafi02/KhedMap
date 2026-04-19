import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Api } from './api';
import { MarketplaceUser } from './marketplace.service';

export interface ConversationMessage {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_ids: string[];
  participant_key: string;
  messages: ConversationMessage[];
  last_message: string;
  created_at: string;
  updated_at: string;
  partner?: MarketplaceUser;
}

@Injectable({ providedIn: 'root' })
export class ConversationService {
  constructor(private readonly api: Api) {}

  listConversations(): Observable<Conversation[]> {
    return this.api.get<Conversation[]>('/conversations');
  }

  getConversation(partnerId: string): Observable<Conversation> {
    return this.api.get<Conversation>(`/conversations/${partnerId}`);
  }

  sendMessage(partnerId: string, content: string): Observable<Conversation> {
    return this.api.post<Conversation>(`/conversations/${partnerId}/messages`, { content });
  }
}
