import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TextareaAutosize from 'react-textarea-autosize'
import VoiceChatButton from '../../../components/ui/VoiceChatButton'
import VoiceRecordButton from '../../../components/ui/VoiceRecordButton'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { Scale, HeartHandshake, BookOpenText, Moon, Landmark, Languages, BookOpen, ChevronUp } from 'lucide-react'
import whiteLogo from '@/assets/images/WhiteLogo.png'
import zadDarkLogo from '@/assets/images/ZadDarkLogo.png'

const DOMAINS = [
  { id: 0, name: 'تلقائي', isZadIcon: true },
  { id: 1, name: 'الفقه', icon: <Scale className="h-4 w-4" /> },
  { id: 2, name: 'العقيدة', icon: <HeartHandshake className="h-4 w-4" /> },
  { id: 3, name: 'السيرة', icon: <Moon className="h-4 w-4" /> },
  { id: 4, name: 'التفسير', icon: <BookOpenText className="h-4 w-4" /> },
  { id: 5, name: 'الحديث', icon: <BookOpenText className="h-4 w-4" /> },
  { id: 6, name: 'علوم القرآن', icon: <BookOpen className="h-4 w-4" /> },
  { id: 7, name: 'التاريخ', icon: <Landmark className="h-4 w-4" /> },
  { id: 8, name: 'علوم اللغة', icon: <Languages className="h-4 w-4" /> },
]

