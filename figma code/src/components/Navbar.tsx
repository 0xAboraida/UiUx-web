import { useState, useRef, useEffect } from 'react'
import whiteLogo from '@/imports/WhiteLogo.png'
import darkLogo from '@/imports/ZadDarkLogo.png'
import { User, LogOut, Settings, LayoutDashboard, Sun, Moon, Sparkles } from 'lucide-react'

const links = [
  { label: 'الرئيسية', href: '#home' },
  { label: 'المجالات', href: '#features' },
]

export default function Navbar({
  onTryChat,
  onOpenKnowledge,
  onOpenStudy,
  onOpenAdmin,
  onOpenVoiceChat,
  heroTheme,
  onToggleTheme,
}: {
  onTryChat: () => void
  onOpenKnowledge: () => void
  onOpenStudy: () => void
  onOpenAdmin?: () => void
  onOpenVoiceChat?: () => void
  heroTheme: 'dark' | 'light'
  onToggleTheme: () => void
}) {
  const [open, setOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  
  // Dummy state for demonstration - in real app, fetch from context/auth
  const isAdmin = true; 

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="fixed inset-x-0 top-6 z-50 px-4 transition-all duration-500">
      <nav className="mx-auto flex w-full max-w-[95%] lg:max-w-7xl items-center justify-between rounded-[2rem] border border-purple-500/20 bg-[#0a0214]/20 px-6 py-4 shadow-[0_0_40px_rgba(122,23,201,0.15)] backdrop-blur-md">
        
        {/* Brand */}
        <a href="#home" className="flex shrink-0 items-center gap-3 transition-transform hover:scale-105">
          <img src={whiteLogo} alt="شعار زاد" className="h-12 w-12 object-contain" />
          <span className="font-display text-3xl text-white">زاد</span>
        </a>

        {/* Desktop links */}
        <div className="hidden flex-1 items-center justify-center lg:flex">
          <ul className="flex items-center gap-10">
            {links.map((l, index) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="group relative flex flex-col items-center py-1 text-[17px] font-normal text-white/70 transition-colors duration-300 hover:text-white"
                >
                  {l.label}
                  <span className={`absolute -bottom-3 h-[3px] rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.9)] transition-all duration-300 ${index === 0 ? 'w-8' : 'w-0 group-hover:w-8'}`} />
                </a>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={onOpenKnowledge}
                className="group relative flex flex-col items-center py-1 text-[17px] font-normal text-white/70 transition-colors duration-300 hover:text-white"
              >
                المكتبة
                <span className="absolute -bottom-3 h-[3px] w-0 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.9)] transition-all duration-300 group-hover:w-8" />
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={onOpenStudy}
                className="group relative flex flex-col items-center py-1 text-[17px] font-normal text-white/70 transition-colors duration-300 hover:text-white"
              >
                وضع الدراسة
                <span className="absolute -bottom-3 h-[3px] w-0 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.9)] transition-all duration-300 group-hover:w-8" />
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={onTryChat}
                className="group relative flex flex-col items-center py-1 text-[17px] font-normal text-white/70 transition-colors duration-300 hover:text-white"
              >
                المحادثة النصية
                <span className="absolute -bottom-3 h-[3px] w-0 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.9)] transition-all duration-300 group-hover:w-8" />
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={onOpenVoiceChat}
                className="group relative flex flex-col items-center py-1 text-[17px] font-normal text-white/70 transition-colors duration-300 hover:text-white"
              >
                المحادثة الصوتية
                <span className="absolute -bottom-3 h-[3px] w-0 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.9)] transition-all duration-300 group-hover:w-8" />
              </button>
            </li>
          </ul>
        </div>

        {/* CTA & Actions */}
        <div className="hidden shrink-0 items-center gap-6 lg:flex">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={heroTheme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
            className="text-white/70 transition-colors hover:text-white"
          >
            <div className={`transition-all duration-700 ${heroTheme === 'dark' ? 'rotate-0' : 'rotate-[360deg] scale-110'}`}>
              {heroTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </div>
          </button>
          
          {/* User Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center justify-center h-10 w-10 rounded-full brand-gradient text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105"
            >
              <User size={18} strokeWidth={2.5} />
            </button>
            
            {showProfileMenu && (
              <div className="absolute left-0 top-full mt-4 w-64 rounded-3xl border border-white/15 bg-[#1a0730]/95 py-3 shadow-2xl backdrop-blur-2xl transition-all">
                {/* Profile Header */}
                <div className="border-b border-white/10 px-5 pb-4 pt-2 text-white">
                  <div className="text-lg font-bold">أحمد محمد</div>
                  <div className="text-sm text-white/60">طالب</div>
                </div>
                
                {/* Menu Items */}
                <div className="mt-1 flex flex-col gap-1 p-2">
                  <button className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-white/85 transition-colors hover:bg-white/10">
                    <Settings size={18} className="text-white/70" /> الإعدادات
                  </button>
                  {isAdmin && onOpenAdmin && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false)
                        onOpenAdmin()
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-brand-blue transition-colors hover:bg-white/10"
                    >
                      <LayoutDashboard size={18} /> لوحة التحكم
                    </button>
                  )}
                  
                  <div className="my-1 h-px w-full bg-white/10"></div>
                  
                  <button className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-white/10 hover:text-red-300">
                    <LogOut size={18} /> تسجيل خروج
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="القائمة"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 md:hidden"
        >
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-5 rounded-full bg-white transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-4 rounded-full bg-white transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-5 rounded-full bg-white transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`} />
          </div>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="mx-auto mt-3 max-w-5xl rounded-3xl border border-white/15 bg-[#1a0730]/95 p-4 shadow-2xl backdrop-blur-2xl md:hidden">
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-white/85 transition-colors hover:bg-white/10"
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
                className="block w-full rounded-xl px-4 py-3 text-right text-sm font-medium text-white/85 transition-colors hover:bg-white/10"
              >
                المكتبة
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onOpenStudy()
                }}
                className="block w-full rounded-xl px-4 py-3 text-right text-sm font-medium text-white/85 transition-colors hover:bg-white/10"
              >
                وضع الدراسة
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onTryChat()
                }}
                className="block w-full rounded-xl px-4 py-3 text-right text-sm font-medium text-white/85 transition-colors hover:bg-white/10"
              >
                المحادثة النصية
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  if (onOpenVoiceChat) onOpenVoiceChat()
                }}
                className="block w-full rounded-xl px-4 py-3 text-right text-sm font-medium text-white/85 transition-colors hover:bg-white/10"
              >
                المحادثة الصوتية
              </button>
            </li>
            <li className="my-3 h-px w-full bg-white/10"></li>
            <li className="px-4 text-xs font-semibold uppercase tracking-wider text-white/50">حسابي</li>
            <li>
              <button className="mt-1 block w-full rounded-xl px-4 py-3 text-right text-sm font-medium text-white/85 transition-colors hover:bg-white/10">
                الإعدادات
              </button>
            </li>
            {isAdmin && onOpenAdmin && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    onOpenAdmin()
                  }}
                  className="block w-full rounded-xl px-4 py-3 text-right text-sm font-bold text-brand-blue transition-colors hover:bg-white/10"
                >
                  لوحة التحكم
                </button>
              </li>
            )}
            <li>
              <button className="block w-full rounded-xl px-4 py-3 text-right text-sm font-medium text-red-400 transition-colors hover:bg-white/10">
                تسجيل خروج
              </button>
            </li>
            <li className="my-3 h-px w-full bg-white/10"></li>

            <li>
              <button
                type="button"
                onClick={onToggleTheme}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-right text-sm font-medium text-white/85 transition-colors hover:bg-white/10"
              >
                {heroTheme === 'dark' ? <Sun size={16} className="text-white/70" /> : <Moon size={16} className="text-white/70" />}
                {heroTheme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
