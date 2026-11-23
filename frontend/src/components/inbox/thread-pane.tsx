"use client";

import * as React from "react";
import {
  Send,
  Paperclip,
  Smile,
  Phone,
  FileText,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Download,
  Receipt,
  User,
  CreditCard,
  MessageSquare,
  Bot,
  UserCheck,
  Tag,
  AlertTriangle,
  ChevronDown,
  Building2,
  Calendar,
  X,
  Plus,
  Save,
} from "lucide-react";
import { PlatformIcon, PLATFORM_LABELS } from "./platform-icon";
import { CHIT_QUICK_TEMPLATES, BRIGHTBEAN_LABELS } from "./types";
import type { Conversation, Message, Platform, Attachment } from "./types";

interface ThreadPaneProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (text: string, attachment?: Attachment) => void;
  onReactMessage: (messageId: string, emoji: string) => void;
  onOpenConnect: () => void;
  onPatchConversation?: (convId: string, patch: Partial<Conversation>) => void;
}

export function ThreadPane({
  conversation,
  messages,
  onSendMessage,
  onReactMessage,
  onOpenConnect,
  onPatchConversation,
}: ThreadPaneProps) {
  const [inputText, setInputText] = React.useState("");
  const [showTemplates, setShowTemplates] = React.useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = React.useState(false);
  const [showLabelMenu, setShowLabelMenu] = React.useState(false);
  const [showAssigneeMenu, setShowAssigneeMenu] = React.useState(false);
  const [internalNotesText, setInternalNotesText] = React.useState("");
  const [isSavingNotes, setIsSavingNotes] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  React.useEffect(() => {
    if (conversation) {
      setInternalNotesText(conversation.internalNotes || "");
    }
  }, [conversation?.id, conversation?.internalNotes]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-muted/10 h-full">
        <div className="flex items-center gap-2 mb-4 p-2.5 rounded-2xl bg-card border border-border shadow-xs">
          <PlatformIcon platform="whatsapp" showBadge className="size-8" />
          <PlatformIcon platform="instagram" showBadge className="size-8" />
          <PlatformIcon platform="telegram" showBadge className="size-8" />
          <PlatformIcon platform="facebook" showBadge className="size-8" />
          <PlatformIcon platform="twitter" showBadge className="size-8" />
        </div>
        <h3 className="text-base font-bold text-foreground">
          BrightBean Shared Inbox
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Select a conversation from WhatsApp, Instagram, Telegram, Messenger, or X to manage chats, pause automation, assign operators, and dispatch chit receipts.
        </p>
        <button
          onClick={onOpenConnect}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          <div className="flex items-center -space-x-1">
            <PlatformIcon platform="whatsapp" className="size-3.5" />
            <PlatformIcon platform="instagram" className="size-3.5" />
            <PlatformIcon platform="telegram" className="size-3.5" />
          </div>
          <span>Manage Social Media Integrations</span>
        </button>
      </div>
    );
  }

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
    setShowTemplates(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInsertTemplate = (templateContent: string) => {
    const populated = templateContent
      .replace("{name}", conversation.participantName)
      .replace("{plan}", conversation.linkedSchemeName || "Active Chit Scheme")
      .replace("{date}", "25th of this month")
      .replace("{amount}", "5,000")
      .replace("{dividend}", "750")
      .replace("{net}", "4,250")
      .replace("{upi_link}", `http://localhost:3000/pay?id=${conversation.participantId}`);

    setInputText(populated);
    setShowTemplates(false);
  };

  const handleSendReceiptAttachment = () => {
    const receiptAttachment: Attachment = {
      id: `att-${Date.now()}`,
      type: "receipt",
      name: `Chit_Receipt_${conversation.linkedTicketNo || "01"}.pdf`,
      url: "#",
      size: "142 KB",
    };
    onSendMessage(
      `Official Chit Fund Receipt generated for ticket #${conversation.linkedTicketNo || "01"} in ${conversation.linkedSchemeName || "Chit Scheme"}. Verified & recorded.`,
      receiptAttachment
    );
  };

  // BrightBean Human Takeover Switch
  const handleToggleTakeover = () => {
    if (!onPatchConversation) return;
    const newState = !conversation.automationPaused;
    onPatchConversation(conversation.id, { automationPaused: newState });
  };

  // BrightBean Resolve Thread (Open <-> Done)
  const handleToggleResolved = () => {
    if (!onPatchConversation) return;
    const newStatus = (conversation.status || "open") === "open" ? "done" : "open";
    onPatchConversation(conversation.id, { status: newStatus });
  };

  // BrightBean Assignee
  const handleSelectAssignee = (operatorName: string) => {
    if (!onPatchConversation) return;
    onPatchConversation(conversation.id, { assignedTo: operatorName });
    setShowAssigneeMenu(false);
  };

  // BrightBean Labels Add/Remove
  const handleToggleLabel = (labelName: string) => {
    if (!onPatchConversation) return;
    const currentLabels = conversation.labels || [];
    const nextLabels = currentLabels.includes(labelName)
      ? currentLabels.filter((l) => l !== labelName)
      : [...currentLabels, labelName];
    onPatchConversation(conversation.id, { labels: nextLabels });
  };

  // Save Internal Notes Memo
  const handleSaveNotes = () => {
    if (!onPatchConversation) return;
    setIsSavingNotes(true);
    onPatchConversation(conversation.id, { internalNotes: internalNotesText });
    setTimeout(() => setIsSavingNotes(false), 500);
  };

  const isWindowActive = conversation.isWindowActive !== false;
  const conversationLabels = conversation.labels || [];
  const isResolved = conversation.status === "done";

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">
      {/* Thread Header with BrightBean Shared Inbox Controls */}
      <div className="p-3.5 border-b border-border bg-card flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {conversation.participantAvatar ? (
              <img
                src={conversation.participantAvatar}
                alt={conversation.participantName}
                className="size-10 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-border">
                {conversation.participantName.charAt(0)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1">
              <PlatformIcon platform={conversation.platform} showBadge className="size-4" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-foreground truncate">
                {conversation.participantName}
              </h3>
              {conversation.participantVerified && (
                <ShieldCheck className="size-3.5 text-sky-500 shrink-0" />
              )}
              {isResolved && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Resolved
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 font-mono">
              <span>{conversation.participantHandle}</span>
              <span>·</span>
              <span className="capitalize">{PLATFORM_LABELS[conversation.platform]}</span>
            </div>
          </div>
        </div>

        {/* Action Controls: BrightBean Takeover Switch, Labels, Assignee, Profile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* BrightBean Human Takeover Switch */}
          <button
            type="button"
            onClick={handleToggleTakeover}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              conversation.automationPaused
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 ring-1 ring-amber-500/20"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
            }`}
            title="When active, bot automation is paused and operators handle replies directly."
          >
            {conversation.automationPaused ? (
              <>
                <UserCheck className="size-3.5" />
                <span className="hidden sm:inline">Human Takeover</span>
              </>
            ) : (
              <>
                <Bot className="size-3.5" />
                <span className="hidden sm:inline">Bot Active</span>
              </>
            )}
          </button>

          {/* Resolve / Re-open Thread */}
          <button
            type="button"
            onClick={handleToggleResolved}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              isResolved
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
            title={isResolved ? "Reopen conversation" : "Mark as resolved"}
          >
            <Check className="size-3.5" />
            <span className="hidden md:inline">{isResolved ? "Reopen" : "Resolve"}</span>
          </button>

          {/* Labels Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLabelMenu(!showLabelMenu)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Tag className="size-3.5 text-indigo-500" />
              <span className="hidden lg:inline">Tags ({conversationLabels.length})</span>
            </button>

            {/* Labels Popover */}
            {showLabelMenu && (
              <div className="absolute right-0 mt-1 w-56 p-2 rounded-xl border border-border bg-card shadow-lg z-30 space-y-1 text-xs animate-in fade-in-50">
                <div className="flex items-center justify-between pb-1 border-b border-border text-[11px] font-bold text-muted-foreground">
                  <span>Manage Labels</span>
                  <button onClick={() => setShowLabelMenu(false)} className="hover:text-foreground">
                    <X className="size-3" />
                  </button>
                </div>
                {BRIGHTBEAN_LABELS.map((lbl) => {
                  const has = conversationLabels.includes(lbl.name);
                  return (
                    <button
                      key={lbl.name}
                      type="button"
                      onClick={() => handleToggleLabel(lbl.name)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-colors ${
                        has ? `${lbl.bg} ${lbl.color} font-bold` : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className={`size-2 rounded-full ${lbl.color.replace("text-", "bg-")}`} />
                        <span>{lbl.name}</span>
                      </span>
                      {has && <Check className="size-3" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Assignee Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAssigneeMenu(!showAssigneeMenu)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <User className="size-3.5 text-sky-500" />
              <span className="hidden lg:inline">{conversation.assignedTo || "Assign"}</span>
              <ChevronDown className="size-3" />
            </button>

            {showAssigneeMenu && (
              <div className="absolute right-0 mt-1 w-48 p-1.5 rounded-xl border border-border bg-card shadow-lg z-30 space-y-1 text-xs animate-in fade-in-50">
                <p className="px-2 py-1 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Assign Operator
                </p>
                {["Foreperson Admin", "Collections Officer", "Support Agent", "Unassigned"].map((op) => (
                  <button
                    key={op}
                    type="button"
                    onClick={() => handleSelectAssignee(op)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      conversation.assignedTo === op
                        ? "bg-primary text-primary-foreground font-bold"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Toggle Subscriber Profile & Notes Drawer */}
          <button
            type="button"
            onClick={() => setShowProfileDrawer(!showProfileDrawer)}
            className={`p-2 rounded-xl border transition-colors ${
              showProfileDrawer
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
            title="Subscriber Details & Internal Notes"
          >
            <User className="size-4" />
          </button>
        </div>
      </div>

      {/* BrightBean 24-Hour Messaging Window Compliance Banner */}
      {["whatsapp", "instagram", "facebook"].includes(conversation.platform) && (
        <div
          className={`px-4 py-1.5 text-xs flex items-center justify-between border-b ${
            isWindowActive
              ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20"
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="size-3.5" />
            <span className="font-semibold text-[11px]">
              {isWindowActive
                ? "Meta & WhatsApp 24-Hour Compliance Window: Active (Inbound reply received)"
                : "24-Hour Window Closed: Outside-window messages must use pre-approved Chit Notification Templates"}
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase opacity-80">
            {PLATFORM_LABELS[conversation.platform]}
          </span>
        </div>
      )}

      {/* Main Content Area (Messages + Optional Profile Drawer) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages Thread Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-muted/5">
          {messages.length === 0 ? (
            <div className="p-8 text-center space-y-2 max-w-sm mx-auto my-auto text-muted-foreground">
              <MessageSquare className="size-8 mx-auto opacity-40" />
              <p className="text-xs font-bold text-foreground">Empty Conversation Thread</p>
              <p className="text-[11px]">
                No messages recorded in database yet. Type a message below or insert a chit fund template to begin.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOutgoing = msg.direction === "outgoing";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col group ${isOutgoing ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-xs space-y-1.5 ${
                      isOutgoing
                        ? "bg-primary text-primary-foreground rounded-tr-xs"
                        : "bg-card border border-border text-foreground rounded-tl-xs"
                    }`}
                  >
                    <p className="text-xs whitespace-pre-wrap leading-relaxed">{msg.message}</p>

                    {/* PDF Receipt Card if attached */}
                    {msg.attachments?.map((att) => (
                      <div
                        key={att.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                          isOutgoing
                            ? "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground"
                            : "bg-muted/40 border-border text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Receipt className="size-4 shrink-0 text-emerald-400" />
                          <div className="truncate">
                            <p className="font-bold text-[11px] truncate">{att.name}</p>
                            <span className="text-[9px] opacity-80">{att.size}</span>
                          </div>
                        </div>
                        <a
                          href="#"
                          className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
                          title="Download Receipt"
                        >
                          <Download className="size-3.5" />
                        </a>
                      </div>
                    ))}

                    <div
                      className={`flex items-center justify-end gap-1.5 text-[10px] ${
                        isOutgoing ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      <span>{msg.createdAt}</span>
                      {isOutgoing && (
                        <span>
                          {msg.deliveryStatus === "read" ? (
                            <CheckCheck className="size-3 text-sky-300" />
                          ) : (
                            <Check className="size-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Reactions Bar on Hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 px-1">
                    <button
                      onClick={() => onReactMessage(msg.id, "👍")}
                      className="text-[11px] hover:scale-125 transition-transform px-1"
                      title="React Thumbs Up"
                    >
                      👍
                    </button>
                    <button
                      onClick={() => onReactMessage(msg.id, "❤️")}
                      className="text-[11px] hover:scale-125 transition-transform px-1"
                      title="React Heart"
                    >
                      ❤️
                    </button>
                    <button
                      onClick={() => onReactMessage(msg.id, "🙏")}
                      className="text-[11px] hover:scale-125 transition-transform px-1"
                      title="React Thanks"
                    >
                      🙏
                    </button>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* BrightBean Contact & Subscriber Details Drawer */}
        {showProfileDrawer && (
          <div className="w-80 border-l border-border bg-card p-4 space-y-4 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-primary" />
                <span>Subscriber Profile</span>
              </h4>
              <button
                onClick={() => setShowProfileDrawer(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Subscriber Info Card */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground block font-semibold">Subscriber Name</span>
                <p className="font-bold text-foreground text-sm">{conversation.participantName}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{conversation.participantHandle}</p>
              </div>

              {conversation.linkedSchemeName && (
                <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-foreground">{conversation.linkedSchemeName}</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      Ticket #{conversation.linkedTicketNo || "01"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
                    <span className="text-muted-foreground">Pending Due:</span>
                    <span className="font-black text-rose-600 dark:text-rose-400">
                      ₹{(conversation.dueAmount || 4250).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              )}

              {/* Active Labels Chips */}
              <div>
                <span className="text-[10px] text-muted-foreground block font-semibold mb-1">Assigned Tags</span>
                <div className="flex flex-wrap gap-1">
                  {conversationLabels.length === 0 ? (
                    <span className="text-[11px] text-muted-foreground italic">No labels applied</span>
                  ) : (
                    conversationLabels.map((lbl) => (
                      <span
                        key={lbl}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1"
                      >
                        <span>{lbl}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleLabel(lbl)}
                          className="hover:text-rose-500"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Internal Notes / Staff Memo */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                    Internal Operator Notes
                  </span>
                  <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold">Staff Only</span>
                </div>
                <textarea
                  rows={3}
                  value={internalNotesText}
                  onChange={(e) => setInternalNotesText(e.target.value)}
                  placeholder="Record private subscriber remarks, follow-up notes, or auction discount agreements..."
                  className="w-full text-xs p-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="w-full py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Save className="size-3 text-primary" />
                  <span>{isSavingNotes ? "Saving..." : "Save Private Memo"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Composer Section */}
      <div className="p-4 border-t border-border bg-card space-y-2 shrink-0">
        {/* Quick Templates Drawer */}
        {showTemplates && (
          <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-indigo-500" />
                <span>Chit Fund Quick Response Templates</span>
              </span>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-[11px] text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CHIT_QUICK_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleInsertTemplate(tmpl.content)}
                  className="p-2.5 rounded-lg border border-border bg-card text-left text-xs hover:border-primary transition-colors"
                >
                  <p className="font-bold text-foreground text-[11px]">{tmpl.title}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                    {tmpl.content}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSend} className="space-y-2">
          <div className="relative rounded-xl border border-border bg-background focus-within:ring-1 focus-within:ring-primary overflow-hidden">
            <textarea
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${conversation.participantName} on ${PLATFORM_LABELS[conversation.platform]}... (Press Enter to send)`}
              className="w-full text-xs p-3 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
            />

            <div className="flex items-center justify-between px-3 py-2 border-t border-border/50 bg-muted/10">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors"
                >
                  <Sparkles className="size-3 text-indigo-500" />
                  <span>Insert Template</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendReceiptAttachment}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors"
                  title="Dispatch Official PDF Receipt"
                >
                  <Receipt className="size-3 text-emerald-500" />
                  <span className="hidden sm:inline">Attach Receipt</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">
                  Enter ↵ to send
                </span>
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-2xs transition-colors disabled:opacity-40"
                >
                  <Send className="size-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
export default ThreadPane;
