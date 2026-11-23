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
  // BrightBean Shared Inbox Features
  status?: "open" | "done";
  automationPaused?: boolean;
  assignedTo?: string;
  labels?: string[];
  internalNotes?: string;
  windowExpiresAt?: string;
  isWindowActive?: boolean;
  // Chit fund subscriber association
  linkedSubscriberId?: number;
  linkedSubscriberName?: string;
  linkedSchemeName?: string;
  linkedTicketNo?: number;
  dueAmount?: number;
}

export interface ConversationLabelDef {
  name: string;
  color: string;
  bg: string;
  border: string;
}

export const BRIGHTBEAN_LABELS: ConversationLabelDef[] = [
  { name: "Chit Due", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40", border: "border-rose-200 dark:border-rose-800" },
  { name: "Auction Bidder", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/40", border: "border-purple-200 dark:border-purple-800" },
  { name: "Needs a person", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200 dark:border-amber-800" },
  { name: "Payment Settled", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800" },
  { name: "VIP Subscriber", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40", border: "border-indigo-200 dark:border-indigo-800" },
  { name: "KYC Needed", color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-950/40", border: "border-sky-200 dark:border-sky-800" },
];

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
