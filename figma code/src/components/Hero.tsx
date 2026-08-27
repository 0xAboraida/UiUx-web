import 'regenerator-runtime/runtime'
import { useEffect, useState } from 'react'
import StoreBadges from './StoreBadges'
import Starfield from './Starfield'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import TextareaAutosize from 'react-textarea-autosize'
import whiteLogo from '@/imports/WhiteLogo.png'
import darkLogo from '@/imports/ZadDarkLogo.png'
import bgDark from '@/imports/image.png'
import bgLight from '@/imports/bg-islamic-light.png'

const samplePrompts = [
  'ما حكم صلاة الجماعة للرجال؟',
  'كيف أحسب زكاة المال؟',
  'ما صحة حديث "إنما الأعمال بالنيّات"؟',
  'ما معنى قوله تعالى: "وقل ربِّ زدني علمًا"؟',
  'ما آداب طالب العلم مع شيخه؟',
  'ما الفرق بين الزكاة والصدقة؟',
]

const stats = [
  { value: '+250', label: 'كتاب ومصدر معتمد' },
  { value: 'وضع الدراسة', label: 'شرح، خرائط، واختبارات' },
  { value: 'محادثة صوتية', label: 'تفاعل مباشر مع الذكاء الاصطناعي' },
]

export default function Hero({
  onTryChat,
  onTryVoice,
  onAsk,
  theme,
}: {
  onTryChat: () => void
  onTryVoice: () => void
  onAsk: (question: string) => void
  theme: 'dark' | 'light'
}) {
  const dark = theme === 'dark'
  const [question, setQuestion] = useState('')
  const [baseQuestion, setBaseQuestion] = useState('')
  const [focused, setFocused] = useState(false)
  const [typed, setTyped] = useState('')

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition()

  useEffect(() => {
    if (listening) {
      const newQ = baseQuestion ? `${baseQuestion} ${transcript}` : transcript
      setQuestion(newQ.trim())
    }
  }, [transcript, listening, baseQuestion])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = question.trim()
    if (q) onAsk(q)
  }

  // Typewriter placeholder — cycles through sample questions when idle
  useEffect(() => {
    if (question || focused) return
    let promptIndex = 0
    let charIndex = 0
    let deleting = false
    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      const current = samplePrompts[promptIndex]
      if (!deleting) {
        charIndex++
        setTyped(current.slice(0, charIndex))
        if (charIndex === current.length) {
          deleting = true
          timer = setTimeout(tick, 1800)
          return
        }
        timer = setTimeout(tick, 55)
      } else {
        charIndex--
        setTyped(current.slice(0, charIndex))
        if (charIndex === 0) {
          deleting = false
          promptIndex = (promptIndex + 1) % samplePrompts.length
          timer = setTimeout(tick, 350)
          return
        }
        timer = setTimeout(tick, 30)
      }
    }

    timer = setTimeout(tick, 400)
    return () => clearTimeout(timer)
  }, [question, focused])

  return (
    <section id="home" className="relative overflow-hidden pb-24 pt-32 md:pb-32 md:pt-40">
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
      {/* light blend at the bottom only — lets the image stay vivid */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-40 ${dark ? 'bg-gradient-to-t from-[#12041f] to-transparent' : 'bg-gradient-to-t from-[#faf7ff] to-transparent'
          }`}
      />
      {/* soft scrim behind the text side only (right in RTL) for legibility */}
      <div
        className={`pointer-events-none absolute inset-0 ${dark
          ? 'bg-gradient-to-l from-[#12041f]/45 via-[#12041f]/10 to-transparent'
          : 'bg-gradient-to-l from-white/45 via-white/10 to-transparent'
          }`}
      />

      {dark && <Starfield />}

      {dark && (
        <>
          <div className="pointer-events-none absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-brand-blue/30 blur-[120px]" />
          <div className="pointer-events-none absolute -right-16 -top-10 h-72 w-72 rounded-full bg-brand-magenta/40 blur-[110px]" />
        </>
      )}

      <div className="relative mx-auto max-w-6xl px-5">
        {/* Copy — single centered column */}
        <div className="mx-auto max-w-3xl text-center">
          {/* 
            تم إخفاء الشعار من المنتصف لأنه موجود بالفعل في الشريط العلوي (Navbar) 
            ولأن كلمة "زاد" مكتوبة بشكل مميز في العنوان الرئيسي، مما يجعل الشعار هنا مكرراً ويأخذ مساحة عمودية كبيرة.
          <img
            src={darkLogo}
            alt="شعار تطبيق زاد"
            className="mx-auto mb-4 h-44 w-44 object-contain drop-shadow-lg md:h-52 md:w-52"
          />
          */}

          <h1
            className={`font-display text-5xl leading-[1.15] md:text-7xl ${dark ? 'text-white' : 'text-brand-deep'
              }`}
            style={{
              textShadow: dark
                ? '0 2px 24px rgba(18,4,31,0.7)'
                : '0 2px 20px rgba(255,255,255,0.85)',
            }}
          >
            <span className="brand-text-gradient">زادٌ</span> في طريق العلوم الشرعية
          </h1>

          <p
            className={`mx-auto mt-6 max-w-xl text-lg leading-relaxed ${dark ? 'text-white/90' : 'text-brand-deep/85'
              }`}
            style={{
              textShadow: dark
                ? '0 1px 12px rgba(18,4,31,0.6)'
                : '0 1px 10px rgba(255,255,255,0.9)',
            }}
          >
            تطبيقٌ ذكيّ يجيب عن أسئلتك في الفقه والعقيدة والتفسير والحديث
            بمصادر موثوقة — تحدّث صوتيًا أو اكتب سؤالك، وزادٌ يرشدك بإجابةٍ مُحكمة.
          </p>

          {/* Ask input — wrapped in a min-height container to absorb vertical expansion. 
              This ensures the section height never changes when typing, completely preventing the background/stars from zooming! */}
          <div className="mx-auto mt-2 flex min-h-[130px] w-full max-w-2xl items-end justify-center">
            <form onSubmit={submit} className="flex w-full items-end gap-3">

            <div className="gradient-border min-w-0 flex-1 rounded-[24px] p-[2.5px] shadow-xl shadow-primary/25 transition-all duration-300">
              <div
                className={`flex items-end gap-2 rounded-[22px] py-2 pr-5 pl-2 transition-all duration-300 ${dark ? 'bg-[#1a0730]/90 backdrop-blur-md' : 'bg-white/95 backdrop-blur-md'
                  }`}
              >
                <button
                  type="button"
                  aria-label={listening ? 'إيقاف التسجيل' : 'إدخال صوتي'}
                  onClick={() => {
                    if (!browserSupportsSpeechRecognition) {
                      alert('متصفحك لا يدعم خاصية التسجيل الصوتي.')
                      return
                    }
                    if (listening) {
                      SpeechRecognition.stopListening()
                    } else {
                      setBaseQuestion(question)
                      resetTranscript()
                      SpeechRecognition.startListening({ language: 'ar-SA', continuous: true })
                    }
                  }}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${listening
                      ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse'
                      : dark
                        ? 'text-white/60 hover:text-white hover:bg-white/10'
                        : 'text-brand-deep/50 hover:text-brand-magenta hover:bg-brand-magenta/5'
                    }`}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
                    <path
                      d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19 11a7 7 0 0 1-14 0M12 18v3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <TextareaAutosize
                  minRows={1}
                  maxRows={4}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      submit(e as any)
                    }
                  }}
                  placeholder={focused ? 'اكتب سؤالك الشرعي هنا…' : typed}
                  aria-label="اكتب سؤالك"
                  className={`min-w-0 flex-1 resize-none bg-transparent py-2.5 text-base outline-none placeholder:text-current/50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${dark ? 'text-white placeholder:text-white/50' : 'text-brand-deep placeholder:text-brand-deep/45'
                    }`}
                />
                <button
                  type="submit"
                  aria-label="اسأل زاد"
                  className="brand-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 -scale-x-100">
                    <path
                      d="M6 12h13M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* ChatGPT-style voice-chat button — sits to the left of the bar */}
            <button
              type="button"
              onClick={onTryVoice}
              aria-label="المحادثة الصوتية"
              title="المحادثة الصوتية"
              className="gradient-border flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-xl shadow-primary/30 transition-transform hover:-translate-y-0.5 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
                <path d="M5 10v4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M9.5 7v10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M14.5 4.5v15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M19 8v8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>
          </form>
          </div>

          <div className="mt-6 flex flex-col items-center gap-5">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={onTryChat}
                className="brand-gradient inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-bold text-white shadow-xl shadow-primary/30 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                ✦ جرّب تطبيق زاد الآن
              </button>
            </div>
            <StoreBadges variant={dark ? 'light' : 'dark'} />
          </div>

          <dl className="mt-10 flex flex-wrap justify-center gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <dt className={`font-display text-3xl ${dark ? 'text-white' : 'text-brand-deep'}`}>
                  {s.value}
                </dt>
                <dd className={`mt-1 text-sm ${dark ? 'text-white/70' : 'text-brand-deep/60'}`}>
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
