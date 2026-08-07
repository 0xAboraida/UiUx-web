type Props = { variant?: 'light' | 'dark' }

function Badge({ store, sub, variant }: { store: string; sub: string; variant: 'light' | 'dark' }) {
  const isLight = variant === 'light'
  return (
    <a
      href="#download"
      className={`inline-flex items-center gap-3 rounded-2xl px-5 py-2.5 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
        isLight
          ? 'border border-white/25 bg-white/10 text-white backdrop-blur-sm'
          : 'border border-border bg-card text-card-foreground shadow-sm'
      }`}
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${isLight ? 'bg-white/15' : 'brand-gradient'} `}
      >
        <span className="text-lg text-white">{store === 'apple' ? '' : '▶'}</span>
      </span>
      <span className="flex flex-col text-right leading-tight">
        <span className={`text-[11px] ${isLight ? 'text-white/70' : 'text-muted-foreground'}`}>{sub}</span>
        <span className="text-sm font-semibold">{store === 'apple' ? 'App Store' : 'Google Play'}</span>
      </span>
    </a>
  )
}

export default function StoreBadges({ variant = 'dark' }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <Badge store="apple" sub="حمّل من" variant={variant} />
      <Badge store="google" sub="احصل عليه من" variant={variant} />
    </div>
  )
}
