import { useState, useRef, useEffect } from 'react'
import bgDark from '@/imports/image.png'
import whiteLogo from '@/imports/WhiteLogo.png'

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

interface TreeNode {
  title: string
  chunk_id?: string
  is_new?: boolean
  children?: TreeNode[]
}

// Simple Markdown Parser Helper
function formatMarkdown(text: string) {
  if (!text) return { __html: '' }
  
  let html = text
    // Escape HTML to prevent basic XSS
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2 text-[#38bdf8]">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-5 mb-3 text-[#38bdf8]">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4 text-[#38bdf8]">$1</h1>')
    
    // Bold and Italic
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#10b981]">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-white/80">$1</em>')
    
    // Lists (using div/span to avoid <li> numbering issues without <ul>/<ol>)
    .replace(/^[-*] (.*$)/gim, '<div class="flex gap-2 mr-2 mb-1"><span class="font-bold text-[#10b981]">•</span> <span>$1</span></div>')
    .replace(/^(\d+\.) (.*$)/gim, '<div class="flex gap-2 mr-2 mb-1"><span class="font-bold text-[#38bdf8] min-w-[1.2rem]">$1</span> <span>$2</span></div>')
    
    // Special formatting for "Context" string
    .replace(/^السياق:\s*\[(.*?)\]/gim, (_match, p1) => {
      const badges = p1.split('|').map((b: string) => `<span class="bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30 px-3 py-1.5 rounded-full text-xs font-semibold ml-2 mb-2 inline-flex items-center shadow-sm backdrop-blur-md transition-all hover:bg-[#38bdf8]/20">${b.trim()}</span>`).join('');
      return `<div class="mb-8 flex flex-wrap relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-5 shadow-lg">${badges}</div>`;
    })
    
    // Special formatting for "Text" string
    .replace(/^النص:\s*/gim, '<div class="flex items-center gap-3 mb-6 mt-2"><div class="h-px flex-1 bg-gradient-to-l from-transparent via-white/20 to-transparent"></div><div class="text-[#fcd34d] text-sm font-bold flex items-center gap-2"><span>📖</span> المتن الأصلي</div><div class="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div></div>')
    
    // Line breaks (only apply <br/> if the line doesn't start with a block tag or isn't already handled by flex div)
    .replace(/\n/g, '<br />')
    // Remove extra breaks after our divs
    .replace(/<\/div><br \/>/g, '</div>')

  return { __html: html }
}

function TreeView({ 
  node, 
  depth = 0, 
  activeChunkId,
  onChunkSelect,
  parentPath = []
}: { 
  node: TreeNode; 
  depth?: number;
  activeChunkId?: string | null;
  onChunkSelect?: (chunkId: string, title: string, fullPath: string) => void;
  parentPath?: string[];
}) {
  const [expanded, setExpanded] = useState(false)
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
        className={`flex cursor-pointer items-center gap-2 py-1.5 transition-colors hover:text-white ${
          isActive ? 'font-bold text-[#10b981]' : 'text-white/70'
        }`}
        style={{ paddingRight: `${depth * 1.5}rem` }}
        onClick={handleClick}
      >
        {hasChildren ? (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center text-xs opacity-70">
            {expanded ? '▼' : '◀'}
          </span>
        ) : (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center text-xs opacity-50">
            📄
          </span>
        )}
        <span className={hasChildren ? 'font-semibold' : 'text-[14px]'}>
          {hasChildren ? '📁 ' : ''}{node.title}
          {node.is_new && <span className="mr-2 rounded bg-green-500/20 px-1.5 py-0.5 text-[10px] text-green-400">جديد</span>}
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
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function StudyMode({ onExit }: { onExit: () => void }) {
  const [activeTab, setActiveTab] = useState<'chat' | 'mindmap' | 'quiz'>('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [chatHistory, setChatHistory] = useState<ApiHistoryMsg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [treeData, setTreeData] = useState<TreeNode[]>([])
  const [treeLoading, setTreeLoading] = useState(true)
  const [currentChunkId, setCurrentChunkId] = useState<string | null>(null)
  const [chunkTitle, setChunkTitle] = useState('اختر درساً من الفهرس...')
  const [headerSubtitle, setHeaderSubtitle] = useState('يرجى اختيار درس للبدء')
  const [chunkText, setChunkText] = useState('يرجى اختيار درس من الفهرس الجانبي لعرض النص الأساسي والبدء في التفاعل مع المعلم زاد.')
  
  // Resizable Panels State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isDocumentOpen, setIsDocumentOpen] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [documentWidth, setDocumentWidth] = useState(450)
  
  const [quizQuestions, setQuizQuestions] = useState<Question[] | null>(null)
  const [mindmapData, setMindmapData] = useState<MindmapNode[] | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const chatEndRef = useRef<HTMLDivElement>(null)

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
      setDocumentWidth(Math.max(300, Math.min(window.innerWidth - sidebarWidth - e.clientX, 800)))
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

  const handleChunkSelect = async (chunkId: string, title: string, fullPath: string) => {
    setCurrentChunkId(chunkId)
    setChunkTitle(title)
    setHeaderSubtitle(fullPath)
    setChunkText('جاري تحميل النص الأساسي...')
    
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
        
        // Auto-send kickstart message from student
        const initMsg = "مرحباً يا زاد، أنا مستعد لبدء دراسة هذا الدرس، هل يمكنك وضع خطة والبدء بالشرح؟"
        setMessages([{ id: 'init', role: 'user', text: initMsg }])
        setLoading(true)
        
        const chatRes = await fetch(`${API_BASE}/api/v1/tutor/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
  }

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
        headers: { 'Content-Type': 'application/json' },
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
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'tutor', text: '❌ خطأ: ' + data.detail }])
      }
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'tutor', text: '❌ فشل الاتصال بالسيرفر.' }])
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'tutor', text: '❌ خطأ: ' + data.detail }])
      }
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'tutor', text: '❌ فشل الاتصال بالسيرفر.' }])
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
                      <span className="mindmap-arrow text-white/40 transition-transform duration-300 text-xs">◀</span>
                      {n.label}
                    </div>
                  ) : (
                    <div className="text-white/90 text-sm bg-black/20 p-3 rounded-lg border border-white/10 inline-flex items-center gap-2 shadow-sm transition-all hover:bg-black/40 hover:-translate-y-0.5">
                      <span className="mindmap-arrow text-white/40 transition-transform duration-300 text-xs">◀</span>
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
      <div className="pointer-events-none absolute inset-0 bg-[#12041f]/40" />

      <header className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#1a0730]/60 px-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={onExit}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
          >
            →
          </button>
          <div className="min-w-[150px]">
            <h1 className="font-display text-lg font-bold text-white">وضع الدراسة (Tutor Mode)</h1>
            <p className="text-xs text-white/60">{headerSubtitle}</p>
          </div>
          
          <div className="flex items-center gap-3 mr-4 border-r border-white/10 pr-4">
            {!isSidebarOpen && (
               <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="hidden md:flex h-9 items-center justify-center gap-2 rounded-xl bg-[#38bdf8]/10 px-3 text-[#38bdf8] transition-colors hover:bg-[#38bdf8]/20"
                >
                  <span>☰</span>
                  <span className="text-sm font-bold">الفهرس</span>
               </button>
            )}
            {!isDocumentOpen && (
               <button
                  onClick={() => setIsDocumentOpen(true)}
                  className="hidden lg:flex h-9 items-center justify-center gap-2 rounded-xl bg-[#10b981]/10 px-3 text-[#10b981] transition-colors hover:bg-[#10b981]/20"
                >
                  <span>📜</span>
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
          className={`hidden flex-col bg-[#12041f]/80 backdrop-blur-md md:flex shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${isSidebarOpen ? 'border-l border-white/10' : 'border-transparent'}`}
        >
          <div style={{ width: sidebarWidth }} className="flex h-full flex-col">
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-white">فهرس المنهج</h2>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="text-white/50">🔍</span>
                <input type="text" placeholder="ابحث عن درس..." className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {treeLoading ? (
                <div className="flex h-full items-center justify-center text-white/50">جاري تحميل الفهرس... ⏳</div>
              ) : treeData.length > 0 ? (
                treeData.map((node, idx) => (
                  <TreeView 
                    key={idx} 
                    node={node} 
                    activeChunkId={currentChunkId}
                    onChunkSelect={handleChunkSelect}
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
          className={`hidden flex-col bg-[#12041f]/50 backdrop-blur-md lg:flex shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${isDocumentOpen ? 'border-l border-white/10' : 'border-transparent'}`}
        >
          <div style={{ width: documentWidth }} className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="mb-1 font-display text-xl text-white">{chunkTitle}</h2>
                  <p className="text-xs text-white/50">النص الأساسي للدرس</p>
                </div>
                <button 
                  onClick={() => setIsDocumentOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <div 
              className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 text-[18px] leading-[2.5] text-white/90 shadow-2xl font-serif tracking-wide relative overflow-hidden backdrop-blur-md"
              dangerouslySetInnerHTML={formatMarkdown(chunkText)}
            />
            
            <div className="mt-6 flex flex-col gap-3">
              <button 
                onClick={handleGenerateMindmap}
                disabled={!currentChunkId || loading}
                className="brand-gradient flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>توليد الخريطة الذهنية لهذا الدرس</span>
                <span>🧠</span>
              </button>
              <button 
                onClick={handleGenerateQuiz}
                disabled={!currentChunkId || loading}
                className="brand-gradient-blue flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 font-semibold text-white shadow-lg shadow-brand-blue/20 transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>اختبر فهمك (توليد أسئلة)</span>
                <span>📝</span>
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
        <div className="flex flex-1 flex-col bg-[#1a0730]/20 backdrop-blur-sm min-w-0">
          {/* Tabs for mobile or tight views */}
          <div className="flex border-b border-white/10 px-4 pt-2">
            {[
              { id: 'chat', label: 'المعلم الذكي 💬' },
              { id: 'mindmap', label: 'الخريطة 🧠' },
              { id: 'quiz', label: 'التقييم 📝' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-3.5 text-[15px] font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'border-b-2 border-[#10b981] text-[#10b981]' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dynamic Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {activeTab === 'chat' && (
              <div className="mx-auto flex max-w-3xl flex-col gap-5">
                {messages.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                    <span className="brand-gradient flex h-20 w-20 items-center justify-center rounded-3xl shadow-xl shadow-primary/30 p-3">
                      <img src={whiteLogo} alt="Zad Logo" className="w-full h-full object-contain drop-shadow-md" />
                    </span>
                    <h2 className="mt-6 font-display text-2xl text-white">مرحباً بك في المعلم زاد</h2>
                    <p className="mt-2 max-w-md text-white/75">يمكنك سؤالي عن أي شيء في النص.</p>
                  </div>
                )}
                {messages.map((msg) => {
                  const isUser = msg.role === 'user'
                  return (
                    <div key={msg.id} className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
                      <div className={`flex max-w-[85%] items-start gap-2.5 ${isUser ? '' : 'flex-row-reverse'}`}>
                        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm ${isUser ? 'bg-white/20 text-white' : 'brand-gradient text-white'}`}>
                          {isUser ? '🧑' : '✦'}
                        </span>
                        <div 
                          className={`whitespace-pre-line rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm ${isUser ? 'bg-[#0284c7] text-white' : 'border border-white/15 bg-white/10 text-white'}`}
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
              <div className="flex flex-col h-full items-start justify-start p-6">
                {!mindmapData && loading && (
                  <div className="w-full text-center text-white/50">جاري تحليل النص وبناء الخريطة... ⏳</div>
                )}
                {mindmapData && (
                  <div className="w-full bg-[#12041f]/80 p-8 rounded-2xl border border-white/10 shadow-xl overflow-x-auto">
                    <h3 className="text-xl font-bold text-white mb-6">الخريطة الذهنية للدرس 🧠</h3>
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
                  <div className="text-center text-white/50">جاري استخراج الأسئلة... ⏳</div>
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
                          <p className={`font-bold text-lg ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect ? '✅ إجابة صحيحة!' : '❌ إجابة خاطئة!'}
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
                              ناقش المعلم في هذا السؤال 💬
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
            <div className="border-t border-white/10 bg-[#1a0730]/60 p-4 backdrop-blur-md md:p-6">
              <div className="mx-auto flex max-w-2xl items-center gap-3">
                <div className="gradient-border min-w-0 flex-1 rounded-full p-[2.5px] shadow-xl shadow-primary/25">
                  <div className="flex items-center gap-2 rounded-full bg-[#1a0730]/90 py-2 pl-2 pr-5 backdrop-blur-md">
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
                      className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/50"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || loading}
                      className="brand-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-40"
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
