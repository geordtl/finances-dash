import { AlertTriangle, CheckCircle2, Info, OctagonAlert } from 'lucide-react'
import type { AlertLevel, FinanceAlert } from '@/lib/finance/calc'
import { cn } from '@/lib/utils'

const LEVEL_META: Record<AlertLevel, { icon: typeof Info; className: string; iconClass: string }> = {
  danger: {
    icon: OctagonAlert,
    className: 'border-destructive/40 bg-destructive/5',
    iconClass: 'bg-destructive text-primary-foreground',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-warning/60 bg-warning/10',
    iconClass: 'bg-warning text-foreground',
  },
  info: {
    icon: Info,
    className: 'border-border bg-card',
    iconClass: 'bg-muted text-foreground',
  },
  success: {
    icon: CheckCircle2,
    className: 'border-primary/30 bg-accent',
    iconClass: 'bg-primary text-primary-foreground',
  },
}

export function AlertsList({ alerts }: { alerts: FinanceAlert[] }) {
  if (alerts.length === 0) return null

  return (
    <section aria-label="Avisos do orçamento" className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {alerts.map((alert) => {
        const meta = LEVEL_META[alert.level]
        const Icon = meta.icon
        return (
          <div
            key={alert.id}
            role={alert.level === 'danger' ? 'alert' : 'status'}
            className={cn('flex items-start gap-3 rounded-2xl border p-4', meta.className)}
          >
            <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', meta.iconClass)}>
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold">{alert.title}</p>
              <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{alert.description}</p>
            </div>
          </div>
        )
      })}
    </section>
  )
}
