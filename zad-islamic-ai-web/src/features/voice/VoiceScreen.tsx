import { useEffect, useRef, useState, useCallback } from 'react'
import whiteLogo from '@/assets/images/WhiteLogo.png'
import zadDarkLogo from '@/assets/images/ZadDarkLogo.png'
import { demoReply } from '../chat/data'
import { useMicrophoneVolume } from '../../hooks/useMicrophoneVolume'
import { Sun, Moon, ArrowLeft, AlignRight, MessageCircle, X, Mic, MicOff } from 'lucide-react'
import VoiceChatButton from '../../components/ui/VoiceChatButton'
import bgDark from '@/assets/images/image.png'
import bgLight from '@/assets/images/bg-islamic-light.png'
import Starfield from '../../components/layout/Starfield'

type Status = 'idle' | 'listening' | 'thinking' | 'speaking' | 'muted'

const STATUS_TEXT: Record<Status, string> = {
  idle: 'مرحبًا بك، اضغط للبدء…',
  listening: 'أستمع إليك الآن…',
  thinking: 'أفكّر في إجابتك…',
  speaking: 'زاد يتحدّث…',
  muted: 'الميكروفون مكتوم (الذكاء الاصطناعي لا يسمعك)',
}

// The browser Speech APIs are still vendor-prefixed in some engines.
function getRecognition(): any | null {
  const w = window as any
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition
  return Ctor ? new Ctor() : null
}

import { useTheme } from '../../contexts/ThemeContext'

