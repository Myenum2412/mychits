"use client";

import * as React from "react";
import {
  Workflow,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Bot,
  Zap,
  Tag,
  ShieldCheck,
  Split,
  ChevronRight,
  RefreshCw,
  FolderOpen,
  Send,
  HelpCircle,
} from "lucide-react";
import { api, type BrightBeanFlow } from "@/lib/api";

interface FlowNode {
  id: string;
  type: "trigger" | "send_message" | "action" | "condition" | "delay" | "quick_reply";
  label: string;
  x?: number;
  y?: number;
  config?: any;
}

interface FlowEdge {
  source: string;
  target: string;
  label?: string;
}

const TEMPLATE_OPTIONS = [
  {
    id: "welcome-chit",
    name: "First Message Welcome & Chit Onboarding",
    description: "Greets new contacts, explains chit fund schemes, and tags subscriber as 'New Lead'.",
    trigger_keyword: "/start, HI, HELLO",
    trigger_type: "welcome",
    nodes: [
      { id: "n1", type: "trigger", label: "Subscriber First Contact (/start or 'Hi')" },
      { id: "n2", type: "send_message", label: "Welcome to Apex Chits! Smart digital savings & instant YouPI collections." },
      { id: "n3", type: "quick_reply", label: "Quick Options: [Explore Chit Schemes] [Pay Installment] [Support]" },
      { id: "n4", type: "action", label: "Tag: New Contact & Assign to Foreperson" },
    ],
  },
  {
    id: "dues-recovery",
    name: "Automated Dues Recovery & Sovereign UPI",
    description: "Detects 'PAY' or 'DUE', retrieves net installment after auction dividend offset, and sends YouPI intent link.",
    trigger_keyword: "PAY, DUE, INSTALLMENT",
    trigger_type: "keyword",
    nodes: [
      { id: "n1", type: "trigger", label: "Keyword: 'PAY' or 'DUE'" },
      { id: "n2", type: "action", label: "Query DB for Chit Installment & Dividend Offset" },
      { id: "n3", type: "send_message", label: "Send ₹4,250 net due notice with YouPI 0% fee UPI Pay link" },
      { id: "n4", type: "action", label: "Tag: Chit Due & Monitor Android Notification Observer" },
    ],
  },
  {
    id: "auction-dividend",
    name: "Monthly Auction Dividend & Winner Broadcast",
    description: "Notifies chit group members when monthly auction closes with dividend payout per subscriber.",
    trigger_keyword: "AUCTION, DIVIDEND",
    trigger_type: "keyword",
    nodes: [
      { id: "n1", type: "trigger", label: "Auction Finalized Event" },
      { id: "n2", type: "send_message", label: "Auction Winner announced! ₹750 dividend credited against your next chit due." },
      { id: "n3", type: "delay", label: "Wait 2 Hours" },
      { id: "n4", type: "send_message", label: "Reminder: Updated installment ledger ready in member portal." },
    ],
  },
  {
    id: "human-handoff",
    name: "Human Agent Takeover & Pause Automation",
    description: "BrightBean core safety: pauses bot automations (`automation_paused = true`) and alerts foreperson admin.",
    trigger_keyword: "HELP, AGENT, HUMAN, SUPPORT",
    trigger_type: "keyword",
    nodes: [
      { id: "n1", type: "trigger", label: "Subscriber requests human help ('HELP' or 'AGENT')" },
      { id: "n2", type: "action", label: "Pause Bot Automation (automation_paused = true)" },
      { id: "n3", type: "send_message", label: "Putting you through to our branch foreperson. Please hold!" },
      { id: "n4", type: "action", label: "Tag: 'Needs a person' & Alert Admin Dashboard" },
    ],
  },
];

