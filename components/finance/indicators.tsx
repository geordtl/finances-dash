import { ArrowDownRight, ArrowUpRight, Gauge, Wallet } from 'lucide-react'
import type { MonthSummary } from '@/lib/finance/calc'
import { formatCurrency, formatPercent } from '@/lib/finance/format'
import { cn } from '@/lib/utils'
import { ProgressBar } from './panel'

type Tone = 'neutral' | 'good' | 'warning' | 'danger'

const TONE_STYLES: Record<Tone, { card: string; icon: string; value: string }> = {
  neutral: { card: 'border-border', icon: 'bg-muted text-foreground', value: 'text-foreground' },
  good: { card: 'border-border', icon: 'bg-accent text-accent-foreground', value: 'text-foreground' },
  warning: {
    card: 'border-warning ring-1 ring-warning/40',
    icon: 'bg-warning/20 text-warning-foreground',
    value: 'text-warning-foreground',
  },
  danger: {
    card: 'border-destructive ring-1 ring-destructive/30',
    icon: 'bg-destructive/10 text-destructive',
    value: 'text-destructive',
  },
}

function IndicatorCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  children,
}: {
  label: string
  value: string
  detail: string
  icon: typeof Wallet
  tone: Tone
  children?: React.ReactNode
}) {
  const styles = TONE_STYLES[tone]
  return (
    <article className={cn('flex flex-col gap-4 rounded-2xl border bg-card p-5', styles.card)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
        <span className={cn('flex size-8 items-center justify-center rounded-lg', styles.icon)}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <p className={cn('text-2xl font-semibold tracking-tight tabular-nums', styles.value)}>{value}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{detail}</p>
      </div>
      {children}
    </article>
  )
}

export function Indicators({ summary }: { summary: MonthSummary }) {
  const commitmentTone: Tone =
    summary.commitment > 1 ? 'danger' : summary.commitment >= 0.85 ? 'warning' : 'good'
  const spentTone: Tone =
    summary.remaining < 0 ? 'danger' : summary.status === 'warning' ? 'warning' : 'neutral'
  const balanceTone: Tone = summary.balance < 0 ? 'danger' : 'good'

  return (
    <section aria-label="Indicadores do mês" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <IndicatorCard
        label="Entradas"
        value={formatCurrency(summary.income)}
        detail={`Salário ${formatCurrency(summary.salary)} + extras ${formatCurrency(summary.extraIncome)}`}
        icon={ArrowUpRight}
        tone="good"
      />
      <IndicatorCard
        label="Saídas"
        value={formatCurrency(summary.totalSpent)}
        detail={`Fixos ${formatCurrency(summary.fixedTotal)} · Variáveis ${formatCurrency(summary.variableSpent)}`}
        icon={ArrowDownRight}
        tone={spentTone}
      />
      <IndicatorCard
        label="Saldo do mês"
        value={formatCurrency(summary.balance)}
        detail={summary.balance < 0 ? 'Você gastou mais do que recebeu' : 'Entradas menos todas as saídas'}
        icon={Wallet}
        tone={balanceTone}
      />
      <IndicatorCard
        label="Renda comprometida"
        value={formatPercent(summary.commitment)}
        detail={
          summary.commitment > 1
            ? 'Acima de 100% da sua renda'
            : summary.commitment >= 0.85
              ? 'Pouca margem até o fim do mês'
              : 'Margem saudável'
        }
        icon={Gauge}
        tone={commitmentTone}
      >
        <ProgressBar
          label="Percentual da renda comprometida"
          value={summary.commitment}
          tone={commitmentTone === 'danger' ? 'destructive' : commitmentTone === 'warning' ? 'warning' : 'primary'}
        />
      </IndicatorCard>
    </section>
  )
}
