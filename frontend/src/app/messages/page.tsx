"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader6 } from "@/components/ui/page-header-6";
import { ConversationList } from "@/components/inbox/conversation-list";
import { ThreadPane } from "@/components/inbox/thread-pane";
import { FlowBuilder } from "@/components/inbox/flow-builder";
import { TriggerManager } from "@/components/inbox/trigger-manager";
import { BroadcastManager } from "@/components/inbox/broadcast-manager";
import { ChannelManager } from "@/components/inbox/channel-manager";
import { SocialConnectDialog } from "@/components/inbox/social-connect-dialog";
import { NewChatDialog } from "@/components/inbox/new-chat-dialog";
import { SendInviteDialog } from "@/components/payments/send-invite-dialog";
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
import { api } from "@/lib/api";
import {
  Globe,
  Plus,
  MessageSquare,
  Workflow,
  Zap,
  Megaphone,
  RefreshCw,
  Link2,
} from "lucide-react";
import {
  SvglWhatsapp,
  SvglInstagram,
  SvglTelegram,
} from "@/components/ui/svgl-icons";

type TabType = "inbox" | "flows" | "triggers" | "broadcasts" | "channels";

const TABS: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: "inbox", label: "Shared Inbox", icon: MessageSquare },
  { id: "flows", label: "Flow Automations", icon: Workflow },
  { id: "triggers", label: "Keyword Triggers", icon: Zap },
  { id: "broadcasts", label: "Broadcast Campaigns", icon: Megaphone },
  { id: "channels", label: "Connected Channels", icon: Globe },
];

function MessagesHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") as TabType | null;

  const [activeTab, setActiveTab] = React.useState<TabType>(tabParam || "inbox");
  const [channels, setChannels] = React.useState<SocialChannelIntegration[]>(INITIAL_SOCIAL_CHANNELS);
  const [conversations, setConversations] = React.useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [allMessages, setAllMessages] = React.useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = React.useState<Platform | "all">("all");
  const [connectOpen, setConnectOpen] = React.useState(false);
  const [newChatOpen, setNewChatOpen] = React.useState(false);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Sync tab with URL query parameter changes
  React.useEffect(() => {
    if (tabParam && ["inbox", "flows", "triggers", "broadcasts", "channels"].includes(tabParam)) {
      setActiveTab(tabParam);
    } else {
      setActiveTab("inbox");
    }
  }, [tabParam]);

  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
    const url = newTab === "inbox" ? "/messages" : `/messages?tab=${newTab}`;
    router.push(url, { scroll: false });
  };

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

  // BrightBean Shared Inbox Controller: Human takeover, tags, operators, notes
  const handlePatchConversation = async (convId: string, patch: Partial<Conversation>) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, ...patch } : c))
    );

    try {
      await api.patchConversation(convId, {
        status: patch.status,
        automation_paused: patch.automationPaused,
        assigned_to: patch.assignedTo,
        labels: patch.labels,
        internal_notes: patch.internalNotes,
      });
    } catch (err) {
      console.error("Failed to patch conversation:", err);
    }
  };

  // Send message handler: records message in backend database & dispatches via WhatsApp if applicable
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

    setAllMessages((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), optimisticMsg],
    }));

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
      await api.sendMessage(selectedId, {
        message: text,
        direction: "outgoing",
        sender_name: "Foreperson Admin (Main Branch)",
        delivery_status: "delivered",
      });

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
    <div className="w-full flex-1 flex flex-col space-y-6">
      {/* PageHeader6 Toolbar */}
      <PageHeader6
        tag="Unified Omnichannel Messaging"
        title="Messages & Automation Hub"
        description="Powered by BrightBean Chat architecture. Shared inbox, visual automations, keyword triggers, and broadcast campaigns across WhatsApp, Instagram, Messenger & Telegram."
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
              <span>Connect Channels</span>
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

      {/* BrightBean Tabs Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-muted/30 border border-border rounded-2xl overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? "bg-card text-foreground shadow-xs border border-border font-bold ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className={`size-3.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span>{tab.label}</span>
              {tab.id === "inbox" && conversations.filter((c) => c.status !== "done").length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary text-primary-foreground ml-1">
                  {conversations.filter((c) => c.status !== "done").length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Shared Inbox (2-Pane Layout) */}
      {activeTab === "inbox" && (
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
            onPatchConversation={handlePatchConversation}
          />
        </div>
      )}

      {/* Tab 2: Visual Flow Automations */}
      {activeTab === "flows" && <FlowBuilder />}

      {/* Tab 3: Keyword Triggers */}
      {activeTab === "triggers" && <TriggerManager />}

      {/* Tab 4: Multi-Channel Broadcast Campaigns */}
      {activeTab === "broadcasts" && <BroadcastManager />}

      {/* Tab 5: Connected Channels */}
      {activeTab === "channels" && <ChannelManager onOpenConnect={() => setConnectOpen(true)} />}

      {/* Dialogs */}
      <SocialConnectDialog
        open={connectOpen}
        onOpenChange={setConnectOpen}
        channels={channels}
        onUpdateChannels={setChannels}
      />

      <NewChatDialog
        open={newChatOpen}
        onOpenChange={setNewChatOpen}
        channels={channels}
        onStartChat={handleStartChat}
      />

      <SendInviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <DashboardShell pageTitle="Unified Messages & Automation Hub">
      <React.Suspense
        fallback={
          <div className="w-full flex items-center justify-center py-20 text-xs text-muted-foreground">
            <RefreshCw className="size-5 animate-spin mr-2" />
            Loading Messages & Automation Hub...
          </div>
        }
      >
        <MessagesHubContent />
      </React.Suspense>
    </DashboardShell>
  );
}
