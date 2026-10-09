import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import whiteLogo from '@/assets/images/WhiteLogo.png'
import darkLogo from '@/assets/images/ZadDarkLogo.png'
import {
  User, LogOut, Settings, LayoutDashboard, Sun, Moon, Sparkles, LogIn, Loader2,
  Activity, Zap, Server, Cpu, Home, BookOpen, GraduationCap, MessageSquare, Mic,
  ChevronLeft, ShieldCheck, Database, Video, X, BookOpenCheck, Bell, Palette, Menu
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { getAvatarUrl } from '../../api/client'
import StoreBadges from '../ui/StoreBadges'
import NotificationBell from './NotificationBell'
import UserProfileModal from '../../features/profile/UserProfileModal'

const links = [
  { label: 'الرئيسية', href: '#home' },
]

export default function Navbar({
  onTryChat,
  onOpenKnowledge,
  onOpenStudy,
  onOpenAdmin,
  onOpenTurathRag,
  onOpenEngineControl,
  onOpenDataIngestion,
  onOpenV2PipelineAdmin,
  onOpenAdminLibrary,
  onOpenVoiceChat,
  onOpenLessons,
  onOpenYoutubeImporter,
  onOpenSystemObservability,
}: {
  onTryChat: () => void
  onOpenKnowledge: () => void
  onOpenStudy: () => void
  onOpenLessons: () => void
  onOpenAdmin?: () => void
  onOpenTurathRag?: () => void
  onOpenEngineControl?: () => void
  onOpenDataIngestion?: () => void
  onOpenV2PipelineAdmin?: () => void
  onOpenAdminLibrary?: () => void
  onOpenVoiceChat?: () => void
  onOpenYoutubeImporter?: () => void
  onOpenSystemObservability?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isLoginLoading, setIsLoginLoading] = useState(false)

  const profileMenuRef = useRef<HTMLDivElement>(null)

  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme, isDark, accentColor, setAccentColor } = useTheme()
  const isAdmin = user?.role?.toLowerCase() === 'admin'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="fixed md:absolute inset-x-0 top-4 sm:top-6 z-50 px-3 sm:px-4">
      {/* Mobile top floating bar (< md): Menu toggle button on Right, NotificationBell on Left */}
      <div className="flex md:hidden items-center justify-between pointer-events-none w-full">
        <button
          type="button"
          aria-label="فتح القائمة"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className={`pointer-events-auto flex h-11 w-11 items-center justify-center rounded-2xl border backdrop-blur-[6px] transition-all duration-300 active:scale-90 ${isDark
            ? 'border-white/20 bg-white/[0.08] hover:bg-white/[0.16] text-white shadow-[0_4px_20px_rgba(0,0,0,0.25)]'
            : 'border-white/50 bg-white/[0.20] hover:bg-white/[0.30] text-purple-950 shadow-[0_4px_20px_rgba(0,0,0,0.06)]'
            }`}
        >
          <Menu size={22} strokeWidth={2.3} className="transition-transform group-hover:scale-105" />
        </button>

        <div className="pointer-events-auto">
          <NotificationBell variant="glass" />
        </div>
      </div>

      <nav className="mx-auto hidden md:flex w-full max-w-[98%] xl:max-w-7xl items-center justify-between rounded-[2rem] border border-purple-500/20 bg-[#0a0214]/40 px-3 sm:px-4 lg:px-6 py-2 lg:py-2.5 shadow-[0_0_40px_rgba(122,23,201,0.15)] backdrop-blur-xl">

        {/* Brand (Right Section in RTL) */}
        <a href="#home" className="flex shrink-0 items-center gap-2 lg:gap-2.5 transition-transform hover:scale-105">
          <img src={isDark ? whiteLogo : darkLogo} alt="شعار زاد" className="h-8 w-8 lg:h-10 lg:w-10 object-contain" />
          <span className={`font-display text-[22px] lg:text-[28px] ${isDark ? 'text-white' : 'text-brand-deep'}`}>زاد</span>
        </a>

        {/* Center Section: Tabs (Adapts and shrinks down to 768px) */}
        <div className="hidden flex-1 items-center justify-center md:flex px-1 lg:px-2 xl:px-4 min-w-0">
          <ul className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3.5 xl:gap-6">
            {links.map((l, index) => (
              <li key={l.href} className="shrink-0">
                <a
                  href={l.href}
                  className="group relative flex flex-col items-center py-1 text-[12.5px] sm:text-[13px] lg:text-[15px] xl:text-[16.5px] font-semibold text-white/80 transition-colors duration-300 hover:text-white whitespace-nowrap"
                >
                  {l.label}
                  <span className={`absolute -bottom-2 lg:-bottom-3 h-[2px] lg:h-[3px] rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.9)] transition-all duration-300 ${index === 0 ? 'w-6 lg:w-8' : 'w-0 group-hover:w-6 lg:group-hover:w-8'}`} />
                </a>
              </li>
            ))}
            <li className="shrink-0">
              <button
                type="button"
                onClick={onOpenKnowledge}
                className="group relative flex flex-col items-center py-1 text-[12.5px] sm:text-[13px] lg:text-[15px] xl:text-[16.5px] font-semibold text-white/80 transition-colors duration-300 hover:text-white whitespace-nowrap"
              >
                المكتبة
                <span className="absolute -bottom-2 lg:-bottom-3 h-[2px] lg:h-[3px] w-0 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.9)] transition-all duration-300 group-hover:w-6 lg:group-hover:w-8" />
              </button>
            </li>
            <li className="shrink-0">
              <button
                type="button"
                onClick={onOpenLessons}
                className="group relative flex flex-col items-center py-1 text-[12.5px] sm:text-[13px] lg:text-[15px] xl:text-[16.5px] font-semibold text-white/80 transition-colors duration-300 hover:text-white whitespace-nowrap"
              >
                الشروحات والدروس
                <span className="absolute -bottom-2 lg:-bottom-3 h-[2px] lg:h-[3px] w-0 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.9)] transition-all duration-300 group-hover:w-6 lg:group-hover:w-8" />
              </button>
            </li>
            <li className="shrink-0">
              <button
                type="button"
                onClick={onOpenStudy}
                className="group relative flex flex-col items-center py-1 text-[12.5px] sm:text-[13px] lg:text-[15px] xl:text-[16.5px] font-semibold text-white/80 transition-colors duration-300 hover:text-white whitespace-nowrap"
              >
                وضع الدراسة
                <span className="absolute -bottom-2 lg:-bottom-3 h-[2px] lg:h-[3px] w-0 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.9)] transition-all duration-300 group-hover:w-6 lg:group-hover:w-8" />
              </button>
            </li>
            <li className="shrink-0">
              <button
                type="button"
                onClick={onTryChat}
                className="group relative flex flex-col items-center py-1 text-[12.5px] sm:text-[13px] lg:text-[15px] xl:text-[16.5px] font-semibold text-white/80 transition-colors duration-300 hover:text-white whitespace-nowrap"
              >
                المحادثة النصية
                <span className="absolute -bottom-2 lg:-bottom-3 h-[2px] lg:h-[3px] w-0 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.9)] transition-all duration-300 group-hover:w-6 lg:group-hover:w-8" />
              </button>
            </li>
            <li className="shrink-0">
              <button
                type="button"
                onClick={onOpenVoiceChat}
                className="group relative flex flex-col items-center py-1 text-[12.5px] sm:text-[13px] lg:text-[15px] xl:text-[16.5px] font-semibold text-white/80 transition-colors duration-300 hover:text-white whitespace-nowrap"
              >
                المحادثة الصوتية
                <span className="absolute -bottom-2 lg:-bottom-3 h-[2px] lg:h-[3px] w-0 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.9)] transition-all duration-300 group-hover:w-6 lg:group-hover:w-8" />
              </button>
            </li>
          </ul>
        </div>

        {/* CTA & Actions */}
        <div className="hidden shrink-0 items-center gap-2 lg:gap-3.5 xl:gap-5 md:flex">
          <div className="hidden 2xl:block scale-90 origin-right">
            <StoreBadges variant={isDark ? 'dark' : 'light'} />
          </div>
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
            className={`flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-full transition-all ${isDark
              ? 'bg-[#a855f7]/15 backdrop-blur-md border border-[#a855f7]/30 hover:bg-[#a855f7]/25 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] text-purple-100'
              : 'bg-white/30 backdrop-blur-md border border-white/60 hover:bg-white/45 text-purple-700 shadow-sm'
              }`}
          >
            <div className={`transition-all duration-700 ${isDark ? 'rotate-0' : 'rotate-[360deg] scale-110'}`}>
              {isDark ? <Sun className="h-4 w-4 lg:h-[18px] lg:w-[18px]" strokeWidth={2.5} /> : <Moon className="h-4 w-4 lg:h-[18px] lg:w-[18px]" strokeWidth={2.5} />}
            </div>
          </button>

          <NotificationBell />

          {/* Auth Section */}
          {isAuthenticated ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center justify-center h-8 w-8 lg:h-10 lg:w-10 rounded-full brand-gradient text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105 overflow-hidden"
              >
                {user?.avatarUrl ? (
                  <img
                    src={getAvatarUrl(user.avatarUrl)}
                    alt={user?.name || 'مستخدم'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 lg:h-[18px] lg:w-[18px]" strokeWidth={2.5} />
                )}
              </button>

              {showProfileMenu && (
                <div dir="rtl" className="absolute left-0 top-full mt-4 w-72 rounded-3xl border border-white/15 bg-[#1a0730]/95 py-3 shadow-2xl backdrop-blur-2xl transition-all text-right">
                  {/* Profile Header */}
                  <div className="border-b border-white/10 px-5 pb-4 pt-2 text-white text-right flex items-center gap-3">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full brand-gradient text-white overflow-hidden shadow-md">
                      {user?.avatarUrl ? (
                        <img
                          src={getAvatarUrl(user.avatarUrl)}
                          alt={user?.name || 'مستخدم'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User size={20} strokeWidth={2} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold truncate text-right">{user?.name || (isAdmin ? 'أدمن زاد' : 'مستخدم زاد')}</div>
                      <div className="text-xs text-white/60 truncate text-right font-mono">{user?.email || 'طالب'}</div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="mt-1 flex flex-col gap-1 p-2 text-right">
                    {isAdmin && onOpenTurathRag && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false)
                          onOpenTurathRag()
                        }}
                        className="flex w-full items-center justify-start gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-sky-400 transition-colors hover:bg-white/10 text-right"
                      >
                        <Zap size={18} className="shrink-0 text-sky-400" />
                        <span className="text-right leading-tight">إدارة استخراج الكتب وتخزينها</span>
                      </button>
                    )}
                    {isAdmin && onOpenEngineControl && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false)
                          onOpenEngineControl()
                        }}
                        className="flex w-full items-center justify-start gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-purple-400 transition-colors hover:bg-white/10 text-right"
                      >
                        <Cpu size={18} className="shrink-0 text-purple-400" />
                        <span className="text-right leading-tight">التحكم في محركات الـ RAG والمقارنة</span>
                      </button>
                    )}
                    {isAdmin && onOpenAdmin && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false)
                          onOpenAdmin()
                        }}
                        className="flex w-full items-center justify-start gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-brand-blue transition-colors hover:bg-white/10 text-right"
                      >
                        <LayoutDashboard size={18} className="shrink-0" />
                        <span className="text-right">إدارة وضع الدراسة</span>
                      </button>
                    )}
                    {isAdmin && onOpenDataIngestion && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false)
                          onOpenDataIngestion()
                        }}
                        className="flex w-full items-center justify-start gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-emerald-400 transition-colors hover:bg-white/10 text-right"
                      >
                        <Settings size={18} className="shrink-0" />
                        <span className="text-right">إدارة البيانات</span>
                      </button>
                    )}
                    {isAdmin && onOpenV2PipelineAdmin && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false)
                          onOpenV2PipelineAdmin()
                        }}
                        className="flex w-full items-center justify-start gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-blue-400 transition-colors hover:bg-white/10 text-right"
                      >
                        <Sparkles size={18} className="shrink-0" />
                        <span className="text-right leading-tight">إدخال بيانات الـ AI (Ingestion)</span>
                      </button>
                    )}
                    {isAdmin && onOpenAdminLibrary && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false)
                          onOpenAdminLibrary()
                        }}
                        className="flex w-full items-center justify-start gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-amber-400 transition-colors hover:bg-white/10 text-right"
                      >
                        <Settings size={18} className="shrink-0" />
                        <span className="text-right leading-tight">إدارة مكتبة القراءة (Library)</span>
                      </button>
                    )}
                    {isAdmin && onOpenYoutubeImporter && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false)
                          onOpenYoutubeImporter()
                        }}
                        className="flex w-full items-center justify-start gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-white/10 text-right"
                      >
                        <Settings size={18} className="shrink-0" />
                        <span className="text-right">استيراد شروحات يوتيوب</span>
                      </button>
                    )}
                    {isAdmin && onOpenSystemObservability && (
                      <button
                        onClick={() => {
                          setShowProfileMenu(false)
                          onOpenSystemObservability()
                        }}
                        className="flex w-full items-center justify-start gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-amber-300 transition-colors hover:bg-white/10 text-right"
                      >
                        <Activity size={18} className="shrink-0 text-amber-400" />
                        <span className="text-right leading-tight">مراقبة النظام والـ AI (Observability)</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowProfileMenu(false)
                        setShowProfileModal(true)
                      }}
                      className="flex w-full items-center justify-start gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-purple-300 transition-colors hover:bg-white/10 text-right"
                    >
                      <User size={18} className="shrink-0 text-purple-400" />
                      <span className="text-right">الملف الشخصي وإعدادات الحساب</span>
                    </button>

                    <div className="my-1 h-px w-full bg-white/10"></div>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false)
                        logout()
                      }}
                      className="flex w-full items-center justify-start gap-3 rounded-xl px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-white/10 hover:text-red-300 text-right"
                    >
                      <LogOut size={18} className="shrink-0" />
                      <span className="text-right">تسجيل خروج</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                setIsLoginLoading(true)
                onTryChat()
                setTimeout(() => setIsLoginLoading(false), 1500)
              }}
              disabled={isLoginLoading}
              className={`relative flex h-8 lg:h-10 items-center gap-1.5 lg:gap-2 rounded-full px-3 lg:px-5 text-xs lg:text-sm font-extrabold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg overflow-hidden group ${isDark
                ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-600 text-white border border-purple-400/40 shadow-[0_0_20px_rgba(192,28,211,0.45)] hover:shadow-[0_0_30px_rgba(192,38,211,0.7)]'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white border border-purple-300 shadow-[0_0_20px_rgba(147,51,234,0.35)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)]'
                } disabled:opacity-70 whitespace-nowrap`}
            >
              {/* Animated Glowing Pulse Ring */}
              <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500 opacity-75 blur-md group-hover:opacity-100 animate-pulse pointer-events-none" />

              {/* Shimmer Light Beam */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

              <span className="relative z-10 flex items-center gap-1.5 lg:gap-2">
                {isLoginLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <LogIn className="h-3.5 w-3.5 lg:h-4 lg:w-4" strokeWidth={2.5} />
                )}
                <span>تسجيل الدخول</span>
              </span>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Backdrop Overlay & Drawer with Smooth Physics-based Spring Animation */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="mobile-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className={`fixed inset-0 z-50 backdrop-blur-md md:hidden ${isDark ? 'bg-black/60' : 'bg-slate-900/30'
                }`}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            <motion.aside
              key="mobile-drawer-panel"
              dir="rtl"
              aria-label="القائمة الجانبية للهاتف"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{
                type: 'spring',
                damping: 32,
                stiffness: 320,
                mass: 0.85,
              }}
              className={`fixed inset-y-0 right-0 z-50 flex h-[100dvh] w-[86vw] max-w-[340px] flex-col border-l backdrop-blur-2xl md:hidden will-change-transform ${isDark
                ? 'border-purple-500/20 bg-[#0c0317]/98 text-white shadow-[-16px_0_50px_rgba(0,0,0,0.85)]'
                : 'border-stone-200/80 bg-[#fbfaf8]/98 text-stone-900 shadow-[-12px_0_40px_rgba(0,0,0,0.08)]'
                }`}
            >
              {/* 1. Header: Logo Zad, "زاد", Close button (X) on the left */}
              <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-purple-500/20' : 'border-stone-200/60'}`}>
                <div className="flex items-center gap-2.5">
                  <img src={isDark ? whiteLogo : darkLogo} alt="زاد" className="h-9 w-9 object-contain" />
                  <span className={`font-display text-2xl font-bold tracking-wide ${isDark ? 'text-white' : 'text-stone-900'}`}>زاد</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="إغلاق القائمة"
                  className={`flex h-9.5 w-9.5 items-center justify-center rounded-full border shadow-sm active:scale-90 transition-all ${isDark
                    ? 'border-white/15 bg-white/10 text-white/90 hover:bg-white/20 hover:text-white hover:border-white/25'
                    : 'border-stone-200/90 bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-900 shadow-stone-200/50'
                    }`}
                >
                  <X size={19} strokeWidth={2.2} />
                </button>
              </div>

              {/* Scrollable Content */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.08 }}
                className={`flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4 text-right [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full ${isDark ? '[&::-webkit-scrollbar-thumb]:bg-purple-500/30' : '[&::-webkit-scrollbar-thumb]:bg-stone-300'
                  }`}
              >
                {/* Auth Section - Display welcome & login ONLY when NOT authenticated */}
                {!isAuthenticated && (
                  <div className={`rounded-2xl border p-4 text-right shadow-sm ${isDark
                    ? 'border-purple-500/30 bg-purple-950/20 shadow-purple-950/20'
                    : 'border-stone-200/80 bg-white/90 shadow-stone-200/50'
                    }`}>
                    <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>مرحباً بك</h4>
                    <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-purple-200/70' : 'text-stone-500'}`}>
                      قم بالتسجيل للاستفادة من خدمات الموقع
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false)
                        setIsLoginLoading(true)
                        onTryChat()
                        setTimeout(() => setIsLoginLoading(false), 1500)
                      }}
                      disabled={isLoginLoading}
                      className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#53177d] hover:bg-[#431265] text-white py-2.5 px-4 text-xs font-bold shadow-sm shadow-[#53177d]/20 active:scale-[0.98] transition-all"
                    >
                      {isLoginLoading ? <Loader2 size={15} className="animate-spin" /> : <LogIn size={15} />}
                      <span>تسجيل الدخول / إنشاء حساب</span>
                    </button>
                  </div>
                )}

                {/* 3. Main Navigation Items */}
                <div className="space-y-1.5">
                  <div className="px-2 text-[11px] font-bold text-stone-400 dark:text-purple-300/40 tracking-wider">
                    التنقل الأساسي
                  </div>

                  {/* الرئيسية (Active / Highlighted) */}
                  <a
                    href="#home"
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm font-bold active:scale-[0.99] transition-all ${isDark
                      ? 'border-purple-500/40 bg-purple-950/40 text-purple-200'
                      : 'border-purple-600/30 bg-purple-50/80 text-purple-950 shadow-sm'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#53177d] text-white shadow-sm shadow-[#53177d]/20">
                        <Home size={16} />
                      </div>
                      <span>الرئيسية</span>
                    </div>
                    <span className={`h-2 w-2 rounded-full ${isDark ? 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-purple-700'}`} />
                  </a>

                  {/* المكتبة */}
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      onOpenKnowledge()
                    }}
                    className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm font-semibold active:scale-[0.99] transition-all ${isDark
                      ? 'border-white/5 bg-white/[0.03] text-white/90 hover:bg-white/10'
                      : 'border-stone-200/60 bg-white/70 text-stone-800 hover:bg-stone-100/70'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200/60 text-amber-700'
                        }`}>
                        <BookOpen size={16} />
                      </div>
                      <span>المكتبة</span>
                    </div>
                    <ChevronLeft size={16} className={isDark ? 'text-white/30' : 'text-stone-400'} />
                  </button>

                  {/* الشروحات والدورات (Video Icon) */}
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      onOpenLessons()
                    }}
                    className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm font-semibold active:scale-[0.99] transition-all ${isDark
                      ? 'border-white/5 bg-white/[0.03] text-white/90 hover:bg-white/10'
                      : 'border-stone-200/60 bg-white/70 text-stone-800 hover:bg-stone-100/70'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${isDark ? 'bg-sky-500/10 border-sky-500/20 text-sky-300' : 'bg-sky-50 border-sky-200/60 text-sky-700'
                        }`}>
                        <Video size={16} />
                      </div>
                      <span>الشروحات والدورات</span>
                    </div>
                    <ChevronLeft size={16} className={isDark ? 'text-white/30' : 'text-stone-400'} />
                  </button>
                </div>

                {/* 4. AI & Interactive Section (Same header formatting, BookOpenCheck icon) */}
                <div className={`space-y-1.5 pt-3 border-t ${isDark ? 'border-white/10' : 'border-stone-200/70'}`}>
                  <div className="px-2 text-[11px] font-bold text-stone-400 dark:text-purple-300/40 tracking-wider">
                    أدوات زاد التفاعلية
                  </div>

                  {/* وضع الدراسة (BookOpenCheck Icon) */}
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      onOpenStudy()
                    }}
                    className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm font-semibold active:scale-[0.99] transition-all ${isDark
                      ? 'border-white/5 bg-white/[0.03] text-white/90 hover:bg-white/10'
                      : 'border-stone-200/60 bg-white/70 text-stone-800 hover:bg-stone-100/70'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${isDark ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' : 'bg-purple-50 border-purple-200/60 text-purple-700'
                        }`}>
                        <BookOpenCheck size={16} />
                      </div>
                      <span>وضع الدراسة</span>
                    </div>
                    <ChevronLeft size={16} className={isDark ? 'text-white/30' : 'text-stone-400'} />
                  </button>

                  {/* المحادثة النصية */}
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      onTryChat()
                    }}
                    className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm font-semibold active:scale-[0.99] transition-all ${isDark
                      ? 'border-white/5 bg-white/[0.03] text-white/90 hover:bg-white/10'
                      : 'border-stone-200/60 bg-white/70 text-stone-800 hover:bg-stone-100/70'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' : 'bg-blue-50 border-blue-200/60 text-blue-700'
                        }`}>
                        <MessageSquare size={16} />
                      </div>
                      <span>المحادثة النصية</span>
                    </div>
                    <ChevronLeft size={16} className={isDark ? 'text-white/30' : 'text-stone-400'} />
                  </button>

                  {/* المحادثة الصوتية (تحت الإنشاء) */}
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      if (onOpenVoiceChat) onOpenVoiceChat()
                    }}
                    className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm font-semibold active:scale-[0.99] transition-all ${isDark
                      ? 'border-white/5 bg-white/[0.03] text-white/90 hover:bg-white/10'
                      : 'border-stone-200/60 bg-white/70 text-stone-800 hover:bg-stone-100/70'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-200/60 text-emerald-700'
                        }`}>
                        <Mic size={16} />
                      </div>
                      <span>المحادثة الصوتية</span>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${isDark ? 'bg-amber-500/15 text-amber-300 border-amber-500/25' : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                      تحت الإنشاء ⏳
                    </span>
                  </button>
                </div>

                {/* Admin Management Tools (If admin) */}
                {isAuthenticated && isAdmin && (
                  <div className={`pt-2 border-t space-y-1 ${isDark ? 'border-purple-500/15' : 'border-stone-200/60'}`}>
                    <div className={`flex items-center gap-2 px-2 py-1 text-[11px] font-bold ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
                      <ShieldCheck size={13} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                      <span>لوحة تحكم المسؤول</span>
                    </div>

                    {onOpenTurathRag && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false)
                          onOpenTurathRag()
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-right text-xs font-semibold transition-colors ${isDark ? 'text-sky-400 hover:bg-white/10' : 'text-sky-700 hover:bg-sky-50'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <Zap size={13} />
                          <span>استخراج وتخزين الكتب</span>
                        </div>
                        <ChevronLeft size={12} className={isDark ? 'text-sky-400/50' : 'text-sky-700/50'} />
                      </button>
                    )}

                    {onOpenEngineControl && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false)
                          onOpenEngineControl()
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-right text-xs font-semibold transition-colors ${isDark ? 'text-purple-400 hover:bg-white/10' : 'text-purple-700 hover:bg-purple-50'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <Cpu size={13} />
                          <span>التحكم في محركات RAG</span>
                        </div>
                        <ChevronLeft size={12} className={isDark ? 'text-purple-400/50' : 'text-purple-700/50'} />
                      </button>
                    )}

                    {onOpenAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false)
                          onOpenAdmin()
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-right text-xs font-semibold transition-colors ${isDark ? 'text-brand-blue hover:bg-white/10' : 'text-blue-700 hover:bg-blue-50'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <LayoutDashboard size={13} />
                          <span>إدارة وضع الدراسة</span>
                        </div>
                        <ChevronLeft size={12} className={isDark ? 'text-blue-400/50' : 'text-blue-700/50'} />
                      </button>
                    )}

                    {onOpenDataIngestion && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false)
                          onOpenDataIngestion()
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-right text-xs font-semibold transition-colors ${isDark ? 'text-emerald-400 hover:bg-white/10' : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <Database size={13} />
                          <span>إدارة البيانات</span>
                        </div>
                        <ChevronLeft size={12} className={isDark ? 'text-emerald-400/50' : 'text-emerald-700/50'} />
                      </button>
                    )}

                    {onOpenV2PipelineAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false)
                          onOpenV2PipelineAdmin()
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-right text-xs font-semibold transition-colors ${isDark ? 'text-blue-400 hover:bg-white/10' : 'text-blue-700 hover:bg-blue-50'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles size={13} />
                          <span>إدخال بيانات AI</span>
                        </div>
                        <ChevronLeft size={12} className={isDark ? 'text-blue-400/50' : 'text-blue-700/50'} />
                      </button>
                    )}

                    {onOpenAdminLibrary && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false)
                          onOpenAdminLibrary()
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-right text-xs font-semibold transition-colors ${isDark ? 'text-amber-400 hover:bg-white/10' : 'text-amber-700 hover:bg-amber-50'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <Settings size={13} />
                          <span>إدارة مكتبة القراءة</span>
                        </div>
                        <ChevronLeft size={12} className={isDark ? 'text-amber-400/50' : 'text-amber-700/50'} />
                      </button>
                    )}

                    {onOpenYoutubeImporter && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false)
                          onOpenYoutubeImporter()
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-right text-xs font-semibold transition-colors ${isDark ? 'text-red-400 hover:bg-white/10' : 'text-red-700 hover:bg-red-50'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <Video size={13} />
                          <span>استيراد شروحات يوتيوب</span>
                        </div>
                        <ChevronLeft size={12} className={isDark ? 'text-red-400/50' : 'text-red-700/50'} />
                      </button>
                    )}

                    {onOpenSystemObservability && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false)
                          onOpenSystemObservability()
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-right text-xs font-semibold transition-colors ${isDark ? 'text-amber-300 hover:bg-white/10' : 'text-amber-700 hover:bg-amber-50'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <Activity size={13} />
                          <span>مراقبة النظام والـ AI</span>
                        </div>
                        <ChevronLeft size={12} className={isDark ? 'text-amber-300/50' : 'text-amber-700/50'} />
                      </button>
                    )}
                  </div>
                )}

                {/* 5. Customization & Appearance Section (المظهر والتخصيص) */}
                <div className={`space-y-2 pt-3 border-t ${isDark ? 'border-white/10' : 'border-stone-200/70'}`}>
                  <div className="px-2 text-[11px] font-bold text-stone-400 dark:text-purple-300/40 tracking-wider">
                    المظهر والتخصيص
                  </div>

                  {/* الإشعارات والتحديثات */}
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      setTimeout(() => {
                        window.dispatchEvent(new Event('open_zad_notifications'))
                      }, 120)
                    }}
                    className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm font-semibold active:scale-[0.99] transition-all ${isDark
                      ? 'border-white/5 bg-white/[0.03] text-white/90 hover:bg-white/10'
                      : 'border-stone-200/60 bg-white/70 text-stone-800 hover:bg-stone-100/70'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${isDark ? 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-300' : 'bg-fuchsia-50 border-fuchsia-200/60 text-fuchsia-700'
                        }`}>
                        <Bell size={16} />
                      </div>
                      <span>الإشعارات والتحديثات</span>
                    </div>
                    <ChevronLeft size={16} className={isDark ? 'text-white/30' : 'text-stone-400'} />
                  </button>

                  {/* مظهر التطبيق (Toggle Switch) */}
                  <div
                    onClick={toggleTheme}
                    role="button"
                    tabIndex={0}
                    className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm font-semibold cursor-pointer active:scale-[0.99] transition-all select-none ${isDark
                      ? 'border-white/5 bg-white/[0.03] text-white/90 hover:bg-white/10'
                      : 'border-stone-200/60 bg-white/70 text-stone-800 hover:bg-stone-100/70'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${isDark
                          ? 'bg-purple-500/15 border-purple-500/25 text-purple-300'
                          : 'bg-amber-50 border-amber-200/60 text-amber-600'
                        }`}>
                        {isDark ? <Moon size={16} /> : <Sun size={16} />}
                      </div>
                      <div className="text-right">
                        <span className="block text-sm font-bold">مظهر التطبيق</span>
                        <span className={`text-[11px] font-normal ${isDark ? 'text-purple-300/60' : 'text-stone-500'}`}>
                          {isDark ? 'الوضع الليلي مفعّل' : 'الوضع النهاري مفعّل'}
                        </span>
                      </div>
                    </div>

                    {/* Modern Animated Switch Component */}
                    <div
                      className={`relative flex h-7 w-14 items-center rounded-full p-1 transition-colors duration-300 ${isDark
                          ? 'bg-gradient-to-r from-purple-700 to-indigo-600 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                          : 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                        }`}
                    >
                      {/* Track background icons */}
                      <div className="absolute inset-x-2 flex justify-between items-center text-[10px] pointer-events-none">
                        <Moon size={12} className={isDark ? 'text-white/80' : 'text-black/25'} />
                        <Sun size={12} className={!isDark ? 'text-amber-950/80' : 'text-white/25'} />
                      </div>

                      {/* Sliding Knob */}
                      <motion.div
                        layout
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className={`z-10 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md ${isDark ? 'mr-0 ml-auto text-purple-700' : 'ml-0 mr-auto text-amber-600'
                          }`}
                      >
                        {isDark ? <Moon size={11} strokeWidth={2.5} /> : <Sun size={11} strokeWidth={2.5} />}
                      </motion.div>
                    </div>
                  </div>



                  {/* لون السمة */}
                  <div className={`rounded-xl border p-3 ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-stone-200/60 bg-white/60'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <Palette size={15} className={accentColor === 'emerald' ? 'text-emerald-400' : accentColor === 'amber' ? 'text-amber-400' : accentColor === 'blue' ? 'text-blue-400' : 'text-purple-400'} />
                        <span>لون السمة</span>
                      </div>
                      <span className={`text-[10px] font-bold ${accentColor === 'emerald' ? 'text-emerald-400' : accentColor === 'amber' ? 'text-amber-400' : accentColor === 'blue' ? 'text-blue-400' : 'text-purple-400'}`}>
                        {accentColor === 'purple' && 'أرجواني ملكي'}
                        {accentColor === 'emerald' && 'زمردي قرآني'}
                        {accentColor === 'amber' && 'ذهبي أندلسي'}
                        {accentColor === 'blue' && 'أزرق ياقوتي'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 justify-end">
                      <button
                        type="button"
                        onClick={() => setAccentColor('purple')}
                        title="أرجواني ملكي"
                        className={`h-6 w-6 rounded-full bg-gradient-to-tr from-purple-700 to-fuchsia-500 transition-all active:scale-90 ${accentColor === 'purple' ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-[#120324] scale-110 shadow-md shadow-purple-500/30' : 'opacity-60 hover:opacity-100'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setAccentColor('emerald')}
                        title="زمردي قرآني"
                        className={`h-6 w-6 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-500 transition-all active:scale-90 ${accentColor === 'emerald' ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#120324] scale-110 shadow-md shadow-emerald-500/30' : 'opacity-60 hover:opacity-100'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setAccentColor('amber')}
                        title="ذهبي أندلسي"
                        className={`h-6 w-6 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 transition-all active:scale-90 ${accentColor === 'amber' ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#120324] scale-110 shadow-md shadow-amber-500/30' : 'opacity-60 hover:opacity-100'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setAccentColor('blue')}
                        title="أزرق ياقوتي"
                        className={`h-6 w-6 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-500 transition-all active:scale-90 ${accentColor === 'blue' ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-[#120324] scale-110 shadow-md shadow-blue-500/30' : 'opacity-60 hover:opacity-100'
                          }`}
                      />
                    </div>
                  </div>
                </div>

                {/* User Profile Card at the very bottom (if authenticated) */}
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      setShowProfileModal(true)
                    }}
                    className={`flex w-full items-center justify-between rounded-2xl border p-3 text-right transition-all duration-200 active:scale-[0.98] ${isDark
                      ? 'border-purple-500/25 bg-gradient-to-r from-purple-950/50 via-[#18052e] to-[#120324] text-white shadow-lg shadow-purple-950/30 hover:border-purple-400/40'
                      : 'border-stone-200/90 bg-white/95 text-stone-900 shadow-sm hover:border-purple-300'
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* User Icon or Photo - No first letters! */}
                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl brand-gradient text-white shadow-md overflow-hidden">
                        {user?.avatarUrl ? (
                          <img src={getAvatarUrl(user.avatarUrl)} alt={user?.name || 'مستخدم'} className="h-full w-full object-cover" />
                        ) : (
                          <User size={22} strokeWidth={2.2} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 text-right">
                        <div className="flex items-center gap-2">
                          <span className={`truncate text-sm font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>
                            {user?.name || (isAdmin ? 'مسؤول النظام' : 'مستخدم زاد')}
                          </span>
                          {isAdmin ? (
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold border ${isDark ? 'bg-purple-500/25 text-purple-300 border-purple-500/30' : 'bg-purple-100 text-purple-800 border-purple-200'}`}>
                              أدمن
                            </span>
                          ) : (
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold border ${isDark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
                              متصل
                            </span>
                          )}
                        </div>
                        <p className={`truncate text-xs font-mono mt-0.5 ${isDark ? 'text-purple-200/60' : 'text-stone-500'}`}>
                          {user?.email || 'طالب علم'}
                        </p>
                      </div>
                    </div>
                    <ChevronLeft size={18} className={isDark ? 'text-purple-300/60' : 'text-stone-400'} />
                  </button>
                )}

                {/* Zad App Download Badges */}
                <div className="pt-2 text-center">
                  <p className={`text-[11px] font-semibold mb-2 ${isDark ? 'text-purple-200/60' : 'text-stone-500'}`}>حمّل تطبيق زاد للهاتف</p>
                  <div className="flex justify-center scale-90 origin-center">
                    <StoreBadges variant={isDark ? 'dark' : 'light'} />
                  </div>
                </div>
              </motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </header>
  )
}
