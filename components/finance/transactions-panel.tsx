'use client'

import { useId, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FinanceActions } from '@/lib/finance/store'
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type Transaction,
  type TransactionType,
} from '@/lib/finance/types'
import { formatCurrency, formatShortDate, parseAmount, toISODate, toMonthKey } from '@/lib/finance/format'
import { cn } from '@/lib/utils'
import { NativeSelect } from './panel'

function defaultDateFor(month: string) {
  const today = new Date()
  return toMonthKey(today) === month ? toISODate(today) : `${month}-01`
}

export function TransactionsPanel({
  month,
  transactions,
  actions,
}: {
  month: string
  transactions: Transaction[]
  actions: FinanceActions
}) {
  const formId = useId()
  const [type, setType] = useState<TransactionType>('saida')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0])
  const [date, setDate] = useState(() => defaultDateFor(month))

  const categories = type === 'saida' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
  const monthTransactions = transactions
    .filter((t) => t.date.startsWith(month))
    .sort((a, b) => b.date.localeCompare(a.date))

  function changeType(next: TransactionType) {
    setType(next)
    setCategory(next === 'saida' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0])
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const value = parseAmount(amount)
    if (!description.trim() || value <= 0 || !date) return
    actions.addTransaction({ type, description: description.trim(), amount: value, category, date })
    setDescription('')
    setAmount('')
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl bg-muted/60 p-4">
        <div role="radiogroup" aria-label="Tipo de lançamento" className="grid grid-cols-2 gap-1 rounded-lg bg-card p-1">
          {(['saida', 'entrada'] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={type === option}
              onClick={() => changeType(option)}
              className={cn(
                'flex h-8 items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-colors',
                type === option
                  ? option === 'saida'
                    ? 'bg-foreground text-background'
                    : 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {option === 'saida' ? (
                <ArrowDownRight className="size-4" aria-hidden="true" />
              ) : (
                <ArrowUpRight className="size-4" aria-hidden="true" />
              )}
              {option === 'saida' ? 'Saída' : 'Entrada'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor={`${formId}-desc`}>Descrição</Label>
            <Input
              id={`${formId}-desc`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === 'saida' ? 'Ex: Mercado da semana' : 'Ex: Venda de item usado'}
              className="h-9 bg-card"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${formId}-amount`}>Valor (R$)</Label>
            <Input
              id={`${formId}-amount`}
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="h-9 bg-card tabular-nums"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${formId}-date`}>Data</Label>
            <Input
              id={`${formId}-date`}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 bg-card"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor={`${formId}-cat`}>Categoria</Label>
            <NativeSelect id={`${formId}-cat`} value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full">
          <Plus data-icon="inline-start" />
          Adicionar {type === 'saida' ? 'saída' : 'entrada'}
        </Button>
      </form>

      {monthTransactions.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Nenhum lançamento neste mês ainda.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {monthTransactions.map((t) => (
            <li key={t.id} className="group flex items-center gap-3 py-3">
              <span
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-lg',
                  t.type === 'entrada' ? 'bg-accent text-accent-foreground' : 'bg-muted text-foreground',
                )}
              >
                {t.type === 'entrada' ? (
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                ) : (
                  <ArrowDownRight className="size-4" aria-hidden="true" />
                )}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">{t.description}</span>
                <span className="text-xs text-muted-foreground">
                  {t.category} · {formatShortDate(t.date)}
                </span>
              </div>
              <span
                className={cn(
                  'text-sm font-semibold tabular-nums',
                  t.type === 'entrada' ? 'text-primary' : 'text-foreground',
                )}
              >
                {t.type === 'entrada' ? '+' : '−'} {formatCurrency(t.amount)}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => actions.removeTransaction(t.id)}
                aria-label={`Remover ${t.description}`}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
