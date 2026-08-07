import { useState, useEffect, useRef } from 'react'
import bgDark from '@/imports/image.png'

const API_BASE = 'http://127.0.0.1:8002'

interface BuildStatus {
  is_building: boolean
  current_book: string
  chunks_processed: number
  total_expected: number
  cancel_requested: boolean
}

export default function AdminDashboard({ onExit }: { onExit: () => void }) {
  const [hierarchy, setHierarchy] = useState<Record<string, Record<string, string[]>>>({})
  const [loadingBooks, setLoadingBooks] = useState(true)
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set())
  
  const [buildStatus, setBuildStatus] = useState<BuildStatus | null>(null)
  const [polling, setPolling] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  // Fetch books on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/admin/books`)
      .then(res => res.json())
      .then(data => {
        if (data.hierarchy) {
          setHierarchy(data.hierarchy)
        }
      })
      .catch(console.error)
      .finally(() => setLoadingBooks(false))
  }, [])

  // Poll status when polling is true
  useEffect(() => {
    if (!polling) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/admin/build-status`)
        const status: BuildStatus = await res.json()
        setBuildStatus(status)
        
        if (!status.is_building) {
          setPolling(false)
          setStatusMessage('✅ تمت عملية بناء الفهرس بنجاح!')
        }
      } catch (e) {
        console.error(e)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [polling])

  const toggleBook = (book: string) => {
    const newSet = new Set(selectedBooks)
    if (newSet.has(book)) newSet.delete(book)
    else newSet.add(book)
    setSelectedBooks(newSet)
  }

  const handleBuild = async (buildAll: boolean = false) => {
    if (!buildAll && selectedBooks.size === 0) {
      return alert('يرجى اختيار كتاب واحد على الأقل أو اختيار "بناء كل الكتب"')
    }

    setPolling(true)
    setStatusMessage('⏳ جاري تهيئة عملية البناء...')
    
    try {
      let url = `${API_BASE}/api/v1/admin/build-tree`
      if (!buildAll) {
        const queryParams = Array.from(selectedBooks).map(b => `book_names=${encodeURIComponent(b)}`).join('&')
        url += `?${queryParams}`
      }

      // We don't await the fetch directly because it blocks until the build is done.
      // But wait, the FastAPI endpoint actually awaits the full build and returns when done.
      // So we start polling independently while the fetch runs.
      fetch(url, { method: 'POST' }).then(async (res) => {
        const data = await res.json()
        setPolling(false)
        if (data.success) {
          setStatusMessage('✅ ' + data.message)
        } else {
          setStatusMessage('❌ ' + data.message)
        }
      }).catch(err => {
        setPolling(false)
        setStatusMessage('❌ فشل الاتصال بالسيرفر.')
      })

    } catch (e) {
      setPolling(false)
      setStatusMessage('❌ حدث خطأ غير متوقع.')
    }
  }

  const handleCancel = async () => {
    setStatusMessage('⏳ جاري إرسال أمر الإيقاف...')
    try {
      await fetch(`${API_BASE}/api/v1/admin/build-cancel`, { method: 'POST' })
    } catch (e) {
      console.error(e)
    }
  }

  // Calculate percentage
  let percent = 0
  if (buildStatus && buildStatus.is_building && buildStatus.total_expected > 0) {
    percent = Math.round((buildStatus.chunks_processed / buildStatus.total_expected) * 100)
  }

  return (
    <div dir="rtl" className="relative flex h-screen w-full flex-col overflow-hidden text-foreground">
      {/* Background */}
      <img
        src={bgDark}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-[#12041f]/90 backdrop-blur-md" />

      {/* Header */}
      <header className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#1a0730]/60 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
          >
            →
          </button>
          <div>
            <h1 className="font-display text-lg font-bold text-white">لوحة تحكم المكتبة (Admin Dashboard)</h1>
            <p className="text-xs text-white/60">بناء وتحديث فهرس الدروس والكتب</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 overflow-y-auto p-6 md:p-10 custom-scrollbar">
        
        {/* Top Section: Progress & Actions */}
        <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">حالة البناء</h2>
              <p className="mt-1 text-sm text-white/60">راقب تقدم بناء الخرائط والفهارس بشكل حيّ</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleBuild(false)}
                disabled={polling || selectedBooks.size === 0}
                className="brand-gradient rounded-xl px-5 py-2.5 font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                بناء الكتب المحددة
              </button>
              <button
                onClick={() => handleBuild(true)}
                disabled={polling}
                className="brand-gradient-blue rounded-xl px-5 py-2.5 font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                بناء كل الكتب 🚀
              </button>
              {polling && (
                <button
                  onClick={handleCancel}
                  className="rounded-xl border border-red-500/50 bg-red-500/20 px-5 py-2.5 font-bold text-red-400 transition-colors hover:bg-red-500/30"
                >
                  إيقاف البناء 🛑
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-[#0a0212]/80 p-5 border border-white/5 shadow-inner">
            <div className="flex justify-between text-sm font-semibold text-white">
              <span>{polling && buildStatus ? `جاري معالجة: ${buildStatus.current_book}` : statusMessage || 'في انتظار الأوامر...'}</span>
              <span>{polling ? `${percent}%` : ''}</span>
            </div>
            
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-white/10">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-l from-[#38bdf8] to-[#10b981] transition-all duration-500 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
            
            {polling && buildStatus && (
              <div className="flex justify-between text-xs text-white/50">
                <span>{buildStatus.chunks_processed} درس تمت معالجته</span>
                <span>الإجمالي: {buildStatus.total_expected} درس</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Books Selection */}
        <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white">قائمة الكتب المتاحة</h2>
          
          {loadingBooks ? (
            <div className="py-10 text-center text-white/50">جاري تحميل الكتب... ⏳</div>
          ) : (
            <div className="flex flex-col gap-4">
              {Object.entries(hierarchy).map(([domain, madhhabs]) => (
                <details key={domain} className="group rounded-2xl border border-white/10 bg-black/20 transition-all open:bg-black/40">
                  <summary className="flex cursor-pointer select-none items-center justify-between p-5 list-none [&::-webkit-details-marker]:hidden">
                    <h3 className="font-display text-xl text-[#38bdf8]">{domain}</h3>
                    <span className="text-white/50 transition-transform group-open:rotate-180">▼</span>
                  </summary>
                  
                  <div className="flex flex-col gap-4 px-5 pb-5">
                    {Object.entries(madhhabs).map(([madhhab, books]) => (
                      <details key={madhhab} className="group/madhhab rounded-xl border border-white/5 bg-white/5 transition-all open:bg-white/10">
                        <summary className="flex cursor-pointer select-none items-center justify-between p-4 list-none [&::-webkit-details-marker]:hidden">
                          <h4 className="font-bold text-white/90">{madhhab}</h4>
                          <span className="text-sm text-white/40 transition-transform group-open/madhhab:rotate-180">▼</span>
                        </summary>
                        
                        <div className="flex flex-col gap-1 border-t border-white/5 px-3 py-3">
                          {books.map(book => (
                            <label key={book} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/10">
                              <input
                                type="checkbox"
                                checked={selectedBooks.has(book)}
                                onChange={() => toggleBook(book)}
                                className="h-4 w-4 rounded border-white/20 bg-transparent text-[#38bdf8] focus:ring-[#38bdf8]/30"
                              />
                              <span className="text-[15px] text-white/80">{book}</span>
                            </label>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  )
}
