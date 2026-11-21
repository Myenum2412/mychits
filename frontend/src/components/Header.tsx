"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export function Header({ title }: { title: string }) {
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

  const checkStatus = async () => {
    setBackendStatus("checking");
    try {
      const res = await fetch("http://127.0.0.1:8000/health", { cache: "no-store" });
      if (res.ok) {
        setBackendStatus("online");
      } else {
        setBackendStatus("offline");
      }
    } catch {
      setBackendStatus("offline");
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          {backendStatus === "checking" && (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-400" />
              <span className="text-slate-500 dark:text-slate-400">Connecting to FastAPI...</span>
            </>
          )}
          {backendStatus === "online" && (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-700 dark:text-emerald-400">FastAPI Online</span>
            </>
          )}
          {backendStatus === "offline" && (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-amber-700 dark:text-amber-400">FastAPI Offline (Start Backend on :8000)</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
