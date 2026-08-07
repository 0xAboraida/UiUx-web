import { useEffect, useState } from 'react'
import StoreBadges from './StoreBadges'
import Starfield from './Starfield'
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
  { value: '+٥٠٠ ألف', label: 'سؤال مُجاب' },
  { value: '٦ مجالات', label: 'علوم شرعية' },
  { value: '٤٫٩', label: 'تقييم المتجر' },
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
  const [focused, setFocused] = useState(false)
  const [typed, setTyped] = useState('')

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
      {/* Islamic background image */}
      <img
        src={dark ? bgDark : bgLight}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
      />
      {/* light blend at the bottom only — lets the image stay vivid */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-40 ${
          dark ? 'bg-gradient-to-t from-[#12041f] to-transparent' : 'bg-gradient-to-t from-[#faf7ff] to-transparent'
        }`}
      />
      {/* soft scrim behind the text side only (right in RTL) for legibility */}
      <div
        className={`pointer-events-none absolute inset-0 ${
          dark
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
          <img
            src={darkLogo}
            alt="شعار تطبيق زاد"
            className="mx-auto mb-4 h-44 w-44 object-contain drop-shadow-lg md:h-52 md:w-52"
          />

          <h1
            className={`font-display text-5xl leading-[1.15] md:text-7xl ${
              dark ? 'text-white' : 'text-brand-deep'
            }`}
            style={{
              textShadow: dark
                ? '0 2px 24px rgba(18,4,31,0.7)'
                : '0 2px 20px rgba(255,255,255,0.85)',
            }}
          >
            <span className="brand-text-gradient">زادٌ</span> في طريق العلم والمعرفة
          </h1>

          <p
            className={`mx-auto mt-6 max-w-xl text-lg leading-relaxed ${
              dark ? 'text-white/90' : 'text-brand-deep/85'
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

          {/* Ask input — animated moving purple gradient border */}
          <form onSubmit={submit} className="mx-auto mt-8 flex w-full max-w-2xl items-center gap-3">
            {/* Voice-recording (mic) button — sits to the right of the bar */}
            <button
              type="button"
              onClick={onTryVoice}
              aria-label="تسجيل صوتي"
              title="تسجيل صوتي"
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full backdrop-blur-md transition-transform hover:-translate-y-0.5 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                dark
                  ? 'border border-white/25 bg-white/10 text-white'
                  : 'border border-primary/25 bg-white/80 text-primary'
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path
                  d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 11a7 7 0 0 1-14 0M12 18v3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="gradient-border min-w-0 flex-1 rounded-full p-[2.5px] shadow-xl shadow-primary/25">
              <div
                className={`flex items-center gap-2 rounded-full py-2 pr-5 pl-2 ${
                  dark ? 'bg-[#1a0730]/90 backdrop-blur-md' : 'bg-white/95 backdrop-blur-md'
                }`}
              >
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder={focused ? 'اكتب سؤالك الشرعي هنا…' : typed}
                  aria-label="اكتب سؤالك"
                  className={`min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-current/50 ${
                    dark ? 'text-white placeholder:text-white/50' : 'text-brand-deep placeholder:text-brand-deep/45'
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

          <div className="mt-6 flex flex-col items-center gap-5">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={onTryChat}
                className="brand-gradient inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-bold text-white shadow-xl shadow-primary/30 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                ✦ جرّب زاد الآن
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
