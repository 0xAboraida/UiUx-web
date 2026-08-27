import {
  ChevronLeft, ChevronRight, Award, MessageCircle,
  CheckCircle2, Lightbulb, LogOut
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Question } from '../../../../../contexts/StudyContext'
import { isMatchingFullyAnswered, isMatchingCorrect } from '../../utils/quizEvaluator'
import { QuestionCardContent } from '../QuestionCardContent'

interface QuizActiveViewProps {
  localQuestions: Question[]
  quizViewMode: 'stepper' | 'list'
  currentQuestionIndex: number
  setCurrentQuestionIndex: (idx: number) => void
  selectedAnswers: Record<number, number>
  setSelectedAnswers: (fn: (prev: Record<number, number>) => Record<number, number>) => void
  matchingAnswers: Record<number, Record<number, number>>
  setMatchingAnswers: (fn: (prev: Record<number, Record<number, number>>) => Record<number, Record<number, number>>) => void
  shuffledMatchingOptions: Record<number, string[]>
  feedbackMode: 'instant' | 'at_end'
  timerMode: 'untimed' | 'timed'
  isQuizCompleted: boolean
  answeredCount: number
  totalQuestions: number
  isDark: boolean
  onDiscuss: (q: Question, wrongOptText: string) => void
  onSubmit: () => void
  onExit?: () => void
}

