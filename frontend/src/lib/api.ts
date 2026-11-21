const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

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
  winner?: Member;
  created_at: string;
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
};
