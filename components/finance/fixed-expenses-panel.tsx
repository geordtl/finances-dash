'use client'

import { useId, useState } from 'react'
import { Check, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FinanceActions } from '@/lib/finance/store'
import { FIXED_CATEGORIES, type FixedExpense, type FixedExpenseKind } from '@/lib/finance/types'
import { formatCurrency, parseAmount, toMonthKey } from '@/lib/finance/format'
import { cn } from '@/lib/utils'
import { NativeSelect, ProgressBar } from './panel'

export function FixedExpensesPanel({
  month,
  fixedExpenses,
  actions,
}: {
  month: string
  fixedExpenses: FixedExpense[]
  actions: FinanceActions
}) {
  const formId = useId()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDay, setDueDay] = useState('10')
  const [category, setCategory] = useState(FIXED_CATEGORIES[0])
  const [kind, setKind] = useState<FixedExpenseKind>('recorrente')
  const [totalAmount, setTotalAmount] = useState('')
  const [totalInstallments, setTotalInstallments] = useState('')

  const now = new Date()
  const isCurrentMonth = toMonthKey(now) === month
  const isPastMonth = month < toMonthKey(now)
  const sorted = [...fixedExpenses].sort((a, b) => a.dueDay - b.dueDay)
  const total = fixedExpenses.reduce((acc, f) => acc + f.amount, 0)
  const paid = fixedExpenses.filter((f) => f.paidMonths.includes(month)).reduce((acc, f) => acc + f.amount, 0)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const value = parseAmount(amount)
    const day = Math.min(Math.max(Math.round(Number(dueDay)) || 1, 1), 31)
    const installments = Math.max(Math.round(Number(totalInstallments)) || 0, 0)
    const purchaseTotal = parseAmount(totalAmount)
    if (!name.trim() || value <= 0 || (kind === 'parcela' && (installments < 2 || purchaseTotal <= 0))) return
    actions.addFixedExpense({
      name: name.trim(),
      amount: value,
      dueDay: day,
      category,
      kind,
      ...(kind === 'parcela' ? { totalAmount: purchaseTotal, totalInstallments: installments } : {}),
    })
    setName('')
    setAmount('')
    setTotalAmount('')
    setTotalInstallments('')
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl bg-muted/60 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor={`${formId}-name`}>Nome</Label>
            <Input
              id={`${formId}-name`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Aluguel, internet, plano de saúde"
              className="h-9 bg-card"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor={`${formId}-kind`}>Tipo de gasto</Label>
            <NativeSelect id={`${formId}-kind`} value={kind} onChange={(e) => setKind(e.target.value as FixedExpenseKind)}>
              <option value="recorrente">Recorrente</option>
              <option value="parcela">Parcelado</option>
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${formId}-amount`}>Valor da parcela (R$)</Label>
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
            <Label htmlFor={`${formId}-due`}>Dia de vencimento</Label>
            <Input
              id={`${formId}-due`}
              type="number"
              inputMode="numeric"
              min={1}
              max={31}
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              className="h-9 bg-card tabular-nums"
              required
            />
          </div>
          {kind === 'parcela' ? (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${formId}-total`}>Total da compra (R$)</Label>
                <Input id={`${formId}-total`} type="number" min="0.01" step="0.01" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="0,00" className="h-9 bg-card tabular-nums" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${formId}-installments`}>Quantidade de parcelas</Label>
                <Input id={`${formId}-installments`} type="number" min="2" step="1" value={totalInstallments} onChange={(e) => setTotalInstallments(e.target.value)} placeholder="Ex: 10" className="h-9 bg-card tabular-nums" required />
              </div>
            </>
          ) : null}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor={`${formId}-cat`}>Categoria</Label>
            <NativeSelect id={`${formId}-cat`} value={category} onChange={(e) => setCategory(e.target.value)}>
              {FIXED_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full">
          <Plus data-icon="inline-start" />
          Adicionar gasto fixo
        </Button>
      </form>

      {fixedExpenses.length > 0 ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">Pago neste mês</span>
            <span className="font-medium tabular-nums">
              {formatCurrency(paid)} <span className="text-muted-foreground">de {formatCurrency(total)}</span>
            </span>
          </div>
          <ProgressBar label="Gastos fixos pagos no mês" value={total > 0 ? paid / total : 0} />
        </div>
      ) : null}

      {sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Nenhum gasto fixo cadastrado.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {sorted.map((f) => {
            const isPaid = f.paidMonths.includes(month)
            const isOverdue = !isPaid && (isPastMonth || (isCurrentMonth && f.dueDay < now.getDate()))
            return (
              <li key={f.id} className="flex items-center gap-3 py-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isPaid}
                  aria-label={`Marcar ${f.name} como ${isPaid ? 'não pago' : 'pago'}`}
                  onClick={() => actions.toggleFixedPaid(f.id, month)}
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors',
                    isPaid ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-card hover:border-primary',
                  )}
                >
                  {isPaid ? <Check className="size-3.5" aria-hidden="true" /> : null}
                </button>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className={cn('truncate text-sm font-medium', isPaid && 'text-muted-foreground line-through')}>
                    {f.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {f.category} · {f.kind === 'parcela' ? `${f.totalInstallments ?? 0}x de ${formatCurrency(f.amount)} · total ${formatCurrency(f.totalAmount ?? 0)}` : 'recorrente'} · vence dia {f.dueDay}
                    {isOverdue ? <span className="font-medium text-destructive"> · vencida</span> : null}
                  </span>
                </div>
                <span className="text-sm font-semibold tabular-nums">{formatCurrency(f.amount)}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => actions.removeFixedExpense(f.id)}
                  aria-label={`Remover ${f.name}`}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 />
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
