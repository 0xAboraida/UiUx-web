import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight, FileText, BookText, Folder, Menu, Loader2, Search, ChevronDown, Settings2, Maximize, Minimize, Sun, Moon, Type, Sparkles, X, Send, Bookmark, Copy, Volume2, VolumeX, BookmarkCheck, AlignJustify, MoreVertical, Hash, Download, CheckCircle2, FileDown, Layers, Check, HardDriveDownload, BookCheck, RotateCcw } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { Bubble, TypingBubble } from '../chat/components/ChatBubble'
import type { Message } from '../chat/data'
import { speakText, stopAllSpeech } from '@/services/geminiTtsService'
import whiteLogo from '@/assets/images/WhiteLogo.png'
import zadDarkLogo from '@/assets/images/ZadDarkLogo.png'
import { PanelResizer } from '../study/components/PanelResizer'
import { AudioReaderButton } from '@/components/common/AudioReaderButton'
import { fetchTurathBookIndexes, fetchTurathPage, searchTurathCorpus, fetchTurathBookPdfUrl, type TurathSearchHit } from '../../api/turathApi'
import { idbGetTurathBookTree, idbSetTurathBookTree, idbDeleteTurathBookTree, idbSaveBookOffline, idbGetOfflineBook, idbIsBookSavedOffline, idbRemoveOfflineBook } from '../../utils/indexedDbStorage'
import { downloadBookFile } from './utils/bookExport'
import { hasBookPdf, getBookPdfUrl } from './utils/turathMeta'
import IslamicPattern from './components/IslamicPattern'

import type { BookMeta } from './types/bookTypes'

type Heading = {
  id: number
  title: string
  level: number
  page: number
}

interface TreeNode extends Heading {
  children: TreeNode[];
  originalIndex: number;
}

const buildTree = (headings: Heading[]): TreeNode[] => {
  const root: TreeNode[] = [];
  const stack: TreeNode[] = [];

  headings.forEach((h, i) => {
    const node: TreeNode = { ...h, originalIndex: i, children: [] };
    while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
      stack.pop();
    }
    if (stack.length === 0) root.push(node);
    else stack[stack.length - 1].children.push(node);
    stack.push(node);
  });
  return root;
}

const TocNode = ({
  node,
  expandedNodes,
  toggleExpand,
  currentPage,
  handlePageJump,
  activeHeadingText,
  activeTocIndex,
  activeAncestorIndices,
  selectedTocIndex,
  readerTheme = 'light'
}: {
  node: TreeNode,
  expandedNodes: Set<number>,
  toggleExpand: (idx: number) => void,
  currentPage: number,
  handlePageJump: (page: number, title?: string, index?: number) => void,
  activeHeadingText: string | null,
  activeTocIndex: number,
  activeAncestorIndices?: Set<number>,
  selectedTocIndex?: number | null,
  readerTheme?: 'light' | 'dark' | 'sepia'
}) => {
  const { accentColor } = useTheme();
  const isExpanded = expandedNodes.has(node.originalIndex);

  // Highlighting Logic: Exact match with selectedTocIndex or activeTocIndex
  const isExactActive = (selectedTocIndex !== null && selectedTocIndex !== undefined && node.originalIndex === selectedTocIndex && node.page === currentPage) ||
    (activeTocIndex >= 0 && node.originalIndex === activeTocIndex);

  const isAncestorActive = activeAncestorIndices ? activeAncestorIndices.has(node.originalIndex) && !isExactActive : false;

  const hasChildren = node.children.length > 0;

  const getTreeLineBorderClass = () => {
    if (isAncestorActive || isExactActive) {
      switch (accentColor) {
        case 'amber': return 'border-[#b88d46]';
        case 'emerald': return 'border-teal-500';
        case 'blue': return 'border-blue-500';
        case 'purple':
        default: return 'border-purple-500';
      }
    }
    return 'border-border/30';
  };

  const getContainerStyles = () => {
    if (isExactActive) {
      if (readerTheme === 'dark') {
        switch (accentColor) {
          case 'amber':
            return 'bg-[#dfbf83] text-stone-950 font-bold border-[#cba35d] shadow-md shadow-amber-950/50 ring-1 ring-[#dfbf83]/50';
          case 'emerald':
            return 'bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-500 text-white font-extrabold border-teal-400/60 shadow-md shadow-teal-950/50 ring-1 ring-teal-400/40';
          case 'blue':
            return 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white font-extrabold border-blue-400/60 shadow-md shadow-blue-950/50 ring-1 ring-blue-400/40';
          case 'purple':
          default:
            return 'bg-gradient-to-r from-purple-600 via-brand-magenta to-purple-700 text-white font-extrabold border-purple-400/60 shadow-md shadow-purple-950/50 ring-1 ring-purple-400/40';
        }
      } else {
        switch (accentColor) {
          case 'amber':
            return 'bg-[#dfbf83] text-stone-950 font-bold border-[#cba35d] shadow-md shadow-amber-600/20 ring-1 ring-[#cba35d]/40';
          case 'emerald':
            return 'bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-500 text-white font-extrabold border-teal-700 shadow-md shadow-teal-600/30 ring-1 ring-teal-600/40';
          case 'blue':
            return 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white font-extrabold border-blue-700 shadow-md shadow-blue-600/30 ring-1 ring-blue-600/40';
          case 'purple':
          default:
            return 'bg-gradient-to-r from-purple-700 via-purple-600 to-brand-magenta text-white font-extrabold border-purple-700 shadow-md shadow-purple-600/30 ring-1 ring-purple-600/40';
        }
      }
    }
    if (isAncestorActive) {
      if (readerTheme === 'dark') {
        switch (accentColor) {
          case 'amber': return 'bg-amber-950/35 text-amber-200/90 font-semibold border-amber-600/30 shadow-none';
          case 'emerald': return 'bg-teal-950/35 text-teal-200/90 font-semibold border-teal-600/30 shadow-none';
          case 'blue': return 'bg-blue-950/35 text-blue-200/90 font-semibold border-blue-600/30 shadow-none';
          case 'purple':
          default: return 'bg-purple-950/35 text-purple-200/90 font-semibold border-purple-600/30 shadow-none';
        }
      } else {
        switch (accentColor) {
          case 'amber': return 'bg-[#dfbf83]/15 text-[#78531b] font-bold border border-[#dfbf83]/40 shadow-none';
          case 'emerald': return 'bg-teal-500/10 text-teal-800 font-bold border border-teal-500/30 shadow-none';
          case 'blue': return 'bg-blue-500/10 text-blue-800 font-bold border border-blue-500/30 shadow-none';
          case 'purple':
          default: return 'bg-purple-500/10 text-purple-900 font-bold border border-purple-500/30 shadow-none';
        }
      }
    }
    if (readerTheme === 'dark') {
      return 'text-slate-200 hover:text-white hover:bg-white/10 border-transparent hover:border-white/20';
    } else {
      switch (accentColor) {
        case 'amber': return 'text-slate-800 hover:bg-amber-50 hover:text-amber-950 border-transparent hover:border-amber-200/50';
        case 'emerald': return 'text-slate-800 hover:bg-teal-50 hover:text-teal-950 border-transparent hover:border-teal-200/50';
        case 'blue': return 'text-slate-800 hover:bg-blue-50 hover:text-blue-950 border-transparent hover:border-blue-200/50';
        case 'purple':
        default: return 'text-slate-800 hover:bg-purple-50 hover:text-purple-950 border-transparent hover:border-purple-200/50';
      }
    }
  };

  const getIconStyles = () => {
    if (isExactActive) return accentColor === 'amber' ? 'text-stone-950' : 'text-white';
    if (isAncestorActive) {
      if (readerTheme === 'dark') {
        switch (accentColor) {
          case 'amber': return 'text-amber-300';
          case 'emerald': return 'text-teal-300';
          case 'blue': return 'text-blue-300';
          case 'purple':
          default: return 'text-purple-300';
        }
      }
      switch (accentColor) {
        case 'amber': return 'text-amber-700';
        case 'emerald': return 'text-teal-700';
        case 'blue': return 'text-blue-700';
        case 'purple':
        default: return 'text-purple-700';
      }
    }
    switch (accentColor) {
      case 'amber': return 'text-[#b88d46]/80';
      case 'emerald': return 'text-teal-600/80';
      case 'blue': return 'text-blue-600/80';
      case 'purple':
      default: return 'text-brand-magenta/70';
    }
  };

  const getBadgeStyles = () => {
    if (isExactActive) {
      return accentColor === 'amber'
        ? 'bg-black/10 text-stone-950 font-bold border border-black/5'
        : 'bg-white/20 text-white font-bold backdrop-blur-xs';
    }
    if (isAncestorActive) {
      if (readerTheme === 'dark') {
        switch (accentColor) {
          case 'amber': return 'bg-amber-900/80 text-amber-200 font-bold';
          case 'emerald': return 'bg-teal-900/80 text-teal-200 font-bold';
          case 'blue': return 'bg-blue-900/80 text-blue-200 font-bold';
          case 'purple':
          default: return 'bg-purple-900/80 text-purple-200 font-bold';
        }
      }
      switch (accentColor) {
        case 'amber': return 'bg-amber-200 text-amber-900 font-bold';
        case 'emerald': return 'bg-teal-200 text-teal-900 font-bold';
        case 'blue': return 'bg-blue-200 text-blue-900 font-bold';
        case 'purple':
        default: return 'bg-purple-200 text-purple-900 font-bold';
      }
    }
    return readerTheme === 'dark'
      ? 'bg-white/10 text-white/70'
      : 'bg-slate-200/80 text-slate-700';
  };

  const getHoverPreviewCardStyle = () => {
    if (readerTheme === 'dark') {
      switch (accentColor) {
        case 'amber': return 'bg-[#10131a]/95 border-[#dfbf83]/40 text-amber-100 shadow-black/80';
        case 'emerald': return 'bg-[#081514]/95 border-teal-500/40 text-teal-100 shadow-teal-950/80';
        case 'blue': return 'bg-[#091322]/95 border-blue-500/40 text-blue-100 shadow-blue-950/80';
        case 'purple':
        default: return 'bg-[#0d071a]/95 border-purple-500/50 text-purple-100 shadow-purple-950/80';
      }
    }
    if (readerTheme === 'sepia') {
      return 'bg-[#F4ECD8]/95 border-[#D4C4A8] text-[#5c3f22] shadow-amber-950/30';
    }
    switch (accentColor) {
      case 'amber': return 'bg-white/95 border-amber-300 text-amber-950 shadow-xl';
      case 'emerald': return 'bg-white/95 border-teal-300 text-teal-950 shadow-xl';
      case 'blue': return 'bg-white/95 border-blue-300 text-blue-950 shadow-xl';
      case 'purple':
      default: return 'bg-white/95 border-purple-300 text-purple-950 shadow-xl';
    }
  };

  return (
    <div className="flex flex-col">
      <div
        data-toc-active={isExactActive ? "true" : undefined}
        className={`w-full flex items-center justify-between py-2.5 px-3 text-sm rounded-xl transition-all duration-300 group cursor-pointer border ${getContainerStyles()}`}
        onClick={() => handlePageJump(node.page, node.title, node.originalIndex)}
      >
        <div className="flex items-center gap-2 flex-1 overflow-hidden min-w-0">
          {hasChildren ? (
            <Folder className={`h-4 w-4 shrink-0 ${getIconStyles()}`} strokeWidth={2} />
          ) : (
            <FileText className={`h-4 w-4 shrink-0 ${getIconStyles()}`} strokeWidth={2} />
          )}

          <div className="relative group/title flex-1 min-w-0">
            <span className="truncate text-right block leading-relaxed text-[13.5px]">
              {node.title}
            </span>

            {/* Hover Enlarged Title Preview Card */}
            <div className="absolute right-0 top-full mt-1.5 hidden group-hover/title:block z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200 delay-500">
              <div className={`max-w-md px-3.5 py-2.5 rounded-xl border text-sm font-bold shadow-2xl backdrop-blur-xl ${getHoverPreviewCardStyle()}`}>
                {node.title}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mr-2 shrink-0">
          {hasChildren && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleExpand(node.originalIndex); }}
              className={`p-1 rounded-md transition-all opacity-80 hover:opacity-100 hover:scale-110 ${isExpanded ? 'rotate-0' : 'rotate-90'} ${isExactActive ? (accentColor === 'amber' ? 'bg-black/10 text-stone-950 hover:bg-black/15' : 'bg-white/20 text-white') : isAncestorActive ? 'bg-black/10 dark:bg-white/15 text-foreground' : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400'}`}
            >
              <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300" strokeWidth={2.2} />
            </button>
          )}
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors ${getBadgeStyles()}`}>
            صـ {node.page}
          </span>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-1 transition-all duration-200">
          <div className={`overflow-hidden pr-2.5 border-r-2 mr-1 space-y-1 transition-colors ${getTreeLineBorderClass()}`}>
            {node.children.map(child => (
              <TocNode
                key={child.originalIndex}
                node={child}
                expandedNodes={expandedNodes}
                toggleExpand={toggleExpand}
                currentPage={currentPage}
                handlePageJump={handlePageJump}
                activeHeadingText={activeHeadingText}
                activeTocIndex={activeTocIndex}
                activeAncestorIndices={activeAncestorIndices}
                selectedTocIndex={selectedTocIndex}
                readerTheme={readerTheme}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const replaceIslamicLigatures = (text: string) => {
  if (!text) return text;

  const unicodeMap: Record<string, string> = {
    '\ufdfa': 'صلى الله عليه وسلم',
    '\ufd40': 'رحمه الله',
    '\ufd41': 'رحمها الله',
    '\ufd42': 'رحمهم الله',
    '\ufd43': 'رضي الله عنه',
    '\ufd44': 'رضي الله عنها',
    '\ufd45': 'رضي الله عنهم',
    '\ufd46': 'رضي الله عنهن',
    '\ufd49': 'عليهما السلام',
    '\ufd4a': 'عليهم السلام',
    '\ufd4b': 'عليه السلام',
    '\ufd4c': 'رضي الله عنهما',
    '\ufd4d': 'عليهن السلام',
    '\ufdfb': 'جل جلاله',
    '\ufdfc': 'عز وجل',
    '\ufd4e': 'سبحانه وتعالى',
  };

  let newText = text;

  // Replace unicode characters first
  for (const [key, value] of Object.entries(unicodeMap)) {
    const styledValue = `<span data-type="honorific" class="islamic-honorific font-bold mx-0.5">- ${value} -</span>`;
    newText = newText.split(`-${key}-`).join(styledValue);
    newText = newText.split(key).join(styledValue);
  }

  // Common phrases
  const phrases = [
    'صلى الله عليه وسلم',
    'صلى الله عليه وآله وسلم',
    'رضي الله عنهما',
    'رضي الله عنهم',
    'رضي الله عنها',
    'رضي الله عنه',
    'رضي الله عنهن',
    'رحمه الله تعالى',
    'رحمهم الله تعالى',
    'رحمه الله',
    'رحمها الله',
    'رحمهم الله',
    'عليهما السلام',
    'عليهم السلام',
    'عليه السلام',
    'سبحانه وتعالى',
    'عز وجل',
    'جل جلاله'
  ];

  phrases.forEach(phrase => {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(?<!<[^>]*)${escaped}(?![^<]*>)`, 'g');

    newText = newText.replace(pattern, (match, offset, fullStr) => {
      const prev = fullStr.slice(Math.max(0, offset - 40), offset);
      if (prev.includes('data-type="honorific"') || prev.includes('islamic-honorific')) return match;
      return `<span data-type="honorific" class="islamic-honorific font-bold mx-0.5">- ${match} -</span>`;
    });
  });

  return newText;
}

export interface ProcessedContent {
  main: string;
  matn: string;
  sharh?: string;
  footnote: string;
}

