"use client";

import * as React from "react";
import { Search, Plus, Filter, CheckCircle2, User, ChevronRight, MessageSquare } from "lucide-react";
import { PlatformIcon, PLATFORM_LABELS } from "./platform-icon";
import type { Conversation, Platform } from "./types";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conv: Conversation) => void;
  onNewChat: () => void;
  platformFilter: Platform | "all";
  onFilterChange: (p: Platform | "all") => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onNewChat,
  platformFilter,
  onFilterChange,
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredConversations = React.useMemo(() => {
    return conversations.filter((c) => {
      const matchesPlatform = platformFilter === "all" || c.platform === platformFilter;
      const lower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm.trim() ||
        c.participantName.toLowerCase().includes(lower) ||
        c.participantHandle.toLowerCase().includes(lower) ||
        c.lastMessage.toLowerCase().includes(lower) ||
        (c.linkedSchemeName && c.linkedSchemeName.toLowerCase().includes(lower));

      return matchesPlatform && matchesSearch;
    });
  }, [conversations, platformFilter, searchTerm]);

  const platformCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: conversations.length };
    conversations.forEach((c) => {
      counts[c.platform] = (counts[c.platform] || 0) + 1;
    });
    return counts;
  }, [conversations]);

  return (
    <div className="w-full md:w-80 lg:w-96 shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-border bg-card/60 overflow-hidden h-full">
      {/* Header with Search and New Chat button */}
      <div className="p-3 border-b border-border space-y-2.5 bg-card">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Conversations
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted text-foreground font-semibold">
              {filteredConversations.length}
            </span>
          </div>
          <button
            onClick={onNewChat}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs transition-colors"
          >
            <Plus className="size-3.5" />
            <span>New DM</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search DMs, phone, subscriber..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Platform Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-xs">
          {(["all", "whatsapp", "instagram", "telegram", "facebook", "twitter"] as const).map(
            (p) => {
              const count = platformCounts[p] || 0;
              const isSelected = platformFilter === p;
              return (
                <button
                  key={p}
                  onClick={() => onFilterChange(p)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors shrink-0 ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p !== "all" && <PlatformIcon platform={p} className="size-3" />}
                  <span>{p === "all" ? "All" : PLATFORM_LABELS[p]}</span>
                  {count > 0 && (
                    <span
                      className={`text-[9px] px-1 rounded-full ${
                        isSelected
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-background text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Conversation Thread List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/40">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center space-y-3 flex flex-col items-center justify-center h-64">
            <div className="p-3 rounded-full bg-muted/60 text-muted-foreground border border-border">
              <MessageSquare className="size-5" />
            </div>
            <div className="space-y-1 max-w-[220px]">
              <p className="text-xs font-bold text-foreground">Zero Conversations</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Clean production database initialized with 0 sample records. Click below to start an outbound chat.
              </p>
            </div>
            <button
              onClick={onNewChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xs transition-colors"
            >
              <Plus className="size-3.5" />
              <span>New Message</span>
            </button>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = conv.id === selectedId;
            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={`w-full p-3 flex items-start gap-3 cursor-pointer text-left transition-colors relative ${
                  isSelected
                    ? "bg-primary/5 dark:bg-primary/10 border-l-2 border-primary"
                    : "hover:bg-muted/40"
                }`}
              >
                {/* Avatar with Platform Badge */}
                <div className="relative shrink-0">
                  {conv.participantAvatar ? (
                    <img
                      src={conv.participantAvatar}
                      alt={conv.participantName}
                      className="size-10 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-foreground border border-border">
                      {conv.participantName.charAt(0)}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1">
                    <PlatformIcon platform={conv.platform} showBadge className="size-4" />
                  </div>
                </div>

                {/* Info & Last message */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 truncate">
                      <span className="text-xs font-bold text-foreground truncate">
                        {conv.participantName}
                      </span>
                      {conv.participantVerified && (
                        <CheckCircle2 className="size-3 text-sky-500 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                      {conv.updatedTime}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground/80 font-mono truncate">
                    {conv.participantHandle}
                  </p>

                  <p className="text-xs text-muted-foreground truncate mt-0.5 font-normal">
                    {conv.lastMessage}
                  </p>

                  {/* Linked Chit Fund Scheme Pill */}
                  {conv.linkedSchemeName && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 truncate">
                        {conv.linkedSchemeName}
                      </span>
                      {conv.linkedTicketNo ? (
                        <span className="text-[9px] font-mono text-muted-foreground">
                          Ticket #{conv.linkedTicketNo}
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Unread Counter Badge */}
                {conv.unreadCount > 0 && (
                  <div className="shrink-0 self-center">
                    <span className="inline-flex items-center justify-center size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                      {conv.unreadCount}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
export default ConversationList;
