import { useState, useRef, useEffect, useMemo, useDeferredValue, memo, useCallback } from 'react'
import bgDark from '@/imports/image.png'
import whiteLogo from '@/imports/WhiteLogo.png'
import ZadDarkLogo from '@/imports/ZadDarkLogo.png'
import {
  ArrowRight, Menu, FileText, Folder, ChevronDown, ChevronLeft,
  Search, Brain, ClipboardList, BookOpen, User, Sparkles,
  CheckCircle, XCircle, Hourglass, MessageCircle, X,
  Book, Library, CalendarDays, Hash, Link, Layers, CornerDownLeft
} from 'lucide-react'

const API_BASE = 'http://127.0.0.1:8002'

interface Message {
  id: string
  role: 'user' | 'tutor'
  text: string
}

interface ApiHistoryMsg {
  role: string
  content: string
}

interface Question {
  question: string
  options: string[]
  correct_answer_index: number
  explanation: string
}

interface MindmapNode {
  id?: string
  type?: 'label' | 'content'
  label?: string
  content?: string
  children?: MindmapNode[]
}

interface ChunkMetadata {
  book_title?: string
  author?: string
  author_death?: string
  domain?: string
  madhhab?: string
  hijri_century?: string
  total_parts?: number | string
  part?: number | string
  page_id?: number | string
  source_url?: string
  hierarchy?: Record<string, string | string[]>
}

interface TreeNode {
  title: string
  chunk_id?: string
  is_new?: boolean
  children?: TreeNode[]
}

// Simple Markdown Parser Helper
function formatMarkdown(text: string, isTurathText: boolean = false) {
  if (!text) return { __html: '' }

  let html = text
    // Escape HTML to prevent basic XSS
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // =============================================
  // TURATH TEXT PATH — uses inline styles only
  // (no Tailwind bracket classes like text-[#xxx])
  // to prevent bracket regex from corrupting HTML
  // =============================================
  if (isTurathText) {
    // 0. Strip metadata: remove السياق line and النص label
    html = html.replace(/^السياق:\s*\[.*?\]\s*/gim, '')
    html = html.replace(/^النص:\s*/gim, '')

    const bullet = '<span style="color:#38bdf8; margin-left: 12px; font-size: 1.4em; line-height: 1;">•</span>'

    // 1. Title/Section at the very beginning
    let titleHtml = '';
    html = html.replace(
      /^\s*\[([^\]]+)\]\s*/g,
      (match, p1) => {
        titleHtml = `<span style="display:block; color:#38bdf8; margin-bottom:0.5em; font-size:1.1em; font-weight:bold;">&#91;${p1}&#93;</span>`;
        return ''; // Remove from the main text body
      }
    )

    // 2. Normalize paragraph breaks (convert periods followed by spaces into newlines)
    html = html.replace(/\.\s+/g, '.\n')

    // 3. Wrap each paragraph with a bullet point using Flexbox for perfect alignment
    const paragraphs = html.split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(p => `
        <div style="margin-bottom: 0.8em; display: flex; align-items: flex-start;">
          <div style="flex-shrink: 0; padding-top: 0.2em;">${bullet}</div>
          <div style="flex-grow: 1;">${p}</div>
        </div>
      `)

    html = titleHtml + paragraphs.join('')

    // 4. Page/volume references: (1 / 232)
    html = html.replace(
      /\((\d+\s*\/\s*\d+)\)/g,
      '<span style="display:inline-flex;align-items:center;background:rgba(56,189,248,0.1);color:#38bdf8;border:1px solid rgba(56,189,248,0.25);padding:1px 10px;border-radius:9999px;font-size:0.72em;font-weight:600;margin:0 4px;direction:ltr">$1</span>'
    )

    // 5. Bracketed commentary/annotations [...]
    html = html.replace(
      /\[([^\]]+)\]/g,
      '<span style="color:rgba(255,255,255,0.45);font-size:0.88em;margin:0 3px">[$1]</span>'
    )

    // 6. Hadiths and Quotes « »
    // This breaks out of the current paragraph's flex container, inserts a beautiful frame, and re-opens the flex container.
    html = html.replace(
      /«(.*?)»\s*([.،,؛]?)/g,
      `</div></div>
       <div style="margin: 1.5em 0.5em; padding: 1.2em 1.5em; border-right: 3px solid #10b981; background: linear-gradient(to left, rgba(16,185,129,0.1), rgba(16,185,129,0.02)); border-radius: 12px 4px 4px 12px; color: #34d399; line-height: 2.2; font-weight: bold; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden;">
         «$1»$2
       </div>
       <div style="margin-bottom: 0.8em; display: flex; align-items: flex-start;">
         <div style="flex-shrink: 0; padding-top: 0.2em; width: 1.4em;"></div>
         <div style="flex-grow: 1;">`
    )

    return { __html: html }
  }

  // =============================================
  // MARKDOWN PATH — for AI/tutor generated content
  // =============================================
  html = html
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2 text-[#38bdf8]">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-5 mb-3 text-[#38bdf8]">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4 text-[#38bdf8]">$1</h1>')

    // Bold and Italic
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#10b981]">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-white/80">$1</em>')

    // Lists (using div/span to avoid <li> numbering issues without <ul>/<ol>)
    .replace(/^[-*] (.*$)/gim, '<div class="flex gap-2 mr-2 mb-1"><span class="font-bold text-[#10b981]">•</span> <span>$1</span></div>')
    .replace(/^(\d+\.) (.*$)/gim, '<div class="flex gap-2 mr-2 mb-1"><span class="font-bold text-[#38bdf8] w-5 shrink-0">$1</span> <span>$2</span></div>')

    // Special formatting for "Context" string
    .replace(/^السياق:\s*\[(.*?)\]/gim, (_match, p1) => {
      const badges = p1.split('|').map((b: string) => `<span class="bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30 px-3 py-1.5 rounded-full text-xs font-semibold ml-2 mb-2 inline-flex items-center shadow-sm backdrop-blur-md transition-all hover:bg-[#38bdf8]/20">${b.trim()}</span>`).join('');
      return `<div class="mb-8 flex flex-wrap relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-5 shadow-lg">${badges}</div>`;
    })

    // Special formatting for "Text" string
    .replace(/^النص:\s*/gim, '<div class="flex items-center gap-3 mb-6 mt-2"><div class="h-px flex-1 bg-gradient-to-l from-transparent via-white/20 to-transparent"></div><div class="text-[#fcd34d] text-sm font-bold flex items-center gap-2"><span class="text-[#fcd34d]"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></span> المتن الأصلي</div><div class="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div></div>')

  html = html
    // Line breaks (only apply <br/> if the line doesn't start with a block tag or isn't already handled by flex div)
    .replace(/\n/g, '<br />')
    // Remove extra breaks after our divs
    .replace(/<\/div><br \/>/g, '</div>')

  return { __html: html }
}

