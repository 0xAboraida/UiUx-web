import React from 'react';
import { X, BookOpen, ArrowLeft, Loader2 } from 'lucide-react';
import { BookMeta } from '../types/bookTypes';

interface BookDetailsModalProps {
  book: BookMeta | null;
  onClose: () => void;
  loadingInfo: boolean;
  modalInfoText: string | null;
  onReadBook: (book: BookMeta) => void;
  onAskBook?: (book: any) => void;
}

export default function BookDetailsModal({
  book,
  onClose,
  loadingInfo,
  modalInfoText,
  onReadBook,
}: BookDetailsModalProps) {
  if (!book) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white dark:bg-[#121624] rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute left-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          title="إغلاق النافذة"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-4 pr-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-magenta to-brand-deep text-white flex items-center justify-center shrink-0 shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug mb-1.5 line-clamp-2">
              {book.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-200">
                المؤلف: {book.author}
              </span>
              {book.category && (
                <span className="px-2 py-0.5 rounded-md bg-brand-magenta/10 text-brand-magenta font-bold border border-brand-magenta/20">
                  {book.category}
                </span>
              )}
              {book.century_name && book.century_name !== 'غير محدد' && (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
                  {book.century_name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 dark:bg-white/5 my-4" />

        {/* Content Body */}
        <div className="max-h-[50vh] overflow-y-auto pr-1 text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
          {loadingInfo ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-brand-magenta font-bold">
              <Loader2 className="w-7 h-7 animate-spin" />
              <span className="text-sm">جاري جلب تفاصيل وبطاقة الكتاب المطبوع...</span>
            </div>
          ) : (
            <div className="whitespace-pre-line bg-slate-50 dark:bg-white/[0.03] p-4 sm:p-5 rounded-2xl border border-slate-200/70 dark:border-white/10 font-sans leading-[2.2] text-[13px] sm:text-sm">
              {modalInfoText || 'لم تتوفر تفاصيل إضافية لهذا الكتاب حالياً.'}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
          <button
            onClick={() => {
              onClose();
              onReadBook(book);
            }}
            className="w-full py-3.5 px-6 rounded-2xl brand-gradient text-white font-bold text-sm sm:text-base hover:opacity-95 hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 flex items-center justify-center gap-3 active:scale-[0.98] group cursor-pointer"
            title="فتح الكتاب والتصفح في القارئ"
          >
            <BookOpen className="w-5 h-5 shrink-0 opacity-90 group-hover:scale-110 transition-transform duration-200" />
            <span>تصفح وقراءة الكتاب</span>
            <ArrowLeft className="w-5 h-5 shrink-0 group-hover:-translate-x-1.5 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </div>
  );
}
