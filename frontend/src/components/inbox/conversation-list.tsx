"use client";

import * as React from "react";
import {
  Search,
  Plus,
  Filter,
  CheckCircle2,
  User,
  ChevronRight,
  MessageSquare,
  Bot,
  UserCheck,
  Clock,
  Tag,
  Check,
} from "lucide-react";
import { PlatformIcon, PLATFORM_LABELS } from "./platform-icon";
import { BRIGHTBEAN_LABELS } from "./types";
import type { Conversation, Platform } from "./types";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conv: Conversation) => void;
  onNewChat: () => void;
  platformFilter: Platform | "all";
  onFilterChange: (p: Platform | "all") => void;
  statusFilter?: "all" | "open" | "done";
  onStatusFilterChange?: (s: "all" | "open" | "done") => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onNewChat,
  platformFilter,
  onFilterChange,
  statusFilter = "open",
  onStatusFilterChange,
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeLabel, setActiveLabel] = React.useState<string | null>(null);

  const filteredConversations = React.useMemo(() => {
    return conversations.filter((c) => {
      // 1. Status Filter (BrightBean ConversationState: Open vs Done)
      if (statusFilter !== "all") {
        const cStatus = c.status || "open";
        if (cStatus !== statusFilter) return false;
      }

      // 2. Platform filter
      if (platformFilter !== "all" && c.platform !== platformFilter) return false;

      // 3. Label filter
      if (activeLabel) {
        const cLabels = c.labels || [];
        if (!cLabels.includes(activeLabel)) return false;
      }

      // 4. Search text
      const lower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm.trim() ||
        c.participantName.toLowerCase().includes(lower) ||
        c.participantHandle.toLowerCase().includes(lower) ||
        c.lastMessage.toLowerCase().includes(lower) ||
        (c.linkedSchemeName && c.linkedSchemeName.toLowerCase().includes(lower));

      return matchesSearch;
    });
  }, [conversations, statusFilter, platformFilter, activeLabel, searchTerm]);

  const openCount = React.useMemo(
    () => conversations.filter((c) => (c.status || "open") === "open").length,
    [conversations]
  );
  const doneCount = React.useMemo(
    () => conversations.filter((c) => c.status === "done").length,
    [conversations]
  );

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
              Shared Inbox
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

        {/* BrightBean State Filter Tabs (Open / Done / All) */}
        {onStatusFilterChange && (
          <div className="grid grid-cols-3 gap-1 p-1 bg-muted/50 rounded-xl text-xs font-bold">
            <button
              onClick={() => onStatusFilterChange("open")}
              className={`py-1 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                statusFilter === "open"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Open</span>
              <span className="text-[10px] font-mono px-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                {openCount}
              </span>
            </button>
            <button
              onClick={() => onStatusFilterChange("done")}
              className={`py-1 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                statusFilter === "done"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Check className="size-3" />
              <span>Resolved</span>
              <span className="text-[10px] font-mono px-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {doneCount}
              </span>
            </button>
            <button
              onClick={() => onStatusFilterChange("all")}
              className={`py-1 rounded-lg transition-colors ${
                statusFilter === "all"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>All Threads</span>
            </button>
          </div>
        )}

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

        {/* BrightBean Label Quick Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
          <button
            onClick={() => setActiveLabel(null)}
            className={`px-2 py-0.5 rounded-full font-semibold border transition-colors shrink-0 ${
              activeLabel === null
                ? "bg-foreground text-background border-foreground font-bold"
                : "border-border text-muted-foreground hover:text-foreground bg-muted/20"
            }`}
          >
            All Tags
          </button>
          {BRIGHTBEAN_LABELS.map((lbl) => {
            const isSelected = activeLabel === lbl.name;
            return (
              <button
                key={lbl.name}
                onClick={() => setActiveLabel(isSelected ? null : lbl.name)}
                className={`px-2 py-0.5 rounded-full font-semibold border transition-colors shrink-0 ${
                  isSelected
                    ? `${lbl.bg} ${lbl.color} ${lbl.border} font-bold ring-1 ring-primary/40`
                    : "border-border text-muted-foreground hover:text-foreground bg-muted/10"
                }`}
              >
                {lbl.name}
              </button>
            );
          })}
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
                No active {statusFilter !== "all" ? statusFilter : ""} messages matching your filter. Click below to start an outbound chat.
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
            const labels = conv.labels || [];
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

                  {/* BrightBean Labels & Takeover Badges */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    {/* Automation vs Takeover Pill */}
                    {conv.automationPaused ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <UserCheck className="size-2.5" />
                        <span>Takeover</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <Bot className="size-2.5" />
                        <span>Bot</span>
                      </span>
                    )}

                    {/* Linked Chit Scheme */}
                    {conv.linkedSchemeName && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 truncate">
                        {conv.linkedSchemeName}
                      </span>
                    )}

                    {/* BrightBean Tags */}
                    {labels.slice(0, 2).map((lbl) => (
                      <span
                        key={lbl}
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-border"
                      >
                        {lbl}
                      </span>
                    ))}
                    {labels.length > 2 && (
                      <span className="text-[9px] font-mono text-muted-foreground">
                        +{labels.length - 2}
                      </span>
                    )}
                  </div>
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
