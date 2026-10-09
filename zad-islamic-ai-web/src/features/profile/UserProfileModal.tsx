import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  User,
  Camera,
  Lock,
  Mail,
  Shield,
  LogOut,
  Check,
  AlertCircle,
  Loader2,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { apiClient, getAvatarUrl } from '../../api/client'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, logout, updateUser } = useAuth()
  const { isDark } = useTheme()

  const [name, setName] = useState(user?.name || '')
  const [isUpdatingName, setIsUpdatingName] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)

  // Sync latest user profile on modal open
  React.useEffect(() => {
    if (isOpen) {
      apiClient<any>('/api/user/profile')
        .then((freshUser) => {
          if (freshUser) {
            updateUser({
              name: freshUser.name,
              avatarUrl: freshUser.avatarUrl,
              role: freshUser.role,
            })
            if (freshUser.name) setName(freshUser.name)
          }
        })
        .catch(() => {})
    }
  }, [isOpen])

  React.useEffect(() => {
    if (user?.name) {
      setName(user.name)
    }
  }, [user?.name])

  // Avatar Upload State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Password Change State
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase().includes('admin')

  // Handle Profile Picture Selection & Upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setAvatarError('يرجى اختيار ملف صورة صالح.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('حجم الصورة يجب ألا يتجاوز 5 ميجابايت.')
      return
    }

    setAvatarError(null)
    setIsUploadingAvatar(true)

    // Immediate optimistic local preview
    const localUrl = URL.createObjectURL(file)
    updateUser({ avatarUrl: localUrl })

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Upload to backend API
      const res = await apiClient<{ avatarUrl: string }>('/api/user/avatar', {
        method: 'POST',
        body: formData,
      })

      if (res?.avatarUrl) {
        updateUser({ avatarUrl: res.avatarUrl })
      }
    } catch (err: any) {
      console.warn('Avatar upload to server failed, kept local avatar in browser session:', err)
      // Even if backend is not yet restarted or unavailable, local avatar persists in localStorage
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Handle Name Update
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || name.trim() === user?.name) return

    setIsUpdatingName(true)
    setNameSuccess(false)

    try {
      await apiClient('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: name.trim() }),
      })
      updateUser({ name: name.trim() })
      setNameSuccess(true)
      setTimeout(() => setNameSuccess(false), 3000)
    } catch (err) {
      // Optimistic update locally
      updateUser({ name: name.trim() })
      setNameSuccess(true)
      setTimeout(() => setNameSuccess(false), 3000)
    } finally {
      setIsUpdatingName(false)
    }
  }

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage(null)

    if (!currentPassword) {
      setPasswordMessage({ text: 'يرجى إدخال كلمة المرور الحالية.', type: 'error' })
      return
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ text: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.', type: 'error' })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: 'كلمة المرور الجديدة وتأكيدها غير متطابقين.', type: 'error' })
      return
    }

    setIsUpdatingPassword(true)

    try {
      await apiClient('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      setPasswordMessage({ text: 'تم تغيير كلمة المرور بنجاح!', type: 'success' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setShowPasswordSection(false)
        setPasswordMessage(null)
      }, 2500)
    } catch (err: any) {
      setPasswordMessage({
        text: err?.message || 'فشل تغيير كلمة المرور. تأكد من صحة كلمة المرور الحالية.',
        type: 'error',
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir="rtl">
          {/* Frosted Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 backdrop-blur-md transition-opacity ${
              isDark ? 'bg-black/70' : 'bg-slate-900/40'
            }`}
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={`relative flex w-full max-w-lg flex-col overflow-hidden rounded-[2rem] border shadow-2xl backdrop-blur-2xl max-h-[92dvh] ${
              isDark
                ? 'border-purple-500/25 bg-[#0f041c]/98 text-white shadow-[0_20px_60px_rgba(0,0,0,0.85)]'
                : 'border-stone-200/90 bg-[#fcfbfa]/98 text-stone-900 shadow-[0_20px_50px_rgba(0,0,0,0.12)]'
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between border-b px-6 py-4.5 ${
                isDark ? 'border-purple-500/20 bg-purple-950/20' : 'border-stone-200/70 bg-stone-100/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                    isDark
                      ? 'border-purple-500/30 bg-purple-500/15 text-purple-300'
                      : 'border-purple-200 bg-purple-50 text-purple-700'
                  }`}
                >
                  <User size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold">الملف الشخصي</h3>
                  <p className={`text-[11px] ${isDark ? 'text-purple-200/60' : 'text-stone-500'}`}>
                    إدارة بيانات حسابك في منصة زاد
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="إغلاق"
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-95 ${
                  isDark
                    ? 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                    : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div
              className={`flex-1 overflow-y-auto px-6 py-6 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full ${
                isDark ? '[&::-webkit-scrollbar-thumb]:bg-purple-500/30' : '[&::-webkit-scrollbar-thumb]:bg-stone-300'
              }`}
            >
              {/* 1. Avatar Photo Section */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative group">
                  <div className="relative flex h-26 w-26 items-center justify-center rounded-full border-2 border-purple-500/40 p-1 shadow-lg shadow-purple-950/30 overflow-hidden">
                    {user?.avatarUrl ? (
                      <img
                        src={getAvatarUrl(user.avatarUrl)}
                        alt={user?.name || 'صورة الحساب'}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full brand-gradient text-white shadow-inner">
                        <User size={44} strokeWidth={2} />
                      </div>
                    )}

                    {/* Uploading Spinner Overlay */}
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                        <Loader2 size={24} className="animate-spin text-white" />
                      </div>
                    )}
                  </div>

                  {/* Camera Icon Trigger */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    aria-label="تغيير صورة البروفايل"
                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#53177d] hover:bg-[#681c9c] text-white shadow-md shadow-purple-950/40 border-2 border-white transition-all transform hover:scale-110 active:scale-95"
                  >
                    <Camera size={14} />
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="mt-3">
                  <h4 className="text-base font-bold">{user?.name || 'مستخدم زاد'}</h4>
                  <div className="mt-1 flex items-center justify-center gap-1.5">
                    {isAdmin ? (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                          isDark
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : 'bg-purple-100 text-purple-800 border-purple-200'
                        }`}
                      >
                        مسؤول النظام (أدمن)
                      </span>
                    ) : (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                          isDark
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        طالب علم
                      </span>
                    )}
                  </div>
                </div>

                {avatarError && (
                  <p className="mt-2 text-xs text-red-400 font-medium">{avatarError}</p>
                )}
              </div>

              {/* 2. Account Details: Name & Email */}
              <div className="space-y-4">
                {/* Email (Readonly) */}
                <div>
                  <label
                    className={`block text-xs font-semibold mb-1.5 ${
                      isDark ? 'text-purple-200/70' : 'text-stone-600'
                    }`}
                  >
                    البريد الإلكتروني
                  </label>
                  <div
                    className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs font-mono select-all ${
                      isDark
                        ? 'border-white/10 bg-white/5 text-purple-200/80'
                        : 'border-stone-200 bg-stone-100/70 text-stone-700'
                    }`}
                  >
                    <Mail size={15} className="shrink-0 opacity-60" />
                    <span className="truncate">{user?.email || 'user@zad.app'}</span>
                    <span
                      className={`mr-auto shrink-0 rounded-md px-2 py-0.5 text-[10px] font-sans font-bold border ${
                        isDark
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      موثّق
                    </span>
                  </div>
                </div>

                {/* Edit Display Name */}
                <form onSubmit={handleSaveName} className="space-y-1.5">
                  <label
                    className={`block text-xs font-semibold mb-1.5 ${
                      isDark ? 'text-purple-200/70' : 'text-stone-600'
                    }`}
                  >
                    الاسم المعروض
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="أدخل اسمك الكامل"
                      className={`flex-1 rounded-xl border px-3.5 py-2.5 text-sm font-semibold outline-none transition-colors ${
                        isDark
                          ? 'border-purple-500/30 bg-purple-950/20 text-white focus:border-purple-400 placeholder:text-white/30'
                          : 'border-stone-300 bg-white text-stone-900 focus:border-purple-600 placeholder:text-stone-400'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={isUpdatingName || !name.trim() || name.trim() === user?.name}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-[#53177d] hover:bg-[#681c9c] text-white px-4 py-2.5 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                    >
                      {isUpdatingName ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : nameSuccess ? (
                        <>
                          <Check size={14} className="text-emerald-300" />
                          <span>تم الحفظ</span>
                        </>
                      ) : (
                        <span>حفظ</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* 3. Password Change Section */}
              <div
                className={`rounded-2xl border p-4 transition-all ${
                  isDark ? 'border-purple-500/20 bg-purple-950/20' : 'border-stone-200 bg-white shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                        isDark
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                          : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}
                    >
                      <KeyRound size={15} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">كلمة المرور والأمان</h4>
                      <p className={`text-[11px] ${isDark ? 'text-purple-200/60' : 'text-stone-500'}`}>
                        تحديث كلمة السر لحماية الحساب
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordSection(!showPasswordSection)
                      setPasswordMessage(null)
                    }}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                      showPasswordSection
                        ? 'border-purple-500/40 bg-purple-500/20 text-purple-300'
                        : isDark
                        ? 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                        : 'border-stone-200 bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {showPasswordSection ? 'إلغاء' : 'تغيير كلمة المرور'}
                  </button>
                </div>

                {showPasswordSection && (
                  <form onSubmit={handleChangePassword} className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    {passwordMessage && (
                      <div
                        className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-medium border ${
                          passwordMessage.type === 'success'
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                            : 'bg-red-500/15 border-red-500/30 text-red-300'
                        }`}
                      >
                        {passwordMessage.type === 'success' ? (
                          <Check size={14} className="shrink-0" />
                        ) : (
                          <AlertCircle size={14} className="shrink-0" />
                        )}
                        <span>{passwordMessage.text}</span>
                      </div>
                    )}

                    <div>
                      <label
                        className={`block text-[11px] font-semibold mb-1 ${
                          isDark ? 'text-purple-200/70' : 'text-stone-600'
                        }`}
                      >
                        كلمة المرور الحالية
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold outline-none ${
                          isDark
                            ? 'border-purple-500/30 bg-black/30 text-white focus:border-purple-400'
                            : 'border-stone-300 bg-stone-50 text-stone-900 focus:border-purple-600'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label
                          className={`block text-[11px] font-semibold mb-1 ${
                            isDark ? 'text-purple-200/70' : 'text-stone-600'
                          }`}
                        >
                          كلمة المرور الجديدة
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold outline-none ${
                            isDark
                              ? 'border-purple-500/30 bg-black/30 text-white focus:border-purple-400'
                              : 'border-stone-300 bg-stone-50 text-stone-900 focus:border-purple-600'
                          }`}
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-[11px] font-semibold mb-1 ${
                            isDark ? 'text-purple-200/70' : 'text-stone-600'
                          }`}
                        >
                          تأكيد كلمة المرور
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold outline-none ${
                            isDark
                              ? 'border-purple-500/30 bg-black/30 text-white focus:border-purple-400'
                              : 'border-stone-300 bg-stone-50 text-stone-900 focus:border-purple-600'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${
                          isDark ? 'text-purple-200/60 hover:text-white' : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                        <span>{showPassword ? 'إخفاء الرموز' : 'إظهار الرموز'}</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isUpdatingPassword || !currentPassword || !newPassword}
                        className="rounded-xl bg-[#53177d] hover:bg-[#681c9c] text-white px-4 py-2 text-xs font-bold transition-all disabled:opacity-40 active:scale-95 flex items-center gap-1.5"
                      >
                        {isUpdatingPassword && <Loader2 size={13} className="animate-spin" />}
                        <span>حفظ كلمة المرور</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* 4. Action: Logout Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    logout()
                  }}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border py-3 px-4 text-xs font-bold transition-all active:scale-98 ${
                    isDark
                      ? 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  <LogOut size={16} />
                  <span>تسجيل الخروج من الحساب</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
