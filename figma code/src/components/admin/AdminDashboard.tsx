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

interface Job {
  book: string
  status: 'pending' | 'processing' | 'done' | 'error' | 'cancelled'
  message?: string
  progress?: number
}

export default function AdminDashboard({ onExit }: { onExit: () => void }) {
  const [hierarchy, setHierarchy] = useState<Record<string, Record<string, string[]>>>({})
  const [loadingBooks, setLoadingBooks] = useState(true)
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set())
  
  const [buildStatus, setBuildStatus] = useState<BuildStatus | null>(null)
  const [polling, setPolling] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [jobs, setJobs] = useState<Job[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)
  const activeJobAbortRef = useRef<AbortController | null>(null)
  const jobsRef = useRef<Job[]>([])
  const [builtBooks, setBuiltBooks] = useState<Set<string>>(new Set())

  // Keep jobsRef in sync
  useEffect(() => { jobsRef.current = jobs }, [jobs])

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

    // Fetch built books from tree
    fetch(`${API_BASE}/api/v1/tree/library`)
      .then(res => res.json())
      .then(data => {
         const built = new Set<string>()
         const traverse = (nodes: any[], depth: number) => {
            if (!nodes) return
            for (const n of nodes) {
               if (depth === 2) built.add(n.title)
               traverse(n.children, depth + 1)
            }
         }
         traverse(data, 0)
         setBuiltBooks(built)
      })
      .catch(console.error)
  }, [])

  // Poll status when polling is true
  useEffect(() => {
    if (!polling) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/admin/build-status`)
        const status: BuildStatus = await res.json()
        setBuildStatus(status)
        if (status.is_building && status.total_expected > 0) {
           const p = Math.round((status.chunks_processed / status.total_expected) * 100)
           setJobs(prev => prev.map(j => j.status === 'processing' ? { ...j, progress: Math.max(j.progress || 0, p) } : j))
        }
      } catch (e) {
        console.error(e)
      }
    }, 200)
    return () => clearInterval(interval)
  }, [polling])

  // Fake progress interval for active job to ensure visual smoothness
  useEffect(() => {
     if (!polling) return
     const interval = setInterval(() => {
        setJobs(prev => prev.map(j => {
           if (j.status === 'processing') {
              const current = j.progress || 0
              if (current < 90) {
                 return { ...j, progress: current + Math.floor(Math.random() * 8) + 2 }
              }
           }
           return j
        }))
     }, 300)
     return () => clearInterval(interval)
  }, [polling])

  const toggleBook = (book: string) => {
    const newSet = new Set(selectedBooks)
    if (newSet.has(book)) newSet.delete(book)
    else newSet.add(book)
    setSelectedBooks(newSet)
  }

  const handleBuild = async (buildAll: boolean = false) => {
    let booksToBuild: string[] = []
    
    if (buildAll) {
      booksToBuild = Object.values(hierarchy).flatMap(d => Object.values(d).flat())
    } else {
      booksToBuild = Array.from(selectedBooks)
    }

    if (booksToBuild.length === 0) {
      return alert('يرجى اختيار كتاب واحد على الأقل أو اختيار "بناء كل الكتب"')
    }

    setJobs(booksToBuild.map(b => ({ book: b, status: 'pending' })))
    setPolling(true)
    setStatusMessage('جاري معالجة طابور الكتب...')

    abortControllerRef.current = new AbortController()

    for (let i = 0; i < booksToBuild.length; i++) {
      const book = booksToBuild[i]
      
      const currentJobState = jobsRef.current.find(j => j.book === book)
      if (currentJobState?.status === 'cancelled') continue

      if (abortControllerRef.current.signal.aborted) {
         setStatusMessage('تم الإلغاء.')
         setPolling(false)
         break
      }

      setJobs(prev => prev.map(j => j.book === book ? { ...j, status: 'processing', progress: 5 } : j))
      
      activeJobAbortRef.current = new AbortController()

      try {
        const url = `${API_BASE}/api/v1/admin/build-tree?book_names=${encodeURIComponent(book)}`
        const res = await fetch(url, { 
           method: 'POST',
           signal: activeJobAbortRef.current.signal
        })
        const data = await res.json()
        
        // Wait for CSS transition to visually reach 100%
        setJobs(prev => prev.map(j => j.book === book ? { ...j, progress: 100 } : j))
        await new Promise(resolve => setTimeout(resolve, 600))
        
        setJobs(prev => prev.map(j => j.book === book ? { ...j, status: data.success ? 'done' : 'error', message: data.message } : j))
      } catch (err: any) {
        if (err.name === 'AbortError') {
           setJobs(prev => prev.map(j => j.book === book ? { ...j, status: 'cancelled', message: 'تم الإلغاء' } : j))
        } else {
           setJobs(prev => prev.map(j => j.book === book ? { ...j, status: 'error', message: 'فشل الاتصال' } : j))
        }
      }
    }
    
    if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
       setStatusMessage('✅ تمت عملية البناء لجميع الكتب بنجاح!')
       setPolling(false)
    }
  }

  const cancelJob = (book: string) => {
    setJobs(prev => prev.map(j => {
      if (j.book === book) {
        if (j.status === 'processing' && activeJobAbortRef.current) {
           activeJobAbortRef.current.abort()
        }
        return { ...j, status: 'cancelled' }
      }
      return j
    }))
  }

  const handleCancel = async () => {
    setStatusMessage('⏳ جاري إيقاف العملية...')
    if (abortControllerRef.current) {
       abortControllerRef.current.abort()
    }
    if (activeJobAbortRef.current) {
       activeJobAbortRef.current.abort()
    }
    try {
      await fetch(`${API_BASE}/api/v1/admin/build-cancel`, { method: 'POST' })
    } catch (e) {
      console.error(e)
    }
  }

  // (Local percentage is handled in the job object now)

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
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 overflow-y-auto p-6 md:p-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
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
                بناء كل الكتب 
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

          {/* Jobs Queue Container */}
          {jobs.length > 0 && (
            <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-[#0a0212]/80 p-5 border border-white/5 shadow-inner max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="flex justify-between items-center text-sm font-semibold text-white mb-2 sticky top-0 bg-[#0a0212]/90 backdrop-blur-md py-2 z-10 border-b border-white/10">
                <span>{statusMessage}</span>
                <span className="bg-white/10 px-3 py-1 rounded-full text-xs">
                  {jobs.filter(j => j.status === 'done').length} / {jobs.length} مكتمل
                </span>
              </div>
              
              <div className="flex flex-col gap-3">
                {jobs.map((job) => (
                  <div key={job.book} className="flex flex-col gap-2 rounded-xl bg-white/5 p-4 border border-white/10 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold text-[15px]">{job.book}</span>
                      
                      <div className="flex gap-2 items-center">
                         {(job.status === 'pending' || job.status === 'processing') && (
                            <button
                               onClick={() => cancelJob(job.book)}
                               className="text-xs font-bold px-2 py-1 rounded-md bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-white/50 transition-colors"
                            >
                               إلغاء
                            </button>
                         )}
                         <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                           job.status === 'done' ? 'bg-green-500/20 text-green-400' :
                           job.status === 'processing' ? 'bg-blue-500/20 text-[#38bdf8]' :
                           job.status === 'error' ? 'bg-red-500/20 text-red-400' :
                           job.status === 'cancelled' ? 'bg-yellow-500/20 text-yellow-400' :
                           'bg-white/10 text-white/40'
                         }`}>
                           {job.status === 'done' ? 'مكتمل ✅' :
                            job.status === 'processing' ? 'قيد المعالجة ⏳' :
                            job.status === 'error' ? 'حدث خطأ ❌' :
                            job.status === 'cancelled' ? 'تم الإلغاء 🚫' : 'في الانتظار'}
                         </span>
                      </div>
                    </div>
                    
                    {/* Active Progress Bar */}
                    {job.status === 'processing' && (
                      <div className="mt-2 flex flex-col gap-2">
                        <div className="flex justify-between text-xs text-white/50">
                          <span>{buildStatus?.is_building && buildStatus.current_book === job.book ? `${buildStatus.chunks_processed} / ${buildStatus.total_expected} درس` : 'جاري التحميل...'}</span>
                          <span>{job.progress || 0}%</span>
                        </div>
                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
                          <div 
                            className="absolute left-0 top-0 h-full bg-gradient-to-l from-[#38bdf8] to-[#10b981] transition-all duration-500 ease-out"
                            style={{ width: `${job.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Done Progress Bar */}
                    {job.status === 'done' && (
                      <div className="mt-2 relative h-1.5 w-full overflow-hidden rounded-full bg-white/10 opacity-50">
                         <div className="absolute left-0 top-0 h-full w-full bg-[#10b981]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
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
                              {builtBooks.has(book) && (
                                <span className="mr-auto text-[11px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                                  تم إنشاء الفهرس
                                </span>
                              )}
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