const EMPTY_PATH: string[] = []

const TreeView = memo(function TreeView({
  node,
  depth = 0,
  activeChunkId,
  onChunkSelect,
  parentPath = EMPTY_PATH,
  defaultExpanded = false
}: {
  node: TreeNode;
  depth?: number;
  activeChunkId?: string | null;
  onChunkSelect?: (chunkId: string, title: string, fullPath: string) => void;
  parentPath?: string[];
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  useEffect(() => {
    setExpanded(defaultExpanded)
  }, [defaultExpanded])
  const hasChildren = node.children && node.children.length > 0
  const isLeaf = !hasChildren
  const isActive = node.chunk_id && node.chunk_id === activeChunkId
  const currentPath = [...parentPath, node.title]

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!expanded)
    } else if (node.chunk_id && onChunkSelect) {
      onChunkSelect(node.chunk_id, node.title, parentPath.join(' • '))
    }
  }

  return (
    <div className="select-none">
      <div
        className={`group flex cursor-pointer items-center gap-2 py-2 px-2 rounded-xl transition-all hover:bg-white/5 hover:-translate-x-1 ${isActive ? 'font-bold text-[#10b981] bg-white/5' : 'text-white/70'
          }`}
        style={{ paddingRight: `${depth * 1.5}rem` }}
        onClick={handleClick}
      >
        {hasChildren ? (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center opacity-70">
            {expanded ? <ChevronDown size={14} /> : <ChevronLeft size={14} />}
          </span>
        ) : (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center opacity-50">
            <FileText size={14} />
          </span>
        )}
        <span className={hasChildren ? 'font-semibold flex items-center gap-1.5' : 'text-[14px] flex items-center gap-1.5'}>
          {hasChildren && <Folder size={14} className="shrink-0 text-[#38bdf8]" />}{node.title}
          {node.is_new && <span className="shrink-0 mr-2 rounded bg-green-500/20 px-1.5 py-0.5 text-[10px] text-green-400">جديد</span>}
        </span>
      </div>
      {expanded && hasChildren && (
        <div className="flex flex-col">
          {node.children!.map((child, idx) => (
            <TreeView
              key={idx}
              node={child}
              depth={depth + 1}
              activeChunkId={activeChunkId}
              onChunkSelect={onChunkSelect}
              parentPath={currentPath}
              defaultExpanded={defaultExpanded}
            />
          ))}
        </div>
      )}
    </div>
  )
})

