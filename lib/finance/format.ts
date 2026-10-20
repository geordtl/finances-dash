const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatCurrency(value: number) {
  return currencyFormatter.format(value)
}

export function formatPercent(ratio: number) {
  if (!Number.isFinite(ratio)) return '—'
  return `${Math.round(ratio * 100)}%`
}

export function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function toISODate(date: Date) {
  return `${toMonthKey(date)}-${String(date.getDate()).padStart(2, '0')}`
}

export function shiftMonth(monthKey: string, delta: number) {
  const [year, month] = monthKey.split('-').map(Number)
  return toMonthKey(new Date(year, month - 1 + delta, 1))
}

export function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number)
  const label = new Date(year, month - 1, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function formatShortDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    .replace('.', '')
}

export function parseAmount(raw: string) {
  const value = Number(raw.replace(',', '.'))
  return Number.isFinite(value) ? value : 0
}
