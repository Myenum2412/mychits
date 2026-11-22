"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  X,
  Send,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Link2,
  User,
  Clock,
  Smartphone,
  Mail,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  SvglWhatsapp,
  SvglUpi,
  SvglGmail,
  SvglGooglePay,
  SvglPhonePe,
  SvglPaytm,
} from "@/components/ui/svgl-icons";
import { api, type Member, type ChitGroup } from "@/lib/api";

interface SendInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMember?: Member | null;
  defaultGroup?: ChitGroup | null;
  defaultAmount?: number;
  defaultInstallment?: number;
}

export function SendInviteDialog({
  open,
  onOpenChange,
  defaultMember,
  defaultGroup,
  defaultAmount,
  defaultInstallment = 1,
}: SendInviteDialogProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [groups, setGroups] = useState<ChitGroup[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedMemberId, setSelectedMemberId] = useState<number | "">("");
  const [selectedGroupId, setSelectedGroupId] = useState<number | "">("");
  const [installmentNumber, setInstallmentNumber] = useState<number>(defaultInstallment);
  const [amount, setAmount] = useState<number>(defaultAmount || 5000);
  const [dueDate, setDueDate] = useState<string>("");

  const [customNote, setCustomNote] = useState<string>("Monthly Chit Auction Installment");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);
  const [whatsappResult, setWhatsappResult] = useState<string | null>(null);

  // Set default due date to 10 days from today
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    setDueDate(d.toISOString().split("T")[0]);
  }, []);

  // Load members and groups when modal opens
  useEffect(() => {
    if (!open) {
      setWhatsappResult(null);
      setCopiedLink(false);
      setCopiedMessage(false);
      return;
    }

    setLoading(true);
    Promise.all([api.getMembers(), api.getGroups()])
      .then(([mems, grps]) => {
        setMembers(mems);
        setGroups(grps);

        if (defaultMember) {
          setSelectedMemberId(defaultMember.id);
        } else if (mems.length > 0 && !selectedMemberId) {
          setSelectedMemberId(mems[0].id);
        }

        if (defaultGroup) {
          setSelectedGroupId(defaultGroup.id);
          setAmount(defaultAmount || defaultGroup.monthly_installment);
        } else if (grps.length > 0 && !selectedGroupId) {
          setSelectedGroupId(grps[0].id);
          setAmount(defaultAmount || grps[0].monthly_installment);
        }
      })
      .catch((err) => {
        console.error("Failed to load members or groups for invite:", err);
      })
      .finally(() => setLoading(false));
  }, [open, defaultMember, defaultGroup, defaultAmount]);

  // When group changes, update suggested amount
  const handleGroupChange = (grpId: number) => {
    setSelectedGroupId(grpId);
    const grp = groups.find((g) => g.id === grpId);
    if (grp) {
      setAmount(grp.monthly_installment);
    }
  };

  const currentMember = members.find((m) => m.id === Number(selectedMemberId)) || defaultMember;
  const currentGroup = groups.find((g) => g.id === Number(selectedGroupId)) || defaultGroup;

  // Build the public customer payment URL
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const inviteUrl = `${origin}/pay?member_id=${selectedMemberId || ""}&group_id=${
    selectedGroupId || ""
  }&amount=${amount}&installment=${installmentNumber}&due_date=${encodeURIComponent(dueDate)}`;

  // Formatted WhatsApp / SMS message text
  const messageBody = `Namaste ${currentMember?.name || "Subscriber"},

Your monthly chit installment for ${currentGroup?.group_name || "Chit Scheme"} (Installment #${installmentNumber}) of ₹${amount.toLocaleString(
    "en-IN"
  )} is due${dueDate ? ` on ${dueDate}` : ""}.

👉 Click here to pay securely via Google Pay, PhonePe, Paytm, or Dynamic UPI QR Code:
${inviteUrl}

Once paid, your official digital receipt will be instantly generated.
Thank you,
Apex Chits & Finance Ltd (Tamil Nadu Chit Funds Act, 1982)`;

  // Copy link handler
  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Copy message handler
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageBody);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  // Dispatch via WhatsApp Web (wwebjs.dev API + direct wa.me fallback)
  const handleSendWhatsApp = async () => {
    if (!currentMember?.phone) {
      alert("Selected customer does not have a valid phone number.");
      return;
    }

    setSendingWhatsapp(true);
    setWhatsappResult(null);

    const cleanPhone = currentMember.phone.replace(/[^0-9]/g, "");

    try {
      // 1. Try sending directly through WhatsApp Web client API
      await api.sendWhatsAppMessage("admin", cleanPhone, messageBody);
      setWhatsappResult("Invite message dispatched directly via WhatsApp Web API!");
    } catch {
      // 2. Open wa.me link directly as seamless browser fallback
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageBody)}`;
      window.open(waUrl, "_blank");
      setWhatsappResult("Opened WhatsApp chat with pre-filled payment invite link!");
    } finally {
      setSendingWhatsapp(false);
    }
  };

  // Send via SMS
  const handleSendSMS = () => {
    if (!currentMember?.phone) return;
    const cleanPhone = currentMember.phone.replace(/[^0-9]/g, "");
    window.open(`sms:${cleanPhone}?body=${encodeURIComponent(messageBody)}`, "_blank");
  };

  // Send via Email
  const handleSendEmail = () => {
    if (!currentMember?.email) {
      alert("Selected customer does not have an email address recorded.");
      return;
    }
    const subject = `Chit Fund Installment Payment Invite: ${currentGroup?.group_name || "Scheme"} (₹${amount})`;
    window.open(
      `mailto:${currentMember.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        messageBody
      )}`,
      "_blank"
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Send Payment Invite Link
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Generate a secure, personalized customer checkout link with UPI deep links & dynamic QR
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {whatsappResult && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{whatsappResult}</span>
            </div>
          )}

          {/* Form Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-indigo-500" />
                <span>Select Subscriber / Customer</span>
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(Number(e.target.value))}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Chit Scheme Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-500" />
                <span>Select Chit Scheme</span>
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => handleGroupChange(Number(e.target.value))}
                className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.group_name} (₹{g.monthly_installment.toLocaleString("en-IN")}/mo)
                  </option>
                ))}
              </select>
            </div>

            {/* Installment Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <span>Installment Number</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={installmentNumber}
                onChange={(e) => setInstallmentNumber(Math.max(1, Number(e.target.value)))}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Amount to Pay */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">₹</span>
                <span>Amount to Pay</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full text-xs pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <span>Payment Due Date</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Note / Purpose */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
                <span>Remarks / Note</span>
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="e.g. Monthly Chit Auction Installment"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Generated Shareable Link Card */}
          <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5" />
                <span>Customer Pay Invite URL</span>
              </span>
              <a
                href={inviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span>Test Customer View</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/80 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 dark:text-slate-300 truncate">
                {inviteUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
          </div>

          {/* Live Message Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                <span>Message Preview (Dispatched to Customer)</span>
              </label>
              <button
                onClick={handleCopyMessage}
                className="text-[11px] text-muted-foreground hover:text-slate-900 dark:hover:text-slate-200 inline-flex items-center gap-1"
              >
                {copiedMessage ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                <span>{copiedMessage ? "Message Copied" : "Copy Full Text"}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
              {messageBody}
            </div>
          </div>

          {/* Quick Channels Grid */}
          <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              Direct Dispatch Channels
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* WhatsApp Button */}
              <button
                onClick={handleSendWhatsApp}
                disabled={sendingWhatsapp || !currentMember?.phone}
                className="flex items-center justify-center gap-2 p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                <SvglWhatsapp size={16} />
                <span>{sendingWhatsapp ? "Sending..." : "WhatsApp"}</span>
              </button>

              {/* SMS Button */}
              <button
                onClick={handleSendSMS}
                disabled={!currentMember?.phone}
                className="flex items-center justify-center gap-2 p-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                <Smartphone className="h-4 w-4" />
                <span>Send SMS</span>
              </button>

              {/* Email Button */}
              <button
                onClick={handleSendEmail}
                disabled={!currentMember?.email}
                className="flex items-center justify-center gap-2 p-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                <SvglGmail size={16} />
                <span>Send Email</span>
              </button>

              {/* Copy Full Link */}
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 p-2.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold rounded-xl transition-colors"
              >
                {copiedLink ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                <span>{copiedLink ? "Copied" : "Copy Link"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Customer opens link without login to pay instantly</span>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