export default function StudyMode({ onExit }: { onExit: () => void }) {
  const [activeTab, setActiveTab] = useState<'chat' | 'mindmap' | 'quiz'>('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [chatHistory, setChatHistory] = useState<ApiHistoryMsg[]>([])
  const [input, setInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const [loading, setLoading] = useState(false)

  const [treeData, setTreeData] = useState<TreeNode[]>([])
  const [treeLoading, setTreeLoading] = useState(true)
  const [currentChunkId, setCurrentChunkId] = useState<string | null>(null)
  const [chunkTitle, setChunkTitle] = useState('اختر درساً من الفهرس...')
  const [headerSubtitle, setHeaderSubtitle] = useState('يرجى اختيار درس للبدء')
  const [chunkText, setChunkText] = useState('يرجى اختيار درس من الفهرس الجانبي لعرض النص الأساسي والبدء في التفاعل مع المعلم زاد.')
  const [chunkMeta, setChunkMeta] = useState<ChunkMetadata | null>(null)

  // Resizable Panels State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isDocumentOpen, setIsDocumentOpen] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [documentWidth, setDocumentWidth] = useState(450)

  const [quizQuestions, setQuizQuestions] = useState<Question[] | null>(null)
  const [mindmapData, setMindmapData] = useState<MindmapNode[] | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const chatEndRef = useRef<HTMLDivElement>(null)

  const filteredTreeData = useMemo(() => {
    if (!deferredSearchQuery.trim()) return treeData;

    const filterNodes = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        const isMatch = node.title.toLowerCase().includes(deferredSearchQuery.toLowerCase());
        if (isMatch) return node;

        if (node.children && node.children.length > 0) {
          const filteredChildren = filterNodes(node.children);
          if (filteredChildren.length > 0) {
            return { ...node, children: filteredChildren };
          }
        }
        return null;
      }).filter(Boolean) as TreeNode[];
    };

    return filterNodes(treeData);
  }, [treeData, deferredSearchQuery]);

  const startResizingSidebar = (e: React.MouseEvent) => {
    e.preventDefault()
    const handleMouseMove = (e: MouseEvent) => {
      setSidebarWidth(Math.max(200, Math.min(window.innerWidth - e.clientX, 600)))
    }
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const startResizingDocument = (e: React.MouseEvent) => {
    e.preventDefault()
    const handleMouseMove = (e: MouseEvent) => {
      const currentSidebarWidth = isSidebarOpen ? sidebarWidth : 0;
      setDocumentWidth(Math.max(300, Math.min(window.innerWidth - currentSidebarWidth - e.clientX, 800)))
    }
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Fetch curriculum tree on mount
    fetch(`${API_BASE}/api/v1/library/trees`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.tree) {
          setTreeData(data.tree)
        }
      })
      .catch(console.error)
      .finally(() => setTreeLoading(false))
  }, [])

  const handleChunkSelect = useCallback(async (chunkId: string, title: string, fullPath: string) => {
    setCurrentChunkId(chunkId)
    setChunkTitle(title)
    setHeaderSubtitle(fullPath)
    setChunkText('جاري تحميل النص الأساسي...')
    setChunkMeta(null)

    // Reset interactive states
    setMessages([])
    setChatHistory([])
    setMindmapData(null)
    setQuizQuestions(null)
    setSelectedAnswers({})
    setActiveTab('chat')

    try {
      const res = await fetch(`${API_BASE}/api/v1/library/chunks/${chunkId}`)
      if (res.ok) {
        const data = await res.json()
        setChunkText(data.text || data.content || 'تم تحميل الدرس بنجاح، لكن لا يوجد نص متوفر.')
        if (data.metadata) setChunkMeta(data.metadata)

        // Auto-send kickstart message from student
        const initMsg = "مرحباً يا زاد، أنا مستعد لبدء دراسة هذا الدرس، هل يمكنك وضع خطة والبدء بالشرح؟"
        setMessages([{ id: 'init', role: 'user', text: initMsg }])
        setLoading(true)

        const chatRes = await fetch(`${API_BASE}/api/v1/tutor/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-API-Key': 'zad-super-secret-key' },
          body: JSON.stringify({ chunk_id: chunkId, message: initMsg, history: [] })
        })
        const chatData = await chatRes.json()

        if (chatData.success) {
          setMessages(prev => [...prev, { id: 'init-reply', role: 'tutor', text: chatData.reply }])
          setChatHistory([
            { role: 'user', content: initMsg },
            { role: 'assistant', content: chatData.reply }
          ])
        }
      } else {
        setChunkText('فشل تحميل نص الدرس.')
      }
    } catch (e) {
      setChunkText('فشل الاتصال بالسيرفر أثناء جلب الدرس.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    if (!currentChunkId) {
      alert('الرجاء اختيار درس من الفهرس أولاً لبدء المحادثة.')
      return
    }
    const userText = input
    setInput('')
    setLoading(true)

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }])

    try {
      const res = await fetch(`${API_BASE}/api/v1/tutor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': 'zad-super-secret-key' },
        body: JSON.stringify({
          chunk_id: currentChunkId,
          message: userText,
          history: chatHistory
        })
      })
      const data = await res.json()
      if (data.success) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'tutor', text: data.reply }])
        setChatHistory(prev => [
          ...prev,
          { role: 'user', content: userText },
          { role: 'assistant', content: data.reply }
        ])
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'tutor', text: 'خطأ: ' + data.detail }])
      }
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'tutor', text: 'فشل الاتصال بالسيرفر.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateQuiz = async () => {
    if (!currentChunkId) return alert('الرجاء اختيار درس من الفهرس أولاً')
    setLoading(true)
    setActiveTab('quiz')
    setQuizQuestions(null)
    setSelectedAnswers({})

    try {
      const res = await fetch(`${API_BASE}/api/v1/tutor/quiz/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': 'zad-super-secret-key' },
        body: JSON.stringify({ chunk_id: currentChunkId, num_questions: 3 })
      })
      const data = await res.json()
      if (data.success) {
        setQuizQuestions(data.quiz.questions)
      } else {
        alert('خطأ في توليد الأسئلة: ' + data.detail)
      }
    } catch (e) {
      alert('فشل الاتصال بالسيرفر')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateMindmap = async () => {
    if (!currentChunkId) return alert('الرجاء اختيار درس من الفهرس أولاً')
    setLoading(true)
    setActiveTab('mindmap')
    setMindmapData(null)

    try {
      const res = await fetch(`${API_BASE}/api/v1/tutor/mindmap/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': 'zad-super-secret-key' },
        body: JSON.stringify({ text: chunkText })
      })
      const data = await res.json()
      if (data.success) {
        setMindmapData(Array.isArray(data.tree) ? data.tree : [data.tree])
      } else {
        alert('خطأ في توليد الخريطة: ' + data.detail)
      }
    } catch (e) {
      alert('فشل الاتصال بالسيرفر')
    } finally {
      setLoading(false)
    }
  }

  const handleDiscussQuestion = async (q: Question, wrongOpt: string) => {
    const hiddenMsg = `أنا كطالب أواجه صعوبة في فهم هذا السؤال: "${q.question}". لقد اخترت الإجابة "${wrongOpt}" ولكن التطبيق أخبرني أن الإجابة الصحيحة هي "${q.options[q.correct_answer_index]}" والسبب هو "${q.explanation}". هل يمكنك أن تبسط لي الأمر وتتناقش معي فيه؟`

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: hiddenMsg }])
    setActiveTab('chat')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/v1/tutor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': 'zad-super-secret-key' },
        body: JSON.stringify({
          chunk_id: currentChunkId,
          message: hiddenMsg,
          history: chatHistory
        })
      })
      const data = await res.json()
      if (data.success) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'tutor', text: data.reply }])
        setChatHistory(prev => [
          ...prev,
          { role: 'user', content: hiddenMsg },
          { role: 'assistant', content: data.reply }
        ])
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'tutor', text: 'خطأ: ' + data.detail }])
      }
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'tutor', text: 'فشل الاتصال بالسيرفر.' }])
    } finally {
      setLoading(false)
    }
  }

  const renderMindmapNode = (nodes: MindmapNode[], depth = 0) => {
    return (
      <div className="flex flex-col gap-2">
        {nodes.map((n, i) => {
          const hasChildren = n.children && n.children.length > 0;

          if (hasChildren) {
            return (
              <details key={i} className="mindmap-details">
                <summary className="list-none cursor-pointer select-none [&::-webkit-details-marker]:hidden mb-2 w-fit">
                  {n.type === 'label' ? (
                    <div className="text-[#38bdf8] font-bold text-[15px] bg-white/5 p-3 rounded-lg border border-white/20 inline-flex items-center gap-2 shadow-sm transition-all hover:bg-white/10 hover:-translate-y-0.5">
                      <ChevronLeft size={16} className="mindmap-arrow text-white/40 transition-transform duration-300" />
                      {n.label}
                    </div>
                  ) : (
                    <div className="text-white/90 text-sm bg-black/20 p-3 rounded-lg border border-white/10 inline-flex items-center gap-2 shadow-sm transition-all hover:bg-black/40 hover:-translate-y-0.5">
                      <ChevronLeft size={16} className="mindmap-arrow text-white/40 transition-transform duration-300" />
                      {n.content}
                    </div>
                  )}
                </summary>
                <div className="mindmap-content mr-6 border-r-2 border-white/10 pr-4 pt-1 mb-3">
                  {renderMindmapNode(n.children!, depth + 1)}
                </div>
              </details>
            );
          }

          // Leaf node (no children)
          return (
            <div key={i} className="mb-2 transition-transform hover:-translate-x-1">
              {n.type === 'label' ? (
                <div className="text-[#38bdf8] font-bold text-[15px] bg-white/5 p-3 rounded-lg border border-white/10 w-fit shadow-sm transition-colors hover:bg-white/10">
                  {n.label}
                </div>
              ) : (
                <div className="text-white/90 text-[15px] bg-black/20 p-4 rounded-xl border border-white/5 w-fit shadow-sm max-w-2xl leading-relaxed hover:border-white/10 transition-colors">
                  {n.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    )
  }

  return (
    <div dir="rtl" className="relative flex h-screen w-full flex-col overflow-hidden text-foreground">
      <style>{`
        /* Fix for nested details arrows */
        details.mindmap-details[open] > summary .mindmap-arrow {
          transform: rotate(-90deg);
        }
        
        /* Smooth fade-in animation for mindmap children */
        details.mindmap-details[open] > .mindmap-content {
          animation: slideFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideFadeIn {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
      {/* Background Image */}
      <img
        src={bgDark}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-[#12041f]/20" />

      <header className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#1a0730]/60 px-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={onExit}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
          >
            <ArrowRight size={18} />
          </button>
          <div className="flex items-center gap-3 min-w-[150px]">
            <img src={whiteLogo} alt="Zad" className="h-8 w-8 object-contain drop-shadow-md" />
            <div>
              <h1 className="font-display text-lg font-bold text-white leading-tight">وضع الدراسة</h1>
              <p className="mt-0.5 text-xs text-white/60">{headerSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mr-4 border-r border-white/10 pr-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="hidden md:flex h-9 items-center justify-center gap-2 rounded-xl bg-[#38bdf8]/10 px-3 text-[#38bdf8] transition-colors hover:bg-[#38bdf8]/20"
              >
                <Menu size={16} />
                <span className="text-sm font-bold">الفهرس</span>
              </button>
            )}
            {!isDocumentOpen && (
              <button
                onClick={() => setIsDocumentOpen(true)}
                className="hidden lg:flex h-9 items-center justify-center gap-2 rounded-xl bg-[#10b981]/10 px-3 text-[#10b981] transition-colors hover:bg-[#10b981]/20"
              >
                <BookOpen size={16} />
                <span className="text-sm font-bold">النص الأصلي</span>
              </button>
            )}
          </div>
        </div>

        <div></div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-1 overflow-hidden">

        {/* 1. Curriculum Sidebar */}
        <div
          style={{
            width: isSidebarOpen ? sidebarWidth : 0,
            opacity: isSidebarOpen ? 1 : 0
          }}
          className={`hidden flex-col bg-[#12041f]/70 backdrop-blur-xl md:flex shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${isSidebarOpen ? 'border-l border-white/10' : 'border-transparent'}`}
        >
          <div style={{ width: sidebarWidth }} className="flex h-full flex-col">
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-white">فهرس المنهج</h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#1a0730]/60 px-4 py-3 backdrop-blur-md">
                <Search size={18} className="text-white/40" />
                <input
                  type="text"
                  placeholder="ابحث عن درس..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {treeLoading ? (
                <div className="flex h-full items-center justify-center gap-2 text-white/50">
                  <Hourglass size={16} className="animate-pulse" />
                  جاري تحميل الفهرس...
                </div>
              ) : filteredTreeData.length > 0 ? (
                filteredTreeData.map((node, idx) => (
                  <TreeView
                    key={idx}
                    node={node}
                    activeChunkId={currentChunkId}
                    onChunkSelect={handleChunkSelect}
                    defaultExpanded={deferredSearchQuery.trim().length > 0}
                  />
                ))
              ) : (
                <div className="text-center text-white/50">لا يوجد بيانات للفهرس. الرجاء بناء الشجرة من لوحة التحكم.</div>
              )}
            </div>
          </div>
        </div>

        {/* Resizer 1 (Between Sidebar and Document) */}
        {isSidebarOpen && (
          <div
            onMouseDown={startResizingSidebar}
            className="hidden md:block w-1 cursor-col-resize bg-white/10 hover:bg-[#38bdf8] active:bg-[#38bdf8] transition-colors z-20 shrink-0"
          />
        )}

        {/* 2. Document View */}
        <div
          style={{
            width: isDocumentOpen ? documentWidth : 0,
            opacity: isDocumentOpen ? 1 : 0
          }}
          className={`hidden flex-col bg-[#12041f]/40 backdrop-blur-xl lg:flex shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${isDocumentOpen ? 'border-l border-white/10' : 'border-transparent'}`}
        >
          <div style={{ width: documentWidth }} className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex items-center justify-end mb-2">
                <button
                  onClick={() => setIsDocumentOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/15 text-white/50 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              {!currentChunkId ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-12 text-center backdrop-blur-md shadow-xl mt-10">
                  <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-white/5 shadow-[0_0_50px_rgba(56,189,248,0.15)] relative border border-white/10">
                    <BookOpen size={56} className="text-[#38bdf8] opacity-80 drop-shadow-md" />
                    <div className="absolute inset-0 bg-[#38bdf8]/10 blur-xl rounded-full"></div>
                  </div>
                  <h3 className="mb-3 font-display text-2xl font-bold text-white">ابدأ رحلة التعلم</h3>
                  <p className="max-w-md text-[15px] leading-relaxed text-white/60">
                    يرجى اختيار درس من الفهرس الجانبي لعرض النص الأساسي، وتوليد الخرائط الذهنية، والبدء في التفاعل مع المعلم زاد.
                  </p>
                </div>
              ) : (
                <>
                  {chunkMeta && (
                    <div className="mb-8 flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 text-center backdrop-blur-md shadow-xl">
                      <div className="flex flex-col items-center justify-center mb-6 mt-2 relative">
                        {/* Title with ethereal purple shadow and moving gradient */}
                        <h3 className="font-display text-[38px] font-bold gradient-border bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(138,23,201,0.4)] pb-1 leading-tight text-center relative z-10 px-4">
                          {chunkMeta.book_title || 'اسم الكتاب غير متوفر'}
                        </h3>
                      </div>

                      {/* Premium Typographic Hierarchy */}
                      {chunkMeta.hierarchy && (chunkMeta.hierarchy.kitab || (chunkMeta.hierarchy.sections && chunkMeta.hierarchy.sections.length > 0)) && (
                        <div className="mb-8 flex flex-col items-center justify-center text-center gap-2">
                          {/* Parent Paths */}
                          {(() => {
                            const levels = [
                              ...(chunkMeta.hierarchy.kitab ? [chunkMeta.hierarchy.kitab] : []),
                              ...(chunkMeta.hierarchy.sections || [])
                            ]
                            const parents = levels.slice(0, -1)
                            const current = levels[levels.length - 1]

                            return (
                              <>
                                {parents.length > 0 && (
                                  <div className="flex flex-wrap items-center justify-center gap-1.5 text-[13.5px] text-white/60 font-medium">
                                    {parents.map((level, idx) => (
                                      <div key={idx} className="flex items-center gap-1.5">
                                        <span className="rounded-lg bg-white/5 px-3 py-1.5 shadow-sm hover:bg-white/10 hover:text-white/90 transition-colors cursor-default">
                                          {level}
                                        </span>
                                        {idx < parents.length - 1 && <ChevronLeft size={12} className="opacity-40 mx-0.5" />}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {/* Current Active Section */}
                                {current && (
                                  <div className="mt-2 flex items-start justify-center gap-2.5 max-w-3xl mx-auto">
                                    <ChevronLeft size={18} className="text-[#38bdf8]/60 mt-2.5 shrink-0" strokeWidth={2.5} />
                                    <div className="px-4 text-[15px] font-bold text-[#38bdf8] leading-relaxed bg-[#38bdf8]/5 border border-[#38bdf8]/10 py-2 rounded-xl shadow-sm text-right">
                                      {current}
                                    </div>
                                  </div>
                                )}
                              </>
                            )
                          })()}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                        {chunkMeta.author && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f43f5e]/25 bg-[#f43f5e]/10 px-4 py-2 text-[13px] font-semibold text-[#f43f5e] shadow-sm">
                            <User size={14} />
                            {chunkMeta.author}{chunkMeta.author_death ? ` (${chunkMeta.author_death})` : ''}
                          </span>
                        )}
                        {chunkMeta.domain && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10b981]/25 bg-[#10b981]/10 px-4 py-2 text-[13px] font-semibold text-[#10b981] shadow-sm">
                            <Book size={14} />
                            المجال: {chunkMeta.domain}
                          </span>
                        )}
                        {chunkMeta.madhhab && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#a78bfa]/25 bg-[#a78bfa]/10 px-4 py-2 text-[13px] font-semibold text-[#a78bfa] shadow-sm">
                            <Library size={14} />
                            المذهب: {chunkMeta.madhhab}
                          </span>
                        )}
                        {chunkMeta.hijri_century && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f59e0b]/25 bg-[#f59e0b]/10 px-4 py-2 text-[13px] font-semibold text-[#f59e0b] shadow-sm">
                            <CalendarDays size={14} />
                            {chunkMeta.hijri_century}
                          </span>
                        )}
                        {(chunkMeta.part || chunkMeta.total_parts) && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#14b8a6]/25 bg-[#14b8a6]/10 px-4 py-2 text-[13px] font-semibold text-[#14b8a6] shadow-sm">
                            <Layers size={14} />
                            الجزء: {chunkMeta.part || '-'}{chunkMeta.total_parts ? ` / ${chunkMeta.total_parts}` : ''}
                          </span>
                        )}
                        {chunkMeta.page_id && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ec4899]/25 bg-[#ec4899]/10 px-4 py-2 text-[13px] font-semibold text-[#ec4899] shadow-sm">
                            <Hash size={14} />
                            الصفحة: {chunkMeta.page_id}
                          </span>
                        )}
                        {chunkMeta.source_url && (
                          <a href={chunkMeta.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-2 text-[13px] font-semibold text-blue-400 hover:bg-blue-500/20 transition-colors shadow-sm">
                            <Link size={14} />
                            رابط المصدر
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Premium Section Divider */}
                  <div className="mt-10 mb-6 flex items-center gap-4 w-full px-2">
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#38bdf8]/40 to-transparent"></div>
                    <div className="group flex items-center gap-3 bg-[#38bdf8]/10 border border-[#38bdf8]/25 px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(56,189,248,0.15)] backdrop-blur-md relative overflow-hidden transition-all hover:bg-[#38bdf8]/15 hover:shadow-[0_0_25px_rgba(56,189,248,0.25)]">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      <BookOpen size={18} className="text-[#38bdf8]" />
                      <span className="font-bold text-[#38bdf8] text-[16px] tracking-wide">النص الأساسي للدرس</span>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#38bdf8]/40 to-transparent"></div>
                  </div>

                  <div
                    className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 text-[18px] leading-[1.9] text-white/90 shadow-2xl font-serif tracking-wide relative overflow-hidden backdrop-blur-md"
                    dangerouslySetInnerHTML={formatMarkdown(chunkText, true)}
                  />
                </>
              )}

              <div className="mt-12 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleGenerateMindmap}
                  disabled={!currentChunkId || loading}
                  className={`group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border p-6 transition-all duration-300 ${!currentChunkId ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed' : 'bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/10 hover:-translate-y-1 shadow-lg'}`}
                >
                  <div className={`rounded-full p-3.5 transition-all duration-300 ${!currentChunkId ? 'bg-white/5 text-white/20' : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/20 group-hover:shadow-purple-500/40'}`}>
                    <Brain size={24} className={currentChunkId ? "group-hover:scale-110 transition-transform duration-300" : ""} />
                  </div>
                  <div className="text-center">
                    <h4 className={`font-bold text-[16px] mb-1.5 ${!currentChunkId ? 'text-white/30' : 'text-purple-200 group-hover:text-white transition-colors'}`}>خريطة ذهنية</h4>
                    <p className={`text-[13px] ${!currentChunkId ? 'text-white/20' : 'text-purple-200/60 group-hover:text-purple-200/80 transition-colors'}`}>إنشاء خريطة ذهنيه لهذا الدرس</p>
                  </div>
                </button>

                <button
                  onClick={handleGenerateQuiz}
                  disabled={!currentChunkId || loading}
                  className={`group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border p-6 transition-all duration-300 ${!currentChunkId ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed' : 'bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/10 hover:-translate-y-1 shadow-lg'}`}
                >
                  <div className={`rounded-full p-3.5 transition-all duration-300 ${!currentChunkId ? 'bg-white/5 text-white/20' : 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40'}`}>
                    <ClipboardList size={24} className={currentChunkId ? "group-hover:scale-110 transition-transform duration-300" : ""} />
                  </div>
                  <div className="text-center">
                    <h4 className={`font-bold text-[16px] mb-1.5 ${!currentChunkId ? 'text-white/30' : 'text-blue-200 group-hover:text-white transition-colors'}`}>اختبار تفاعلي</h4>
                    <p className={`text-[13px] ${!currentChunkId ? 'text-white/20' : 'text-blue-200/60 group-hover:text-blue-200/80 transition-colors'}`}>إنشاء اختبار لتقييم فهمك</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Resizer 2 (Between Document and Interactive Area) */}
        {isDocumentOpen && (
          <div
            onMouseDown={startResizingDocument}
            className="hidden lg:block w-1 cursor-col-resize bg-white/10 hover:bg-[#38bdf8] active:bg-[#38bdf8] transition-colors z-20 shrink-0"
          />
        )}

        {/* Interactive Area */}
        <div className="flex flex-1 flex-col bg-[#1a0730]/20 backdrop-blur-xl min-w-0">
          {/* Tabs for mobile or tight views */}
          <div className="flex px-6 pt-6 pb-2">
            <div className="flex w-full rounded-2xl bg-[#12041f]/60 p-1.5 border border-white/10 backdrop-blur-md shadow-inner">
              {[
                { id: 'chat', label: 'المعلم الذكي', icon: MessageCircle },
                { id: 'mindmap', label: 'الخريطة', icon: Brain },
                { id: 'quiz', label: 'التقييم', icon: ClipboardList }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-2.5 text-[14px] font-bold flex items-center justify-center gap-2 rounded-xl transition-all duration-300 ${isActive
                      ? 'bg-[#10b981] text-[#12041f] shadow-md shadow-[#10b981]/20'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {tab.label}
                    <Icon size={16} className={isActive ? 'text-[#12041f]' : ''} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Dynamic Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {activeTab === 'chat' && (
              <div className="mx-auto flex max-w-3xl flex-col gap-5">
                {messages.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                    <span className="brand-gradient flex h-20 w-20 items-center justify-center rounded-3xl shadow-xl shadow-primary/30 p-3">
                      <img src={whiteLogo} alt="Zad Logo" className="w-full h-full object-contain drop-shadow-md" />
                    </span>
                    <h2 className="mt-6 font-display text-2xl text-white">مرحباً بك في زاد</h2>
                    <p className="mt-2 max-w-md text-white/75">يمكنك سؤالي عن أي شيء في النص.</p>
                  </div>
                )}
                {messages.map((msg) => {
                  const isUser = msg.role === 'user'
                  return (
                    <div key={msg.id} className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
                      <div className={`flex max-w-[85%] items-start gap-2.5 ${isUser ? '' : 'flex-row-reverse'}`}>
                        {isUser ? (
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm shadow-md bg-white/10 border border-white/20 text-white backdrop-blur-md">
                            <User size={18} />
                          </span>
                        ) : (
                          <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full gradient-border p-[2px] shadow-md shadow-primary/20">
                            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#1a0730] backdrop-blur-md">
                              <img src={ZadDarkLogo} alt="Zad" className="w-7 h-7 object-contain drop-shadow-sm" />
                            </div>
                          </div>
                        )}
                        <div
                          className={`whitespace-pre-line rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-lg backdrop-blur-md ${isUser ? 'bg-gradient-to-br from-[#0284c7] to-[#0369a1] text-white border border-sky-400/30' : 'border border-white/10 bg-[#1a0730]/80 text-white/90 shadow-primary/5'}`}
                          dangerouslySetInnerHTML={formatMarkdown(msg.text)}
                        />
                      </div>
                    </div>
                  )
                })}
                {loading && (
                  <div className="flex justify-end">
                    <div className="flex items-center gap-1.5 rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-white/60" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}

            {activeTab === 'mindmap' && (
              <div className="flex flex-col h-full items-center justify-start p-6">
                {!mindmapData && loading && (
                  <div className="w-full flex justify-center items-center gap-2 text-white/50 mt-20">
                    <Hourglass size={24} className="animate-pulse" />
                    <span className="text-lg">جاري تحليل النص وبناء الخريطة...</span>
                  </div>
                )}
                {!mindmapData && !loading && (
                  <div className="flex flex-col items-center justify-center w-full mt-24 opacity-60">
                    <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                      <Brain size={36} className="text-[#38bdf8]" />
                    </div>
                    <p className="text-white text-xl font-bold">لا توجد خريطة ذهنية</p>
                    <p className="text-white/70 text-[15px] mt-2 max-w-sm text-center">قم باختيار درس من الفهرس الجانبي، ثم اضغط على زر توليد الخريطة أسفل النص لتظهر لك هنا.</p>
                  </div>
                )}
                {mindmapData && (
                  <div className="w-full bg-[#12041f]/80 p-8 rounded-2xl border border-white/10 shadow-xl overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Brain size={24} className="text-[#38bdf8]" />
                      الخريطة الذهنية للدرس
                    </h3>
                    <div dir="rtl" className="w-max pr-4">
                      {renderMindmapNode(mindmapData)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'quiz' && (
              <div className="mx-auto max-w-2xl space-y-6">
                {!quizQuestions && loading && (
                  <div className="flex justify-center items-center gap-2 text-white/50 mt-20">
                    <Hourglass size={24} className="animate-pulse" />
                    <span className="text-lg">جاري استخراج الأسئلة...</span>
                  </div>
                )}
                {!quizQuestions && !loading && (
                  <div className="flex flex-col items-center justify-center w-full mt-24 opacity-60">
                    <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                      <ClipboardList size={36} className="text-[#10b981]" />
                    </div>
                    <p className="text-white text-xl font-bold">لا يوجد تقييم حالي</p>
                    <p className="text-white/70 text-[15px] mt-2 max-w-sm text-center">قم باختيار درس من الفهرس الجانبي، ثم اضغط على زر توليد الأسئلة لاختبار فهمك.</p>
                  </div>
                )}
                {quizQuestions?.map((q, idx) => {
                  const answered = selectedAnswers[idx] !== undefined
                  const isCorrect = selectedAnswers[idx] === q.correct_answer_index

                  return (
                    <div key={idx} className="rounded-2xl border border-white/15 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
                      <h3 className="mb-5 text-lg font-bold text-white">{idx + 1}. {q.question}</h3>
                      <div className="flex flex-col gap-3">
                        {q.options.map((opt, optIdx) => {
                          let btnStyle = 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                          if (answered) {
                            if (optIdx === q.correct_answer_index) {
                              btnStyle = 'border-green-500 bg-green-500/20 text-green-400 font-bold'
                            } else if (optIdx === selectedAnswers[idx]) {
                              btnStyle = 'border-red-500 bg-red-500/20 text-red-400 font-bold'
                            } else {
                              btnStyle = 'border-white/10 bg-black/20 text-white/30 opacity-50'
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={answered}
                              onClick={() => setSelectedAnswers(p => ({ ...p, [idx]: optIdx }))}
                              className={`rounded-xl border px-5 py-3.5 text-right text-[15px] transition-all ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          )
                        })}
                      </div>

                      {answered && (
                        <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-5">
                          <p className={`font-bold text-lg flex items-center gap-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
                            {isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة!'}
                          </p>
                          <div
                            className="mt-2 text-[15px] leading-relaxed text-white/80"
                            dangerouslySetInnerHTML={formatMarkdown(q.explanation)}
                          />

                          {!isCorrect && (
                            <button
                              onClick={() => handleDiscussQuestion(q, q.options[selectedAnswers[idx]])}
                              className="brand-gradient-blue mt-4 flex items-center justify-center gap-2 w-full rounded-xl px-4 py-3 font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
                            >
                              <MessageCircle size={18} />
                              ناقش هذا السوأل مع زاد
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Chat Input Area (Only visible when chat tab is active) */}
          {activeTab === 'chat' && (
            <div className="p-4 md:p-6 pb-6 z-10 flex justify-center relative">
              
              <div className="mx-auto flex max-w-2xl items-center gap-3 relative z-10 w-full">
                <div className="relative w-full">
                  {/* Subtle blur UNDER the bar */}
                  <div className="absolute -bottom-2 left-8 right-8 h-8 bg-black/60 blur-xl -z-10 rounded-full"></div>
                  
                  <div className="gradient-border min-w-0 flex-1 rounded-full p-[2px] shadow-2xl w-full">
                    <div className="flex w-full items-center gap-2 rounded-full bg-[#12041f] py-2 pl-2 pr-5">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="اكتب سؤالك للمعلم زاد…"
                    className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 -scale-x-100">
                      <path
                        d="M6 12h13M13 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