export function QuizActiveView({
  localQuestions, quizViewMode,
  currentQuestionIndex, setCurrentQuestionIndex,
  selectedAnswers, setSelectedAnswers,
  matchingAnswers, setMatchingAnswers,
  shuffledMatchingOptions,
  feedbackMode, timerMode, isQuizCompleted,
  answeredCount, totalQuestions,
  isDark, onDiscuss, onSubmit, onExit,
}: QuizActiveViewProps) {

  // Helper to compute a sliding window of visible question pill indices (Max 5 at a time)
  const getVisiblePillIndices = (current: number, total: number, maxVisible: number = 5) => {
    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i)
    }
    const half = Math.floor(maxVisible / 2)
    let start = current - half
    let end = current + half

    if (start < 0) {
      start = 0
      end = maxVisible - 1
    }
    if (end >= total) {
      end = total - 1
      start = total - maxVisible
    }

    const indices: number[] = []
    for (let i = start; i <= end; i++) {
      indices.push(i)
    }
    return indices
  }

  const renderFeedbackBlock = (
    q: Question, idx: number, isAnswered: boolean, isCorrect: boolean, selectedOpt: number | undefined, showFeedback: boolean
  ) => {
    if (!isAnswered || !showFeedback) return null
    return (
      <div className={`mt-4 p-4 rounded-2xl border text-xs leading-relaxed animate-in fade-in duration-300 flex flex-col gap-2 ${
        isCorrect
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold flex items-center gap-1.5">
            {isCorrect ? (
              <><CheckCircle2 size={14} className="text-emerald-400" /><span>إجابة صحيحة! أحسنت 👏</span></>
            ) : (
              <><Lightbulb size={14} className="text-amber-400" /><span>إجابة خاطئة</span></>
            )}
          </p>
          <p className="mt-1 text-xs opacity-90">{q.explanation}</p>
        </div>
        {!isCorrect && (
          <button
            onClick={() => onDiscuss(
              q,
              selectedOpt !== undefined
                ? q.options[selectedOpt]
                : (q.type === 'matching' ? 'إجابات التوصيل والربط الخاصة بي' : 'لم يتم الإجابة')
            )}
            className="self-end text-xs font-bold text-[#38bdf8] hover:underline flex items-center gap-1.5 bg-[#38bdf8]/10 px-3 py-1.5 rounded-lg border border-[#38bdf8]/20 cursor-pointer"
          >
            <MessageCircle size={14} />
            <span>تناقش مع زاد حول هذا السؤال</span>
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-center justify-start min-h-full py-2" key="quiz-active">

      {quizViewMode === 'stepper' ? (
        // ─── STEPPER VIEW (Cards Mode) ───
        <div className="my-auto w-full flex flex-col items-center justify-center">
          {(() => {
            const safeQIdx = Math.min(Math.max(0, currentQuestionIndex), Math.max(0, totalQuestions - 1))
            const q = localQuestions[safeQIdx] || localQuestions[0]
            if (!q) return null
            const qIdx = safeQIdx

            const selectedOpt = selectedAnswers[qIdx]
            const isAnswered = q.type === 'matching'
              ? isMatchingFullyAnswered(qIdx, q, matchingAnswers)
              : selectedOpt !== undefined
            const showFeedback = ((feedbackMode === 'instant' && timerMode !== 'timed') || isQuizCompleted) && isAnswered
            const isCorrect = showFeedback && isAnswered && (
              q.type === 'matching'
                ? isMatchingCorrect(qIdx, q, matchingAnswers, shuffledMatchingOptions)
                : selectedOpt === q.correct_answer_index
            )

            const visibleIndices = getVisiblePillIndices(qIdx, totalQuestions, 5)

            return (
              <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4" dir="rtl">
                {/* Floating Question Number Navigator Pills (Right Side - Centered) */}
                <div className="flex flex-row md:flex-col items-center justify-center gap-2 shrink-0 self-center my-auto w-full md:w-auto" dir="rtl">
                  {visibleIndices[0] > 0 && (
                    <button
                      onClick={() => setCurrentQuestionIndex(visibleIndices[0] - 1)}
                      className="p-2 rounded-xl text-xs opacity-60 hover:opacity-100 transition-all cursor-pointer text-emerald-400 hover:bg-emerald-500/10"
                      title="الأسئلة السابقة"
                    >
                      <ChevronRight size={18} className="rotate-90 md:rotate-0" />
                    </button>
                  )}

                  {visibleIndices.map((dotIdx) => {
                    const dq = localQuestions[dotIdx]
                    if (!dq) return null
                    const isAns = dq.type === 'matching'
                      ? isMatchingFullyAnswered(dotIdx, dq, matchingAnswers)
                      : selectedAnswers[dotIdx] !== undefined
                    const isCurr = currentQuestionIndex === dotIdx
                    return (
                      <button
                        key={dotIdx}
                        onClick={() => setCurrentQuestionIndex(dotIdx)}
                        className={`w-9 h-9 rounded-2xl text-xs font-black transition-all duration-200 cursor-pointer flex items-center justify-center border shadow-sm ${
                          isCurr
                            ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white border-emerald-300 shadow-emerald-500/30 scale-110 ring-4 ring-emerald-500/20'
                            : isAns
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30 hover:scale-105'
                            : isDark
                            ? 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white hover:scale-105'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200 hover:scale-105'
                        }`}
                        title={`سؤال ${dotIdx + 1}`}
                      >
                        {dotIdx + 1}
                      </button>
                    )
                  })}

                  {visibleIndices[visibleIndices.length - 1] < totalQuestions - 1 && (
                    <button
                      onClick={() => setCurrentQuestionIndex(visibleIndices[visibleIndices.length - 1] + 1)}
                      className="p-2 rounded-xl text-xs opacity-60 hover:opacity-100 transition-all cursor-pointer text-emerald-400 hover:bg-emerald-500/10"
                      title="الأسئلة التالية"
                    >
                      <ChevronLeft size={18} className="rotate-90 md:rotate-0" />
                    </button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={qIdx}
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -16, scale: 0.98 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className={`p-6 md:p-8 rounded-3xl border shadow-2xl flex-1 max-w-2xl w-full relative overflow-hidden text-right ${
                      isDark
                        ? 'bg-[#12041f]/95 border-emerald-500/30 text-white shadow-emerald-500/10'
                        : 'bg-white border-emerald-200 text-slate-900 shadow-xl'
                    }`}
                    dir="rtl"
                  >

                <QuestionCardContent
                  q={q}
                  questionIndex={qIdx}
                  selectedOpt={selectedOpt}
                  onSelectOption={(optIdx) => setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
                  isAnswered={isAnswered}
                  showFeedback={showFeedback}
                  isDark={isDark}
                  matchingSelections={matchingAnswers[qIdx] || {}}
                  shuffledRightOptions={shuffledMatchingOptions[qIdx] || []}
                  correctMatchingPairs={q.matching_pairs}
                  onMatchingSelect={(leftIdx, rightIdx) =>
                    setMatchingAnswers(prev => ({ ...prev, [qIdx]: { ...(prev[qIdx] || {}), [leftIdx]: rightIdx } }))
                  }
                />

                {renderFeedbackBlock(q, qIdx, isAnswered, isCorrect, selectedOpt, showFeedback)}

                {/* Bottom Navigation */}
                <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-current/10">
                  <button
                    disabled={qIdx === 0}
                    onClick={() => setCurrentQuestionIndex(Math.max(0, qIdx - 1))}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      qIdx === 0
                        ? 'opacity-30 cursor-not-allowed border-transparent'
                        : isDark ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white cursor-pointer' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800 cursor-pointer'
                    }`}
                  >
                    <ChevronRight size={16} />
                    <span>السابق</span>
                  </button>

                  {/* Progress Indicator */}
                  <span className="text-[11px] font-bold text-emerald-400">
                    مُجاب {answeredCount} من {totalQuestions}
                  </span>

                  {qIdx < totalQuestions - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex(Math.min(totalQuestions - 1, qIdx + 1))}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>التالي</span>
                      <ChevronLeft size={16} />
                    </button>
                  ) : (
                    <button
                      disabled={answeredCount < totalQuestions}
                      onClick={onSubmit}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                        answeredCount < totalQuestions
                          ? 'opacity-40 bg-slate-500/20 text-slate-400 border border-slate-500/30 cursor-not-allowed'
                          : timerMode === 'timed'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-amber-500/25 cursor-pointer animate-pulse'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-emerald-500/25 cursor-pointer'
                      }`}
                      title={answeredCount < totalQuestions ? `أجب على كافة الأسئلة أولاً` : timerMode === 'timed' ? 'تسليم قبل انتهاء الوقت' : 'تسليم والتقييم'}
                    >
                      <Award size={14} />
                      <span>{timerMode === 'timed' ? 'تسليم مبكر' : 'تسليم'}</span>
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          )
          })()}
        </div>
      ) : (
        // ─── LIST VIEW ───
        <div className="space-y-6 w-full max-w-3xl mx-auto pb-6 flex flex-col items-center">

          {localQuestions.map((q, idx) => {
            const selectedOpt = selectedAnswers[idx]
            const isAnswered = q.type === 'matching'
              ? isMatchingFullyAnswered(idx, q, matchingAnswers)
              : selectedOpt !== undefined
            const showFeedback = ((feedbackMode === 'instant' && timerMode !== 'timed') || isQuizCompleted) && isAnswered
            const isCorrect = showFeedback && isAnswered && (
              q.type === 'matching'
                ? isMatchingCorrect(idx, q, matchingAnswers, shuffledMatchingOptions)
                : selectedOpt === q.correct_answer_index
            )

            return (
              <div
                key={idx}
                className={`p-6 md:p-8 rounded-3xl border shadow-lg space-y-4 w-full max-w-2xl text-right ${
                  isDark ? 'bg-[#12041f]/90 border-emerald-500/30 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
                dir="rtl"
              >
                <QuestionCardContent
                  q={q}
                  questionIndex={idx}
                  selectedOpt={selectedOpt}
                  onSelectOption={(optIdx) => setSelectedAnswers((prev) => ({ ...prev, [idx]: optIdx }))}
                  isAnswered={isAnswered}
                  showFeedback={showFeedback}
                  isDark={isDark}
                  matchingSelections={matchingAnswers[idx] || {}}
                  shuffledRightOptions={shuffledMatchingOptions[idx] || []}
                  correctMatchingPairs={q.matching_pairs}
                  onMatchingSelect={(leftIdx, rightIdx) =>
                    setMatchingAnswers(prev => ({ ...prev, [idx]: { ...(prev[idx] || {}), [leftIdx]: rightIdx } }))
                  }
                />

                {renderFeedbackBlock(q, idx, isAnswered, isCorrect, selectedOpt, showFeedback)}
              </div>
            )
          })}

          {/* List Submit Button */}
          <div className="flex flex-col items-center gap-2 pt-4 border-t border-current/10 w-full max-w-2xl mt-4" dir="rtl">
            <button
              disabled={answeredCount < totalQuestions}
              onClick={onSubmit}
              className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl text-xs font-black transition-all shadow-lg active:scale-95 ${
                answeredCount < totalQuestions
                  ? 'opacity-40 bg-slate-500/20 text-slate-400 border border-slate-500/30 cursor-not-allowed'
                  : timerMode === 'timed'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-amber-500/25 cursor-pointer'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-emerald-500/25 cursor-pointer'
              }`}
              title={answeredCount < totalQuestions ? `يجب الإجابة على كافة الأسئلة (${answeredCount}/${totalQuestions})` : timerMode === 'timed' ? 'تسليم قبل انتهاء الوقت' : 'تسليم والتقييم'}
            >
              <Award size={16} />
              <span>{
                answeredCount < totalQuestions
                  ? `أكمل الإجابات لتسليم الاختبار (${answeredCount}/${totalQuestions})`
                  : timerMode === 'timed'
                  ? 'تسليم مبكر قبل انتهاء الوقت'
                  : 'تسليم والتقييم'
              }</span>
            </button>
            {timerMode === 'timed' && answeredCount === totalQuestions && (
              <p className="text-[10px] text-amber-400/70 font-bold">
                ℹ️ يمكنك الانتظار حتى نهاية الوقت أو التسليم مبكراً
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
