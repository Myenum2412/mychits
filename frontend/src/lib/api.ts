const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: "orgmenu" | "chits";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: UserRecord;
  token: string;
  message: string;
}

export interface DashboardStats {
  total_groups: number;
  active_groups: number;
  total_members: number;
  active_members: number;
  total_auctions: number;
  total_collections: number;
  total_prizes: number;
  total_dividends: number;
}

export interface Member {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  id_proof?: string | null;
  status: string;
  created_at: string;
}

export interface GroupMember {
  id: number;
  chit_group_id: number;
  member_id: number;
  ticket_number: number;
  has_prized: boolean;
  joined_at: string;
  member?: Member;
}

export interface ChitGroup {
  id: number;
  group_name: string;
  total_value: number;
  duration_months: number;
  monthly_installment: number;
  max_members: number;
  commission_rate: number;
  start_date: string;
  status: string;
  memberships: GroupMember[];
  created_at: string;
}

export interface Auction {
  id: number;
  chit_group_id: number;
  auction_number: number;
  auction_date: string;
  bid_discount_amount: number;
  foreperson_commission: number;
  dividend_total: number;
  dividend_per_member: number;
  net_payable_amount: number;
  prize_amount: number;
  winner_member_id?: number | null;
  status: string;
  created_at: string;
  group?: ChitGroup;
  winner?: Member;
}

export interface Payment {
  id: number;
  chit_group_id: number;
  member_id: number;
  auction_id?: number | null;
  installment_number: number;
  amount_paid: number;
  payment_mode: string;
  transaction_ref?: string | null;
  payment_date: string;
  status: string;
  remarks?: string | null;
  created_at: string;
  group?: ChitGroup;
  member?: Member;
}

export interface WhatsAppSession {
  user_id: string;
  status: "ready_to_scan" | "connected" | "disconnected";
  qr_code: string | null;
  connected_number: string | null;
  last_active: number;
  library: string;
}

export type WhatsAppStatus = WhatsAppSession;

export interface ApiConversation {
  id: string;
  accountId: string;
  platform: "whatsapp" | "instagram" | "telegram" | "facebook" | "twitter" | "bluesky" | "reddit";
  participantId: string;
  participantName: string;
  participantHandle: string;
  participantAvatar?: string;
  participantVerified?: boolean;
  lastMessage: string;
  updatedTime: string;
  unreadCount: number;
  status?: "open" | "done";
  automationPaused?: boolean;
  assignedTo?: string;
  labels?: string[];
  internalNotes?: string;
  windowExpiresAt?: string;
  isWindowActive?: boolean;
  linkedSubscriberId?: number;
  linkedSubscriberName?: string;
  linkedSchemeName?: string;
  linkedTicketNo?: number;
  dueAmount?: number;
}

export interface BrightBeanFlow {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  trigger_keyword: string;
  status: string;
  nodes_json: string;
  edges_json: string;
  executions_count: number;
  created_at: string;
}