const processTextContent = (rawText: string): ProcessedContent => {
  if (!rawText) return { main: '', matn: '', footnote: '' };

  const cleanRaw = replaceIslamicLigatures(rawText);

  // Match <hr><s0>, <hr>, <s0>, or lines of 3+ underscores/hyphens separating main text, Sharh, and footnotes
  const footnoteSeparatorRegex = /(?:<hr\s*\/?>\s*(?:<s\d+>)?|<s\d+>|(?:\r?\n|^)\s*(?:_{3,}|[-–—]{3,})\s*(?:\r?\n|$))/gi;

  const rawParts = cleanRaw.split(footnoteSeparatorRegex).filter(p => p && p.trim());

  let matnPart = '';
  let sharhPart = '';
  let footnotePart = '';

  if (rawParts.length >= 3) {
    matnPart = rawParts[0];
    sharhPart = rawParts.slice(1, rawParts.length - 1).join('\n\n');
    footnotePart = rawParts[rawParts.length - 1];
  } else if (rawParts.length === 2) {
    matnPart = rawParts[0];
    footnotePart = rawParts[1];
  } else if (rawParts.length === 1) {
    matnPart = rawParts[0];
  }

  const formatMainText = (text: string) => {
    if (!text) return '';

    // Remove blank lines and excessive breaks immediately preceding and following title elements.
    // In white-space: pre-wrap, newlines around block-level title elements create massive unwanted vertical gaps.
    let processedText = text
      .replace(/(?:<br\s*\/?>|\s*[\r\n]+\s*)+(<span\s+data-type="title"[^>]*>|<h[1-6][^>]*>)/gi, '$1')
      .replace(/(<\/span>|<\/h[1-6]>)(?:<br\s*\/?>|\s*[\r\n]+\s*)+/gi, '$1');

    // Collapse 3+ consecutive newlines in normal text
    processedText = processedText.replace(/\n{3,}/g, '\n\n');

    // Tag title elements with data-level="1" or data-level="2" dynamically if missing
    processedText = processedText.replace(/<span\s+data-type="title"([^>]*)>([\s\S]*?)<\/span>/gi, (match, attrs, titleText) => {
      if (attrs.includes('data-level=')) {
        return match;
      }
      const cleanTitle = titleText.replace(/<[^>]+>/g, '').trim();
      const isLevel1 = /^(?:كتاب|كِتَابُ?|باب|بَابُ?)\s+/i.test(cleanTitle);
      const levelAttr = isLevel1 ? 'data-level="1"' : 'data-level="2"';
      return `<span data-type="title" ${levelAttr} ${attrs}>${titleText}</span>`;
    });

    const fnBadge = (_: string, num: string) =>
      `<span class="islamic-footnote-sup inline-flex items-center justify-center mx-1 align-baseline"><a href="#fn-${num}" data-type="footnote-ref" class="islamic-footnote-ref font-scheherazade font-bold text-[13px] shadow-2xs no-underline transition-all hover:scale-110 border-b-0 cursor-pointer">${num}</a></span>`;

    return processedText
      // 1. Wrapped markers: (^1), ^(1), ^1, (1), [1], (1^)
      .replace(/\s*[-–—]?\s*\(\^\s*([\d\u0660-\u0669]+)\)\s*[-–—]?/g, fnBadge)
      .replace(/\s*[-–—]?\s*\^\(([\d\u0660-\u0669]+)\)\s*[-–—]?/g, fnBadge)
      .replace(/\s*[-–—]?\s*\^([\d\u0660-\u0669]+)\s*[-–—]?/g, fnBadge)
      .replace(/\s*\(([\d\u0660-\u0669]+)\^\)\s*/g, fnBadge)
      .replace(/\s*[-–—]+\s*\(([\d\u0660-\u0669]+)\)\s*[-–—]+/g, fnBadge)
      .replace(/\s*\(([\d\u0660-\u0669]{1,2})\)\s*/g, fnBadge)
      .replace(/\s*\[([\d\u0660-\u0669]{1,2})\]\s*/g, fnBadge)

      // 2. Digits attached directly to the end of words (e.g., بالدمشقي١., النضح٣،)
      .replace(/(?<=[\p{L}])([\d\u0660-\u0669]{1,2})(?=[.,،:;"'«»)\s]|$)/gu, fnBadge)

      // 3. Digits immediately following quotes/punctuation before a period/comma (e.g., "من ماء" ٢.)
      .replace(/(?<=["'»])\s*([\d\u0660-\u0669]{1,2})(?=[.,،:;]|\s*[.,،:;])/gu, fnBadge);
  };

  const formattedMatn = formatMainText(matnPart);
  const formattedSharh = formatMainText(sharhPart);
  const mainCombined = formattedSharh ? `${formattedMatn}\n\n${formattedSharh}` : formattedMatn;

  return {
    main: mainCombined,
    matn: formattedMatn,
    sharh: formattedSharh || undefined,
    footnote: footnotePart || ''
  };
};

export type FootnoteItem = {
  num: string;
  text: string;
};

const parseFootnoteItems = (rawFootnoteText: string): FootnoteItem[] => {
  if (!rawFootnoteText || !rawFootnoteText.trim()) return [];

  // Pre-process: insert a newline before footnote badges or explicit item numbers
  const normalizedText = rawFootnoteText
    // 1. HTML footnote badges/links from API: <span class="..."><a href="#fn-1">1</a></span> or <a href="#fn-1">
    .replace(/(<span\s+class="[^"]*islamic-footnote-sup[^"]*"[^>]*>[\s\S]*?<\/span>)/gi, '\n$1')
    .replace(/(?<!<span[^>]*>)(<a\s+[^>]*href="#fn-[^"]*"[^>]*>[\s\S]*?<\/a>)/gi, '\n$1')

    // 2. Explicit wrapped or prefixed footnote text markers: (1), (١), [1], 1., ١., 1-, ١-
    .replace(/(?:^|\r?\n|\s{2,})(?:[-–—]?\s*[\(\[]\s*\^?\s*([\d\u0660-\u0669]{1,2})\s*[\)\]]\s*[-–—]?)/g, '\n($1)')
    .replace(/(?:^|\r?\n|\s{2,})([\d\u0660-\u0669]{1,2}\s*[\.\-–—]\s+)/g, '\n$1')

    // 3. Inline bare footnote numbers (like ١ القلتان... . ٢ أخرجه... . ٣ النضح:...)
    // Exclude Hadith/reference numbers preceded by "برقم", "رقم", "صـ", "صفحة", "سنة", "عام"
    .replace(/(?<!برقم\s*|رقم\s*|صـ\s*|صفحة\s*|عام\s*|سنة\s*)(?<=\.|;|:|\r?\n|^|\s{2,})\s*([\d\u0660-\u0669]{1,2})\s+(?=[\p{L}"'«\(\[])/gu, '\n$1 ');

  const lines = normalizedText.split(/\n+/);
  const items: FootnoteItem[] = [];
  let currentItem: FootnoteItem | null = null;

  const htmlBadgeRegex = /^<span\s+class="[^"]*islamic-footnote-sup[^"]*"[^>]*>[\s\S]*?<a[^>]*>([\d\u0660-\u0669]+)<\/a>[\s\S]*?<\/span>\s*(.*)/i;
  const htmlAnchorRegex = /^<a\s+[^>]*href="#fn-([\d\u0660-\u0669]+)"[^>]*>([\d\u0660-\u0669]+)<\/a>\s*(.*)/i;
  const textMarkerRegex = /^\s*[-–—]?\s*[\(\[]?\s*\^?\s*([\d\u0660-\u0669]{1,2})\s*[\)\]\.\-–—]?\s*(.*)/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const htmlMatch = trimmed.match(htmlBadgeRegex) || trimmed.match(htmlAnchorRegex);
    const textMatch = trimmed.match(textMarkerRegex);

    if (htmlMatch) {
      if (currentItem) items.push(currentItem);
      currentItem = {
        num: htmlMatch[1],
        text: htmlMatch[2] ? htmlMatch[2].trim() : ''
      };
    } else if (textMatch) {
      if (currentItem) items.push(currentItem);
      currentItem = {
        num: textMatch[1],
        text: textMatch[2] ? textMatch[2].trim() : ''
      };
    } else if (currentItem) {
      currentItem.text += ' ' + trimmed;
    } else {
      currentItem = {
        num: (items.length + 1).toString(),
        text: trimmed
      };
    }
  }

  if (currentItem) {
    items.push(currentItem);
  }

  return items;
};

const formatPageCopyText = (
  matn: string,
  sharh?: string,
  footnote?: string,
  bookTitle?: string,
  author?: string,
  pageNum?: number
): string => {
  const stripHtmlTags = (html: string) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || doc.body.innerText || '';
  };

  const matnClean = stripHtmlTags(matn).trim();
  const sharhClean = sharh ? stripHtmlTags(sharh).trim() : '';

  let footnoteFormatted = '';
  if (footnote) {
    const footnoteItems = parseFootnoteItems(footnote);
    if (footnoteItems.length > 0) {
      footnoteFormatted = footnoteItems
        .map(item => `[${item.num}] ${stripHtmlTags(item.text).trim()}`)
        .join('\n');
    } else {
      footnoteFormatted = stripHtmlTags(footnote).trim();
    }
  }

  let fullText = matnClean;

  if (sharhClean) {
    fullText += `\n\n--- [ الشرح ] ---\n${sharhClean}`;
  }

  if (footnoteFormatted) {
    fullText += `\n\n--- [ الحواشي والتعليقات ] ---\n${footnoteFormatted}`;
  }

  if (bookTitle) {
    fullText += `\n\n[${bookTitle}${author ? ' - ' + author : ''}${pageNum ? ' - صـ ' + pageNum : ''}]`;
  }

  return fullText;
};

const RenderSharhDivider = ({ readerTheme }: { readerTheme: 'light' | 'dark' | 'sepia' }) => (
  <div className="relative my-10 flex items-center justify-center">
    <div className="absolute inset-0 flex items-center">
      <div
        className={`w-full border-t-2 border-dashed ${readerTheme === 'dark'
          ? 'border-amber-500/35'
          : readerTheme === 'sepia'
            ? 'border-[#B89F7D]'
            : 'border-amber-400/60'
          }`}
      />
    </div>
    <div
      className={`relative px-4 py-1 text-xs font-extrabold rounded-full border backdrop-blur-md transition-all ${readerTheme === 'dark'
        ? 'bg-[#181825] border-amber-500/40 text-amber-300 shadow-sm'
        : readerTheme === 'sepia'
          ? 'bg-[#F4ECD8] border-[#C8B89E] text-[#7A401A] shadow-2xs'
          : 'bg-white border-amber-300 text-amber-900 shadow-xs'
        }`}
    >
      الشرح
    </div>
  </div>
);

const RenderFootnotes = ({
  footnoteText,
  readerTheme,
  fontFamily,
  fontSize
}: {
  footnoteText: string;
  readerTheme: 'light' | 'dark' | 'sepia';
  fontFamily: string;
  fontSize: number;
}) => {
  const { accentColor } = useTheme();
  const items = useMemo(() => parseFootnoteItems(footnoteText), [footnoteText]);

  if (!footnoteText || !footnoteText.trim()) return null;

  const getCardBg = () => {
    if (readerTheme === 'dark') {
      switch (accentColor) {
        case 'amber': return 'bg-[#10131a]/70 border-[#dfbf83]/25 hover:border-[#dfbf83]/40 text-amber-100 shadow-sm';
        case 'emerald': return 'bg-[#061413]/70 border-teal-500/25 hover:border-teal-400/40 text-teal-100 shadow-sm';
        case 'blue': return 'bg-[#061020]/70 border-blue-500/25 hover:border-blue-400/40 text-blue-100 shadow-sm';
        case 'purple':
        default: return 'bg-purple-950/30 border-purple-500/25 hover:border-purple-400/40 text-purple-100 shadow-sm';
      }
    }
    if (readerTheme === 'sepia') {
      return 'bg-[#F4ECD8]/80 border-[#D4C4A8] hover:border-[#B89F7D] text-[#4A3523] shadow-2xs';
    }
    switch (accentColor) {
      case 'amber': return 'bg-white/95 border-amber-200/90 hover:border-[#dfbf83] text-stone-900 shadow-xs';
      case 'emerald': return 'bg-white/95 border-teal-200/90 hover:border-teal-400 text-slate-900 shadow-xs';
      case 'blue': return 'bg-white/95 border-blue-200/90 hover:border-blue-400 text-slate-900 shadow-xs';
      case 'purple':
      default: return 'bg-white/95 border-purple-200/90 hover:border-purple-300 text-slate-800 shadow-xs';
    }
  };

  const getBadgeStyle = () => {
    if (readerTheme === 'dark') {
      switch (accentColor) {
        case 'amber': return 'bg-gradient-to-br from-[#8e682d] via-[#b88d46] to-[#dfbf83] text-stone-950 font-black border-[#dfbf83]/50 shadow-xs';
        case 'emerald': return 'bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-500 text-white font-bold border-teal-400/50 shadow-xs';
        case 'blue': return 'bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 text-white font-bold border-blue-400/50 shadow-xs';
        case 'purple':
        default: return 'bg-gradient-to-r from-purple-600 to-brand-magenta text-white font-bold border-purple-400/40 shadow-xs';
      }
    }
    if (readerTheme === 'sepia') {
      return 'bg-[#E5D7BF] text-[#5C3F22] border-[#C8B89E] font-bold';
    }
    switch (accentColor) {
      case 'amber': return 'bg-gradient-to-br from-[#8e682d] via-[#b88d46] to-[#dfbf83] text-stone-950 font-black border-[#b88d46]/60 shadow-xs';
      case 'emerald': return 'bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-500 text-white font-bold border-teal-500/60 shadow-xs';
      case 'blue': return 'bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 text-white font-bold border-blue-500/60 shadow-xs';
      case 'purple':
      default: return 'bg-gradient-to-r from-purple-600 to-brand-magenta text-white font-bold border-purple-300 shadow-xs';
    }
  };

  const getDividerLineClass = () => {
    if (readerTheme === 'dark') {
      switch (accentColor) {
        case 'amber': return 'border-amber-500/35';
        case 'emerald': return 'border-teal-500/35';
        case 'blue': return 'border-blue-500/35';
        case 'purple':
        default: return 'border-purple-500/30';
      }
    }
    if (readerTheme === 'sepia') return 'border-[#C8B89E]';
    switch (accentColor) {
      case 'amber': return 'border-amber-300/80';
      case 'emerald': return 'border-teal-300/80';
      case 'blue': return 'border-blue-300/80';
      case 'purple':
      default: return 'border-purple-200/80';
    }
  };

  const getHeaderBadgeClass = () => {
    if (readerTheme === 'dark') {
      switch (accentColor) {
        case 'amber': return 'bg-[#10131a] border-[#dfbf83]/40 text-[#eed9b0] shadow-sm';
        case 'emerald': return 'bg-[#061413] border-teal-500/40 text-teal-300 shadow-sm';
        case 'blue': return 'bg-[#061020] border-blue-500/40 text-blue-300 shadow-sm';
        case 'purple':
        default: return 'bg-[#181825] border-purple-500/40 text-purple-300 shadow-sm';
      }
    }
    if (readerTheme === 'sepia') return 'bg-[#F4ECD8] border-[#C8B89E] text-[#5C3F22] shadow-2xs';
    switch (accentColor) {
      case 'amber': return 'bg-[#fdfaf3] border-[#dfbf83] text-[#78531b] shadow-xs';
      case 'emerald': return 'bg-teal-50 border-teal-300 text-teal-900 shadow-xs';
      case 'blue': return 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs';
      case 'purple':
      default: return 'bg-white border-purple-200 text-purple-800 shadow-xs';
    }
  };

  return (
    <div className="mt-14 pt-2">
      {/* Footnote Section Header Divider */}
      <div className="relative my-8 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div
            className={`w-full border-t-2 border-dashed ${getDividerLineClass()}`}
          />
        </div>
        <div
          className={`relative px-4 py-1 text-sm font-bold font-scheherazade rounded-full border backdrop-blur-md transition-all ${getHeaderBadgeClass()}`}
        >
          الحواشي والتعليقات
        </div>
      </div>

      {/* Footnote List */}
      {items.length > 0 ? (
        <div className="grid gap-3.5">
          {items.map((item, idx) => (
            <div
              key={idx}
              id={`fn-${item.num}`}
              className={`group flex items-start gap-3.5 p-4 rounded-2xl border transition-all duration-300 ${getCardBg()}`}
            >
              {/* Stylized Circular Number Badge */}
              <span className={`shrink-0 font-scheherazade font-bold text-sm rounded-full border flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:scale-105 ${getBadgeStyle()}`}>
                {item.num}
              </span>

              {/* Text */}
              <div
                className={`turath-content flex-1 leading-relaxed ${fontFamily}`}
                style={{ fontSize: `${Math.max(13, fontSize - 3)}px` }}
                dangerouslySetInnerHTML={{ __html: replaceIslamicLigatures(item.text) }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          className={`turath-content prose max-w-none leading-loose opacity-80 ${fontFamily}`}
          style={{ fontSize: `${Math.max(12, fontSize - 4)}px` }}
          dangerouslySetInnerHTML={{ __html: footnoteText }}
        />
      )}
    </div>
  );
};

export default function TurathReader({
  book,
  onClose,
  onAskBook,
  globalFontSize,
  onSelectAuthor,
  onOpenSidebar,
  onReaderThemeChange,
}: {
  book: BookMeta
  onClose: () => void
  onAskBook: (b: BookMeta) => void
  globalFontSize?: 'small' | 'medium' | 'large'
  onSelectAuthor?: (authorName: string) => void
  onOpenSidebar?: () => void
  onReaderThemeChange?: (theme: 'light' | 'dark' | 'sepia') => void
}) {
  const { theme, accentColor, isDark } = useTheme()
  const [loadingBook, setLoadingBook] = useState(true)
  const [toc, setToc] = useState<Heading[]>([])
  const [authorName, setAuthorName] = useState<string>(book.author === "بحث في الفهرس" ? "" : book.author)
  const [authorId, setAuthorId] = useState<number | null>(null)

  const initialPageNum = book.savedPage && book.savedPage > 0 ? book.savedPage : 1;
  const [currentPage, setCurrentPage] = useState<number>(initialPageNum);
  const [loadingPage, setLoadingPage] = useState(false);
  const [pageText, setPageText] = useState<{ main: string; matn?: string; sharh?: string; footnote: string } | null>(null);

  const [tocSearch, setTocSearch] = useState('');
  const [pageInput, setPageInput] = useState<string>(String(initialPageNum));

  // If book.savedPage changes dynamically on opened book
  useEffect(() => {
    if (book.savedPage && book.savedPage > 0) {
      setCurrentPage(book.savedPage);
      setPageInput(String(book.savedPage));
    }
  }, [book.id, book.savedPage]);

  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set())

  // Reader font size state - Default is strictly 22px
  const [fontSize, setFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('turath_reader_font_size');
      if (saved) {
        const parsed = Number(saved);
        // If it was saved as 28 from the previous default, reset to 22
        if (parsed === 28) {
          localStorage.setItem('turath_reader_font_size', '22');
          return 22;
        }
        if (parsed >= 14 && parsed <= 40) return parsed;
      }
    } catch { }
    return 22;
  });
  const [fontFamily, setFontFamily] = useState<string>('font-amiri');

  useEffect(() => {
    try {
      localStorage.setItem('turath_reader_font_size', String(fontSize));
    } catch { }
  }, [fontSize]);

  useEffect(() => {
    if (globalFontSize) {
      if (globalFontSize === 'small') setFontSize(18);
      else if (globalFontSize === 'medium') setFontSize(22);
      else if (globalFontSize === 'large') setFontSize(22);
    }
  }, [globalFontSize]);
  const [readerTheme, setReaderTheme] = useState<'light' | 'dark' | 'sepia'>(() => theme === 'dark' ? 'dark' : 'light')

  useEffect(() => {
    onReaderThemeChange?.(readerTheme);
  }, [readerTheme, onReaderThemeChange]);

  // -------------------------------------------------------------------------
  // Dynamic 4-Theme Styling Helpers for Reader
  // -------------------------------------------------------------------------
  const getReaderRootBg = () => {
    if (readerTheme === 'dark') {
      switch (accentColor) {
        case 'amber': return 'bg-[#090b10] text-slate-100';
        case 'emerald': return 'bg-[#061110] text-slate-100';
        case 'blue': return 'bg-[#060e1a] text-slate-100';
        case 'purple':
        default: return 'bg-[#0d071a] text-slate-100';
      }
    }
    if (readerTheme === 'sepia') {
      return 'bg-[#fcf8f0] text-[#3d2c1d] sepia-reader';
    }
    switch (accentColor) {
      case 'amber': return 'bg-[#faf7f0] text-stone-900';
      case 'emerald': return 'bg-[#f0fdfa] text-slate-900';
      case 'blue': return 'bg-[#f0f7ff] text-slate-900';
      case 'purple':
      default: return 'bg-[#faf8fd] text-slate-900';
    }
  };

  const getReaderPatternColor = () => {
    if (readerTheme === 'dark') {
      switch (accentColor) {
        case 'amber': return 'text-[#dfbf83]';
        case 'emerald': return 'text-teal-400';
        case 'blue': return 'text-blue-400';
        case 'purple':
        default: return 'text-purple-400';
      }
    }
    if (readerTheme === 'sepia') {
      return 'text-[#b45309]';
    }
    switch (accentColor) {
      case 'amber': return 'text-[#b88d46]';
      case 'emerald': return 'text-teal-600';
      case 'blue': return 'text-blue-600';
      case 'purple':
      default: return 'text-purple-600';
    }
  };

  const getReaderFrameBgColor = (opacity: number) => {
    switch (accentColor) {
      case 'amber': return `rgba(13, 16, 22, ${opacity / 100})`;
      case 'emerald': return `rgba(8, 20, 19, ${opacity / 100})`;
      case 'blue': return `rgba(8, 16, 28, ${opacity / 100})`;
      case 'purple':
      default: return `rgba(13, 7, 26, ${opacity / 100})`;
    }
  };

  const getReaderBackButtonClass = () => {
    if (readerTheme === 'dark') {
      switch (accentColor) {
        case 'amber':
          return 'bg-white/5 border border-white/10 text-[#eed9b0] hover:bg-gradient-to-r hover:from-[#8e682d] hover:to-[#dfbf83] hover:text-stone-950 font-bold';
        case 'emerald':
          return 'bg-white/5 border border-white/10 text-teal-300 hover:bg-teal-600 hover:text-white font-bold';
        case 'blue':
          return 'bg-white/5 border border-white/10 text-blue-300 hover:bg-blue-600 hover:text-white font-bold';
        case 'purple':
        default:
          return 'bg-white/5 border border-white/10 text-purple-300 hover:bg-brand-magenta hover:text-white font-bold';
      }
    }
    switch (accentColor) {
      case 'amber':
        return 'border border-[#dfbf83]/80 bg-gradient-to-br from-[#dfbf83]/20 via-[#dfbf83]/35 to-[#b88d46]/25 text-[#78531b] hover:from-[#8e682d] hover:to-[#dfbf83] hover:text-stone-950 shadow-sm font-bold';
      case 'emerald':
        return 'border border-teal-300/80 bg-teal-50 text-teal-800 hover:bg-teal-600 hover:text-white shadow-sm font-bold';
      case 'blue':
        return 'border border-blue-300/80 bg-blue-50 text-blue-800 hover:bg-blue-600 hover:text-white shadow-sm font-bold';
      case 'purple':
      default:
        return 'border border-purple-200/80 bg-purple-50 text-brand-magenta hover:bg-brand-magenta hover:text-white shadow-sm font-bold';
    }
  };

  const getNavCircleBtnStyle = () => {
    if (readerTheme === 'dark') {
      switch (accentColor) {
        case 'amber':
          return 'bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-[#dfbf83]/50 text-slate-300 hover:text-[#eed8ad] shadow-xs hover:shadow-[#dfbf83]/20 transition-all';
        case 'emerald':
          return 'bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-teal-400/50 text-slate-300 hover:text-teal-200 shadow-xs hover:shadow-teal-500/20 transition-all';
        case 'blue':
          return 'bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-blue-400/50 text-slate-300 hover:text-blue-200 shadow-xs hover:shadow-blue-500/20 transition-all';
        case 'purple':
        default:
          return 'bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-purple-400/50 text-slate-300 hover:text-purple-200 shadow-xs hover:shadow-purple-500/20 transition-all';
      }
    }
    switch (accentColor) {
      case 'amber':
        return 'bg-white/80 hover:bg-white border border-[#ebd9b5] hover:border-[#dfbf83] text-[#8a652a] shadow-xs';
      case 'emerald':
        return 'bg-white/80 hover:bg-white border border-teal-200 hover:border-teal-300 text-teal-800 shadow-xs';
      case 'blue':
        return 'bg-white/80 hover:bg-white border border-blue-200 hover:border-blue-300 text-blue-800 shadow-xs';
      case 'purple':
      default:
        return 'bg-white/80 hover:bg-white border border-purple-200 hover:border-purple-300 text-purple-800 shadow-xs';
    }
  };

  const getHeaderTabActiveStyle = (tab: 'toc' | 'search' | 'hadiths' | 'chat') => {
    if (tab === 'hadiths') {
      if (readerTheme === 'dark') {
        return 'bg-amber-500/25 border border-amber-500/50 text-white shadow-lg shadow-amber-500/25 font-extrabold scale-[1.02] ring-1 ring-amber-500/30';
      }
      return 'bg-gradient-to-b from-white/90 via-amber-50/60 to-amber-100/70 backdrop-blur-xl border border-amber-300/80 text-amber-950 shadow-md shadow-amber-500/10 font-extrabold scale-[1.02]';
    }
    if (readerTheme === 'dark') {
      switch (accentColor) {
        case 'amber':
          return 'bg-[#b88d46]/25 border border-[#dfbf83]/50 text-[#eed9b0] shadow-lg shadow-amber-950/30 font-extrabold scale-[1.02] ring-1 ring-[#dfbf83]/30';
        case 'emerald':
          return 'bg-teal-500/25 border border-teal-400/50 text-teal-200 shadow-lg shadow-teal-950/30 font-extrabold scale-[1.02] ring-1 ring-teal-400/30';
        case 'blue':
          return 'bg-blue-500/25 border border-blue-400/50 text-blue-200 shadow-lg shadow-blue-950/30 font-extrabold scale-[1.02] ring-1 ring-blue-400/30';
        case 'purple':
        default:
          return 'bg-purple-500/25 border border-purple-400/50 text-purple-200 shadow-lg shadow-purple-950/30 font-extrabold scale-[1.02] ring-1 ring-purple-400/30';
      }
    } else {
      switch (accentColor) {
        case 'amber':
          return 'bg-gradient-to-b from-white/90 via-amber-50/70 to-amber-100/80 backdrop-blur-xl border border-[#b88d46]/60 text-stone-950 shadow-md shadow-amber-600/10 font-extrabold scale-[1.02]';
        case 'emerald':
          return 'bg-gradient-to-b from-white/90 via-teal-50/60 to-teal-100/70 backdrop-blur-xl border border-teal-300/80 text-teal-950 shadow-md shadow-teal-500/10 font-extrabold scale-[1.02]';
        case 'blue':
          return 'bg-gradient-to-b from-white/90 via-blue-50/60 to-blue-100/70 backdrop-blur-xl border border-blue-300/80 text-blue-950 shadow-md shadow-blue-500/10 font-extrabold scale-[1.02]';
        case 'purple':
        default:
          return 'bg-gradient-to-b from-white/90 via-purple-50/60 to-purple-100/70 backdrop-blur-xl border border-purple-300/80 text-purple-950 shadow-md shadow-purple-500/10 font-extrabold scale-[1.02]';
      }
    }
  };

  const getHeaderTitleColor = () => {
    switch (accentColor) {
      case 'amber':
        return readerTheme === 'dark' ? 'text-[#dfbf83]' : 'text-[#8e682d]';
      case 'emerald':
        return readerTheme === 'dark' ? 'text-teal-300' : 'text-teal-800';
      case 'blue':
        return readerTheme === 'dark' ? 'text-sky-300' : 'text-blue-800';
      case 'purple':
      default:
        return readerTheme === 'dark' ? 'text-purple-300' : 'text-[#7e1891]';
    }
  };

  const getHeaderAuthorBadgeClass = () => {
    return readerTheme === 'dark'
      ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
      : 'bg-black/5 border-black/10 text-slate-800 hover:bg-black/10';
  };

  const getAccentDotColor = () => {
    switch (accentColor) {
      case 'amber': return 'bg-[#b88d46] shadow-[0_0_6px_#b88d46]';
      case 'emerald': return 'bg-teal-500 shadow-[0_0_6px_#14b8a6]';
      case 'blue': return 'bg-blue-500 shadow-[0_0_6px_#3b82f6]';
      case 'purple':
      default: return 'bg-brand-magenta shadow-[0_0_6px_#950bc4]';
    }
  };

  const getAuthorBioTagStyle = () => {
    switch (accentColor) {
      case 'amber': return 'bg-[#b88d46]/20 text-stone-900 dark:text-[#eed9b0]';
      case 'emerald': return 'bg-teal-500/20 text-teal-800 dark:text-teal-200';
      case 'blue': return 'bg-blue-500/20 text-blue-800 dark:text-blue-200';
      case 'purple':
      default: return 'bg-brand-magenta/20 text-brand-magenta';
    }
  };

  const getBreadcrumbChapterColor = () => {
    if (readerTheme === 'dark') {
      switch (accentColor) {
        case 'amber': return 'text-[#eed9b0]';
        case 'emerald': return 'text-teal-300';
        case 'blue': return 'text-blue-300';
        case 'purple':
        default: return 'text-purple-300';
      }
    }
    switch (accentColor) {
      case 'amber': return 'text-[#76541f]';
      case 'emerald': return 'text-teal-800';
      case 'blue': return 'text-blue-800';
      case 'purple':
      default: return 'text-brand-magenta';
    }
  };

  const getPaginationBtnHoverClass = () => {
    switch (accentColor) {
      case 'amber': return 'hover:bg-gradient-to-r hover:from-[#8e682d] hover:to-[#dfbf83] hover:text-stone-950';
      case 'emerald': return 'hover:bg-teal-600 hover:text-white';
      case 'blue': return 'hover:bg-blue-600 hover:text-white';
      case 'purple':
      default: return 'hover:bg-brand-magenta hover:text-white';
    }
  };

  const getPaginationInputContainerClass = () => {
    if (readerTheme === 'dark') {
      switch (accentColor) {
        case 'amber': return 'bg-amber-500/10 border-amber-500/30 text-amber-200';
        case 'emerald': return 'bg-teal-500/10 border-teal-500/30 text-teal-200';
        case 'blue': return 'bg-blue-500/10 border-blue-500/30 text-blue-200';
        case 'purple':
        default: return 'bg-purple-500/10 border-purple-500/30 text-purple-200';
      }
    }
    if (readerTheme === 'sepia') {
      return 'bg-[#EBDBC0] border-[#D4C4A8] text-[#5C3A1E]';
    }
    switch (accentColor) {
      case 'amber': return 'bg-amber-50 border-amber-200 text-stone-900';
      case 'emerald': return 'bg-teal-50 border-teal-200 text-teal-950';
      case 'blue': return 'bg-blue-50 border-blue-200 text-blue-950';
      case 'purple':
      default: return 'bg-purple-50 border-purple-200 text-purple-950';
    }
  };

  const getPaginationLayersIconClass = () => {
    switch (accentColor) {
      case 'amber': return 'text-[#b88d46]';
      case 'emerald': return 'text-teal-600 dark:text-teal-400';
      case 'blue': return 'text-blue-600 dark:text-blue-400';
      case 'purple':
      default: return 'text-purple-600 dark:text-purple-400';
    }
  };

  const lightTitleColor = accentColor === 'amber' ? '#8e682d' : accentColor === 'emerald' ? '#0d9488' : accentColor === 'blue' ? '#2563eb' : '#950bc4';
  const lightTitleBorder = accentColor === 'amber' ? 'rgba(142, 104, 45, 0.4)' : accentColor === 'emerald' ? 'rgba(13, 148, 136, 0.4)' : accentColor === 'blue' ? 'rgba(37, 99, 235, 0.4)' : 'rgba(149, 11, 196, 0.4)';

  const darkTitleColor = accentColor === 'amber' ? '#dfbf83' : accentColor === 'emerald' ? '#2dd4bf' : accentColor === 'blue' ? '#60a5fa' : '#c084fc';
  const darkTitleBorder = accentColor === 'amber' ? 'rgba(223, 191, 131, 0.4)' : accentColor === 'emerald' ? 'rgba(45, 212, 191, 0.4)' : accentColor === 'blue' ? 'rgba(96, 165, 250, 0.4)' : 'rgba(192, 132, 252, 0.4)';

  const inputFocusBorderClass = accentColor === 'amber'
    ? 'focus:border-[#b88d46]'
    : accentColor === 'emerald'
      ? 'focus:border-teal-500'
      : accentColor === 'blue'
        ? 'focus:border-blue-500'
        : 'focus:border-purple-500';

  const selectionClass = accentColor === 'amber'
    ? 'selection:bg-amber-400/30 selection:text-stone-950 dark:selection:text-amber-100'
    : accentColor === 'emerald'
      ? 'selection:bg-teal-400/30 selection:text-teal-950 dark:selection:text-teal-100'
      : accentColor === 'blue'
        ? 'selection:bg-blue-400/30 selection:text-blue-950 dark:selection:text-blue-100'
        : 'selection:bg-brand-magenta/30 selection:text-brand-deep dark:selection:text-white';

  const [distractionFree, setDistractionFree] = useState(false)
  const [readingMode, setReadingMode] = useState<'paged' | 'continuous'>('paged')
  const [continuousPages, setContinuousPages] = useState<{ page: number; text: string; matn?: string; sharh?: string; footnote?: string }[]>([])
  const [loadingNext, setLoadingNext] = useState(false)
  const [hasReachedEnd, setHasReachedEnd] = useState(false)
  const [loadNextError, setLoadNextError] = useState(false)
  const [loadingPrev, setLoadingPrev] = useState(false)
  const [hasReachedStart, setHasReachedStart] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [targetHeading, setTargetHeading] = useState<string | null>(null)
  const pageSessionRef = useRef(0)
  const isJumpingRef = useRef(false)
  const [activeHeadingText, setActiveHeadingText] = useState<string | null>(null)
  const [selectedTocIndex, setSelectedTocIndex] = useState<number | null>(null)

  // -------------------------------------------------------------------------
  // Feature 2: Hadiths & Numbered Texts Mapping
  // -------------------------------------------------------------------------
  const [hadithsMap, setHadithsMap] = useState<Record<string, number>>({})
  const [hadithSearchInput, setHadithSearchInput] = useState('')

  // -------------------------------------------------------------------------
  // Feature 3: Printed Page Mapping, Volumes & Bounds
  // -------------------------------------------------------------------------
  const [pageMap, setPageMap] = useState<(string | null)[]>([])
  const [volumeBounds, setVolumeBounds] = useState<Record<string, [number, number]>>({})
  const [printPgToPg, setPrintPgToPg] = useState<Record<string, number>>({})
  const [volumesList, setVolumesList] = useState<string[]>([])
  const [printVolInput, setPrintVolInput] = useState('')
  const [printPageInput, setPrintPageInput] = useState('')

  // -------------------------------------------------------------------------
  // Feature 4: Full-Text In-Book Search
  // -------------------------------------------------------------------------
  const [bookSearchQuery, setBookSearchQuery] = useState('')
  const [bookSearchResults, setBookSearchResults] = useState<TurathSearchHit[]>([])
  const [isSearchingBook, setIsSearchingBook] = useState(false)
  const [hasSearchedBook, setHasSearchedBook] = useState(false)
  const [highlightedKeyword, setHighlightedKeyword] = useState<string | null>(null)

  // -------------------------------------------------------------------------
  // Feature 5: Multi-Volume PDF Mapping
  // -------------------------------------------------------------------------
  const [pdfBase, setPdfBase] = useState<string | null>(null)
  const [pdfsMap, setPdfsMap] = useState<Record<string, string>>({})
  const [showPdfModal, setShowPdfModal] = useState(false)

  // -------------------------------------------------------------------------
  // Feature 6: Offline Book Storage
  // -------------------------------------------------------------------------
  const [isSavedOffline, setIsSavedOffline] = useState(false)
  const [isSavingOffline, setIsSavingOffline] = useState(false)
  const [offlineSaveProgress, setOfflineSaveProgress] = useState(0)

  // Unified Download / Export Dropdown Menu State
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false)
  const downloadMenuRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgressText, setExportProgressText] = useState('')
  const [loadingPdf, setLoadingPdf] = useState(false)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(e.target as Node)) {
        setIsDownloadMenuOpen(false);
      }
    };
    if (isDownloadMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDownloadMenuOpen]);

  // In-memory page cache per book session (0ms instant page loads)
  const pageCacheRef = useRef<Map<number, ProcessedContent>>(new Map())

  // Reset page cache when opening a different book
  useEffect(() => {
    pageCacheRef.current.clear()
  }, [book.id])

  // High-performance single page fetcher with in-memory caching and fallback
  const fetchPageData = useCallback(async (pageNum: number): Promise<ProcessedContent | null> => {
    // 1. In-memory cache hit (0ms instant)
    if (pageCacheRef.current.has(pageNum)) {
      return pageCacheRef.current.get(pageNum)!;
    }

    const bookNumId = Number(book.id);

    // 1.5. Offline IndexedDB storage check (works 100% without internet)
    try {
      const offlinePkg = await idbGetOfflineBook(book.id);
      if (offlinePkg && offlinePkg.cachedPages && offlinePkg.cachedPages[pageNum]) {
        const cached = offlinePkg.cachedPages[pageNum];
        const processed = processTextContent(cached.text || cached.main || '');
        pageCacheRef.current.set(pageNum, processed);
        return processed;
      }
    } catch (e) { }

    // 2. Fetch single page via fast lightweight Turath API (Vite proxy / Turath proxy)
    try {
      const turathRes = await fetchTurathPage(bookNumId, pageNum);
      if (turathRes && typeof turathRes.text === 'string') {
        const processed = processTextContent(turathRes.text);
        pageCacheRef.current.set(pageNum, processed);
        return processed;
      }
    } catch (err) {
      console.warn('Fast Turath page fetch failed, falling back:', err);
    }

    // 3. Fallback to HF Space preview endpoint
    try {
      const baseUrl = import.meta.env.VITE_DATA_INGESTION_URL || 'https://abourida-zad-tutor-engine-space.hf.space';
      const res = await fetch(`${baseUrl}/api/v1/data-ingestion/turath-page-preview/${book.id}/${pageNum}`);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.text === 'string') {
          const processed = processTextContent(data.text);
          pageCacheRef.current.set(pageNum, processed);
          return processed;
        }
      }
    } catch (err) {
      console.error('Fallback preview page fetch failed:', err);
    }

    return null;
  }, [book.id]);

  const handleSetReadingMode = (mode: 'paged' | 'continuous') => {
    if (mode === readingMode) return;

    isJumpingRef.current = true;
    setReadingMode(mode);

    if (mode === 'continuous') {
      if (pageText) {
        setContinuousPages([{
          page: currentPage,
          text: pageText.main,
          matn: pageText.matn,
          sharh: pageText.sharh,
          footnote: pageText.footnote
        }]);
      }
      setHasReachedStart(currentPage <= 1);
      setHasReachedEnd(false);
      setLoadNextError(false);

      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0 });
      }
    }

    setTimeout(() => {
      isJumpingRef.current = false;
    }, 600);
  };

  // Track active heading and active page dynamically based on scroll position
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;

    const handleScrollSync = () => {
      if (isJumpingRef.current) return;

      // 1. Detect active page based on scroll position in continuous mode
      if (readingMode === 'continuous') {
        const pageElements = container.querySelectorAll('[data-page]');
        if (pageElements.length > 0) {
          const containerRect = container.getBoundingClientRect();
          let bestPage: number | null = null;
          let minDelta = Infinity;

          pageElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const delta = Math.abs(rect.top - containerRect.top - 100);
            if (rect.bottom > containerRect.top + 60 && rect.top < containerRect.bottom - 60) {
              if (delta < minDelta) {
                minDelta = delta;
                bestPage = Number(el.getAttribute('data-page'));
              }
            }
          });

          if (bestPage !== null && bestPage > 0) {
            setCurrentPage(prev => (prev !== bestPage ? bestPage! : prev));
          }
        }
      }

      // 2. Detect active heading text based on visible headings
      const headings = container.querySelectorAll('h1, h2, h3, h4, span[data-type="title"]');
      if (headings.length > 0) {
        const containerRect = container.getBoundingClientRect();
        let currentHeading: string | null = null;
        let minHeadingDist = Infinity;

        headings.forEach(h => {
          const rect = h.getBoundingClientRect();
          const distFromTop = rect.top - containerRect.top;
          if (distFromTop <= containerRect.height * 0.5 && rect.bottom >= containerRect.top - 50) {
            const distAbs = Math.abs(distFromTop - 80);
            if (distAbs < minHeadingDist) {
              minHeadingDist = distAbs;
              currentHeading = h.textContent?.trim() || null;
            }
          }
        });

        if (currentHeading) {
          setActiveHeadingText(currentHeading);
        }
      }
    };

    container.addEventListener('scroll', handleScrollSync, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScrollSync);
    };
  }, [readingMode]);

  const [showSettings, setShowSettings] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<'toc' | 'chat' | 'search' | 'hadiths' | 'none'>('toc')

  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const [sidebarWidth, setSidebarWidth] = useState(360)
  const [isResizing, setIsResizing] = useState(false)

  // Page Actions State
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const [isReadingPage, setIsReadingPage] = useState(false)
  const [pageCopied, setPageCopied] = useState(false)

  // Customization State
  const [darkFrameOpacity, setDarkFrameOpacity] = useState(60)

  const toggleBookmark = () => {
    setBookmarks(prev =>
      prev.includes(currentPage) ? prev.filter(p => p !== currentPage) : [...prev, currentPage]
    )
  }

  const handleCopyPage = () => {
    if (pageText) {
      const fullText = formatPageCopyText(
        pageText.matn || pageText.main,
        pageText.sharh,
        pageText.footnote,
        book.title,
        book.author,
        currentPage
      );

      navigator.clipboard.writeText(fullText);
      setPageCopied(true);
      setTimeout(() => setPageCopied(false), 2000);
    }
  }

  // Stop reading if page changes or unmounts
  useEffect(() => {
    return () => {
      stopAllSpeech()
      setIsReadingPage(false)
    }
  }, [currentPage])

  const startResizing = React.useCallback((e: React.MouseEvent) => {
    setIsResizing(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none' // Prevent text selection
    e.preventDefault()
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const railWidth = window.innerWidth >= 768 ? 80 : 64 // md:w-20 or w-16
      const newWidth = document.body.clientWidth - e.clientX - railWidth
      if (newWidth > 280 && newWidth < 800) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false)
        document.body.style.cursor = 'default'
        document.body.style.userSelect = 'auto'
      }
    }

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])


  const settingsRef = useRef<HTMLDivElement>(null)
  const readerAreaRef = useRef<HTMLDivElement>(null)

  const toggleExpand = (idx: number) => {
    const newSet = new Set(expandedNodes);
    if (newSet.has(idx)) newSet.delete(idx);
    else newSet.add(idx);
    setExpandedNodes(newSet);
  }

  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  // Close settings when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [settingsRef]);

  const handleAskExplain = async (textToExplain: string) => {
    window.getSelection()?.removeAllRanges();
    setSidebarTab('chat');
    setChatLoading(true);

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user' as const, text: `اشرح لي هذا النص:\n"${textToExplain}"` };
    const newHistory = [...chatHistory, newUserMsg];
    setChatHistory(newHistory);

    const activeChapter = activeHierarchy.length > 0 ? activeHierarchy.join(" • ") : "بدون عنوان";

    try {
      const baseUrl = import.meta.env.VITE_READING_ASSISTANT_URL || 'https://abourida-zad-tutor-engine-space.hf.space';
      const res = await fetch(`${baseUrl}/api/v1/reading-assistant/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_title: book.title,
          author: book.author,
          chapter: activeChapter,
          selected_text: textToExplain,
          page_context: pageText?.main || "",
          history: chatHistory.map(msg => ({ role: msg.role === 'assistant' ? 'model' : 'user', content: msg.text }))
        })
      });
      if (!res.ok) throw new Error("فشل الاتصال بالخادم");
      const data = await res.json();
      setChatHistory([...newHistory, { id: Date.now().toString(), role: 'assistant', text: data.explanation }]);
    } catch (err: any) {
      setChatHistory([...newHistory, { id: Date.now().toString(), role: 'assistant', text: 'عذراً، حدث خطأ أثناء محاولة شرح النص. يرجى المحاولة مرة أخرى.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const msg = chatInput.trim();
    setChatInput("");
    setChatLoading(true);

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user' as const, text: msg };
    const newHistory = [...chatHistory, newUserMsg];
    setChatHistory(newHistory);

    const activeChapter = activeHierarchy.length > 0 ? activeHierarchy.join(" • ") : "بدون عنوان";

    try {
      const baseUrl = import.meta.env.VITE_READING_ASSISTANT_URL || 'https://abourida-zad-tutor-engine-space.hf.space';
      const res = await fetch(`${baseUrl}/api/v1/reading-assistant/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_title: book.title,
          author: book.author,
          chapter: activeChapter,
          user_message: msg,
          page_context: pageText?.main || "",
          history: chatHistory.map(msg => ({ role: msg.role === 'assistant' ? 'model' : 'user', content: msg.text }))
        })
      });
      if (!res.ok) throw new Error("فشل الاتصال بالخادم");
      const data = await res.json();
      setChatHistory([...newHistory, { id: Date.now().toString(), role: 'assistant', text: data.explanation }]);
    } catch (err: any) {
      setChatHistory([...newHistory, { id: Date.now().toString(), role: 'assistant', text: 'عذراً، حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Set initial theme based on app theme
  useEffect(() => {
    if (theme === 'dark') {
      setReaderTheme('dark')
    }
  }, [theme])

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const p = parseInt(pageInput)
    if (!isNaN(p) && p > 0) {
      setSelectedTocIndex(null)
      setActiveHeadingText(null)
      setCurrentPage(p)
    } else {
      setPageInput(currentPage.toString())
    }
  }

  const filteredToc = useMemo(() => toc.filter(h => h.title.includes(tocSearch)), [toc, tocSearch]);
  const tocTree = useMemo(() => buildTree(toc), [toc]);

  const activeTocIndex = useMemo(() => {
    if (toc.length === 0) return -1;

    // 1. Explicit TOC click priority while jumping
    if (isJumpingRef.current && selectedTocIndex !== null && selectedTocIndex >= 0 && selectedTocIndex < toc.length) {
      return selectedTocIndex;
    }

    // 2. Strict Local Match: Match activeHeadingText strictly within +/- 2 pages around currentPage
    if (activeHeadingText) {
      const trimmedActive = activeHeadingText.trim();
      const nearbyIdx = toc.findIndex(h =>
        Math.abs(h.page - currentPage) <= 2 &&
        (h.title.trim() === trimmedActive || h.title.includes(trimmedActive) || trimmedActive.includes(h.title.trim()))
      );
      if (nearbyIdx >= 0) return nearbyIdx;
    }

    // 3. Priority: If selectedTocIndex page matches currentPage
    if (selectedTocIndex !== null && selectedTocIndex >= 0 && selectedTocIndex < toc.length) {
      if (toc[selectedTocIndex].page === currentPage) {
        return selectedTocIndex;
      }
    }

    // 4. Deterministic Fallback: Closest heading on or before currentPage
    let activeIndex = 0;
    for (let i = 0; i < toc.length; i++) {
      if (toc[i].page <= currentPage) {
        activeIndex = i;
      } else {
        break;
      }
    }
    return activeIndex;
  }, [toc, currentPage, selectedTocIndex, activeHeadingText]);

  const activeAncestorIndices = useMemo(() => {
    const ancestorSet = new Set<number>();
    if (toc.length === 0 || activeTocIndex < 0) return ancestorSet;

    let currentLevel = toc[activeTocIndex].level;
    for (let i = activeTocIndex - 1; i >= 0; i--) {
      if (toc[i].level < currentLevel) {
        ancestorSet.add(i);
        currentLevel = toc[i].level;
      }
    }
    return ancestorSet;
  }, [toc, activeTocIndex]);

  const activeHierarchy = useMemo(() => {
    if (toc.length === 0 || activeTocIndex < 0) return [];

    const hierarchy = [toc[activeTocIndex].title];
    let currentLevel = toc[activeTocIndex].level;

    for (let i = activeTocIndex - 1; i >= 0; i--) {
      if (toc[i].level < currentLevel) {
        hierarchy.unshift(toc[i].title);
        currentLevel = toc[i].level;
      }
    }

    return hierarchy;
  }, [toc, activeTocIndex]);

  // Auto-expand TOC tree folders leading to active section
  useEffect(() => {
    if (activeTocIndex < 0 || toc.length === 0) return;

    setExpandedNodes(prev => {
      const nextSet = new Set(prev);
      nextSet.add(activeTocIndex);
      activeAncestorIndices.forEach(idx => nextSet.add(idx));
      return nextSet;
    });
  }, [activeTocIndex, activeAncestorIndices, toc]);

  // Auto-scroll TOC sidebar to keep active item in viewport
  useEffect(() => {
    if (sidebarTab !== 'toc' || activeTocIndex < 0) return;
    const timeout = setTimeout(() => {
      const activeEl = document.querySelector('[data-toc-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [activeTocIndex, sidebarTab]);

  const [reloadTocCounter, setReloadTocCounter] = useState(0);

  // Fetch book TOC & metadata with IndexedDB cache priority (0ms instant)
  useEffect(() => {
    let isMounted = true;
    const fetchBookInfo = async () => {
      setLoadingBook(true);
      const bookNumId = Number(book.id);

      // Check offline saved status
      idbIsBookSavedOffline(book.id).then(saved => {
        if (isMounted) setIsSavedOffline(saved);
      }).catch(() => { });

      const applyIndexes = (dataObj: any): boolean => {
        if (!dataObj) return false;
        if (dataObj.meta) {
          if (dataObj.meta.info) {
            const match = dataObj.meta.info.match(/المؤلف:\s*([^\n]+)/);
            if (match && match[1]) setAuthorName(match[1].trim());
          }
          if (dataObj.meta.author_id) setAuthorId(dataObj.meta.author_id);
        }

        // Support various heading representations:
        // 1. dataObj.indexes.headings (standard Turath API)
        // 2. dataObj.headings (flat list or fallback API)
        // 3. dataObj.children (StudyMode hierarchical tree)
        let headingsFound: any[] = [];
        if (dataObj.indexes && Array.isArray(dataObj.indexes.headings) && dataObj.indexes.headings.length > 0) {
          headingsFound = dataObj.indexes.headings;
        } else if (Array.isArray(dataObj.headings) && dataObj.headings.length > 0) {
          headingsFound = dataObj.headings;
        } else if (Array.isArray(dataObj.children) && dataObj.children.length > 0) {
          const flatten = (list: any[], level = 1): any[] => {
            const acc: any[] = [];
            for (const item of list) {
              acc.push({
                id: item.id || acc.length + 1,
                title: item.title || item.name || '',
                level: item.level || level,
                page: item.page || 1
              });
              if (Array.isArray(item.children) && item.children.length > 0) {
                acc.push(...flatten(item.children, level + 1));
              }
            }
            return acc;
          };
          headingsFound = flatten(dataObj.children);
        }

        if (headingsFound.length > 0) {
          const mappedHeadings: Heading[] = headingsFound.map((h: any, i: number) => ({
            id: h.id ?? (i + 1),
            title: h.title,
            level: h.level ?? 1,
            page: h.page ?? 1
          }));
          setToc(mappedHeadings);
          setExpandedNodes(new Set<number>());
          if (mappedHeadings.length > 0) {
            setCurrentPage(prev => (prev <= 1 ? mappedHeadings[0].page : prev));
          }
        }

        const idx = dataObj.indexes;
        if (idx) {
          // Feature 2: Hadiths & Numbers Map
          const hMap = idx.hadiths || idx.numbers || {};
          setHadithsMap(hMap);

          // Feature 3: Printed Page & Volume Bounds
          let pToP: Record<string, number> = idx.print_pg_to_pg || {};
          if (Array.isArray(idx.page_map)) {
            setPageMap(idx.page_map);
            if (Object.keys(pToP).length === 0) {
              const derived: Record<string, number> = {};
              idx.page_map.forEach((entry: string | null, i: number) => {
                if (entry) {
                  derived[entry.trim()] = i + 1;
                }
              });
              pToP = derived;
            }
          }
          setPrintPgToPg(pToP);
          if (idx.volume_bounds) setVolumeBounds(idx.volume_bounds);
          if (Array.isArray(idx.volumes)) setVolumesList(idx.volumes);

          // Feature 5: Multi-volume PDFs
          if (idx.pdf_base) setPdfBase(idx.pdf_base);
          if (idx.pdfs) setPdfsMap(idx.pdfs);
        }

        return headingsFound.length > 0;
      };

      // 1. IndexedDB Cache Strategy
      // If manual reload triggered by user (reloadTocCounter > 0), bypass and purge cache!
      if (reloadTocCounter > 0) {
        try {
          await idbDeleteTurathBookTree(bookNumId);
        } catch { }
      } else {
        try {
          const cachedTree = await idbGetTurathBookTree(bookNumId);
          if (cachedTree && isMounted) {
            const hasHeadings = applyIndexes(cachedTree);
            if (hasHeadings) {
              setLoadingBook(false);
              return;
            } else {
              // Stale or corrupted cache without headings, purge it!
              await idbDeleteTurathBookTree(bookNumId);
            }
          }
        } catch (e) {
          console.warn('IndexedDB read error for book TOC:', e);
        }
      }

      // 2. Fetch using high-speed Turath Book Indexes API
      try {
        const turathData = await fetchTurathBookIndexes(bookNumId);
        if (turathData && isMounted) {
          const hasHeadings = applyIndexes(turathData);
          if (hasHeadings) {
            // Cache valid indexes in IndexedDB for subsequent 0ms loads
            await idbSetTurathBookTree(bookNumId, turathData);
            setLoadingBook(false);
            return;
          }
        }
      } catch (err) {
        console.warn('fetchTurathBookIndexes failed, trying fallback:', err);
      }

      // 3. Fallback to HF Space zad-book-info
      try {
        const baseUrl = import.meta.env.VITE_DATA_INGESTION_URL || 'https://abourida-zad-tutor-engine-space.hf.space';
        const res = await fetch(`${baseUrl}/api/v1/data-ingestion/zad-book-info/${book.id}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          const hasHeadings = applyIndexes(data);
          if (hasHeadings) {
            await idbSetTurathBookTree(bookNumId, data);
          }
        }
      } catch (err) {
        console.error("Failed to load book info", err);
      } finally {
        if (isMounted) setLoadingBook(false);
      }
    };

    fetchBookInfo();
    return () => { isMounted = false; };
  }, [book.id, reloadTocCounter]);

  // -------------------------------------------------------------------------
  // Feature 2: Hadith & Numbered Item Navigation Helper
  // -------------------------------------------------------------------------
  const hadithsCount = useMemo(() => Object.keys(hadithsMap).length, [hadithsMap]);

  const numberedItemsLabel = useMemo(() => {
    const textToMatch = `${book.title || ''} ${book.name || ''} ${book.category || ''} ${book.cat_name || ''}`;

    // Check if Hadith / Sunnah book
    if (/(حديث|سنة|سنن|صحيح|مسند|معجم|أثر|آثار|أجزاء حديثية)/i.test(textToMatch)) {
      return { short: 'الأحاديث', full: 'الأحاديث النبوية', single: 'الحديث', plural: 'أحاديث' };
    }
    // Check if Fiqh / Usul / Fatawa / Masa'il
    if (/(فقه|أصول|مسائل|فتاوى|أحكام|قواعد)/i.test(textToMatch)) {
      return { short: 'المسائل', full: 'المسائل والأحكام', single: 'المسألة', plural: 'مسائل' };
    }
    // Check if Tarajim / Rijal / Tabaqat
    if (/(رجال|تراجم|طبقات|سير|تاريخ|أعلام|وفيات)/i.test(textToMatch)) {
      return { short: 'التراجم', full: 'تراجم الأعلام', single: 'الترجمة', plural: 'تراجم' };
    }
    // Comprehensive fallback
    return { short: 'الأحاديث والمسائل', full: 'الأحاديث والمسائل المرقّمة', single: 'الموضع', plural: 'مواضع' };
  }, [book.title, book.name, book.category, book.cat_name]);

  const handleJumpToHadith = (hadithNum: string) => {
    const clean = hadithNum.trim();
    if (!clean || !hadithsMap) return;
    const target = hadithsMap[clean];
    if (target && target > 0) {
      setCurrentPage(target);
      setHadithSearchInput('');
      setSelectedTocIndex(null);
    }
  };

  // -------------------------------------------------------------------------
  // Feature 3: Printed Page & Volume Mapping Helper
  // -------------------------------------------------------------------------
  const currentPrintCitation = useMemo(() => {
    if (pageMap && pageMap.length >= currentPage && pageMap[currentPage - 1]) {
      const entry = pageMap[currentPage - 1];
      if (entry) {
        const parts = entry.split(',');
        if (parts.length >= 2) {
          return { vol: parts[0], page: parts[1] };
        }
      }
    }
    return null;
  }, [pageMap, currentPage]);

  useEffect(() => {
    if (currentPrintCitation) {
      setPrintVolInput(currentPrintCitation.vol || '1');
      setPrintPageInput(currentPrintCitation.page);
    } else {
      setPrintVolInput('1');
      setPrintPageInput(currentPage.toString());
    }
  }, [currentPage, currentPrintCitation]);

  const normalizeArabicDigits = (str: string): string => {
    return str
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
      .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
      .trim();
  };

  const handleJumpToPrintPage = (vol: string, pg: string) => {
    const cleanVol = normalizeArabicDigits(vol || '');
    const cleanPg = normalizeArabicDigits(pg || '');

    if (!cleanPg) {
      if (currentPrintCitation) {
        setPrintPageInput(currentPrintCitation.page);
        setPrintVolInput(currentPrintCitation.vol || '1');
      } else {
        setPrintPageInput(currentPage.toString());
      }
      return;
    }

    const parsedPg = parseInt(cleanPg, 10);
    if (isNaN(parsedPg) || parsedPg <= 0) {
      if (currentPrintCitation) {
        setPrintPageInput(currentPrintCitation.page);
      } else {
        setPrintPageInput(currentPage.toString());
      }
      return;
    }

    const effectiveMax = maxPage || (pageMap && pageMap.length > 0 ? pageMap.length : 99999);
    let targetPage: number | null = null;

    // 1. Exact match with given volume and page (e.g. "1,5" or "2,10")
    if (cleanVol) {
      const key = `${cleanVol},${cleanPg}`;
      if (printPgToPg && printPgToPg[key]) {
        targetPage = printPgToPg[key];
      } else if (pageMap && pageMap.length > 0) {
        const idx = pageMap.findIndex(entry => entry === key);
        if (idx >= 0) targetPage = idx + 1;
      }
    }

    // 2. Exact match with default volume 1 if volume was not specified or not matched
    if (!targetPage) {
      const key1 = `1,${cleanPg}`;
      if (printPgToPg && printPgToPg[key1]) {
        targetPage = printPgToPg[key1];
      } else if (pageMap && pageMap.length > 0) {
        const idx = pageMap.findIndex(entry => entry === key1);
        if (idx >= 0) targetPage = idx + 1;
      }
    }

    // 3. Match printed page in ANY volume if the user entered page without matching in current volume
    if (!targetPage && pageMap && pageMap.length > 0) {
      // Check current volume first
      const currentVol = currentPrintCitation?.vol || cleanVol || '1';
      const curKey = `${currentVol},${cleanPg}`;
      const curIdx = pageMap.findIndex(entry => entry === curKey);
      if (curIdx >= 0) {
        targetPage = curIdx + 1;
      } else {
        // Search in any volume that has this printed page
        const anyIdx = pageMap.findIndex(entry => entry && entry.endsWith(`,${cleanPg}`));
        if (anyIdx >= 0) targetPage = anyIdx + 1;
      }
    }

    // 4. If volume is specified and user changed volume, jump to that volume's beginning
    if (!targetPage && cleanVol && pageMap && pageMap.length > 0) {
      const volStartIdx = pageMap.findIndex(entry => entry && (entry.startsWith(`${cleanVol},`) || entry.split(',')[0] === cleanVol));
      if (volStartIdx >= 0) {
        targetPage = volStartIdx + 1;
      }
    }

    // 5. Direct digital page number (if parsedPg is within total pages of the book)
    if (!targetPage && parsedPg >= 1 && parsedPg <= effectiveMax) {
      targetPage = parsedPg;
    }

    // 6. Absolute clamp fallback
    if (!targetPage) {
      targetPage = Math.max(1, Math.min(parsedPg, effectiveMax));
    }

    if (targetPage && targetPage > 0) {
      const finalPage = Math.max(1, Math.min(targetPage, effectiveMax));
      if (finalPage === currentPage) return;

      isJumpingRef.current = true;
      setSelectedTocIndex(null);
      setActiveHeadingText(null);
      setCurrentPage(finalPage);

      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0 });
      }

      setTimeout(() => {
        isJumpingRef.current = false;
      }, 800);
    }
  };

  // -------------------------------------------------------------------------
  // Feature 4: Full-Text In-Book Search Helper
  // -------------------------------------------------------------------------
  const handleSearchInBook = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!bookSearchQuery.trim()) return;

    setIsSearchingBook(true);
    setHasSearchedBook(true);
    try {
      const res = await searchTurathCorpus(bookSearchQuery.trim(), { book: Number(book.id) });
      if (res && Array.isArray(res.data)) {
        setBookSearchResults(res.data);
      } else {
        setBookSearchResults([]);
      }
    } catch (err) {
      console.error('In-book search error:', err);
      setBookSearchResults([]);
    } finally {
      setIsSearchingBook(false);
    }
  };

  const handleSelectSearchResult = (hit: TurathSearchHit) => {
    setHighlightedKeyword(bookSearchQuery.trim());
    setCurrentPage(hit.page);
    setSelectedTocIndex(null);
    setTimeout(() => setHighlightedKeyword(null), 10000);
  };

  // -------------------------------------------------------------------------
  // Feature 5: Multi-Volume PDF Links List
  // -------------------------------------------------------------------------
  const volumePdfList = useMemo(() => {
    if (!pdfsMap || Object.keys(pdfsMap).length === 0) {
      return [];
    }
    return Object.entries(pdfsMap).map(([volKey, fileName]) => {
      let cleanFile = fileName.replace(/^\/+/, '');
      const cleanRoot = pdfBase ? pdfBase.replace(/^\/+|\/+$/g, '') : '';
      const fullPath = cleanRoot ? `${cleanRoot}/${cleanFile}` : cleanFile;
      const url = fullPath.includes('archive.org') ? fullPath : `https://files.turath.io/pdf/${fullPath}`;
      const bounds = volumeBounds?.[volKey];
      return {
        vol: volKey,
        fileName,
        url,
        pageRange: bounds ? `(صـ ${bounds[0]} - ${bounds[1]})` : ''
      };
    });
  }, [pdfsMap, pdfBase, volumeBounds]);

  // -------------------------------------------------------------------------
  // Feature 6: Offline Book Storage Action
  // -------------------------------------------------------------------------
  const handleToggleOfflineSave = async () => {
    if (isSavedOffline) {
      await idbRemoveOfflineBook(book.id);
      setIsSavedOffline(false);
      return;
    }

    setIsSavingOffline(true);
    setOfflineSaveProgress(15);
    try {
      const cachedPages: Record<number, any> = {};
      const bookNumId = Number(book.id);
      const totalToFetch = Math.min(25, maxPage || 25);

      for (let p = 1; p <= totalToFetch; p++) {
        try {
          const res = await fetchTurathPage(bookNumId, p);
          if (res && res.text) {
            cachedPages[p] = { text: res.text, main: res.text };
          }
        } catch (e) { }
        setOfflineSaveProgress(Math.round(15 + (p / totalToFetch) * 80));
      }

      await idbSaveBookOffline({
        bookId: book.id,
        title: book.title,
        author: authorName || book.author,
        indexes: {
          headings: toc,
          hadiths: hadithsMap,
          page_map: pageMap,
          volume_bounds: volumeBounds,
          print_pg_to_pg: printPgToPg,
          volumes: volumesList,
          pdfs: pdfsMap,
          pdf_base: pdfBase
        },
        cachedPages,
        savedAt: Date.now()
      });

      setIsSavedOffline(true);
      setOfflineSaveProgress(100);
    } catch (err) {
      console.error('Failed to save book offline:', err);
    } finally {
      setIsSavingOffline(false);
    }
  };

  const handleExport = async (format: 'txt' | 'json') => {
    setIsExporting(true);
    setExportProgressText('جاري التحضير...');
    try {
      await downloadBookFile(book, format, (p) => {
        setExportProgressText(p.status);
      });
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
      setExportProgressText('');
      setIsDownloadMenuOpen(false);
    }
  };

  const handleOpenOrDownloadPdf = async () => {
    if (volumePdfList.length > 1) {
      setShowPdfModal(true);
      setIsDownloadMenuOpen(false);
      return;
    }
    if (volumePdfList.length === 1) {
      window.open(volumePdfList[0].url, '_blank', 'noopener,noreferrer');
      setIsDownloadMenuOpen(false);
      return;
    }
    const immediateUrl = getBookPdfUrl(book);
    if (immediateUrl) {
      window.open(immediateUrl, '_blank', 'noopener,noreferrer');
      setIsDownloadMenuOpen(false);
      return;
    }
    setLoadingPdf(true);
    try {
      const resolvedUrl = await fetchTurathBookPdfUrl(Number(book.id));
      if (resolvedUrl) {
        window.open(resolvedUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.open(`https://files.turath.io/pdf/${book.id}.pdf`, '_blank', 'noopener,noreferrer');
      }
    } catch {
      window.open(`https://files.turath.io/pdf/${book.id}.pdf`, '_blank', 'noopener,noreferrer');
    } finally {
      setLoadingPdf(false);
      setIsDownloadMenuOpen(false);
    }
  };

  // Fetch page content
  useEffect(() => {
    const fetchPage = async () => {
      // 1. If we are user-scrolling continuously and page is in buffer, just update text state
      const cachedPage = continuousPages.find(p => p.page === currentPage);
      if (cachedPage && !isJumpingRef.current) {
        setPageText({
          main: cachedPage.text,
          matn: cachedPage.matn || cachedPage.text,
          sharh: cachedPage.sharh,
          footnote: cachedPage.footnote || ''
        });
        return;
      }

      // 2. Fetch page using fast fetchPageData
      pageSessionRef.current += 1;
      const currentSession = pageSessionRef.current;
      setLoadingPage(true);
      setLoadingNext(false);
      setLoadNextError(false);
      try {
        const processed = await fetchPageData(currentPage);
        if (currentSession !== pageSessionRef.current) return;

        if (processed && processed.main && processed.main !== 'هذه الصفحة فارغة.') {
          setPageText({
            main: processed.main,
            matn: processed.matn,
            sharh: processed.sharh,
            footnote: processed.footnote
          });
          setContinuousPages([{
            page: currentPage,
            text: processed.main,
            matn: processed.matn,
            sharh: processed.sharh,
            footnote: processed.footnote
          }]);
          setHasReachedEnd(false);
          setHasReachedStart(currentPage <= 1);
          setLoadNextError(false);

          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0 });
          }
        } else {
          setPageText({ main: 'هذه الصفحة فارغة.', footnote: '' });
          setContinuousPages([{
            page: currentPage,
            text: 'هذه الصفحة فارغة.',
            footnote: ''
          }]);
          setHasReachedEnd(true);
          setHasReachedStart(true);
        }
      } catch (err) {
        if (currentSession !== pageSessionRef.current) return;
        console.error("Failed to load page", err);
        setPageText({ main: 'حدث خطأ أثناء تحميل الصفحة. يرجى التحقق من اتصالك بالإنترنت.', footnote: '' });
        setContinuousPages([{
          page: currentPage,
          text: '<div class="p-8 text-center text-red-500 bg-red-500/10 rounded-2xl">حدث خطأ أثناء تحميل الصفحة. يرجى التحقق من اتصالك بالإنترنت.</div>'
        }]);
      } finally {
        if (currentSession === pageSessionRef.current) {
          setLoadingPage(false);
        }
      }
    };
    fetchPage();
  }, [book.id, currentPage, fetchPageData]);

  const handlePageJump = (page: number, title?: string, index?: number) => {
    isJumpingRef.current = true;
    const targetPage = Number(page);
    setCurrentPage(targetPage);

    let targetIndex = index;
    if (targetIndex === undefined && title) {
      const idx = toc.findIndex(h => h.title.trim() === title.trim() || h.title.includes(title.trim()));
      if (idx >= 0) targetIndex = idx;
    }

    if (targetIndex !== undefined) {
      setSelectedTocIndex(targetIndex);
    }
    if (title) {
      setActiveHeadingText(title);
    }

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0 });
    }

    setTimeout(() => {
      isJumpingRef.current = false;
    }, 800);
  };

  useEffect(() => {
    if (targetHeading && scrollContainerRef.current && !loadingPage) {
      // Small timeout to ensure DOM is updated
      setTimeout(() => {
        if (!scrollContainerRef.current) return
        const elements = scrollContainerRef.current.querySelectorAll('span[data-type="title"], h1, h2, h3, h4, p, span')
        for (const el of Array.from(elements)) {
          if (el.textContent?.trim() === targetHeading.trim() || el.textContent?.includes(targetHeading.trim())) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            setTargetHeading(null)
            break
          }
        }
      }, 100)
    }
  }, [pageText, continuousPages, targetHeading, loadingPage])

  const loadNextPage = async () => {
    if (loadingNext || hasReachedEnd || !continuousPages.length) return;
    const lastPage = continuousPages[continuousPages.length - 1].page;
    const currentSession = pageSessionRef.current;

    setLoadingNext(true);
    setLoadNextError(false);
    try {
      // Progressive batching with fast single page fetch
      const BATCH_SIZE = 2;
      const pagesToFetch = Array.from({ length: BATCH_SIZE }, (_, i) => lastPage + i + 1);

      let reachedEnd = false;
      let loadedAtLeastOne = false;

      for (let i = 0; i < pagesToFetch.length; i++) {
        if (currentSession !== pageSessionRef.current) return;

        const processed = await fetchPageData(pagesToFetch[i]);
        if (processed && processed.main && processed.main !== 'هذه الصفحة فارغة.') {
          const newPage = {
            page: pagesToFetch[i],
            text: processed.main,
            matn: processed.matn,
            sharh: processed.sharh,
            footnote: processed.footnote || undefined
          };

          setContinuousPages(prev => {
            if (prev.length === 0 || prev[prev.length - 1].page !== pagesToFetch[i] - 1) {
              return prev;
            }
            return [...prev, newPage];
          });
          loadedAtLeastOne = true;
        } else {
          reachedEnd = true;
          break;
        }
      }

      if (reachedEnd) {
        setHasReachedEnd(true);
      } else if (!loadedAtLeastOne) {
        setLoadNextError(true);
      }
    } catch (err) {
      if (currentSession !== pageSessionRef.current) return;
      console.error("Error loading next page:", err);
      setLoadNextError(true);
    } finally {
      if (currentSession === pageSessionRef.current) {
        setLoadingNext(false);
      }
    }
  };

  const loadPrevPage = async () => {
    if (loadingPrev || hasReachedStart || !continuousPages.length) return;
    const firstPage = continuousPages[0].page;
    if (firstPage <= 1) {
      setHasReachedStart(true);
      return;
    }

    const currentSession = pageSessionRef.current;
    setLoadingPrev(true);

    try {
      const BATCH_SIZE = Math.min(2, firstPage - 1);
      const pagesToFetch = Array.from({ length: BATCH_SIZE }, (_, i) => firstPage - BATCH_SIZE + i);
      const newPages: any[] = [];

      for (let i = pagesToFetch.length - 1; i >= 0; i--) {
        if (currentSession !== pageSessionRef.current) break;
        const processed = await fetchPageData(pagesToFetch[i]);
        if (processed && processed.main && processed.main !== 'هذه الصفحة فارغة.') {
          newPages.unshift({
            page: pagesToFetch[i],
            text: processed.main,
            matn: processed.matn,
            sharh: processed.sharh,
            footnote: processed.footnote || undefined
          });
        } else {
          break;
        }
      }

      if (newPages.length > 0) {
        const container = scrollContainerRef.current;
        const oldScrollHeight = container ? container.scrollHeight : 0;
        const oldScrollTop = container ? container.scrollTop : 0;

        isJumpingRef.current = true;
        setContinuousPages(prev => {
          if (prev.length === 0 || prev[0].page !== firstPage) {
            return prev;
          }
          return [...newPages, ...prev];
        });

        requestAnimationFrame(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = oldScrollTop + (newScrollHeight - oldScrollHeight);
          }
          setTimeout(() => {
            isJumpingRef.current = false;
          }, 400);
        });
      }

      if (pagesToFetch[0] <= 1) {
        setHasReachedStart(true);
      }
    } catch (err) {
      if (currentSession !== pageSessionRef.current) return;
      console.error("Error loading previous page:", err);
    } finally {
      if (currentSession === pageSessionRef.current) {
        setLoadingPrev(false);
      }
    }
  };

  const handleScroll = useCallback(() => {
    if (readingMode !== 'continuous' || !scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;

    // Load more when user is within 5000px of the bottom
    if (scrollHeight - scrollTop - clientHeight < 5000) {
      if (!loadingNext && !hasReachedEnd && !loadNextError) {
        loadNextPage();
      }
    }

    // Load previous when user is within 5000px of the top
    if (scrollTop < 5000) {
      if (!loadingPrev && !hasReachedStart) {
        loadPrevPage();
      }
    }
  }, [readingMode, loadingNext, hasReachedEnd, loadNextError, continuousPages, loadingPrev, hasReachedStart]);

  // Background Prefetcher: Silently keep a buffer of 15 pages ahead of the current viewed page
  useEffect(() => {
    if (!continuousPages.length || hasReachedEnd || loadingNext || loadNextError) return;
    const lastPageLoaded = continuousPages[continuousPages.length - 1].page;
    if (lastPageLoaded - currentPage < 15) {
      loadNextPage();
    }
  }, [continuousPages, currentPage, readingMode, hasReachedEnd, loadingNext, loadNextError]);

  const goNext = () => {
    setSelectedTocIndex(null);
    setActiveHeadingText(null);
    setCurrentPage(p => {
      if (readingMode === 'continuous' && continuousPages.length > 0) {
        return continuousPages[continuousPages.length - 1].page + 1;
      }
      return p + 1;
    });
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0 });
    }
  };

  const goPrev = () => {
    setSelectedTocIndex(null);
    setActiveHeadingText(null);
    setCurrentPage(p => {
      if (readingMode === 'continuous' && continuousPages.length > 0) {
        return Math.max(1, continuousPages[0].page - 1);
      }
      return Math.max(1, p - 1);
    });
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0 });
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowLeft') {
        goNext();
      } else if (e.key === 'ArrowRight') {
        goPrev();
      } else if (e.key === 'Escape') {
        setShowPdfModal(false);
        setShowSettings(false);
        setShowBookmarks(false);
        setIsDownloadMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readingMode, continuousPages]);

  const readerThemeClasses = {
    light: 'bg-white text-gray-900 border-gray-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)]',
    dark: 'bg-[#181825] text-gray-200 border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
    sepia: 'bg-[#f4ecd8] text-[#5b4636] border-[#d3c6a6]/50 shadow-[0_8px_32px_rgba(91,70,54,0.1)]'
  }

  const readerTextClasses = {
    light: 'prose-headings:text-gray-900',
    dark: 'prose-invert prose-headings:text-white',
    sepia: 'prose-headings:text-[#4a382b]'
  }

  const maxPage = (pageMap && pageMap.length > 0)
    ? pageMap.length
    : (toc.length > 0
      ? Math.max(...toc.map(h => h.page))
      : (book.page_count && book.page_count > 0 ? book.page_count : currentPage));
  const progressPercent = Math.min(100, Math.max(0, (currentPage / (maxPage || 1)) * 100));

  // Smooth scrolling and highlighting when clicking footnote references in text
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleFootnoteClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-type="footnote-ref"]');
      if (target) {
        e.preventDefault();
        const href = target.getAttribute('href');
        if (href) {
          const targetEl = container.querySelector(href);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetEl.classList.add('ring-2', 'ring-purple-500', 'scale-[1.02]');
            setTimeout(() => {
              targetEl.classList.remove('ring-2', 'ring-purple-500', 'scale-[1.02]');
            }, 2500);
          }
        }
      }
    };

    container.addEventListener('click', handleFootnoteClick);
    return () => {
      container.removeEventListener('click', handleFootnoteClick);
    };
  }, [pageText, continuousPages]);

  useEffect(() => {
    const handleExplainRequest = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        handleAskExplain(customEvent.detail);
      }
    };
    window.addEventListener('explainSelectedText', handleExplainRequest);
    return () => window.removeEventListener('explainSelectedText', handleExplainRequest);
  }, [currentPage, toc, book, pageText]);

  return (
    <div
      dir="rtl"
      className={`fixed inset-0 z-50 flex flex-col transition-colors duration-500 overflow-hidden ${getReaderRootBg()} animate-in fade-in zoom-in-95 duration-300`}
    >
      {/* Islamic Geometric Wallpaper Pattern (ثابتة في خلفية القراءة متناسقة مع السمة) */}
      <IslamicPattern
        isFixed={true}
        opacity={readerTheme === 'dark' ? 0.025 : 0.06}
        className={`${getReaderPatternColor()} pointer-events-none transition-colors duration-300`}
      />

      {/* Top Navigation Bar (Study Mode Style) */}
      <header
        className={`shrink-0 min-h-[4rem] py-1.5 w-full flex items-center justify-between px-4 z-40 transition-transform duration-500 border-b ${distractionFree ? '-translate-y-full opacity-0 absolute' : 'translate-y-0 opacity-100'} ${readerTheme === 'dark' ? 'bg-[#090b10]/85 backdrop-blur-md border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)] text-white' : 'bg-white/80 backdrop-blur-md border-gray-200/80 text-slate-900'}`}
      >
        <div className="flex items-center gap-2 h-full flex-1 min-w-0">
          {/* Library Sidebar Menu Button (Circular design matching library navbar) */}
          {onOpenSidebar && (
            <button
              type="button"
              onClick={onOpenSidebar}
              className={`h-10 w-10 rounded-full border flex items-center justify-center transition-all backdrop-blur-md active:scale-95 cursor-pointer group shrink-0 ${getNavCircleBtnStyle()}`}
              title="فهرس وتصنيفات المكتبة العامة"
              aria-label="فتح فهرس وتصنيفات المكتبة العامة"
            >
              <Menu className="h-5 w-5 transition-transform group-hover:scale-110" strokeWidth={2.2} />
            </button>
          )}

          <button
            onClick={onClose}
            className={`w-10 h-10 flex items-center justify-center shrink-0 rounded-xl transition-all shadow-sm group cursor-pointer ${getReaderBackButtonClass()}`}
            title="العودة للمكتبة"
          >
            <ArrowRight className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          </button>

          <div className="h-8 w-px bg-border/50 mx-1 shrink-0" />

          {/* Tools Toggles */}
          <div className="flex items-center gap-1.5 h-full py-2 shrink-0">
            <button
              onClick={() => setSidebarTab(sidebarTab === 'toc' ? 'none' : 'toc')}
              className={`flex h-9 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold transition-all backdrop-blur-xl ${sidebarTab === 'toc'
                ? getHeaderTabActiveStyle('toc')
                : readerTheme === 'dark'
                  ? 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                  : 'bg-white/50 border border-slate-200/90 text-slate-600 hover:bg-white/80 hover:text-slate-900 hover:border-slate-300'
                }`}
            >
              <Menu size={15} className="shrink-0 stroke-[2.2]" />
              <span>الفهرس</span>
            </button>

            <button
              onClick={() => setSidebarTab(sidebarTab === 'search' ? 'none' : 'search')}
              className={`flex h-9 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold transition-all backdrop-blur-xl ${sidebarTab === 'search'
                ? getHeaderTabActiveStyle('search')
                : readerTheme === 'dark'
                  ? 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                  : 'bg-white/50 border border-slate-200/90 text-slate-600 hover:bg-white/80 hover:text-slate-900 hover:border-slate-300'
                }`}
              title="بحث شامل في نصوص ومتون صفحات هذا الكتاب"
            >
              <Search size={15} className={`${sidebarTab === 'search' ? (accentColor === 'amber' ? 'text-stone-950 dark:text-[#eed9b0]' : 'text-current') : (accentColor === 'amber' ? 'text-[#b88d46]' : accentColor === 'emerald' ? 'text-teal-600' : accentColor === 'blue' ? 'text-blue-600' : 'text-brand-magenta')} shrink-0`} />
              <span>بحث بالمتن</span>
            </button>

            {hadithsCount > 0 && (
              <button
                onClick={() => setSidebarTab(sidebarTab === 'hadiths' ? 'none' : 'hadiths')}
                className={`flex h-9 items-center justify-center gap-1.5 rounded-xl px-2.5 text-xs font-bold transition-all backdrop-blur-xl ${sidebarTab === 'hadiths'
                  ? getHeaderTabActiveStyle('hadiths')
                  : readerTheme === 'dark'
                    ? 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                    : 'bg-white/50 border border-slate-200/90 text-slate-600 hover:bg-white/80 hover:text-slate-900 hover:border-slate-300'
                  }`}
                title={`انتقال برقم ${numberedItemsLabel.single} (${hadithsCount} ${numberedItemsLabel.plural})`}
              >
                <Hash size={14} className="text-amber-500 shrink-0" />
                <span>{numberedItemsLabel.short}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-500 font-extrabold">{hadithsCount}</span>
              </button>
            )}

            <button
              onClick={() => setSidebarTab(sidebarTab === 'chat' ? 'none' : 'chat')}
              className={`flex h-9 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold transition-all backdrop-blur-xl ${sidebarTab === 'chat'
                ? getHeaderTabActiveStyle('chat')
                : readerTheme === 'dark'
                  ? 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                  : 'bg-white/50 border border-slate-200/90 text-slate-600 hover:bg-white/80 hover:text-slate-900 hover:border-slate-300'
                }`}
            >
              <img src={readerTheme === 'dark' ? whiteLogo : zadDarkLogo} alt="Zad" className={`h-[15px] object-contain transition-opacity ${sidebarTab === 'chat' ? 'opacity-100 drop-shadow-sm' : 'opacity-70 grayscale'}`} />
              <span>مساعد القراءة</span>
            </button>
          </div>

          <div className="h-8 w-px bg-border/50 mx-3 shrink-0" />

          {/* Book Title & Hierarchy */}
          <div className="flex items-center gap-3 min-w-0 pointer-events-none text-muted-foreground">
            <h1 className={`font-scheherazade text-2xl md:text-3xl font-bold ${getHeaderTitleColor()} shrink-0 leading-normal`}>
              {book.title}
            </h1>

            <div className="flex flex-col gap-1 items-start justify-center min-w-0 border-r border-border/50 pr-3">
              {authorName && (
                <div className="relative group/author pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectAuthor) {
                        onSelectAuthor(book.author || authorName);
                      }
                    }}
                    className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm transition-all shrink-0 hover:scale-105 cursor-pointer ${getHeaderAuthorBadgeClass()}`}
                    title={authorName}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${getAccentDotColor()} animate-pulse shrink-0`} />
                    <span className="truncate max-w-[160px] sm:max-w-[220px] md:max-w-[300px]">{authorName}</span>
                  </button>

                  {/* Full Author Name Tooltip on Hover */}
                  <div className="absolute right-0 top-full mt-1.5 hidden group-hover/author:block z-50 pointer-events-none animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold shadow-xl backdrop-blur-xl whitespace-nowrap ${readerTheme === 'dark'
                      ? 'bg-[#0d071a]/95 border-purple-500/40 text-purple-100 shadow-black/80'
                      : 'bg-white/95 border-slate-200 text-slate-800 shadow-lg'
                      }`}>
                      {authorName}
                    </div>
                  </div>
                </div>
              )}

              {activeHierarchy.length > 0 && (
                <div className="relative group/breadcrumb pointer-events-auto">
                  <span className={`flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] md:text-[11px] font-bold border backdrop-blur-md shadow-sm transition-all cursor-pointer ${readerTheme === 'dark' ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10' : 'bg-black/5 border-black/10 text-slate-800 hover:bg-black/10'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getAccentDotColor()} animate-pulse shrink-0`} />
                    <span className="flex items-center gap-1.5 min-w-0">
                      {/* Level 1 Chapter Title */}
                      <span className={`font-extrabold shrink-0 ${getBreadcrumbChapterColor()}`}>
                        {activeHierarchy[0]}
                      </span>

                      {activeHierarchy.length > 1 && (
                        <>
                          <ChevronLeft className="h-3 w-3 text-brand-blue shrink-0 animate-pulse" />
                          {/* Active Sub-Heading */}
                          <span className="truncate max-w-[200px] sm:max-w-[320px] md:max-w-[450px]">
                            {activeHierarchy[activeHierarchy.length - 1]}
                          </span>
                        </>
                      )}
                    </span>
                  </span>

                  {/* Full Hierarchy Floating Tooltip Box on Hover */}
                  <div className="absolute right-0 top-full mt-2 hidden group-hover/breadcrumb:block z-50 pointer-events-none animate-in fade-in slide-in-from-top-1 duration-200 delay-300">
                    <div className={`px-4 py-2.5 rounded-2xl border text-xs font-bold shadow-2xl backdrop-blur-xl flex items-center gap-2 whitespace-nowrap ${readerTheme === 'dark' ? 'bg-[#0d071a]/95 border-purple-500/40 text-purple-100 shadow-black/80' : 'bg-white/95 border-purple-200 text-purple-950 shadow-xl'}`}>
                      <span className="text-brand-magenta font-extrabold shrink-0">المسار الكامل:</span>
                      {activeHierarchy.map((item, idx) => (
                        <React.Fragment key={idx}>
                          <span>{item}</span>
                          {idx < activeHierarchy.length - 1 && <ChevronLeft className="h-3 w-3 text-brand-blue shrink-0" />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 relative h-full py-2" ref={settingsRef}>


          {/* Feature 5 & 6: Unified Download & Export Dropdown (مطابق تماماً لخارج الكتاب) */}
          <div className="relative" ref={downloadMenuRef}>
            <button
              type="button"
              onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
              className={`w-10 h-10 rounded-xl flex justify-center items-center transition-all duration-300 backdrop-blur-md border shadow-sm ${isDownloadMenuOpen
                ? 'bg-brand-magenta/20 border-brand-magenta/40 text-brand-magenta shadow-[0_0_15px_rgba(149,11,196,0.3)] scale-105'
                : isSavedOffline
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500'
                  : readerTheme === 'dark'
                    ? 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white hover:shadow-md hover:scale-105'
                    : 'bg-white/50 border-gray-200/60 text-slate-500 hover:bg-white/80 hover:text-slate-900 hover:shadow-md hover:scale-105'
                }`}
              title="خيارات تحميل وتصدير الكتاب"
            >
              {isSavingOffline || isExporting || loadingPdf ? (
                <Loader2 className="h-5 w-5 animate-spin text-brand-magenta" />
              ) : isSavedOffline ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <Download className="h-5 w-5" />
              )}
            </button>

            {isDownloadMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className={`absolute top-full left-0 mt-2 w-64 backdrop-blur-2xl border rounded-2xl shadow-2xl p-2 z-50 text-right animate-in fade-in slide-in-from-top-2 duration-150 ${readerTheme === 'dark'
                  ? 'bg-[#121826]/95 border-white/10 shadow-black/80 text-white'
                  : readerTheme === 'sepia'
                    ? 'bg-[#FAF5ED]/95 border-[#E2D6C0] shadow-xl text-[#3D2C1D]'
                    : 'bg-white/95 border-gray-200 shadow-xl text-slate-900'
                  }`}
              >
                <p className="text-[10px] font-bold opacity-60 px-2 py-1 border-b border-inherit mb-1">
                  خيارات تحميل وتصدير الكتاب:
                </p>

                {/* 1. Offline Storage */}
                <button
                  type="button"
                  onClick={handleToggleOfflineSave}
                  disabled={isSavingOffline}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-right cursor-pointer ${isSavedOffline ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <HardDriveDownload className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>
                      {isSavingOffline
                        ? `جاري الحفظ (${offlineSaveProgress}%)...`
                        : isSavedOffline
                          ? 'محفوظ أوفلاين (إزالة)'
                          : 'حفظ للقراءة دون إنترنت (Offline)'}
                    </span>
                  </div>
                  {isSavingOffline ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                  ) : isSavedOffline ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : null}
                </button>

                {/* 2. Full TXT download */}
                <button
                  type="button"
                  onClick={() => handleExport('txt')}
                  disabled={isExporting}
                  className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-right cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FileDown className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>تحميل متن الكتاب (TXT)</span>
                  </div>
                  {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" /> : null}
                </button>

                {/* 3. JSON download */}
                <button
                  type="button"
                  onClick={() => handleExport('json')}
                  disabled={isExporting}
                  className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-right cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <BookCheck className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>بيانات وفهرس (JSON)</span>
                  </div>
                </button>

                {/* 4. PDF download */}
                {(volumePdfList.length > 0 || hasBookPdf(book)) && (
                  <button
                    type="button"
                    onClick={handleOpenOrDownloadPdf}
                    disabled={loadingPdf}
                    className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-right cursor-pointer text-rose-600 dark:text-rose-400"
                  >
                    <div className="flex items-center gap-2">
                      <FileDown className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>
                        {volumePdfList.length > 1
                          ? `تحميل الـ PDF (${volumePdfList.length} مجلدات)`
                          : 'تحميل النسخة المصورة (PDF)'}
                      </span>
                    </div>
                    {loadingPdf ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                    ) : (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 font-mono">
                        PDF
                      </span>
                    )}
                  </button>
                )}

                {isExporting && exportProgressText && (
                  <p className="text-[10px] text-muted-foreground px-2 py-1 mt-1 border-t border-inherit animate-pulse">
                    {exportProgressText}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Bookmarks Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => { setShowBookmarks(!showBookmarks); setShowSettings(false); }}
              className={`w-10 h-10 rounded-xl flex justify-center items-center transition-all duration-300 backdrop-blur-md border shadow-sm ${showBookmarks ? 'bg-brand-magenta/20 border-brand-magenta/40 text-brand-magenta shadow-[0_0_15px_rgba(149,11,196,0.3)] scale-105' : readerTheme === 'dark' ? 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-brand-magenta hover:shadow-md hover:scale-105' : 'bg-white/50 border-gray-200/60 text-slate-500 hover:bg-white/80 hover:text-brand-magenta hover:shadow-md hover:scale-105'}`}
              title="العلامات المرجعية"
            >
              <Bookmark className="h-5 w-5" />
            </button>

            {showBookmarks && (
              <div className={`absolute top-full left-0 mt-2 w-64 backdrop-blur-2xl border rounded-3xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 ${readerTheme === 'dark' ? 'bg-[#0d071a]/95 border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.7)]' : 'bg-white/95 border-gray-200 shadow-xl text-slate-900'}`}>
                <div className="p-3 border-b border-border/50 mb-2">
                  <h3 className="font-bold text-sm">العلامات المرجعية</h3>
                </div>
                <div className="max-h-60 overflow-y-auto custom-scrollbar flex flex-col gap-1 p-1">
                  {bookmarks.length === 0 ? (
                    <div className="py-6 text-center opacity-60 text-xs font-semibold">
                      لا يوجد صفحات محفوظة حالياً.
                    </div>
                  ) : (
                    bookmarks.map(page => (
                      <button
                        key={page}
                        onClick={() => { setCurrentPage(page); setShowBookmarks(false); }}
                        className={`group flex items-center justify-between p-2.5 rounded-xl transition-all duration-300 ${currentPage === page ? 'bg-brand-magenta/10 text-brand-magenta' : 'hover:bg-brand-magenta/5 dark:hover:bg-brand-magenta/10 hover:pr-3 hover:text-brand-magenta'}`}
                      >
                        <span className="text-xs font-bold truncate flex-1 text-right">صفحة {page}</span>
                        <BookmarkCheck className={`h-4 w-4 transition-all duration-300 ${currentPage === page ? 'opacity-100' : 'opacity-50 group-hover:opacity-100 group-hover:scale-110'}`} />
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>


          <button
            onClick={() => { setShowSettings(!showSettings); setShowBookmarks(false); }}
            className={`w-10 h-10 rounded-xl flex justify-center items-center transition-all duration-300 backdrop-blur-md border shadow-sm ${showSettings ? 'bg-brand-blue/20 border-brand-blue/40 text-brand-blue shadow-[0_0_15px_rgba(43,127,255,0.3)] scale-105' : readerTheme === 'dark' ? 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-brand-blue hover:shadow-md hover:scale-105' : 'bg-white/50 border-gray-200/60 text-slate-500 hover:bg-white/80 hover:text-brand-blue hover:shadow-md hover:scale-105'}`}
            title="إعدادات القراءة"
          >
            <Settings2 className="h-5 w-5" />
          </button>

          {/* Settings Dropdown (Pops out below) */}
          {showSettings && (
            <div className={`absolute top-full left-0 mt-2 w-[300px] backdrop-blur-2xl border rounded-3xl shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-4 duration-300 origin-top-left ${readerTheme === 'dark' ? 'bg-[#0d071a]/95 border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.7)] text-white' : 'bg-white/95 border-gray-200 shadow-xl text-slate-800'}`}>

              {/* Reading Mode */}
              <div className="mb-6">
                <label className={`text-[11px] font-bold mb-3 block uppercase tracking-wider ${readerTheme === 'dark' ? 'text-white/50' : 'text-slate-400'}`}>نمط القراءة</label>
                <div className="flex gap-2">
                  <button onClick={() => handleSetReadingMode('paged')} className={`flex-1 py-2.5 rounded-2xl border transition-all duration-300 ${readingMode === 'paged' ? 'border-brand-blue bg-brand-blue/10 text-brand-blue shadow-sm scale-105' : readerTheme === 'dark' ? 'border-white/10 hover:bg-white/10 text-white/60 hover:text-white hover:border-white/20' : 'border-black/10 hover:bg-black/5 text-slate-600 hover:text-slate-900'} flex flex-col items-center justify-center gap-1.5`}>
                    <BookText className="h-5 w-5" />
                    <span className="text-[10px] font-bold">صفحة بصفحة</span>
                  </button>
                  <button onClick={() => handleSetReadingMode('continuous')} className={`flex-1 py-2.5 rounded-2xl border transition-all duration-300 ${readingMode === 'continuous' ? 'border-brand-blue bg-brand-blue/10 text-brand-blue shadow-sm scale-105' : readerTheme === 'dark' ? 'border-white/10 hover:bg-white/10 text-white/60 hover:text-white hover:border-white/20' : 'border-black/10 hover:bg-black/5 text-slate-600 hover:text-slate-900'} flex flex-col items-center justify-center gap-1.5`}>
                    <AlignJustify className="h-5 w-5" />
                    <span className="text-[10px] font-bold">تصفح متصل</span>
                  </button>
                </div>
              </div>

              {/* Theme */}
              <div className="mb-6">
                <label className={`text-[11px] font-bold mb-3 block uppercase tracking-wider ${readerTheme === 'dark' ? 'text-white/50' : 'text-slate-400'}`}>مظهر القراءة</label>
                <div className="flex gap-2">
                  <button onClick={() => setReaderTheme('light')} className={`flex-1 py-2.5 rounded-2xl border transition-all duration-300 ${readerTheme === 'light' ? 'border-brand-blue bg-brand-blue/10 text-brand-blue shadow-sm scale-105' : readerTheme === 'dark' ? 'border-white/10 hover:bg-white/10 text-white/60 hover:text-white hover:border-white/20' : 'border-black/10 hover:bg-black/5 text-slate-600 hover:text-slate-900'} flex flex-col items-center justify-center gap-1.5`}>
                    <Sun className="h-5 w-5" />
                    <span className="text-[10px] font-bold">فاتح</span>
                  </button>
                  <button onClick={() => setReaderTheme('sepia')} className={`flex-1 py-2.5 rounded-2xl border transition-all duration-300 ${readerTheme === 'sepia' ? 'border-amber-700/60 bg-amber-700/10 text-amber-800 shadow-sm scale-105 font-bold' : readerTheme === 'dark' ? 'border-white/10 hover:bg-white/10 text-white/60 hover:text-white hover:border-white/20' : 'border-black/10 hover:bg-black/5 text-slate-600 hover:text-slate-900'} flex flex-col items-center justify-center gap-1.5`}>
                    <BookOpen className="h-5 w-5" />
                    <span className="text-[10px] font-bold">ورقي</span>
                  </button>
                  <button onClick={() => setReaderTheme('dark')} className={`flex-1 py-2.5 rounded-2xl border transition-all duration-300 ${readerTheme === 'dark' ? 'border-brand-blue bg-brand-blue/10 text-brand-blue shadow-sm scale-105' : 'border-black/10 hover:bg-black/5 text-slate-600 hover:text-slate-900'} flex flex-col items-center justify-center gap-1.5`}>
                    <Moon className="h-5 w-5" />
                    <span className="text-[10px] font-bold">داكن</span>
                  </button>
                </div>
              </div>

              {/* Dark Frame Opacity */}
              {readerTheme === 'dark' && (
                <div className="mb-6 animate-in fade-in zoom-in-95 duration-300">
                  <label className="text-[11px] font-bold text-white/50 mb-3 flex justify-between uppercase tracking-wider">
                    <span>شفافية الإطار (الداكن)</span>
                    <span className="text-brand-blue">{darkFrameOpacity}%</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={darkFrameOpacity}
                      onChange={(e) => setDarkFrameOpacity(Number(e.target.value))}
                      className="flex-1 accent-brand-blue h-2 bg-white/20 rounded-full appearance-none outline-none hover:bg-white/30 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Font Size */}
              <div className="mb-6">
                <label className={`text-[11px] font-bold mb-3 flex justify-between uppercase tracking-wider ${readerTheme === 'dark' ? 'text-white/50' : 'text-slate-400'}`}>
                  <span>حجم الخط</span>
                  <span className="text-brand-blue">{fontSize}px</span>
                </label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setFontSize(s => Math.max(14, s - 2))} className={`p-2 rounded-xl transition-all duration-200 active:scale-90 ${readerTheme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white/80' : 'bg-black/5 hover:bg-black/10 text-slate-700'}`}>
                    <Type className="h-4 w-4" />
                  </button>
                  <input type="range" min="14" max="40" step="2" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className={`flex-1 accent-brand-blue h-2 rounded-full appearance-none outline-none transition-colors ${readerTheme === 'dark' ? 'bg-white/20 hover:bg-white/30' : 'bg-black/10 hover:bg-black/20'}`} />
                  <button onClick={() => setFontSize(s => Math.min(40, s + 2))} className={`p-2 rounded-xl transition-all duration-200 active:scale-90 ${readerTheme === 'dark' ? 'bg-white/10 hover:bg-white/20 text-white/80' : 'bg-black/5 hover:bg-black/10 text-slate-700'}`}>
                    <Type className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Font Family Dropdown */}
              <div>
                <label className={`text-[11px] font-bold mb-2 block uppercase tracking-wider ${readerTheme === 'dark' ? 'text-white/50' : 'text-slate-400'}`}>خط القراءة</label>
                <div className="relative">
                  <select
                    value={fontFamily === 'font-read' ? 'font-amiri' : fontFamily === 'font-sans' ? 'font-cairo' : fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className={`w-full appearance-none px-4 py-2.5 pl-10 rounded-2xl text-sm font-semibold transition-all cursor-pointer outline-none border ${readerTheme === 'dark'
                      ? 'bg-white/10 text-white border-white/15 focus:border-brand-blue hover:bg-white/15'
                      : 'bg-slate-100 text-slate-800 border-slate-200 focus:border-brand-blue hover:bg-slate-200/70'
                      }`}
                  >
                    <option value="font-amiri" className="font-amiri text-slate-900 bg-white dark:bg-slate-900 dark:text-white py-1">الخط الأميري</option>
                    <option value="font-scheherazade" className="font-scheherazade text-slate-900 bg-white dark:bg-slate-900 dark:text-white py-1">خط شهرزاد</option>
                    <option value="font-noto-naskh" className="font-noto-naskh text-slate-900 bg-white dark:bg-slate-900 dark:text-white py-1">خط النسخ</option>
                    <option value="font-cairo" className="font-cairo text-slate-900 bg-white dark:bg-slate-900 dark:text-white py-1">خط القاهرة</option>
                  </select>
                  <ChevronDown className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${readerTheme === 'dark' ? 'text-white/60' : 'text-slate-500'
                    }`} />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace Container */}
      <div className="flex-1 flex overflow-hidden w-full relative p-2 md:p-4 gap-4">


        {/* Sliding Panel Area (TOC / Chat) */}
        <aside
          className={`shrink-0 h-full relative rounded-3xl overflow-hidden ${isResizing ? '' : 'transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]'} z-30 ${distractionFree || sidebarTab === 'none' ? 'opacity-0 border-none' : 'opacity-100 border'
            } ${readerTheme === 'dark' ? 'border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]' : 'border-gray-200/80 bg-white/90 shadow-xl text-slate-900'} backdrop-blur-xl`}
          style={{
            width: distractionFree || sidebarTab === 'none' ? 0 : sidebarWidth,
            backgroundColor: readerTheme === 'dark' ? getReaderFrameBgColor(darkFrameOpacity) : undefined
          }}
        >


          <div className="w-full h-full flex flex-col relative">
            {readerTheme === 'dark' && (
              <>
                <div className={`absolute -top-32 -right-32 w-64 h-64 ${accentColor === 'amber' ? 'bg-amber-500/5' : 'bg-brand-magenta/15'} rounded-full blur-[80px] pointer-events-none`}></div>
                <div className={`absolute -bottom-32 -left-32 w-64 h-64 ${accentColor === 'amber' ? 'bg-[#dfbf83]/5' : 'bg-brand-blue/15'} rounded-full blur-[80px] pointer-events-none`}></div>
              </>
            )}

            {/* Header of the sliding panel */}
            <div className={`flex items-center justify-between p-4 border-b ${readerTheme === 'dark' ? 'border-white/5 bg-white/[0.02] text-white' : 'border-gray-200/60 bg-white/50 text-slate-900'}`}>
              <h3 className="font-bold text-base flex items-center gap-2">
                {sidebarTab === 'toc' && <><Menu className={`h-4 w-4 ${accentColor === 'amber' ? 'text-[#b88d46]' : accentColor === 'emerald' ? 'text-teal-600' : accentColor === 'blue' ? 'text-blue-600' : 'text-brand-magenta'}`} /> فهرس المحتويات</>}
                {sidebarTab === 'search' && <><Search className={`h-4 w-4 ${accentColor === 'amber' ? 'text-[#b88d46]' : accentColor === 'emerald' ? 'text-teal-600' : accentColor === 'blue' ? 'text-blue-600' : 'text-brand-magenta'}`} /> البحث في نصوص الكتاب</>}
                {sidebarTab === 'hadiths' && <><Hash className="h-4 w-4 text-amber-500" /> {numberedItemsLabel.full}</>}
                {sidebarTab === 'chat' && <><img src={readerTheme === 'dark' ? whiteLogo : zadDarkLogo} alt="Zad" className="h-4 w-4 object-contain" /> المساعد الذكي</>}
              </h3>
              <button
                onClick={() => setSidebarTab('none')}
                className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all duration-200 active:scale-95 shadow-sm hover:scale-105 ${
                  readerTheme === 'dark'
                    ? 'bg-white/10 border-white/20 text-white/90 hover:bg-white/20 hover:text-white shadow-black/40'
                    : 'bg-white/80 border-slate-300/80 text-slate-700 hover:bg-white hover:text-slate-900 hover:border-slate-400 shadow-slate-900/5'
                }`}
                title="إغلاق اللوحة"
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden relative">
              {/* TOC Panel */}
              <div className={`absolute inset-0 flex flex-col transition-all duration-300 ${sidebarTab === 'toc' ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-4 pointer-events-none -z-10'}`}>
                <div className="p-4">
                  <div className="relative group">
                    <Search className={`absolute right-3 top-3 h-4 w-4 text-muted-foreground transition-colors ${accentColor === 'amber' ? 'group-focus-within:text-[#b88d46]' : accentColor === 'emerald' ? 'group-focus-within:text-teal-600' : accentColor === 'blue' ? 'group-focus-within:text-blue-600' : 'group-focus-within:text-brand-magenta'}`} />
                    <input
                      type="text"
                      placeholder="ابحث في العناوين..."
                      value={tocSearch}
                      onChange={(e) => setTocSearch(e.target.value)}
                      className={`w-full rounded-2xl pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 ${accentColor === 'amber' ? 'focus:ring-amber-500' : accentColor === 'emerald' ? 'focus:ring-teal-500' : accentColor === 'blue' ? 'focus:ring-blue-500' : 'focus:ring-brand-magenta'} transition-all shadow-inner ${readerTheme === 'dark' ? 'bg-white/5 border border-white/10 text-white placeholder-white/40 focus:bg-white/10' : 'bg-slate-100 text-slate-900 placeholder-slate-400 border border-slate-200'}`}
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
                  {loadingBook ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 p-6">
                      <Loader2 className={`h-8 w-8 animate-spin ${getPaginationLayersIconClass()}`} />
                      <div className="text-center space-y-1">
                        <p className="text-sm font-bold">جاري تحميل الفهرس...</p>
                        <p className="text-xs opacity-60">قد يستغرق بضع ثوانٍ في الكتب والموسوعات الكبرى</p>
                      </div>
                    </div>
                  ) : toc.length === 0 ? (
                    <div className={`p-6 text-center text-xs rounded-2xl mt-4 flex flex-col items-center gap-3 ${readerTheme === 'dark' ? 'bg-white/5 text-white/70' : 'bg-black/5 text-black/70'}`}>
                      <p className="font-bold text-sm">تعذر تحميل الفهرس الكامل</p>
                      <p className="opacity-75 leading-relaxed">نظراً لضخامة حجم فهرس الكتاب، يمكنك المحاولة مجدداً للتحميل.</p>
                      <button
                        type="button"
                        disabled={loadingBook}
                        onClick={() => {
                          setLoadingBook(true);
                          setReloadTocCounter(c => c + 1);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        {loadingBook ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>جاري التحميل...</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4" />
                            <span>إعادة محاولة التحميل</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : filteredToc.length === 0 ? (
                    <div className={`p-8 text-center text-sm rounded-2xl mt-4 ${readerTheme === 'dark' ? 'bg-white/5 text-white/60' : 'bg-black/5 text-black/60'}`}>لا توجد نتائج مطابقة للبحث</div>
                  ) : tocSearch ? (
                    <div className="space-y-1">
                      {filteredToc.map((heading, idx) => {
                        const isExactActive = (activeTocIndex >= 0 && toc[activeTocIndex]?.title === heading.title) ||
                          (heading.page === currentPage) ||
                          (activeHeadingText ? (activeHeadingText.includes(heading.title.trim()) || heading.title.trim().includes(activeHeadingText)) : false);
                        return (
                          <button
                            key={idx}
                            data-toc-active={isExactActive ? "true" : undefined}
                            onClick={() => {
                              const fullIndex = toc.findIndex(h => h.title === heading.title && h.page === heading.page);
                              handlePageJump(heading.page, heading.title, fullIndex >= 0 ? fullIndex : undefined);
                            }}
                            className={`w-full flex items-center justify-between py-3 px-3 text-sm rounded-xl transition-all duration-300 group cursor-pointer border ${isExactActive
                              ? accentColor === 'amber'
                                ? 'bg-[#dfbf83] text-stone-950 font-bold border-[#cba35d] shadow-sm ring-1 ring-[#cba35d]/40'
                                : accentColor === 'emerald'
                                  ? 'bg-teal-500/15 text-teal-900 dark:text-teal-200 font-bold border-teal-500/30 shadow-sm ring-1 ring-teal-500/30'
                                  : accentColor === 'blue'
                                    ? 'bg-blue-500/15 text-blue-900 dark:text-blue-200 font-bold border-blue-500/30 shadow-sm ring-1 ring-blue-500/30'
                                    : 'bg-brand-magenta/15 text-brand-magenta font-bold border-brand-magenta/30 shadow-sm ring-1 ring-brand-magenta/30'
                              : readerTheme === 'dark'
                                ? 'text-slate-200 hover:text-white hover:bg-white/10 border-transparent'
                                : accentColor === 'amber'
                                  ? 'text-slate-800 hover:bg-amber-50/70 hover:text-stone-900 border-transparent'
                                  : accentColor === 'emerald'
                                    ? 'text-slate-800 hover:bg-teal-50/70 hover:text-teal-950 border-transparent'
                                    : accentColor === 'blue'
                                      ? 'text-slate-800 hover:bg-blue-50/70 hover:text-blue-950 border-transparent'
                                      : 'text-slate-800 hover:bg-purple-50/70 hover:text-purple-950 border-transparent'
                              }`}
                          >
                            <span className={`truncate text-right max-w-[80%] leading-relaxed transition-colors ${accentColor === 'amber' ? 'group-hover:text-[#b88d46]' : accentColor === 'emerald' ? 'group-hover:text-teal-600' : accentColor === 'blue' ? 'group-hover:text-blue-600' : 'group-hover:text-brand-magenta'}`}>{heading.title}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors ${isExactActive
                              ? accentColor === 'amber'
                                ? 'bg-black/10 text-stone-950 font-bold border border-black/5'
                                : accentColor === 'emerald'
                                  ? 'bg-teal-500/20 text-teal-900 dark:text-teal-200'
                                  : accentColor === 'blue'
                                    ? 'bg-blue-500/20 text-blue-900 dark:text-blue-200'
                                    : 'bg-brand-magenta/20 text-brand-magenta'
                              : readerTheme === 'dark'
                                ? 'bg-white/10 text-white/70'
                                : 'bg-slate-200/80 text-slate-700'
                              }`}>
                              صـ {heading.page}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {tocTree.map(node => (
                        <TocNode
                          key={node.originalIndex}
                          node={node}
                          expandedNodes={expandedNodes}
                          toggleExpand={toggleExpand}
                          currentPage={currentPage}
                          handlePageJump={handlePageJump}
                          activeHeadingText={activeHeadingText}
                          activeTocIndex={activeTocIndex}
                          activeAncestorIndices={activeAncestorIndices}
                          selectedTocIndex={selectedTocIndex}
                          readerTheme={readerTheme}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Panel */}
              <div className={`absolute inset-0 flex flex-col transition-all duration-300 ${sidebarTab === 'chat' ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 -translate-x-4 pointer-events-none -z-10'}`}>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar relative">
                  {chatHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-70">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${readerTheme === 'dark' ? 'bg-gradient-to-br from-brand-magenta/20 to-brand-blue/20 border border-brand-magenta/30 shadow-[0_0_20px_rgba(168,85,247,0.25)]' : 'bg-white border border-primary/20 shadow-[0_0_12px_rgba(168,85,247,0.2)]'}`}>
                        <img src={readerTheme === 'dark' ? whiteLogo : zadDarkLogo} alt="Zad" className="h-8 w-8 object-contain drop-shadow-md" />
                      </div>
                      <p className="font-bold mb-2">كيف يمكنني مساعدتك؟</p>
                      <p className="text-sm opacity-80 leading-relaxed">حدد أي نص من الكتاب واضغط "اشرح" أو اسألني مباشرة وسأقوم بتوضيحه لك.</p>
                    </div>
                  ) : (
                    chatHistory.map((msg) => (
                      <Bubble key={msg.id} message={msg} dark={readerTheme === 'dark'} />
                    ))
                  )}
                  {chatLoading && (
                    <TypingBubble dark={readerTheme === 'dark'} />
                  )}
                </div>

                <div className={`p-4 border-t ${readerTheme === 'dark' ? 'border-white/10 bg-[#1A2235]' : 'border-gray-200/60 bg-white'}`}>
                  <form onSubmit={handleSendChatMessage} className="flex flex-col w-full gap-2 relative">
                    <div className="gradient-border min-w-0 flex-1 rounded-[22px] p-[2px] shadow-lg shadow-primary/20 transition-all duration-300">
                      <div className={`flex items-end gap-2 rounded-[20px] py-1.5 pr-4 pl-2 transition-all duration-300 ${readerTheme === 'dark' ? 'bg-[#1A2235]' : 'bg-white'}`}>
                        <textarea
                          rows={1}
                          className={`font-sans min-w-0 flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:opacity-50 [&::-webkit-scrollbar]:hidden`}
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendChatMessage(e as any);
                            }
                          }}
                          placeholder="اكتب سؤالك هنا..."
                          disabled={chatLoading}
                        />
                        <button
                          type="submit"
                          disabled={!chatInput.trim() || chatLoading}
                          className="brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                          <Send className="h-4 w-4 rtl:-scale-x-100" />
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Feature 4: Full-Text In-Book Search Panel */}
              <div className={`absolute inset-0 flex flex-col transition-all duration-300 ${sidebarTab === 'search' ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-4 pointer-events-none -z-10'}`}>
                <div className="p-4 border-b border-border/40">
                  <form onSubmit={handleSearchInBook} className="relative group">
                    <button
                      type="submit"
                      disabled={!bookSearchQuery.trim() || isSearchingBook}
                      className={`absolute right-3 top-2.5 p-1 rounded-lg transition-all cursor-pointer ${
                        accentColor === 'amber'
                          ? 'text-[#966b2d] hover:text-[#76541f] dark:text-amber-400'
                          : accentColor === 'emerald'
                            ? 'text-teal-600 hover:text-teal-700 dark:text-teal-400'
                            : accentColor === 'blue'
                              ? 'text-blue-600 hover:text-blue-700 dark:text-blue-400'
                              : 'text-brand-magenta hover:text-purple-700 dark:text-purple-400'
                      } disabled:opacity-40`}
                      title="بدء البحث"
                    >
                      {isSearchingBook ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 stroke-[2.4]" />}
                    </button>
                    <input
                      type="text"
                      placeholder="ابحث في نصوص الكتاب..."
                      value={bookSearchQuery}
                      onChange={(e) => setBookSearchQuery(e.target.value)}
                      className={`w-full rounded-2xl pr-10 pl-9 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                        accentColor === 'amber'
                          ? 'focus:ring-amber-500'
                          : accentColor === 'emerald'
                            ? 'focus:ring-teal-500'
                            : accentColor === 'blue'
                              ? 'focus:ring-blue-500'
                              : 'focus:ring-brand-magenta'
                      } transition-all shadow-inner ${readerTheme === 'dark' ? 'bg-white/5 border border-white/10 text-white placeholder-white/40 focus:bg-white/10' : 'bg-slate-100 text-slate-900 placeholder-slate-400 border border-slate-200'}`}
                    />
                    {bookSearchQuery && (
                      <button
                        type="button"
                        onClick={() => { setBookSearchQuery(''); setBookSearchResults([]); setHasSearchedBook(false); }}
                        className="absolute left-3 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                        title="مسح البحث"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </form>
                  {hasSearchedBook && !isSearchingBook && (
                    <div className="flex items-center justify-between mt-2.5 text-[11px] px-1 text-muted-foreground font-semibold">
                      <span>النتائج: <strong className={accentColor === 'amber' ? 'text-[#966b2d] dark:text-amber-400' : 'text-brand-blue'}>{bookSearchResults.length}</strong> موضع</span>
                      {bookSearchResults.length > 0 && <span className="opacity-75">اضغط على أي نتيجة للقفز</span>}
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2.5">
                  {isSearchingBook ? (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
                      <Loader2 className={`h-7 w-7 animate-spin ${accentColor === 'amber' ? 'text-[#b88d46]' : 'text-brand-blue'}`} />
                      <p className="text-xs font-semibold">جاري البحث في بطون صفحات الكتاب...</p>
                    </div>
                  ) : !hasSearchedBook ? (
                    <div className="flex flex-col items-center justify-center h-56 text-center gap-3 p-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm ${
                        accentColor === 'amber'
                          ? 'bg-amber-500/10 border-amber-500/25 text-[#966b2d] dark:text-amber-400'
                          : accentColor === 'emerald'
                            ? 'bg-teal-500/10 border-teal-500/25 text-teal-600 dark:text-teal-400'
                            : accentColor === 'blue'
                              ? 'bg-blue-500/10 border-blue-500/25 text-blue-600 dark:text-blue-400'
                              : 'bg-brand-magenta/10 border-brand-magenta/25 text-brand-magenta'
                      }`}>
                        <Search className="w-7 h-7 stroke-[2.3]" />
                      </div>
                      <div className="space-y-1">
                        <p className={`text-sm font-bold ${readerTheme === 'dark' ? 'text-white/90' : 'text-slate-800'}`}>
                          ابحث عن أي لفظ أو مسألة في صفحات الكتاب
                        </p>
                        <p className={`text-xs ${readerTheme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>
                          سيتم استعراض كل المواضع مع مقتطفات السياق
                        </p>
                      </div>
                    </div>
                  ) : bookSearchResults.length === 0 ? (
                    <div className={`p-8 text-center text-xs font-bold rounded-2xl ${readerTheme === 'dark' ? 'bg-white/5 text-white/60' : 'bg-black/5 text-black/60'}`}>
                      لم يُعثر على أي نتائج مطابقة لـ "{bookSearchQuery}" في هذا الكتاب.
                    </div>
                  ) : (
                    bookSearchResults.map((hit, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSearchResult(hit)}
                        className={`w-full text-right p-3 rounded-2xl border transition-all text-xs group cursor-pointer ${hit.page === currentPage
                          ? 'bg-brand-blue/15 border-brand-blue/40 shadow-sm'
                          : readerTheme === 'dark'
                            ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-brand-blue/30'
                            : 'bg-white border-slate-200/80 hover:bg-blue-50/70 hover:border-blue-300'
                          }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-extrabold text-[11px] px-2 py-0.5 rounded-md bg-brand-blue/15 text-brand-blue border border-brand-blue/20">
                            صـ {hit.page} {hit.vol ? `(جـ ${hit.vol})` : ''}
                          </span>
                          {hit.headings && hit.headings.length > 0 && (
                            <span className="truncate text-[10px] text-muted-foreground max-w-[160px]">
                              {hit.headings[hit.headings.length - 1]}
                            </span>
                          )}
                        </div>
                        <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-200 line-clamp-3">
                          {hit.snippet || hit.text || ''}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Feature 2: Hadiths & Numbered Items Panel */}
              <div className={`absolute inset-0 flex flex-col transition-all duration-300 ${sidebarTab === 'hadiths' ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-4 pointer-events-none -z-10'}`}>
                <div className="p-4 border-b border-border/40">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="number"
                      placeholder={`أدخل رقم ${numberedItemsLabel.single}...`}
                      value={hadithSearchInput}
                      onChange={(e) => setHadithSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleJumpToHadith(hadithSearchInput);
                      }}
                      className={`flex-1 rounded-2xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${readerTheme === 'dark' ? 'bg-white/5 border border-white/10 text-white placeholder-white/40' : 'bg-slate-100 text-slate-900 placeholder-slate-400 border border-slate-200'}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleJumpToHadith(hadithSearchInput)}
                      className="px-3.5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all shrink-0 active:scale-95 cursor-pointer"
                    >
                      انتقال
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-semibold">
                    يتوفر في هذا الكتاب <strong className="text-amber-500">{hadithsCount}</strong> موضعاً مرقماً ({numberedItemsLabel.plural}).
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {Object.entries(hadithsMap).slice(0, 150).map(([hNum, pageTarget]) => (
                      <button
                        key={hNum}
                        onClick={() => setCurrentPage(pageTarget)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${pageTarget === currentPage
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-500 shadow-sm'
                          : readerTheme === 'dark'
                            ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-amber-500/40 text-slate-200'
                            : 'bg-white border-slate-200/80 hover:bg-amber-50 hover:border-amber-300 text-slate-800'
                          }`}
                      >
                        <span className="text-[10px] text-amber-500 font-extrabold">#{hNum}</span>
                        <span className="text-[9px] opacity-60">صـ {pageTarget}</span>
                      </button>
                    ))}
                  </div>
                  {hadithsCount > 150 && (
                    <p className="text-center text-[11px] text-muted-foreground mt-3 font-semibold">
                      استخدم حقل البحث بالأعلى للوصول الفوري لأي رقم حتى {hadithsCount}.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Resize Handle BETWEEN aside and main */}
        {(sidebarTab !== 'none' && !distractionFree) && (
          <div className="flex items-center justify-center shrink-0 z-40 relative">
            <PanelResizer onMouseDown={startResizing} isDark={readerTheme === 'dark'} label="اسحب لتغيير العرض" />
          </div>
        )}

        {/* Main Reading Area */}
        <main
          className={`flex-1 relative h-full flex flex-col overflow-hidden rounded-3xl border backdrop-blur-xl ${readerTheme === 'dark' ? 'border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]' : readerTheme === 'sepia' ? 'border-[#E2D6C0] bg-[#FAF5ED] shadow-[0_8px_30px_rgba(120,90,50,0.08)]' : 'border-gray-200/80 bg-white/70 shadow-lg'}`}
          style={{
            backgroundColor: readerTheme === 'dark' ? getReaderFrameBgColor(darkFrameOpacity) : undefined
          }}
        >

          {/* Page Actions Floating Toolbar */}
          {readingMode === 'paged' && (
            <div className={`absolute top-6 left-6 z-40 flex flex-col items-center rounded-xl transition-all duration-300 group/toolbar overflow-hidden hover:border hover:backdrop-blur-md hover:shadow-lg hover:bg-white/70 hover:border-gray-200/80 dark:hover:bg-[#0d071a]/95 dark:hover:border-white/10 sepia:hover:bg-[#EAE0C8]/95 sepia:hover:border-[#D4C4A8]`}>

              {/* Compact Trigger Icon */}
              <div className={`p-2 cursor-pointer flex group-hover/toolbar:hidden transition-colors ${isReadingPage ? 'opacity-100 animate-pulse' : 'opacity-80 hover:opacity-100'} ${accentColor === 'amber' ? 'text-[#b88d46]' : accentColor === 'emerald' ? 'text-teal-600' : accentColor === 'blue' ? 'text-blue-600' : 'text-brand-magenta'}`}>
                <MoreVertical className="h-7 w-7 drop-shadow-md" />
              </div>

              {/* Expanded Actions */}
              <div className="hidden group-hover/toolbar:flex flex-col items-center gap-1.5 px-1 py-2 w-full animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={toggleBookmark}
                  className={`p-2 rounded-xl transition-all ${bookmarks.includes(currentPage)
                    ? accentColor === 'amber'
                      ? 'bg-amber-500/15 text-[#b88d46] shadow-sm'
                      : accentColor === 'emerald'
                        ? 'bg-teal-500/15 text-teal-600 shadow-sm'
                        : accentColor === 'blue'
                          ? 'bg-blue-500/15 text-blue-600 shadow-sm'
                          : 'bg-brand-magenta/15 text-brand-magenta shadow-sm'
                    : `text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 ${accentColor === 'amber' ? 'hover:text-[#b88d46]' : accentColor === 'emerald' ? 'hover:text-teal-600' : accentColor === 'blue' ? 'hover:text-blue-600' : 'hover:text-brand-magenta'}`
                    }`}
                  title={bookmarks.includes(currentPage) ? "إزالة العلامة" : "حفظ كعلامة مرجعية"}
                >
                  {bookmarks.includes(currentPage) ? (
                    <BookmarkCheck className={`h-5 w-5 ${accentColor === 'amber' ? 'fill-amber-500/20' : accentColor === 'emerald' ? 'fill-teal-500/20' : accentColor === 'blue' ? 'fill-blue-500/20' : 'fill-brand-magenta/20'}`} />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                </button>
                <div className="w-4 h-px bg-border/50 my-0.5 shrink-0" />
                <button
                  onClick={handleCopyPage}
                  className={`p-2 rounded-xl transition-all ${pageCopied ? 'text-emerald-500 bg-emerald-500/10' : `text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 ${accentColor === 'amber' ? 'hover:text-[#b88d46]' : accentColor === 'emerald' ? 'hover:text-teal-600' : accentColor === 'blue' ? 'hover:text-blue-600' : 'hover:text-brand-magenta'}`}`}
                  title="نسخ محتوى الصفحة"
                >
                  <Copy className="h-5 w-5" />
                </button>
                <div className="w-4 h-px bg-border/50 my-0.5 shrink-0" />

                <button
                  onClick={() => { setDistractionFree(!distractionFree); setShowSettings(false); setShowBookmarks(false); }}
                  className={`p-2 rounded-xl transition-all text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 ${accentColor === 'amber' ? 'hover:text-[#b88d46]' : accentColor === 'emerald' ? 'hover:text-teal-600' : accentColor === 'blue' ? 'hover:text-blue-600' : 'hover:text-brand-magenta'}`}
                  title={distractionFree ? "إنهاء وضع ملء الشاشة" : "وضع ملء الشاشة"}
                >
                  {distractionFree ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                </button>

                <div className="w-4 h-px bg-border/50 my-0.5 shrink-0" />
                <AudioReaderButton
                  text={pageText?.main || ''}
                  dark={readerTheme === 'dark' || readerTheme === 'sepia'}
                  showTextLabel={false}
                  hidePodcast={true}
                  onStateChange={(playing) => setIsReadingPage(playing)}
                  orientation="vertical"
                  colorTheme={accentColor === 'emerald' ? 'emerald' : 'purple'}
                  menuPlacement="left"
                  className={`!bg-transparent !border-transparent !shadow-none !p-2 !rounded-xl !text-muted-foreground hover:!bg-black/5 dark:hover:!bg-white/5 ${accentColor === 'amber' ? 'hover:!text-[#b88d46]' : accentColor === 'emerald' ? 'hover:!text-teal-600' : accentColor === 'blue' ? 'hover:!text-blue-600' : 'hover:!text-brand-magenta'} [&_svg]:!h-5 [&_svg]:!w-5`}
                />
              </div>
            </div>
          )}



          {/* Reading Progress Line */}
          {!distractionFree && (
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-black/5 dark:bg-white/5 z-20">
              <div className="h-full brand-gradient transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
          )}

          <div ref={scrollContainerRef} onScroll={handleScroll} className={`flex-1 overflow-y-auto ${readingMode === 'continuous' ? 'px-4 md:px-8 lg:px-12' : 'px-6 md:px-12 lg:px-24'} pb-32 pt-8 custom-scrollbar relative flex justify-center transition-all duration-500`}>
            <div className={`w-full ${readingMode === 'continuous' ? 'max-w-7xl' : 'max-w-4xl'} min-h-full transition-all duration-500`}>
              {loadingPage ? (
                <div className="h-[60vh] flex flex-col items-center justify-center opacity-70 gap-5">
                  <div className="relative">
                    <div className="absolute inset-0 brand-gradient rounded-full blur-xl opacity-40 animate-pulse" />
                    <Loader2 className="h-12 w-12 animate-spin text-brand-magenta relative z-10" />
                  </div>
                  <p className="font-bold text-lg animate-pulse tracking-wide">جاري إعداد الصفحة...</p>
                </div>
              ) : pageText ? (
                <div className="animate-in fade-in duration-700">
                  <style>{`
                  /* Base Text Font Size - dynamically driven by fontSize state (default 22px, controlled by slider) */
                  .turath-content,
                  .turath-content p,
                  .turath-content div,
                  .turath-content span:not([data-type="title"]):not([data-type="poetry"]):not([data-type="page"]):not([data-type="honorific"]):not(.islamic-honorific) {
                    font-size: ${fontSize}px !important;
                    line-height: 2.3 !important;
                  }

                  /* Primary Main Chapter Headings (Level 1: "كتاب الصلاة", "باب المواقيت") */
                  .turath-content h1,
                  .turath-content h2,
                  .turath-content .main-title,
                  .turath-content span[data-type="title"][data-level="1"],
                  .turath-content span[data-type="title"].main-title {
                    display: block !important;
                    text-align: center !important;
                    font-family: 'Scheherazade New', 'Amiri', serif !important;
                    font-weight: 700;
                    font-size: 1.25em !important;
                    line-height: 1.4 !important;
                    margin: 1.35rem auto 0.4rem !important;
                    position: relative;
                    width: fit-content;
                    max-width: 90%;
                    padding: 0 1rem 0.35rem;
                    background: transparent !important;
                    border-radius: 0 !important;
                    border-bottom: 2px solid ${readerTheme === 'dark' ? darkTitleBorder : lightTitleBorder};
                  }

                  /* Secondary Sub-Titles & Mas'alahs (Level 2+: "فصل", "مسألة", etc.) */
                  .turath-content span[data-type="title"]:not([data-level="1"]),
                  .turath-content span[data-type="title"][data-level="2"],
                  .turath-content span[data-type="title"][data-level="3"],
                  .turath-content span[data-type="title"][data-level="4"],
                  .turath-content span[data-type="title"][data-level="5"],
                  .turath-content h3,
                  .turath-content h4 {
                    display: block !important;
                    text-align: right !important;
                    font-family: 'Scheherazade New', 'Amiri', serif !important;
                    font-weight: 700 !important;
                    font-size: 1.05em !important;
                    line-height: 1.4 !important;
                    margin: 0.95rem 0 0.25rem 0 !important;
                    position: relative;
                    width: 100% !important;
                    max-width: 100% !important;
                    padding: 0 !important;
                    background: transparent !important;
                    border-radius: 0 !important;
                    border: none !important;
                  }

                  .turath-content > span[data-type="title"]:first-child,
                  .turath-content > h1:first-child,
                  .turath-content > h2:first-child,
                  .turath-content > h3:first-child,
                  .turath-content > h4:first-child {
                    margin-top: 0.25rem !important;
                  }

                  .turath-content span[data-type="title"] + p {
                    margin-top: 0.2rem !important;
                  }

                  .turath-content span[data-type="title"]::before,
                  .turath-content span[data-type="title"]::after {
                    content: none;
                  }

                  /* Honorifics & Ligatures Base Styling */
                  .turath-content span[data-type="honorific"],
                  .turath-content .islamic-honorific {
                    display: inline !important;
                    font-weight: 700 !important;
                    margin: 0 0.15rem !important;
                    padding: 0 !important;
                    background: none !important;
                    border: none !important;
                  }

                  /* Light Reader Theme Colors */
                  .light-reader .turath-content,
                  .light-reader .turath-content p,
                  .light-reader .turath-content span:not([data-type="title"]):not([data-type="poetry"]):not([data-type="page"]):not([data-type="honorific"]):not(.islamic-honorific) {
                      color: #0f172a !important;
                  }
                  .light-reader .turath-content h1,
                  .light-reader .turath-content h2,
                  .light-reader .turath-content .main-title {
                      color: ${lightTitleColor} !important;
                      -webkit-text-fill-color: ${lightTitleColor} !important;
                      background: none !important;
                      border-bottom-color: ${lightTitleBorder} !important;
                  }
                  .light-reader .turath-content span[data-type="title"],
                  .light-reader .turath-content h3,
                  .light-reader .turath-content h4 {
                      color: ${lightTitleColor} !important;
                      -webkit-text-fill-color: ${lightTitleColor} !important;
                      background: none !important;
                      font-weight: 800 !important;
                  }
                  .light-reader .turath-content span[data-type="honorific"],
                  .light-reader .turath-content .islamic-honorific {
                      color: ${lightTitleColor} !important;
                  }

                  /* Sepia Reader Theme Colors */
                  .sepia-reader .turath-content,
                  .sepia-reader .turath-content p,
                  .sepia-reader .turath-content span:not([data-type="title"]):not([data-type="poetry"]):not([data-type="page"]):not([data-type="honorific"]):not(.islamic-honorific) {
                      color: #3b2a1a !important;
                  }
                  .sepia-reader .turath-content h1,
                  .sepia-reader .turath-content h2,
                  .sepia-reader .turath-content .main-title {
                      color: #92400e !important;
                      -webkit-text-fill-color: #92400e !important;
                      background: none !important;
                      border-bottom-color: rgba(180, 83, 9, 0.4) !important;
                  }
                  .sepia-reader .turath-content span[data-type="title"],
                  .sepia-reader .turath-content h3,
                  .sepia-reader .turath-content h4 {
                      color: #92400e !important;
                      -webkit-text-fill-color: #92400e !important;
                      background: none !important;
                      font-weight: 800 !important;
                  }
                  .sepia-reader .turath-content span[data-type="honorific"],
                  .sepia-reader .turath-content .islamic-honorific {
                      color: #b45309 !important;
                  }

                  /* Dark Reader Theme Colors */
                  .dark-reader .turath-content,
                  .dark-reader .turath-content p,
                  .dark-reader .turath-content span:not([data-type="title"]):not([data-type="poetry"]):not([data-type="page"]):not([data-type="honorific"]):not(.islamic-honorific) {
                      color: #ffffff !important;
                  }
                  .dark-reader .turath-content h1,
                  .dark-reader .turath-content h2,
                  .dark-reader .turath-content .main-title {
                      color: ${darkTitleColor} !important;
                      -webkit-text-fill-color: ${darkTitleColor} !important;
                      background: transparent !important;
                      border-bottom-color: ${darkTitleBorder} !important;
                      filter: none !important;
                      text-shadow: none !important;
                      font-weight: 800 !important;
                  }
                  .dark-reader .turath-content span[data-type="title"],
                  .dark-reader .turath-content h3,
                  .dark-reader .turath-content h4 {
                      color: ${darkTitleColor} !important;
                      -webkit-text-fill-color: ${darkTitleColor} !important;
                      background: transparent !important;
                      filter: none !important;
                      text-shadow: none !important;
                      font-weight: 800 !important;
                  }
                  .dark-reader .turath-content span[data-type="honorific"],
                  .dark-reader .turath-content .islamic-honorific {
                      color: ${darkTitleColor} !important;
                  }
                  .turath-content span[data-type="poetry"] {
                    display: block;
                    text-align: center;
                    color: var(--color-primary);
                    font-style: italic;
                    margin: 1.5rem 0;
                    font-size: 1.1em;
                  }
                  .turath-content span[data-type="page"] {
                    display: inline-flex;
                    align-items: center;
                    font-size: 0.72em;
                    font-family: var(--font-sans, 'Cairo', sans-serif);
                    font-weight: 700;
                    color: ${lightTitleColor};
                    background: ${accentColor === 'amber' ? 'rgba(184, 141, 70, 0.1)' : accentColor === 'emerald' ? 'rgba(13, 148, 136, 0.1)' : accentColor === 'blue' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(149, 11, 196, 0.1)'};
                    border: 1px solid ${lightTitleBorder};
                    padding: 0.1rem 0.55rem;
                    border-radius: 6px;
                    margin: 1rem 0 0.5rem;
                    user-select: none;
                    line-height: 1.3;
                    direction: rtl;
                  }
                  .dark-reader .turath-content span[data-type="page"] {
                    color: ${darkTitleColor} !important;
                    background: ${accentColor === 'amber' ? 'rgba(223, 191, 131, 0.15)' : accentColor === 'emerald' ? 'rgba(45, 212, 191, 0.15)' : accentColor === 'blue' ? 'rgba(96, 165, 250, 0.15)' : 'rgba(168, 85, 247, 0.15)'} !important;
                    border-color: ${darkTitleBorder} !important;
                  }
                  .turath-content {
                      white-space: pre-wrap;
                      word-wrap: break-word;
                      text-align: justify;
                  }
                  /* Modern Glassmorphic Footnote Reference Badge Styling */
                  .turath-content .islamic-footnote-sup {
                    display: inline-flex !important;
                    vertical-align: baseline !important;
                    position: relative !important;
                    top: -0.22em !important;
                    margin: 0 0.2rem !important;
                    line-height: 1 !important;
                  }
                  .turath-content .islamic-footnote-ref {
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    text-decoration: none !important;
                    border-bottom: none !important;
                    line-height: 1 !important;
                    user-select: none !important;
                    backdrop-filter: blur(8px) !important;
                    -webkit-backdrop-filter: blur(8px) !important;
                    transition: all 0.2s ease-in-out !important;
                    min-width: 22px !important;
                    height: 22px !important;
                    padding: 0 5px !important;
                    border-radius: 9999px !important;
                    font-family: 'Amiri', 'Scheherazade New', 'Cairo', serif !important;
                    font-weight: 700 !important;
                    font-size: 13px !important;
                  }
                  .light-reader .turath-content .islamic-footnote-ref {
                    background: ${accentColor === 'amber' ? 'rgba(184, 141, 70, 0.12)' : accentColor === 'emerald' ? 'rgba(13, 148, 136, 0.12)' : accentColor === 'blue' ? 'rgba(37, 99, 235, 0.12)' : 'rgba(149, 11, 196, 0.12)'} !important;
                    border: 1.5px solid ${accentColor === 'amber' ? '#b88d46' : accentColor === 'emerald' ? '#0d9488' : accentColor === 'blue' ? '#2563eb' : '#950bc4'} !important;
                    color: ${accentColor === 'amber' ? '#78531b' : accentColor === 'emerald' ? '#0f766e' : accentColor === 'blue' ? '#1d4ed8' : '#7e22ce'} !important;
                    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08) !important;
                  }
                  .light-reader .turath-content .islamic-footnote-ref:hover {
                    background: ${accentColor === 'amber' ? 'rgba(184, 141, 70, 0.25)' : accentColor === 'emerald' ? 'rgba(13, 148, 136, 0.25)' : accentColor === 'blue' ? 'rgba(37, 99, 235, 0.25)' : 'rgba(149, 11, 196, 0.25)'} !important;
                    border-color: ${accentColor === 'amber' ? '#8e682d' : accentColor === 'emerald' ? '#0f766e' : accentColor === 'blue' ? '#1e40af' : '#6b21a8'} !important;
                    transform: scale(1.1) !important;
                  }
                  .sepia-reader .turath-content .islamic-footnote-ref {
                    background: rgba(180, 83, 9, 0.1) !important;
                    border: 1px solid rgba(180, 83, 9, 0.3) !important;
                    color: #92400e !important;
                    box-shadow: 0 2px 6px rgba(180, 83, 9, 0.08) !important;
                  }
                  .sepia-reader .turath-content .islamic-footnote-ref:hover {
                    background: rgba(180, 83, 9, 0.2) !important;
                    border-color: rgba(180, 83, 9, 0.5) !important;
                    transform: scale(1.1) !important;
                  }
                  .dark-reader .turath-content .islamic-footnote-ref {
                    background: ${accentColor === 'amber' ? 'rgba(223, 191, 131, 0.15)' : accentColor === 'emerald' ? 'rgba(45, 212, 191, 0.15)' : accentColor === 'blue' ? 'rgba(96, 165, 250, 0.15)' : 'rgba(168, 85, 247, 0.18)'} !important;
                    border: 1px solid ${darkTitleBorder} !important;
                    color: ${darkTitleColor} !important;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
                  }
                  .dark-reader .turath-content .islamic-footnote-ref:hover {
                    background: ${accentColor === 'amber' ? 'rgba(223, 191, 131, 0.3)' : accentColor === 'emerald' ? 'rgba(45, 212, 191, 0.3)' : accentColor === 'blue' ? 'rgba(96, 165, 250, 0.3)' : 'rgba(168, 85, 247, 0.35)'} !important;
                    border-color: ${darkTitleColor} !important;
                    transform: scale(1.1) !important;
                  }
                `}</style>
                  <div className={`${readerTheme === 'dark' ? 'dark-reader' : readerTheme === 'sepia' ? 'sepia-reader' : 'light-reader'}`}>
                    {readingMode === 'paged' ? (
                      <>
                        {/* Matn Section */}
                        <div
                          data-page={currentPage}
                          className={`turath-content prose prose-lg max-w-none leading-[2.4] ${selectionClass} ${fontFamily} prose-headings:m-0 prose-headings:leading-tight prose-p:my-1`}
                          style={{ fontSize: `${fontSize}px` }}
                          dangerouslySetInnerHTML={{ __html: pageText?.matn || pageText?.main || '' }}
                        />

                        {/* Sharh Section with Divider */}
                        {pageText?.sharh && (
                          <div className="mt-6">
                            <RenderSharhDivider readerTheme={readerTheme} />
                            <div
                              className={`turath-content prose prose-lg max-w-none leading-[2.4] ${selectionClass} ${fontFamily} prose-headings:m-0 prose-headings:leading-tight prose-p:my-1`}
                              style={{ fontSize: `${fontSize}px` }}
                              dangerouslySetInnerHTML={{ __html: pageText.sharh }}
                            />
                          </div>
                        )}

                        {/* Footnote Section with Divider */}
                        {pageText?.footnote && (
                          <RenderFootnotes
                            footnoteText={pageText.footnote}
                            readerTheme={readerTheme}
                            fontFamily={fontFamily}
                            fontSize={fontSize}
                          />
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col gap-12 pt-6">
                        {/* Status for previous page */}
                        {loadingPrev && (
                          <div className="flex flex-col items-center justify-center py-6 gap-3 min-h-[100px] opacity-60">
                            <Loader2 className="h-6 w-6 animate-spin text-brand-magenta" />
                            <span className="text-sm font-semibold">جاري جلب الصفحات السابقة...</span>
                          </div>
                        )}

                        {continuousPages.map((p, idx) => (
                          <div key={p.page} data-page={p.page} className={`relative p-6 md:p-10 pl-16 rounded-[2rem] border ${readerTheme === 'dark' ? 'border-white/10 bg-[#181825]/40' : readerTheme === 'sepia' ? 'border-[#E2D6C0] bg-[#FFFDF9]' : 'border-gray-200 bg-white/40'} shadow-sm transition-all duration-300 hover:shadow-md group`}>
                            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rounded-full px-6 py-1.5 text-sm font-bold shadow-sm border backdrop-blur-md ${readerTheme === 'dark' ? 'bg-[#0d071a] border-white/10 text-white/70' : readerTheme === 'sepia' ? 'bg-[#FAF5ED] border-[#E2D6C0] text-[#7A401A]' : 'bg-white border-gray-200 text-gray-500'}`}>
                              صفحة {p.page}
                            </div>

                            {/* Inner Page Actions Toolbar */}
                            <div className={`absolute top-4 md:top-5 left-3 md:left-5 z-10 flex flex-col items-center rounded-xl transition-all duration-300 group/toolbar overflow-hidden hover:border hover:backdrop-blur-md hover:shadow-sm hover:bg-white/70 hover:border-gray-200/80 dark:hover:bg-[#0d071a]/95 dark:hover:border-white/10 sepia:hover:bg-[#FAF5ED]/95 sepia:hover:border-[#E2D6C0]`}>

                              {/* Compact Trigger Icon */}
                              <div className={`p-2 cursor-pointer flex group-hover/toolbar:hidden transition-colors hover:scale-110 ${accentColor === 'amber' ? 'text-[#b88d46]' : accentColor === 'emerald' ? 'text-teal-600' : accentColor === 'blue' ? 'text-blue-600' : 'text-brand-magenta'}`}>
                                <MoreVertical className="h-6 w-6 opacity-90 drop-shadow-md" />
                              </div>

                              {/* Expanded Actions */}
                              <div className="hidden group-hover/toolbar:flex flex-col items-center gap-1.5 px-1 py-2 w-full animate-in fade-in zoom-in-95 duration-200">
                                <button
                                  onClick={() => {
                                    setBookmarks(prev => prev.includes(p.page) ? prev.filter(b => b !== p.page) : [...prev, p.page])
                                  }}
                                  className={`p-1.5 rounded-lg transition-all ${bookmarks.includes(p.page)
                                    ? accentColor === 'amber'
                                      ? 'bg-amber-500/15 text-[#b88d46] shadow-sm'
                                      : accentColor === 'emerald'
                                        ? 'bg-teal-500/15 text-teal-600 shadow-sm'
                                        : accentColor === 'blue'
                                          ? 'bg-blue-500/15 text-blue-600 shadow-sm'
                                          : 'bg-brand-magenta/15 text-brand-magenta shadow-sm'
                                    : `text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 ${accentColor === 'amber' ? 'hover:text-[#b88d46]' : accentColor === 'emerald' ? 'hover:text-teal-600' : accentColor === 'blue' ? 'hover:text-blue-600' : 'hover:text-brand-magenta'}`
                                    }`}
                                  title={bookmarks.includes(p.page) ? "إزالة العلامة" : "حفظ كعلامة مرجعية"}
                                >
                                  {bookmarks.includes(p.page) ? (
                                    <BookmarkCheck className={`h-4 w-4 ${accentColor === 'amber' ? 'fill-amber-500/20' : accentColor === 'emerald' ? 'fill-teal-500/20' : accentColor === 'blue' ? 'fill-blue-500/20' : 'fill-brand-magenta/20'}`} />
                                  ) : (
                                    <Bookmark className="h-4 w-4" />
                                  )}
                                </button>
                                <div className="w-3 h-px bg-border/50 my-0.5 shrink-0" />
                                <button
                                  onClick={() => {
                                    const textToCopy = formatPageCopyText(
                                      p.matn || p.text,
                                      p.sharh,
                                      p.footnote,
                                      book.title,
                                      book.author,
                                      p.page
                                    );
                                    navigator.clipboard.writeText(textToCopy);
                                  }}
                                  className={`p-1.5 rounded-lg transition-all text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 ${accentColor === 'amber' ? 'hover:text-[#b88d46]' : accentColor === 'emerald' ? 'hover:text-teal-600' : accentColor === 'blue' ? 'hover:text-blue-600' : 'hover:text-brand-magenta'}`}
                                  title="نسخ محتوى الصفحة"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                                <div className="w-3 h-px bg-border/50 my-0.5 shrink-0" />
                                <button
                                  onClick={() => { setDistractionFree(!distractionFree); setShowSettings(false); setShowBookmarks(false); }}
                                  className={`p-1.5 rounded-lg transition-all text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 ${accentColor === 'amber' ? 'hover:text-[#b88d46]' : accentColor === 'emerald' ? 'hover:text-teal-600' : accentColor === 'blue' ? 'hover:text-blue-600' : 'hover:text-brand-magenta'}`}
                                  title={distractionFree ? "إنهاء وضع ملء الشاشة" : "وضع ملء الشاشة"}
                                >
                                  {distractionFree ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                                </button>
                                <div className="w-3 h-px bg-border/50 my-0.5 shrink-0" />
                                <AudioReaderButton
                                  text={p.matn ? `${p.matn} ${p.sharh || ''}` : p.text}
                                  dark={readerTheme === 'dark'}
                                  showTextLabel={false}
                                  hidePodcast={true}
                                  onStateChange={(playing) => setIsReadingPage(playing)}
                                  orientation="vertical"
                                  colorTheme={accentColor === 'emerald' ? 'emerald' : 'purple'}
                                  menuPlacement="left"
                                  className={`!bg-transparent !border-transparent !shadow-none !p-1.5 !rounded-lg !text-muted-foreground hover:!bg-black/5 dark:hover:!bg-white/5 ${accentColor === 'amber' ? 'hover:!text-[#b88d46]' : accentColor === 'emerald' ? 'hover:!text-teal-600' : accentColor === 'blue' ? 'hover:!text-blue-600' : 'hover:!text-brand-magenta'}`}
                                />
                              </div>
                            </div>

                            {/* Matn Section */}
                            <div
                              className={`turath-content prose prose-lg max-w-none leading-[2.4] ${selectionClass} ${fontFamily} prose-headings:m-0 prose-headings:leading-tight prose-p:my-1`}
                              style={{ fontSize: `${fontSize}px` }}
                              dangerouslySetInnerHTML={{ __html: p.matn || p.text }}
                            />

                            {/* Sharh Section with Divider */}
                            {p.sharh && (
                              <div className="mt-6">
                                <RenderSharhDivider readerTheme={readerTheme} />
                                <div
                                  className={`turath-content prose prose-lg max-w-none leading-[2.4] ${selectionClass} ${fontFamily} prose-headings:m-0 prose-headings:leading-tight prose-p:my-1`}
                                  style={{ fontSize: `${fontSize}px` }}
                                  dangerouslySetInnerHTML={{ __html: p.sharh }}
                                />
                              </div>
                            )}

                            {/* Footnote Section with Divider */}
                            {p.footnote && (
                              <RenderFootnotes
                                footnoteText={p.footnote}
                                readerTheme={readerTheme}
                                fontFamily={fontFamily}
                                fontSize={fontSize}
                              />
                            )}
                          </div>
                        ))}

                        {/* Status for next page */}
                        <div className="flex flex-col items-center justify-center p-8 gap-4 min-h-[150px]">
                          {loadingNext ? (
                            <div className="flex flex-col items-center gap-3 opacity-60">
                              <Loader2 className={`h-8 w-8 animate-spin ${getPaginationLayersIconClass()}`} />
                              <span className="text-sm font-semibold">جاري سحب الصفحة التالية...</span>
                            </div>
                          ) : loadNextError ? (
                            <div className="flex flex-col items-center gap-4 text-center">
                              <span className="text-sm text-red-500 font-semibold bg-red-500/10 px-6 py-3 rounded-xl border border-red-500/20">حدث خطأ في تحميل الصفحة التالية. يرجى التحقق من اتصالك بالإنترنت.</span>
                              <button
                                onClick={loadNextPage}
                                className={`px-6 py-2 rounded-xl font-bold shadow-md transition-all hover:scale-105 active:scale-95 ${accentColor === 'amber'
                                  ? 'bg-gradient-to-r from-[#8e682d] via-[#b88d46] to-[#dfbf83] text-stone-950 hover:brightness-110'
                                  : accentColor === 'emerald'
                                    ? 'bg-teal-600 text-white hover:bg-teal-500'
                                    : accentColor === 'blue'
                                      ? 'bg-blue-600 text-white hover:bg-blue-500'
                                      : 'bg-brand-magenta text-white hover:bg-brand-magenta/90'
                                  }`}
                              >
                                إعادة المحاولة
                              </button>
                            </div>
                          ) : hasReachedEnd ? (
                            <span className="text-sm text-muted-foreground opacity-60 font-semibold bg-black/5 dark:bg-white/5 px-6 py-2 rounded-full border border-black/10 dark:border-white/10">نهاية الكتاب</span>
                          ) : null}
                        </div>
                      </div>
                    )}

                    {/* Spacer to allow scrolling footnotes past the floating footer */}
                    <div className="h-32 md:h-48 shrink-0 w-full" />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Floating Pagination Footer with Inline Page & Volume Controls */}
          {readingMode === 'paged' && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 opacity-100 translate-y-0">
              <footer className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-2xl border backdrop-blur-xl shadow-2xl ${readerTheme === 'dark' ? 'bg-[#121826]/90 border-white/10 shadow-black/50 text-white' : readerTheme === 'sepia' ? 'bg-[#FAF5ED]/95 border-[#E2D6C0] shadow-[0_10px_30px_rgba(80,50,20,0.1)] text-[#3D2C1D]' : 'bg-white/95 border-gray-200/90 shadow-xl text-slate-900'}`}>
                {/* Previous Page (RTL: Right Arrow) */}
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={currentPage <= 1}
                  className={`flex items-center justify-center p-2 rounded-xl transition-all duration-300 font-bold shadow-xs disabled:opacity-30 disabled:pointer-events-none group cursor-pointer ${readerTheme === 'dark'
                    ? `bg-white/5 ${getPaginationBtnHoverClass()}`
                    : readerTheme === 'sepia'
                      ? 'bg-[#F0E5D4] hover:bg-[#8B5226] hover:text-white text-[#4A3523]'
                      : `bg-slate-100 ${getPaginationBtnHoverClass()} text-slate-700`
                    }`}
                  title="الصفحة السابقة"
                >
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Inline Volume & Page Direct Jump Inputs */}
                <div
                  className={`flex items-center gap-2 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl border transition-all ${getPaginationInputContainerClass()}`}
                >
                  <Layers className={`w-3.5 h-3.5 shrink-0 ${getPaginationLayersIconClass()}`} />

                  {/* Volume Input (Shown if book has multiple volumes or citation contains vol) */}
                  {(Boolean(currentPrintCitation?.vol) || volumesList.length > 1 || Object.keys(volumeBounds).length > 1) && (
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] sm:text-xs font-bold opacity-75">جـ</span>
                      <input
                        type="text"
                        value={printVolInput}
                        onChange={(e) => setPrintVolInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleJumpToPrintPage(printVolInput, printPageInput);
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        onBlur={() => handleJumpToPrintPage(printVolInput, printPageInput)}
                        placeholder="1"
                        className={`w-8 sm:w-10 text-center font-bold text-xs sm:text-sm bg-black/5 dark:bg-white/10 rounded-lg py-0.5 px-1 border border-black/10 dark:border-white/10 ${inputFocusBorderClass} focus:outline-none transition-all`}
                        title="رقم الجزء / المجلد - اضغط Enter للانتقال"
                      />
                    </div>
                  )}

                  {/* Page Input */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] sm:text-xs font-bold opacity-75">صـ</span>
                    <input
                      type="text"
                      value={printPageInput}
                      onChange={(e) => setPrintPageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleJumpToPrintPage(printVolInput, printPageInput);
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                      onBlur={() => handleJumpToPrintPage(printVolInput, printPageInput)}
                      placeholder={String(currentPage)}
                      className={`w-10 sm:w-14 text-center font-bold text-xs sm:text-sm bg-black/5 dark:bg-white/10 rounded-lg py-0.5 px-1 border border-black/10 dark:border-white/10 ${inputFocusBorderClass} focus:outline-none transition-all`}
                      title="رقم الصفحة - اكتب الرقم واضغط Enter للانتقال مباشرة"
                    />
                  </div>

                  {/* Total pages fallback if maxPage known and no print mapping */}
                  {maxPage && !currentPrintCitation && (
                    <span className="text-[10px] sm:text-xs opacity-60 font-sans">
                      من {maxPage}
                    </span>
                  )}
                </div>

                {/* Next Page (RTL: Left Arrow) */}
                <button
                  type="button"
                  onClick={goNext}
                  disabled={currentPage >= (maxPage || 1)}
                  className={`flex items-center justify-center p-2 rounded-xl transition-all duration-300 font-bold shadow-xs disabled:opacity-30 disabled:pointer-events-none group cursor-pointer ${readerTheme === 'dark'
                    ? `bg-white/5 ${getPaginationBtnHoverClass()}`
                    : readerTheme === 'sepia'
                      ? 'bg-[#F0E5D4] hover:bg-[#8B5226] hover:text-white text-[#4A3523]'
                      : `bg-slate-100 ${getPaginationBtnHoverClass()} text-slate-700`
                    }`}
                  title="الصفحة التالية"
                >
                  <ChevronLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
                </button>
              </footer>
            </div>
          )}
        </main>
      </div>

    </div>
  )
}
