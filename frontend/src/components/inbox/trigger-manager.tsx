"use client";

import * as React from "react";
import {
  Zap,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Play,
  RefreshCw,
  Tag,
  Bot,
  UserCheck,
  Check,
  X,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { api, type BrightBeanTrigger } from "@/lib/api";

const DEFAULT_TRIGGERS: BrightBeanTrigger[] = [
  {
    id: "trg-1",
    keyword: "PAY",
    match_type: "contains",
    action: "instant_reply",
    reply_text: "Hello! Your pending chit installment is ₹4,250. Pay instantly with 0% fee UPI: http://localhost:3000/pay",
    target_flow_id: "flow-dues",
    label_to_add: "Chit Due",
    is_active: true,
    created_at: "Just now",
  },
  {
    id: "trg-2",
    keyword: "DUE",
    match_type: "contains",
    action: "instant_reply",
    reply_text: "Chit Ledger Update: Your current net installment due after monthly dividend offset is ₹4,250.",
    target_flow_id: "flow-dues",
    label_to_add: "Chit Due",
    is_active: true,
    created_at: "Just now",
  },
  {
    id: "trg-3",
    keyword: "AUCTION",
    match_type: "contains",
    action: "instant_reply",
    reply_text: "Monthly Reverse Auction: Scheduled for the 25th at 5:00 PM IST. Non-prized subscribers can place bids in the app.",
    target_flow_id: "flow-auction",
    label_to_add: "Auction Bidder",
    is_active: true,
    created_at: "Just now",
  },
  {
    id: "trg-4",
    keyword: "DIVIDEND",
    match_type: "contains",
    action: "instant_reply",
    reply_text: "Dividend Credit: Your latest auction dividend discount of ₹750 has been credited to your installment ledger!",
    target_flow_id: "flow-auction",
    label_to_add: "Payment Settled",
    is_active: true,
    created_at: "Just now",
  },
  {
    id: "trg-5",
    keyword: "HELP",
    match_type: "exact",
    action: "human_takeover",
    reply_text: "Of course! Pausing bot automation and putting you through to a human representative now. An administrator has been notified.",
    target_flow_id: "flow-handoff",
    label_to_add: "Needs a person",
    is_active: true,
    created_at: "Just now",
  },
  {
    id: "trg-6",
    keyword: "AGENT",
    match_type: "exact",
    action: "human_takeover",
    reply_text: "Transferring this chat to our branch foreperson. Bot auto-responses have been suspended.",
    target_flow_id: "flow-handoff",
    label_to_add: "Needs a person",
    is_active: true,
    created_at: "Just now",
  },
  {
    id: "trg-7",
    keyword: "KYC",
    match_type: "contains",
    action: "instant_reply",
    reply_text: "Please send your Aadhaar / PAN card front scan here to complete your chit subscriber verification under Chit Funds Act 1982.",
    label_to_add: "KYC Needed",
    is_active: true,
    created_at: "Just now",
  },
];

export function TriggerManager() {
  const [triggers, setTriggers] = React.useState<BrightBeanTrigger[]>(DEFAULT_TRIGGERS);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [testText, setTestText] = React.useState("");
  const [testResult, setTestResult] = React.useState<{ matched: boolean; trigger?: BrightBeanTrigger; message: string } | null>(null);

  // New trigger form
  const [newKeyword, setNewKeyword] = React.useState("");
  const [newMatchType, setNewMatchType] = React.useState("contains");
  const [newAction, setNewAction] = React.useState("instant_reply");
  const [newReplyText, setNewReplyText] = React.useState("");
  const [newLabel, setNewLabel] = React.useState("");

  const loadTriggers = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getTriggers();
      if (Array.isArray(data) && data.length > 0) {
        setTriggers(data);
      }
    } catch (err) {
      console.warn("Could not load triggers from backend, using default list:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadTriggers();
  }, [loadTriggers]);

  const filteredTriggers = React.useMemo(() => {
    return triggers.filter((t) => {
      const q = search.toLowerCase();
      return (
        t.keyword.toLowerCase().includes(q) ||
        t.reply_text.toLowerCase().includes(q) ||
        t.action.toLowerCase().includes(q) ||
        (t.label_to_add && t.label_to_add.toLowerCase().includes(q))
      );
    });
  }, [triggers, search]);

  const handleToggleActive = (id: string) => {
    setTriggers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_active: !t.is_active } : t))
    );
  };

  const handleAddTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim() || !newReplyText.trim()) return;

    try {
      const created = await api.createTrigger({
        keyword: newKeyword.trim().toUpperCase(),
        match_type: newMatchType,
        action: newAction,
        reply_text: newReplyText.trim(),
        label_to_add: newLabel.trim() || undefined,
        is_active: true,
      });
      setTriggers((prev) => [created, ...prev]);
      setIsAddOpen(false);
      setNewKeyword("");
      setNewReplyText("");
      setNewLabel("");
    } catch (err) {
      console.error("Failed to add trigger:", err);
      // Fallback local
      const fallback: BrightBeanTrigger = {
        id: `trg-${Date.now()}`,
        keyword: newKeyword.trim().toUpperCase(),
        match_type: newMatchType,
        action: newAction,
        reply_text: newReplyText.trim(),
        label_to_add: newLabel.trim() || undefined,
        is_active: true,
        created_at: "Just now",
      };
      setTriggers((prev) => [fallback, ...prev]);
      setIsAddOpen(false);
      setNewKeyword("");
      setNewReplyText("");
      setNewLabel("");
    }
  };

  const handleTestTrigger = () => {
    if (!testText.trim()) return;
    const upper = testText.toUpperCase().trim();

    let matchedTrg: BrightBeanTrigger | undefined = undefined;

    for (const trg of triggers) {
      if (!trg.is_active) continue;
      if (trg.match_type === "exact" && upper === trg.keyword) {
        matchedTrg = trg;
        break;
      } else if (trg.match_type === "contains" && upper.includes(trg.keyword)) {
        matchedTrg = trg;
        break;
      }
    }

    if (matchedTrg) {
      setTestResult({
        matched: true,
        trigger: matchedTrg,
        message:
          matchedTrg.action === "human_takeover"
            ? `[Action: Human Takeover Triggered] Auto-paused bot replies & tagged '${matchedTrg.label_to_add || "Needs a person"}'. Bot: "${matchedTrg.reply_text}"`
            : `[Action: Instant Auto-Reply] Bot: "${matchedTrg.reply_text}" (Tagged: ${matchedTrg.label_to_add || "None"})`,
      });
    } else {
      setTestResult({
        matched: false,
        message: "No keyword trigger matched this message. Default flow or human inbox fallback applies.",
      });
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card shadow-xs">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Zap className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">Keyword Triggers & Auto-Responses</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Rule Engine
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automatically respond to incoming customer messages, invoke chit dues payment links, or pause bot when human handoff is requested.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadTriggers}
            disabled={loading}
            className="p-2 border border-border bg-card hover:bg-muted text-foreground rounded-xl shadow-xs transition-colors disabled:opacity-50"
            title="Refresh Triggers"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="size-4" />
            <span>Add Keyword Trigger</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Table + Side Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[540px]">
        {/* Table of triggers */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-border bg-muted/20 flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search triggers or actions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {filteredTriggers.length} Active Rules
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold">
                  <th className="py-2.5 px-4">Keyword</th>
                  <th className="py-2.5 px-3">Match</th>
                  <th className="py-2.5 px-3">Bot Action</th>
                  <th className="py-2.5 px-4">Auto-Reply Preview</th>
                  <th className="py-2.5 px-3">Tag Applied</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTriggers.map((trg) => (
                  <tr key={trg.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-foreground bg-muted/80 px-2 py-1 rounded-md border border-border">
                        {trg.keyword}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-secondary text-secondary-foreground">
                        {trg.match_type}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {trg.action === "human_takeover" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <UserCheck className="size-3" />
                          Human Takeover
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          <Bot className="size-3" />
                          Auto-Reply
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-muted-foreground truncate" title={trg.reply_text}>
                        {trg.reply_text}
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      {trg.label_to_add ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-foreground border border-border">
                          <Tag className="size-2.5 text-muted-foreground" />
                          {trg.label_to_add}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggleActive(trg.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          trg.is_active
                            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        {trg.is_active ? "Enabled" : "Disabled"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Simulator Widget */}
        <div className="lg:col-span-4 flex flex-col rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="size-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Trigger Match Simulator</span>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col space-y-4">
            <p className="text-xs text-muted-foreground">
              Send a test message as if a subscriber typed it in WhatsApp or Instagram to verify which trigger rule fires.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Incoming Message Text</label>
              <textarea
                rows={3}
                placeholder="e.g. Can I pay my monthly due now?"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleTestTrigger}
                className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                <Play className="size-3.5" />
                <span>Test Keyword Engine</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 animate-in fade-in-50 ${
                  testResult.matched
                    ? "border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200"
                    : "border-border bg-muted/30 text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {testResult.matched ? (
                    <>
                      <CheckCircle2 className="size-4 text-emerald-600" />
                      <span>Rule Match: {testResult.trigger?.keyword}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="size-4 text-amber-500" />
                      <span>No Trigger Found</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed whitespace-pre-line font-mono">
                  {testResult.message}
                </p>
              </div>
            )}

            <div className="p-3 rounded-xl bg-muted/20 border border-border/80 text-[11px] text-muted-foreground space-y-1.5 mt-auto">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <ShieldCheck className="size-3.5 text-indigo-500" />
                <span>BrightBean Rule Priority</span>
              </div>
              <p>
                Exact matches take precedence over contains matches. When an agent trigger fires (e.g. <span className="font-mono">HELP</span>), <span className="font-semibold text-foreground">automation_paused</span> is enabled automatically.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Trigger Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Add New Keyword Trigger</h3>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTrigger} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Keyword / Pattern</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RECEIPT or BALANCE"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Match Type</label>
                  <select
                    value={newMatchType}
                    onChange={(e) => setNewMatchType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="contains">Contains Word</option>
                    <option value="exact">Exact Match</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Bot Action</label>
                  <select
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="instant_reply">Instant Auto-Reply</option>
                    <option value="human_takeover">Human Takeover (Pause Bot)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Automated Reply Text</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Message sent back to subscriber immediately..."
                  value={newReplyText}
                  onChange={(e) => setNewReplyText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Auto-Apply Tag (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Chit Due or Needs a person"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl shadow-xs"
                >
                  Create Trigger Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