export function FlowBuilder() {
  const [flows, setflows] = React.useState<BrightBeanFlow[]>([]);
  const [selectedFlowId, setSelectedFlowId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [simulatorInput, setSimulatorInput] = React.useState("");
  const [simulatorOutput, setSimulatorOutput] = React.useState<string | null>(null);
  const [isSimulating, setIsSimulating] = React.useState(false);

  // New flow form
  const [newName, setNewName] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");
  const [newKeyword, setNewKeyword] = React.useState("");
  const [newTriggerType, setNewTriggerType] = React.useState("keyword");
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>("");

  const loadFlows = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getFlows();
      setflows(data);
      if (data.length > 0 && !selectedFlowId) {
        setSelectedFlowId(data[0].id);
      }
    } catch (err) {
      console.warn("Could not load flows from backend, using templates:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedFlowId]);

  React.useEffect(() => {
    loadFlows();
  }, [loadFlows]);

  const activeFlow = React.useMemo(() => {
    return flows.find((f) => f.id === selectedFlowId) || flows[0] || null;
  }, [flows, selectedFlowId]);

  const parsedNodes: FlowNode[] = React.useMemo(() => {
    if (!activeFlow?.nodes_json) return [];
    try {
      return JSON.parse(activeFlow.nodes_json);
    } catch {
      return [];
    }
  }, [activeFlow]);

  const parsedEdges: FlowEdge[] = React.useMemo(() => {
    if (!activeFlow?.edges_json) return [];
    try {
      return JSON.parse(activeFlow.edges_json);
    } catch {
      return [];
    }
  }, [activeFlow]);

  const handleCreateFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    let nodes: FlowNode[] = [
      { id: "n1", type: "trigger", label: `Trigger: ${newKeyword || "Inbound message"}` },
      { id: "n2", type: "send_message", label: "Automated Bot Response" },
      { id: "n3", type: "action", label: "Tag: Lead Qualified" },
    ];
    let edges: FlowEdge[] = [
      { source: "n1", target: "n2" },
      { source: "n2", target: "n3" },
    ];

    if (selectedTemplate) {
      const t = TEMPLATE_OPTIONS.find((tpl) => tpl.id === selectedTemplate);
      if (t) {
        nodes = t.nodes as FlowNode[];
        edges = [
          { source: "n1", target: "n2" },
          { source: "n2", target: "n3" },
          { source: "n3", target: "n4" },
        ];
      }
    }

    try {
      const created = await api.createFlow({
        name: newName,
        description: newDesc || "Custom subscriber automation sequence",
        trigger_type: newTriggerType,
        trigger_keyword: newKeyword || "CUSTOM",
        status: "active",
        nodes_json: JSON.stringify(nodes),
        edges_json: JSON.stringify(edges),
      });
      setflows((prev) => [created, ...prev]);
      setSelectedFlowId(created.id);
      setIsCreateOpen(false);
      setNewName("");
      setNewDesc("");
      setNewKeyword("");
      setSelectedTemplate("");
    } catch (err) {
      console.error("Failed to create flow:", err);
    }
  };

  const handleSimulate = () => {
    if (!simulatorInput.trim()) return;
    setIsSimulating(true);
    setSimulatorOutput(null);

    setTimeout(() => {
      const input = simulatorInput.toUpperCase().trim();
      if (input.includes("PAY") || input.includes("DUE")) {
        setSimulatorOutput(
          "Matched Flow: Automated Dues Recovery & YouPI Pay\nAction -> Lookup Chit Ledger\nBot Message -> 'Hello! Your pending installment is ₹4,250. Pay via YouPI: http://localhost:3000/pay'"
        );
      } else if (input.includes("AUCTION") || input.includes("DIVIDEND")) {
        setSimulatorOutput(
          "Matched Flow: Auction Dividend & Winner Broadcast\nBot Message -> 'Monthly Auction Dividend: ₹750 has been credited against your chit ticket ledger!'"
        );
      } else if (input.includes("HELP") || input.includes("AGENT") || input.includes("HUMAN")) {
        setSimulatorOutput(
          "Matched Flow: Human Representative Handoff\nAction -> Automation Paused (automation_paused = true)\nAction -> Tag Added: 'Needs a person'\nBot Message -> 'Connecting you to foreperson admin...'"
        );
      } else {
        setSimulatorOutput(
          "Matched Flow: Chit Welcome & Plan Discovery\nBot Message -> 'Welcome to Apex Chits! Digital chit fund ledgers with sovereign 0% UPI collections.'"
        );
      }
      setIsSimulating(false);
    }, 400);
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-6">
      {/* Top action toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card shadow-xs">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Workflow className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">Visual Flow Automations</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                BrightBean Engine Active
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Multi-step chatbot flows, auto-responses, and human handoff triggers for WhatsApp, Instagram & Messenger.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadFlows}
            disabled={loading}
            className="p-2 border border-border bg-card hover:bg-muted text-foreground rounded-xl shadow-xs transition-colors disabled:opacity-50"
            title="Refresh Flows"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="size-4" />
            <span>New Flow Automation</span>
          </button>
        </div>
      </div>

      {/* Main Flow Layout: Left Sidebar List + Right Interactive Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* Flow List Sidebar */}
        <div className="lg:col-span-4 flex flex-col rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-border bg-muted/20 flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Active Workflows ({flows.length})</span>
            <span className="text-[10px] text-muted-foreground">Click to view graph</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {flows.map((flow) => {
              const isSelected = flow.id === activeFlow?.id;
              return (
                <div
                  key={flow.id}
                  onClick={() => setSelectedFlowId(flow.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs ring-1 ring-indigo-500/20"
                      : "border-border bg-card hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-foreground truncate">{flow.name}</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {flow.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2.5">
                    {flow.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/50 pt-2">
                    <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-[10px] text-foreground">
                      {flow.trigger_keyword}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <Zap className="size-3 text-amber-500" />
                      {flow.executions_count} runs
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Flow Simulator widget */}
          <div className="p-3.5 border-t border-border bg-muted/10 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Bot className="size-3.5 text-indigo-500" />
              <span>Simulate Inbound Message</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Try 'PAY', 'AUCTION', or 'AGENT'..."
                value={simulatorInput}
                onChange={(e) => setSimulatorInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSimulate()}
                className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
              >
                {isSimulating ? <RefreshCw className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
              </button>
            </div>
            {simulatorOutput && (
              <div className="p-2.5 rounded-lg bg-card border border-indigo-200 dark:border-indigo-800 text-[11px] font-mono whitespace-pre-line text-indigo-950 dark:text-indigo-200 mt-2">
                {simulatorOutput}
              </div>
            )}
          </div>
        </div>

        {/* Visual Graph Canvas */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          {/* Canvas Header */}
          <div className="p-4 border-b border-border bg-muted/10 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">{activeFlow?.name || "Flow Canvas"}</h3>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded-md bg-muted text-muted-foreground border border-border">
                  {activeFlow?.id}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{activeFlow?.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border text-xs">
                <Clock className="size-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">Trigger:</span>
                <span className="font-semibold text-foreground">{activeFlow?.trigger_type}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border text-xs">
                <CheckCircle2 className="size-3 text-emerald-500" />
                <span className="font-semibold text-foreground">{activeFlow?.executions_count} Executions</span>
              </div>
            </div>
          </div>

          {/* Canvas Nodes View */}
          <div className="flex-1 p-6 bg-gradient-to-br from-muted/5 via-card to-muted/10 overflow-y-auto flex flex-col justify-center">
            {parsedNodes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-xs">
                No nodes configured for this flow.
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4 max-w-xl mx-auto w-full py-4">
                {parsedNodes.map((node, idx) => {
                  const isLast = idx === parsedNodes.length - 1;

                  let badgeColor = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
                  let icon = <MessageSquare className="size-4 text-blue-500" />;

                  if (node.type === "trigger") {
                    badgeColor = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
                    icon = <Zap className="size-4 text-amber-500" />;
                  } else if (node.type === "action") {
                    badgeColor = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
                    icon = <Tag className="size-4 text-purple-500" />;
                  } else if (node.type === "condition") {
                    badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
                    icon = <Split className="size-4 text-emerald-500" />;
                  } else if (node.type === "delay") {
                    badgeColor = "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800";
                    icon = <Clock className="size-4 text-slate-500" />;
                  }

                  return (
                    <React.Fragment key={node.id}>
                      <div className="w-full p-4 rounded-xl border border-border bg-card shadow-xs hover:shadow-md transition-all relative group">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-muted/40 border border-border shrink-0 mt-0.5">
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase border ${badgeColor}`}>
                                {node.type.replace("_", " ")}
                              </span>
                              <span className="text-[10px] font-mono text-muted-foreground">
                                Step #{idx + 1}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-foreground leading-relaxed">
                              {node.label}
                            </p>
                          </div>
                        </div>
                      </div>

                      {!isLast && (
                        <div className="flex flex-col items-center">
                          <div className="w-0.5 h-6 bg-border" />
                          <div className="size-5 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground text-[10px] shadow-xs">
                            ↓
                          </div>
                          <div className="w-0.5 h-6 bg-border" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Flow Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in-50 zoom-in-95">
            <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Workflow className="size-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Create BrightBean Flow Automation</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFlow} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Flow Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KYC Verification & Document Collector"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Description</label>
                <textarea
                  rows={2}
                  placeholder="Explains purpose and chit fund action triggered..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Trigger Keyword</label>
                  <input
                    type="text"
                    placeholder="e.g. KYC, DOCS, AADHAAR"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Trigger Type</label>
                  <select
                    value={newTriggerType}
                    onChange={(e) => setNewTriggerType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="keyword">Keyword Match</option>
                    <option value="welcome">First Inbound Contact</option>
                    <option value="event">Chit Auction Event</option>
                    <option value="tag">Subscriber Tagged</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Load Flow Template</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded-xl p-2 bg-muted/10">
                  {TEMPLATE_OPTIONS.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        setSelectedTemplate(tpl.id);
                        if (!newName) setNewName(tpl.name);
                        if (!newDesc) setNewDesc(tpl.description);
                        if (!newKeyword) setNewKeyword(tpl.trigger_keyword);
                      }}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                        selectedTemplate === tpl.id
                          ? "border-primary bg-primary/10"
                          : "border-border/60 bg-card hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{tpl.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{tpl.trigger_keyword}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{tpl.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl shadow-xs"
                >
                  Save & Activate Flow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
