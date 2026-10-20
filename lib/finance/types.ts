export type TransactionType = 'entrada' | 'saida'

export type Transaction = {
  id: string
  type: TransactionType
  description: string
  amount: number
  category: string
  date: string
}

export type FixedExpenseKind = 'recorrente' | 'parcela'

export type FixedExpense = {
  id: string
  name: string
  amount: number
  category: string
  dueDay: number
  paidMonths: string[]
  kind?: FixedExpenseKind
  totalAmount?: number
  totalInstallments?: number
}

export type Goal = {
  id: string
  name: string
  target: number
  saved: number
}

export type FinanceData = {
  salary: number
  savingsRate: number
  transactions: Transaction[]
  fixedExpenses: FixedExpense[]
  goals: Goal[]
}

export const INCOME_CATEGORIES = ['Renda extra', 'Freelance', 'Investimentos', 'Reembolso', 'Outros']

export const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Lazer',
  'Saúde',
  'Compras',
  'Educação',
  'Casa',
  'Outros',
]

export const FIXED_CATEGORIES = [
  'Moradia',
  'Contas de casa',
  'Assinaturas',
  'Transporte',
  'Saúde',
  'Educação',
  'Outros',
]
