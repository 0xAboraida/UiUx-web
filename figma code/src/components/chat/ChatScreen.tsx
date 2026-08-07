import { useEffect, useMemo, useRef, useState } from 'react'
import whiteLogo from '@/imports/WhiteLogo.png'
import bgDark from '@/imports/image.png'
import {
  DOMAINS,
  GROUP_ORDER,
  demoReply,
  seedConversations,
  uid,
  type Conversation,
  type DomainId,
  type Message,
} from './data'

const STARTERS = [
  'ما حكم الجمع بين الصلاتين في السفر؟',
  'اشرح لي معنى سورة الإخلاص',
  'ما درجة حديث «إنما الأعمال بالنيات»؟',
  'الفرق بين الفرض والواجب عند الفقهاء',
]

export default function ChatScreen({
  onExit,
  onOpenVoice,
  initialQuestion,
  onConsumeInitial,
}: {
  onExit: () => void
  onOpenVoice: () => void
  initialQuestion?: string
  onConsumeInitial?: () => void
}) {
  const [conversations, setConversations] = useState<Conversation[]>(seedConversations)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [domain, setDomain] = useState<DomainId>('auto')
  const [query, setQuery] = useState('')
  const [typing, setTyping] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const active = conversations.find((c) => c.id === activeId) ?? null

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [active?.messages.length, typing])

  const grouped = useMemo(() => {
    const filtered = conversations.filter((c) => c.title.includes(query.trim()))
    return GROUP_ORDER.map((g) => ({
      group: g,
      items: filtered.filter((c) => c.group === g),
    })).filter((g) => g.items.length > 0)
  }, [conversations, query])

  const startNewConversation = () => {
    setActiveId(null)
    setInput('')
    setSidebarOpen(false)
  }

  const send = (raw?: string) => {
    const text = (raw ?? input).trim()
    if (!text || typing) return

    const userMsg: Message = { id: uid('u'), role: 'user', text }
    let convId = activeId

    setConversations((prev) => {
      if (convId) {
        return prev.map((c) =>
          c.id === convId ? { ...c, messages: [...c.messages, userMsg] } : c,
        )
      }
      convId = uid('c')
      const title = text.length > 34 ? `${text.slice(0, 34)}…` : text
      const fresh: Conversation = { id: convId, title, group: 'الآن', messages: [userMsg] }
      return [fresh, ...prev]
    })
    setActiveId(convId)
    setInput('')
    setTyping(true)

    window.setTimeout(() => {
      const reply: Message = { id: uid('a'), role: 'assistant', text: demoReply(text, domain) }
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, reply] } : c)),
      )
      setTyping(false)
    }, 900)
  }

  // Auto-send a question passed in from the knowledge base (once).
  useEffect(() => {
    if (initialQuestion) {
      send(initialQuestion)
      onConsumeInitial?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion])

  return (
    <div dir="rtl" className="relative flex h-screen w-full overflow-hidden text-foreground">
      {/* Islamic night background — same as the home page */}
      <img
        src={bgDark}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-[#12041f]/70" />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-40 flex w-80 max-w-[85vw] flex-col border-l border-border bg-card/95 backdrop-blur-xl transition-transform duration-300 md:static md:z-10 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl">
              <img src={whiteLogo} alt="زاد" className="h-6 w-6 object-contain" />
            </span>
            <span className="font-display text-2xl text-primary">زاد</span>
          </div>
          <button
            type="button"
            aria-label="إغلاق القائمة"
            onClick={() => setSidebarOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary md:hidden"
          >
            ✕
          </button>
        </div>

        <div className="px-4">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted px-3 py-2.5">
            <span className="text-muted-foreground" aria-hidden>🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="البحث عن المحادثات"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="button"
            onClick={startNewConversation}
            className="brand-gradient-blue mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-semibold text-white shadow-lg shadow-brand-blue/25 transition-transform hover:-translate-y-0.5"
          >
            <span className="text-lg leading-none">＋</span> محادثة جديدة
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto px-4 pb-4">
          <h2 className="px-1 pb-2 font-display text-lg text-primary">المحادثات</h2>
          {grouped.length === 0 && (
            <p className="px-1 py-6 text-center text-sm text-muted-foreground">لا توجد نتائج</p>
          )}
          {grouped.map(({ group, items }) => (
            <div key={group} className="mb-4">
              <p className="px-1 pb-1.5 text-xs text-muted-foreground">{group}</p>
              <ul className="space-y-1">
                {items.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveId(c.id)
                        setSidebarOpen(false)
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right text-sm transition-colors ${
                        c.id === activeId
                          ? 'bg-secondary text-secondary-foreground'
                          : 'text-foreground/80 hover:bg-muted'
                      }`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary" aria-hidden>
                        💬
                      </span>
                      <span className="truncate">{c.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onExit}
          className="m-4 rounded-xl border border-border py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
        >
          → العودة إلى الموقع
        </button>
      </aside>

      {/* backdrop for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main chat */}
      <main className="relative z-10 flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-sm md:px-6">
          <button
            type="button"
            aria-label="فتح المحادثات"
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary md:hidden"
          >
            ☰
          </button>
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-2">
              {DOMAINS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDomain(d.id)}
                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                    domain === d.id
                      ? 'brand-gradient text-white'
                      : 'border border-border bg-card text-foreground/70 hover:border-accent/40'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            {!active || active.messages.length === 0 ? (
              <EmptyState onPick={send} />
            ) : (
              active.messages.map((m) => <Bubble key={m.id} message={m} />)
            )}
            {typing && <TypingBubble />}
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-border bg-card/80 px-4 py-4 backdrop-blur-sm md:px-8">
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            <button
              type="button"
              aria-label="المحادثة الصوتية"
              onClick={onOpenVoice}
              className="brand-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5"
            >
              🎙️
            </button>
            <div className="flex flex-1 items-end rounded-2xl border border-border bg-muted px-4 py-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                rows={1}
                placeholder="اكتب سؤالك هنا…"
                className="max-h-40 w-full resize-none bg-transparent py-1.5 text-[15px] outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="button"
              onClick={() => send()}
              disabled={!input.trim() || typing}
              aria-label="إرسال"
              className="brand-gradient-blue flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg shadow-brand-blue/25 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ➤
            </button>
          </div>
          <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-muted-foreground">
            قد يخطئ زاد أحيانًا — تأكّد من المسائل المهمة من أهل العلم.
          </p>
        </div>
      </main>
    </div>
  )
}

function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <span className="brand-gradient flex h-20 w-20 items-center justify-center rounded-3xl shadow-xl shadow-primary/30">
        <img src={whiteLogo} alt="زاد" className="h-12 w-12 object-contain" />
      </span>
      <h2 className="mt-6 font-display text-3xl text-white">مرحبًا بك في زاد</h2>
      <p className="mt-2 max-w-md text-white/75">
        اسألني في الفقه أو العقيدة أو التفسير أو الحديث… اكتب سؤالك أو اختر من الأمثلة.
      </p>
      <div className="mt-8 grid w-full max-w-xl gap-3 sm:grid-cols-2">
        {STARTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-2xl border border-white/15 bg-white/10 p-4 text-right text-sm text-white/90 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/15"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

function Bubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] items-start gap-2.5 ${isUser ? '' : 'flex-row-reverse'}`}>
        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm ${
            isUser ? 'bg-secondary text-primary' : 'brand-gradient text-white'
          }`}
          aria-hidden
        >
          {isUser ? '🧑' : '✦'}
        </span>
        <div
          className={`whitespace-pre-line rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
            isUser
              ? 'brand-gradient text-white'
              : 'border border-border bg-card text-card-foreground'
          }`}
        >
          {message.text}
        </div>
      </div>
    </div>
  )
}

function TypingBubble() {
  return (
    <div className="flex justify-end">
      <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-card px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-bounce rounded-full bg-primary/60"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
