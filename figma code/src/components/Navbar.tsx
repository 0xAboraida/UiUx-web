import { useState } from 'react'
import whiteLogo from '@/imports/WhiteLogo.png'

const links = [
  { label: 'الرئيسية', href: '#home' },
  { label: 'المميزات', href: '#features' },
  { label: 'كيف يعمل', href: '#how' },
  { label: 'اللقطات', href: '#showcase' },
]

export default function Navbar({
  onTryChat,
  onOpenKnowledge,
  onOpenStudy,
  onOpenAdmin,
  heroTheme,
  onToggleTheme,
}: {
  onTryChat: () => void
  onOpenKnowledge: () => void
  onOpenStudy: () => void
  onOpenAdmin?: () => void
  heroTheme: 'dark' | 'light'
  onToggleTheme: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6 rounded-2xl border border-white/15 bg-[#3a0a63]/80 px-4 py-3 backdrop-blur-xl md:px-6">
        {/* Brand */}
        <a href="#home" className="flex items-center gap-2.5">
          <img src={whiteLogo} alt="شعار زاد" className="h-9 w-9 object-contain" />
          <span className="font-display text-2xl leading-none text-white">زاد</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="group relative text-[15px] font-medium text-white/80 transition-colors hover:text-white"
              >
                {l.label}
                <span className="absolute -bottom-1.5 right-0 h-0.5 w-0 rounded-full bg-white transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={onOpenKnowledge}
              className="group relative text-[15px] font-medium text-white/80 transition-colors hover:text-white"
            >
              قاعدة المعرفة
              <span className="absolute -bottom-1.5 right-0 h-0.5 w-0 rounded-full bg-white transition-all duration-300 group-hover:w-full" />
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={onOpenStudy}
              className="group relative text-[15px] font-medium text-white/80 transition-colors hover:text-white"
            >
              وضع الدراسة
              <span className="absolute -bottom-1.5 right-0 h-0.5 w-0 rounded-full bg-[#10b981] transition-all duration-300 group-hover:w-full" />
            </button>
          </li>
          {onOpenAdmin && (
            <li>
              <button
                type="button"
                onClick={onOpenAdmin}
                className="group relative text-[15px] font-bold text-[#38bdf8] transition-colors hover:text-[#7dd3fc]"
              >
                لوحة التحكم
                <span className="absolute -bottom-1.5 right-0 h-0.5 w-full rounded-full bg-[#38bdf8] opacity-50" />
              </button>
            </li>
          )}
        </ul>

        {/* CTA */}
        <div className="hidden items-center gap-4 md:flex">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={heroTheme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
            title={heroTheme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-base transition-colors hover:bg-white/20"
          >
            {heroTheme === 'dark' ? '☀️' : '🌙'}
          </button>
          <a
            href="#download"
            className="text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            حمّل التطبيق
          </a>
          <button
            type="button"
            onClick={onTryChat}
            className="brand-gradient-blue inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-blue/30 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            جرّب زاد
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="القائمة"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 text-white md:hidden"
        >
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-5 bg-white transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-5 bg-white transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-5 bg-white transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`} />
          </div>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-white/15 bg-[#3a0a63]/95 p-4 backdrop-blur-xl md:hidden">
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-3 text-white/85 transition-colors hover:bg-white/10"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onOpenKnowledge()
                }}
                className="block w-full rounded-xl px-3 py-3 text-right text-white/85 transition-colors hover:bg-white/10"
              >
                قاعدة المعرفة
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onOpenStudy()
                }}
                className="block w-full rounded-xl px-3 py-3 text-right text-white/85 transition-colors hover:bg-white/10"
              >
                وضع الدراسة
              </button>
            </li>
            {onOpenAdmin && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    onOpenAdmin()
                  }}
                  className="block w-full rounded-xl px-3 py-3 text-right font-bold text-[#38bdf8] transition-colors hover:bg-white/10"
                >
                  لوحة التحكم
                </button>
              </li>
            )}
            <li>
              <button
                type="button"
                onClick={onToggleTheme}
                className="block w-full rounded-xl px-3 py-3 text-right text-white/85 transition-colors hover:bg-white/10"
              >
                {heroTheme === 'dark' ? '☀️ الوضع النهاري' : '🌙 الوضع الليلي'}
              </button>
            </li>
            <li className="mt-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onTryChat()
                }}
                className="brand-gradient-blue block w-full rounded-xl px-3 py-3 text-center font-semibold text-white"
              >
                جرّب زاد
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
