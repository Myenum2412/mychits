export type Platform =
  | 'whatsapp'
  | 'instagram'
  | 'telegram'
  | 'facebook'
  | 'twitter'
  | 'bluesky'
  | 'reddit';

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'pdf' | 'audio' | 'receipt';
  url: string;
  name: string;
  size?: string;
  previewUrl?: string;
}

export interface MessageReaction {
  emoji: string;
  fromMe: boolean;
  count: number;
}

export interface Message {
  id: string;
  conversationId: string;
  accountId: string;
  platform: Platform;
  message: string;
  direction: 'incoming' | 'outgoing';
  createdAt: string;
  senderName: string;
  senderAvatar?: string;
  attachments?: Attachment[];
  deliveryStatus?: 'sent' | 'delivered' | 'read' | 'failed';
  reactions?: MessageReaction[];
}

export interface Conversation {
  id: string;
  accountId: string;
  platform: Platform;
  participantId: string;
  participantName: string;
  participantHandle: string;
  participantAvatar?: string;
  participantVerified?: boolean;
  lastMessage: string;
  updatedTime: string;
  unreadCount: number;
  // Chit fund subscriber association
  linkedSubscriberId?: number;
  linkedSubscriberName?: string;
  linkedSchemeName?: string;
  linkedTicketNo?: number;
  dueAmount?: number;
}

export interface SocialChannelIntegration {
  id: string;
  platform: Platform;
  platformLabel: string;
  accountHandle: string;
  displayName: string;
  connected: boolean;
  status: 'active' | 'syncing' | 'error' | 'disconnected';
  lastSync: string;
  credentials: {
    apiKey?: string;
    accessToken?: string;
    phoneNumberId?: string;
    wabaId?: string;
    botToken?: string;
    pageId?: string;
    webhookUrl?: string;
  };
  features: string[];
}

export interface QuickTemplate {
  id: string;
  title: string;
  category: 'payment' | 'auction' | 'dividend' | 'kyc';
  content: string;
}

export const INITIAL_SOCIAL_CHANNELS: SocialChannelIntegration[] = [
  {
    id: 'ch-whatsapp',
    platform: 'whatsapp',
    platformLabel: 'WhatsApp Business',
    accountHandle: 'Not connected',
    displayName: 'WhatsApp Web (wwebjs.dev)',
    connected: false,
    status: 'disconnected',
    lastSync: 'Not synced',
    credentials: {
      phoneNumberId: '',
      wabaId: '',
      accessToken: '',
      webhookUrl: 'http://127.0.0.1:8000/api/v1/whatsapp',
    },
    features: ['Instant Receipts', '24h DMs', 'Interactive Buttons', 'wwebjs.dev QR'],
  },
  {
    id: 'ch-instagram',
    platform: 'instagram',
    platformLabel: 'Instagram DMs',
    accountHandle: 'Not connected',
    displayName: 'Instagram Graph Direct',
    connected: false,
    status: 'disconnected',
    lastSync: 'Not synced',
    credentials: {
      pageId: '',
      accessToken: '',
      webhookUrl: 'http://127.0.0.1:8000/api/v1/webhooks/instagram',
    },
    features: ['Direct Messages', 'Story Mentions', 'Media Attachments'],
  },
  {
    id: 'ch-telegram',
    platform: 'telegram',
    platformLabel: 'Telegram Bot',
    accountHandle: 'Not connected',
    displayName: 'Telegram Bot API',
    connected: false,
    status: 'disconnected',
    lastSync: 'Not synced',
    credentials: {
      botToken: '',
      webhookUrl: 'http://127.0.0.1:8000/api/v1/webhooks/telegram',
    },
    features: ['Subscriber Alerts', '2-Way Bot Messaging', 'Document Dispatch'],
  },
  {
    id: 'ch-facebook',
    platform: 'facebook',
    platformLabel: 'Facebook Messenger',
    accountHandle: 'Not connected',
    displayName: 'Facebook Messenger',
    connected: false,
    status: 'disconnected',
    lastSync: 'Not synced',
    credentials: {
      pageId: '',
      accessToken: '',
    },
    features: ['Page Inquiries', 'Auto-Welcome', 'Customer Support'],
  },
  {
    id: 'ch-twitter',
    platform: 'twitter',
    platformLabel: 'X (Twitter) DMs',
    accountHandle: 'Not connected',
    displayName: 'X Direct Messages',
    connected: false,
    status: 'disconnected',
    lastSync: 'Not synced',
    credentials: {
      apiKey: '',
      accessToken: '',
    },
    features: ['Direct Messages', 'Verified Support'],
  },
];

// Clean Production Database: Zero Mock Conversations & Zero Sample Messages
export const INITIAL_CONVERSATIONS: Conversation[] = [];

export const INITIAL_MESSAGES: Record<string, Message[]> = {};

export const CHIT_QUICK_TEMPLATES: QuickTemplate[] = [
  {
    id: 'tmpl-1',
    title: 'Monthly Installment Due Reminder',
    category: 'payment',
    content:
      'Dear Subscriber, this is a friendly reminder that your monthly chit installment for scheme {plan} is due. Please pay via UPI or cash to receive prompt payment cashback.',
  },
  {
    id: 'tmpl-2',
    title: 'Live Auction Schedule Notice',
    category: 'auction',
    content:
      'Notice: The next monthly reverse auction for scheme {plan} is scheduled for {date} at 11:00 AM. Eligible non-prized subscribers can submit their bid discount in the app or branch.',
  },
  {
    id: 'tmpl-3',
    title: 'Dividend Offset Calculation',
    category: 'dividend',
    content:
      'Great news! The auction dividend has been computed and credited against your monthly due for {plan}. Please check your updated ledger in the subscriber portal.',
  },
  {
    id: 'tmpl-4',
    title: 'Official Payment Receipt Dispatch',
    category: 'payment',
    content:
      'Payment Received! We have credited your monthly installment. Official digital receipt voucher has been generated and filed in your member portal.',
  },
];
