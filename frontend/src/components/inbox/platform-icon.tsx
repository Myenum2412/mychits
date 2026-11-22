"use client";

import * as React from "react";
import { cn } from "cn";
import type { Platform } from "./types";
import {
  SvglWhatsapp,
  SvglInstagram,
  SvglMessenger,
  SvglFacebook,
  SvglTelegram,
  SvglX,
  SvglTwitter,
  SvglBluesky,
  SvglReddit,
} from "@/components/ui/svgl-icons";

export const PLATFORM_LABELS: Record<Platform, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Messenger",
  twitter: "X (Twitter)",
  telegram: "Telegram",
  bluesky: "Bluesky",
  reddit: "Reddit",
};

interface PlatformIconProps {
  platform: Platform;
  className?: string;
  showBadge?: boolean;
}

export function PlatformIcon({
  platform,
  className,
  showBadge = false,
}: PlatformIconProps) {
  const renderSvg = () => {
    switch (platform) {
      case "whatsapp":
        return <SvglWhatsapp className="size-full shrink-0" />;

      case "instagram":
        return <SvglInstagram className="size-full shrink-0" />;

      case "facebook":
        return <SvglMessenger className="size-full shrink-0" />;

      case "telegram":
        return <SvglTelegram className="size-full shrink-0" />;

      case "twitter":
        return (
          <div className="size-full rounded-full bg-black dark:bg-white flex items-center justify-center p-[18%]">
            <SvglX className="size-full text-white dark:text-black shrink-0" />
          </div>
        );

      case "bluesky":
        return <SvglBluesky className="size-full shrink-0" />;

      case "reddit":
        return <SvglReddit className="size-full shrink-0" />;

      default:
        return (
          <span className="font-bold text-[10px] uppercase text-muted-foreground">
            {String(platform).slice(0, 2)}
          </span>
        );
    }
  };

  if (showBadge) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center size-6 shrink-0 rounded-full shadow-xs transition-transform hover:scale-105 overflow-hidden",
          className
        )}
        title={PLATFORM_LABELS[platform]}
      >
        {renderSvg()}
      </span>
    );
  }

  return (
    <span
      aria-label={PLATFORM_LABELS[platform]}
      className={cn("inline-flex items-center justify-center size-4 shrink-0 overflow-hidden", className)}
    >
      {renderSvg()}
    </span>
  );
}

export default PlatformIcon;
