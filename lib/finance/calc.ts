import type { FinanceData } from './types'
import { formatCurrency, formatPercent, toMonthKey } from './format'

export type BudgetStatus = 'ok' | 'warning' | 'over'

export type MonthSummary = {
  month: string
  salary: number
  extraIncome: number
  income: number
  fixedTotal: number
  fixedPaid: number
  variableSpent: number
  totalSpent: number
  savingsReserve: number
  variableBudget: number
  remaining: number
  balance: number
  commitment: number
  fixedRatio: number
  spentRatio: number
  elapsedRatio: number
  daysLeft: number
  dailySuggested: number
  overdueFixedCount: number
  isCurrentMonth: boolean
  status: BudgetStatus
}

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

export function computeSummary(data: FinanceData, month: string, now = new Date()): MonthSummary {
  const monthTransactions = data.transactions.filter((t) => t.date.startsWith(month))
  const extraIncome = sum(monthTransactions.filter((t) => t.type === 'entrada').map((t) => t.amount))
  const variableSpent = sum(monthTransactions.filter((t) => t.type === 'saida').map((t) => t.amount))

  const income = data.salary + extraIncome
  const fixedTotal = sum(data.fixedExpenses.map((f) => f.amount))
  const fixedPaid = sum(
    data.fixedExpenses.filter((f) => f.paidMonths.includes(month)).map((f) => f.amount),
  )
  const savingsReserve = (data.salary * data.savingsRate) / 100
  const variableBudget = Math.max(income - fixedTotal - savingsReserve, 0)
  const remaining = variableBudget - variableSpent
  const totalSpent = fixedTotal + variableSpent
  const balance = income - totalSpent

  const [year, monthIndex] = month.split('-').map(Number)
  const daysInMonth = new Date(year, monthIndex, 0).getDate()
  const currentKey = toMonthKey(now)
  const isCurrentMonth = currentKey === month
  const isPast = month < currentKey

  let elapsedRatio = 0
  let daysLeft = daysInMonth
  if (isCurrentMonth) {
    elapsedRatio = now.getDate() / daysInMonth
    daysLeft = daysInMonth - now.getDate() + 1
  } else if (isPast) {
    elapsedRatio = 1
    daysLeft = 0
  }

  const spentRatio =
    variableBudget > 0 ? variableSpent / variableBudget : variableSpent > 0 ? Infinity : 0
  const dailySuggested = daysLeft > 0 ? Math.max(remaining, 0) / daysLeft : 0

  const overdueFixedCount = isCurrentMonth
    ? data.fixedExpenses.filter((f) => f.dueDay < now.getDate() && !f.paidMonths.includes(month))
        .length
    : isPast
      ? data.fixedExpenses.filter((f) => !f.paidMonths.includes(month)).length
      : 0

  let status: BudgetStatus = 'ok'
  if (balance < 0 || remaining < 0) status = 'over'
  else if (spentRatio >= 0.85 || spentRatio > elapsedRatio + 0.1) status = 'warning'

  return {
    month,
    salary: data.salary,
    extraIncome,
    income,
    fixedTotal,
    fixedPaid,
    variableSpent,
    totalSpent,
    savingsReserve,
    variableBudget,
    remaining,
    balance,
    commitment: income > 0 ? totalSpent / income : totalSpent > 0 ? Infinity : 0,
    fixedRatio: income > 0 ? fixedTotal / income : 0,
    spentRatio,
    elapsedRatio,
    daysLeft,
    dailySuggested,
    overdueFixedCount,
    isCurrentMonth,
    status,
  }
}

export type AlertLevel = 'danger' | 'warning' | 'info' | 'success'

export type FinanceAlert = {
  id: string
  level: AlertLevel
  title: string
  description: string
}

export function buildAlerts(s: MonthSummary): FinanceAlert[] {
  const alerts: FinanceAlert[] = []

  if (s.income === 0) {
    alerts.push({
      id: 'no-income',
      level: 'info',
      title: 'Informe seu salário',
      description: 'Sem renda cadastrada não é possível calcular quanto você pode gastar no mês.',
    })
    return alerts
  }

  if (s.balance < 0) {
    alerts.push({
      id: 'over-income',
      level: 'danger',
      title: 'Você gastou além da sua renda',
      description: `Suas saídas superam as entradas em ${formatCurrency(-s.balance)}. Corte gastos variáveis ou adie compras para fechar o mês no azul.`,
    })
  } else if (s.remaining < 0) {
    alerts.push({
      id: 'over-budget',
      level: 'danger',
      title: 'Limite de gastos estourado',
      description: `Você passou ${formatCurrency(-s.remaining)} do que podia gastar. Esse valor está saindo da reserva destinada aos cofrinhos.`,
    })
  }

  if (s.remaining >= 0 && s.isCurrentMonth && s.spentRatio > s.elapsedRatio + 0.1) {
    alerts.push({
      id: 'pace',
      level: 'warning',
      title: 'Ritmo de gastos acelerado',
      description: `Você já usou ${formatPercent(s.spentRatio)} do orçamento com apenas ${formatPercent(s.elapsedRatio)} do mês decorrido.`,
    })
  }

  if (s.fixedRatio > 0.5) {
    alerts.push({
      id: 'fixed-heavy',
      level: 'warning',
      title: 'Gastos fixos pesados',
      description: `Seus gastos fixos comprometem ${formatPercent(s.fixedRatio)} da renda. O recomendado é manter abaixo de 50%.`,
    })
  }

  if (s.overdueFixedCount > 0) {
    alerts.push({
      id: 'overdue',
      level: 'info',
      title: `${s.overdueFixedCount} ${s.overdueFixedCount === 1 ? 'conta fixa vencida' : 'contas fixas vencidas'}`,
      description: 'Marque como pagas na aba de gastos fixos para manter o controle em dia.',
    })
  }

  if (!alerts.some((a) => a.level === 'danger' || a.level === 'warning')) {
    alerts.unshift({
      id: 'healthy',
      level: 'success',
      title: 'Tudo sob controle',
      description: `Você está dentro do orçamento e ainda guarda ${formatCurrency(s.savingsReserve)} para os cofrinhos este mês.`,
    })
  }

  return alerts
}
