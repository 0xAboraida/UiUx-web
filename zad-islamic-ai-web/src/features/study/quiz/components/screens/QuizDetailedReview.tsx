import { List, ChevronLeft, CheckCircle2, XCircle, Lightbulb, MessageCircle } from 'lucide-react'
import type { Question } from '../../../../../contexts/StudyContext'
import { isMatchingFullyAnswered, isMatchingCorrect } from '../../utils/quizEvaluator'
import { QuestionCardContent } from '../QuestionCardContent'

interface QuizDetailedReviewProps {
  localQuestions: Question[]
  selectedAnswers: Record<number, number>
  matchingAnswers: Record<number, Record<number, number>>
  shuffledMatchingOptions: Record<number, string[]>
  totalQuestions: number
  isDark: boolean
  onBack: () => void
  onDiscuss: (q: Question, wrongOptText: string) => void
}

export function QuizDetailedReview({
  localQuestions, selectedAnswers, matchingAnswers, shuffledMatchingOptions,
  totalQuestions, isDark, onBack, onDiscuss,
}: QuizDetailedReviewProps) {
  return (
    <div className="w-full flex flex-col items-center py-4" key="quiz-detailed-review" dir="rtl">
      <div className="w-full max-w-2xl space-y-4">
        {/* Sticky Header */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between backdrop-blur-md sticky top-0 z-20 shadow-md ${
          isDark ? 'bg-[#12041f]/90 border-white/10 text-white' : 'bg-white/90 border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center gap-2 font-bold text-sm">
            <List size={18} className="text-emerald-400" />
            <span>مراجعة إجابات الاختبار التفصيلية</span>
          </div>
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-md hover:bg-emerald-600 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>العودة للنتيجة</span>
          </button>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {localQuestions.map((q, idx) => {
            const selectedOpt = selectedAnswers[idx]
            const isAnswered = q.type === 'matching'
              ? isMatchingFullyAnswered(idx, q, matchingAnswers)
              : selectedOpt !== undefined
            const isCorrect = q.type === 'matching'
              ? isMatchingCorrect(idx, q, matchingAnswers, shuffledMatchingOptions)
              : (isAnswered && selectedOpt === q.correct_answer_index)

            return (
              <div
                key={idx}
                className={`p-5 rounded-3xl border shadow-lg space-y-3 ${
                  isDark ? 'bg-[#12041f]/80 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between gap-2 border-b border-current/10 pb-3">
                  <span className="text-xs font-bold text-emerald-400">سؤال {idx + 1} من {totalQuestions}</span>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1.5 ${
                    isCorrect
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    <span>{isCorrect ? 'إجابة صحيحة' : 'إجابة خاطئة'}</span>
                  </span>
                </div>

                <QuestionCardContent
                  q={q}
                  selectedOpt={selectedOpt}
                  isAnswered={isAnswered}
                  showFeedback={true}
                  isDark={isDark}
                  isReadOnly={true}
                  matchingSelections={matchingAnswers[idx] || {}}
                  shuffledRightOptions={shuffledMatchingOptions[idx] || []}
                  correctMatchingPairs={q.matching_pairs}
                />

                <div className={`p-4 rounded-2xl border text-xs leading-relaxed transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-white/90 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  <div className="flex items-center gap-1.5 text-amber-400 font-extrabold mb-1.5">
                    <Lightbulb size={16} className="text-amber-400 animate-pulse" />
                    <span>التوضيح والتفسير الشرعي:</span>
                  </div>
                  <p className="leading-relaxed opacity-90">{q.explanation}</p>
                </div>

                {!isCorrect && (
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => onDiscuss(
                        q,
                        selectedOpt !== undefined && q.options && q.options[selectedOpt]
                          ? q.options[selectedOpt]
                          : (q.type === 'matching' ? 'إجابات التوصيل والربط الخاصة بي' : 'لم يتم الإجابة')
                      )}
                      className="text-xs font-black text-[#38bdf8] hover:bg-[#38bdf8]/20 flex items-center gap-2 bg-[#38bdf8]/10 px-4 py-2 rounded-xl border border-[#38bdf8]/30 shadow-md shadow-[#38bdf8]/10 transition-all active:scale-95 cursor-pointer"
                    >
                      <MessageCircle size={15} />
                      <span>تناقش مع زاد حول هذا الإشكال</span>
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
