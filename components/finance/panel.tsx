import { cn } from '@/lib/utils'

export function Panel({ className, ...props }: React.ComponentProps<'section'>) {
  return (
    <section
      className={cn('rounded-2xl border border-border bg-card p-5 text-card-foreground md:p-6', className)}
      {...props}
    />
  )
}

export function PanelHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

export function NativeSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        'h-9 w-full min-w-0 rounded-lg border border-input bg-card px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
        className,
      )}
      {...props}
    />
  )
}

export function ProgressBar({
  value,
  tone = 'primary',
  className,
  label,
}: {
  value: number
  tone?: 'primary' | 'warning' | 'destructive'
  className?: string
  label: string
}) {
  const clamped = Math.min(Math.max(value, 0), 1)
  const toneClass = {
    primary: 'bg-primary',
    warning: 'bg-warning',
    destructive: 'bg-destructive',
  }[tone]

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500 ease-out', toneClass)}
        style={{ width: `${clamped * 100}%` }}
      />
    </div>
  )
}
