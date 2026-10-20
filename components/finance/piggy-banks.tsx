'use client'

import { useId, useState } from 'react'
import { Minus, PiggyBank, Plus, Trash2, Trophy, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FinanceActions } from '@/lib/finance/store'
import type { Goal } from '@/lib/finance/types'
import { formatCurrency, formatPercent, parseAmount } from '@/lib/finance/format'
import { cn } from '@/lib/utils'
import { Panel, PanelHeader, ProgressBar } from './panel'

function GoalCard({ goal, actions }: { goal: Goal; actions: FinanceActions }) {
  const inputId = useId()
  const [amount, setAmount] = useState('')
  const ratio = goal.target > 0 ? goal.saved / goal.target : 0
  const reached = ratio >= 1
  const missing = Math.max(goal.target - goal.saved, 0)

  function move(direction: 1 | -1) {
    const value = parseAmount(amount)
    if (value <= 0) return
    actions.moveGoalFunds(goal.id, value * direction)
    setAmount('')
  }

  return (
    <li className={cn('flex flex-col gap-4 rounded-xl border p-4', reached ? 'border-primary/40 bg-accent' : 'border-border')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="truncate text-sm font-semibold">{goal.name}</h3>
          <p className="text-xs text-muted-foreground tabular-nums">
            {formatCurrency(goal.saved)} de {formatCurrency(goal.target)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <span className={cn('text-2xl font-semibold tracking-tight tabular-nums', reached && 'text-accent-foreground')}>
            {formatPercent(Math.min(ratio, 1))}
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => actions.removeGoal(goal.id)}
            aria-label={`Remover cofrinho ${goal.name}`}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      <ProgressBar label={`Progresso da meta ${goal.name}`} value={ratio} />

      {reached ? (
        <p className="flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
          <Trophy className="size-3.5" aria-hidden="true" />
          Meta atingida! Parabéns.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Faltam <span className="font-medium text-foreground tabular-nums">{formatCurrency(missing)}</span>
        </p>
      )}

      <div className="flex items-center gap-2">
        <Label htmlFor={inputId} className="sr-only">
          Valor para {goal.name}
        </Label>
        <Input
          id={inputId}
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Valor"
          className="h-8 bg-card tabular-nums"
        />
        <Button size="sm" onClick={() => move(1)} aria-label={`Guardar em ${goal.name}`}>
          <Plus data-icon="inline-start" />
          Guardar
        </Button>
        <Button
          size="icon-sm"
          variant="outline"
          onClick={() => move(-1)}
          aria-label={`Retirar de ${goal.name}`}
          disabled={goal.saved <= 0}
        >
          <Minus />
        </Button>
      </div>
    </li>
  )
}

function NewGoalForm({ onCreate, onCancel }: { onCreate: (g: Omit<Goal, 'id'>) => void; onCancel: () => void }) {
  const formId = useId()
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [saved, setSaved] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const targetValue = parseAmount(target)
    if (!name.trim() || targetValue <= 0) return
    onCreate({ name: name.trim(), target: targetValue, saved: Math.max(parseAmount(saved), 0) })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl bg-muted/60 p-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${formId}-name`}>Nome do cofrinho</Label>
        <Input
          id={`${formId}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Viagem, carro, reserva"
          className="h-9 bg-card"
          required
          autoFocus
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${formId}-target`}>Meta (R$)</Label>
          <Input
            id={`${formId}-target`}
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="h-9 bg-card tabular-nums"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${formId}-saved`}>Já guardado</Label>
          <Input
            id={`${formId}-saved`}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={saved}
            onChange={(e) => setSaved(e.target.value)}
            placeholder="0,00"
            className="h-9 bg-card tabular-nums"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          Criar cofrinho
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

export function PiggyBanks({
  goals,
  monthlyReserve,
  actions,
  className,
}: {
  goals: Goal[]
  monthlyReserve: number
  actions: FinanceActions
  className?: string
}) {
  const [creating, setCreating] = useState(false)
  const totalSaved = goals.reduce((acc, g) => acc + g.saved, 0)
  const totalTarget = goals.reduce((acc, g) => acc + g.target, 0)
  const overall = totalTarget > 0 ? totalSaved / totalTarget : 0

  return (
    <Panel className={cn('flex flex-col gap-6', className)}>
      <PanelHeader
        title="Cofrinhos"
        description="Acompanhe suas metas de economia."
        action={
          <Button
            variant={creating ? 'ghost' : 'outline'}
            size="sm"
            onClick={() => setCreating((v) => !v)}
            aria-expanded={creating}
          >
            {creating ? <X data-icon="inline-start" /> : <Plus data-icon="inline-start" />}
            {creating ? 'Fechar' : 'Novo'}
          </Button>
        }
      />

      <div className="flex items-center gap-4 rounded-xl bg-accent p-4 text-accent-foreground">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <PiggyBank className="size-5" aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-xs font-medium">Total guardado · {formatPercent(overall)} das metas</p>
          <p className="text-xl font-semibold tracking-tight tabular-nums text-foreground">
            {formatCurrency(totalSaved)}
          </p>
          <p className="text-xs">
            Reserva sugerida este mês: <span className="font-semibold tabular-nums">{formatCurrency(monthlyReserve)}</span>
          </p>
        </div>
      </div>

      {creating ? (
        <NewGoalForm
          onCancel={() => setCreating(false)}
          onCreate={(goal) => {
            actions.addGoal(goal)
            setCreating(false)
          }}
        />
      ) : null}

      {goals.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Crie seu primeiro cofrinho para começar.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} actions={actions} />
          ))}
        </ul>
      )}
    </Panel>
  )
}
