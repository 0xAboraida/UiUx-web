import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { User, BookOpen, Book, ExternalLink, ChevronDown, ChevronLeft, LayoutGrid, FileText, Feather, Copy, Check, Download, Loader2 } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { toCanvas } from 'html-to-image'
import whiteLogo from '@/assets/images/WhiteLogo.png'
import zadDarkLogo from '@/assets/images/ZadDarkLogo.png'
import type { Message, CitationDTO } from '../data'
import { exportMessageToPdf } from '@/utils/pdfExporter'
import { useStudy } from '@/contexts/StudyContext'
import { AudioReaderButton } from '@/components/common/AudioReaderButton'

function AvatarLogo({ dark }: { dark: boolean }) {
  return (
    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center -mt-2">
      <span
        className="absolute inset-0 rounded-full blur-[7px] opacity-90"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0%, rgba(192,32,240,0.8) 40%, rgba(168,85,247,0.9) 60%, transparent 100%)',
        }}
      />
      <div
        className={`relative flex h-full w-full items-center justify-center rounded-full z-10 ${dark ? 'bg-[#0f041c]/80 backdrop-blur-xl border border-white/20' : 'bg-white border border-primary/20'
          }`}
        style={{ boxShadow: '0 0 12px rgba(168,85,247, 0.55)' }}
      >
        <img src={dark ? whiteLogo : zadDarkLogo} alt="Zad" className="h-7 w-7 object-contain drop-shadow-md" />
      </div>
    </div>
  )
}

function parseTextIntoFrames(text: string): { content: string, children: string[] }[] {
  if (!text) return [];

  const lines = text.split('\n');
  const frames: { content: string, children: string[] }[] = [];

  let currentMainContent: string[] = [];
  let currentChildren: string[][] = [];
  let currentChildContent: string[] = [];

  let writingToChild = false;
  let inCodeBlock = false;

  const commitMainFrame = () => {
    if (currentChildContent.length > 0 && currentChildContent.some(l => l.trim().length > 0)) {
      currentChildren.push([...currentChildContent]);
    }
    currentChildContent = [];

    if (
      (currentMainContent.length > 0 && currentMainContent.some(l => l.trim().length > 0)) ||
      currentChildren.length > 0
    ) {
      frames.push({
        content: currentMainContent.join('\n'),
        children: currentChildren.map(c => c.join('\n'))
      });
    }

    currentMainContent = [];
    currentChildren = [];
    writingToChild = false;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      if (writingToChild) {
        currentChildContent.push(line);
      } else {
        currentMainContent.push(line);
      }
      continue;
    }

    if (!inCodeBlock) {
      const isH2orH3 = /^(#{2,3})(?:\s+|[0-9]+\.|[\u0600-\u06FF]+\.)/.test(trimmed);
      const isH4 = /^####(?:\s+|[0-9]+\.|[\u0600-\u06FF]+\.)/.test(trimmed);

      if (isH2orH3 || isH4) {
        const isNumbered = /^(#{2,4})\s*(?:[0-9]+|[\u0600-\u06FF])\./.test(trimmed);

        if (isH4 || isNumbered) {
          if (currentChildContent.length > 0 && currentChildContent.some(l => l.trim().length > 0)) {
            currentChildren.push([...currentChildContent]);
          }
          currentChildContent = [line];
          writingToChild = true;
        } else {
          commitMainFrame();
          currentMainContent.push(line);
        }
        continue;
      }
    }

    if (writingToChild) {
      currentChildContent.push(line);
    } else {
      currentMainContent.push(line);
    }
  }

  commitMainFrame();
  return frames;
}

function autoIndentSubLists(text: string): string {
  if (!text) return text;
  const lines = text.split('\n');
  const result: string[] = [];

  const parentStack: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^([ \t]*)([\*\-\+]|\d+\.|[\u0600-\u06FF]\.)[ \t]+(.*)$/);

    if (match) {
      const origIndent = match[1].length;
      const marker = match[2];
      const content = match[3].trim();

      const cleanContent = content.replace(/[\*\_\s]+$/g, '');
      const colonIdx = content.search(/[:؛]/);
      let isHeaderTitleBullet = false;

      if (colonIdx !== -1) {
        const afterColon = content.slice(colonIdx + 1).replace(/[\*\_\s]+/g, '');
        if (afterColon.length === 0 && /[:؛]$/.test(cleanContent)) {
          isHeaderTitleBullet = true;
        }
      }

      let levelFromIndent = 0;
      if (origIndent > 0) {
        if (origIndent <= 3) levelFromIndent = 1;
        else if (origIndent <= 6) levelFromIndent = 1;
        else if (origIndent <= 10) levelFromIndent = 2;
        else if (origIndent <= 14) levelFromIndent = 3;
        else levelFromIndent = Math.floor(origIndent / 4);
      }

      let effectiveLevel = levelFromIndent;

      if (origIndent === 0 && parentStack.length > 0) {
        effectiveLevel = parentStack.length;
      }

      while (parentStack.length > 0 && effectiveLevel <= parentStack[parentStack.length - 1]) {
        parentStack.pop();
      }

      const indentStr = '    '.repeat(effectiveLevel);
      result.push(`${indentStr}${marker} ${content}`);

      if (isHeaderTitleBullet) {
        parentStack.push(effectiveLevel);
      }
    } else {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('>') || trimmed.startsWith('```')) {
        parentStack.length = 0;
      }
      result.push(line);
    }
  }

  return result.join('\n');
}

