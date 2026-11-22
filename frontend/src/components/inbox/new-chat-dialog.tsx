"use client";

import * as React from "react";
import { X, Send, User, MessageSquare, Users, AlertCircle, RefreshCw } from "lucide-react";
import { PlatformIcon, PLATFORM_LABELS } from "./platform-icon";
import { CHIT_QUICK_TEMPLATES } from "./types";
import type { Platform, Conversation, SocialChannelIntegration } from "./types";
import { api, type Member } from "@/lib/api";

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channels: SocialChannelIntegration[];
  onStartChat: (newConv: Partial<Conversation>, initialText: string) => void;
}

export function NewChatDialog({
  open,
  onOpenChange,
  channels,
  onStartChat,
}: NewChatDialogProps) {
  const [selectedPlatform, setSelectedPlatform] = React.useState<Platform>("whatsapp");
  const [recipientName, setRecipientName] = React.useState("");
  const [recipientHandle, setRecipientHandle] = React.useState("");
  const [messageText, setMessageText] = React.useState("");
  const [selectedTemplate, setSelectedTemplate] = React.useState("");
  const [linkedSubscriberId, setLinkedSubscriberId] = React.useState<number | undefined>(undefined);

  // Real Database Members
  const [members, setMembers] = React.useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = React.useState(false);
  const [selectedMemberOption, setSelectedMemberOption] = React.useState<string>("manual");

  React.useEffect(() => {
    if (open) {
      setLoadingMembers(true);
      api
        .getMembers()
        .then((data) => {
          setMembers(data || []);
        })
        .catch(() => {
          setMembers([]);
        })
        .finally(() => setLoadingMembers(false));
    }
  }, [open]);

  if (!open) return null;

  const handleSelectMember = (val: string) => {
    setSelectedMemberOption(val);
    if (val === "manual") {
      setRecipientName("");
      setRecipientHandle("");
      setLinkedSubscriberId(undefined);
    } else {
      const memberId = parseInt(val, 10);
      const found = members.find((m) => m.id === memberId);
      if (found) {
        setRecipientName(found.name);
        setRecipientHandle(found.phone);
        setLinkedSubscriberId(found.id);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !recipientHandle.trim() || !messageText.trim()) {
      alert("Please enter recipient name, handle/phone, and a message.");
      return;
    }

    const matchedAccount = channels.find((c) => c.platform === selectedPlatform);

    const newConv: Partial<Conversation> = {
      id: `conv-${selectedPlatform}-${Date.now()}`,
      accountId: matchedAccount?.id || `ch-${selectedPlatform}`,
      platform: selectedPlatform,
      participantId: `${selectedPlatform}-${Date.now()}`,
      participantName: recipientName.trim(),
      participantHandle: recipientHandle.trim(),
      lastMessage: messageText.trim(),
      updatedTime: "Just now",
      unreadCount: 0,
      linkedSubscriberId: linkedSubscriberId,
      linkedSubscriberName: recipientName.trim(),
      linkedSchemeName: "Subscriber Direct",
    };

    onStartChat(newConv, messageText.trim());
    onOpenChange(false);
    setRecipientName("");
    setRecipientHandle("");
    setMessageText("");
    setSelectedMemberOption("manual");
    setLinkedSubscriberId(undefined);
  };

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplate(id);
    const found = CHIT_QUICK_TEMPLATES.find((t) => t.id === id);
    if (found) {
      setMessageText(
        found.content
          .replace("{name}", recipientName || "Subscriber")
          .replace("{plan}", "Active ROSCA Scheme")
          .replace("{date}", "25th of this month")
          .replace("{amount}", "5,000")
          .replace("{month}", "1")
          .replace("{id}", "001")
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <MessageSquare className="size-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Start Outbound Conversation
              </h3>
              <p className="text-xs text-muted-foreground">
                Send a real direct social message or chit fund notice to a customer.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Platform Selector */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Select Social Platform *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(["whatsapp", "instagram", "telegram", "facebook", "twitter"] as Platform[]).map(
                (plat) => {
                  const isSelected = selectedPlatform === plat;
                  return (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setSelectedPlatform(plat)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 text-foreground font-semibold ring-1 ring-primary"
                          : "border-border bg-muted/20 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <PlatformIcon platform={plat} className="size-5 mb-1" />
                      <span className="text-[10px] truncate max-w-full">
                        {PLATFORM_LABELS[plat]}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Database Member Select */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Select Registered Customer (Database)
            </label>
            {loadingMembers ? (
              <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                <RefreshCw className="size-3.5 animate-spin" />
                <span>Loading real members from database...</span>
              </div>
            ) : members.length > 0 ? (
              <select
                value={selectedMemberOption}
                onChange={(e) => handleSelectMember(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="manual">Manual Entry / Custom Recipient</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id.toString()}>
                    {m.name} ({m.phone}) - {m.status}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-2.5 rounded-lg border border-border bg-muted/20 text-xs text-muted-foreground flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0 text-amber-500" />
                <span>
                  0 registered customers in database. Enter details manually below or register members in Customers.
                </span>
              </div>
            )}
          </div>

          {/* Recipient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Recipient / Customer Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Real Subscriber Name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                {selectedPlatform === "whatsapp"
                  ? "Phone Number (with Country Code) *"
                  : "Username / Handle *"}
              </label>
              <input
                type="text"
                placeholder={
                  selectedPlatform === "whatsapp" ? "+91 98765 00000" : "@handle"
                }
                value={recipientHandle}
                onChange={(e) => setRecipientHandle(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

          {/* Quick Chit Fund Template */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Insert Chit Notice Template (Optional)
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Write custom message...</option>
              {CHIT_QUICK_TEMPLATES.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.title}
                </option>
              ))}
            </select>
          </div>

          {/* Message Text */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Message Content *
            </label>
            <textarea
              rows={4}
              placeholder="Type your message to the subscriber..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full text-xs p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              required
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 border border-border rounded-xl text-xs font-medium text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Send className="size-3.5" />
              <span>Send Outbound DM</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default NewChatDialog;
