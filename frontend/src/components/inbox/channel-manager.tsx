"use client";

import * as React from "react";
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Plus,
  ShieldCheck,
  Send,
  Link2,
  Settings,
} from "lucide-react";
import {
  SvglWhatsapp,
  SvglInstagram,
  SvglTelegram,
} from "@/components/ui/svgl-icons";
import { api, type MetaStatusResponse, type WhatsAppSession } from "@/lib/api";
import { PlatformIcon } from "./platform-icon";

interface ChannelManagerProps {
  onOpenConnect: () => void;
}

export function ChannelManager({ onOpenConnect }: ChannelManagerProps) {
  const [metaStatus, setMetaStatus] = React.useState<MetaStatusResponse | null>(null);
  const [waStatus, setWaStatus] = React.useState<WhatsAppSession | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [testResult, setTestResult] = React.useState<string | null>(null);

  const fetchStatus = React.useCallback(async () => {
    setLoading(true);
    try {
      const [meta, wa] = await Promise.allSettled([
        api.getMetaStatus(),
        api.getWhatsAppStatus(),
      ]);
      if (meta.status === "fulfilled") setMetaStatus(meta.value);
      if (wa.status === "fulfilled") setWaStatus(wa.value);
    } catch (err) {
      console.warn("Could not fetch channel statuses:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handlePingMeta = async () => {
    setTestResult("Pinging Meta Graph API v21.0 endpoint...");
    try {
      const res = await api.getMetaStatus();
      setMetaStatus(res);
      setTestResult(`Meta Graph API v21.0 is healthy. Webhook: ${res.webhook_url}`);
    } catch {
      setTestResult("Meta Graph API returned an error or is offline.");
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card shadow-xs">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Globe className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">Connected Channels & Official APIs</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Official Graph API
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Direct integration with Meta Graph API v21.0 (Instagram & Messenger), WhatsApp Web, and Telegram.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="p-2 border border-border bg-card hover:bg-muted text-foreground rounded-xl shadow-xs transition-colors disabled:opacity-50"
            title="Refresh Channels"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={onOpenConnect}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="size-4" />
            <span>Manage Integrations</span>
          </button>
        </div>
      </div>

      {/* Channel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Meta Graph API Card (Instagram Direct & Facebook Messenger) */}
        <div className="rounded-2xl border border-border bg-card shadow-xs p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center -space-x-1">
                  <SvglInstagram className="size-5 rounded-full ring-2 ring-background" />
                  <span className="size-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-background">
                    f
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground">Meta Graph API</h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                v21.0
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Official Instagram Direct & Facebook Messenger webhook engine for 2-way messaging and comment-to-DM triggers.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-muted/20 border border-border text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Instagram Direct:</span>
                <span className="font-semibold text-foreground">
                  {metaStatus?.instagram?.connected ? `@${metaStatus.instagram.username}` : "Ready to Link"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Facebook Messenger:</span>
                <span className="font-semibold text-foreground">
                  {metaStatus?.facebook?.connected ? metaStatus.facebook.page_name : "Ready to Link"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Webhook Verify:</span>
                <span className="font-mono text-[10px] text-foreground bg-muted px-1.5 py-0.5 rounded">
                  {metaStatus?.webhook_verify_token || "chitfund_meta_verify_2026"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <button
              onClick={handlePingMeta}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-colors"
            >
              <RefreshCw className="size-3.5" />
              <span>Test Graph API v21.0 Health</span>
            </button>
            <a
              href="https://developers.facebook.com/docs/graph-api/"
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-muted-foreground hover:text-foreground text-[11px] transition-colors"
            >
              <ExternalLink className="size-3" />
              <span>Official Meta Graph Docs</span>
            </a>
          </div>
        </div>

        {/* 2. WhatsApp Business (wwebjs.dev Session) */}
        <div className="rounded-2xl border border-border bg-card shadow-xs p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <SvglWhatsapp className="size-5" />
                <h3 className="text-sm font-bold text-foreground">WhatsApp Business</h3>
              </div>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  waStatus?.status === "connected"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                }`}
              >
                {waStatus?.status === "connected" ? "Connected" : "Standby / QR"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Direct WhatsApp Session for automated chit payment reminders, instant PDF receipts, and auction alerts.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-muted/20 border border-border text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Engine:</span>
                <span className="font-semibold text-foreground">wwebjs.dev / Cloud API</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active Number:</span>
                <span className="font-mono text-[11px] font-semibold text-foreground">
                  {waStatus?.connected_number || "+91 (Main Branch)"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Automated Dues:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Enabled</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <button
              onClick={onOpenConnect}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
            >
              <Link2 className="size-3.5" />
              <span>Connect / Pair WhatsApp QR</span>
            </button>
            <span className="block text-center text-[10px] text-muted-foreground">
              Fast pairing via WhatsApp mobile scanner
            </span>
          </div>
        </div>

        {/* 3. Telegram Bot API */}
        <div className="rounded-2xl border border-border bg-card shadow-xs p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <SvglTelegram className="size-5" />
                <h3 className="text-sm font-bold text-foreground">Telegram Bot</h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                BotFather API
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              High-speed subscriber channel for live auction bidding alerts, monthly dividend notifications, and customer inquiries.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-muted/20 border border-border text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bot Handle:</span>
                <span className="font-semibold text-foreground">@ApexChitsBot</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Webhook Status:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Listening</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Auction Bidding:</span>
                <span className="text-foreground font-semibold">Live Realtime</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <button
              onClick={onOpenConnect}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-colors"
            >
              <Settings className="size-3.5" />
              <span>Configure Telegram Token</span>
            </button>
            <span className="block text-center text-[10px] text-muted-foreground">
              Official Telegram Bot API 7.0
            </span>
          </div>
        </div>
      </div>

      {testResult && (
        <div className="p-3.5 rounded-xl border border-border bg-card text-xs font-mono text-foreground flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
          <span>{testResult}</span>
        </div>
      )}
    </div>
  );
}