export interface BrightBeanTrigger {
  id: string;
  keyword: string;
  match_type: string;
  action: string;
  reply_text: string;
  target_flow_id?: string | null;
  label_to_add?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface BrightBeanBroadcast {
  id: string;
  title: string;
  channel: string;
  target_segment: string;
  message: string;
  status: string;
  sent_count: number;
  delivered_count: number;
  created_at: string;
}

export interface ApiMessage {
  id: string;
  conversationId: string;
  accountId?: string;
  platform: "whatsapp" | "instagram" | "telegram" | "facebook" | "twitter" | "bluesky" | "reddit";
  message: string;
  direction: "incoming" | "outgoing";
  createdAt: string;
  senderName: string;
  deliveryStatus?: "sent" | "delivered" | "read" | "failed";
}

export interface YouPISettings {
  id: number;
  merchant_id: string;
  merchant_name: string;
  primary_vpa: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  mcc: string;
  api_key: string;
  webhook_secret: string;
  min_amount: number;
  max_amount: number;
  is_active: boolean;
}

export interface YouPISession {
  session_id: string;
  order_id: string;
  amount: number;
  currency: string;
  merchant_vpa: string;
  merchant_name: string;
  upi_intent_uri: string;
  gpay_uri: string;
  phonepe_uri: string;
  paytm_uri: string;
  bhim_uri: string;
  cred_uri: string;
  qr_data: string;
  expires_at: string;
  status: string;
}

export interface YouPITransaction {
  id: string;
  session_id: string;
  order_id: string;
  chit_group_id?: number | null;
  member_id?: number | null;
  amount: number;
  currency: string;
  merchant_vpa: string;
  customer_vpa?: string | null;
  utr?: string | null;
  status: "pending" | "manual_review" | "verified" | "under_investigation" | "rejected";
  payment_method: string;
  observer_matched: boolean;
  observer_source?: string | null;
  verified_at?: string | null;
  admin_notes?: string | null;
  created_at: string;
  member_name?: string | null;
  group_name?: string | null;
}

export interface ObserverStatus {
  name: string;
  type: "ANDROID" | "SMS" | "GMAIL";
  status: string;
  details: string;
  last_ping: string;
  battery?: string | null;
}

export interface MetaFacebookStatus {
  connected: boolean;
  page_id?: string | null;
  page_name?: string | null;
  category?: string | null;
}

export interface MetaInstagramStatus {
  connected: boolean;
  account_id?: string | null;
  username?: string | null;
  name?: string | null;
  profile_picture_url?: string | null;
}

export interface MetaStatusResponse {
  connected: boolean;
  api_version: string;
  documentation_url: string;
  facebook: MetaFacebookStatus;
  instagram: MetaInstagramStatus;
  app_id?: string | null;
  webhook_url: string;
  webhook_verify_token: string;
}

export interface MetaConnectRequest {
  user_access_token?: string;
  app_id?: string;
  app_secret?: string;
  page_id?: string;
  page_name?: string;
  page_access_token?: string;
  instagram_account_id?: string;
  instagram_username?: string;
}

export interface MetaSendMessageResponse {
  success: boolean;
  platform: string;
  message_id: string;
  recipient_id: string;
  status: string;
  api_endpoint: string;
  meta_response?: Record<string, unknown>;
}

export interface MetaOAuthUrlResponse {
  oauth_url: string;
  scopes: string[];
  api_version: string;
  docs_url: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: "Unknown server error" }));
    throw new Error(errorBody.detail || `Request failed with status ${res.status}`);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export const api = {
  // Authentication & Users (stored in database)
  login: (credentials: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  signup: (data: { name: string; email: string; password: string; role?: string }) =>
    request<UserRecord>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getUsers: () => request<UserRecord[]>("/auth/users"),

  // Stats
  getDashboardStats: () => request<DashboardStats>("/dashboard/stats"),

  // Members
  getMembers: (search?: string) =>
    request<Member[]>(`/members${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  getMember: (id: number) => request<Member>(`/members/${id}`),
  createMember: (data: Omit<Member, "id" | "created_at">) =>
    request<Member>("/members", { method: "POST", body: JSON.stringify(data) }),
  deleteMember: (id: number) => request<void>(`/members/${id}`, { method: "DELETE" }),

  // Chit Groups
  getGroups: () => request<ChitGroup[]>("/groups"),
  getGroup: (id: number) => request<ChitGroup>(`/groups/${id}`),
  createGroup: (data: Omit<ChitGroup, "id" | "memberships" | "created_at">) =>
    request<ChitGroup>("/groups", { method: "POST", body: JSON.stringify(data) }),
  deleteGroup: (id: number) => request<void>(`/groups/${id}`, { method: "DELETE" }),
  addMemberToGroup: (groupId: number, data: { member_id: number; ticket_number: number }) =>
    request<GroupMember>(`/groups/${groupId}/members`, { method: "POST", body: JSON.stringify(data) }),
  removeMemberFromGroup: (groupId: number, membershipId: number) =>
    request<void>(`/groups/${groupId}/members/${membershipId}`, { method: "DELETE" }),

  // Auctions
  getAuctions: (groupId?: number) =>
    request<Auction[]>(`/auctions${groupId ? `?chit_group_id=${groupId}` : ""}`),
  createAuction: (data: {
    chit_group_id: number;
    auction_number: number;
    auction_date: string;
    bid_discount_amount: number;
    winner_member_id?: number | null;
  }) => request<Auction>("/auctions", { method: "POST", body: JSON.stringify(data) }),
  deleteAuction: (id: number) => request<void>(`/auctions/${id}`, { method: "DELETE" }),

  // Payments
  getPayments: (groupId?: number, memberId?: number) => {
    const params = new URLSearchParams();
    if (groupId) params.append("chit_group_id", groupId.toString());
    if (memberId) params.append("member_id", memberId.toString());
    const q = params.toString();
    return request<Payment[]>(`/payments${q ? `?${q}` : ""}`);
  },
  createPayment: (data: {
    chit_group_id: number;
    member_id: number;
    installment_number: number;
    amount_paid: number;
    payment_mode: string;
    transaction_ref?: string;
    remarks?: string;
  }) => request<Payment>("/payments", { method: "POST", body: JSON.stringify(data) }),
  deletePayment: (id: number) => request<void>(`/payments/${id}`, { method: "DELETE" }),

  // WhatsApp Web Integration (wwebjs.dev)
  getWhatsAppStatus: (userId: string = "admin") =>
    request<WhatsAppSession>(`/whatsapp/status?user_id=${encodeURIComponent(userId)}`),
  performWhatsAppAction: (userId: string, action: "connect" | "disconnect" | "refresh") =>
    request<WhatsAppSession>("/whatsapp/action", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, action }),
    }),
  sendWhatsAppMessage: (userId: string, phoneNumber: string, message: string) =>
    request<{ success: boolean; status: string; recipient: string; provider: string }>(
      "/whatsapp/send-message",
      {
        method: "POST",
        body: JSON.stringify({ user_id: userId, phone_number: phoneNumber, message }),
      }
    ),

  // Omnichannel Messages & Conversations (Database backed)
  getConversations: () => request<ApiConversation[]>("/messages/conversations"),
  createConversation: (data: {
    id?: string;
    platform: string;
    participant_name: string;
    participant_handle: string;
    participant_id?: string;
    linked_subscriber_id?: number;
    linked_subscriber_name?: string;
    linked_scheme_name?: string;
    initial_message?: string;
  }) =>
    request<ApiConversation>("/messages/conversations", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getConversationMessages: (conversationId: string) =>
    request<ApiMessage[]>(`/messages/conversations/${conversationId}/messages`),
  sendMessage: (
    conversationId: string,
    data: {
      message: string;
      direction?: string;
      sender_name?: string;
      delivery_status?: string;
    }
  ) =>
    request<ApiMessage>(`/messages/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteConversation: (conversationId: string) =>
    request<void>(`/messages/conversations/${conversationId}`, { method: "DELETE" }),
  patchConversation: (
    conversationId: string,
    data: {
      status?: "open" | "done";
      automation_paused?: boolean;
      assigned_to?: string;
      labels?: string[];
      internal_notes?: string;
    }
  ) =>
    request<ApiConversation>(`/messages/conversations/${conversationId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  getFlows: () => request<BrightBeanFlow[]>("/messages/flows"),
  createFlow: (data: Partial<BrightBeanFlow>) =>
    request<BrightBeanFlow>("/messages/flows", { method: "POST", body: JSON.stringify(data) }),
  getTriggers: () => request<BrightBeanTrigger[]>("/messages/triggers"),
  createTrigger: (data: Partial<BrightBeanTrigger>) =>
    request<BrightBeanTrigger>("/messages/triggers", { method: "POST", body: JSON.stringify(data) }),
  getBroadcasts: () => request<BrightBeanBroadcast[]>("/messages/broadcasts"),
  createBroadcast: (data: Partial<BrightBeanBroadcast>) =>
    request<BrightBeanBroadcast>("/messages/broadcasts", { method: "POST", body: JSON.stringify(data) }),

  // YouPI PG Sovereign Gateway
  getYouPISettings: () => request<YouPISettings>("/youpi/settings"),
  updateYouPISettings: (data: Partial<YouPISettings>) =>
    request<YouPISettings>("/youpi/settings", { method: "PUT", body: JSON.stringify(data) }),
  createYouPISession: (data: {
    chit_group_id?: number;
    member_id?: number;
    installment_number?: number;
    amount: number;
    customer_name?: string;
    customer_phone?: string;
    note?: string;
  }) =>
    request<YouPISession>("/youpi/sessions", { method: "POST", body: JSON.stringify(data) }),
  submitYouPIUTR: (data: { session_id: string; utr: string; customer_vpa?: string; notes?: string }) =>
    request<YouPITransaction>("/youpi/submit-utr", { method: "POST", body: JSON.stringify(data) }),
  getYouPITransactions: () => request<YouPITransaction[]>("/youpi/transactions"),
  verifyYouPITransaction: (id: string, data: { action: "verify" | "investigate" | "reject"; admin_notes?: string }) =>
    request<YouPITransaction>(`/youpi/transactions/${id}/verify`, { method: "POST", body: JSON.stringify(data) }),
  getYouPIObservers: () => request<ObserverStatus[]>("/youpi/observers"),

  // Meta Graph API (v21.0 - Facebook & Instagram Direct)
  // Reference: https://developers.facebook.com/docs/graph-api/
  getMetaStatus: () => request<MetaStatusResponse>("/meta/status"),
  getMetaOAuthUrl: (appId?: string, redirectUri?: string) => {
    const params = new URLSearchParams();
    if (appId) params.append("app_id", appId);
    if (redirectUri) params.append("redirect_uri", redirectUri);
    const q = params.toString();
    return request<MetaOAuthUrlResponse>(`/meta/oauth-url${q ? `?${q}` : ""}`);
  },
  connectMetaGraph: (data: MetaConnectRequest) =>
    request<MetaStatusResponse>("/meta/connect", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  disconnectMeta: (platform?: "facebook" | "instagram") => {
    const q = platform ? `?platform=${platform}` : "";
    return request<MetaStatusResponse>(`/meta/disconnect${q}`, { method: "POST" });
  },
  sendMetaMessage: (data: {
    platform: string;
    recipient_id: string;
    message: string;
    conversation_id?: string;
  }) =>
    request<MetaSendMessageResponse>("/meta/send-message", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
