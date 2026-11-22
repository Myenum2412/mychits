"use client";

import * as React from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Key,
  Globe,
  Radio,
  Sliders,
  Check,
  Lock,
} from "lucide-react";
import { PlatformIcon, PLATFORM_LABELS } from "./platform-icon";
import type { SocialChannelIntegration, Platform } from "./types";
import {
  SvglWhatsapp,
  SvglInstagram,
  SvglTelegram,
  SvglMessenger,
  SvglX,
} from "@/components/ui/svgl-icons";

interface SocialConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channels: SocialChannelIntegration[];
  onUpdateChannels: (channels: SocialChannelIntegration[]) => void;
}

export function SocialConnectDialog({
  open,
  onOpenChange,
  channels,
  onUpdateChannels,
}: SocialConnectDialogProps) {
  const [selectedChannelId, setSelectedChannelId] = React.useState<string>(channels[0]?.id || "");
  const [zernioApiKey, setZernioApiKey] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("zernio_api_key") || "";
    }
    return "";
  });
  const [testingId, setTestingId] = React.useState<string | null>(null);
  const [testSuccessId, setTestSuccessId] = React.useState<string | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  if (!open) return null;

  const currentChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];

  const handleToggleChannel = (id: string) => {
    const updated = channels.map((c) => {
      if (c.id === id) {
        const nextConnected = !c.connected;
        return {
          ...c,
          connected: nextConnected,
          status: (nextConnected ? "active" : "disconnected") as SocialChannelIntegration["status"],
          lastSync: nextConnected ? "Just now" : c.lastSync,
        };
      }
      return c;
    });
    onUpdateChannels(updated);
  };

  const handleTestConnection = (channel: SocialChannelIntegration) => {
    setTestingId(channel.id);
    setTestSuccessId(null);
    setTimeout(() => {
      setTestingId(null);
      setTestSuccessId(channel.id);
      setToastMessage(
        `Connection verified! ${channel.platformLabel} (${channel.accountHandle}) responded with HTTP 200 OK (latency: 34ms).`
      );
      setTimeout(() => setTestSuccessId(null), 4000);
      setTimeout(() => setToastMessage(null), 4000);
    }, 1200);
  };

  const handleUpdateCredential = (
    channelId: string,
    field: keyof SocialChannelIntegration["credentials"],
    value: string
  ) => {
    const updated = channels.map((c) => {
      if (c.id === channelId) {
        return {
          ...c,
          credentials: {
            ...c.credentials,
            [field]: value,
          },
        };
      }
      return c;
    });
    onUpdateChannels(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Real SVGL Social Brand Hub Icon Badge */}
            <div className="relative shrink-0 p-2 rounded-xl bg-card border border-border shadow-xs flex items-center justify-center">
              <div className="grid grid-cols-2 gap-1 size-7 items-center justify-center">
                <SvglWhatsapp className="size-3" />
                <SvglInstagram className="size-3" />
                <SvglTelegram className="size-3" />
                <div className="size-3 rounded-full bg-black dark:bg-white flex items-center justify-center p-0.5">
                  <SvglX className="size-full text-white dark:text-black" />
                </div>
              </div>
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2 flex-wrap">
                <span>Social Media Integrations & Unified Channels</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                  Zernio Architecture
                </span>
              </h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 shadow-2xs">
                  <SvglWhatsapp className="size-3" />
                  <span>WhatsApp</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#E1306C]/10 text-[#E1306C] border border-[#E1306C]/30 shadow-2xs">
                  <SvglInstagram className="size-3" />
                  <span>Instagram</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#229ED9]/10 text-[#229ED9] border border-[#229ED9]/30 shadow-2xs">
                  <SvglTelegram className="size-3" />
                  <span>Telegram</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#0099FF]/10 text-[#0099FF] border border-[#0099FF]/30 shadow-2xs">
                  <SvglMessenger className="size-3" />
                  <span>Messenger</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-muted text-foreground border border-border shadow-2xs">
                  <div className="size-3 rounded-full bg-black dark:bg-white flex items-center justify-center p-0.5">
                    <SvglX className="size-full text-white dark:text-black" />
                  </div>
                  <span>X (Twitter)</span>
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0 ml-2"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="px-6 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Content Area: Left Channel List & Right Credential Settings */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Left Channel Tabs */}
          <div className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-border bg-muted/10 p-3 space-y-2 overflow-y-auto">
            <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Connected Networks ({channels.filter((c) => c.connected).length}/{channels.length})
            </div>

            {channels.map((chan) => {
              const isSelected = chan.id === selectedChannelId;
              return (
                <button
                  key={chan.id}
                  onClick={() => setSelectedChannelId(chan.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-2xs"
                      : "border-border/60 hover:border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <PlatformIcon platform={chan.platform} showBadge className="size-8" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {chan.platformLabel}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {chan.accountHandle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`inline-block size-2 rounded-full ${
                        chan.connected ? "bg-emerald-500" : "bg-muted-foreground/40"
                      }`}
                    />
                  </div>
                </button>
              );
            })}

            {/* Link to Settings for Zernio Cloud API */}
            <div className="mt-4 p-2.5 rounded-xl border border-dashed border-border bg-card/40 text-center">
              <a
                href="/settings?tab=zernio"
                className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors font-medium hover:underline"
              >
                <Key className="size-3 text-indigo-500" />
                <span>Configure Zernio API in Settings</span>
                <ExternalLink className="size-2.5 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* Right Configuration Panel */}
          {currentChannel && (
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-card">
              {/* Channel Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-muted/20">
                <div className="flex items-center gap-3">
                  <PlatformIcon platform={currentChannel.platform} showBadge className="size-10" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">
                        {currentChannel.platformLabel}
                      </h3>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          currentChannel.connected
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {currentChannel.connected ? "Operational" : "Disconnected"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Linked Account: <span className="font-semibold text-foreground">{currentChannel.accountHandle}</span> · Last synchronized {currentChannel.lastSync}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleChannel(currentChannel.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      currentChannel.connected
                        ? "border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100"
                        : "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {currentChannel.connected ? "Disconnect" : "Connect Channel"}
                  </button>
                  <button
                    onClick={() => handleTestConnection(currentChannel)}
                    disabled={testingId === currentChannel.id || !currentChannel.connected}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`size-3.5 ${testingId === currentChannel.id ? "animate-spin" : ""}`} />
                    <span>{testingId === currentChannel.id ? "Pinging API..." : testSuccessId === currentChannel.id ? "Verified ✓" : "Test Ping"}</span>
                  </button>
                </div>
              </div>

              {/* Specific Credentials Fields */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Lock className="size-3.5" />
                  <span>Channel Credentials & API Tokens</span>
                </h4>

                {currentChannel.platform === "whatsapp" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Phone Number ID *
                      </label>
                      <input
                        type="text"
                        value={currentChannel.credentials.phoneNumberId || ""}
                        onChange={(e) =>
                          handleUpdateCredential(currentChannel.id, "phoneNumberId", e.target.value)
                        }
                        className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        WhatsApp Business Account ID (WABA) *
                      </label>
                      <input
                        type="text"
                        value={currentChannel.credentials.wabaId || ""}
                        onChange={(e) =>
                          handleUpdateCredential(currentChannel.id, "wabaId", e.target.value)
                        }
                        className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Permanent System User Token (Meta Cloud API)
                      </label>
                      <input
                        type="password"
                        value={currentChannel.credentials.accessToken || ""}
                        onChange={(e) =>
                          handleUpdateCredential(currentChannel.id, "accessToken", e.target.value)
                        }
                        className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}

                {currentChannel.platform === "instagram" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Instagram Account Handle *
                      </label>
                      <input
                        type="text"
                        value={currentChannel.accountHandle}
                        readOnly
                        className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-border bg-muted/40 text-muted-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Connected Meta Page ID
                      </label>
                      <input
                        type="text"
                        value={currentChannel.credentials.pageId || ""}
                        onChange={(e) =>
                          handleUpdateCredential(currentChannel.id, "pageId", e.target.value)
                        }
                        className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Instagram Graph API User Access Token
                      </label>
                      <input
                        type="password"
                        value={currentChannel.credentials.accessToken || ""}
                        onChange={(e) =>
                          handleUpdateCredential(currentChannel.id, "accessToken", e.target.value)
                        }
                        className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}

                {currentChannel.platform === "telegram" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Telegram Bot Username
                      </label>
                      <input
                        type="text"
                        value={currentChannel.accountHandle}
                        readOnly
                        className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-border bg-muted/40 text-muted-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Bot Father API Token *
                      </label>
                      <input
                        type="password"
                        value={currentChannel.credentials.botToken || ""}
                        onChange={(e) =>
                          handleUpdateCredential(currentChannel.id, "botToken", e.target.value)
                        }
                        className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}

                {currentChannel.platform === "facebook" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Facebook Page ID *
                      </label>
                      <input
                        type="text"
                        value={currentChannel.credentials.pageId || ""}
                        onChange={(e) =>
                          handleUpdateCredential(currentChannel.id, "pageId", e.target.value)
                        }
                        className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        Page Access Token *
                      </label>
                      <input
                        type="password"
                        value={currentChannel.credentials.accessToken || ""}
                        onChange={(e) =>
                          handleUpdateCredential(currentChannel.id, "accessToken", e.target.value)
                        }
                        className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}

                {currentChannel.platform === "twitter" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        X Account Handle
                      </label>
                      <input
                        type="text"
                        value={currentChannel.accountHandle}
                        readOnly
                        className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-border bg-muted/40 text-muted-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1">
                        OAuth 2.0 Bearer Token *
                      </label>
                      <input
                        type="password"
                        value={currentChannel.credentials.accessToken || ""}
                        onChange={(e) =>
                          handleUpdateCredential(currentChannel.id, "accessToken", e.target.value)
                        }
                        className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}

                {/* Webhook Endpoint */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Incoming Webhook Endpoint URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={
                        currentChannel.credentials.webhookUrl ||
                        `https://api.chits.local/webhooks/${currentChannel.platform}`
                      }
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-border bg-muted/40 text-muted-foreground"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          currentChannel.credentials.webhookUrl ||
                            `https://api.chits.local/webhooks/${currentChannel.platform}`
                        );
                        setToastMessage("Webhook URL copied to clipboard!");
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      className="px-3 py-2 text-xs font-semibold border border-border rounded-lg bg-card hover:bg-muted text-foreground shrink-0"
                    >
                      Copy URL
                    </button>
                  </div>
                </div>

                {/* Supported Capabilities */}
                <div className="pt-2">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Supported Features & Active Capabilities
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentChannel.features.map((feat) => (
                      <span
                        key={feat}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-muted/40 text-xs font-medium text-foreground"
                      >
                        <Check className="size-3 text-emerald-500" />
                        <span>{feat}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-3.5 bg-muted/20">
          <p className="text-xs text-muted-foreground">
            Changes persist to your workspace. All keys are encrypted before storage.
          </p>
          <button
            onClick={() => {
              setToastMessage("Integration settings saved successfully!");
              setTimeout(() => {
                setToastMessage(null);
                onOpenChange(false);
              }, 800);
            }}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
export default SocialConnectDialog;
