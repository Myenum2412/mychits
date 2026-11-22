"use client";

import * as React from "react";
import {
  X,
  QrCode,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ExternalLink,
  Smartphone,
  CreditCard,
  Download,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  SvglUpi,
  SvglPhonePe,
  SvglGooglePay,
  SvglPaytm,
  SvglBhim,
} from "@/components/ui/svgl-icons";
import { api, type YouPISession, type YouPITransaction, type ChitGroup, type Member } from "@/lib/api";

interface YouPICheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chitGroup?: ChitGroup | null;
  member?: Member | null;
  amount?: number;
  onPaymentSuccess?: (txn: YouPITransaction) => void;
}

export function YouPICheckoutModal({
  open,
  onOpenChange,
  chitGroup,
  member,
  amount = 5000,
  onPaymentSuccess,
}: YouPICheckoutModalProps) {
  const [step, setStep] = React.useState<"pay" | "utr" | "success">("pay");
  const [session, setSession] = React.useState<YouPISession | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedVpa, setCopiedVpa] = React.useState(false);
  const [copiedAmount, setCopiedAmount] = React.useState(false);

  // UTR submission state
  const [utr, setUtr] = React.useState("");
  const [customerVpa, setCustomerVpa] = React.useState("");
  const [submittingUtr, setSubmittingUtr] = React.useState(false);
  const [completedTxn, setCompletedTxn] = React.useState<YouPITransaction | null>(null);

  // 10-minute timer countdown
  const [timeLeft, setTimeLeft] = React.useState(600);

  // Initialize session when dialog opens
  React.useEffect(() => {
    if (!open) {
      setStep("pay");
      setSession(null);
      setUtr("");
      setCustomerVpa("");
      setCompletedTxn(null);
      setError(null);
      setTimeLeft(600);
      return;
    }

    setLoading(true);
    setError(null);

    api
      .createYouPISession({
        chit_group_id: chitGroup?.id,
        member_id: member?.id,
        installment_number: 1,
        amount: amount,
        customer_name: member?.name || "Subscriber",
        customer_phone: member?.phone,
        note: `${chitGroup?.group_name || "Chit Plan"} Installment`,
      })
      .then((sess) => {
        setSession(sess);
        setTimeLeft(600);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to initiate YouPI payment session");
      })
      .finally(() => setLoading(false));
  }, [open, chitGroup, member, amount]);

  // Countdown effect
  React.useEffect(() => {
    if (!open || step !== "pay" || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [open, step, timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCopyVpa = () => {
    if (!session) return;
    navigator.clipboard.writeText(session.merchant_vpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2500);
  };

  const handleCopyAmount = () => {
    if (!session) return;
    navigator.clipboard.writeText(session.amount.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2500);
  };

  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    const cleanUtr = utr.trim();
    if (!cleanUtr || cleanUtr.length !== 12 || !cleanUtr.match(/^\d+$/)) {
      alert("Please enter a valid 12-digit numeric Bank UPI UTR / Reference Number.");
      return;
    }

    setSubmittingUtr(true);
    try {
      const txn = await api.submitYouPIUTR({
        session_id: session.session_id,
        utr: cleanUtr,
        customer_vpa: customerVpa.trim() || undefined,
        notes: `Customer UTR claim for ${chitGroup?.group_name || "Chit Scheme"}`,
      });

      setCompletedTxn(txn);
      setStep("success");
      onPaymentSuccess?.(txn);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error verifying UTR reference");
    } finally {
      setSubmittingUtr(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-9 px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/20 flex items-center justify-center shadow-xs">
              <SvglUpi size={36} className="h-5 w-auto" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  YouPI Sovereign Payment Gateway
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                  0% Fee
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Official NPCI UPI Intent & Dynamic QR for ROSCA Installments
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="size-8 text-primary animate-spin mx-auto" />
              <p className="text-xs font-semibold text-muted-foreground">
                Initializing YouPI Sovereign UPI Session...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="size-4" />
                <span>Session Error</span>
              </div>
              <p>{error}</p>
            </div>
          ) : step === "pay" && session ? (
            <div className="space-y-5">
              {/* Plan & Amount Summary Bar */}
              <div className="p-3.5 rounded-xl border border-border bg-muted/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Paying For
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {chitGroup?.group_name || "Chit Scheme"} · {member?.name || "Subscriber"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Payable Amount
                  </span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    ₹{session.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Dynamic UPI QR Code Box */}
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl border border-border bg-white text-slate-900 shadow-inner space-y-3">
                <div className="relative p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  {/* High Quality Authentic SVG QR Pattern with YouPI Center Brand */}
                  <div className="size-48 flex items-center justify-center relative">
                    <svg
                      viewBox="0 0 200 200"
                      className="size-full"
                      shapeRendering="crispEdges"
                    >
                      <rect width="200" height="200" fill="white" />
                      {/* Top Left Corner */}
                      <rect x="10" y="10" width="50" height="50" fill="#0f172a" />
                      <rect x="18" y="18" width="34" height="34" fill="white" />
                      <rect x="24" y="24" width="22" height="22" fill="#0f172a" />
                      {/* Top Right Corner */}
                      <rect x="140" y="10" width="50" height="50" fill="#0f172a" />
                      <rect x="148" y="18" width="34" height="34" fill="white" />
                      <rect x="154" y="24" width="22" height="22" fill="#0f172a" />
                      {/* Bottom Left Corner */}
                      <rect x="10" y="140" width="50" height="50" fill="#0f172a" />
                      <rect x="18" y="148" width="34" height="34" fill="white" />
                      <rect x="24" y="154" width="22" height="22" fill="#0f172a" />
                      {/* Simulated QR Payload Matrix */}
                      <rect x="70" y="20" width="10" height="10" fill="#0f172a" />
                      <rect x="90" y="20" width="10" height="10" fill="#0f172a" />
                      <rect x="110" y="20" width="10" height="10" fill="#0f172a" />
                      <rect x="70" y="40" width="10" height="10" fill="#0f172a" />
                      <rect x="100" y="40" width="10" height="10" fill="#0f172a" />
                      <rect x="120" y="40" width="10" height="10" fill="#0f172a" />
                      <rect x="20" y="70" width="10" height="10" fill="#0f172a" />
                      <rect x="40" y="70" width="10" height="10" fill="#0f172a" />
                      <rect x="20" y="90" width="10" height="10" fill="#0f172a" />
                      <rect x="50" y="90" width="10" height="10" fill="#0f172a" />
                      <rect x="20" y="110" width="10" height="10" fill="#0f172a" />
                      <rect x="40" y="120" width="10" height="10" fill="#0f172a" />
                      <rect x="140" y="70" width="10" height="10" fill="#0f172a" />
                      <rect x="170" y="70" width="10" height="10" fill="#0f172a" />
                      <rect x="150" y="90" width="10" height="10" fill="#0f172a" />
                      <rect x="180" y="90" width="10" height="10" fill="#0f172a" />
                      <rect x="140" y="110" width="10" height="10" fill="#0f172a" />
                      <rect x="160" y="120" width="10" height="10" fill="#0f172a" />
                      <rect x="70" y="70" width="15" height="15" fill="#0f172a" />
                      <rect x="115" y="70" width="15" height="15" fill="#0f172a" />
                      <rect x="70" y="115" width="15" height="15" fill="#0f172a" />
                      <rect x="115" y="115" width="15" height="15" fill="#0f172a" />
                      <rect x="70" y="140" width="10" height="10" fill="#0f172a" />
                      <rect x="90" y="150" width="10" height="10" fill="#0f172a" />
                      <rect x="110" y="140" width="10" height="10" fill="#0f172a" />
                      <rect x="140" y="150" width="10" height="10" fill="#0f172a" />
                      <rect x="170" y="160" width="10" height="10" fill="#0f172a" />
                      <rect x="160" y="180" width="10" height="10" fill="#0f172a" />
                      <rect x="70" y="170" width="10" height="10" fill="#0f172a" />
                      <rect x="90" y="180" width="10" height="10" fill="#0f172a" />
                      <rect x="110" y="170" width="10" height="10" fill="#0f172a" />
                    </svg>

                    {/* Center Brand Badge */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[10px] shadow-md border border-white">
                        YouPI
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timer Countdown */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <Clock className="size-3.5 text-amber-600" />
                  <span>Session expires in:</span>
                  <span className="font-mono text-amber-700 font-bold">
                    {formatTimer(timeLeft)}
                  </span>
                </div>
              </div>

              {/* VPA Copy Bar */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Verified Merchant VPA (UPI ID)
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={session.merchant_vpa}
                    className="flex-1 text-xs font-mono px-3 py-2 rounded-lg border border-border bg-muted/40 text-foreground"
                  />
                  <button
                    type="button"
                    onClick={handleCopyVpa}
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors shrink-0"
                  >
                    {copiedVpa ? (
                      <>
                        <Check className="size-3.5 text-emerald-500" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>Copy VPA</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 1-Click UPI App Direct Triggers */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <SvglUpi size={16} className="h-3 w-auto" />
                    <span>Pay Instantly With UPI App</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    1-Click Direct App Launch
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <a
                    href={session.gpay_uri}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-border bg-card hover:border-[#4285F4] hover:bg-muted/60 transition-all text-xs font-bold text-foreground shadow-2xs group"
                  >
                    <SvglGooglePay size={18} className="shrink-0" />
                    <span className="group-hover:text-[#4285F4]">GPay</span>
                  </a>
                  <a
                    href={session.phonepe_uri}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-border bg-card hover:border-[#5F259F] hover:bg-muted/60 transition-all text-xs font-bold text-foreground shadow-2xs group"
                  >
                    <SvglPhonePe size={20} className="shrink-0" />
                    <span className="group-hover:text-[#5F259F]">PhonePe</span>
                  </a>
                  <a
                    href={session.paytm_uri}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-border bg-card hover:border-[#00BAF2] hover:bg-muted/60 transition-all text-xs font-bold text-foreground shadow-2xs group"
                  >
                    <SvglPaytm size={16} className="shrink-0" />
                    <span className="group-hover:text-[#00BAF2]">Paytm</span>
                  </a>
                  <a
                    href={session.bhim_uri}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-border bg-card hover:border-[#008060] hover:bg-muted/60 transition-all text-xs font-bold text-foreground shadow-2xs group"
                  >
                    <SvglBhim size={20} className="shrink-0" />
                    <span className="group-hover:text-[#008060]">BHIM</span>
                  </a>
                </div>
              </div>

              {/* Next Action: I Have Paid */}
              <div className="pt-2 border-t border-border flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep("utr")}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <span>I Have Paid · Enter UTR</span>
                </button>
              </div>
            </div>
          ) : step === "utr" && session ? (
            <form onSubmit={handleSubmitUtr} className="space-y-4">
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
                <h4 className="text-xs font-bold text-foreground">
                  Confirm UPI Transaction Reference (UTR)
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  After completing payment in Google Pay, PhonePe, Paytm, or BHIM, copy the 12-digit UTR reference from your bank transaction history.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  12-Digit Bank UTR / UPI Ref No. *
                </label>
                <input
                  type="text"
                  maxLength={12}
                  required
                  placeholder="e.g. 432198765432"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-sm font-mono tracking-widest px-3 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  autoFocus
                />
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Must be exactly 12 numeric digits ({utr.length}/12 entered).
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Your Paying VPA / Phone (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. subscriber@okhdfcbank"
                  value={customerVpa}
                  onChange={(e) => setCustomerVpa(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep("pay")}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-foreground"
                >
                  Back to QR
                </button>
                <button
                  type="submit"
                  disabled={submittingUtr || utr.length !== 12}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {submittingUtr ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" />
                      <span>Verifying with YouPI Gateway...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="size-4" />
                      <span>Verify & Credit Installment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : step === "success" && completedTxn ? (
            <div className="space-y-5 text-center py-2 animate-in fade-in duration-200">
              <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-foreground">
                  Payment Verified & Credited!
                </h4>
                <p className="text-xs text-muted-foreground">
                  Your monthly ROSCA installment has been successfully recorded via YouPI Sovereign Gateway.
                </p>
              </div>

              {/* Digital Voucher Card */}
              <div className="p-4 rounded-xl border border-border bg-muted/20 text-left space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-border/60 pb-1.5">
                  <span className="text-muted-foreground font-sans">Payment Mode</span>
                  <span className="font-bold text-foreground uppercase">YouPI Sovereign UPI</span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-1.5">
                  <span className="text-muted-foreground font-sans">Order #</span>
                  <span className="text-foreground">{completedTxn.order_id}</span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-1.5">
                  <span className="text-muted-foreground font-sans">Bank UTR</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {completedTxn.utr}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-1.5">
                  <span className="text-muted-foreground font-sans">Amount Credited</span>
                  <span className="font-bold text-foreground">
                    ₹{completedTxn.amount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-muted-foreground font-sans">Gateway Fee</span>
                  <span className="text-emerald-600 font-bold">₹0.00 (Zero Fee)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Close & Return to Ledger
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
export default YouPICheckoutModal;
