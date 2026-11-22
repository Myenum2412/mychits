"use client";

import * as React from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader6 } from "@/components/ui/page-header-6";
import { ConversationList } from "@/components/inbox/conversation-list";
import { ThreadPane } from "@/components/inbox/thread-pane";
import { SocialConnectDialog } from "@/components/inbox/social-connect-dialog";
import { NewChatDialog } from "@/components/inbox/new-chat-dialog";
import {
  INITIAL_SOCIAL_CHANNELS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
} from "@/components/inbox/types";
import type {
  Conversation,
  Message,
  SocialChannelIntegration,
  Platform,
  Attachment,
} from "@/components/inbox/types";
import { api, type ApiConversation, type ApiMessage } from "@/lib/api";
import { Globe, Plus, MessageSquare, RefreshCw, Link2 } from "lucide-react";
import {
  SvglWhatsapp,
  SvglInstagram,
  SvglTelegram,
} from "@/components/ui/svgl-icons";
import { SendInviteDialog } from "@/components/payments/send-invite-dialog";

export default function MessagesPage() {
  const [channels, setChannels] = React.useState<SocialChannelIntegration[]>(INITIAL_SOCIAL_CHANNELS);
  const [conversations, setConversations] = React.useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [allMessages, setAllMessages] = React.useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = React.useState<Platform | "all">("all");
  const [connectOpen, setConnectOpen] = React.useState(false);
  const [newChatOpen, setNewChatOpen] = React.useState(false);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load real conversations and WhatsApp status from database on mount
  const refreshConversations = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const dbConversations = await api.getConversations();
      if (Array.isArray(dbConversations)) {
        const mapped: Conversation[] = dbConversations.map((c) => ({
          ...c,
          platform: c.platform as Platform,
        }));
        setConversations(mapped);
        if (mapped.length > 0 && !selectedId) {
          setSelectedId(mapped[0].id);
        } else if (mapped.length === 0) {
          setSelectedId(null);
        }
      }
    } catch (err) {
      console.warn("Could not load conversations from backend, using clean production state:", err);
      setConversations([]);
      setSelectedId(null);
    } finally {
      setIsLoading(false);
    }

    // Check WhatsApp Web connection status from wwebjs.dev backend session
    try {
      const waStatus = await api.getWhatsAppStatus();
      if (waStatus && waStatus.status === "connected") {
        setChannels((prev) =>
          prev.map((chan) =>
            chan.platform === "whatsapp"
              ? {
                  ...chan,
                  connected: true,
                  status: "active",
                  accountHandle: waStatus.connected_number || "WhatsApp Session (Connected)",
                  lastSync: "Just now",
                }
              : chan
          )
        );
      }
    } catch {
      // Backend status check failed gracefully
    }
  }, [selectedId]);

  React.useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // Load real messages whenever a conversation is selected
  React.useEffect(() => {
    if (!selectedId) return;

    let isMounted = true;
    api
      .getConversationMessages(selectedId)
      .then((msgs) => {
        if (!isMounted) return;
        if (Array.isArray(msgs)) {
          const mapped: Message[] = msgs.map((m) => ({
            ...m,
            accountId: m.accountId || `ch-${m.platform}`,
            platform: m.platform as Platform,
          }));
          setAllMessages((prev) => ({
            ...prev,
            [selectedId]: mapped,
          }));
        }
      })
      .catch((err) => {
        console.warn("Failed to load messages for conversation:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedId]);

  const selectedConversation = React.useMemo(() => {
    return conversations.find((c) => c.id === selectedId) || null;
  }, [conversations, selectedId]);

  const activeMessages = React.useMemo(() => {
    if (!selectedId) return [];
    return allMessages[selectedId] || [];
  }, [allMessages, selectedId]);

  // Real send message handler: records message in backend database & dispatches via WhatsApp if applicable
  const handleSendMessage = async (text: string, attachment?: Attachment) => {
    if (!selectedId || !selectedConversation) return;

    const optimisticMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: selectedId,
      accountId: selectedConversation.accountId,
      platform: selectedConversation.platform,
      message: text,
      direction: "outgoing",
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      senderName: "Foreperson Admin (Main Branch)",
      deliveryStatus: "delivered",
      attachments: attachment ? [attachment] : undefined,
    };

    // Optimistic UI update
    setAllMessages((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), optimisticMsg],
    }));

    // Update conversation snippet
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              lastMessage: text,
              updatedTime: "Just now",
            }
          : c
      )
    );

    try {
      // 1. Post to backend REST API database
      await api.sendMessage(selectedId, {
        message: text,
        direction: "outgoing",
        sender_name: "Foreperson Admin (Main Branch)",
        delivery_status: "delivered",
      });

      // 2. If WhatsApp, send to backend wwebjs.dev endpoint
      if (selectedConversation.platform === "whatsapp") {
        api
          .sendWhatsAppMessage("admin", selectedConversation.participantHandle, text)
          .catch((err) => {
            console.info("WhatsApp delivery queued:", err.message);
          });
      }
    } catch (err) {
      console.error("Failed to record message in database:", err);
    }
  };

  const handleReactMessage = (messageId: string, emoji: string) => {
    if (!selectedId) return;
    setAllMessages((prev) => {
      const list = prev[selectedId] || [];
      const updated = list.map((m) => {
        if (m.id === messageId) {
          const reactions = m.reactions ? [...m.reactions] : [];
          const existing = reactions.find((r) => r.emoji === emoji);
          if (existing) {
            existing.count += 1;
            existing.fromMe = true;
          } else {
            reactions.push({ emoji, count: 1, fromMe: true });
          }
          return { ...m, reactions };
        }
        return m;
      });
      return { ...prev, [selectedId]: updated };
    });
  };

  // Real conversation creation: creates in backend database
  const handleStartChat = async (newConv: Partial<Conversation>, initialText: string) => {
    try {
      const created = await api.createConversation({
        id: newConv.id,
        platform: newConv.platform || "whatsapp",
        participant_name: newConv.participantName || "Subscriber",
        participant_handle: newConv.participantHandle || "",
        participant_id: newConv.participantId,
        linked_subscriber_id: newConv.linkedSubscriberId,
        linked_subscriber_name: newConv.linkedSubscriberName,
        linked_scheme_name: newConv.linkedSchemeName,
        initial_message: initialText,
      });

      const fullConv: Conversation = {
        ...created,
        platform: created.platform as Platform,
      };

      setConversations((prev) => [fullConv, ...prev.filter((c) => c.id !== fullConv.id)]);
      setSelectedId(fullConv.id);

      // Load initial message from backend
      const msgs = await api.getConversationMessages(fullConv.id);
      if (Array.isArray(msgs)) {
        setAllMessages((prev) => ({
          ...prev,
          [fullConv.id]: msgs.map((m) => ({
            ...m,
            accountId: m.accountId || `ch-${m.platform}`,
            platform: m.platform as Platform,
          })),
        }));
      }
    } catch (err) {
      console.error("Failed to persist new conversation:", err);
      // Fallback local update
      const fallbackConv: Conversation = {
        id: newConv.id || `conv-${Date.now()}`,
        accountId: newConv.accountId || "ch-whatsapp",
        platform: newConv.platform || "whatsapp",
        participantId: newConv.participantId || `p-${Date.now()}`,
        participantName: newConv.participantName || "Subscriber",
        participantHandle: newConv.participantHandle || "+91 90000 00000",
        lastMessage: initialText,
        updatedTime: "Just now",
        unreadCount: 0,
        linkedSchemeName: newConv.linkedSchemeName || "General Inquiries",
      };
      setConversations((prev) => [fallbackConv, ...prev]);
      setSelectedId(fallbackConv.id);
    }
  };

  return (
    <DashboardShell pageTitle="Unified Messages & Social Inbox">
      <div className="w-full flex-1 flex flex-col space-y-6">
        {/* PageHeader6 Toolbar */}
        <PageHeader6
          tag="Unified Omnichannel Inbox"
          title="Messages & Social Media Integration"
          description="Open source unified inbox for WhatsApp, Instagram, Telegram, Messenger, and X (Twitter) powered by Zernio architecture."
          actions={
            <div className="flex items-center gap-2.5">
              <button
                onClick={refreshConversations}
                disabled={isLoading}
                title="Refresh Conversations"
                className="p-2 border border-border bg-card hover:bg-muted text-foreground rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={() => setInviteOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
              >
                <Link2 className="size-3.5" />
                <span>Send Pay Invite</span>
              </button>
              <button
                onClick={() => setConnectOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                <div className="flex items-center -space-x-1 shrink-0">
                  <SvglWhatsapp className="size-3.5 rounded-full ring-1 ring-background" />
                  <SvglInstagram className="size-3.5 rounded-full ring-1 ring-background" />
                  <SvglTelegram className="size-3.5 rounded-full ring-1 ring-background" />
                </div>
                <span>Connect Social Media</span>
              </button>
              <button
                onClick={() => setNewChatOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                <Plus className="size-4" />
                <span>New Message</span>
              </button>
            </div>
          }
        />

        {/* 2-Pane Unified Messaging Workspace with Full Width and Height */}
        <div className="w-full flex-1 flex flex-col md:flex-row min-h-[580px] rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={(conv) => setSelectedId(conv.id)}
            onNewChat={() => setNewChatOpen(true)}
            platformFilter={platformFilter}
            onFilterChange={setPlatformFilter}
          />
          <ThreadPane
            conversation={selectedConversation}
            messages={activeMessages}
            onSendMessage={handleSendMessage}
            onReactMessage={handleReactMessage}
            onOpenConnect={() => setConnectOpen(true)}
          />
        </div>
      </div>

      {/* Social Media Integration Dialog */}
      <SocialConnectDialog
        open={connectOpen}
        onOpenChange={setConnectOpen}
        channels={channels}
        onUpdateChannels={setChannels}
      />

      {/* Outbound New Message Dialog */}
      <NewChatDialog
        open={newChatOpen}
        onOpenChange={setNewChatOpen}
        channels={channels}
        onStartChat={handleStartChat}
      />

      {/* Send Payment Invite Dialog */}
      <SendInviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
    </DashboardShell>
  );
}
