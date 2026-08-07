import { useEffect, useRef, useState } from 'react'
import whiteLogo from '@/imports/WhiteLogo.png'
import zadDarkLogo from '@/imports/ZadDarkLogo.png'
import { demoReply } from '../chat/data'

type Status = 'idle' | 'listening' | 'thinking' | 'speaking'

const STATUS_TEXT: Record<Status, string> = {
  idle: 'مرحبًا بك، اضغط للتحدّث…',
  listening: 'أستمع إليك الآن…',
  thinking: 'أفكّر في إجابتك…',
  speaking: 'زاد يتحدّث…',
}

// The browser Speech APIs are still vendor-prefixed in some engines.
function getRecognition(): any | null {
  const w = window as any
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition
  return Ctor ? new Ctor() : null
}

export default function VoiceScreen({ onExit, onOpenText }: { onExit: () => void; onOpenText: () => void }) {
  const [dark, setDark] = useState(true)
  const [status, setStatus] = useState<Status>('idle')
  const [transcript, setTranscript] = useState('')
  const [reply, setReply] = useState('')
  const [supported, setSupported] = useState(true)

  const recognitionRef = useRef<any>(null)

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
      const text = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join(' ')
      setTranscript(text)
    }
    rec.onerror = () => setStatus('idle')
    rec.onend = () => {
      setStatus((s) => (s === 'listening' ? 'idle' : s))
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
  }, [])

  const speak = (text: string) => {
    const synth = window.speechSynthesis
    if (!synth) {
      setStatus('idle')
      return
    }
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'ar-SA'
    utter.rate = 0.95
    utter.onend = () => setStatus('idle')
    setStatus('speaking')
    synth.speak(utter)
  }

  const respond = (question: string) => {
    setStatus('thinking')
    window.setTimeout(() => {
      const answer = demoReply(question, 'auto')
      setReply(answer)
      speak(answer)
    }, 700)
  }

  const handleMic = () => {
    if (!supported) return

    if (status === 'listening') {
      recognitionRef.current?.stop()
      if (transcript.trim()) respond(transcript)
      return
    }
    if (status === 'speaking') {
      window.speechSynthesis?.cancel()
      setStatus('idle')
      return
    }

    // start a fresh turn
    setTranscript('')
    setReply('')
    try {
      recognitionRef.current?.start()
      setStatus('listening')
    } catch {
      setStatus('idle')
    }
  }

  const isActive = status === 'listening' || status === 'speaking'

  return (
    <div
      dir="rtl"
      className={`relative flex h-screen w-full flex-col overflow-hidden transition-colors duration-500 ${
        dark ? 'text-white' : 'text-brand-deep'
      }`}
      style={{
        background: dark
          ? 'radial-gradient(120% 90% at 50% 0%, #3a0a63 0%, #1c0730 60%, #120421 100%)'
          : 'radial-gradient(120% 90% at 50% 0%, #ffffff 0%, #f3e9fc 55%, #e7d6f7 100%)',
      }}
    >
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 py-5">
        <button
          type="button"
          aria-label={dark ? 'الوضع النهاري' : 'الوضع الليلي'}
          onClick={() => setDark((v) => !v)}
          className={`flex h-11 w-11 items-center justify-center rounded-full text-lg transition-colors ${
            dark ? 'bg-white/10 hover:bg-white/20' : 'bg-primary/10 hover:bg-primary/20'
          }`}
        >
          {dark ? '☀️' : '🌙'}
        </button>

        <span className="font-display text-3xl">زاد</span>

        <button
          type="button"
          aria-label="محادثة نصية"
          onClick={onOpenText}
          className={`flex h-11 w-11 items-center justify-center rounded-full text-lg transition-colors ${
            dark ? 'bg-white/10 hover:bg-white/20' : 'bg-primary/10 hover:bg-primary/20'
          }`}
        >
          💬
        </button>
      </header>

      {/* Center */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="relative flex items-center justify-center">
          {/* glow rings */}
          <span
            className={`absolute h-72 w-72 rounded-full blur-2xl transition-opacity duration-500 ${
              isActive ? 'opacity-80' : 'opacity-40'
            }`}
            style={{ background: 'radial-gradient(circle, rgba(192,32,240,0.55), transparent 70%)' }}
          />
          <div
            className={`relative flex h-56 w-56 items-center justify-center rounded-full ${
              dark ? 'bg-white/5' : 'bg-white'
            } shadow-[0_20px_60px_-15px_rgba(122,23,201,0.6)] ${status === 'speaking' ? 'animate-pulse' : ''}`}
          >
            <img
              src={dark ? whiteLogo : zadDarkLogo}
              alt="شعار زاد"
              className="h-36 w-36 object-contain"
            />
          </div>
        </div>

        <p className={`mt-10 text-lg font-medium ${dark ? 'text-white/85' : 'text-primary'}`}>
          {supported ? STATUS_TEXT[status] : 'المتصفح لا يدعم الإدخال الصوتي — جرّب المحادثة النصية.'}
        </p>

        {(transcript || reply) && (
          <div className="mt-6 w-full max-w-md space-y-3 text-right">
            {transcript && (
              <p
                className={`rounded-2xl px-4 py-3 text-sm ${
                  dark ? 'bg-white/10 text-white/90' : 'bg-white text-brand-deep shadow-sm'
                }`}
              >
                <span className="opacity-60">أنت: </span>
                {transcript}
              </p>
            )}
            {reply && (
              <p
                className={`max-h-40 overflow-y-auto whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  dark ? 'bg-brand-mid/30 text-white' : 'bg-secondary text-brand-deep'
                }`}
              >
                {reply}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Mic button */}
      <div className="flex flex-col items-center pb-14">
        <button
          type="button"
          onClick={handleMic}
          disabled={!supported}
          aria-label="اضغط للتحدّث"
          className="relative flex h-24 w-24 items-center justify-center rounded-full disabled:opacity-40"
        >
          {status === 'listening' && (
            <>
              <span className="absolute inset-0 animate-ping rounded-full bg-accent/40" />
              <span className="absolute -inset-3 animate-pulse rounded-full border border-accent/40" />
            </>
          )}
          <span className="brand-gradient relative flex h-full w-full items-center justify-center rounded-full text-3xl text-white shadow-[0_15px_40px_-8px_rgba(192,32,240,0.7)] transition-transform hover:scale-105">
            {status === 'listening' ? '⏹️' : '🎙️'}
          </span>
        </button>

        <button
          type="button"
          onClick={onExit}
          className={`mt-8 text-sm transition-colors ${
            dark ? 'text-white/60 hover:text-white' : 'text-primary/70 hover:text-primary'
          }`}
        >
          → العودة إلى الموقع
        </button>
      </div>
    </div>
  )
}
