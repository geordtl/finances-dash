'use client'

import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { MonthSummary } from '@/lib/finance/calc'
import { formatCurrency, parseAmount } from '@/lib/finance/format'
import { Panel, PanelHeader } from './panel'

export function IncomeSettings({
  salary,
  savingsRate,
  summary,
  onSalaryChange,
  onSavingsRateChange,
}: {
  salary: number
  savingsRate: number
  summary: MonthSummary
  onSalaryChange: (value: number) => void
  onSavingsRateChange: (value: number) => void
}) {
  const salaryId = useId()
  const rateId = useId()

  return (
    <Panel className="flex flex-col gap-6">
      <PanelHeader title="Sua renda" description="Base usada para calcular o quanto você pode gastar." />

      <div className="flex flex-col gap-2">
        <Label htmlFor={salaryId}>Salário mensal líquido</Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
            R$
          </span>
          <Input
            id={salaryId}
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={salary || ''}
            placeholder="0,00"
            onChange={(e) => onSalaryChange(parseAmount(e.target.value))}
            className="h-10 pl-9 text-base font-medium tabular-nums"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label htmlFor={rateId}>Guardar no cofrinho</Label>
          <span className="text-sm font-semibold tabular-nums">{savingsRate}%</span>
        </div>
        <input
          id={rateId}
          type="range"
          min={0}
          max={50}
          step={5}
          value={savingsRate}
          onChange={(e) => onSavingsRateChange(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <p className="text-xs leading-relaxed text-muted-foreground">
          {formatCurrency(summary.savingsReserve)} por mês reservados antes de calcular seus gastos.
        </p>
      </div>

      <dl className="mt-auto flex flex-col gap-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Renda total do mês</dt>
          <dd className="font-medium tabular-nums">{formatCurrency(summary.income)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Limite p/ gastos variáveis</dt>
          <dd className="font-medium tabular-nums">{formatCurrency(summary.variableBudget)}</dd>
        </div>
      </dl>
    </Panel>
  )
}
