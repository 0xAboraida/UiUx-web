import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Volume2, VolumeX, Copy, Check, Pause, Play, Square, Loader2, Gauge, Download } from 'lucide-react'
import {
  speakText,
  stopAllSpeech,
  pauseSpeech,
  resumeSpeech,
  setMuteState,
  setPlaybackSpeed,
  setVoiceName,
  getVoiceName,
  downloadAudioFile,
  AVAILABLE_VOICES,
  VoiceName
} from '@/services/geminiTtsService'

interface TextSelectionToolbarProps {
  dark?: boolean
}

const SPEED_OPTIONS = [1.0, 1.25, 1.5, 2.0, 0.8]

export function TextSelectionToolbar({ dark = true }: TextSelectionToolbarProps) {
  const [selectedText, setSelectedText] = useState('')
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const [copied, setCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Audio State
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentSpeed, setCurrentSpeed] = useState(1.0)
  const [currentVoice, setCurrentVoice] = useState<VoiceName>(getVoiceName())
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [showVoiceMenu, setShowVoiceMenu] = useState(false)

  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) {
        if (!isPlaying && !isPaused && !isLoading) {
          setPosition(null)
          setSelectedText('')
        }
        return
      }

      const text = selection.toString().trim()
      if (text.length < 2) return

      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      if (rect.width === 0 || rect.height === 0) return

      // Fixed positioning is relative to viewport (no window.scrollY needed)
      const top = rect.top < 60 ? rect.bottom + 8 : rect.top - 52
      const left = Math.max(16, Math.min(window.innerWidth - 260, rect.left + rect.width / 2 - 110))

      setSelectedText(text)
      setPosition({ top, left })
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    document.addEventListener('mouseup', handleSelectionChange)
    document.addEventListener('touchend', handleSelectionChange)
    document.addEventListener('keyup', handleSelectionChange)

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('mouseup', handleSelectionChange)
      document.removeEventListener('touchend', handleSelectionChange)
      document.removeEventListener('keyup', handleSelectionChange)
    }
  }, [isPlaying, isPaused, isLoading])

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (isPlaying) {
        stopAllSpeech()
      }
    }
  }, [isPlaying])

  // Dismiss menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setShowSpeedMenu(false)
        setShowVoiceMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!position || !selectedText) return null

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(selectedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const triggerDownloadConfirmation = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowConfirmModal(true)
  }

  const executeConfirmedDownload = async () => {
    setShowConfirmModal(false)
    if (!selectedText || isDownloading) return
    setIsDownloading(true)
    try {
      const ok = await downloadAudioFile(selectedText, 'زاد_مقطع_محدد.wav', currentVoice)
      if (ok) {
        setIsDownloaded(true)
        setTimeout(() => setIsDownloaded(false), 3000)
      }
    } catch (err) {
      console.error('Failed to download audio selection:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleStartOrToggleSpeech = async (overrideVoice?: VoiceName) => {
    if (!selectedText) return

    if (isPaused && !overrideVoice) {
      resumeSpeech()
      setIsPaused(false)
      setIsPlaying(true)
      return
    }

    if (isPlaying && !overrideVoice) {
      pauseSpeech()
      setIsPaused(true)
      return
    }

    const voiceToUse = overrideVoice || currentVoice

    setIsLoading(true)
    setIsMuted(false)
    setIsPaused(false)
    setMuteState(false)
    setPlaybackSpeed(currentSpeed)

    try {
      await speakText(selectedText, {
        voiceName: voiceToUse,
        playbackRate: currentSpeed,
        onStart: () => {
          setIsLoading(false)
          setIsPlaying(true)
          setIsPaused(false)
        },
        onEnd: () => {
          setIsPlaying(false)
          setIsPaused(false)
          setIsLoading(false)
          setIsMuted(false)
        },
        onError: (err) => {
          console.error('Selection audio playback error:', err)
          setIsPlaying(false)
          setIsPaused(false)
          setIsLoading(false)
          setIsMuted(false)
        },
      })
    } catch (err) {
      console.error('Failed to speak selected text:', err)
      setIsPlaying(false)
      setIsPaused(false)
      setIsLoading(false)
      setIsMuted(false)
    }
  }

  const handleFullStopSpeech = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    stopAllSpeech()
    setIsPlaying(false)
    setIsPaused(false)
    setIsLoading(false)
    setIsMuted(false)
    setShowSpeedMenu(false)
    setShowVoiceMenu(false)
  }

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    const nextMute = !isMuted
    setIsMuted(nextMute)
    setMuteState(nextMute)
  }

  const handleSelectSpeed = (speed: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentSpeed(speed)
    setPlaybackSpeed(speed)
    setShowSpeedMenu(false)
  }

  const handleSelectVoice = (voiceId: VoiceName, e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentVoice(voiceId)
    setVoiceName(voiceId)
    setShowVoiceMenu(false)

    if (isPlaying || isPaused) {
      handleStartOrToggleSpeech(voiceId)
    }
  }

  const selectedVoiceObj = AVAILABLE_VOICES.find(v => v.id === currentVoice) || AVAILABLE_VOICES[0]

  return (
    <div
      ref={toolbarRef}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      className="fixed z-[9999] animate-in fade-in zoom-in-95 duration-150 select-none"
    >
      <div
        className={`flex items-center gap-1.5 p-1.5 rounded-2xl shadow-2xl border backdrop-blur-xl ${
          dark
            ? 'bg-slate-900/95 border-emerald-500/40 text-slate-100 shadow-emerald-950/40'
            : 'bg-white border-emerald-400/80 text-slate-900 shadow-2xl ring-1 ring-emerald-400/20'
        }`}
      >
        {isPlaying || isPaused ? (
          /* Active Playing Controls */
          <div className="flex items-center gap-1.5">
            {/* Play/Pause Button */}
            <button
              onClick={() => handleStartOrToggleSpeech()}
              type="button"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                dark
                  ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30'
                  : 'text-emerald-900 bg-emerald-100 border border-emerald-300 hover:bg-emerald-200'
              }`}
            >
              {isPaused ? <Play size={13} className="fill-amber-500 text-amber-500" /> : <Pause size={13} className="fill-emerald-600 text-emerald-600" />}
              <span>{isPaused ? 'استئناف' : 'مؤقت'}</span>
            </button>

            {/* Voice Switcher */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowVoiceMenu(!showVoiceMenu)
                setShowSpeedMenu(false)
              }}
              type="button"
              className={`px-2 py-1 rounded-xl text-xs font-bold transition-all ${
                dark
                  ? 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20'
                  : 'text-emerald-900 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <span>{selectedVoiceObj.name}</span>
            </button>

            {/* Mute Toggle */}
            <button
              onClick={handleToggleMute}
              type="button"
              className={`p-1.5 rounded-xl text-xs font-bold transition-all ${
                dark ? 'text-emerald-400 hover:bg-emerald-500/20' : 'text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {isMuted ? <VolumeX size={14} className="text-amber-500" /> : <Volume2 size={14} />}
            </button>

            {/* Speed Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowSpeedMenu(!showSpeedMenu)
                setShowVoiceMenu(false)
              }}
              type="button"
              className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-extrabold transition-all ${
                dark
                  ? 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20'
                  : 'text-emerald-900 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <Gauge size={12} className={dark ? "text-emerald-400" : "text-emerald-700"} />
              <span>{currentSpeed}x</span>
            </button>

            {/* Download Button */}
            <button
              onClick={triggerDownloadConfirmation}
              type="button"
              title="تحميل المقطع الصوتي كـ WAV"
              className={`p-1.5 rounded-xl text-xs font-bold transition-all ${
                dark ? 'text-emerald-400 hover:bg-emerald-500/20' : 'text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {isDownloading ? (
                <Loader2 size={13} className={`animate-spin ${dark ? 'text-emerald-400' : 'text-emerald-700'}`} />
              ) : isDownloaded ? (
                <Check size={13} className={dark ? 'text-emerald-400' : 'text-emerald-700'} />
              ) : (
                <Download size={13} />
              )}
            </button>

            {/* Stop Button */}
            <button
              onClick={handleFullStopSpeech}
              type="button"
              className={`p-1.5 rounded-xl text-xs font-bold transition-all ${
                dark ? 'text-rose-400 hover:bg-rose-500/20' : 'text-rose-600 hover:bg-rose-100'
              }`}
            >
              <Square size={12} className="fill-current" />
            </button>
          </div>
        ) : (
          /* Idle Action Menu (Listen + Copy Only) */
          <div className="flex items-center gap-1">
            {/* Listen to Selection Button */}
            <button
              onClick={() => handleStartOrToggleSpeech()}
              type="button"
              disabled={isLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-sm ${
                dark
                  ? 'text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30'
                  : 'text-white bg-emerald-600 border border-emerald-700 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              {isLoading ? (
                <Loader2 size={14} className={`animate-spin ${dark ? 'text-emerald-400' : 'text-white'}`} />
              ) : (
                <Volume2 size={14} className={dark ? 'text-emerald-400' : 'text-white'} />
              )}
              <span>{isLoading ? 'جاري التحميل...' : 'استمع لهذا الجزء'}</span>
            </button>

            <div className={`h-4 w-[1px] my-auto mx-1 ${dark ? 'bg-slate-700/50' : 'bg-slate-300'}`} />

            {/* Copy Selection Button */}
            <button
              onClick={handleCopy}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dark
                  ? 'text-slate-300 hover:text-white hover:bg-white/10'
                  : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200/80'
              }`}
            >
              {copied ? (
                <>
                  <Check size={14} className={dark ? "text-emerald-400" : "text-emerald-600"} />
                  <span className={dark ? "text-emerald-400" : "text-emerald-600"}>تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy size={14} className={dark ? "text-slate-300" : "text-slate-600"} />
                  <span>نسخ</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Speed Dropdown Menu */}
      {showSpeedMenu && (
        <div
          className={`absolute bottom-full mb-1.5 right-0 z-[10000] p-1.5 rounded-xl shadow-2xl border flex gap-1 animate-in fade-in zoom-in-95 ${
            dark ? 'bg-slate-900/95 border-emerald-500/40 text-slate-200 backdrop-blur-md' : 'bg-white border-emerald-200 text-slate-800'
          }`}
        >
          {SPEED_OPTIONS.map((speed) => (
            <button
              key={speed}
              onClick={(e) => handleSelectSpeed(speed, e)}
              type="button"
              className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                currentSpeed === speed
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : dark
                  ? 'hover:bg-slate-800 text-slate-300'
                  : 'hover:bg-emerald-50 text-emerald-900'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      )}

      {/* Voice Dropdown Menu */}
      {showVoiceMenu && (
        <div
          className={`absolute bottom-full mb-1.5 right-0 z-[10000] w-52 p-2 rounded-2xl shadow-2xl border flex flex-col gap-1 animate-in fade-in zoom-in-95 ${
            dark ? 'bg-slate-900/95 border-emerald-500/40 text-slate-100 backdrop-blur-md' : 'bg-white border-emerald-200 text-slate-800'
          }`}
        >
          <div className="px-2 py-1 text-[11px] font-bold text-emerald-400 border-b border-emerald-500/20 mb-1">
            اختر صوت المعلم:
          </div>
          {AVAILABLE_VOICES.map((v) => (
            <button
              key={v.id}
              onClick={(e) => handleSelectVoice(v.id, e)}
              type="button"
              className={`flex flex-col text-right p-2 rounded-xl transition-all ${
                currentVoice === v.id
                  ? 'bg-emerald-500/25 border border-emerald-500/40 text-emerald-200'
                  : dark
                  ? 'hover:bg-slate-800 text-slate-300'
                  : 'hover:bg-emerald-50 text-slate-700'
              }`}
            >
              <span className="text-xs font-bold">{v.name}</span>
              <span className="text-[10px] text-slate-400 font-medium">{v.description}</span>
            </button>
          ))}
        </div>
      )}

      {/* Download Confirmation Modal anchored globally to document.body */}
      {showConfirmModal &&
        createPortal(
          <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
              className={`w-full max-w-sm rounded-3xl border p-6 shadow-2xl backdrop-blur-xl transform transition-all duration-300 scale-100 text-center ${
                dark ? 'bg-[#18082c]/95 border-emerald-500/40 text-white' : 'bg-white border-emerald-200 text-slate-900'
              }`}
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Download size={28} />
              </div>

              <h3 className="mb-2 font-display text-lg font-bold">تأكيد تحميل الجزء المحدد</h3>

              <p className="mb-6 text-sm leading-relaxed opacity-90">
                هل أنت تأكد من رغبتك في تحميل هذا المقطع الصوتي بصوت المعلم <span className="font-bold text-emerald-400">"{selectedVoiceObj.name}"</span>؟
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  type="button"
                  className={`flex-1 rounded-xl border py-2.5 text-xs font-bold transition-all ${
                    dark
                      ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                      : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  إلغاء
                </button>
                <button
                  onClick={executeConfirmedDownload}
                  type="button"
                  className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition-all hover:scale-[1.02]"
                >
                  نعم، تحميل
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

export default TextSelectionToolbar