function preprocessFrameText(frameStr: string): string {
  let text = frameStr;

  // ------------------------------------------------------------
  // Hierarchy:
  // ### = main frame
  // ##  = internal subsection
  // #### = internal detail
  // ------------------------------------------------------------

  // Remove standalone lines containing only a period or dot
  text = text.replace(/^\s*[\.\u06D4]\s*$/gm, '');

  // 1. Fix missing spaces in headings (e.g., ###1. -> ### 1., ###أ. -> ### أ.)
  text = text.replace(/^(#{1,4})([0-9]+\.|[\u0600-\u06FF]+\.)/gm, '$1 $2');

  // Normalize extra spaces after list bullet markers (e.g. "*   **Title**" -> "* **Title**")
  text = text.replace(/^([ \t]*[\*\-\+]|\d+\.|\w+\.)[ \t]{2,}/gm, '$1 ');

  // 2. Fix squashed text where the AI puts lists or headings on the same line as previous text
  text = text.replace(/([^\s#])[ \t]+(#{1,4}[ \t]+)/g, '$1\n\n$2'); // Headings
  text = text.replace(/([^\s#])[ \t]+([0-9]+\.[ \t]+\*\*)/g, '$1\n\n$2'); // Numbered lists (with bold title)
  text = text.replace(/([^\s#])[ \t]+([\u0600-\u06FF]\.[ \t]+\*\*)/g, '$1\n\n$2'); // Alphabet lists (with bold title)
  text = text.replace(/\*\*((?:الخلاص[ةه]|توضيح|ملاحظ[ةه]|تنبيه|فائدة).*?)\*\*/g, '**ZAD_BADGE_$1**');
  text = text.replace(/([^\s#])[ \t]+(\*[ \t]+\*\*)/g, '$1\n\n$2'); // Bullet lists (with bold title)
  text = text.replace(/([^\s#])[ \t]+(-[ \t]+\*\*)/g, '$1\n\n$2'); // Dash lists (with bold title)

  // Ensure bold sub-headings on standalone lines are followed by double newlines (\n\n) so subsequent text starts on a new line
  text = text.replace(/^([ \t]*\*\*[^\*\r\n]+\*\*[: \t]*)\n(?!\n)/gm, '$1\n\n');

  // Remove horizontal rules generated by AI (--- or ___)
  text = text.replace(/^[\-_]{3,}\s*$/gm, '');

  // Qur'an: &Ayah& -> tagged blockquote (supports multiple on same line)
  text = text.replace(/^([ \t]*)(.*?)&([^&\r\n]+)&(?:[ \t]*(?:\r?\n[ \t]*)?\^([^\^\r\n]+)\^)?(.*)$/gm, (match, indent, before, quote, ref, after) => {
    let res = '';
    if (before.trim()) res += `${indent}${before.trim()}\n\n`;
    res += `\n${indent}> [QURAN] ${quote.trim()}`;
    if (ref) res += `  \n${indent}> *__REF__${ref.trim()}*`;
    res += '\n';
    const cleanAfter = (after || '').replace(/^[.\u06D4\s]+/, '');
    if (cleanAfter.trim()) res += `\n${indent}${cleanAfter.trim()}\n\n`;
    return res;
  });

  // Hadith: %Hadith% -> tagged blockquote (supports multiple on same line)
  text = text.replace(/^([ \t]*)(.*?)%([^%\r\n]+)%(?:[ \t]*(?:\r?\n[ \t]*)?\^([^\^\r\n]+)\^)?(.*)$/gm, (match, indent, before, quote, ref, after) => {
    let res = '';
    if (before.trim()) res += `${indent}${before.trim()}\n\n`;
    res += `\n${indent}> [HADITH] ${quote.trim()}`;
    if (ref) res += `  \n${indent}> *__REF__${ref.trim()}*`;
    res += '\n';
    const cleanAfter = (after || '').replace(/^[.\u06D4\s]+/, '');
    if (cleanAfter.trim()) res += `\n${indent}${cleanAfter.trim()}\n\n`;
    return res;
  });

  // Scholars' sayings: @Saying@ -> tagged blockquote (supports multiple on same line)
  text = text.replace(/^([ \t]*)(.*?)@([^@\r\n]+)@(?:[ \t]*(?:\r?\n[ \t]*)?\^([^\^\r\n]+)\^)?(.*)$/gm, (match, indent, before, quote, ref, after) => {
    let res = '';
    if (before.trim()) res += `${indent}${before.trim()}\n\n`;
    res += `\n${indent}> [SAYING] ${quote.trim()}`;
    if (ref) res += `  \n${indent}> *__REF__${ref.trim()}*`;
    res += '\n';
    const cleanAfter = (after || '').replace(/^[.\u06D4\s]+/, '');
    if (cleanAfter.trim()) res += `\n${indent}${cleanAfter.trim()}\n\n`;
    return res;
  });

  // Poetry: $Poetry$ -> tagged blockquote (supports multiple on same line)
  text = text.replace(/^([ \t]*)(.*?)\$([^$\r\n]+)\$(?:[ \t]*(?:\r?\n[ \t]*)?\^([^\^\r\n]+)\^)?(.*)$/gm, (match, indent, before, quote, ref, after) => {
    let res = '';
    if (before.trim()) res += `${indent}${before.trim()}\n\n`;
    res += `\n${indent}> [POETRY] ${quote.trim()}`;
    if (ref) res += `  \n${indent}> *__REF__${ref.trim()}*`;
    res += '\n';
    const cleanAfter = (after || '').replace(/^[.\u06D4\s]+/, '');
    if (cleanAfter.trim()) res += `\n${indent}${cleanAfter.trim()}\n\n`;
    return res;
  });

  // Standalone References: ^text^ -> tagged blockquote
  text = text.replace(/^([ \t]*)(.*?)\^([^\^\r\n]+)\^(.*)$/gm, (match, indent, before, ref, after) => {
    let res = '';
    if (before.trim()) res += `${indent}${before.trim()}\n\n`;
    res += `\n${indent}> [REFERENCE] ${ref.trim()}\n`;
    const cleanAfter = (after || '').replace(/^[.\u06D4\s]+/, '');
    if (cleanAfter.trim()) res += `\n${indent}${cleanAfter.trim()}\n\n`;
    return res;
  });

  // Remove any remaining standalone lines containing only a dot or period
  text = text.replace(/^\s*[\.\u06D4]\s*$/gm, '');

  // 4. Ensure numbered and bullet list items always start on a new line with double newline \n\n while preserving indentation
  text = text.replace(/([^\n])\n([ \t]*)([0-9]+\.|[\u0600-\u06FF]\.|\*|-)[ \t]+/g, '$1\n\n$2$3 ');

  // ++Keyword++ -> ~~Keyword~~.
  text = text.replace(/\+\+([^+]+)\+\+/g, '~~$1~~');

  // Wrap Arabic quotes in ~~ to parse as <del>, which we style specially.
  text = text.replace(/«([^»\n]+)»/g, '~~«$1»~~');

  // Automatically indent sub-list items under parent title bullets
  text = autoIndentSubLists(text);

  // Cleanup extra blank lines.
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

export function Bubble({ message, dark, avatarRef, lessonTitle }: { message: Message; dark: boolean; avatarRef?: React.RefObject<HTMLSpanElement | null>; lessonTitle?: string }) {
  const isUser = message.role === 'user'

  let activeLessonBreadcrumb: string | undefined = lessonTitle
  try {
    const study = useStudy()
    if (study) {
      const parts = [study.headerSubtitle, study.chunkTitle].filter(Boolean)
      if (parts.length > 0) {
        activeLessonBreadcrumb = parts.join(' ‹ ')
      }
    }
  } catch (e) {
    // Graceful fallback if invoked outside StudyProvider
  }

  const [displayedText, setDisplayedText] = useState(() => (message.stream && !isUser) ? '' : message.text)
  const [isStreaming, setIsStreaming] = useState(() => (message.stream && !isUser) ? true : false)
  const [isCopied, setIsCopied] = useState(false)
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const messageContentRef = useRef<HTMLDivElement>(null)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleDownloadPDF = async () => {
    if (isExportingPDF) return
    try {
      setIsExportingPDF(true)
      await exportMessageToPdf(message.text, message.citations, activeLessonBreadcrumb)
    } catch (err) {
      console.error('Failed to export PDF:', err)
      alert('حدث خطأ أثناء تصدير ملف PDF، يرجى المحاولة مرة أخرى.')
    } finally {
      setIsExportingPDF(false)
    }
  }

  useEffect(() => {
    if (isUser || !message.stream || !isStreaming) return;

    let currentIdx = 0;
    const fullText = message.text;
    const chunkSize = 3;

    const interval = setInterval(() => {
      currentIdx += chunkSize;
      if (currentIdx >= fullText.length) {
        setDisplayedText(fullText);
        setIsStreaming(false);
        clearInterval(interval);
      } else {
        setDisplayedText(fullText.slice(0, currentIdx));
      }

      const scrollContainer = document.querySelector('.custom-scrollbar');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }, 20);

    return () => clearInterval(interval);
  }, [message.stream, message.text, isStreaming, isUser]);

  return (
    <div className={`flex w-full animate-in fade-in slide-in-from-bottom-2 duration-500 ${isUser ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex items-start gap-3 ${isUser ? 'max-w-[88%] md:max-w-[80%]' : 'w-full max-w-[97%] md:max-w-[96%] flex-row-reverse'}`}>
        {isUser ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full brand-gradient text-white shadow-lg shadow-primary/30 -mt-3">
            <User size={22} strokeWidth={2.5} />
          </div>
        ) : (
          <span ref={avatarRef}>
            <AvatarLogo dark={dark} />
          </span>
        )}
        {isUser ? (
          <div className="rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm brand-gradient rounded-tr-sm text-white whitespace-pre-line">
            {message.text}
          </div>
        ) : (
          <div className="flex flex-col w-full max-w-full pt-1">
            <div
              ref={messageContentRef}
              className={`relative px-5 py-5 border overflow-hidden transition-all duration-300 hover:shadow-2xl rounded-3xl rounded-tl-sm flex flex-col gap-4 ${dark
                ? 'bg-black/30 backdrop-blur-2xl border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.15)]'
                : 'bg-[#FAF9FC] border-primary/15 shadow-[0_4px_20px_rgba(124,58,237,0.04)]'
                }`}
            >
              {(() => {
                const structuredFrames = parseTextIntoFrames(displayedText);

                const extractText = (child: any): string => {
                  if (!child) return '';
                  if (typeof child === 'string') return child;
                  if (Array.isArray(child)) return child.map(extractText).join('');
                  if (child.props && child.props.children) return extractText(child.props.children);
                  if (child.props && child.props.node && child.props.node.value) return child.props.node.value;
                  return '';
                };

                const markdownComponents = {
                  h1: ({ node, ...props }: any) => (
                    <h1
                      className={`text-2xl font-bold mt-1 mb-4 ${dark ? 'text-white' : 'text-primary'
                        }`}
                      {...props}
                    />
                  ),
                  h2: ({ node, ...props }: any) => (
                    <div
                      className={`flex items-center gap-2.5 mt-5 mb-3 px-3 py-2 rounded-xl border ${dark
                        ? 'bg-emerald-500/[0.06] border-emerald-400/15'
                        : 'bg-emerald-50/80 border-emerald-200/70'
                        }`}
                    >
                      <span
                        className={`w-1 h-5 rounded-full flex-shrink-0 ${dark ? 'bg-emerald-400' : 'bg-emerald-600'
                          }`}
                      />
                      <h2
                        className={`text-[17px] md:text-[18px] font-bold ${dark ? 'text-emerald-300' : 'text-emerald-700'
                          }`}
                        {...props}
                      />
                    </div>
                  ),
                  h3: ({ node, ...props }: any) => (
                    <div
                      className={`flex items-center gap-3 mb-5 px-5 py-3.5 -mx-5 -mt-5 bg-gradient-to-l ${dark
                        ? 'from-white/[0.06] to-transparent border-b border-white/10'
                        : 'from-primary/[0.05] to-transparent border-b border-primary/10'
                        }`}
                    >
                      <h3
                        className={`text-[19px] font-bold ${dark
                          ? 'text-transparent bg-clip-text bg-gradient-to-l from-emerald-300 to-emerald-500'
                          : 'text-purple-700'
                          }`}
                        {...props}
                      />
                    </div>
                  ),
                  h4: ({ node, ...props }: any) => (
                    <div
                      className={`flex items-center gap-2 mb-4 px-5 py-3 -mx-5 -mt-5 bg-gradient-to-l ${dark
                        ? 'from-white/[0.04] to-transparent border-b border-white/[0.04]'
                        : 'from-purple-100/60 via-purple-50/30 to-transparent border-b border-purple-200/50'
                        }`}
                    >
                      <h4
                        className={`text-[16px] md:text-[17px] font-extrabold ${dark
                          ? 'text-transparent bg-clip-text bg-gradient-to-l from-emerald-200 to-emerald-400'
                          : 'text-purple-900'
                          }`}
                        {...props}
                      />
                    </div>
                  ),
                  p: ({ node, ...props }: any) => (
                    <p
                      className={`mb-4 last:mb-0 text-[15px] md:text-[16px] leading-[1.85] ${dark ? 'text-white/90' : 'text-[#0F172A]'
                        }`}
                      {...props}
                    />
                  ),
                  ul: ({ node, ...props }: any) => (
                    <ul className={`list-disc list-outside pr-6 mr-2 mb-4 space-y-3 ${dark ? 'marker:text-emerald-400' : 'marker:text-purple-600'}`} {...props} />
                  ),
                  ol: ({ node, ...props }: any) => (
                    <ol
                      className={`list-decimal list-outside pr-6 mr-2 mb-4 space-y-3 font-semibold ${dark ? 'marker:text-emerald-400' : 'marker:text-purple-600'}`}
                      {...props}
                    />
                  ),
                  li: ({ node, ...props }: any) => (
                    <li
                      className={`text-[15px] md:text-[16px] leading-[1.85] pr-1.5 ${dark ? 'text-white/90' : 'text-[#0F172A]'}`}
                      {...props}
                    />
                  ),
                  strong: ({ node, ...props }: any) => {
                    const text = extractText(props.children);
                    if (text.includes('ZAD_TITLE_') || text.includes('__TITLE__')) {
                      return (
                        <strong
                          className={`font-bold underline underline-offset-[6px] decoration-[1.5px] ${dark
                            ? 'text-emerald-300 decoration-emerald-400/50'
                            : 'text-purple-800 decoration-purple-500/50'
                            }`}
                        >
                          {text.replace(/ZAD_TITLE_/g, '').replace(/__TITLE__/g, '')}
                        </strong>
                      );
                    }
                    if (text.includes('ZAD_BADGE_') || text.includes('__BADGE__')) {
                      return (
                        <strong
                          className={`font-bold inline-block px-2.5 py-0.5 mx-1 rounded-md border text-[13px] md:text-[14px] ${dark
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-purple-50 border-purple-300 text-purple-700'
                            }`}
                        >
                          {text.replace(/ZAD_BADGE_/g, '').replace(/__BADGE__/g, '')}
                        </strong>
                      );
                    }
                    return (
                      <strong
                        className={`font-bold ${dark
                          ? 'text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.35)]'
                          : 'text-purple-800'
                          }`}
                        {...props}
                      />
                    );
                  },
                  em: ({ node, ...props }: any) => {
                    const text = extractText(props.children);
                    if (text.startsWith('__REF__')) {
                      return (
                        <span className={`block w-full mt-3 pt-2 border-t ${dark ? 'border-white/15' : 'border-black/10'} text-[12.5px] md:text-[13.5px] opacity-90 font-medium text-left`} dir="rtl">
                          {text.replace('__REF__', '')}
                        </span>
                      );
                    }
                    return <em className="italic" {...props} />;
                  },
                  del: ({ node, ...props }: any) => {
                    const text = extractText(props.children);
                    if (text.startsWith('«') && text.endsWith('»')) {
                      return (
                        <span
                          className={`block w-full my-4 px-5 py-5 rounded-2xl border-r-[4px] transition-all duration-300 hover:shadow-md ${dark
                            ? 'bg-[#0f172a]/90 border-emerald-400 text-emerald-50 shadow-[0_4px_15px_rgba(0,0,0,0.2)]'
                            : 'bg-[#FDFBF7] border-purple-600 text-[#1E1B4B] shadow-sm ring-1 ring-purple-100/70'
                            }`}
                        >
                          <span className="block text-[16.5px] md:text-[17.5px] leading-[2.2] font-bold text-center">
                            {props.children}
                          </span>
                        </span>
                      );
                    }
                    return (
                      <span
                        className={`inline-flex items-center mx-1 px-3 py-1 rounded-lg border align-middle font-bold text-[13px] md:text-[14px] ${dark
                          ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.08)]'
                          : 'bg-purple-50 border-purple-300/70 text-purple-700 shadow-sm'
                          }`}
                        {...props}
                      />
                    );
                  },
                  blockquote: ({ node, ...props }: any) => {
                    const quoteText = extractText(props.children).trim();
                    let type:
                      | 'quran'
                      | 'hadith'
                      | 'saying'
                      | 'poetry'
                      | 'reference'
                      | 'generic' = 'generic';

                    if (quoteText.startsWith('[QURAN]')) type = 'quran';
                    else if (quoteText.startsWith('[HADITH]')) type = 'hadith';
                    else if (quoteText.startsWith('[SAYING]')) type = 'saying';
                    else if (quoteText.startsWith('[POETRY]')) type = 'poetry';
                    else if (quoteText.startsWith('[REFERENCE]')) type = 'reference';

                    const styles = {
                      quran: {
                        dark: 'border-emerald-400/60 bg-emerald-500/[0.10] text-emerald-50 shadow-[inset_0_0_30px_rgba(16,185,129,0.06),0_8px_30px_rgba(16,185,129,0.05)]',
                        light: 'border-emerald-500 bg-[#ECFDF5] text-emerald-950 shadow-sm ring-1 ring-emerald-100',
                        icon: <BookOpen className="w-[18px] h-[18px]" strokeWidth={2.5} />,
                        label: 'آية قرآنية',
                      },
                      hadith: {
                        dark: 'border-sky-400/50 bg-sky-500/[0.09] text-sky-50 shadow-[inset_0_0_30px_rgba(14,165,233,0.05),0_8px_30px_rgba(14,165,233,0.04)]',
                        light: 'border-sky-500 bg-[#F0F9FF] text-sky-950 shadow-sm ring-1 ring-sky-100',
                        icon: <Book className="w-[18px] h-[18px]" strokeWidth={2.5} />,
                        label: 'حديث نبوي',
                      },
                      saying: {
                        dark: 'border-violet-400/50 bg-violet-500/[0.09] text-violet-50 shadow-[inset_0_0_30px_rgba(139,92,246,0.05),0_8px_30px_rgba(139,92,246,0.04)]',
                        light: 'border-purple-600 bg-[#FDFBF7] text-[#1E1B4B] shadow-sm ring-1 ring-purple-100/70',
                        icon: <User className="w-[18px] h-[18px]" strokeWidth={2.5} />,
                        label: 'قول عالم',
                      },
                      poetry: {
                        dark: 'border-amber-400/50 bg-amber-500/[0.09] text-amber-50 shadow-[inset_0_0_30px_rgba(245,158,11,0.05),0_8px_30px_rgba(245,158,11,0.04)]',
                        light: 'border-amber-500 bg-[#FFFBEB] text-amber-950 shadow-sm ring-1 ring-amber-100',
                        icon: <Feather className="w-[18px] h-[18px]" strokeWidth={2.5} />,
                        label: 'شعر',
                      },
                      reference: {
                        dark: 'border-indigo-400/40 bg-indigo-500/[0.05] text-indigo-100 shadow-[inset_0_0_30px_rgba(99,102,241,0.03),0_8px_30px_rgba(99,102,241,0.02)]',
                        light: 'border-indigo-500 bg-[#EEF2FF] text-indigo-950 shadow-sm ring-1 ring-indigo-100',
                        icon: <FileText className="w-[18px] h-[18px]" strokeWidth={2.5} />,
                        label: 'مرجع',
                      },
                      generic: {
                        dark: 'border-emerald-500/50 bg-emerald-500/[0.08] text-emerald-50',
                        light: 'border-purple-600 bg-[#FDFBF7] text-[#1E1B4B] shadow-sm ring-1 ring-purple-100/70',
                        icon: <FileText className="w-[18px] h-[18px]" strokeWidth={2.5} />,
                        label: 'اقتباس',
                      },
                    };

                    const style = styles[type];
                    let prefixRemoved = false;
                    const removePrefix = (text: string) => {
                      const original = text;
                      const replaced = text.replace(/^\[QURAN\]\s*/, '').replace(/^\[HADITH\]\s*/, '').replace(/^\[SAYING\]\s*/, '').replace(/^\[POETRY\]\s*/, '').replace(/^\[REFERENCE\]\s*/, '');
                      if (replaced !== original) prefixRemoved = true;
                      return replaced;
                    };

                    const recursivelyClean = (node: any): any => {
                      if (prefixRemoved) return node;
                      if (typeof node === 'string') return removePrefix(node);
                      if (Array.isArray(node)) return node.map(recursivelyClean);
                      if (React.isValidElement(node)) {
                        const children = (node.props as any)?.children;
                        if (children) {
                          return React.cloneElement(node, {
                            children: recursivelyClean(children)
                          } as any);
                        }
                      }
                      return node;
                    };

                    const cleanedChildren = recursivelyClean(props.children);

                    return (
                      <blockquote
                        className={`relative my-5 overflow-hidden rounded-2xl border-r-[5px] px-5 py-4 ${dark ? style.dark : style.light
                          }`}
                        {...props}
                      >
                        <div
                          className={
                            type === 'quran'
                              ? 'text-[17px] md:text-[18px] leading-[2.05] font-semibold'
                              : type === 'reference'
                                ? 'text-[14px] md:text-[15px] leading-[1.85] font-medium opacity-90'
                                : 'text-[15px] md:text-[16px] leading-[1.95] font-semibold'
                          }
                        >
                          {cleanedChildren}
                        </div>
                      </blockquote>
                    );
                  },

                  a: ({ node, ...props }: any) => (
                    <a
                      className={dark ? "text-emerald-400 hover:text-emerald-300 font-medium transition-colors underline underline-offset-4" : "text-purple-600 hover:text-purple-800 font-medium transition-colors underline underline-offset-4"}
                      {...props}
                    />
                  ),

                  hr: () => null,

                  code: ({ node, ...props }: any) => (
                    <code
                      className={`px-1.5 py-0.5 rounded-md text-sm font-mono ${dark
                        ? 'bg-emerald-950/50 text-emerald-200'
                        : 'bg-purple-100/60 text-purple-900 border border-purple-200/60'
                        }`}
                      {...props}
                    />
                  ),
                };

                return structuredFrames.map((mainFrame, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col gap-2 ${dark
                      ? 'bg-white/[0.02] hover:bg-white/[0.04] border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.15)]'
                      : 'bg-white hover:bg-purple-50/40 border-purple-200/50 shadow-[0_2px_12px_rgba(124,58,237,0.03)]'
                      }`}
                  >
                    {mainFrame.content.trim().length > 0 && (
                      <div dir="rtl" className="w-full text-right font-sans">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={markdownComponents as any}
                        >
                          {preprocessFrameText(mainFrame.content)}
                        </ReactMarkdown>
                      </div>
                    )}

                    {mainFrame.children.length > 0 && (
                      <div className={`flex flex-col gap-4 ${mainFrame.content.trim().length > 0 ? 'mt-2' : ''}`}>
                        {mainFrame.children.map((childContent, cIdx) => (
                          <div
                            key={cIdx}
                            className={`p-5 rounded-2xl border overflow-hidden transition-all ${dark ? 'bg-black/20 border-white/10 shadow-inner' : 'bg-[#FAF9FC] border-slate-200/80 shadow-sm'}`}
                          >
                            <div dir="rtl" className="w-full text-right font-sans">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={markdownComponents as any}
                              >
                                {preprocessFrameText(childContent)}
                              </ReactMarkdown>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ));
              })()}

              {message.citations && message.citations.length > 0 && !isStreaming && (
                <div className="mt-1 pt-1 animate-in fade-in zoom-in duration-500">
                  <CitationsSection citations={message.citations} dark={dark} />
                </div>
              )}

              {!isUser && !isStreaming && (
                <div className="flex justify-end items-center gap-2 mt-1 pt-3 border-t" dir="rtl" style={{ borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                  <AudioReaderButton text={displayedText} dark={dark} />

                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[13px] font-bold transition-all duration-300 hover:scale-105 ${dark
                      ? 'text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 shadow-sm'
                      : 'text-primary/70 hover:text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/20 shadow-sm'
                      }`}
                  >
                    {isCopied ? (
                      <Check size={14} className="text-emerald-500 drop-shadow-sm" strokeWidth={3} />
                    ) : (
                      <Copy size={14} strokeWidth={2.5} />
                    )}
                    <span className={isCopied ? "text-emerald-500 drop-shadow-sm" : ""}>{isCopied ? 'تم النسخ' : 'نسخ النص'}</span>
                  </button>

                  <button
                    onClick={handleDownloadPDF}
                    disabled={isExportingPDF}
                    title="حفظ الرسالة كـ PDF"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[13px] font-bold transition-all duration-300 hover:scale-105 ${dark
                      ? 'text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 shadow-sm'
                      : 'text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 shadow-sm'
                      } ${isExportingPDF ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {isExportingPDF ? (
                      <Loader2 size={14} className="animate-spin text-purple-400" />
                    ) : (
                      <Download size={14} strokeWidth={2.5} />
                    )}
                    <span>{isExportingPDF ? 'جاري التصدير...' : 'حفظ كـ PDF'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function TypingBubble({ dark, avatarRef }: { dark: boolean; avatarRef?: React.RefObject<HTMLSpanElement | null> }) {
  return (
    <div className="flex justify-end animate-in fade-in duration-500">
      <div className="flex items-start gap-3 flex-row-reverse">
        <span ref={avatarRef}>
          <AvatarLogo dark={dark} />
        </span>
        <div className={`flex items-center gap-1.5 rounded-2xl rounded-tl-sm border px-5 py-4 shadow-sm ${dark ? 'bg-[#1a0730]/80 border-white/10' : 'bg-white border-primary/10'}`}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-primary/60"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function getMadhhabHex(madhhab: string) {
  if (!madhhab) return '#9333EA'
  if (madhhab.includes('مالك')) return '#F59E0B' // Amber
  if (madhhab.includes('حنب')) return '#10B981' // Emerald
  if (madhhab.includes('شافع')) return '#DC143C' // Crimson
  if (madhhab.includes('حنف')) return '#8B5CF6' // Violet
  return '#9333EA' // Default Purple
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function CustomChip({ label, icon: Icon, color, dark }: { label: string; icon: any; color: string; dark: boolean }) {
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-[5px] rounded-full border transition-all duration-300 hover:scale-105"
      style={{
        backgroundColor: hexToRgba(color, dark ? 0.08 : 0.05),
        borderColor: hexToRgba(color, dark ? 0.35 : 0.4)
      }}
    >
      <Icon size={13} style={{ color }} strokeWidth={2.5} />
      <span
        className="font-sans text-[12px] font-semibold"
        style={{
          color,
          textShadow: dark ? `0 0 10px ${hexToRgba(color, 0.4)}` : 'none'
        }}
      >
        {label}
      </span>
    </div>
  )
}

function HierarchyBreadcrumbs({ hierarchy, dark, color }: { hierarchy: string; dark: boolean; color: string }) {
  if (!hierarchy) return null;

  // Split by common hierarchy separators
  const parts = hierarchy.split(/[/\\>|]| - /).map(p => p.trim()).filter(Boolean);

  if (parts.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-1.5">
      {parts.map((part, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <div
            className="px-3 py-[5px] rounded-[10px] text-[12px] font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center"
            style={{
              backgroundColor: hexToRgba(color, dark ? 0.12 : 0.06),
              color: dark ? 'rgba(255,255,255,0.95)' : '#1E293B',
              border: `1px solid ${hexToRgba(color, dark ? 0.3 : 0.25)}`,
              boxShadow: dark ? `0 2px 10px ${hexToRgba(color, 0.15)}` : `0 2px 5px rgba(0,0,0,0.02)`
            }}
          >
            {part}
          </div>
          {idx < parts.length - 1 && (
            <ChevronLeft size={16} style={{ color: hexToRgba(color, dark ? 0.8 : 0.6) }} strokeWidth={2.5} />
          )}
        </div>
      ))}
    </div>
  )
}

function CitationCard({ citation, index, dark }: { citation: CitationDTO; index: number; dark: boolean }) {
  const madhhabColor = getMadhhabHex(citation.madhhab || '')

  const bookTitle = citation.bookTitle || citation.book_title || 'بدون عنوان'
  const author = citation.author || ''
  const authorDeath = citation.authorDeath || citation.author_death || ''
  const totalParts = citation.totalParts || citation.total_parts || 0
  const pageId = citation.pageId || citation.page_id || 0
  const sourceUrl = citation.sourceUrl || citation.source_url || ''

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: "spring", stiffness: 300, damping: 24 }
        }
      }}
      dir="rtl"
      className={`relative rounded-2xl border border-r-[4px] group-hover:border-r-[8px] transition-all duration-500 overflow-hidden group ${dark
        ? 'bg-transparent border-white/10 hover:-translate-y-1.5 hover:border-white/25 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]'
        : 'bg-white border-primary/10 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]'
        }`}
      style={{ borderRightColor: madhhabColor }}
    >
      <div className="p-4 pr-5">
        <div className="flex items-start w-full">
          {/* Right side (Index and Open Btn) */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="px-2.5 py-1 rounded-[6px] flex items-center justify-center min-w-[32px]"
              style={{ backgroundColor: hexToRgba(madhhabColor, dark ? 0.2 : 0.1) }}
            >
              <span className="text-[12px] font-bold" style={{ color: madhhabColor }}>{index}</span>
            </div>

            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded-[6px] transition-colors hover:opacity-80 flex items-center justify-center"
                style={{ border: `1px solid ${hexToRgba(madhhabColor, 0.3)}` }}
              >
                <ExternalLink size={16} style={{ color: madhhabColor }} strokeWidth={2} />
              </a>
            )}
          </div>

          <div className="w-3 shrink-0" />

          {/* Left side (Title and Author) */}
          <div className="flex-1 flex flex-col items-start min-w-0 pt-0.5">
            <h4 className={`font-bold text-[16px] md:text-[17px] leading-[1.5] ${dark ? 'text-white/95' : 'text-brand-deep'} font-sans text-right w-full break-words`}>
              {bookTitle}
            </h4>
            {author && (
              <span className={`text-[12px] md:text-[13px] font-medium mt-1.5 ${dark ? 'text-white/60' : 'text-primary/70'} font-sans text-right w-full`}>
                {author}
              </span>
            )}
          </div>
        </div>

        {/* Chips Wrap */}
        <div className="flex flex-wrap gap-2 mt-4">
          {citation.madhhab && (
            <CustomChip
              label={citation.madhhab}
              icon={LayoutGrid}
              color={madhhabColor}
              dark={dark}
            />
          )}
          {citation.part && citation.part !== '0' && (
            <CustomChip
              label={`الجزء ${citation.part} ${totalParts > 0 ? `من ${totalParts}` : ''}`}
              icon={Book}
              color="#3B82F6"
              dark={dark}
            />
          )}
          {pageId > 0 && (
            <CustomChip
              label={`ص ${pageId}`}
              icon={FileText}
              color="#10B981"
              dark={dark}
            />
          )}
          {authorDeath && !authorDeath.includes('غير معروف') && (
            <CustomChip
              label={authorDeath}
              icon={Feather}
              color="#6366F1"
              dark={dark}
            />
          )}
        </div>

        {/* Hierarchy */}
        {citation.hierarchy && (
          <HierarchyBreadcrumbs hierarchy={citation.hierarchy} dark={dark} color={madhhabColor} />
        )}
      </div>
    </motion.div>
  )
}

function CitationsSection({ citations, dark }: { citations: CitationDTO[]; dark: boolean }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!citations || citations.length === 0) return null

  return (
    <div
      className={`w-full rounded-[14px] border overflow-hidden transition-all duration-300 ${isOpen
        ? (dark ? 'bg-black/30 border-emerald-500/30 shadow-[0_4px_20px_rgba(16,185,129,0.15)]' : 'bg-white border-emerald-500/30 shadow-md')
        : (dark ? 'bg-black/20 border-white/10 shadow-inner' : 'bg-[#F8FAFC] border-[#E2E8F0]')
        }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-4 py-3.5 group transition-all duration-300 ${isOpen
          ? (dark ? 'bg-gradient-to-l from-emerald-500/10 to-transparent' : 'bg-gradient-to-l from-emerald-50/80 to-transparent')
          : (dark ? 'hover:bg-white/5' : 'hover:bg-black/5')
          }`}
        dir="rtl"
      >
        <div className="flex items-center gap-3 transition-transform group-hover:-translate-x-1 duration-300">
          <div className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-300 ${isOpen ? 'bg-emerald-500/20 text-emerald-400' : (dark ? 'bg-white/5 text-white/60 group-hover:bg-emerald-500/20 group-hover:text-emerald-400' : 'bg-black/5 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600')
            }`}>
            <BookOpen className="w-[18px] h-[18px]" strokeWidth={2.5} />
          </div>
          <span className={`font-sans text-[15px] font-bold transition-colors duration-300 ${isOpen
            ? (dark ? 'text-emerald-300' : 'text-emerald-700')
            : (dark ? 'text-white/90 group-hover:text-emerald-400' : 'text-[#374151] group-hover:text-emerald-600')
            }`}>
            {citations.length} {citations.length === 1 ? 'مصدر موثوق' : 'مصادر موثوقة'}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${dark ? 'bg-white/5 text-white/50 group-hover:bg-white/10 group-hover:text-white' : 'bg-black/5 text-gray-500 group-hover:bg-black/10 group-hover:text-gray-800'
            }`}
        >
          <ChevronDown className="w-5 h-5" strokeWidth={2.5} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-4 pb-4">
              <div className={`h-px w-full mb-4 ${dark ? 'bg-emerald-500/20' : 'bg-emerald-200/50'}`} />
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.08 }
                  }
                }}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-3"
              >
                {citations.map((cit, idx) => (
                  <CitationCard key={idx} citation={cit} index={idx + 1} dark={dark} />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}