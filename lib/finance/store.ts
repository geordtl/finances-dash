'use client'

import useSWR from 'swr'
import type { FinanceData, FixedExpense, Goal, Transaction } from './types'
import { shiftMonth, toISODate, toMonthKey } from './format'

const STORAGE_KEY = 'prumo:finance:v1'

const createId = () => crypto.randomUUID()

export function createEmptyData(): FinanceData {
  return { salary: 0, savingsRate: 10, transactions: [], fixedExpenses: [], goals: [] }
}

export function createSampleData(now = new Date()): FinanceData {
  const today = now.getDate()
  const dayInMonth = (day: number) =>
    toISODate(new Date(now.getFullYear(), now.getMonth(), Math.min(day, today)))
  const lastMonth = shiftMonth(toMonthKey(now), -1)

  return {
    salary: 6500,
    savingsRate: 15,
    transactions: [
      { id: createId(), type: 'entrada', description: 'Projeto freelance', amount: 850, category: 'Freelance', date: dayInMonth(3) },
      { id: createId(), type: 'saida', description: 'Supermercado', amount: 412.6, category: 'Alimentação', date: dayInMonth(2) },
      { id: createId(), type: 'saida', description: 'Combustível', amount: 220, category: 'Transporte', date: dayInMonth(4) },
      { id: createId(), type: 'saida', description: 'Jantar com amigos', amount: 168.9, category: 'Lazer', date: dayInMonth(6) },
      { id: createId(), type: 'saida', description: 'Farmácia', amount: 74.3, category: 'Saúde', date: dayInMonth(8) },
      { id: createId(), type: 'saida', description: 'Tênis de corrida', amount: 389, category: 'Compras', date: dayInMonth(9) },
    ],
    fixedExpenses: [
      { id: createId(), name: 'Aluguel', amount: 1900, category: 'Moradia', dueDay: 5, paidMonths: [lastMonth, toMonthKey(now)] },
      { id: createId(), name: 'Condomínio', amount: 420, category: 'Moradia', dueDay: 10, paidMonths: [lastMonth] },
      { id: createId(), name: 'Internet', amount: 119.9, category: 'Contas de casa', dueDay: 15, paidMonths: [lastMonth] },
      { id: createId(), name: 'Energia', amount: 185, category: 'Contas de casa', dueDay: 20, paidMonths: [lastMonth] },
      { id: createId(), name: 'Streaming', amount: 55.9, category: 'Assinaturas', dueDay: 12, paidMonths: [lastMonth] },
      { id: createId(), name: 'Academia', amount: 129, category: 'Saúde', dueDay: 1, paidMonths: [lastMonth, toMonthKey(now)] },
    ],
    goals: [
      { id: createId(), name: 'Reserva de emergência', target: 20000, saved: 12400 },
      { id: createId(), name: 'Viagem de férias', target: 8000, saved: 2150 },
      { id: createId(), name: 'Notebook novo', target: 6000, saved: 6000 },
    ],
  }
}

function persist(data: FinanceData) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function loadData(): FinanceData {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const sample = createSampleData()
    persist(sample)
    return sample
  }
  try {
    return { ...createEmptyData(), ...(JSON.parse(raw) as Partial<FinanceData>) }
  } catch {
    return createEmptyData()
  }
}

export function useFinance() {
  const { data, mutate } = useSWR<FinanceData>(STORAGE_KEY, loadData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  })

  const update = (recipe: (current: FinanceData) => FinanceData) => {
    mutate(
      (current) => {
        const next = recipe(current ?? loadData())
        persist(next)
        return next
      },
      { revalidate: false },
    )
  }

  const actions = {
    setSalary: (salary: number) => update((d) => ({ ...d, salary: Math.max(salary, 0) })),
    setSavingsRate: (savingsRate: number) => update((d) => ({ ...d, savingsRate })),
    addTransaction: (t: Omit<Transaction, 'id'>) =>
      update((d) => ({ ...d, transactions: [{ ...t, id: createId() }, ...d.transactions] })),
    removeTransaction: (id: string) =>
      update((d) => ({ ...d, transactions: d.transactions.filter((t) => t.id !== id) })),
    addFixedExpense: (f: Omit<FixedExpense, 'id' | 'paidMonths'>) =>
      update((d) => ({
        ...d,
        fixedExpenses: [...d.fixedExpenses, { ...f, id: createId(), paidMonths: [] }],
      })),
    removeFixedExpense: (id: string) =>
      update((d) => ({ ...d, fixedExpenses: d.fixedExpenses.filter((f) => f.id !== id) })),
    toggleFixedPaid: (id: string, month: string) =>
      update((d) => ({
        ...d,
        fixedExpenses: d.fixedExpenses.map((f) =>
          f.id !== id
            ? f
            : {
                ...f,
                paidMonths: f.paidMonths.includes(month)
                  ? f.paidMonths.filter((m) => m !== month)
                  : [...f.paidMonths, month],
              },
        ),
      })),
    addGoal: (g: Omit<Goal, 'id'>) =>
      update((d) => ({ ...d, goals: [...d.goals, { ...g, id: createId() }] })),
    removeGoal: (id: string) =>
      update((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) })),
    moveGoalFunds: (id: string, delta: number) =>
      update((d) => ({
        ...d,
        goals: d.goals.map((g) =>
          g.id === id ? { ...g, saved: Math.max(Math.round((g.saved + delta) * 100) / 100, 0) } : g,
        ),
      })),
    resetData: () => update(() => createEmptyData()),
    loadSample: () => update(() => createSampleData()),
  }

  return { data, actions }
}

export type FinanceActions = ReturnType<typeof useFinance>['actions']
