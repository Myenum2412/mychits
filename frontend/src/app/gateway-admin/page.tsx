"use client";

import * as React from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { PageHeader6 } from "@/components/ui/page-header-6";
import { DataTable2, TableColumn } from "@/components/ui/data-table-2";
import {
  api,
  type YouPISettings,
  type YouPITransaction,
  type ObserverStatus,
} from "@/lib/api";
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  RefreshCw,
  Building2,
  Key,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Copy,
  Check,
  ExternalLink,
  Sliders,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import {
  SvglUpi,
  SvglGmail,
  SvglTwilio,
  SvglPhonePe,
  SvglGooglePay,
  SvglPaytm,
} from "@/components/ui/svgl-icons";

export default function GatewayAdminPage() {
  const [activeTab, setActiveTab] = React.useState<
    "transactions" | "vpa" | "apikeys" | "observers" | "settlement"
  >("transactions");

  const [settings, setSettings] = React.useState<YouPISettings | null>(null);
  const [transactions, setTransactions] = React.useState<YouPITransaction[]>([]);
  const [observers, setObservers] = React.useState<ObserverStatus[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [savingSettings, setSavingSettings] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Edit settings form
  const [primaryVpa, setPrimaryVpa] = React.useState("");
  const [merchantName, setMerchantName] = React.useState("");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [ifscCode, setIfscCode] = React.useState("");
  const [bankName, setBankName] = React.useState("");
  const [mcc, setMcc] = React.useState("6012");
  const [minAmount, setMinAmount] = React.useState(1);
  const [maxAmount, setMaxAmount] = React.useState(200000);

  // Verification modal
  const [selectedTxn, setSelectedTxn] = React.useState<YouPITransaction | null>(null);
  const [adminNotes, setAdminNotes] = React.useState("");
  const [actionLoading, setActionLoading] = React.useState(false);

  // Copy tracking
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [cfg, txns, obs] = await Promise.all([
        api.getYouPISettings(),
        api.getYouPITransactions(),
        api.getYouPIObservers(),
      ]);
      setSettings(cfg);
      setPrimaryVpa(cfg.primary_vpa);
      setMerchantName(cfg.merchant_name);
      setAccountNumber(cfg.account_number);
      setIfscCode(cfg.ifsc_code);
      setBankName(cfg.bank_name);
      setMcc(cfg.mcc);
      setMinAmount(cfg.min_amount);
      setMaxAmount(cfg.max_amount);

      setTransactions(txns);
      setObservers(obs);
    } catch (err) {
      console.error("Failed to load YouPI admin data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const updated = await api.updateYouPISettings({
        primary_vpa: primaryVpa,
        merchant_name: merchantName,
        account_number: accountNumber,
        ifsc_code: ifscCode,
        bank_name: bankName,
        mcc: mcc,
        min_amount: Number(minAmount),
        max_amount: Number(maxAmount),
      });
      setSettings(updated);
      setToastMessage("YouPI Gateway settings saved and active across all checkouts!");
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error saving YouPI settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleVerifyAction = async (action: "verify" | "investigate" | "reject") => {
    if (!selectedTxn) return;
    setActionLoading(true);
    try {
      await api.verifyYouPITransaction(selectedTxn.id, {
        action,
        admin_notes: adminNotes || undefined,
      });
      setSelectedTxn(null);
      setAdminNotes("");
      setToastMessage(
        `Transaction ${selectedTxn.order_id} marked as ${action.toUpperCase()} successfully!`
      );
      setTimeout(() => setToastMessage(null), 3500);
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error updating transaction");
    } finally {
      setActionLoading(false);
    }
  };

  const transactionColumns: TableColumn<YouPITransaction>[] = [
    {
      id: "order_id",
      header: "Order / Session",
      sortable: true,
      cell: (t) => (
        <div>
          <span className="font-mono text-xs font-bold text-foreground block">
            {t.order_id}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            {t.session_id}
          </span>
        </div>
      ),
    },
    {
      id: "member_name",
      header: "Subscriber & Plan",
      sortable: true,
      cell: (t) => (
        <div>
          <span className="text-xs font-bold text-foreground block">
            {t.member_name || "Online Subscriber"}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {t.group_name || "General Chit Due"}
          </span>
        </div>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      sortable: true,
      cell: (t) => (
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
          ₹{t.amount.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      id: "utr",
      header: "Bank UTR Claim",
      cell: (t) => (
        <div>
          {t.utr ? (
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted font-bold text-foreground">
              {t.utr}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground italic">Awaiting UTR</span>
          )}
          {t.customer_vpa && (
            <span className="text-[10px] text-muted-foreground block font-mono">
              {t.customer_vpa}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Reconciliation Status",
      sortable: true,
      cell: (t) => {
        const s = t.status;
        const color =
          s === "verified"
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            : s === "manual_review"
            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            : s === "under_investigation"
            ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
            : s === "rejected"
            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
            : "bg-muted text-muted-foreground border-border";

        return (
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${color}`}
          >
            {s.replace("_", " ")}
          </span>
        );
      },
    },
    {
      id: "created_at",
      header: "Date & Time",
      sortable: true,
      cell: (t) => (
        <span className="text-xs text-muted-foreground font-mono">
          {new Date(t.created_at).toLocaleString("en-IN", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Action",
      className: "text-right",
      cell: (t) => (
        <button
          onClick={() => {
            setSelectedTxn(t);
            setAdminNotes(t.admin_notes || "");
          }}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors"
        >
          Inspect & Review
        </button>
      ),
    },
  ];

  const totalVolume = transactions.reduce((acc, t) => acc + t.amount, 0);
  const verifiedCount = transactions.filter((t) => t.status === "verified").length;

  return (
    <DashboardShell pageTitle="YouPI Gateway & Merchant Admin">
      <div className="w-full flex-1 flex flex-col space-y-6">
        {/* PageHeader6 Toolbar */}
        <PageHeader6
          tag="YouPI PG V2 — Sovereign Gateway"
          title="YouPI Payment Gateway & Merchant Admin"
          description="Sovereign 0% fee Indian UPI payment gateway administration: merchant VPAs, bank settlement accounts, API keys, real-time UTR reconciliation, and daemon observers."
          actions={
            <div className="flex items-center gap-2.5">
              <button
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3.5 py-2 border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh Gateway</span>
              </button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <ShieldCheck className="size-4" />
                <span>0% Gateway Fee (Sovereign)</span>
              </div>
            </div>
          }
        />

        {/* Toast Alert */}
        {toastMessage && (
          <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Total UPI Volume</span>
              <DollarSign className="size-4 text-emerald-500" />
            </div>
            <p className="text-xl font-black text-foreground">
              ₹{totalVolume.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {transactions.length} total payment sessions
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Primary Receiving VPA</span>
              <SvglUpi size={24} className="h-4 w-auto" />
            </div>
            <p className="text-sm font-black font-mono text-foreground truncate">
              {settings?.primary_vpa || "apexchits@okaxis"}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Verified Merchant VPA Active
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Settlement Account</span>
              <Building2 className="size-4 text-sky-500" />
            </div>
            <p className="text-sm font-bold text-foreground truncate">
              {settings?.bank_name || "Axis Bank (Current)"}
            </p>
            <p className="text-[11px] text-muted-foreground font-mono">
              A/C: •••• {settings?.account_number.slice(-4) || "5019"} · IFSC: {settings?.ifsc_code}
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Active Observers</span>
              <Smartphone className="size-4 text-purple-500" />
            </div>
            <p className="text-xl font-black text-foreground">
              {observers.filter((o) => o.status === "active").length}/{observers.length} Online
            </p>
            <p className="text-[11px] text-muted-foreground">
              Android, SMS, and Gmail Daemons
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-4 py-2 font-bold rounded-xl transition-colors shrink-0 flex items-center gap-2 ${
              activeTab === "transactions"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <CreditCard className="size-4" />
            <span>Transactions & UTR Verification ({transactions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("vpa")}
            className={`px-4 py-2 font-bold rounded-xl transition-colors shrink-0 flex items-center gap-2 ${
              activeTab === "vpa"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <SvglUpi size={24} className="h-4 w-auto" />
            <span>Merchant VPAs & Bank Accounts</span>
          </button>
          <button
            onClick={() => setActiveTab("apikeys")}
            className={`px-4 py-2 font-bold rounded-xl transition-colors shrink-0 flex items-center gap-2 ${
              activeTab === "apikeys"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Key className="size-4" />
            <span>API Credentials & Webhooks</span>
          </button>
          <button
            onClick={() => setActiveTab("observers")}
            className={`px-4 py-2 font-bold rounded-xl transition-colors shrink-0 flex items-center gap-2 ${
              activeTab === "observers"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Smartphone className="size-4" />
            <span>Payment Observers Daemon</span>
          </button>
          <button
            onClick={() => setActiveTab("settlement")}
            className={`px-4 py-2 font-bold rounded-xl transition-colors shrink-0 flex items-center gap-2 ${
              activeTab === "settlement"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <ShieldCheck className="size-4" />
            <span>0% Sovereign Fee Settlement</span>
          </button>
        </div>

        {/* Tab 1: Transactions & UTR Reconciliation */}
        {activeTab === "transactions" && (
          <div className="w-full flex-1 flex flex-col space-y-4">
            <DataTable2<YouPITransaction>
              data={transactions}
              columns={transactionColumns}
              getId={(t) => t.id}
              searchPlaceholder="Search by Order ID, UTR claim, subscriber name..."
              searchKey={(t) => `${t.order_id} ${t.utr || ""} ${t.member_name || ""}`}
              showCheckbox={true}
              showSNo={true}
              emptyMessage="Zero YouPI payment sessions recorded yet. Real subscriber transactions will appear here instantly."
            />
          </div>
        )}

        {/* Tab 2: Merchant VPAs & Bank Settlement */}
        {activeTab === "vpa" && (
          <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Receiving VPAs & Direct Bank Settlement
                </h3>
                <p className="text-xs text-muted-foreground">
                  Configure the primary UPI ID (VPA) and bank account where ROSCA installment payments are credited directly.
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                Zero Intermediary Escrow
              </span>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Primary Receiving VPA (UPI ID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={primaryVpa}
                    onChange={(e) => setPrimaryVpa(e.target.value)}
                    placeholder="e.g. apexchits@okaxis"
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-bold"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    All dynamic QR codes and intent links route funds directly to this VPA.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Merchant Legal Entity Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    placeholder="e.g. Apex Chits & Finance Ltd"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-semibold"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Display name shown in GPay, PhonePe, and Paytm payment screens.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Settlement Bank Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Axis Bank Ltd (Current Account)"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Bank Account Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 918273645019"
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Bank IFSC Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="e.g. UTIB0000123"
                    className="w-full text-xs font-mono uppercase px-3.5 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Merchant Category Code (MCC)
                  </label>
                  <input
                    type="text"
                    required
                    value={mcc}
                    onChange={(e) => setMcc(e.target.value)}
                    placeholder="6012"
                    className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    6012 = Financial Institutions / ROSCA Fund Manager
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  {savingSettings ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" />
                      <span>Saving Configuration...</span>
                    </>
                  ) : (
                    <>
                      <Check className="size-4" />
                      <span>Save & Activate Settings</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: API Credentials & Webhooks */}
        {activeTab === "apikeys" && (
          <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  YouPI PG API Credentials & Webhook Signatures
                </h3>
                <p className="text-xs text-muted-foreground">
                  Secure cryptographic keys used by servers to verify UTR submissions and HMAC-SHA256 signed events.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  YOUPI_MERCHANT_ID
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={settings?.merchant_id || ""}
                    className="flex-1 text-xs font-mono px-3.5 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground"
                  />
                  <button
                    onClick={() => handleCopy(settings?.merchant_id || "", "merchant_id")}
                    className="px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground flex items-center gap-1.5"
                  >
                    {copiedKey === "merchant_id" ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    <span>{copiedKey === "merchant_id" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  YOUPI_MERCHANT_API_KEY (Server-to-Server Only)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    readOnly
                    value={settings?.api_key || ""}
                    className="flex-1 text-xs font-mono px-3.5 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground"
                  />
                  <button
                    onClick={() => handleCopy(settings?.api_key || "", "api_key")}
                    className="px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground flex items-center gap-1.5"
                  >
                    {copiedKey === "api_key" ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    <span>{copiedKey === "api_key" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  YOUPI_WEBHOOK_SECRET (HMAC-SHA256)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    readOnly
                    value={settings?.webhook_secret || ""}
                    className="flex-1 text-xs font-mono px-3.5 py-2.5 rounded-xl border border-border bg-muted/30 text-foreground"
                  />
                  <button
                    onClick={() => handleCopy(settings?.webhook_secret || "", "webhook_secret")}
                    className="px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground flex items-center gap-1.5"
                  >
                    {copiedKey === "webhook_secret" ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                    <span>{copiedKey === "webhook_secret" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                <span className="text-xs font-bold text-foreground block">
                  Authoritative Webhook Endpoint
                </span>
                <p className="text-[11px] text-muted-foreground font-mono">
                  http://127.0.0.1:8000/api/v1/youpi/webhook
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Every UTR submission emits a signed JSON event with header <code className="text-foreground">X-YouPI-Signature</code> containing the HMAC-SHA256 digest of the payload.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Observer Daemon Status */}
        {activeTab === "observers" && (
          <div className="w-full space-y-4">
            <div className="p-4 rounded-2xl border border-border bg-card flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Automated Payment Observers
                </h3>
                <p className="text-xs text-muted-foreground">
                  Daemon services listening to bank credit notifications for instant UTR auto-matching without manual bank ledger audits.
                </p>
              </div>
              <button
                onClick={loadData}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted"
              >
                Ping Observers
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {observers.map((obs) => (
                <div
                  key={obs.name}
                  className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                      {obs.type} DAEMON
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{obs.status}</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-foreground">{obs.name}</h4>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      {obs.details}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span>Last heartbeat: {obs.last_ping}</span>
                    {obs.battery && <span>{obs.battery}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: 0% Sovereign Fee Settlement */}
        {activeTab === "settlement" && (
          <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Sovereign 0% Fee Direct Settlement
                </h3>
                <p className="text-xs text-muted-foreground">
                  Unlike third-party gateways (Razorpay/Cashfree charging 2.0% + GST), YouPI PG operates with 0% gateway commission, sending 100% of subscriber installment funds directly to your registered bank account.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">
                  Commercial Gateway Cost (2%)
                </span>
                <p className="text-lg font-bold text-rose-600">
                  ₹{(totalVolume * 0.02).toLocaleString("en-IN")}
                </p>
                <p className="text-[11px] text-muted-foreground">2% MDR fee lost</p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-emerald-500/10 border-emerald-500/20 space-y-1">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  YouPI PG Gateway Fee (0%)
                </span>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  ₹0.00 (Zero Fee)
                </p>
                <p className="text-[11px] text-emerald-600/80">Sovereign Direct UPI</p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
                <span className="text-xs text-muted-foreground font-semibold">
                  Net Savings Retained
                </span>
                <p className="text-lg font-bold text-foreground">
                  ₹{(totalVolume * 0.02).toLocaleString("en-IN")}
                </p>
                <p className="text-[11px] text-muted-foreground">Direct-to-bank settlement</p>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Review & Verification Modal */}
        {selectedTxn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Review UTR Claim #{selectedTxn.order_id}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    Session: {selectedTxn.session_id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTxn(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <XIcon className="size-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 p-3.5 rounded-xl border border-border bg-muted/20 font-mono">
                  <div>
                    <span className="text-muted-foreground block text-[10px] font-sans">
                      Subscriber
                    </span>
                    <span className="font-bold text-foreground">
                      {selectedTxn.member_name || "Online Member"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] font-sans">
                      Chit Plan
                    </span>
                    <span className="font-bold text-foreground">
                      {selectedTxn.group_name || "ROSCA Due"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] font-sans">
                      Amount Claimed
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{selectedTxn.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] font-sans">
                      Bank UTR Reference
                    </span>
                    <span className="font-bold text-foreground">
                      {selectedTxn.utr || "Pending submission"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Admin Verification Notes / Evidence
                  </label>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="e.g. Matched with Axis Bank credit statement at 11:42 AM"
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTxn(null)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-border hover:bg-muted text-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleVerifyAction("reject")}
                  disabled={actionLoading}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100 disabled:opacity-50"
                >
                  Reject Claim
                </button>
                <button
                  type="button"
                  onClick={() => handleVerifyAction("investigate")}
                  disabled={actionLoading}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50 dark:bg-sky-950/40 text-sky-600 hover:bg-sky-100 disabled:opacity-50"
                >
                  Investigate
                </button>
                <button
                  type="button"
                  onClick={() => handleVerifyAction("verify")}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-50"
                >
                  Verify & Approve UTR
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
