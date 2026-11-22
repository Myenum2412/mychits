"use client"

import * as React from "react"
import { cn } from "cn"

export interface PageHeaderStat {
  label: string
  value: string | number
  delta?: string
  deltaType?: "positive" | "negative" | "neutral"
}

export interface PageHeader6Props {
  tag?: string
  title: string
  description?: string
  actions?: React.ReactNode
  stats?: PageHeaderStat[]
  className?: string
}

export function PageHeader6({
  tag,
  title,
  description,
  actions,
  stats,
  className,
}: PageHeader6Props) {
  return (
    <div className={cn("w-full space-y-5", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          {tag && (
            <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
              {tag}
            </p>
          )}
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </div>

      {stats && stats.length > 0 && (
        <dl className={cn(
          "w-full grid gap-px overflow-hidden rounded-xl border border-border bg-border shadow-xs",
          stats.length === 2 ? "grid-cols-2" :
          stats.length === 3 ? "grid-cols-1 sm:grid-cols-3" :
          "grid-cols-2 lg:grid-cols-4"
        )}>
          {stats.map(({ label, value, delta, deltaType }) => (
            <div key={label} className="flex flex-col gap-1 bg-card p-4 transition-colors hover:bg-card/90">
              <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
              <dd className="text-xl font-bold tracking-tight text-foreground tabular-nums">
                {value}
              </dd>
              {delta && (
                <dd
                  className={cn(
                    "text-xs font-medium tabular-nums",
                    deltaType === "positive"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : deltaType === "negative"
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-muted-foreground"
                  )}
                >
                  {delta}
                </dd>
              )}
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
export default PageHeader6
