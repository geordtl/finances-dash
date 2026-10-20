import { ChevronLeft, ChevronRight, RotateCcw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatMonthLabel, shiftMonth } from '@/lib/finance/format'

export function AppHeader({
  month,
  onMonthChange,
  onReset,
  onLoadSample,
}: {
  month: string
  onMonthChange: (month: string) => void
  onReset: () => void
  onLoadSample: () => void
}) {
  return (
    <header className="border-b border-border bg-card/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="flex items-center gap-2.5">
          <div
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-lg bg-foreground text-sm font-bold text-background"
          >
            P
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">Prumo</span>
            <span className="text-xs text-muted-foreground">Finanças pessoais</span>
          </div>
        </div>

        <nav aria-label="Selecionar mês" className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onMonthChange(shiftMonth(month, -1))}
            aria-label="Mês anterior"
          >
            <ChevronLeft />
          </Button>
          <span className="min-w-36 text-center text-sm font-medium tabular-nums" aria-live="polite">
            {formatMonthLabel(month)}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onMonthChange(shiftMonth(month, 1))}
            aria-label="Próximo mês"
          >
            <ChevronRight />
          </Button>
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onLoadSample}>
            <Sparkles data-icon="inline-start" />
            Exemplo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.confirm('Apagar todos os dados e começar do zero?')) onReset()
            }}
          >
            <RotateCcw data-icon="inline-start" />
            Zerar
          </Button>
        </div>
      </div>
    </header>
  )
}
