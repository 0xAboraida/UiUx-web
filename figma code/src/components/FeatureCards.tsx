import { useState } from 'react'

type Feature = {
  id: string
  title: string
  icon: string
  short: string
  detail: string
}

const features: Feature[] = [
  {
    id: 'fiqh',
    title: 'الفقه',
    icon: '📖',
    short: 'أحكامٌ عمليّة مبنيّة على الأدلة.',
    detail: 'إجابات فقهية مدعّمة بالأدلة من الكتاب والسنّة، مع الإشارة إلى أقوال المذاهب المعتبرة عند الاختلاف.',
  },
  {
    id: 'aqeedah',
    title: 'العقيدة',
    icon: '🕌',
    short: 'ترسيخ أصول الإيمان الصحيح.',
    detail: 'شرحٌ ميسّر لمسائل التوحيد والأسماء والصفات وفق منهج أهل السنّة والجماعة.',
  },
  {
    id: 'tafsir',
    title: 'التفسير',
    icon: '✨',
    short: 'فهمٌ أعمق لكتاب الله.',
    detail: 'تفسيرٌ للآيات مع بيان أسباب النزول ومعاني المفردات مستندًا إلى كتب التفسير المعتمدة.',
  },
  {
    id: 'hadith',
    title: 'الحديث',
    icon: '📜',
    short: 'أحاديث موثّقة بدرجاتها.',
    detail: 'تخريج الأحاديث وبيان درجتها من الصحّة والضعف مع ذكر المصدر ورقم الحديث.',
  },
  {
    id: 'seerah',
    title: 'السيرة والتاريخ',
    icon: '🌙',
    short: 'أحداثٌ من سيرة خير الأنام.',
    detail: 'سردٌ لأحداث السيرة النبوية وتاريخ الأمّة مع الدروس والعبر المستفادة.',
  },
  {
    id: 'voice',
    title: 'المساعد الصوتي',
    icon: '🎙️',
    short: 'اسأل بصوتك، يجيبك زاد.',
    detail: 'اضغط للتحدّث واطرح سؤالك صوتيًا، ليحوّله زاد إلى إجابةٍ منطوقة ومكتوبة في لحظات.',
  },
]

export default function FeatureCards() {
  const [active, setActive] = useState<string | null>('fiqh')

  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-24 md:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wider text-accent">المميزات</span>
        <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
          علمٌ موثوق <span className="brand-text-gradient">بين يديك</span>
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          يغطّي زاد المجالات الشرعية الأساسية بإجاباتٍ دقيقة ومصادر معتمدة. اضغط على البطاقة لمعرفة المزيد.
        </p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => {
          const isActive = active === f.id
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setActive(isActive ? null : f.id)}
              aria-expanded={isActive}
              className={`group relative overflow-hidden rounded-3xl border p-6 text-right transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                isActive
                  ? 'border-transparent bg-card shadow-[0_24px_60px_-24px_rgba(122,23,201,0.55)] -translate-y-1'
                  : 'border-border bg-card/70 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl'
              }`}
            >
              <span
                className={`pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full blur-2xl transition-opacity duration-300 ${
                  isActive ? 'bg-accent/25 opacity-100' : 'bg-accent/20 opacity-0 group-hover:opacity-100'
                }`}
              />
              <div className="relative flex items-start justify-between gap-3">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl transition-colors ${
                    isActive ? 'brand-gradient text-white' : 'bg-secondary'
                  }`}
                >
                  {f.icon}
                </div>
                <span
                  className={`mt-1 text-2xl leading-none text-accent transition-transform duration-300 ${
                    isActive ? 'rotate-45' : ''
                  }`}
                  aria-hidden
                >
                  +
                </span>
              </div>

              <h3 className="relative mt-5 font-display text-2xl text-foreground">{f.title}</h3>
              <p className="relative mt-2 text-muted-foreground">{f.short}</p>

              <div
                className={`relative grid transition-all duration-300 ${
                  isActive ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <p className="overflow-hidden text-sm leading-relaxed text-foreground/70">{f.detail}</p>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