export function ChatInput({
  input,
  setInput,
  send,
  dark,
  onOpenVoice,
  setFocused,
  mode,
  setMode
}: {
  input: string
  setInput: (v: string) => void
  send: () => void
  dark: boolean
  onOpenVoice: () => void
  setFocused: (v: boolean) => void
  mode: number
  setMode: (m: number) => void
}) {
  const [baseInput, setBaseInput] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition()

  useEffect(() => {
    if (listening) {
      const newText = baseInput ? `${baseInput} ${transcript}` : transcript
      setInput(newText.trim())
    }
  }, [transcript, listening, baseInput])

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const selectedDomain = DOMAINS.find(d => d.id === mode) || DOMAINS[0]

  return (
    <div className="flex flex-col items-center px-4 pb-8 z-10 relative mt-auto w-full">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -100, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: [1, 1.02, 1]
              }}
              exit={{ opacity: 0, y: -100, scale: 0.9 }}
              transition={{ 
                y: { type: "spring", stiffness: 400, damping: 25 },
                scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                opacity: { duration: 0.3 }
              }}
              className={`fixed top-10 left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-5 py-2.5 rounded-full border backdrop-blur-md shadow-2xl z-[100] whitespace-nowrap ${dark
                  ? 'bg-[#1a0730]/90 border-brand-magenta/40 text-white/90 shadow-[0_5px_25px_rgba(168,85,247,0.4)]'
                  : 'bg-white/95 border-primary/30 text-brand-deep shadow-[0_5px_25px_rgba(40,10,70,0.15)]'
                }`}
            >
              <div className={`flex items-center justify-center p-1 rounded-full ${dark ? 'bg-brand-magenta/20' : 'bg-primary/10'}`}>
                <img src={zadDarkLogo} alt="Zad" className="h-4 w-4 object-contain" />
              </div>
              <span className="font-sans font-medium text-[13px]">{notification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
          className="flex w-full items-end gap-3"
        >
          {/* Premium Domain Selector - Positioned to the right of the input bar with matching styling */}
          <div className="relative flex justify-start z-20 shrink-0" ref={dropdownRef}>
            <div className="gradient-border rounded-[24px] p-[2.5px] shadow-xl shadow-primary/25 transition-all duration-300">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`group flex items-center gap-2.5 px-4 h-[60px] rounded-[22px] transition-all duration-500 ease-out ${dark
                    ? 'bg-[#1a0730]/90 backdrop-blur-md text-white/90 hover:bg-[#1a0730]'
                    : 'bg-white/95 backdrop-blur-md text-brand-deep hover:bg-white'
                  }`}
              >
                <div className={`flex items-center justify-center p-1.5 rounded-xl transition-colors duration-300 ${dark ? 'bg-brand-magenta/20 text-brand-magenta group-hover:bg-brand-magenta/30' : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                  }`}>
                  {selectedDomain.isZadIcon ? (
                    <img src={zadDarkLogo} alt="Zad" className="h-5 w-5 object-contain opacity-90 drop-shadow-md" />
                  ) : (
                    selectedDomain.icon
                  )}
                </div>
                <span className="font-sans font-semibold text-sm tracking-wide">
                  {selectedDomain.id === 0 ? 'تلقائي' : selectedDomain.name}
                </span>
                <ChevronUp className={`w-4 h-4 mr-1 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isDropdownOpen ? 'rotate-180' : 'rotate-0 opacity-70'}`} />
              </button>
            </div>

            {/* Glowing Dropdown Menu - Single Column */}
            <div className={`absolute bottom-full -right-4 mb-3 w-[220px] rounded-3xl border backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] origin-bottom-right ${isDropdownOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
              } ${dark
                ? 'bg-[#0f041c]/95 border-brand-magenta/20 shadow-[0_15px_50px_-10px_rgba(168,85,247,0.3)]'
                : 'bg-white/95 border-primary/10 shadow-2xl'
              }`}>
              <div className="p-3">
                <div className={`mb-3 px-2 text-sm text-center font-bold font-sans ${dark ? 'text-white/80 border-b border-white/10 pb-2' : 'text-brand-deep/80 border-b border-black/10 pb-2'}`}>
                  اختر مجال العلم الشرعي
                </div>
                <div className="flex flex-col gap-1">
                  {DOMAINS.map(d => {
                    const isActive = mode === d.id
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => { 
                          setMode(d.id); 
                          setIsDropdownOpen(false);
                          if (d.id === 0) {
                            setNotification("سوف يقوم زاد باختيار المجال المناسب لسؤالك تلقائياً");
                          } else if (d.name.includes("علوم")) {
                            setNotification(`سوف يتم البحث عن سؤالك في الكتب المختصة بـ ${d.name}`);
                          } else {
                            setNotification(`سوف يتم البحث عن سؤالك في الكتب المختصة بعلم ${d.name}`);
                          }
                        }}
                        className={`flex items-center gap-3 p-2.5 rounded-2xl transition-all duration-300 text-right group ${isActive
                            ? dark
                              ? 'bg-gradient-to-r from-brand-magenta/20 to-purple-500/10 text-white border border-brand-magenta/40 shadow-[inset_0_0_20px_rgba(168,85,247,0.15)]'
                              : 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/30 shadow-sm'
                            : dark
                              ? 'hover:bg-white/5 text-white/80 border border-transparent hover:border-white/10'
                              : 'hover:bg-black/5 text-brand-deep/80 border border-transparent hover:border-black/5'
                          }`}
                      >
                        <div className={`flex items-center justify-center p-2 rounded-xl transition-all duration-300 ${isActive
                            ? (dark ? 'bg-brand-magenta/30 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-primary/20 text-primary')
                            : (dark ? 'bg-white/5 group-hover:bg-white/10 text-brand-magenta' : 'bg-black/5 group-hover:bg-black/10 text-primary')
                          }`}>
                          {d.isZadIcon ? (
                            <img src={zadDarkLogo} alt="Zad" className="h-5 w-5 object-contain drop-shadow-sm" />
                          ) : (
                            d.icon
                          )}
                        </div>
                        <span className={`text-sm font-sans font-semibold transition-colors duration-300 ${isActive ? '' : (dark ? 'group-hover:text-white' : 'group-hover:text-primary')}`}>
                          {d.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Main Input Bar */}
          <div className="gradient-border min-w-0 flex-1 rounded-[24px] p-[2.5px] shadow-xl shadow-primary/25 transition-all duration-300">
            <div
              className={`flex items-end gap-2 rounded-[22px] py-2 pr-5 pl-2 transition-all duration-300 ${dark ? 'bg-[#1a0730]/90 backdrop-blur-md' : 'bg-white/95 backdrop-blur-md'
                }`}
            >
              <VoiceRecordButton
                listening={listening}
                dark={dark}
                browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
                onClick={() => {
                  if (listening) {
                    SpeechRecognition.stopListening()
                  } else {
                    setBaseInput(input)
                    resetTranscript()
                    SpeechRecognition.startListening({ language: 'ar-SA', continuous: true })
                  }
                }}
              />
              <TextareaAutosize
                minRows={1}
                maxRows={4}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                placeholder="اكتب سؤالك الشرعي هنا…"
                aria-label="اكتب سؤالك"
                className={`font-sans min-w-0 flex-1 resize-none bg-transparent py-2.5 text-base outline-none placeholder:text-current/50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${dark ? 'text-white placeholder:text-white/50' : 'text-brand-deep placeholder:text-brand-deep/45'
                  }`}
              />
              <button
                type="submit"
                aria-label="اسأل زاد"
                disabled={!input.trim()}
                className="brand-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 disabled:hover:translate-y-0"
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

          {/* Voice-chat button */}
          <VoiceChatButton onClick={onOpenVoice} className="shrink-0 h-[60px] w-[60px]" />
        </form>
      </div>
    </div>
  )
}
