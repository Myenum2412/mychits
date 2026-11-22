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
} from "lucide-react";
import { PlatformIcon, PLATFORM_LABELS } from "./platform-icon";
import { CHIT_QUICK_TEMPLATES } from "./types";
import type { Conversation, Message, Platform, Attachment } from "./types";

interface ThreadPaneProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (text: string, attachment?: Attachment) => void;
  onReactMessage: (messageId: string, emoji: string) => void;
  onOpenConnect: () => void;
}

export function ThreadPane({
  conversation,
  messages,
  onSendMessage,
  onReactMessage,
  onOpenConnect,
}: ThreadPaneProps) {
  const [inputText, setInputText] = React.useState("");
  const [showTemplates, setShowTemplates] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
          Unified Social Media Inbox
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1">
          Select a conversation from WhatsApp, Instagram, Telegram, Messenger, or X to view messages and dispatch chit statements.
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
      .replace("{month}", "4")
      .replace("{id}", "00482");

    setInputText(populated);
    setShowTemplates(false);
  };

  const handleSendReceiptAttachment = () => {
    const sampleAttachment: Attachment = {
      id: `att-${Date.now()}`,
      type: "receipt",
      name: `Chit_Receipt_${conversation.participantName.replace(/\s+/g, "_")}.pdf`,
      size: "240 KB",
      url: "#",
    };
    onSendMessage(
      `Official Chit Fund Receipt attached for ${conversation.participantName} (${conversation.linkedSchemeName || "Chit Scheme"}).`,
      sampleAttachment
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Thread Header */}
      <div className="px-6 py-3.5 border-b border-border bg-card flex items-center justify-between gap-4 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {conversation.participantAvatar ? (
              <img
                src={conversation.participantAvatar}
                alt={conversation.participantName}
                className="size-10 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="size-10 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20">
                {conversation.participantName.charAt(0)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1">
              <PlatformIcon platform={conversation.platform} showBadge className="size-4" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground truncate">
                {conversation.participantName}
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                <PlatformIcon platform={conversation.platform} className="size-3" />
                <span>{PLATFORM_LABELS[conversation.platform]}</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono truncate">
              {conversation.participantHandle}
            </p>
          </div>
        </div>

        {/* Linked Chit Fund Subscriber Status Badge & Actions */}
        <div className="flex items-center gap-2.5">
          {conversation.linkedSchemeName && (
            <div className="hidden sm:flex flex-col text-right px-3 py-1 rounded-lg border border-border bg-muted/30">
              <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">
                Linked ROSCA Plan
              </span>
              <span className="text-xs font-semibold text-foreground truncate max-w-44">
                {conversation.linkedSchemeName}
              </span>
            </div>
          )}

          <button
            onClick={() =>
              alert(`Calling subscriber ${conversation.participantName} via ${PLATFORM_LABELS[conversation.platform]}...`)
            }
            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Dial Social Voice Call"
          >
            <Phone className="size-4" />
          </button>

          <button
            onClick={onOpenConnect}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <span>Connected Channels</span>
            <ExternalLink className="size-3 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Message Feed Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">No messages in this conversation yet</p>
            <p className="text-[11px] text-muted-foreground/80 max-w-xs">
              Type a message below or insert a chit fund reminder template to start chatting.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
          const isOutgoing = msg.direction === "outgoing";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isOutgoing ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-lg md:max-w-xl rounded-2xl p-4 space-y-2 shadow-2xs text-xs ${
                  isOutgoing
                    ? "bg-primary text-primary-foreground rounded-tr-xs"
                    : "bg-card text-foreground border border-border rounded-tl-xs"
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] opacity-75">
                  <span className="font-semibold">{msg.senderName}</span>
                  <span>{msg.createdAt}</span>
                </div>

                <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>

                {/* Attachment Card */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {msg.attachments.map((att) => (
                      <div
                        key={att.id}
                        className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border ${
                          isOutgoing
                            ? "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground"
                            : "bg-muted/40 border-border text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Receipt className="size-4 shrink-0 text-emerald-500" />
                          <div className="truncate">
                            <p className="text-xs font-semibold truncate">{att.name}</p>
                            {att.size && (
                              <p className="text-[10px] opacity-75">{att.size}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => alert(`Downloading attachment: ${att.name}`)}
                          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                          title="Download Statement PDF"
                        >
                          <Download className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom Status & Delivery Ticks */}
                <div className="flex items-center justify-end gap-1.5 text-[10px] pt-0.5">
                  {isOutgoing && (
                    <span className="flex items-center gap-0.5">
                      {msg.deliveryStatus === "read" ? (
                        <span title="Read (Blue Ticks)">
                          <CheckCheck className="size-3.5 text-sky-400" />
                        </span>
                      ) : msg.deliveryStatus === "delivered" ? (
                        <span title="Delivered">
                          <CheckCheck className="size-3.5 opacity-70" />
                        </span>
                      ) : (
                        <span title="Sent">
                          <Check className="size-3.5 opacity-70" />
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Reaction Bar */}
              <div className="flex items-center gap-1 mt-1 px-1">
                {msg.reactions?.map((r, i) => (
                  <span
                    key={i}
                    onClick={() => onReactMessage(msg.id, r.emoji)}
                    className="cursor-pointer inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-border bg-card text-[11px] hover:scale-110 transition-transform shadow-2xs"
                  >
                    <span>{r.emoji}</span>
                    <span className="text-[9px] font-semibold text-muted-foreground">{r.count}</span>
                  </span>
                ))}
                <button
                  onClick={() => onReactMessage(msg.id, "👍")}
                  className="text-[11px] text-muted-foreground hover:scale-125 transition-transform px-1"
                  title="React Thumbs Up"
                >
                  👍
                </button>
                <button
                  onClick={() => onReactMessage(msg.id, "❤️")}
                  className="text-[11px] text-muted-foreground hover:scale-125 transition-transform px-1"
                  title="React Heart"
                >
                  ❤️
                </button>
                <button
                  onClick={() => onReactMessage(msg.id, "🙏")}
                  className="text-[11px] text-muted-foreground hover:scale-125 transition-transform px-1"
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

      {/* Composer Section */}
      <div className="p-4 border-t border-border bg-card space-y-2 shrink-0">
        {/* Quick Templates Drawer / Menu */}
        {showTemplates && (
          <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-indigo-500" />
                <span>Chit Fund Quick Notice Templates</span>
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
