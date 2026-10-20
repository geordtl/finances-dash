import { AlertTriangle, CheckCircle2, OctagonAlert } from 'lucide-react'
import type { BudgetStatus, MonthSummary } from '@/lib/finance/calc'
import { formatCurrency } from '@/lib/finance/format'
import { cn } from '@/lib/utils'

const STATUS_META: Record<BudgetStatus, { label: string; icon: typeof CheckCircle2; className: string }> = {
  ok: { label: 'Dentro do orçamento', icon: CheckCircle2, className: 'bg-primary text-primary-foreground' },
  warning: { label: 'Atenção ao ritmo', icon: AlertTriangle, className: 'bg-warning text-foreground' },
  over: { label: 'Acima do limite', icon: OctagonAlert, className: 'bg-destructive text-primary-foreground' },
}

export function BudgetHero({ summary, className }: { summary: MonthSummary; className?: string }) {
  const status = STATUS_META[summary.status]
  const StatusIcon = status.icon
  const exceeded = summary.remaining < 0

  const base = Math.max(
    summary.income,
    summary.fixedTotal + summary.variableSpent + summary.savingsReserve,
    1,
  )
  const free = Math.max(summary.remaining, 0)
  const segments = [
    { key: 'fixos', label: 'Fixos', value: summary.fixedTotal, className: 'bg-background/45' },
    {
      key: 'variaveis',
      label: 'Gastos do mês',
      value: summary.variableSpent,
      className: exceeded ? 'bg-destructive' : 'bg-warning',
    },
    { key: 'reserva', label: 'Cofrinho', value: summary.savingsReserve, className: 'bg-primary' },
    { key: 'livre', label: 'Livre p/ gastar', value: free, className: 'bg-background/12' },
  ]

  let pace = 'Mês encerrado'
  if (summary.daysLeft > 0) {
    pace = summary.isCurrentMonth
      ? `≈ ${formatCurrency(summary.dailySuggested)} por dia nos próximos ${summary.daysLeft} ${summary.daysLeft === 1 ? 'dia' : 'dias'}`
      : `≈ ${formatCurrency(summary.dailySuggested)} por dia ao longo do mês`
  }

  return (
    <section
      aria-labelledby="hero-title"
      className={cn(
        'flex flex-col justify-between gap-8 rounded-2xl bg-foreground p-6 text-background md:p-8',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="hero-title" className="text-sm font-medium text-background/70">
          Sugestão de gasto para o mês
        </h2>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
            status.className,
          )}
        >
          <StatusIcon className="size-3.5" aria-hidden="true" />
          {status.label}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-background/70">
          {exceeded ? 'Você ultrapassou o limite em' : 'Você ainda pode gastar'}
        </p>
        <p
          className={cn(
            'text-5xl font-semibold tracking-tight tabular-nums md:text-6xl',
            exceeded && 'text-destructive',
          )}
        >
          {formatCurrency(Math.abs(summary.remaining))}
        </p>
        <p className="text-sm leading-relaxed text-background/70">
          {exceeded
            ? 'Evite novos gastos variáveis até o fim do mês para não comprometer o próximo.'
            : pace}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div
          className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-background/10"
          role="img"
          aria-label="Distribuição da renda do mês"
        >
          {segments.map((s) =>
            s.value > 0 ? (
              <div
                key={s.key}
                className={cn('h-full transition-[width] duration-500 ease-out', s.className)}
                style={{ width: `${(s.value / base) * 100}%` }}
              />
            ) : null,
          )}
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4">
          {segments.map((s) => (
            <div key={s.key} className="flex flex-col gap-1">
              <dt className="flex items-center gap-2 text-xs text-background/60">
                <span aria-hidden="true" className={cn('size-2 rounded-full', s.className)} />
                {s.label}
              </dt>
              <dd className="text-sm font-medium tabular-nums">{formatCurrency(s.value)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