export default function VoiceScreen({ onExit, onOpenText }: { onExit: () => void; onOpenText: () => void }) {
  const { isDark: dark, toggleTheme } = useTheme()
  const [status, setStatus] = useState<Status>('idle')
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [reply, setReply] = useState('')
  const [supported, setSupported] = useState(true)
  const [typedIdleText, setTypedIdleText] = useState('')

  const recognitionRef = useRef<any>(null)
  const transcriptRef = useRef<string>('')
  const isCallActiveRef = useRef<boolean>(false)
  const isMutedRef = useRef<boolean>(false)

  // Real-time audio volume hook for animation
  const volume = useMicrophoneVolume(isCallActive && !isMuted)

  useEffect(() => {
    isCallActiveRef.current = isCallActive
  }, [isCallActive])

  useEffect(() => {
    isMutedRef.current = isMuted
  }, [isMuted])

  useEffect(() => {
    if (status !== 'idle' || isCallActive) {
      setTypedIdleText('')
      return
    }
    const text = 'مرحبًا بك، اضغط للبدء…'
    let i = 0
    let isDeleting = false
    let timer: NodeJS.Timeout

    const tick = () => {
      if (!isDeleting) {
        setTypedIdleText(text.slice(0, i + 1))
        i++
        if (i === text.length) {
          isDeleting = true
          timer = setTimeout(tick, 2000) // pause before erasing
        } else {
          timer = setTimeout(tick, 70)
        }
      } else {
        setTypedIdleText(text.slice(0, i - 1))
        i--
        if (i === 0) {
          isDeleting = false
          timer = setTimeout(tick, 500) // pause before re-typing
        } else {
          timer = setTimeout(tick, 40)
        }
      }
    }
    timer = setTimeout(tick, 100)
    return () => clearTimeout(timer)
  }, [status, isCallActive])

  const respond = useCallback((question: string) => {
    setStatus('thinking')
    window.setTimeout(() => {
      const answer = demoReply(question, 'auto')
      setReply(answer)
      speak(answer)
    }, 1000)
  }, [])

  useEffect(() => {
    transcriptRef.current = transcript
  }, [transcript])

  useEffect(() => {
    const rec = getRecognition()
    if (!rec) {
      setSupported(false)
      return
    }
    rec.lang = 'ar-SA'
    rec.interimResults = true
    rec.continuous = false

    rec.onresult = (event: any) => {
      if (isMutedRef.current) return
      const text = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join(' ')
      setTranscript(text)
    }
    rec.onerror = () => {
      if (isCallActiveRef.current && !isMutedRef.current) {
        // Auto-restart if call is active but an error occurred (e.g. no speech detected)
        setTimeout(() => {
          try { recognitionRef.current?.start() } catch (e) { }
        }, 300)
      } else if (!isCallActiveRef.current) {
        setStatus('idle')
      }
    }
    rec.onend = () => {
      setStatus((currentStatus) => {
        if (currentStatus === 'listening') {
          const finalTranscript = transcriptRef.current.trim()
          if (finalTranscript && !isMutedRef.current) {
            respond(finalTranscript)
            return 'thinking'
          }
          // If no transcript but call is still active, restart listening
          if (isCallActiveRef.current && !isMutedRef.current) {
            setTimeout(() => {
              try { recognitionRef.current?.start() } catch (e) { }
            }, 100)
            return 'listening'
          }
          if (isMutedRef.current) {
             return 'muted'
          }
          return 'idle'
        }
        return currentStatus
      })
    }

    recognitionRef.current = rec
    return () => {
      try {
        rec.abort()
      } catch {
        /* noop */
      }
      window.speechSynthesis?.cancel()
    }
  }, [respond])

  const speak = (text: string) => {
    const synth = window.speechSynthesis
    if (!synth) {
      if (isCallActiveRef.current) {
        setTranscript('')
        setReply('')
        if (!isMutedRef.current) {
          setTimeout(() => { try { recognitionRef.current?.start(); setStatus('listening') } catch (e) { } }, 500)
        } else {
          setStatus('muted')
        }
      } else {
        setStatus('idle')
      }
      return
    }
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'ar-SA'
    utter.rate = 0.95
    utter.onend = () => {
      if (isCallActiveRef.current) {
        // Automatically start listening again after Zad finishes speaking!
        setTranscript('')
        setReply('')
        if (!isMutedRef.current) {
          setTimeout(() => {
            try {
              recognitionRef.current?.start()
              setStatus('listening')
            } catch (e) { }
          }, 500)
        } else {
          setStatus('muted')
        }
      } else {
        setStatus('idle')
      }
    }
    setStatus('speaking')
    synth.speak(utter)
  }

  const handleMic = () => {
    if (!supported) return

    if (isCallActive) {
      // Hang up the call
      setIsCallActive(false)
      window.speechSynthesis?.cancel()
      try { recognitionRef.current?.stop() } catch (e) { }
      setStatus('idle')
      return
    }

    // Start a fresh call
    setIsCallActive(true)
    setTranscript('')
    setReply('')
    try {
      recognitionRef.current?.start()
      setStatus('listening')
    } catch {
      setStatus('idle')
      setIsCallActive(false)
    }
  }

  const isActive = status === 'listening' || status === 'speaking'

  return (
    <div
      dir="rtl"
      className={`relative flex h-screen w-full flex-col overflow-hidden transition-colors duration-500 ${dark ? 'text-white bg-[#12041f]' : 'text-brand-deep bg-[#faf7ff]'
        }`}
    >
      {/* Background Image Layers - Crossfade Animation */}
      <img
        src={bgDark}
        alt=""
        aria-hidden
        className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${dark ? 'opacity-100' : 'opacity-0'
          }`}
      />
      <img
        src={bgLight}
        alt=""
        aria-hidden
        className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${dark ? 'opacity-0' : 'opacity-100'
          }`}
      />
      {dark && <Starfield count={60} />}

      {/* Soft scrim to ensure UI readability */}
      <div
        className={`pointer-events-none absolute inset-0 ${dark ? 'bg-[#12041f]/60' : 'bg-white/40'
          }`}
      />
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-6 z-10 relative">
        <button
          type="button"
          aria-label="سجل المحادثات"
          onClick={() => setIsHistoryOpen(true)}
          className={`flex h-11 w-11 items-center justify-center rounded-full text-lg transition-all ${dark
            ? 'bg-[#a855f7]/15 backdrop-blur-md border border-[#a855f7]/30 hover:bg-[#a855f7]/25 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] text-purple-100'
            : 'bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary'
            }`}
        >
          <AlignRight size={22} strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={dark ? 'الوضع النهاري' : 'الوضع الليلي'}
            onClick={toggleTheme}
            className={`flex h-11 w-11 items-center justify-center rounded-full text-lg transition-all ${dark
              ? 'bg-[#a855f7]/15 backdrop-blur-md border border-[#a855f7]/30 hover:bg-[#a855f7]/25 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] text-purple-100'
              : 'bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary'
              }`}
          >
            <div className={`transition-all duration-700 ${dark ? 'rotate-0' : 'rotate-[360deg] scale-110'}`}>
              {dark ? <Moon size={22} strokeWidth={2.5} /> : <Sun size={22} strokeWidth={2.5} />}
            </div>
          </button>
          <button
            type="button"
            aria-label="العودة للموقع"
            onClick={onExit}
            className={`flex h-11 w-11 items-center justify-center rounded-full text-lg transition-all ${dark
              ? 'bg-[#a855f7]/15 backdrop-blur-md border border-[#a855f7]/30 hover:bg-[#a855f7]/25 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] text-purple-100'
              : 'bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary'
              }`}
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* Center */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center z-10 relative">
        <div className={`flex flex-col items-center transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isCallActive ? '-translate-y-12' : 'translate-y-0'}`}>
          <div className="relative flex items-center justify-center">

            {/* Dynamic Audio Glow Ring (Spinning Conic Gradient) */}
            <span
              className={`absolute rounded-full blur-[35px] transition-opacity duration-300 ${isCallActive ? 'opacity-100 animate-[spin_4s_linear_infinite]' : 'opacity-80'
                }`}
              style={{
                width: `${250 + Math.max(volume, 0.1) * 150}px`,
                height: `${250 + Math.max(volume, 0.1) * 150}px`,
                background: 'conic-gradient(from 0deg, transparent 0%, rgba(192,32,240,0.8) 40%, rgba(168,85,247,0.9) 60%, transparent 100%)',
                transition: 'width 100ms ease-out, height 100ms ease-out'
              }}
            />

            {/* Main Logo Orb */}
            <div
              className={`relative flex h-56 w-56 items-center justify-center rounded-full z-10 ${dark ? 'bg-[#0f041c]/60 backdrop-blur-xl border border-white/10' : 'bg-white border border-primary/10'
                } ${status === 'speaking' ? 'animate-pulse' : ''}`}
              style={{
                transform: `scale(${1 + volume * 0.15})`,
                boxShadow: isCallActive
                  ? `0 0 ${40 + volume * 100}px rgba(168,85,247, ${0.4 + volume * 0.6})`
                  : `0 0 40px rgba(168,85,247, 0.4)`,
                transition: 'transform 100ms ease-out, box-shadow 100ms ease-out'
              }}
            >
              <img
                src={dark ? whiteLogo : zadDarkLogo}
                alt="شعار زاد"
                className={`object-contain drop-shadow-2xl transition-transform duration-500 ${dark ? 'h-32 w-32 scale-100' : 'h-32 w-32 scale-[1.5]'}`}
              />
            </div>
          </div>

          <p className={`mt-10 text-lg font-medium ${dark ? 'text-white/85' : 'text-primary'}`}>
            {supported ? (
              status === 'idle' ? (
                <>
                  {typedIdleText}
                  <span className="animate-pulse opacity-70">|</span>
                </>
              ) : (
                STATUS_TEXT[status]
              )
            ) : (
              'المتصفح لا يدعم الإدخال الصوتي — جرّب المحادثة النصية.'
            )}
          </p>
        </div>
      </div>

      {/* Mic button & Footer */}
      <div className="flex flex-col items-center pb-14 z-10 relative">
        <div className="flex items-center gap-6 transition-all duration-300">
          <VoiceChatButton 
            onClick={handleMic} 
            disabled={!supported} 
            isActive={isCallActive} 
            className="h-16 w-16" 
          />
          
          {/* Mute toggle button (only visible when call is active) */}
          <div className={`transition-all duration-500 overflow-hidden ${isCallActive ? 'w-14 opacity-100 scale-100' : 'w-0 opacity-0 scale-50'}`}>
            <button
              type="button"
              onClick={() => {
                const newMutedState = !isMuted
                setIsMuted(newMutedState)
                if (newMutedState) {
                  try { recognitionRef.current?.stop() } catch (e) {}
                  if (status === 'listening' || status === 'thinking') {
                    setStatus('muted')
                  }
                } else {
                  try { recognitionRef.current?.start(); setStatus('listening') } catch (e) {}
                }
              }}
              title={isMuted ? 'إلغاء الكتم' : 'كتم الميكروفون'}
              aria-label={isMuted ? 'إلغاء الكتم' : 'كتم الميكروفون'}
              className={`flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 backdrop-blur-md border ${
                isMuted 
                  ? 'bg-red-500/20 text-red-500 border-red-500/40 hover:bg-red-500/30' 
                  : dark 
                    ? 'bg-white/10 text-white border-white/20 hover:bg-white/20' 
                    : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
              }`}
            >
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* History Drawer Overlay */}
      {isHistoryOpen && (
        <div
          className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsHistoryOpen(false)}
        />
      )}

      {/* History Drawer Panel */}
      <div
        className={`absolute top-0 bottom-0 right-0 z-50 w-80 md:w-96 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.3,0.9,0.4,1)] ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'
          } ${dark ? 'bg-[#1a0730]/80 backdrop-blur-xl border-l border-white/10' : 'bg-white/80 backdrop-blur-xl border-l border-primary/10 shadow-2xl'}`}
      >
        <div className={`flex items-center justify-between p-6 border-b ${dark ? 'border-white/10' : 'border-primary/10'}`}>
          <h2 className={`font-display text-2xl font-bold ${dark ? 'text-white' : 'text-primary'}`}>سجل المحادثات</h2>
          <button
            onClick={() => setIsHistoryOpen(false)}
            className={`p-2 rounded-full transition-colors ${dark ? 'hover:bg-white/10 text-white/70' : 'hover:bg-primary/10 text-primary/70'}`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {/* Dummy History Items */}
          {[
            { title: 'أحكام صلاة المسافر', time: 'منذ ساعتين' },
            { title: 'ما هو فضل قيام الليل؟', time: 'أمس' },
            { title: 'تفسير سورة الكهف', time: 'الأسبوع الماضي' },
            { title: 'شروط زكاة المال', time: 'منذ أسبوعين' },
          ].map((chat, idx) => (
            <button
              key={idx}
              className={`w-full flex flex-col text-right p-4 rounded-2xl transition-all ${dark
                ? 'bg-white/5 hover:bg-white/10 border border-white/5'
                : 'bg-white hover:bg-primary/5 border border-primary/10 shadow-sm'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${dark ? 'bg-brand-magenta/20 text-brand-magenta' : 'bg-primary/10 text-primary'}`}>
                  <MessageCircle size={18} />
                </div>
                <span className={`font-semibold ${dark ? 'text-white/90' : 'text-brand-deep'}`}>
                  {chat.title}
                </span>
              </div>
              <span className={`mt-2 text-sm pr-11 ${dark ? 'text-white/40' : 'text-primary/50'}`}>
                {chat.time}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
