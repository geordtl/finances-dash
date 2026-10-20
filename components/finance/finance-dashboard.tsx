'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { buildAlerts, computeSummary } from '@/lib/finance/calc'
import { toMonthKey } from '@/lib/finance/format'
import { useFinance } from '@/lib/finance/store'
import { AlertsList } from './alerts-list'
import { AppHeader } from './app-header'
import { BudgetHero } from './budget-hero'
import { FixedExpensesPanel } from './fixed-expenses-panel'
import { IncomeSettings } from './income-settings'
import { Indicators } from './indicators'
import { Panel } from './panel'
import { PiggyBanks } from './piggy-banks'
import { TransactionsPanel } from './transactions-panel'

function DashboardSkeleton() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:px-6" aria-busy="true">
      <span className="sr-only">Carregando suas finanças</span>
      <div className="h-72 animate-pulse rounded-2xl bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  )
}

export function FinanceDashboard() {
  const { data, actions } = useFinance()
  const [month, setMonth] = useState(() => toMonthKey(new Date()))

  if (!data) return <DashboardSkeleton />

  const summary = computeSummary(data, month)
  const alerts = buildAlerts(summary)

  return (
    <div className="min-h-dvh">
      <AppHeader
        month={month}
        onMonthChange={setMonth}
        onReset={actions.resetData}
        onLoadSample={actions.loadSample}
      />

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 md:py-10">
        <h1 className="sr-only">Painel financeiro</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <BudgetHero summary={summary} className="lg:col-span-2" />
          <IncomeSettings
            salary={data.salary}
            savingsRate={data.savingsRate}
            summary={summary}
            onSalaryChange={actions.setSalary}
            onSavingsRateChange={actions.setSavingsRate}
          />
        </div>

        <Indicators summary={summary} />

        <AlertsList alerts={alerts} />

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
          <Panel className="lg:col-span-3">
            <Tabs defaultValue="lancamentos" className="gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold tracking-tight">Movimentações</h2>
                <TabsList>
                  <TabsTrigger value="lancamentos" className="px-3">
                    Entradas e saídas
                  </TabsTrigger>
                  <TabsTrigger value="fixos" className="px-3">
                    Gastos fixos
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="lancamentos">
                <TransactionsPanel
                  key={month}
                  month={month}
                  transactions={data.transactions}
                  actions={actions}
                />
              </TabsContent>
              <TabsContent value="fixos">
                <FixedExpensesPanel month={month} fixedExpenses={data.fixedExpenses} actions={actions} />
              </TabsContent>
            </Tabs>
          </Panel>

          <PiggyBanks
            goals={data.goals}
            monthlyReserve={summary.savingsReserve}
            actions={actions}
            className="lg:col-span-2"
          />
        </div>
      </main>
    </div>
  )
}
