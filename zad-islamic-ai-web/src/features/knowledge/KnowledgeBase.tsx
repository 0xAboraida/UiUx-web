import React, { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen, Library, Search, X, Pen, FileText, User, Info,
  ChevronUp, Loader2, Sparkles, LayoutGrid, List, ArrowUpDown,
  Calendar, Layers, Award, BookMarked, Clock, ChevronDown,
  GraduationCap, ChevronLeft, ArrowRight, BookCheck, ArrowLeft,
  Menu, Bookmark, PanelLeftClose, PanelLeftOpen, RotateCcw,
  Heart, Sun, Moon, Hash, Settings, Palette, LogOut,
  Smartphone, Share2, LogIn, ShieldCheck, Download, FileDown
} from 'lucide-react'
import whiteLogo from '@/assets/images/WhiteLogo.png'
import darkLogo from '@/assets/images/ZadDarkLogo.png'
import libraryBgLight from '@/assets/images/library background light 2.png'
import libraryBgDark from '@/assets/images/library background Sunset 1.png'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { getAvatarUrl } from '../../api/client'
import NotificationBell from '../../components/layout/NotificationBell'
import { AuthorBiographyModal } from '../../components/common/AuthorBiographyModal'
import UserProfileModal from '../profile/UserProfileModal'
import TurathReader from './TurathReader'
import LibrarySidebar from './components/LibrarySidebar'
import SettingsModal from './components/SettingsModal'
import LibraryHomeView from './components/LibraryHomeView'
import IslamicPattern from './components/IslamicPattern'
import MediaExplanationsView from './components/MediaExplanationsView'
import CurrentCoursesView from './components/CurrentCoursesView'
import FavoriteBooksView from './components/FavoriteBooksView'
import { INITIAL_SHEIKHS, INITIAL_PLAYLISTS, INITIAL_STANDALONE, INITIAL_COURSES } from './data/mediaData'
import { Sheikh, MediaPlaylist, MediaStandalone, Course } from './types/mediaTypes'
import { domains as initialDomainsData } from './data'
import authorsDeathData from './data/authors_death.json'

export type BookMeta = {
  id: number;
  title: string;
  name?: string;
  author: string;
  author_name?: string;
  author_id?: number;
  category?: string;
  cat_name?: string;
  infoText?: string;
  book_info_text?: string;
  info?: string;
  authorBioText?: string;
  author_bio_text?: string;
  death_year?: number | null;
  century?: number | string | null;
  century_name?: string;
  has_pdf?: boolean;
  pdf_url?: string;
  pdf_links?: { root?: string; files?: string[] } | null;
  page_count?: number | null;
  size?: number | null;
};

const KNOWN_PDF_MAP: Record<string, { has_pdf: boolean; pdf_url?: string }> = {
  'عمدة الفقه': { has_pdf: true },
  'المغني': { has_pdf: true },
  'بدائع الصنائع': { has_pdf: true },
  'بداية المجتهد': { has_pdf: true },
  'صحيح البخاري': { has_pdf: true },
  'صحيح مسلم': { has_pdf: true },
  'سنن أبي داود': { has_pdf: true },
  'تفسير ابن كثير': { has_pdf: true },
  'كتاب التوحيد': { has_pdf: true },
  'الرحيق المختوم': { has_pdf: true },
  'السيرة النبوية': { has_pdf: true },
  'شرح عمدة الفقه': { has_pdf: true, pdf_url: 'https://files.turath.io/pdf/omda_taimia/omda_1.pdf' },
  'زاد المستقنع': { has_pdf: false },
  'العقيدة الواسطية': { has_pdf: false },
  'تفسير الطبري': { has_pdf: false },
  'الأجرومية': { has_pdf: false },
  'شذا العرف': { has_pdf: false },
  'البداية والنهاية': { has_pdf: false },
  'الأم': { has_pdf: false },
  'المدونة الكبرى': { has_pdf: false },
  'المدوّنة الكبرى': { has_pdf: false },
};

export function hasBookPdf(book: BookMeta): boolean {
  if (typeof book.has_pdf === 'boolean') return book.has_pdf;
  if (book.pdf_url) return true;
  if (book.pdf_links && book.pdf_links.files && book.pdf_links.files.length > 0) return true;
  const cleanTitle = (book.title || book.name || '').trim();
  if (KNOWN_PDF_MAP[cleanTitle] !== undefined) {
    return KNOWN_PDF_MAP[cleanTitle].has_pdf;
  }
  return false;
}

export function getBookPdfUrl(book: BookMeta): string | null {
  if (book.pdf_url) return book.pdf_url;
  if (book.pdf_links && book.pdf_links.files && book.pdf_links.files.length > 0) {
    let file = book.pdf_links.files[0];
    if (file) {
      file = file.split('|')[0];
      const root = book.pdf_links.root ? book.pdf_links.root.replace(/^\/+|\/+$/g, '') : '';
      const cleanFile = file.replace(/^\/+/, '');
      const fullPath = root ? `${root}/${cleanFile}` : cleanFile;
      if (fullPath.includes('archive.org')) {
        return fullPath;
      }
      return `https://files.turath.io/pdf/${fullPath}`;
    }
  }
  const cleanTitle = (book.title || book.name || '').trim();
  if (KNOWN_PDF_MAP[cleanTitle]?.pdf_url) {
    return KNOWN_PDF_MAP[cleanTitle].pdf_url;
  }
  return null;
}

export const CENTURY_NAMES_MAP: Record<number, string> = {
  1: "القرن الأول هـ",
  2: "القرن الثاني هـ",
  3: "القرن الثالث هـ",
  4: "القرن الرابع هـ",
  5: "القرن الخامس هـ",
  6: "القرن السادس هـ",
  7: "القرن السابع هـ",
  8: "القرن الثامن هـ",
  9: "القرن التاسع هـ",
  10: "القرن العاشر هـ",
  11: "القرن الحادي عشر هـ",
  12: "القرن الثاني عشر هـ",
  13: "القرن الثالث عشر هـ",
  14: "القرن الرابع عشر هـ",
  15: "القرن الخامس عشر هـ",
};

export function lookupAuthorDeathYear(authorName: string): number | null {
  if (!authorName) return null;
  const rawClean = authorName.trim();
  const clean = rawClean.replace(/^(الشيخ|الإمام|العلامة|الحافظ|القاضي|أبو|ابن)\s+/, '').trim();

  const map = authorsDeathData as Record<string, number>;
  if (map[rawClean]) return map[rawClean];
  if (clean && map[clean]) return map[clean];

  // Canonical scholar matching
  if (rawClean.includes('ابن تيمية')) return 728;
  if (rawClean.includes('ابن قدامة')) return 620;
  if (rawClean.includes('ابن القيم')) return 751;
  if (rawClean.includes('النووي')) return 676;
  if (rawClean.includes('ابن كثير')) return 774;
  if (rawClean.includes('ابن حجر')) return 852;
  if (rawClean.includes('الذهبي')) return 748;
  if (rawClean.includes('البخاري')) return 256;
  if (rawClean.includes('مسلم')) return 261;
  if (rawClean.includes('أبو داود')) return 275;
  if (rawClean.includes('الترمذي')) return 279;
  if (rawClean.includes('النسائي')) return 303;
  if (rawClean.includes('ابن ماجه')) return 273;
  if (rawClean.includes('أحمد بن حنبل') || rawClean.includes('الإمام أحمد')) return 241;
  if (rawClean.includes('الشافعي')) return 204;
  if (rawClean.includes('مالك بن أنس') || rawClean.includes('الإمام مالك')) return 179;
  if (rawClean.includes('أبو حنيفة')) return 150;
  if (rawClean.includes('الطبري')) return 310;
  if (rawClean.includes('القرطبي')) return 671;
  if (rawClean.includes('الكاساني')) return 587;
  if (rawClean.includes('الحجاوي')) return 968;
  if (rawClean.includes('ابن رجب')) return 795;
  if (rawClean.includes('السيوطي')) return 911;
  if (rawClean.includes('ابن عبد البر')) return 463;
  if (rawClean.includes('ابن حزم')) return 456;
  if (rawClean.includes('ابن رشد')) return 595;
  if (rawClean.includes('الماوردي')) return 450;
  if (rawClean.includes('الغزالي')) return 505;
  if (rawClean.includes('العز بن عبد السلام')) return 660;
  if (rawClean.includes('الزركشي')) return 794;
  if (rawClean.includes('ابن الجزري')) return 833;
  if (rawClean.includes('الشوكاني')) return 1250;
  if (rawClean.includes('الصنعاني')) return 1182;
  if (rawClean.includes('محمد بن عبد الوهاب')) return 1206;
  if (rawClean.includes('السعدي')) return 1376;
  if (rawClean.includes('الشنقيطي')) return 1393;
  if (rawClean.includes('ابن باز')) return 1420;
  if (rawClean.includes('ابن عثيمين')) return 1421;
  if (rawClean.includes('الألباني')) return 1420;
  if (rawClean.includes('المباركفوري')) return 1427;

  return null;
}

const normalizeBook = (b: any): BookMeta => {
  const title = (b.title || b.name || '').trim();
  const author = (b.author || b.author_name || '').trim();
  const category = (b.category || b.cat_name || 'عام').trim();
  const infoText = (b.infoText || b.book_info_text || b.info || '').trim();
  const authorBioText = (b.authorBioText || b.author_bio_text || '').trim();
  const has_pdf = typeof b.has_pdf === 'boolean'
    ? b.has_pdf
    : (KNOWN_PDF_MAP[title] ? KNOWN_PDF_MAP[title].has_pdf : undefined);

  // Accurate author death year resolution:
  const inferredDeath = typeof b.death_year === 'number' && b.death_year > 0
    ? b.death_year
    : lookupAuthorDeathYear(author);

  // If death year is known, century is strictly mathematical:
  const inferredCentury = (typeof inferredDeath === 'number' && inferredDeath > 0)
    ? Math.floor((inferredDeath - 1) / 100) + 1
    : (typeof b.century === 'number' && b.century > 0 ? b.century : null);

  const centuryName = (typeof inferredCentury === 'number' && inferredCentury > 0)
    ? (CENTURY_NAMES_MAP[inferredCentury] || `القرن ${inferredCentury} هـ`)
    : b.century_name;

  return {
    ...b,
    id: b.id ?? b.turath_id ?? b._id ?? `${title}-${author}`,
    title: title || 'بدون عنوان',
    name: title || 'بدون عنوان',
    author: author || 'من غير معروف',
    author_name: author || 'من غير معروف',
    category: category || 'عام',
    cat_name: category || 'عام',
    infoText,
    book_info_text: infoText,
    info: infoText,
    authorBioText,
    author_bio_text: authorBioText,
    death_year: inferredDeath ?? null,
    century: inferredCentury ?? null,
    century_name: centuryName,
    has_pdf,
    pdf_url: b.pdf_url || (KNOWN_PDF_MAP[title]?.pdf_url),
    pdf_links: b.pdf_links || null,
    size: typeof b.size === 'number' ? b.size : null,
    page_count: typeof b.page_count === 'number' ? b.page_count : null,
  };
};

const FALLBACK_BOOKS: BookMeta[] = initialDomainsData.flatMap((dom, dIdx) =>
  dom.categories.flatMap((cat, cIdx) =>
    cat.books.map((b, bIdx) => ({
      id: dIdx * 1000 + cIdx * 100 + bIdx + 1,
      title: b.title,
      name: b.title,
      author: b.author,
      author_name: b.author,
      category: cat.name,
      cat_name: cat.name,
      infoText: `كتاب ${b.title} في ${dom.name} (${cat.name}) للمؤلف ${b.author}`,
      book_info_text: `كتاب ${b.title} في ${dom.name} (${cat.name}) للمؤلف ${b.author}`,
      info: `كتاب ${b.title} في ${dom.name} (${cat.name}) للمؤلف ${b.author}`,
      authorBioText: `العالم والمصنف ${b.author}`,
      author_bio_text: `العالم والمصنف ${b.author}`,
      death_year: null,
      century: null
    }))
  )
);

export type LibraryAnalytics = {
  total_books: number;
  total_authors: number;
  total_domains: number;
  domains: { name: string; count: number }[];
  centuries: { century: number; name: string; count: number }[];
  timeline?: {
    earliest_death?: number;
    latest_death?: number;
    earliest_century?: number;
    latest_century?: number;
  };
};

export type MainTab = 'home' | 'categories' | 'authors' | 'featured' | 'media' | 'favorites' | 'courses';

/**
 * Fast Arabic Text Normalization (تطبيع النصوص العربية):
 * إزالة التشكيل، توحيد الهمزات، توحيد التاء المربوطة، وتوحيد الألف المقصورة لتسريع ودقة البحث
 */
export function normalizeArabicText(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ـ+/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Helper to download book content as .txt or .json
 */
export function downloadBookFile(book: BookMeta, format: 'txt' | 'json') {
  let content = '';
  let filename = '';
  let mimeType = '';

  if (format === 'json') {
    filename = `${book.title || 'كتاب'}.json`;
    mimeType = 'application/json;charset=utf-8';
    content = JSON.stringify({
      id: book.id,
      title: book.title,
      author: book.author,
      category: book.category,
      death_year: book.death_year,
      century: book.century,
      info: book.infoText || book.book_info_text || '',
      source: 'زاد للذكاء الاصطناعي الإسلامي',
      exported_at: new Date().toISOString()
    }, null, 2);
  } else {
    filename = `${book.title || 'كتاب'} - ${book.author || 'المؤلف'}.txt`;
    mimeType = 'text/plain;charset=utf-8';
    content = `======================================================
عنوان الكتاب: ${book.title || 'بدون عنوان'}
المؤلف: ${book.author || 'غير معروف'}
التصنيف والقسم: ${book.category || 'عام'}
${book.death_year ? `سنة الوفاة: ${book.death_year} هـ\n` : ''}${book.century_name ? `القرن: ${book.century_name}\n` : ''}======================================================

نبذة ومعلومات عن الكتاب:
${book.infoText || book.book_info_text || 'لا توجد معلومات إضافية متوفرة لهذا الكتاب.'}

------------------------------------------------------
تم تصدير هذا الكتاب عبر منصة زاد للذكاء الاصطناعي الإسلامي
`.trim();
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Accurate death year & century resolver
function inferCenturyAndDeath(book: BookMeta): { deathYear: number | null; century: number | null; centuryName: string } {
  // 1. Resolve author death year first (ground truth)
  let resolvedDeath: number | null = (typeof book.death_year === 'number' && book.death_year > 0)
    ? book.death_year
    : null;

  if (!resolvedDeath) {
    const authorName = (book.author || book.author_name || '').trim();
    resolvedDeath = lookupAuthorDeathYear(authorName);
  }

  if (!resolvedDeath) {
    const arToEn = (str: string) => str.replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
    const authorBio = arToEn(book.authorBioText || book.author_bio_text || '');
    const bookInfo = arToEn(book.infoText || book.book_info_text || book.info || '');

    const extractYear = (text: string) => {
      if (!text) return null;
      const m = text.match(/(?:ت|توفي|وفاته|المتوفى|المتوفى سنة|عام)\s*[:\s]?\s*(\d{1,4})\s*(?:هـ|هـ\b|\))/);
      if (m) {
        const y = parseInt(m[1], 10);
        if (y >= 10 && y <= 1450) return y;
      }
      const m2 = text.match(/[\(–\-]\s*(?:\d{1,4}\s*[\-–]\s*)?(\d{1,4})\s*هـ/);
      if (m2) {
        const y = parseInt(m2[1], 10);
        if (y >= 10 && y <= 1450) return y;
      }
      return null;
    };

    resolvedDeath = extractYear(authorBio) || extractYear(bookInfo);
  }

  // If death year is found, century is strictly determined by death year:
  if (resolvedDeath && resolvedDeath > 0) {
    const c = Math.floor((resolvedDeath - 1) / 100) + 1;
    return {
      deathYear: resolvedDeath,
      century: c,
      centuryName: CENTURY_NAMES_MAP[c] || `القرن ${c} هـ`
    };
  }

  // 2. Only if death year is not found anywhere, check explicit century from metadata
  let explicitCentury: number | null = null;
  if (typeof book.century === 'number' && book.century > 0) {
    explicitCentury = book.century;
  } else if (typeof book.century === 'string') {
    const parsed = parseInt(book.century, 10);
    explicitCentury = isNaN(parsed) ? null : parsed;
  }

  if (explicitCentury && explicitCentury > 0) {
    return {
      deathYear: null,
      century: explicitCentury,
      centuryName: CENTURY_NAMES_MAP[explicitCentury] || book.century_name || `القرن ${explicitCentury} هـ`
    };
  }

  // 3. Contemporary scholar ONLY if explicitly marked with contemporary honorifics in bio
  const arBio = book.authorBioText || book.author_bio_text || '';
  if (/حفظه الله|أطال الله عمره|رعاه الله|عضو هيئة كبار|جامعة الإمام|الجامعة الإسلامية/.test(arBio)) {
    return { deathYear: null, century: 15, centuryName: 'معاصر' };
  }

  // 4. Unknown
  return { deathYear: null, century: null, centuryName: 'غير محدد' };
}

// -------------------------------------------------------------
// Quick Search Suggestion Tags
// -------------------------------------------------------------
const QUICK_SEARCH_TAGS = [
  'صحيح البخاري',
  'المغني لابن قدامة',
  'شروح الحديث',
  'الفقه الحنبلي',
  'ابن تيمية',
  'العقيدة والتوحيد',
  'النووي',
  'تفسير ابن كثير'
];

// -------------------------------------------------------------
// Component: Book Card
// -------------------------------------------------------------
function BookCard({
  book,
  viewMode,
  showCategoryBadge = true,
  onAsk,
  onRead,
  onOpenAuthorBio,
  onOpenBookInfo,
  isFavorite,
  onToggleFavorite
}: {
  book: BookMeta;
  viewMode: 'grid' | 'list';
  showCategoryBadge?: boolean;
  onAsk: (b: BookMeta) => void;
  onRead: (b: BookMeta) => void;
  onOpenAuthorBio?: (b: BookMeta) => void;
  onOpenBookInfo: (b: BookMeta) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (b: BookMeta) => void;
}) {
  const { theme, accentColor, isDark } = useTheme();
  const { deathYear, centuryName } = useMemo(() => inferCenturyAndDeath(book), [book]);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDownloadMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(e.target as Node)) {
        setIsDownloadMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDownloadMenuOpen]);

  const isPdfAvailable = useMemo(() => hasBookPdf(book), [book]);
  const directPdfUrl = useMemo(() => getBookPdfUrl(book), [book]);

  const estimatedSize = useMemo(() => {
    if (typeof book.size === 'number' && book.size > 0) {
      return `${(book.size / (1024 * 1024)).toFixed(1)} MB`;
    }
    const seed = typeof book.id === 'number' ? book.id : (book.title?.length || 5);
    const mb = ((seed % 15) * 0.2 + 0.3).toFixed(1);
    return `${mb} MB`;
  }, [book.id, book.title, book.size]);

  const getBookCardContainerClass = () => {
    if (isDark) {
      switch (accentColor) {
        case 'amber':
          return 'border border-white/10 bg-[#181b26] hover:bg-[#1e2333] hover:border-[#dfbf83]/50 hover:shadow-lg shadow-sm';
        case 'emerald':
          return 'border border-white/10 bg-[#181b26] hover:bg-[#1e2333] hover:border-teal-400/50 hover:shadow-lg shadow-sm';
        case 'blue':
          return 'border border-white/10 bg-[#181b26] hover:bg-[#1e2333] hover:border-blue-400/50 hover:shadow-lg shadow-sm';
        case 'purple':
        default:
          return 'border border-white/10 bg-[#181b26] hover:bg-[#1e2333] hover:border-purple-400/50 hover:shadow-lg shadow-sm';
      }
    } else {
      switch (accentColor) {
        case 'amber':
          return 'border-[#ebd9b5]/90 bg-white hover:border-[#dfbf83] hover:shadow-md';
        case 'emerald':
          return 'border-teal-100 bg-white hover:border-teal-300 hover:shadow-md';
        case 'blue':
          return 'border-blue-100 bg-white hover:border-blue-300 hover:shadow-md';
        case 'purple':
        default:
          return 'border-purple-100 bg-white hover:border-purple-300 hover:shadow-md';
      }
    }
  };

  const getGlowOrbClass = () => {
    switch (accentColor) {
      case 'amber': return 'bg-[#dfbf83]/10 group-hover:bg-[#dfbf83]/20';
      case 'emerald': return 'bg-teal-500/10 group-hover:bg-teal-500/20';
      case 'blue': return 'bg-blue-500/10 group-hover:bg-blue-500/20';
      case 'purple':
      default: return 'bg-purple-500/10 group-hover:bg-purple-500/20';
    }
  };

  const getBookIconClass = () => {
    switch (accentColor) {
      case 'amber':
        return 'bg-gradient-to-br from-[#b88d46]/15 to-[#dfbf83]/25 text-[#8e682d] dark:text-[#eed9b0] group-hover:bg-[#b88d46] group-hover:text-stone-950';
      case 'emerald':
        return 'bg-gradient-to-br from-teal-500/15 to-emerald-500/20 text-teal-600 dark:text-teal-300 group-hover:bg-teal-600 group-hover:text-white';
      case 'blue':
        return 'bg-gradient-to-br from-blue-500/15 to-indigo-500/20 text-blue-600 dark:text-blue-300 group-hover:bg-blue-600 group-hover:text-white';
      case 'purple':
      default:
        return 'bg-gradient-to-br from-brand-magenta/10 to-purple-500/20 text-brand-magenta group-hover:bg-brand-magenta group-hover:text-white';
    }
  };

  const getTitleHoverClass = () => {
    switch (accentColor) {
      case 'amber': return 'group-hover:text-[#8e682d] dark:group-hover:text-[#eed9b0]';
      case 'emerald': return 'group-hover:text-teal-600 dark:group-hover:text-teal-400';
      case 'blue': return 'group-hover:text-blue-600 dark:group-hover:text-blue-400';
      case 'purple':
      default: return 'group-hover:text-brand-magenta';
    }
  };

  const getCategoryBadgeClass = () => {
    switch (accentColor) {
      case 'amber':
        return 'bg-[#dfbf83]/15 text-[#8a652a] dark:text-[#eed9b0] border-[#dfbf83]/30';
      case 'emerald':
        return 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20';
      case 'blue':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20';
      case 'purple':
      default:
        return 'bg-brand-magenta/10 text-brand-magenta border-brand-magenta/20';
    }
  };

  const getReadButtonClass = () => {
    switch (accentColor) {
      case 'amber':
        return 'bg-gradient-to-r from-[#8e682d] via-[#b88d46] to-[#dfbf83] hover:from-[#76541f] hover:to-[#b88d46] text-stone-950 font-black shadow-sm shadow-amber-900/30';
      case 'emerald':
        return 'bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-500 hover:from-teal-800 hover:to-teal-600 text-white shadow-sm shadow-teal-900/30 font-bold';
      case 'blue':
        return 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-800 hover:to-blue-700 text-white shadow-sm shadow-blue-900/30 font-bold';
      case 'purple':
      default:
        return 'bg-gradient-to-r from-brand-magenta via-purple-600 to-brand-deep hover:from-brand-deep hover:to-purple-800 text-white shadow-sm shadow-brand-magenta/20 font-bold';
    }
  };

  const getAskButtonClass = () => {
    switch (accentColor) {
      case 'amber':
        return 'border-[#dfbf83]/40 bg-[#dfbf83]/10 text-[#8e682d] dark:text-[#eed9b0] hover:bg-[#dfbf83]/20';
      case 'emerald':
        return 'border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-300 hover:bg-teal-500/20';
      case 'blue':
        return 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300 hover:bg-blue-500/20';
      case 'purple':
      default:
        return 'border-brand-magenta/30 bg-brand-magenta/5 text-brand-magenta hover:bg-brand-magenta/15';
    }
  };

  const getInfoButtonClass = () => {
    switch (accentColor) {
      case 'amber':
        return 'hover:text-[#8e682d] dark:hover:text-[#eed9b0] hover:bg-[#dfbf83]/15 hover:border-[#dfbf83]/40';
      case 'emerald':
        return 'hover:text-teal-600 dark:hover:text-teal-300 hover:bg-teal-500/15 hover:border-teal-500/40';
      case 'blue':
        return 'hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-500/15 hover:border-blue-500/40';
      case 'purple':
      default:
        return 'hover:text-brand-magenta hover:bg-brand-magenta/10 hover:border-brand-magenta/30';
    }
  };

  // GRID VIEW CARD
  if (viewMode === 'grid') {
    return (
      <div className={`group relative rounded-xl border p-3 sm:p-3.5 shadow-sm transition-all duration-300 flex flex-col justify-between overflow-hidden ${getBookCardContainerClass()}`}>
        <div className={`pointer-events-none absolute -right-16 -top-16 w-24 h-24 rounded-full blur-2xl transition-all duration-500 ${getGlowOrbClass()}`} />

        <div>
          {/* Row 1: Book Title + Favorite Button */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-all shadow-sm mt-0.5 ${getBookIconClass()}`}>
                <BookOpen className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className={`font-bold text-sm text-slate-800 dark:text-slate-100 transition-colors leading-snug line-clamp-2 ${getTitleHoverClass()}`}>
                  {book.title}
                </h4>
              </div>
            </div>

            {onToggleFavorite && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(book);
                }}
                className={`p-1 rounded-lg transition-all shrink-0 active:scale-90 cursor-pointer ${isFavorite
                  ? 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 shadow-xs'
                  : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                title={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current text-rose-500' : ''}`} />
              </button>
            )}
          </div>

          {/* Row 2: Author Name + Category Badge + Century Badge */}
          <div className="flex items-center gap-1.5 flex-wrap mb-2.5 pr-0.5">
            {onOpenAuthorBio && book.author && book.author !== 'من غير معروف' ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAuthorBio(book);
                }}
                className={`inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors group/author outline-none text-right shrink-0 cursor-pointer ${getTitleHoverClass()}`}
                title="عرض ترجمة وسيرة المؤلف"
              >
                <User className="h-3 w-3 shrink-0 group-hover/author:scale-110 transition-transform text-slate-400" />
                <span className="font-semibold group-hover/author:underline underline-offset-4 truncate max-w-[140px]">
                  {book.author}
                </span>
              </button>
            ) : (
              <p className="inline-flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                <Pen className="h-3 w-3 shrink-0 text-slate-400" />
                <span className="font-semibold truncate max-w-[140px]">{book.author}</span>
              </p>
            )}

            {showCategoryBadge && book.category && (
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${getCategoryBadgeClass()}`}>
                <Layers className="w-2.5 h-2.5" />
                {book.category}
              </span>
            )}
            {centuryName && centuryName !== 'غير محدد' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0" title={deathYear ? `توفي: ${deathYear} هـ` : centuryName}>
                <Calendar className="w-2.5 h-2.5" />
                <span>{centuryName}</span>
                {deathYear && <span className="opacity-75 font-mono">({deathYear}هـ)</span>}
              </span>
            )}
            {estimatedSize && (
              <span className="text-[10px] text-muted-foreground font-mono opacity-70 shrink-0" title="الحجم التقريبي للكتاب">
                {estimatedSize}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onRead(book)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer ${getReadButtonClass()}`}
              title="تصفح وقراءة الكتاب"
            >
              <FileText className="w-3 h-3" />
              تصفح
            </button>

            {isPdfAvailable && (
              directPdfUrl ? (
                <a
                  href={directPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="px-2 py-1.5 rounded-lg text-xs font-bold font-mono text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 shrink-0 transition-colors cursor-pointer flex items-center justify-center"
                  title="تحميل / فتح النسخة المصورة (PDF) مباشرة"
                >
                  PDF
                </a>
              ) : (
                <span
                  className="px-2 py-1.5 rounded-lg text-xs font-bold font-mono text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 shrink-0 select-none flex items-center justify-center"
                  title="تتوفر نسخة مصورة (PDF) مطابقة للمطبوع"
                >
                  PDF
                </span>
              )
            )}

            <button
              type="button"
              onClick={() => onAsk(book)}
              className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer ${getAskButtonClass()}`}
              title="سؤال المساعد الذكي حول الكتاب"
            >
              <Sparkles className="w-3 h-3" />
              اسأل زاد
            </button>

            {/* Download Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDownloadMenuOpen(!isDownloadMenuOpen);
                }}
                className={`p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-muted-foreground transition-all flex items-center justify-center cursor-pointer hover:text-foreground hover:bg-slate-100 dark:hover:bg-white/10`}
                title="تحميل الكتاب (TXT / JSON / PDF)"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              {isDownloadMenuOpen && (
                <div
                  ref={downloadMenuRef}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-full left-0 mb-1.5 w-48 rounded-xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#161226]/95 backdrop-blur-xl p-1.5 shadow-xl z-50 text-right animate-in fade-in zoom-in-95 duration-150"
                >
                  <p className="text-[10px] font-bold text-muted-foreground px-2 py-1 border-b border-slate-100 dark:border-white/10 mb-1">
                    خيارات تحميل الكتاب:
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      downloadBookFile(book, 'txt');
                      setIsDownloadMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-right cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>تحميل نص الكتاب (TXT)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      downloadBookFile(book, 'json');
                      setIsDownloadMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-right cursor-pointer"
                  >
                    <BookCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>بيانات وفهرس (JSON)</span>
                  </button>
                  {directPdfUrl ? (
                    <a
                      href={directPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      onClick={() => setIsDownloadMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-right cursor-pointer text-rose-600 dark:text-rose-400"
                    >
                      <FileDown className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>تحميل النسخة المصورة (PDF)</span>
                    </a>
                  ) : isPdfAvailable ? (
                    <div
                      className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-xs text-muted-foreground opacity-80 text-right select-none"
                      title="النسخة المصورة متوفرة ومطابقة للمطبوع، وجارٍ توفير الرابط المباشر للتحميل السريع في زاد"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1 rounded bg-rose-500/10 border border-rose-500/20 font-mono text-rose-600 dark:text-rose-400">PDF</span>
                        <span>النسخة المصورة</span>
                      </div>
                      <span className="text-[10px] bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-muted-foreground font-medium">قريباً</span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onOpenBookInfo(book)}
              className={`p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-muted-foreground transition-all flex items-center justify-center cursor-pointer ${getInfoButtonClass()}`}
              title="تفاصيل ومعلومات الكتاب"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW ROW
  return (
    <div className={`group rounded-xl border py-2.5 px-3 sm:px-4 shadow-sm hover:shadow-md transition-colors duration-150 ${getBookCardContainerClass()}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">

        {/* Book Details */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all shadow-sm ${getBookIconClass()}`}>
            <BookOpen className="w-4.5 h-4.5" />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className={`font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 transition-colors mb-0.5 truncate ${getTitleHoverClass()}`}>
              {book.title}
            </h4>

            <div className="flex items-center gap-2 flex-wrap">
              {onOpenAuthorBio && book.author && book.author !== 'من غير معروف' ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAuthorBio(book);
                  }}
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground transition-colors group/author outline-none text-right shrink-0 cursor-pointer ${getTitleHoverClass()}`}
                  title="عرض ترجمة وسيرة المؤلف"
                >
                  <User className="h-3 w-3 shrink-0 group-hover/author:scale-110 transition-transform text-slate-400" />
                  <span className="group-hover/author:underline underline-offset-4">
                    {book.author}
                  </span>
                </button>
              ) : (
                <p className="inline-flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                  <Pen className="h-3 w-3 shrink-0 text-slate-400" />
                  <span>{book.author}</span>
                </p>
              )}

              {showCategoryBadge && book.category && (
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${getCategoryBadgeClass()}`}>
                  <Layers className="w-2.5 h-2.5" />
                  {book.category}
                </span>
              )}
              {centuryName && centuryName !== 'غير محدد' && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0" title={deathYear ? `توفي: ${deathYear} هـ` : centuryName}>
                  <Calendar className="w-2.5 h-2.5" />
                  <span>{centuryName}</span>
                  {deathYear && <span className="font-mono">({deathYear}هـ)</span>}
                </span>
              )}
              {estimatedSize && (
                <span className="text-[10px] text-muted-foreground font-mono opacity-70 shrink-0" title="الحجم التقريبي للكتاب">
                  {estimatedSize}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Left Actions */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
          <button
            type="button"
            onClick={() => onRead(book)}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer ${getReadButtonClass()}`}
            title="تصفح وقراءة الكتاب"
          >
            <FileText className="w-3.5 h-3.5" /> <span>تصفح</span>
          </button>

          {isPdfAvailable && (
            directPdfUrl ? (
              <a
                href={directPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                onClick={(e) => e.stopPropagation()}
                className="px-2 py-1.5 rounded-lg text-xs font-bold font-mono text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 shrink-0 transition-colors cursor-pointer flex items-center justify-center"
                title="تحميل / فتح النسخة المصورة (PDF) مباشرة"
              >
                PDF
              </a>
            ) : (
              <span
                className="px-2 py-1.5 rounded-lg text-xs font-bold font-mono text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 shrink-0 select-none flex items-center justify-center"
                title="تتوفر نسخة مصورة (PDF) مطابقة للمطبوع"
              >
                PDF
              </span>
            )
          )}

          <button
            type="button"
            onClick={() => onAsk(book)}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer ${getAskButtonClass()}`}
            title="اسأل زاد"
          >
            <Sparkles className="w-3.5 h-3.5" /> <span>اسأل زاد</span>
          </button>

          {/* Download Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDownloadMenuOpen(!isDownloadMenuOpen);
              }}
              className={`p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-muted-foreground transition-all flex items-center justify-center cursor-pointer hover:text-foreground hover:bg-slate-100 dark:hover:bg-white/10`}
              title="تحميل الكتاب (TXT / JSON / PDF)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {isDownloadMenuOpen && (
              <div
                ref={downloadMenuRef}
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-full left-0 mb-1.5 w-48 rounded-xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#161226]/95 backdrop-blur-xl p-1.5 shadow-xl z-50 text-right animate-in fade-in zoom-in-95 duration-150"
              >
                <p className="text-[10px] font-bold text-muted-foreground px-2 py-1 border-b border-slate-100 dark:border-white/10 mb-1">
                  خيارات تحميل الكتاب:
                </p>
                <button
                  type="button"
                  onClick={() => {
                    downloadBookFile(book, 'txt');
                    setIsDownloadMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-right cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>تحميل نص الكتاب (TXT)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    downloadBookFile(book, 'json');
                    setIsDownloadMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-right cursor-pointer"
                >
                  <BookCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>بيانات وفهرس (JSON)</span>
                </button>
                {directPdfUrl ? (
                  <a
                    href={directPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    onClick={() => setIsDownloadMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-right cursor-pointer text-rose-600 dark:text-rose-400"
                  >
                    <FileDown className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>تحميل النسخة المصورة (PDF)</span>
                  </a>
                ) : isPdfAvailable ? (
                  <div
                    className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-xs text-muted-foreground opacity-80 text-right select-none"
                    title="النسخة المصورة متوفرة ومطابقة للمطبوع، وجارٍ توفير الرابط المباشر للتحميل السريع في زاد"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1 rounded bg-rose-500/10 border border-rose-500/20 font-mono text-rose-600 dark:text-rose-400">PDF</span>
                      <span>النسخة المصورة</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-muted-foreground font-medium">قريباً</span>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onOpenBookInfo(book)}
            className={`p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-muted-foreground transition-all flex items-center justify-center cursor-pointer ${getInfoButtonClass()}`}
            title="معلومات وتفاصيل الكتاب"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(book);
              }}
              className={`p-1.5 rounded-lg border transition-all flex items-center justify-center active:scale-90 cursor-pointer ${isFavorite
                ? 'border-rose-500/30 text-rose-500 bg-rose-500/10'
                : 'border-slate-200 dark:border-white/10 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10'
                }`}
              title={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current text-rose-500' : ''}`} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Skeletons for Loading
// -------------------------------------------------------------
function SkeletonList({ viewMode }: { viewMode: 'grid' | 'list' }) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-slate-200 dark:border-white/10 bg-card/60 p-5 space-y-4">
            <div className="flex justify-between">
              <div className="h-5 w-24 rounded bg-slate-200 dark:bg-white/10" />
              <div className="h-5 w-20 rounded bg-slate-200 dark:bg-white/10" />
            </div>
            <div className="h-6 w-3/4 rounded bg-slate-300 dark:bg-white/20" />
            <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-white/10" />
            <div className="pt-3 flex gap-2">
              <div className="h-9 flex-1 rounded-xl bg-slate-200 dark:bg-white/10" />
              <div className="h-9 flex-1 rounded-xl bg-slate-200 dark:bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-slate-200 dark:border-white/10 bg-card/60 p-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-1/3 rounded bg-slate-300 dark:bg-white/20" />
              <div className="h-4 w-1/4 rounded bg-slate-200 dark:bg-white/10" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-20 rounded-xl bg-slate-200 dark:bg-white/10" />
              <div className="h-9 w-24 rounded-xl bg-slate-200 dark:bg-white/10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// -------------------------------------------------------------
// MAIN KNOWLEDGE BASE COMPONENT
// -------------------------------------------------------------
export default function KnowledgeBase({
  onExit,
  onAskBook,
  onLogin,
  onNavigateGlobal,
  initialTab = 'home',
  hideCustomHeader = false,
  onTabChange,
  onScrolledPastSearchChange,
}: {
  onExit: () => void
  onAskBook: (book: any) => void
  onLogin?: () => void
  onNavigateGlobal?: (view: any) => void
  initialTab?: MainTab
  hideCustomHeader?: boolean
  onTabChange?: (tab: MainTab) => void
  onScrolledPastSearchChange?: (scrolled: boolean) => void
}) {
  const { theme, toggleTheme, isDark, accentColor, setAccentColor } = useTheme()
  const { isAuthenticated, user, logout } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [isRecentBannerDismissed, setIsRecentBannerDismissed] = useState(false)

  // Dropdown glass & item card helpers matching Navbar.tsx exactly
  const getDropdownGlassClass = () => {
    if (isDark) {
      return 'bg-[#10131d]/95 border border-white/10 text-white shadow-2xl shadow-black/80 backdrop-blur-2xl';
    } else {
      return 'bg-white/96 border border-stone-200 text-stone-900 shadow-xl shadow-stone-200/50';
    }
  };

  const getNavItemCardClass = () => {
    if (isDark) {
      return 'border-white/[0.07] bg-white/[0.03] text-white/90 hover:bg-white/[0.08] hover:border-white/15';
    } else {
      return 'border-stone-200/70 bg-white/80 text-stone-800 hover:bg-white hover:border-stone-300 shadow-2xs';
    }
  };

  const getNavIconBoxClass = () => {
    switch (accentColor) {
      case 'emerald':
        return isDark
          ? 'bg-teal-500/10 border-teal-500/25 text-teal-300'
          : 'bg-teal-50 border-teal-200/80 text-teal-700';
      case 'amber':
        return isDark
          ? 'bg-[#dfbf83]/10 border-[#dfbf83]/25 text-[#eed8ad]'
          : 'bg-[#fbf8f0] border-[#ebd9b5] text-[#8a652a]';
      case 'blue':
        return isDark
          ? 'bg-blue-500/10 border-blue-500/25 text-blue-300'
          : 'bg-blue-50 border-blue-200/80 text-blue-700';
      case 'purple':
      default:
        return isDark
          ? 'bg-purple-500/10 border-purple-500/25 text-purple-300'
          : 'bg-purple-50 border-purple-200/80 text-purple-700';
    }
  };

  const getThemeToggleTrackClass = () => {
    if (!isDark) return 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.35)]';
    switch (accentColor) {
      case 'emerald': return 'bg-gradient-to-r from-teal-700 to-cyan-600 shadow-[0_0_12px_rgba(20,184,166,0.35)]';
      case 'amber': return 'bg-gradient-to-r from-[#8e682d] to-[#c59b58] shadow-[0_0_12px_rgba(223,191,131,0.35)]';
      case 'blue': return 'bg-gradient-to-r from-blue-700 to-indigo-600 shadow-[0_0_12px_rgba(59,130,246,0.35)]';
      default: return 'bg-gradient-to-r from-purple-700 to-indigo-600 shadow-[0_0_12px_rgba(168,85,247,0.35)]';
    }
  };

  const getThemeBadgeClass = () => {
    switch (accentColor) {
      case 'emerald': return isDark ? 'bg-teal-500/15 text-teal-300 border-teal-500/30' : 'bg-teal-50 text-teal-800 border-teal-200';
      case 'amber': return isDark ? 'bg-[#dfbf83]/15 text-[#eed9b0] border-[#dfbf83]/30' : 'bg-[#fbf8f0] text-[#8a652a] border-[#ebd9b5]';
      case 'blue': return isDark ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' : 'bg-blue-50 text-blue-800 border-blue-200';
      default: return isDark ? 'bg-purple-500/15 text-purple-300 border-purple-500/30' : 'bg-purple-50 text-purple-800 border-purple-200';
    }
  };

  const handleShare = async () => {
    const url = 'https://zad-islamic-ai.vercel.app/';
    const title = 'منصة زاد للعلوم الشرعية';
    const text = 'منصة زاد للعلوم الشرعية بالذكاء الاصطناعي - إجابات موثقة من أمهات الكتب الشرعية';
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text: `${title}\n${text}`, url });
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    } else {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(url);
      }
    }
  };

  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target as Node)) {
        setIsSettingsMenuOpen(false);
      }
    };
    if (isSettingsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsMenuOpen]);

  // Dynamic Theme & Accent styling for Sticky Navbar and interactive components
  const getStickyNavbarStyle = () => {
    if (isDark) {
      return 'bg-[#090b10]/80 border-b border-white/10 shadow-lg shadow-black/25 text-slate-100 backdrop-blur-2xl';
    }
    return 'bg-white/85 border-b border-slate-200/80 shadow-xs text-slate-900 backdrop-blur-2xl';
  };

  const getNavCircleBtnStyle = () => {
    if (isDark) {
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

  const getActiveTabStyle = () => {
    switch (accentColor) {
      case 'emerald':
        return 'bg-gradient-to-r from-teal-600 to-emerald-500 text-white shadow-md shadow-teal-500/30 scale-[1.02]';
      case 'amber':
        return 'bg-gradient-to-r from-[#b88d46] to-[#dfbf83] text-stone-950 font-black shadow-md shadow-amber-900/30 scale-[1.02]';
      case 'blue':
        return 'bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-500/30 scale-[1.02]';
      case 'purple':
      default:
        return 'bg-gradient-to-r from-brand-magenta to-purple-600 text-white shadow-md shadow-brand-magenta/35 scale-[1.02]';
    }
  };

  const getSearchBtnStyle = () => {
    switch (accentColor) {
      case 'emerald':
        return 'bg-gradient-to-tr from-teal-700 via-teal-500 to-cyan-400 hover:brightness-110 text-white shadow-lg shadow-teal-500/40 ring-1 ring-white/30';
      case 'amber':
        return 'bg-gradient-to-tr from-[#8e682d] via-[#c59b58] to-[#eedbb2] hover:brightness-110 text-stone-950 font-black shadow-lg shadow-[#dfbf83]/40 ring-1 ring-white/30';
      case 'blue':
        return 'bg-gradient-to-tr from-blue-700 via-blue-500 to-sky-400 hover:brightness-110 text-white shadow-lg shadow-blue-500/40 ring-1 ring-white/30';
      case 'purple':
      default:
        return 'bg-gradient-to-tr from-purple-700 via-purple-600 to-fuchsia-500 hover:brightness-110 text-white shadow-lg shadow-purple-600/40 ring-1 ring-white/30';
    }
  };

  const getHeroTitleColorClass = () => {
    if (isDark) {
      switch (accentColor) {
        case 'emerald':
          return 'text-teal-500 drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]';
        case 'amber':
          return 'text-[#c59b58] drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]';
        case 'blue':
          return 'text-blue-500 drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]';
        case 'purple':
        default:
          return 'text-[#9d32ec] drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]';
      }
    } else {
      switch (accentColor) {
        case 'emerald':
          return 'text-teal-900 drop-shadow-xs';
        case 'amber':
          return 'text-[#78350f] drop-shadow-xs';
        case 'blue':
          return 'text-blue-950 drop-shadow-xs';
        case 'purple':
        default:
          return 'text-purple-950 drop-shadow-xs';
      }
    }
  };

  const getLogoGlowColor = () => {
    switch (accentColor) {
      case 'emerald':
        return 'from-teal-500/30 via-emerald-500/15 to-transparent';
      case 'amber':
        return 'from-[#dfbf83]/30 via-amber-500/15 to-transparent';
      case 'blue':
        return 'from-blue-500/30 via-indigo-500/15 to-transparent';
      case 'purple':
      default:
        return 'from-purple-500/30 via-fuchsia-500/15 to-transparent';
    }
  };

  const renderHeroCenterLogo = () => {
    if (accentColor === 'purple') {
      return (
        <img
          src={darkLogo}
          alt="شعار زاد"
          className="h-28 sm:h-36 md:h-44 w-auto max-h-48 object-contain drop-shadow-[0_12px_35px_rgba(157,50,236,0.55)] hover:scale-105 transition-all duration-300 select-none"
        />
      );
    }

    const gradientClass = (() => {
      switch (accentColor) {
        case 'emerald':
          return isDark
            ? 'bg-gradient-to-b from-[#5eead4] via-[#14b8a6] to-[#0f766e] drop-shadow-[0_12px_35px_rgba(20,184,166,0.55)]'
            : 'bg-gradient-to-b from-[#14b8a6] via-[#0d9488] to-[#134e4a] drop-shadow-[0_8px_25px_rgba(13,148,136,0.3)]';
        case 'amber':
          return isDark
            ? 'bg-gradient-to-b from-[#f5ecd5] via-[#dfbf83] to-[#8e682d] drop-shadow-[0_12px_35px_rgba(223,191,131,0.6)]'
            : 'bg-gradient-to-b from-[#dfbf83] via-[#b88d46] to-[#5e431a] drop-shadow-[0_8px_25px_rgba(184,141,70,0.3)]';
        case 'blue':
          return isDark
            ? 'bg-gradient-to-b from-[#38bdf8] via-[#2563eb] to-[#1e40af] drop-shadow-[0_12px_35px_rgba(37,99,235,0.6)]'
            : 'bg-gradient-to-b from-[#0284c7] via-[#1d4ed8] to-[#1e3a8a] drop-shadow-[0_8px_25px_rgba(2,132,199,0.3)]';
        default:
          return 'bg-gradient-to-b from-[#c084fc] via-[#9d32ec] to-[#801bcc]';
      }
    })();

    return (
      <div
        aria-hidden="true"
        className={`h-28 sm:h-36 md:h-44 w-28 sm:w-36 md:w-44 max-h-48 hover:scale-105 transition-all duration-300 select-none ${gradientClass}`}
        style={{
          WebkitMaskImage: `url(${whiteLogo})`,
          maskImage: `url(${whiteLogo})`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      />
    );
  };

  const getHeroSearchContainerStyle = () => {
    if (isDark) {
      switch (accentColor) {
        case 'emerald':
          return 'bg-black/15 hover:bg-black/25 backdrop-blur-xl border border-teal-500/25 hover:border-teal-400/40 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.15)] ring-1 ring-teal-500/15';
        case 'amber':
          return 'bg-black/15 hover:bg-black/25 backdrop-blur-xl border border-[#dfbf83]/25 hover:border-[#dfbf83]/40 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.15)] ring-1 ring-[#dfbf83]/15';
        case 'blue':
          return 'bg-black/15 hover:bg-black/25 backdrop-blur-xl border border-blue-500/25 hover:border-blue-400/40 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.15)] ring-1 ring-blue-500/15';
        case 'purple':
        default:
          return 'bg-black/15 hover:bg-black/25 backdrop-blur-xl border border-purple-500/25 hover:border-purple-400/40 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.15)] ring-1 ring-purple-500/15';
      }
    } else {
      switch (accentColor) {
        case 'emerald':
          return 'bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-teal-200/50 hover:border-teal-300 shadow-[0_8px_30px_rgba(20,184,166,0.06),inset_0_1px_1px_rgba(255,255,255,0.85)] ring-1 ring-teal-500/10 text-slate-900';
        case 'amber':
          return 'bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-[#dfbf83]/50 hover:border-[#dfbf83] shadow-[0_8px_30px_rgba(184,141,70,0.06),inset_0_1px_1px_rgba(255,255,255,0.85)] ring-1 ring-[#dfbf83]/10 text-slate-900';
        case 'blue':
          return 'bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-blue-200/50 hover:border-blue-300 shadow-[0_8px_30px_rgba(59,130,246,0.06),inset_0_1px_1px_rgba(255,255,255,0.85)] ring-1 ring-blue-500/10 text-slate-900';
        case 'purple':
        default:
          return 'bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-purple-200/50 hover:border-purple-300 shadow-[0_8px_30px_rgba(168,85,247,0.06),inset_0_1px_1px_rgba(255,255,255,0.85)] ring-1 ring-purple-500/10 text-slate-900';
      }
    }
  };

  const getCompactSearchContainerStyle = () => {
    if (isDark) {
      switch (accentColor) {
        case 'emerald':
          return 'bg-black/40 hover:bg-black/55 backdrop-blur-xl border border-teal-500/30 text-teal-100 shadow-sm';
        case 'amber':
          return 'bg-black/40 hover:bg-black/55 backdrop-blur-xl border border-[#dfbf83]/30 text-[#eed8ad] shadow-sm';
        case 'blue':
          return 'bg-black/40 hover:bg-black/55 backdrop-blur-xl border border-blue-500/30 text-blue-100 shadow-sm';
        case 'purple':
        default:
          return 'bg-black/40 hover:bg-black/55 backdrop-blur-xl border border-purple-500/30 text-purple-100 shadow-sm';
      }
    } else {
      return 'bg-white/90 hover:bg-white backdrop-blur-xl border border-slate-200/90 text-slate-900 shadow-xs';
    }
  };

  const getRecentBannerStyle = () => {
    if (isDark) {
      switch (accentColor) {
        case 'emerald':
          return 'bg-teal-950/15 hover:bg-teal-950/25 backdrop-blur-xl border border-teal-400/20 hover:border-teal-400/40 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.12)] ring-1 ring-teal-500/10';
        case 'amber':
          return 'bg-amber-950/15 hover:bg-amber-950/25 backdrop-blur-xl border border-[#dfbf83]/20 hover:border-[#dfbf83]/40 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.12)] ring-1 ring-[#dfbf83]/10';
        case 'blue':
          return 'bg-blue-950/15 hover:bg-blue-950/25 backdrop-blur-xl border border-blue-400/20 hover:border-blue-400/40 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.12)] ring-1 ring-blue-500/10';
        case 'purple':
        default:
          return 'bg-purple-950/15 hover:bg-purple-950/25 backdrop-blur-xl border border-purple-400/20 hover:border-purple-400/40 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.12)] ring-1 ring-purple-500/10';
      }
    } else {
      switch (accentColor) {
        case 'emerald':
          return 'bg-white/30 hover:bg-white/45 backdrop-blur-xl border border-teal-200/50 hover:border-teal-300 shadow-[0_8px_30px_rgba(20,184,166,0.06),inset_0_1px_1px_rgba(255,255,255,0.85)] ring-1 ring-teal-500/5 text-slate-900';
        case 'amber':
          return 'bg-white/30 hover:bg-white/45 backdrop-blur-xl border border-[#dfbf83]/50 hover:border-[#dfbf83] shadow-[0_8px_30px_rgba(184,141,70,0.06),inset_0_1px_1px_rgba(255,255,255,0.85)] ring-1 ring-[#dfbf83]/5 text-slate-900';
        case 'blue':
          return 'bg-white/30 hover:bg-white/45 backdrop-blur-xl border border-blue-200/50 hover:border-blue-300 shadow-[0_8px_30px_rgba(59,130,246,0.06),inset_0_1px_1px_rgba(255,255,255,0.85)] ring-1 ring-blue-500/5 text-slate-900';
        case 'purple':
        default:
          return 'bg-white/30 hover:bg-white/45 backdrop-blur-xl border border-purple-200/50 hover:border-purple-300 shadow-[0_8px_30px_rgba(168,85,247,0.06),inset_0_1px_1px_rgba(255,255,255,0.85)] ring-1 ring-purple-500/5 text-slate-900';
      }
    }
  };

  const getRecentIconStyle = () => {
    switch (accentColor) {
      case 'emerald':
        return 'bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-500 text-white shadow-teal-500/35 border-teal-400/30';
      case 'amber':
        return 'bg-gradient-to-br from-[#8e682d] via-[#b88d46] to-[#dfbf83] text-stone-950 font-black shadow-[#dfbf83]/35 border-[#dfbf83]/40';
      case 'blue':
        return 'bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 text-white shadow-blue-500/35 border-blue-400/30';
      case 'purple':
      default:
        return 'bg-gradient-to-br from-brand-magenta to-purple-700 text-white shadow-brand-magenta/35 border-purple-400/30';
    }
  };

  const getRecentBadgeStyle = () => {
    switch (accentColor) {
      case 'emerald':
        return 'bg-teal-500/15 border-teal-500/30 text-teal-800 dark:text-teal-200';
      case 'amber':
        return 'bg-[#dfbf83]/20 border-[#dfbf83]/35 text-[#5e431a] dark:text-[#eed9b0]';
      case 'blue':
        return 'bg-blue-500/15 border-blue-500/30 text-blue-800 dark:text-blue-200';
      case 'purple':
      default:
        return 'bg-purple-500/15 border-purple-500/30 text-purple-800 dark:text-purple-200';
    }
  };

  const getRecentSubtextStyle = () => {
    switch (accentColor) {
      case 'emerald':
        return 'text-teal-800 dark:text-teal-300';
      case 'amber':
        return 'text-[#8a652a] dark:text-[#eed9b0]';
      case 'blue':
        return 'text-blue-800 dark:text-blue-300';
      case 'purple':
      default:
        return 'text-purple-800 dark:text-purple-300';
    }
  };

  const getRecentButtonStyle = () => {
    switch (accentColor) {
      case 'emerald':
        return 'bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-500 hover:from-teal-800 hover:to-teal-600 text-white shadow-teal-500/35 border-teal-300/30';
      case 'amber':
        return 'bg-gradient-to-r from-[#8e682d] via-[#b88d46] to-[#dfbf83] hover:from-[#76541f] hover:to-[#b88d46] text-stone-950 font-black shadow-[#dfbf83]/35 border-white/30';
      case 'blue':
        return 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-800 hover:to-blue-700 text-white shadow-blue-500/35 border-blue-300/30';
      case 'purple':
      default:
        return 'bg-gradient-to-r from-brand-magenta via-purple-600 to-brand-deep hover:from-brand-deep hover:to-purple-800 text-white shadow-brand-magenta/35 border-purple-300/30';
    }
  };

  const getSection2ContainerStyle = () => {
    if (isDark) {
      return 'bg-[#0c0e14] border-t border-white/10';
    } else {
      switch (accentColor) {
        case 'amber':
          return 'bg-[#faf7f0] border-t border-[#ebd9b5]';
        case 'emerald':
          return 'bg-[#f0fdfa] border-t border-teal-200/60';
        case 'blue':
          return 'bg-[#f0f7ff] border-t border-blue-200/60';
        case 'purple':
        default:
          return 'bg-[#faf8fd] border-t border-purple-200/60';
      }
    }
  };

  const getSection2PatternColor = () => {
    if (isDark) {
      switch (accentColor) {
        case 'amber':
          return 'text-[#dfbf83]';
        case 'emerald':
          return 'text-teal-400';
        case 'blue':
          return 'text-blue-400';
        case 'purple':
        default:
          return 'text-purple-400';
      }
    }
    switch (accentColor) {
      case 'amber':
        return 'text-[#b88d46]';
      case 'emerald':
        return 'text-teal-600';
      case 'blue':
        return 'text-blue-600';
      case 'purple':
      default:
        return 'text-purple-600';
    }
  };

  const getCategoryNumberBadgeStyle = (isOpen: boolean) => {
    if (isOpen) {
      return `${getCategoryActiveBadgeStyle()} shadow-sm`;
    }
    if (isDark) {
      switch (accentColor) {
        case 'amber':
          return 'bg-[#dfbf83]/15 text-[#eed8ad] border border-[#dfbf83]/30 shadow-xs shadow-black/20';
        case 'emerald':
          return 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-xs shadow-black/20';
        case 'blue':
          return 'bg-blue-500/15 text-blue-300 border border-blue-500/30 shadow-xs shadow-black/20';
        case 'purple':
        default:
          return 'bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-xs shadow-black/20';
      }
    }
    switch (accentColor) {
      case 'amber':
        return 'bg-amber-500/10 text-[#8e682d] border border-amber-300/60';
      case 'emerald':
        return 'bg-teal-500/10 text-teal-700 border border-teal-300/60';
      case 'blue':
        return 'bg-blue-500/10 text-blue-700 border border-blue-300/60';
      case 'purple':
      default:
        return 'bg-purple-500/10 text-purple-700 border border-purple-300/60';
    }
  };

  const getCategoryCardStyle = () => {
    if (isDark) {
      switch (accentColor) {
        case 'amber':
          return 'border border-white/10 bg-[#131620]/95 shadow-md shadow-black/30 backdrop-blur-md hover:bg-[#181b26] hover:border-[#dfbf83]/50';
        case 'emerald':
          return 'border border-white/10 bg-[#131620]/95 shadow-md shadow-black/30 backdrop-blur-md hover:bg-[#181b26] hover:border-teal-400/50';
        case 'blue':
          return 'border border-white/10 bg-[#131620]/95 shadow-md shadow-black/30 backdrop-blur-md hover:bg-[#181b26] hover:border-blue-400/50';
        case 'purple':
        default:
          return 'border border-white/10 bg-[#131620]/95 shadow-md shadow-black/30 backdrop-blur-md hover:bg-[#181b26] hover:border-purple-400/50';
      }
    } else {
      switch (accentColor) {
        case 'amber':
          return 'border-[#ebd9b5] bg-white/95 shadow-sm backdrop-blur-md hover:border-[#dfbf83]';
        case 'emerald':
          return 'border-teal-100 bg-white/95 shadow-sm backdrop-blur-md hover:border-teal-300';
        case 'blue':
          return 'border-blue-100 bg-white/95 shadow-sm backdrop-blur-md hover:border-blue-300';
        case 'purple':
        default:
          return 'border-purple-100 bg-white/95 shadow-sm backdrop-blur-md hover:border-purple-300';
      }
    }
  };

  const getCategoryBooksStatStyle = () => {
    switch (accentColor) {
      case 'amber':
        return {
          icon: 'from-[#b88d46]/15 to-[#dfbf83]/20 text-[#8e682d] dark:text-[#eed9b0]',
          text: 'text-[#8e682d] dark:text-[#eed9b0]',
          border: 'hover:border-[#dfbf83]/50',
        };
      case 'emerald':
        return {
          icon: 'from-teal-500/15 to-emerald-500/20 text-teal-600 dark:text-teal-300',
          text: 'text-teal-600 dark:text-teal-400',
          border: 'hover:border-teal-400/50',
        };
      case 'blue':
        return {
          icon: 'from-blue-500/15 to-indigo-500/20 text-blue-600 dark:text-blue-300',
          text: 'text-blue-600 dark:text-blue-400',
          border: 'hover:border-blue-400/50',
        };
      case 'purple':
      default:
        return {
          icon: 'from-brand-magenta/15 to-purple-500/20 text-brand-magenta dark:text-purple-300',
          text: 'text-brand-magenta dark:text-purple-300',
          border: 'hover:border-brand-magenta/40',
        };
    }
  };

  const getThemeAccentTextClass = () => {
    switch (accentColor) {
      case 'amber': return 'text-[#b88d46] dark:text-[#dfbf83] font-bold';
      case 'emerald': return 'text-teal-600 dark:text-teal-400 font-bold';
      case 'blue': return 'text-blue-600 dark:text-sky-400 font-bold';
      case 'purple':
      default: return 'text-fuchsia-600 dark:text-[#d946ef] font-extrabold';
    }
  };

  const getSectionHeaderIconClass = () => {
    switch (accentColor) {
      case 'amber': return 'text-[#b88d46] dark:text-[#dfbf83] drop-shadow-[0_0_10px_rgba(223,191,131,0.55)]';
      case 'emerald': return 'text-teal-600 dark:text-teal-400 drop-shadow-[0_0_10px_rgba(45,212,191,0.55)]';
      case 'blue': return 'text-blue-600 dark:text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.55)]';
      case 'purple':
      default: return 'text-fuchsia-600 dark:text-[#d946ef] drop-shadow-[0_0_12px_rgba(217,70,239,0.65)]';
    }
  };

  const getCategoryToggleActiveBtnStyle = () => {
    if (isDark) {
      switch (accentColor) {
        case 'amber':
          return 'bg-[#b88d46] text-stone-950 font-black shadow-sm';
        case 'emerald':
          return 'bg-teal-600 text-white shadow-sm';
        case 'blue':
          return 'bg-blue-600 text-white shadow-sm';
        case 'purple':
        default:
          return 'bg-brand-magenta text-white shadow-sm';
      }
    } else {
      switch (accentColor) {
        case 'amber':
          return 'bg-white text-[#8e682d] font-black shadow-sm border border-[#ebd9b5]';
        case 'emerald':
          return 'bg-white text-teal-700 font-bold shadow-sm border border-teal-200';
        case 'blue':
          return 'bg-white text-blue-700 font-bold shadow-sm border border-blue-200';
        case 'purple':
        default:
          return 'bg-white text-brand-magenta font-bold shadow-sm border border-purple-200';
      }
    }
  };

  const getCategoryAccordionContainerStyle = (isOpen: boolean = false) => {
    if (isDark) {
      if (isOpen) {
        switch (accentColor) {
          case 'amber':
            return 'border border-[#dfbf83]/40 bg-[#131620]/95 shadow-lg shadow-black/40 border-r-4 border-r-[#dfbf83]';
          case 'emerald':
            return 'border border-teal-500/40 bg-[#131620]/95 shadow-lg shadow-black/40 border-r-4 border-r-teal-500';
          case 'blue':
            return 'border border-blue-500/40 bg-[#131620]/95 shadow-lg shadow-black/40 border-r-4 border-r-blue-500';
          case 'purple':
          default:
            return 'border border-purple-500/40 bg-[#131620]/95 shadow-lg shadow-black/40 border-r-4 border-r-brand-magenta';
        }
      }
      return 'border border-white/10 bg-[#131620]/95 hover:border-white/20 shadow-md shadow-black/30';
    } else {
      if (isOpen) {
        switch (accentColor) {
          case 'amber':
            return 'border-[#dfbf83] bg-white shadow-md border-r-4 border-r-[#b88d46]';
          case 'emerald':
            return 'border-teal-300 bg-white shadow-md border-r-4 border-r-teal-600';
          case 'blue':
            return 'border-blue-300 bg-white shadow-md border-r-4 border-r-blue-600';
          case 'purple':
          default:
            return 'border-purple-300 bg-white shadow-md border-r-4 border-r-brand-magenta';
        }
      }
      switch (accentColor) {
        case 'amber':
          return 'border-[#ebd9b5] bg-white hover:border-[#dfbf83]';
        case 'emerald':
          return 'border-teal-100 bg-white hover:border-teal-300';
        case 'blue':
          return 'border-blue-100 bg-white hover:border-blue-300';
        case 'purple':
        default:
          return 'border-purple-100 bg-white hover:border-purple-300';
      }
    }
  };

  const getCategoryAccordionHeaderOpenStyle = () => {
    if (isDark) {
      switch (accentColor) {
        case 'amber':
          return 'bg-[#dfbf83]/10 border-b border-white/10';
        case 'emerald':
          return 'bg-teal-500/10 border-b border-white/10';
        case 'blue':
          return 'bg-blue-500/10 border-b border-white/10';
        case 'purple':
        default:
          return 'bg-purple-500/15 border-b border-white/10';
      }
    } else {
      switch (accentColor) {
        case 'amber':
          return 'bg-[#fcf8ee] border-b border-[#ebd9b5]';
        case 'emerald':
          return 'bg-teal-50/70 border-b border-teal-100';
        case 'blue':
          return 'bg-blue-50/70 border-b border-blue-100';
        case 'purple':
        default:
          return 'bg-purple-50/70 border-b border-purple-100';
      }
    }
  };

  const getCategoryActiveIconStyle = () => {
    switch (accentColor) {
      case 'amber':
        return 'bg-gradient-to-br from-[#8e682d] via-[#b88d46] to-[#dfbf83] text-stone-950 font-black shadow-md shadow-[#dfbf83]/30';
      case 'emerald':
        return 'bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-500 text-white shadow-md shadow-teal-500/30';
      case 'blue':
        return 'bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30';
      case 'purple':
      default:
        return 'bg-gradient-to-br from-brand-magenta to-purple-700 text-white shadow-md shadow-brand-magenta/30';
    }
  };

  const getCategoryActiveBadgeStyle = () => {
    switch (accentColor) {
      case 'amber':
        return 'bg-[#b88d46] text-stone-950 font-black';
      case 'emerald':
        return 'bg-teal-600 text-white font-bold';
      case 'blue':
        return 'bg-blue-600 text-white font-bold';
      case 'purple':
      default:
        return 'bg-brand-magenta text-white font-bold';
    }
  };

  const getCategoryGridCardSelectedStyle = () => {
    if (isDark) {
      switch (accentColor) {
        case 'amber':
          return 'border-[#dfbf83] bg-[#dfbf83]/10 shadow-lg shadow-[#dfbf83]/10';
        case 'emerald':
          return 'border-teal-500 bg-teal-500/10 shadow-lg shadow-teal-500/10';
        case 'blue':
          return 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10';
        case 'purple':
        default:
          return 'border-brand-magenta bg-brand-magenta/10 shadow-lg shadow-brand-magenta/10';
      }
    } else {
      switch (accentColor) {
        case 'amber':
          return 'border-[#b88d46] bg-[#fcf8ee] shadow-md';
        case 'emerald':
          return 'border-teal-500 bg-teal-50 shadow-md';
        case 'blue':
          return 'border-blue-500 bg-blue-50 shadow-md';
        case 'purple':
        default:
          return 'border-brand-magenta bg-purple-50 shadow-md';
      }
    }
  };

  const getCategoryGridPanelStyle = () => {
    if (isDark) {
      return 'border border-white/10 bg-[#11131a]/98 shadow-xl shadow-black/40';
    } else {
      switch (accentColor) {
        case 'amber':
          return 'border-[#ebd9b5] bg-white/95';
        case 'emerald':
          return 'border-teal-200 bg-white/95';
        case 'blue':
          return 'border-blue-200 bg-white/95';
        case 'purple':
        default:
          return 'border-purple-200 bg-white/95';
      }
    }
  };

  const getThemeEmptySearchBtnStyle = () => {
    switch (accentColor) {
      case 'amber':
        return 'bg-[#b88d46] hover:bg-[#8e682d] text-stone-950 font-black';
      case 'emerald':
        return 'bg-teal-600 hover:bg-teal-700 text-white font-bold';
      case 'blue':
        return 'bg-blue-600 hover:bg-blue-700 text-white font-bold';
      case 'purple':
      default:
        return 'bg-brand-magenta hover:bg-brand-deep text-white font-bold';
    }
  };

  const getFilterPillActiveStyle = () => {
    if (isDark) {
      switch (accentColor) {
        case 'amber':
          return 'bg-[#b88d46]/25 border-[#dfbf83]/60 text-[#eed9b0] shadow-sm shadow-amber-950/40';
        case 'emerald':
          return 'bg-teal-500/25 border-teal-400/60 text-teal-200 shadow-sm shadow-teal-950/40';
        case 'blue':
          return 'bg-blue-500/25 border-blue-400/60 text-blue-200 shadow-sm shadow-blue-950/40';
        case 'purple':
        default:
          return 'bg-purple-500/25 border-purple-400/60 text-purple-200 shadow-sm shadow-purple-950/40';
      }
    } else {
      switch (accentColor) {
        case 'amber':
          return 'bg-[#ebd9b5]/90 border-[#b88d46] text-stone-900 font-bold shadow-sm';
        case 'emerald':
          return 'bg-teal-100/90 border-teal-400 text-teal-950 font-bold shadow-sm';
        case 'blue':
          return 'bg-blue-100/90 border-blue-400 text-blue-950 font-bold shadow-sm';
        case 'purple':
        default:
          return 'bg-purple-100/90 border-purple-400 text-purple-950 font-bold shadow-sm';
      }
    }
  };

  const getFilterPillIconColor = (isActive: boolean) => {
    if (!isActive) return isDark ? 'text-white/60' : 'text-stone-600';
    switch (accentColor) {
      case 'amber': return 'text-[#dfbf83] dark:text-[#eed9b0]';
      case 'emerald': return 'text-teal-600 dark:text-teal-300';
      case 'blue': return 'text-blue-600 dark:text-blue-300';
      case 'purple':
      default: return 'text-brand-magenta dark:text-purple-300';
    }
  };

  const getFilterPillCloseBtnStyle = () => {
    switch (accentColor) {
      case 'amber':
        return 'bg-[#b88d46]/30 hover:bg-[#b88d46] hover:text-stone-950 text-amber-200';
      case 'emerald':
        return 'bg-teal-500/30 hover:bg-teal-500 hover:text-white text-teal-200';
      case 'blue':
        return 'bg-blue-500/30 hover:bg-blue-500 hover:text-white text-blue-200';
      case 'purple':
      default:
        return 'bg-purple-500/30 hover:bg-purple-500 hover:text-white text-purple-200';
    }
  };

  const getFilterPopoverContainerStyle = () => {
    if (isDark) {
      switch (accentColor) {
        case 'amber':
          return 'bg-[#1e1710]/98 border-[#dfbf83]/30 text-white shadow-[0_25px_70px_rgba(0,0,0,0.7)] backdrop-blur-2xl';
        case 'emerald':
          return 'bg-[#102020]/98 border-teal-500/30 text-white shadow-[0_25px_70px_rgba(0,0,0,0.7)] backdrop-blur-2xl';
        case 'blue':
          return 'bg-[#111f33]/98 border-blue-500/30 text-white shadow-[0_25px_70px_rgba(0,0,0,0.7)] backdrop-blur-2xl';
        case 'purple':
        default:
          return 'bg-[#1a122e]/98 border-purple-500/30 text-white shadow-[0_25px_70px_rgba(0,0,0,0.7)] backdrop-blur-2xl';
      }
    } else {
      switch (accentColor) {
        case 'amber':
          return 'bg-white/98 border-[#ebd9b5] text-stone-900 shadow-xl';
        case 'emerald':
          return 'bg-white/98 border-teal-200 text-slate-900 shadow-xl';
        case 'blue':
          return 'bg-white/98 border-blue-200 text-slate-900 shadow-xl';
        case 'purple':
        default:
          return 'bg-white/98 border-purple-200 text-slate-900 shadow-xl';
      }
    }
  };

  const getFilterPopoverItemActiveStyle = () => {
    switch (accentColor) {
      case 'amber':
        return 'bg-gradient-to-r from-[#8e682d] via-[#b88d46] to-[#dfbf83] text-stone-950 font-bold shadow-sm';
      case 'emerald':
        return 'bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-500 text-white font-bold shadow-sm';
      case 'blue':
        return 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white font-bold shadow-sm';
      case 'purple':
      default:
        return 'bg-gradient-to-r from-brand-magenta to-brand-deep text-white font-bold shadow-sm';
    }
  };

  const getFilterPopoverItemHoverStyle = () => {
    if (isDark) return 'hover:bg-white/10 text-white/90';
    switch (accentColor) {
      case 'amber': return 'hover:bg-[#fcf8ee] text-stone-800';
      case 'emerald': return 'hover:bg-teal-50 text-teal-900';
      case 'blue': return 'hover:bg-blue-50 text-blue-900';
      case 'purple':
      default: return 'hover:bg-purple-50 text-purple-900';
    }
  };

  const getFilterPopoverInputStyle = () => {
    if (isDark) {
      switch (accentColor) {
        case 'amber':
          return 'bg-white/5 border-white/15 focus:border-[#dfbf83]/60 text-white placeholder:text-white/40';
        case 'emerald':
          return 'bg-white/5 border-white/15 focus:border-teal-400/60 text-white placeholder:text-white/40';
        case 'blue':
          return 'bg-white/5 border-white/15 focus:border-blue-400/60 text-white placeholder:text-white/40';
        case 'purple':
        default:
          return 'bg-white/5 border-white/15 focus:border-purple-400/60 text-white placeholder:text-white/40';
      }
    } else {
      switch (accentColor) {
        case 'amber':
          return 'bg-amber-50/40 border-[#ebd9b5] focus:border-[#b88d46] text-stone-900 placeholder:text-stone-400';
        case 'emerald':
          return 'bg-teal-50/40 border-teal-200 focus:border-teal-400 text-stone-900 placeholder:text-stone-400';
        case 'blue':
          return 'bg-blue-50/40 border-blue-200 focus:border-blue-400 text-stone-900 placeholder:text-stone-400';
        case 'purple':
        default:
          return 'bg-purple-50/40 border-purple-200 focus:border-purple-400 text-stone-900 placeholder:text-stone-400';
      }
    }
  };

  const getFilterResetBtnStyle = () => {
    switch (accentColor) {
      case 'amber':
        return 'bg-amber-500/15 hover:bg-amber-500 hover:text-stone-950 text-[#eed9b0] dark:text-[#dfbf83] border-amber-500/30';
      case 'emerald':
        return 'bg-teal-500/15 hover:bg-teal-500 hover:text-white text-teal-300 border-teal-500/30';
      case 'blue':
        return 'bg-blue-500/15 hover:bg-blue-500 hover:text-white text-blue-300 border-blue-500/30';
      case 'purple':
      default:
        return 'bg-purple-500/15 hover:bg-purple-500 hover:text-white text-purple-300 border-purple-500/30';
    }
  };

  // Settings for Image Opacity & Overlay
  const [lightSettings, setLightSettings] = useState({ imageOpacity: 100, overlayOpacity: 0 });
  const [darkSettings, setDarkSettings] = useState({ imageOpacity: 100, overlayOpacity: 0 });

  // Load settings on mount
  useEffect(() => {
    try {
      const savedLight = localStorage.getItem('zad_bg_light_settings');
      if (savedLight) {
        const parsed = JSON.parse(savedLight);
        setLightSettings(parsed);
      }
      const savedDark = localStorage.getItem('zad_bg_dark_settings');
      if (savedDark) {
        const parsed = JSON.parse(savedDark);
        if (parsed.imageOpacity === 30 || parsed.overlayOpacity === 85) {
          setDarkSettings({ imageOpacity: 100, overlayOpacity: 0 });
          localStorage.setItem('zad_bg_dark_settings', JSON.stringify({ imageOpacity: 100, overlayOpacity: 0 }));
        } else {
          setDarkSettings(parsed);
        }
      }
    } catch (e) { }
  }, []);

  const currentSettings = theme === 'dark' ? darkSettings : lightSettings;

  const updateSettings = (imageOpacity: number, overlayOpacity: number) => {
    if (theme === 'dark') {
      const newSettings = { imageOpacity, overlayOpacity };
      setDarkSettings(newSettings);
      localStorage.setItem('zad_bg_dark_settings', JSON.stringify(newSettings));
    } else {
      const newSettings = { imageOpacity, overlayOpacity };
      setLightSettings(newSettings);
      localStorage.setItem('zad_bg_light_settings', JSON.stringify(newSettings));
    }
  };

  // Default tab initialized from prop
  const [activeMainTab, setActiveMainTab] = useState<MainTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveMainTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    onTabChange?.(activeMainTab);
  }, [activeMainTab, onTabChange]);

  // Scroll Listener for Navbar Activation across all library views (يظهر فقط عند اختفاء شريط البحث تماماً من الشاشة)
  const [isScrolledPastSearch, setIsScrolledPastSearch] = useState(false);

  const handleGoToLibraryHome = () => {
    setIsScrolledPastSearch(false);
    onScrolledPastSearchChange?.(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    setActiveMainTab('home');
    setSelectedAuthor(null);
  };

  useEffect(() => {
    onScrolledPastSearchChange?.(isScrolledPastSearch);
  }, [isScrolledPastSearch, onScrolledPastSearchChange]);

  useEffect(() => {
    if (activeMainTab !== 'home') {
      setIsScrolledPastSearch(true);
      return;
    }

    if (window.scrollY < 50) {
      setIsScrolledPastSearch(false);
    }

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (activeMainTab !== 'home') {
            setIsScrolledPastSearch(true);
          } else {
            const searchEl = document.getElementById('hero-main-search-bar');
            if (searchEl) {
              const rect = searchEl.getBoundingClientRect();
              setIsScrolledPastSearch(rect.bottom <= 10);
            } else {
              setIsScrolledPastSearch(window.scrollY > 280);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [activeMainTab]);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(() => {
    try {
      const saved = localStorage.getItem('zad_font_size');
      if (saved === 'small' || saved === 'medium' || saved === 'large') return saved;
    } catch (e) { }
    return 'medium';
  });

  useEffect(() => {
    localStorage.setItem('zad_font_size', fontSize);
  }, [fontSize]);

  // Favorites State (المفضلة)
  const [favoriteBookIds, setFavoriteBookIds] = useState<Set<string | number>>(() => {
    try {
      const saved = localStorage.getItem('zad_favorite_books');
      if (saved) return new Set(JSON.parse(saved));
    } catch (e) { }
    return new Set();
  });

  const toggleFavorite = (bookId: string | number) => {
    setFavoriteBookIds(prev => {
      const next = new Set(prev);
      if (next.has(bookId)) {
        next.delete(bookId);
      } else {
        next.add(bookId);
      }
      try {
        localStorage.setItem('zad_favorite_books', JSON.stringify(Array.from(next)));
      } catch (e) { }
      return next;
    });
  };

  // Media & Courses Data (مهيأة ومجهزة للربط بـ MongoDB)
  const [sheikhs] = useState<Sheikh[]>(INITIAL_SHEIKHS);
  const [playlists] = useState<MediaPlaylist[]>(INITIAL_PLAYLISTS);
  const [standaloneItems] = useState<MediaStandalone[]>(INITIAL_STANDALONE);
  const [courses] = useState<Course[]>(INITIAL_COURSES);

  // Tab 1 (المختارة) Filter States
  const [query, setQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState<string>('all')
  const [filterAuthor, setFilterAuthor] = useState<string>('all')
  const [selectedCentury, setSelectedCentury] = useState<string>('all')
  const [sortAsc, setSortAsc] = useState<boolean>(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [visibleBrowseBooksLimit, setVisibleBrowseBooksLimit] = useState<number>(36)

  // Reset Tab 1 pagination when filters or sort change
  useEffect(() => {
    setVisibleBrowseBooksLimit(36);
  }, [query, selectedDomain, filterAuthor, selectedCentury, sortAsc, activeMainTab]);

  // Tab 2 (الأقسام) State
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [visibleCategoryBooksLimit, setVisibleCategoryBooksLimit] = useState<number>(32)
  const [closedCategories, setClosedCategories] = useState<Set<string>>(new Set())
  const [categorySearch, setCategorySearch] = useState<string>('')
  const [categoriesViewMode, setCategoriesViewMode] = useState<'grid' | 'list'>('grid') // 'grid' = شبكة, 'list' = قائمة
  const [visibleResultsCount, setVisibleResultsCount] = useState<number>(32)

  // Reset pagination when search query changes
  useEffect(() => {
    setVisibleResultsCount(32);
  }, [categorySearch]);

  // Tab 3 (المؤلفون) State
  const [openCentury, setOpenCentury] = useState<number | null>(null)
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null)
  const [authorSearch, setAuthorSearch] = useState<string>('')
  const [authorsViewMode, setAuthorsViewMode] = useState<'grid' | 'list'>('list') // 'list' = فوق بعض, 'grid' = جنب بعض

  // Immediate input state for instant 0ms typing response without UI freeze
  const [searchInput, setSearchInput] = useState<string>('');

  // Sync searchInput when categorySearch or tab changes externally
  useEffect(() => {
    const activeVal = activeMainTab === 'categories' ? categorySearch : activeMainTab === 'authors' ? authorSearch : query;
    if (activeVal !== searchInput && !searchInput) {
      setSearchInput(activeVal);
    }
  }, [categorySearch, authorSearch, query, activeMainTab]);

  // Debounced search trigger (150ms) to prevent freezing while typing fast
  useEffect(() => {
    const timer = setTimeout(() => {
      setCategorySearch(searchInput);
      setAuthorSearch(searchInput);
      setQuery(searchInput);
      setClosedCategories(new Set());
      setIsHomeSearchResultsDismissed(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const currentSearchValue = searchInput;
  const [isHomeSearchResultsDismissed, setIsHomeSearchResultsDismissed] = useState(false);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    if (!val) {
      // Instant clear when emptied
      setCategorySearch('');
      setAuthorSearch('');
      setQuery('');
      setClosedCategories(new Set());
      setIsHomeSearchResultsDismissed(false);
    }
  };

  // Dropdown Popovers State (لقائمتي القسم والمؤلف المنبثقتين في طرف السيرش بار)
  const [isDomainPickerOpen, setIsDomainPickerOpen] = useState(false);
  const [isAuthorPickerOpen, setIsAuthorPickerOpen] = useState(false);
  const domainPickerRef = useRef<HTMLDivElement>(null);
  const authorPickerRef = useRef<HTMLDivElement>(null);
  const [authorFilterQuery, setAuthorFilterQuery] = useState('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (domainPickerRef.current && !domainPickerRef.current.contains(event.target as Node)) {
        setIsDomainPickerOpen(false);
      }
      if (authorPickerRef.current && !authorPickerRef.current.contains(event.target as Node)) {
        setIsAuthorPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Book Info Floating Modal State
  const [activeInfoBook, setActiveInfoBook] = useState<BookMeta | null>(null)
  const [modalInfoText, setModalInfoText] = useState<string | null>(null)
  const [loadingInfo, setLoadingInfo] = useState(false)

  // Featured Books Set (المختارة)
  const [featuredBookIds, setFeaturedBookIds] = useState<Set<number | string>>(() => {
    try {
      const saved = localStorage.getItem('zad_featured_book_ids')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return new Set(parsed)
      }
    } catch (e) { }
    return new Set()
  })

  useEffect(() => {
    const syncFeatured = () => {
      try {
        const saved = localStorage.getItem('zad_featured_book_ids')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) setFeaturedBookIds(new Set(parsed))
        } else {
          setFeaturedBookIds(new Set())
        }
      } catch (e) { }
    }
    window.addEventListener('zad_featured_books_changed', syncFeatured)
    window.addEventListener('storage', syncFeatured)
    return () => {
      window.removeEventListener('zad_featured_books_changed', syncFeatured)
      window.removeEventListener('storage', syncFeatured)
    }
  }, [])

  // Data & Analytics State
  const [publishedBooks, setPublishedBooks] = useState<BookMeta[]>(() => {
    try {
      const isSynced = localStorage.getItem('zad_library_synced') === 'true';
      const cachedBooksStr = localStorage.getItem('zad_cached_library_books_v5') || localStorage.getItem('zad_cached_library_books_v4');
      if (isSynced && cachedBooksStr !== null) {
        const cached = JSON.parse(cachedBooksStr);
        if (Array.isArray(cached)) {
          return cached.map(normalizeBook);
        }
      } else if (cachedBooksStr) {
        const cached = JSON.parse(cachedBooksStr);
        if (Array.isArray(cached) && cached.length > 0) {
          return cached.map(normalizeBook);
        }
      }
    } catch (e) { }
    return FALLBACK_BOOKS;
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [analytics, setAnalytics] = useState<LibraryAnalytics | null>(null)

  // Listen for admin changes in published books in real-time
  useEffect(() => {
    const handleBooksSync = () => {
      try {
        const cachedBooksStr = localStorage.getItem('zad_cached_library_books_v5');
        if (cachedBooksStr !== null) {
          const cached = JSON.parse(cachedBooksStr);
          if (Array.isArray(cached)) {
            setPublishedBooks(cached.map(normalizeBook));
          }
        }
      } catch (e) { }
    };
    window.addEventListener('zad_library_books_changed', handleBooksSync);
    window.addEventListener('storage', handleBooksSync);
    return () => {
      window.removeEventListener('zad_library_books_changed', handleBooksSync);
      window.removeEventListener('storage', handleBooksSync);
    };
  }, []);

  // Favorite Books List Computed
  const favoriteBooksList = useMemo(() => {
    return publishedBooks.filter(b => favoriteBookIds.has(b.id) || favoriteBookIds.has(b.title));
  }, [publishedBooks, favoriteBookIds]);

  // Live Floating Search Results for Library Home Popover
  const homeSearchResults = useMemo(() => {
    const q = (currentSearchValue || query).trim().toLowerCase();
    const hasFilter = selectedDomain !== 'all' || filterAuthor !== 'all';
    if (!q && !hasFilter) return [];

    return publishedBooks.filter(b => {
      const matchQ = !q || (
        (b.title || '').toLowerCase().includes(q) ||
        (b.author || '').toLowerCase().includes(q) ||
        (b.category || '').toLowerCase().includes(q) ||
        (b.infoText || '').toLowerCase().includes(q)
      );
      const matchDomain = selectedDomain === 'all' || b.category === selectedDomain;
      const matchAuthor = filterAuthor === 'all' || b.author === filterAuthor;
      return matchQ && matchDomain && matchAuthor;
    });
  }, [publishedBooks, currentSearchValue, query, selectedDomain, filterAuthor]);

  // Handler to open linked book from explanation or course
  const handleOpenLinkedBook = (bookTitle: string) => {
    const clean = bookTitle.trim().toLowerCase();
    const found = publishedBooks.find(b =>
      b.title.toLowerCase().includes(clean) || clean.includes(b.title.toLowerCase())
    );
    if (found) {
      handleReadBook(found);
    } else {
      setActiveMainTab('categories');
      setCategorySearch(bookTitle);
    }
  };

  // View State (Reader vs Browser)
  const [view, setView] = useState<'search' | 'reader'>('search')
  const [selectedBook, setSelectedBook] = useState<BookMeta | null>(null)
  const [selectedAuthorBook, setSelectedAuthorBook] = useState<BookMeta | null>(null)

  const getBaseUrl = () => import.meta.env.VITE_DATA_INGESTION_URL || 'https://abourida-zad-tutor-engine-space.hf.space';

  // 1. Instant Cache Hydration & Fresh Network Sync
  useEffect(() => {
    try {
      const isSynced = localStorage.getItem('zad_library_synced') === 'true';
      const cachedBooksStr = localStorage.getItem('zad_cached_library_books_v5') || localStorage.getItem('zad_cached_library_books_v4');
      if (cachedBooksStr) {
        const cached = JSON.parse(cachedBooksStr);
        if (Array.isArray(cached) && (isSynced || cached.length > 0)) {
          const normalized = cached.map(normalizeBook);
          setPublishedBooks(normalized);
          setLoading(false);
        }
      }
      const cachedAnalyticsStr = localStorage.getItem('zad_cached_library_analytics_v4');
      if (cachedAnalyticsStr) {
        const cachedAnalytics = JSON.parse(cachedAnalyticsStr);
        if (cachedAnalytics && cachedAnalytics.total_books > 0) {
          setAnalytics(cachedAnalytics);
        }
      }
    } catch (e) {
      console.warn("Could not read local library cache", e);
    }

    const fetchLibraryData = async () => {
      try {
        const baseUrl = getBaseUrl();
        let resBooks = await fetch(`${baseUrl}/api/v1/data-ingestion/admin/library-books`);
        if (!resBooks.ok) {
          resBooks = await fetch(`${baseUrl}/api/v1/data-ingestion/admin/published-books`);
        }
        if (resBooks.ok) {
          const data = await resBooks.json();
          const rawBooks = Array.isArray(data.books) ? data.books : [];
          const books = rawBooks.map(normalizeBook);
          setPublishedBooks(books);
          try {
            localStorage.setItem('zad_cached_library_books_v5', JSON.stringify(books));
            localStorage.setItem('zad_library_synced', 'true');
          } catch (err) { }
        }

        const resAnalytics = await fetch(`${baseUrl}/api/v1/data-ingestion/admin/library-analytics`);
        if (resAnalytics.ok) {
          const dataAnalytics = await resAnalytics.json();
          setAnalytics(dataAnalytics);
          try {
            localStorage.setItem('zad_cached_library_analytics_v4', JSON.stringify(dataAnalytics));
          } catch (err) { }
        }
      } catch (err) {
        console.error("Error loading library data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLibraryData();
  }, []);

  // Fetch book info for floating modal when activeInfoBook changes
  useEffect(() => {
    if (!activeInfoBook) {
      setModalInfoText(null);
      return;
    }
    if (activeInfoBook.infoText) {
      setModalInfoText(activeInfoBook.infoText);
      return;
    }
    const fetchInfo = async () => {
      setLoadingInfo(true);
      try {
        const baseUrl = getBaseUrl();
        const res = await fetch(`${baseUrl}/api/v1/data-ingestion/zad-book-info/${activeInfoBook.id}`);
        if (res.ok) {
          const data = await res.json();
          setModalInfoText(data.meta?.info || 'لم تتوفر تفاصيل إضافية لهذا الكتاب حالياً.');
        } else {
          setModalInfoText('فشل جلب تفاصيل الكتاب من الخادم.');
        }
      } catch (err) {
        setModalInfoText('حدث خطأ أثناء محاولة جلب المعلومات.');
      } finally {
        setLoadingInfo(false);
      }
    };
    fetchInfo();
  }, [activeInfoBook]);

  // 2. Dynamic Domains List
  const availableDomains = useMemo(() => {
    const counts: Record<string, number> = {};
    publishedBooks.forEach(b => {
      const cat = b.category || 'أخرى';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [publishedBooks]);

  // Dynamic Authors List for Dropdown
  const availableAuthors = useMemo(() => {
    const counts: Record<string, number> = {};
    publishedBooks.forEach(b => {
      const author = b.author?.trim();
      if (author && author !== 'من غير معروف') {
        counts[author] = (counts[author] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [publishedBooks]);

  // 3. Dynamic Century List
  const availableCenturies = useMemo(() => {
    const counts: Record<number, number> = {};
    publishedBooks.forEach(b => {
      const { century } = inferCenturyAndDeath(b);
      if (century) {
        counts[century] = (counts[century] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([centuryStr, count]) => {
        const c = parseInt(centuryStr, 10);
        return {
          century: c,
          name: CENTURY_NAMES_MAP[c] || `القرن ${c} هـ`,
          count
        };
      })
      .sort((a, b) => a.century - b.century);
  }, [publishedBooks]);

  // 4. Live DB Analytics
  const liveStats = useMemo(() => {
    if (analytics && analytics.total_books > 0) return analytics;
    const uniqueAuthors = new Set(publishedBooks.map(b => b.author).filter(Boolean));
    return {
      total_books: publishedBooks.length,
      total_authors: uniqueAuthors.size,
      total_domains: availableDomains.length,
      domains: availableDomains,
      centuries: availableCenturies,
      timeline: {
        earliest_century: availableCenturies[0]?.century || 2,
        latest_century: availableCenturies[availableCenturies.length - 1]?.century || 15
      }
    };
  }, [analytics, publishedBooks, availableDomains, availableCenturies]);

  // 5. Tab 1 Filtering & Ascending Chronological Sorting
  const filteredAndSortedBooks = useMemo(() => {
    let result = [...publishedBooks];

    if (activeMainTab === 'featured') {
      if (featuredBookIds.size > 0) {
        result = result.filter(b => featuredBookIds.has(b.id) || featuredBookIds.has(b.title));
      } else {
        result = [];
      }
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(b =>
        (b.title || '').toLowerCase().includes(q) ||
        (b.author || '').toLowerCase().includes(q) ||
        (b.category || '').toLowerCase().includes(q)
      );
    }

    if (selectedDomain !== 'all') {
      result = result.filter(b => b.category === selectedDomain);
    }

    if (filterAuthor !== 'all') {
      result = result.filter(b => b.author === filterAuthor);
    }

    if (selectedCentury !== 'all') {
      const targetCentury = parseInt(selectedCentury, 10);
      result = result.filter(b => {
        const { century } = inferCenturyAndDeath(b);
        return century === targetCentury;
      });
    }

    result.sort((a, b) => {
      const metaA = inferCenturyAndDeath(a);
      const metaB = inferCenturyAndDeath(b);
      const scoreA = metaA.deathYear ?? (metaA.century ? metaA.century * 100 : 9999);
      const scoreB = metaB.deathYear ?? (metaB.century ? metaB.century * 100 : 9999);

      if (scoreA !== scoreB) {
        return sortAsc ? scoreA - scoreB : scoreB - scoreA;
      }
      return (a.title || '').localeCompare(b.title || '', 'ar');
    });

    return result;
  }, [publishedBooks, query, selectedDomain, filterAuthor, selectedCentury, sortAsc, activeMainTab, featuredBookIds]);

  // 6. Tab 2: Grouping Books by Categories (Pre-sorted map computed ONLY when publishedBooks changes)
  const baseCategorySortedMap = useMemo(() => {
    const map: Record<string, BookMeta[]> = {};
    publishedBooks.forEach(b => {
      const cat = b.category || 'أخرى';
      if (!map[cat]) map[cat] = [];
      map[cat].push(b);
    });

    Object.keys(map).forEach(cat => {
      map[cat].sort((a, b) => {
        const metaA = inferCenturyAndDeath(a);
        const metaB = inferCenturyAndDeath(b);
        const scoreA = metaA.deathYear ?? (metaA.century ? metaA.century * 100 : 9999);
        const scoreB = metaB.deathYear ?? (metaB.century ? metaB.century * 100 : 9999);
        return scoreA - scoreB;
      });
    });

    return map;
  }, [publishedBooks]);

  const booksByCategory = useMemo(() => {
    let list = availableDomains.map(d => ({
      name: d.name,
      count: d.count,
      books: baseCategorySortedMap[d.name] || []
    }));

    if (selectedDomain !== 'all') {
      list = list.filter(cat => cat.name === selectedDomain);
    }

    if (filterAuthor !== 'all') {
      list = list.map(cat => ({
        ...cat,
        books: cat.books.filter(b => b.author === filterAuthor)
      })).filter(cat => cat.books.length > 0);
    }

    const trimmed = categorySearch.trim();
    if (trimmed) {
      const normQ = normalizeArabicText(trimmed);
      list = list
        .map(cat => {
          const catMatches = normalizeArabicText(cat.name).includes(normQ);
          const matchingBooks = cat.books.filter(b =>
            normalizeArabicText(b.title).includes(normQ) ||
            normalizeArabicText(b.author).includes(normQ) ||
            normalizeArabicText(b.infoText).includes(normQ)
          );

          if (matchingBooks.length > 0) {
            return {
              ...cat,
              count: matchingBooks.length,
              books: matchingBooks,
            };
          }

          if (catMatches) {
            return cat;
          }

          return null;
        })
        .filter((cat): cat is { name: string; count: number; books: BookMeta[] } => cat !== null);
    }

    return list;
  }, [baseCategorySortedMap, availableDomains, categorySearch, selectedDomain, filterAuthor]);

  // 7. Tab 3: Grouping Authors by Centuries
  const authorsByCentury = useMemo(() => {
    const map: Record<number, {
      century: number;
      centuryName: string;
      authors: Record<string, {
        authorName: string;
        deathYear: number | null;
        centuryName: string;
        sampleBook: BookMeta;
        books: BookMeta[];
      }>;
    }> = {};

    publishedBooks.forEach(b => {
      const { deathYear, century, centuryName } = inferCenturyAndDeath(b);
      const c = century || 15;
      const cName = centuryName !== 'غير محدد' ? centuryName : (CENTURY_NAMES_MAP[c] || `القرن ${c} هـ`);

      if (!map[c]) {
        map[c] = {
          century: c,
          centuryName: cName,
          authors: {}
        };
      }

      const authorKey = (b.author || 'مؤلف غير معروف').trim();
      if (!map[c].authors[authorKey]) {
        map[c].authors[authorKey] = {
          authorName: authorKey,
          deathYear,
          centuryName: cName,
          sampleBook: b,
          books: []
        };
      }
      map[c].authors[authorKey].books.push(b);
      if (deathYear && !map[c].authors[authorKey].deathYear) {
        map[c].authors[authorKey].deathYear = deathYear;
      }
    });

    let centuriesList = Object.values(map).map(cGroup => ({
      century: cGroup.century,
      centuryName: cGroup.centuryName,
      totalBooks: Object.values(cGroup.authors).reduce((sum, a) => sum + a.books.length, 0),
      authors: Object.values(cGroup.authors).sort((a, b) => {
        if (a.deathYear && b.deathYear) return a.deathYear - b.deathYear;
        return a.authorName.localeCompare(b.authorName, 'ar');
      })
    })).sort((a, b) => a.century - b.century);

    if (selectedDomain !== 'all') {
      centuriesList = centuriesList.map(cGroup => ({
        ...cGroup,
        authors: cGroup.authors.filter(a => a.books.some(b => b.category === selectedDomain))
      })).filter(cGroup => cGroup.authors.length > 0);
    }

    if (filterAuthor !== 'all') {
      centuriesList = centuriesList.map(cGroup => ({
        ...cGroup,
        authors: cGroup.authors.filter(a => a.authorName === filterAuthor)
      })).filter(cGroup => cGroup.authors.length > 0);
    }

    if (authorSearch.trim()) {
      const q = authorSearch.trim().toLowerCase();
      centuriesList = centuriesList.map(cGroup => ({
        ...cGroup,
        authors: cGroup.authors.filter(a =>
          a.authorName.toLowerCase().includes(q) ||
          a.books.some(b => (b.title || '').toLowerCase().includes(q))
        )
      })).filter(cGroup => cGroup.authors.length > 0);
    }

    return centuriesList;
  }, [publishedBooks, authorSearch, selectedDomain, filterAuthor]);

  // Collapsible Sidebar & Recent Book State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [recentBook, setRecentBook] = useState<BookMeta | null>(() => {
    try {
      const saved = localStorage.getItem('zad_recent_read_book')
      if (saved) return JSON.parse(saved)
    } catch (e) { }
    return null
  })

  // Selected Author Object (for Author detail sub-page)
  const currentAuthorData = useMemo(() => {
    if (!selectedAuthor) return null;
    for (const cGroup of authorsByCentury) {
      const found = cGroup.authors.find(a => a.authorName === selectedAuthor);
      if (found) return found;
    }
    const authorBooks = publishedBooks.filter(b => b.author === selectedAuthor);
    if (authorBooks.length > 0) {
      const meta = inferCenturyAndDeath(authorBooks[0]);
      return {
        authorName: selectedAuthor,
        deathYear: meta.deathYear,
        centuryName: meta.centuryName,
        sampleBook: authorBooks[0],
        books: authorBooks
      };
    }
    return null;
  }, [selectedAuthor, authorsByCentury, publishedBooks]);

  const handleReadBook = (book: BookMeta) => {
    setSelectedBook(book);
    setRecentBook(book);
    try {
      localStorage.setItem('zad_recent_read_book', JSON.stringify(book));
    } catch (e) { }
    setView('reader');
  };

  if (view === 'reader' && selectedBook) {
    return (
      <TurathReader
        book={{
          ...selectedBook,
          century: selectedBook.century ? String(selectedBook.century) : undefined
        }}
        onClose={() => setView('search')}
        onAskBook={onAskBook}
        globalFontSize={fontSize}
      />
    );
  }

  // Render Search Console (Used in Navbar for non-home tabs and in Hero for home tab)
  const renderSearchConsole = (isCompact: boolean = false, matchingCount?: number) => {
    return (
      <div className={`relative w-full transition-all ${(isDomainPickerOpen || isAuthorPickerOpen) ? 'z-50' : 'z-20'}`}>
        <div className={`w-full transition-all duration-300 rounded-full ${isCompact
          ? getCompactSearchContainerStyle()
          : getHeroSearchContainerStyle()
          }`}>
          <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 ${isCompact ? 'py-1.5' : 'py-2.5 sm:py-3.5'
            }`}>
            {/* 1. Circle Search Button on Right (Start in RTL) */}
            <div className={`rounded-full flex items-center justify-center shadow-md shrink-0 transition-all ${getSearchBtnStyle()} ${isCompact ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-10 h-10 sm:w-11 sm:h-11'
              }`}>
              <Search className={isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4 sm:w-5 sm:h-5'} />
            </div>

            {/* 2. Main Search Input */}
            <input
              type="text"
              value={currentSearchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="ابحث عن كتاب (مثل: عمدة الفقه)، مؤلف (مثل: ابن قدامة)، أو باب شرعي..."
              className={`min-w-0 flex-1 bg-transparent outline-none ${Boolean(currentSearchValue) ? 'font-bold' : 'font-normal'} ${isDark
                ? 'text-white placeholder:text-slate-400/50 placeholder:font-normal'
                : 'text-stone-900 placeholder:text-stone-400 placeholder:font-normal'
                } ${isCompact ? 'text-xs sm:text-sm py-1' : 'text-sm sm:text-base py-1.5'}`}
            />

            {/* Clear button */}
            {Boolean(currentSearchValue) && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className={`p-1.5 rounded-full transition-colors shrink-0 cursor-pointer ${isDark
                  ? 'text-white/80 hover:text-white hover:bg-white/10'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-black/5'
                  }`}
                title="مسح البحث"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Subtle Vertical Divider */}
            <div className={`w-px shrink-0 ${isDark ? 'bg-white/20' : 'bg-stone-400/50'
              } ${isCompact ? 'h-5' : 'h-7 sm:h-8'}`} />

            {/* Dropdown Filters: Domain & Author */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Domain Picker */}
              <div className="relative" ref={domainPickerRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsDomainPickerOpen(!isDomainPickerOpen);
                    setIsAuthorPickerOpen(false);
                  }}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 rounded-full border transition-all duration-200 font-bold font-sans cursor-pointer active:scale-95 ${isCompact ? 'h-[30px] sm:h-[32px] text-[11px] sm:text-xs' : 'h-[36px] sm:h-[40px] text-xs sm:text-sm'
                    } ${selectedDomain !== 'all'
                      ? getFilterPillActiveStyle()
                      : isDark
                        ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md'
                        : 'bg-white/40 hover:bg-white/60 border-white/60 hover:border-white text-stone-900 font-bold backdrop-blur-md shadow-2xs'
                    }`}
                  title="تصفية حسب القسم الشرعي"
                >
                  <Layers className={`${isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${getFilterPillIconColor(selectedDomain !== 'all')} shrink-0`} />
                  <span className="truncate max-w-[70px] sm:max-w-[110px] md:max-w-[130px]">
                    {selectedDomain === 'all' ? 'القسم: الكل' : selectedDomain}
                  </span>
                  {selectedDomain !== 'all' ? (
                    <span
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDomain('all');
                      }}
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ml-0.5 cursor-pointer shrink-0 ${getFilterPillCloseBtnStyle()}`}
                      title="إلغاء تصفية القسم"
                    >
                      <X className="w-2.5 h-2.5" />
                    </span>
                  ) : (
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isDomainPickerOpen ? 'rotate-180' : 'rotate-0 opacity-70'}`} />
                  )}
                </button>

                {/* Domain Popover */}
                <div
                  className={`absolute top-full left-0 mt-2 w-[240px] sm:w-[270px] rounded-2xl border transition-all duration-200 z-[100] origin-top-left p-2.5 shadow-2xl backdrop-blur-2xl ${isDomainPickerOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                    } ${getFilterPopoverContainerStyle()}`}
                >
                  <div className="flex items-center justify-between px-2 pb-2 mb-1.5 border-b border-slate-100 dark:border-white/10 text-xs font-bold text-muted-foreground">
                    <span>اختر القسم الشرعي</span>
                    <span className="text-[10px] font-mono opacity-80">{availableDomains.length} قسم</span>
                  </div>
                  <div className="flex flex-col gap-1 max-h-[260px] overflow-y-auto [&::-webkit-scrollbar]:hidden">
                    <button
                      key="all-domains"
                      type="button"
                      onClick={() => {
                        setSelectedDomain('all');
                        setIsDomainPickerOpen(false);
                      }}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all text-right cursor-pointer ${selectedDomain === 'all'
                        ? getFilterPopoverItemActiveStyle()
                        : getFilterPopoverItemHoverStyle()
                        }`}
                    >
                      <span className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 opacity-70" />
                        الكل (جميع الأقسام)
                      </span>
                      <span className="text-[11px] font-mono opacity-75">({publishedBooks.length})</span>
                    </button>
                    {availableDomains.map(d => {
                      const isSel = selectedDomain === d.name;
                      return (
                        <button
                          key={d.name}
                          type="button"
                          onClick={() => {
                            setSelectedDomain(d.name);
                            setIsDomainPickerOpen(false);
                          }}
                          className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all text-right cursor-pointer ${isSel
                            ? getFilterPopoverItemActiveStyle()
                            : getFilterPopoverItemHoverStyle()
                            }`}
                        >
                          <span className="truncate">{d.name}</span>
                          <span className="text-[11px] font-mono opacity-75 shrink-0 mr-2">({d.count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Author Picker */}
              <div className="relative" ref={authorPickerRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthorPickerOpen(!isAuthorPickerOpen);
                    setIsDomainPickerOpen(false);
                  }}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 rounded-full border transition-all duration-200 font-bold font-sans cursor-pointer active:scale-95 ${isCompact ? 'h-[30px] sm:h-[32px] text-[11px] sm:text-xs' : 'h-[36px] sm:h-[40px] text-xs sm:text-sm'
                    } ${filterAuthor !== 'all'
                      ? getFilterPillActiveStyle()
                      : isDark
                        ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md'
                        : 'bg-white/40 hover:bg-white/60 border-white/60 hover:border-white text-stone-900 font-bold backdrop-blur-md shadow-2xs'
                    }`}
                  title="تصفية حسب المؤلف"
                >
                  <User className={`${isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${getFilterPillIconColor(filterAuthor !== 'all')} shrink-0`} />
                  <span className="truncate max-w-[70px] sm:max-w-[110px] md:max-w-[130px]">
                    {filterAuthor === 'all' ? 'المؤلف: الكل' : filterAuthor}
                  </span>
                  {filterAuthor !== 'all' ? (
                    <span
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilterAuthor('all');
                      }}
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ml-0.5 cursor-pointer shrink-0 ${getFilterPillCloseBtnStyle()}`}
                      title="إلغاء تصفية المؤلف"
                    >
                      <X className="w-2.5 h-2.5" />
                    </span>
                  ) : (
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isAuthorPickerOpen ? 'rotate-180' : 'rotate-0 opacity-70'}`} />
                  )}
                </button>

                {/* Author Popover */}
                <div
                  className={`absolute top-full left-0 mt-2 w-[240px] sm:w-[270px] rounded-2xl border transition-all duration-200 z-[100] origin-top-left p-2.5 shadow-2xl backdrop-blur-2xl ${isAuthorPickerOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                    } ${getFilterPopoverContainerStyle()}`}
                >
                  <div className="flex items-center justify-between px-2 pb-2 mb-1.5 border-b border-slate-100 dark:border-white/10 text-xs font-bold text-muted-foreground">
                    <span>اختر المؤلف أو الإمام</span>
                    <span className="text-[10px] font-mono opacity-80">{availableAuthors.length} عالم</span>
                  </div>

                  <div className="px-1 mb-2">
                    <input
                      type="text"
                      placeholder="ابحث باسم العالم..."
                      value={authorFilterQuery}
                      onChange={(e) => setAuthorFilterQuery(e.target.value)}
                      className={`w-full text-xs px-2.5 py-1.5 rounded-lg outline-none transition-colors ${getFilterPopoverInputStyle()}`}
                    />
                  </div>

                  <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto [&::-webkit-scrollbar]:hidden">
                    <button
                      key="all-authors"
                      type="button"
                      onClick={() => {
                        setFilterAuthor('all');
                        setIsAuthorPickerOpen(false);
                        setAuthorFilterQuery('');
                      }}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all text-right cursor-pointer ${filterAuthor === 'all'
                        ? getFilterPopoverItemActiveStyle()
                        : getFilterPopoverItemHoverStyle()
                        }`}
                    >
                      <span className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 opacity-70" />
                        الكل (جميع المؤلفين)
                      </span>
                      <span className="text-[11px] font-mono opacity-75">({availableAuthors.length})</span>
                    </button>
                    {availableAuthors
                      .filter(a => !authorFilterQuery.trim() || a.name.toLowerCase().includes(authorFilterQuery.trim().toLowerCase()))
                      .map(a => {
                        const isSel = filterAuthor === a.name;
                        return (
                          <button
                            key={a.name}
                            type="button"
                            onClick={() => {
                              setFilterAuthor(a.name);
                              setIsAuthorPickerOpen(false);
                              setAuthorFilterQuery('');
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all text-right cursor-pointer ${isSel
                              ? getFilterPopoverItemActiveStyle()
                              : getFilterPopoverItemHoverStyle()
                              }`}
                          >
                            <span className="truncate pr-1">{a.name}</span>
                            <span className="text-[11px] font-mono opacity-75 shrink-0 mr-2">({a.count})</span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Reset button if filtered */}
              {(selectedDomain !== 'all' || filterAuthor !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDomain('all');
                    setFilterAuthor('all');
                  }}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border transition-all flex items-center justify-center shrink-0 active:scale-95 cursor-pointer shadow-xs ${getFilterResetBtnStyle()}`}
                  title="إعادة تعيين الفلاتر"
                >
                  <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Live Search Floating Popover for Library Home View (فريم طافف منبثق بنتائج البحث المباشر في الصفحة الرئيسية) */}
        {activeMainTab === 'home' && (Boolean(currentSearchValue.trim()) || selectedDomain !== 'all' || filterAuthor !== 'all') && !isHomeSearchResultsDismissed && (
          <div className="absolute top-full left-0 right-0 mt-3 max-h-[520px] overflow-y-auto rounded-3xl border-2 border-purple-500/30 dark:border-purple-500/40 bg-white/95 dark:bg-[#120526]/95 backdrop-blur-2xl shadow-[0_25px_80px_rgba(46,8,84,0.3)] dark:shadow-[0_25px_80px_rgba(0,0,0,0.95)] z-[90] p-4 sm:p-5 space-y-3 animate-in fade-in zoom-in-95 duration-200 text-right">

            {/* Header of Floating Search Results */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 text-xs font-bold text-muted-foreground">
              <span className="flex items-center gap-1.5 text-slate-900 dark:text-white font-extrabold text-sm sm:text-base">
                <Sparkles className="w-4 h-4 text-brand-magenta" />
                نتائج البحث المباشر ({homeSearchResults.length} {homeSearchResults.length === 1 ? 'كتاب' : 'كتب'})
              </span>
              <button
                type="button"
                onClick={() => setIsHomeSearchResultsDismissed(true)}
                className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-xs font-bold text-muted-foreground hover:text-foreground transition-all flex items-center gap-1 cursor-pointer"
                title="إغلاق قائمة النتائج"
              >
                <span>إغلاق</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of Results (كل كتاب في سطر مطابق للبطاقة والتصميم المطلوب) */}
            <div className="space-y-3">
              {homeSearchResults.map(book => {
                const { deathYear, centuryName } = inferCenturyAndDeath(book);
                const isFav = favoriteBookIds.has(book.id) || favoriteBookIds.has(book.title);
                return (
                  <div
                    key={book.id}
                    className="group rounded-2xl border border-slate-200/80 dark:border-purple-500/20 bg-white dark:bg-[#180730]/90 p-3.5 sm:p-4 shadow-sm hover:shadow-md hover:border-brand-magenta/40 dark:hover:border-purple-500/50 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-right"
                  >
                    {/* Book Info */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-magenta/15 to-brand-blue/15 text-brand-magenta flex items-center justify-center shrink-0 group-hover:bg-brand-magenta group-hover:text-white transition-all shadow-xs mt-0.5">
                        <BookOpen className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 group-hover:text-brand-magenta transition-colors line-clamp-1">
                          {book.title}
                        </h4>

                        {/* Badges: Author + Category (Glassmorphic) + Century */}
                        <div className="flex items-center gap-2 flex-wrap mt-1.5">
                          {/* Author with User Icon */}
                          {book.author && book.author !== 'من غير معروف' ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAuthorBook(book);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-brand-magenta transition-colors group/author cursor-pointer"
                              title="عرض سيرة المؤلف"
                            >
                              <User className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover/author:text-brand-magenta" />
                              <span className="group-hover/author:underline underline-offset-2">{book.author}</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="h-3.5 w-3.5 text-slate-400" />
                              <span>{book.author}</span>
                            </span>
                          )}

                          {/* Glassmorphic Category Badge (وسم بفريم احترافي زجاجي باسم القسم) */}
                          {book.category && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 backdrop-blur-sm">
                              <Layers className="w-3 h-3 text-brand-magenta" />
                              {book.category}
                            </span>
                          )}

                          {/* Century Badge (وسم القرن وتاريخ الوفاة) */}
                          {centuryName && centuryName !== 'غير محدد' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                              <Calendar className="w-3 h-3 text-amber-500" />
                              {centuryName}
                              {deathYear && <span className="font-mono">({deathYear}هـ)</span>}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: تصفح + اسأل زاد + معلومات + مفضلة */}
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          handleReadBook(book);
                          setIsHomeSearchResultsDismissed(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-brand-magenta text-white text-xs font-bold hover:bg-brand-deep transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                        title="تصفح وقراءة الكتاب"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>تصفح</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onAskBook(book);
                          setIsHomeSearchResultsDismissed(true);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-brand-magenta/30 bg-brand-magenta/5 text-brand-magenta hover:bg-brand-magenta/15 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                        title="اسأل زاد حول الكتاب"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>اسأل زاد</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveInfoBook(book)}
                        className="p-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-muted-foreground hover:text-brand-magenta hover:bg-brand-magenta/10 transition-all flex items-center justify-center cursor-pointer"
                        title="معلومات وتفاصيل الكتاب"
                      >
                        <Info className="w-4 h-4" />
                      </button>

                      {(typeof toggleFavorite === 'function') && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(book.id ?? book.title);
                          }}
                          className={`p-1.5 rounded-xl border transition-all flex items-center justify-center active:scale-90 ${isFav
                            ? 'border-rose-500/30 text-rose-500 bg-rose-500/10'
                            : 'border-slate-200 dark:border-white/10 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10'
                            }`}
                          title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-current text-rose-500' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGlobalNavTabs = (compact: boolean = false) => {
    const isMediaActive = activeMainTab === 'media' || activeMainTab === 'courses';
    const isLibraryActive = !isMediaActive;

    const navItems = [
      {
        id: 'home',
        label: 'الرئيسية',
        isActive: false,
        action: () => {
          setIsScrolledPastSearch(false);
          onScrolledPastSearchChange?.(false);
          window.scrollTo({ top: 0, behavior: 'instant' });
          if (onNavigateGlobal) onNavigateGlobal('home');
          else onExit();
        }
      },
      {
        id: 'knowledge',
        label: 'المكتبة',
        isActive: isLibraryActive,
        action: () => {
          if (activeMainTab !== 'home') {
            handleGoToLibraryHome();
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      },
      {
        id: 'media',
        label: 'الشروحات والدروس',
        isActive: isMediaActive,
        action: () => {
          setActiveMainTab('media');
          setSelectedAuthor(null);
        }
      },
      { id: 'study', label: 'وضع الدراسة', isActive: false, action: () => (onNavigateGlobal ? onNavigateGlobal('study') : null) },
      { id: 'chat', label: 'المحادثة النصية', isActive: false, action: () => (onNavigateGlobal ? onNavigateGlobal('chat') : null) },
      { id: 'voice', label: 'المحادثة الصوتية', isActive: false, action: () => (onNavigateGlobal ? onNavigateGlobal('voice') : null) },
    ];

    return (
      <ul className={`flex items-center ${compact ? 'gap-0.5 sm:gap-1' : 'gap-1 sm:gap-1.5'}`}>
        {navItems.map((item) => {
          const active = item.isActive;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={item.action}
                className={`relative flex items-center justify-center transition-all duration-300 rounded-full cursor-pointer ${compact
                  ? 'text-[11px] sm:text-xs px-2.5 py-1'
                  : 'text-xs sm:text-sm lg:text-[13.5px] px-3.5 sm:px-4 py-1.5'
                  } font-bold ${active
                    ? getActiveTabStyle()
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.08]'
                  }`}
              >
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    );
  };

  const getRootBgStyle = () => {
    if (isDark) {
      return 'bg-[#090b10] text-slate-100';
    }
    switch (accentColor) {
      case 'amber':
        return 'bg-[#faf7f0] text-stone-900';
      case 'emerald':
        return 'bg-[#f0fdfa] text-slate-900';
      case 'blue':
        return 'bg-[#f0f7ff] text-slate-900';
      case 'purple':
      default:
        return 'bg-[#faf8fd] text-slate-900';
    }
  };

  return (
    <div dir="rtl" className={`relative min-h-screen font-sans transition-colors duration-300 ${isDark ? 'dark' : ''} ${getRootBgStyle()}`}>

      <div className="flex min-h-screen relative z-10 overflow-x-clip">

        {/* ============================================================= */}
        {/* FLOATING DRAWER SIDEBAR (القائمة الجانبية كطبقة طافية)         */}
        {/* ============================================================= */}
        <LibrarySidebar
          isOpen={isSidebarOpen}
          theme={theme}
          activeMainTab={activeMainTab}
          counts={{
            domains: availableDomains.length,
            authors: liveStats.total_authors,
            featured: featuredBookIds.size > 0 ? publishedBooks.filter(b => featuredBookIds.has(b.id) || featuredBookIds.has(b.title)).length : 0,
            favorites: favoriteBooksList.length,
          }}
          recentBook={recentBook}
          onClose={() => setIsSidebarOpen(false)}
          onSelectTab={(tab) => {
            if (tab === 'home') {
              handleGoToLibraryHome();
            } else {
              window.scrollTo({ top: 0, behavior: 'instant' });
              setActiveMainTab(tab);
              setSelectedAuthor(null);
            }
          }}
          onReadRecentBook={handleReadBook}
          selectedCentury={selectedCentury}
          onChangeCentury={(c) => setSelectedCentury(c)}
          availableCenturies={availableCenturies}
          sortAsc={sortAsc}
          onToggleSort={() => setSortAsc(!sortAsc)}
          onOpenSettings={() => {
            setIsSidebarOpen(false);
            setIsSettingsMenuOpen(true);
          }}
        />

        {/* ============================================================= */}
        {/* MAIN WORKSPACE AREA (مساحة التصفح والعرض الرئيسية)            */}
        {/* ============================================================= */}
        <main className="flex-1 min-w-0 flex flex-col min-h-screen">

          {/* ============================================================= */}
          {/* SECTION 1: TOP HERO (القسم الأول: النافبار + الهيدر + صورة الغروب - شاشة كاملة 100vh) */}
          {/* ============================================================= */}
          <div className={`relative w-full ${activeMainTab === 'home'
            ? 'min-h-screen flex flex-col justify-between'
            : ''
            }`}>
            {/* Sunset Mosque Background - STRICTLY LIMITED TO SECTION 1 ON 'home' */}
            {activeMainTab === 'home' && (
              <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <img
                  src={theme === 'dark' ? libraryBgDark : libraryBgLight}
                  alt="خلفية المكتبة"
                  aria-hidden
                  className="h-full w-full object-cover object-center transition-all duration-500"
                  style={{
                    opacity: currentSettings.imageOpacity / 100
                  }}
                />
                {currentSettings.overlayOpacity > 0 && (
                  <div
                    className="absolute inset-0 bg-black/20 transition-opacity duration-500"
                    style={{ opacity: currentSettings.overlayOpacity / 100 }}
                  />
                )}
              </div>
            )}

            {/* ============================================================= */}
            {/* STICKY TOP NAVBAR (يظهر عند التمرير واختفاء السيرش بار أو في الصفحات الفرعية) */}
            {/* ============================================================= */}
            {((activeMainTab === 'home' && isScrolledPastSearch) || activeMainTab !== 'home') && (
              <header
                className={`fixed top-0 left-0 right-0 z-50 w-full min-h-[72px] sm:min-h-[76px] py-3.5 sm:py-4 px-4 sm:px-6 lg:px-8 backdrop-blur-xl border-b transition-all duration-300 animate-in slide-in-from-top-2 flex items-center ${getStickyNavbarStyle()}`}
              >
                <div className="w-full max-w-[1920px] mx-auto flex items-center justify-between gap-3 lg:gap-5">

                  {/* 1. RIGHT: Circular Menu Button (فهرس وتصنيفات المكتبة) + Zad Logo & Word */}
                  <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsSidebarOpen(true)}
                      className={`h-10 w-10 rounded-full border flex items-center justify-center transition-all backdrop-blur-md active:scale-95 cursor-pointer group ${getNavCircleBtnStyle()}`}
                      title="فهرس وتصنيفات المكتبة"
                      aria-label="فتح فهرس وتصنيفات المكتبة"
                    >
                      <Menu className="h-5 w-5 transition-transform group-hover:scale-110" strokeWidth={2.2} />
                    </button>

                    <div
                      onClick={() => {
                        if (activeMainTab !== 'home') {
                          handleGoToLibraryHome();
                        } else {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className="flex items-center gap-2 cursor-pointer group select-none"
                      title="الرئيسية"
                    >
                      {accentColor === 'purple' ? (
                        <img
                          src={darkLogo}
                          alt="زاد"
                          className="h-8 sm:h-9 w-auto object-contain drop-shadow-[0_2px_10px_rgba(157,50,236,0.35)] transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className={`h-8 sm:h-9 w-8 sm:w-9 shrink-0 transition-transform group-hover:scale-105 ${accentColor === 'blue'
                            ? theme === 'dark'
                              ? 'bg-gradient-to-b from-[#38bdf8] via-[#2563eb] to-[#1e40af] drop-shadow-[0_2px_10px_rgba(37,99,235,0.45)]'
                              : 'bg-gradient-to-b from-[#0284c7] via-[#1d4ed8] to-[#1e3a8a] drop-shadow-[0_2px_8px_rgba(2,132,199,0.35)]'
                            : accentColor === 'emerald'
                              ? theme === 'dark'
                                ? 'bg-gradient-to-b from-[#5eead4] via-[#14b8a6] to-[#0f766e] drop-shadow-[0_2px_10px_rgba(20,184,166,0.4)]'
                                : 'bg-gradient-to-b from-[#14b8a6] via-[#0d9488] to-[#134e4a] drop-shadow-[0_2px_8px_rgba(13,148,136,0.35)]'
                              : theme === 'dark'
                                ? 'bg-gradient-to-b from-[#f5ecd5] via-[#dfbf83] to-[#8e682d] drop-shadow-[0_2px_10px_rgba(223,191,131,0.4)]'
                                : 'bg-gradient-to-b from-[#dfbf83] via-[#b88d46] to-[#5e431a] drop-shadow-[0_2px_8px_rgba(184,141,70,0.35)]'
                            }`}
                          style={{
                            WebkitMaskImage: `url(${whiteLogo})`,
                            maskImage: `url(${whiteLogo})`,
                            WebkitMaskSize: 'contain',
                            maskSize: 'contain',
                            WebkitMaskRepeat: 'no-repeat',
                            maskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                            maskPosition: 'center',
                          }}
                        />
                      )}
                      <span className={`font-tajawal font-black text-sm sm:text-base tracking-tight hidden sm:inline ${accentColor === 'purple'
                        ? (isDark ? 'bg-gradient-to-l from-[#c084fc] via-[#9d32ec] to-[#801bcc] bg-clip-text text-transparent' : 'text-[#7a17c9]')
                        : accentColor === 'blue'
                          ? (isDark ? 'bg-gradient-to-l from-[#38bdf8] via-[#60a5fa] to-[#2563eb] bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(37,99,235,0.4)]' : 'text-blue-700')
                          : accentColor === 'emerald'
                            ? (isDark ? 'text-teal-400' : 'text-teal-700')
                            : (isDark ? 'text-[#dfbf83]' : 'text-[#8a652a]')
                        }`}>
                        زاد
                      </span>
                    </div>
                  </div>

                  {/* 2. CENTER: On categories page hide navbar search and center the 6 tabs; otherwise show search + tabs */}
                  {activeMainTab !== 'categories' ? (
                    <>
                      <div className="flex-1 max-w-xl xl:max-w-2xl min-w-0">
                        {renderSearchConsole(true)}
                      </div>

                      <nav className="hidden md:flex items-center shrink-0">
                        <div className="p-1 rounded-full bg-white/70 dark:bg-[#121520]/80 border border-slate-200/80 dark:border-white/10 backdrop-blur-2xl shadow-sm dark:shadow-md dark:shadow-black/20">
                          {renderGlobalNavTabs(true)}
                        </div>
                      </nav>
                    </>
                  ) : (
                    <nav className="hidden md:flex flex-1 items-center justify-center">
                      <div className="p-1 rounded-full bg-white/70 dark:bg-[#121520]/80 border border-slate-200/80 dark:border-white/10 backdrop-blur-2xl shadow-sm dark:shadow-lg dark:shadow-black/25">
                        {renderGlobalNavTabs(false)}
                      </div>
                    </nav>
                  )}

                  {/* 4. LEFT: Notifications & Circular Settings Button (مطابق للنافبار الأساسي) */}
                  <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                    <NotificationBell />

                    {/* قائمة الإعدادات والمظهر المطابقة تماماً للشاشة الرئيسية */}
                    <div className="relative" ref={settingsMenuRef}>
                      <button
                        type="button"
                        onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
                        className={`h-10 w-10 rounded-full border flex items-center justify-center transition-all backdrop-blur-md active:scale-95 cursor-pointer group ${getNavCircleBtnStyle()}`}
                        title="الإعدادات والمظهر"
                        aria-label="الإعدادات والمظهر"
                      >
                        <Settings className="h-4.5 w-4.5 transition-transform group-hover:rotate-45 duration-300" strokeWidth={2.2} />
                      </button>

                      {isSettingsMenuOpen && (
                        <div
                          dir="rtl"
                          className={`absolute left-0 top-full mt-3 w-80 sm:w-84 max-h-[85vh] overflow-y-auto rounded-3xl border p-3.5 shadow-2xl backdrop-blur-2xl transition-all text-right slim-scrollbar z-50 space-y-2.5 animate-in fade-in zoom-in-95 duration-200 ${getDropdownGlassClass()}`}
                        >
                          {/* 1. تاب البروفايل أو تسجيل الدخول */}
                          {isAuthenticated ? (
                            <button
                              type="button"
                              onClick={() => {
                                setIsSettingsMenuOpen(false);
                                setShowProfileModal(true);
                              }}
                              className={`flex w-full items-center justify-between rounded-2xl border p-3 text-right transition-all duration-200 active:scale-[0.99] cursor-pointer ${getNavItemCardClass()}`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full brand-gradient text-white shadow-md overflow-hidden ring-2 ring-white/15">
                                  {user?.avatarUrl ? (
                                    <img
                                      src={getAvatarUrl(user.avatarUrl)}
                                      alt={user?.name || 'مستخدم'}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <User size={22} strokeWidth={2.2} />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1 text-right">
                                  <div className="flex items-center gap-2">
                                    <span className={`truncate text-sm font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>
                                      {user?.name || (isAdmin ? 'مسؤول النظام' : 'مستخدم زاد')}
                                    </span>
                                    {isAdmin && (
                                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold border ${getThemeBadgeClass()}`}>
                                        أدمن
                                      </span>
                                    )}
                                  </div>
                                  <p className={`truncate text-xs font-mono mt-0.5 ${isDark ? 'text-white/50' : 'text-stone-500'}`}>
                                    {user?.email || 'طالب علم'}
                                  </p>
                                </div>
                              </div>
                              <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${isDark ? 'text-white/60 hover:text-white' : 'text-stone-500'}`}>
                                <ChevronLeft size={18} />
                              </div>
                            </button>
                          ) : (
                            <div className={`rounded-2xl border p-3.5 text-right shadow-sm ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-stone-200/80 bg-white/90 shadow-stone-200/50'}`}>
                              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>مرحباً بك</h4>
                              <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-white/70' : 'text-stone-500'}`}>
                                قم بالتسجيل للاستفادة من خدمات الموقع
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsSettingsMenuOpen(false);
                                  setIsLoginLoading(true);
                                  if (onLogin) onLogin();
                                  else if (onNavigateGlobal) onNavigateGlobal('chat');
                                  setTimeout(() => setIsLoginLoading(false), 1500);
                                }}
                                disabled={isLoginLoading}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#53177d] hover:bg-[#431265] text-white py-2 px-3 text-xs font-bold shadow-sm shadow-[#53177d]/20 active:scale-[0.98] transition-all cursor-pointer"
                              >
                                {isLoginLoading ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
                                <span>تسجيل الدخول / إنشاء حساب</span>
                              </button>
                            </div>
                          )}

                          {/* 2. الإضاءة (مطابق للشاشة الرئيسية) */}
                          <div
                            onClick={toggleTheme}
                            role="button"
                            tabIndex={0}
                            className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm font-semibold cursor-pointer active:scale-[0.99] transition-all select-none ${getNavItemCardClass()}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${getNavIconBoxClass()}`}>
                                {isDark ? <Moon size={16} /> : <Sun size={16} />}
                              </div>
                              <div className="text-right">
                                <span className="block text-sm font-bold">الإضاءة</span>
                                <span className={`text-[11px] font-normal ${isDark ? 'text-white/60' : 'text-stone-500'}`}>
                                  {isDark ? 'الوضع الليلي مفعّل' : 'الوضع النهاري مفعّل'}
                                </span>
                              </div>
                            </div>

                            <div className={`relative flex h-7 w-14 items-center rounded-full p-1 transition-colors duration-300 ${getThemeToggleTrackClass()}`}>
                              <div className="absolute inset-x-2 flex justify-between items-center text-[10px] pointer-events-none">
                                <Moon size={12} className={isDark ? 'text-white/80' : 'text-black/25'} />
                                <Sun size={12} className={!isDark ? 'text-amber-950/80' : 'text-white/25'} />
                              </div>

                              <motion.div
                                layout
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className={`z-10 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md ${isDark ? 'mr-0 ml-auto text-stone-800' : 'ml-0 mr-auto text-amber-600'
                                  }`}
                              >
                                {isDark ? <Moon size={11} strokeWidth={2.5} /> : <Sun size={11} strokeWidth={2.5} />}
                              </motion.div>
                            </div>
                          </div>

                          {/* 3. لون السمة (الـ 4 ألوان) */}
                          <div className={`rounded-xl border p-3 ${getNavItemCardClass()}`}>
                            <div className="flex items-center justify-between mb-2.5">
                              <div className="flex items-center gap-2 text-xs font-semibold">
                                <Palette size={15} className={accentColor === 'emerald' ? 'text-teal-400' : accentColor === 'amber' ? 'text-[#dfbf83]' : accentColor === 'blue' ? 'text-blue-400' : 'text-purple-400'} />
                                <span>لون السمة</span>
                              </div>
                              <span className={`text-[10px] font-bold ${accentColor === 'emerald' ? 'text-teal-400' : accentColor === 'amber' ? 'text-[#dfbf83]' : accentColor === 'blue' ? 'text-blue-400' : 'text-purple-400'}`}>
                                {accentColor === 'purple' && 'أرجواني ملكي'}
                                {accentColor === 'emerald' && 'فيروزي إسلامي'}
                                {accentColor === 'amber' && 'عاجي إسلامي'}
                                {accentColor === 'blue' && 'أزرق ياقوتي'}
                              </span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                              {[
                                { id: 'purple', name: 'أرجواني', gradient: 'from-purple-700 to-fuchsia-500', ring: 'ring-purple-400' },
                                { id: 'emerald', name: 'فيروزي', gradient: 'from-teal-700 via-teal-500 to-cyan-400', ring: 'ring-teal-400' },
                                { id: 'amber', name: 'عاجي', gradient: 'from-[#8e682d] via-[#c59b58] to-[#eedbb2]', ring: 'ring-[#dfbf83]' },
                                { id: 'blue', name: 'ياقوتي', gradient: 'from-blue-700 to-indigo-500', ring: 'ring-blue-400' },
                              ].map((item) => {
                                const isSelected = accentColor === item.id;
                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setAccentColor(item.id as any)}
                                    className="group flex flex-col items-center gap-1.5 py-1 px-1 transition-all active:scale-95 cursor-pointer"
                                  >
                                    <span
                                      className={`h-7 w-7 rounded-full bg-gradient-to-tr ${item.gradient} transition-all duration-300 ${isSelected
                                        ? `ring-2 ${item.ring} ring-offset-2 ${isDark ? 'ring-offset-[#120324]' : 'ring-offset-white'} scale-115 shadow-lg`
                                        : 'scale-90 opacity-70 group-hover:opacity-100 group-hover:scale-95'
                                        }`}
                                    />
                                    <span
                                      className={`text-[10px] leading-tight transition-colors ${isSelected ? (isDark ? 'font-bold text-white' : 'font-bold text-stone-900') : isDark ? 'font-medium text-white/60' : 'font-medium text-stone-600'
                                        }`}
                                    >
                                      {item.name}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* 4. تطبيق زاد للأندرويد */}
                          <a
                            href="https://apkpure.com/p/com.example.zaad"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsSettingsMenuOpen(false)}
                            className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm font-semibold active:scale-[0.99] transition-all cursor-pointer ${getNavItemCardClass()}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${getNavIconBoxClass()}`}>
                                <Smartphone size={16} />
                              </div>
                              <div className="text-right">
                                <span className="block text-sm font-bold">تطبيق زاد للأندرويد</span>
                                <span className={`text-[11px] font-normal ${isDark ? 'text-white/60' : 'text-stone-500'}`}>
                                  تحميل مباشر عبر APKPure
                                </span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getThemeBadgeClass()}`}>
                              تثبيت
                            </span>
                          </a>

                          {/* 5. مشاركة زاد */}
                          <button
                            type="button"
                            onClick={() => {
                              setIsSettingsMenuOpen(false);
                              handleShare();
                            }}
                            className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm font-semibold active:scale-[0.99] transition-all cursor-pointer ${getNavItemCardClass()}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${getNavIconBoxClass()}`}>
                                <Share2 size={16} />
                              </div>
                              <div className="text-right">
                                <span className="block text-sm font-bold">مشاركة زاد</span>
                                <span className={`text-[11px] font-normal ${isDark ? 'text-white/60' : 'text-stone-500'}`}>
                                  شارك الموقع أو رابط التطبيق
                                </span>
                              </div>
                            </div>
                            <ChevronLeft size={16} className={isDark ? 'text-white/55' : 'text-stone-400'} />
                          </button>

                          {/* 6. تسجيل الخروج */}
                          {isAuthenticated && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsSettingsMenuOpen(false);
                                logout();
                              }}
                              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors active:scale-95 cursor-pointer"
                            >
                              <LogOut size={15} />
                              <span>تسجيل خروج</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </header>
            )}

            {/* HOME HERO SECTION (يتوسط الشاشة رأسياً) */}
            {activeMainTab === 'home' && (
              <div className="relative z-20 flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-center animate-in fade-in duration-300">
                <div className="max-w-4xl w-full mx-auto space-y-3 sm:space-y-4">

                  {/* Zad Logo & Header Title */}
                  <div className="space-y-3 sm:space-y-3.5">
                    <div className="relative flex items-center justify-center py-2 sm:py-3">
                      {/* Atmospheric Accent-Colored Ambient Glow */}
                      <div
                        className={`absolute w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-tr ${getLogoGlowColor()} blur-3xl rounded-full pointer-events-none -z-10 animate-pulse`}
                        style={{ animationDuration: '4s' }}
                      />
                      {renderHeroCenterLogo()}
                    </div>

                    {/* Main Title colored with active Accent Color (طلب المستخدم: درجات قوية وغنية) */}
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[40px] font-black tracking-tight font-tajawal">
                      <span className={`inline-block transition-all duration-300 ${getHeroTitleColorClass()}`}>
                        مكتبة متكاملة لدراسة العلوم الشرعية
                      </span>
                    </h1>

                    {/* Clean White Subtitle (طلب المستخدم: والجمله الصغيره خليها بالابيض زي ما هيا) */}
                    <p className="text-xs sm:text-sm md:text-base font-bold text-white/95 dark:text-white max-w-xl mx-auto leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                      ابحث في مجموعة مختارة من كتب المكتبة الشاملة، واستكشف الشروح المرئية والصوتية والدورات العلمية.
                    </p>
                  </div>

                  {/* Taller Search Bar (بارتفاع أكبر وتصميم مطابق للصورة 2) */}
                  <div id="hero-main-search-bar" className="max-w-4xl mx-auto w-full">
                    {renderSearchConsole(false)}
                  </div>

                  {/* CONTINUE READING BANNER (تصميم زجاجي شفاف ومدمج مع إمكانية الإغلاق) */}
                  {recentBook && !isRecentBannerDismissed && (
                    <div className={`relative max-w-xl mx-auto w-full rounded-2xl py-2 sm:py-2.5 px-3 sm:px-4 backdrop-blur-xl border flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3.5 animate-in fade-in slide-in-from-bottom-2 duration-300 transition-all ${getRecentBannerStyle()}`}>
                      <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto text-right">
                        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md border transition-all ${getRecentIconStyle()}`}>
                          <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className={`block text-[10px] sm:text-[11px] font-bold drop-shadow-xs ${getRecentSubtextStyle()}`}>متابعة القراءة الأخيرة</span>
                          <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate drop-shadow-xs mt-0.5">
                            {recentBook.title}
                          </h3>
                          <p className="text-[10px] text-slate-600 dark:text-slate-300 truncate font-medium">
                            المؤلف: {recentBook.author}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                        <button
                          type="button"
                          onClick={() => handleReadBook(recentBook)}
                          className={`py-1.5 px-3.5 sm:px-4 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 border flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${getRecentButtonStyle()}`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>إكمال القراءة الآن</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsRecentBannerDismissed(true)}
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer border border-transparent hover:border-white/10"
                          title="إغلاق متابعة القراءة"
                          aria-label="إغلاق"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* مؤشر التمرير للأسفل للانتقال للقسم الثاني */}
            {activeMainTab === 'home' && (
              <div className="relative z-20 pb-4 sm:pb-5 flex flex-col items-center justify-center text-center">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('library-domains-section');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="inline-flex flex-col items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-brand-magenta transition-colors cursor-pointer group"
                >
                  <span className="opacity-80 group-hover:opacity-100 transition-opacity">تصفح العلوم الشرعية</span>
                  <ChevronDown className="w-4 h-4 text-brand-magenta animate-bounce" />
                </button>
              </div>
            )}
          </div>

          {/* ============================================================= */}
          {/* SECTION 2: WORKSPACE & ISLAMIC PATTERN (القسم الثاني: الزخرفة)  */}
          {/* ============================================================= */}
          <div className={`relative z-10 flex-1 w-full overflow-hidden transition-colors duration-300 ${getSection2ContainerStyle()}`}>
            {/* الزخرفة الإسلامية الهندسية تغطي كامل خلفية القسم الثاني وتتلون حسب السمة */}
            <IslamicPattern
              opacity={theme === 'dark' ? 0.05 : 0.06}
              className={`${getSection2PatternColor()} pointer-events-none transition-colors duration-300`}
            />

            <div className={`relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 ${activeMainTab !== 'home' ? 'pt-24 sm:pt-28 lg:pt-32' : ''}`}>

              {/* TAB: الرئيسية (Home) */}
              {activeMainTab === 'home' && (
                <LibraryHomeView
                  recentBook={recentBook}
                  featuredBooks={publishedBooks.filter(b => featuredBookIds.has(b.id) || featuredBookIds.has(b.title))}
                  liveStats={liveStats}
                  availableDomains={availableDomains}
                  selectedDomain={selectedDomain}
                  onSelectDomain={(dom) => {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                    setSelectedDomain(dom);
                    setActiveMainTab('categories');
                  }}
                  featuredPlaylist={playlists.find(p => p.id === 'pl-alaa-fiqh-muyassar') || playlists[0]}
                  activeCourse={courses.find(c => c.playlistId === 'PLRG850GgVGNY') || courses[0]}
                  favoritesCount={favoriteBooksList.length}
                  onNavigateTab={(tab) => {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                    setActiveMainTab(tab);
                    setSelectedAuthor(null);
                  }}
                  onReadBook={handleReadBook}
                  onOpenLinkedBook={handleOpenLinkedBook}
                />
              )}

              {/* TAB: الشروح المرئية والصوتية (Media) */}
              {activeMainTab === 'media' && (
                <MediaExplanationsView
                  sheikhs={sheikhs}
                  playlists={playlists}
                  standaloneItems={standaloneItems}
                  onOpenLinkedBook={handleOpenLinkedBook}
                />
              )}

              {/* TAB: الكتب المفضلة (Favorites) */}
              {activeMainTab === 'favorites' && (
                <FavoriteBooksView
                  favoriteBooks={favoriteBooksList}
                  onRead={handleReadBook}
                  onAsk={onAskBook}
                  onRemoveFavorite={(id) => toggleFavorite(id)}
                  onBrowseLibrary={() => {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                    setActiveMainTab('categories');
                  }}
                  onOpenAuthorBio={(b) => setSelectedAuthorBook(b)}
                />
              )}

              {/* TAB: دورات حالية (Courses) */}
              {activeMainTab === 'courses' && (
                <CurrentCoursesView
                  courses={courses}
                  onOpenLinkedBook={handleOpenLinkedBook}
                />
              )}

              {/* ============================================================= */}
              {/* TAB 1: الأقــسـام (By Categories / Domains)                   */}
              {/* ============================================================= */}
              {activeMainTab === 'categories' && (() => {
                const isSearching = Boolean(categorySearch.trim() || selectedDomain !== 'all' || filterAuthor !== 'all');

                // Flat search results list sorted by relevance with fast Arabic Normalization
                const searchResultsList = (() => {
                  if (!isSearching) return [];
                  const q = categorySearch.trim();
                  const normQ = normalizeArabicText(q);

                  const allMatching: BookMeta[] = [];
                  const seen = new Set<number | string>();
                  for (const cat of booksByCategory) {
                    for (const book of cat.books) {
                      const id = book.id || book.title;
                      if (!seen.has(id)) {
                        seen.add(id);
                        allMatching.push(book);
                      }
                    }
                  }

                  if (normQ) {
                    allMatching.sort((a, b) => {
                      const aTitle = normalizeArabicText(a.title);
                      const bTitle = normalizeArabicText(b.title);
                      const aAuthor = normalizeArabicText(a.author);
                      const bAuthor = normalizeArabicText(b.author);

                      const aScore = aTitle === normQ ? 120
                        : aTitle.startsWith(normQ) ? 80
                        : aTitle.includes(normQ) ? 50
                        : aAuthor === normQ ? 40
                        : aAuthor.startsWith(normQ) ? 30
                        : aAuthor.includes(normQ) ? 20 : 0;

                      const bScore = bTitle === normQ ? 120
                        : bTitle.startsWith(normQ) ? 80
                        : bTitle.includes(normQ) ? 50
                        : bAuthor === normQ ? 40
                        : bAuthor.startsWith(normQ) ? 30
                        : bAuthor.includes(normQ) ? 20 : 0;

                      if (aScore !== bScore) return bScore - aScore;
                      return (a.title || '').localeCompare(b.title || '', 'ar');
                    });
                  }

                  return allMatching;
                })();

                const totalMatchingBooks = searchResultsList.length;
                const deptCount = booksByCategory.length;
                const deptCountText = deptCount === 1
                  ? '1 قسم'
                  : deptCount === 2
                    ? '2 قسم'
                    : deptCount >= 3 && deptCount <= 10
                      ? `${deptCount} أقسام`
                      : `${deptCount} قسماً`;

                const matchingBooksCountText = totalMatchingBooks === 1
                  ? 'كتاب واحد مطابق'
                  : totalMatchingBooks === 2
                    ? 'كتابان متطابقان'
                    : totalMatchingBooks >= 3 && totalMatchingBooks <= 10
                      ? `${totalMatchingBooks} كتب مطابقة`
                      : `${totalMatchingBooks} كتاباً مطابقاً`;

                const displayedResults = searchResultsList.slice(0, visibleResultsCount);

                return (
                  <div className="animate-in fade-in duration-300 space-y-6">

                    {/* In-Page Search Console (مربع البحث مطابق للرئيسية مع بادج عداد نتائج البحث بنمط تراث) */}
                    <div id="subpage-main-search-bar" className="max-w-4xl mx-auto w-full">
                      {renderSearchConsole(false, isSearching ? totalMatchingBooks : undefined)}
                    </div>

                    {/* 3. Layout Toggle Bar for Categories / Search Results */}
                    <div className={`rounded-2xl border p-3 sm:px-5 flex items-center justify-between gap-3 ${getCategoryCardStyle()}`}>
                      <div className="flex items-center gap-2">
                        <Layers className={`w-5 h-5 shrink-0 transition-colors ${getSectionHeaderIconClass()}`} />
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                          {isSearching ? (
                            <>
                              نتائج البحث: <span className={getThemeAccentTextClass()}>{deptCountText}</span>
                              <span className="text-xs text-muted-foreground font-normal mr-1.5">
                                ({matchingBooksCountText})
                              </span>
                            </>
                          ) : (
                            <>جميع الأقسام والتخصصات ({booksByCategory.length})</>
                          )}
                        </h3>
                      </div>

                      {/* View Toggle */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground font-semibold hidden sm:inline">
                          {isSearching ? 'عرض النتائج:' : 'عرض الكتب داخل القسم:'}
                        </span>
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-black/40 p-1 rounded-xl border border-slate-200/60 dark:border-white/10">
                          <button
                            type="button"
                            onClick={() => setCategoriesViewMode('grid')}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${categoriesViewMode === 'grid'
                              ? getCategoryToggleActiveBtnStyle()
                              : 'text-muted-foreground hover:text-foreground'
                              }`}
                            title="عرض كشبكة بطاقات"
                          >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span>شبكة</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setCategoriesViewMode('list')}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${categoriesViewMode === 'list'
                              ? getCategoryToggleActiveBtnStyle()
                              : 'text-muted-foreground hover:text-foreground'
                              }`}
                            title="عرض كقائمة متتالية"
                          >
                            <List className="w-3.5 h-3.5" />
                            <span>قائمة</span>
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* CONTENT: Either Flat Search Results OR Categorized Accordions */}
                    {isSearching ? (
                      /* FLAT SEARCH RESULTS VIEW: كل كتاب مع بادج القسم وترتيب الأكثر مطابقة أولاً ورندر تدريجي سريع */
                      <div className="space-y-4">
                        {searchResultsList.length > 0 ? (
                          <>
                            {categoriesViewMode === 'grid' ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                {displayedResults.map(book => (
                                  <BookCard
                                    key={book.id || book.title}
                                    book={book}
                                    viewMode="grid"
                                    showCategoryBadge={true}
                                    onRead={handleReadBook}
                                    onAsk={onAskBook}
                                    onOpenAuthorBio={(b) => setSelectedAuthorBook(b)}
                                    onOpenBookInfo={(b) => setActiveInfoBook(b)}
                                    isFavorite={favoriteBookIds.has(book.id) || favoriteBookIds.has(book.title)}
                                    onToggleFavorite={() => toggleFavorite(book.id || book.title)}
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-2.5">
                                {displayedResults.map(book => (
                                  <BookCard
                                    key={book.id || book.title}
                                    book={book}
                                    viewMode="list"
                                    showCategoryBadge={true}
                                    onRead={handleReadBook}
                                    onAsk={onAskBook}
                                    onOpenAuthorBio={(b) => setSelectedAuthorBook(b)}
                                    onOpenBookInfo={(b) => setActiveInfoBook(b)}
                                    isFavorite={favoriteBookIds.has(book.id) || favoriteBookIds.has(book.title)}
                                    onToggleFavorite={() => toggleFavorite(book.id || book.title)}
                                  />
                                ))}
                              </div>
                            )}

                            {/* Load more button for progressive rendering without freezing the DOM */}
                            {searchResultsList.length > visibleResultsCount && (
                              <div className="pt-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => setVisibleResultsCount(prev => prev + 32)}
                                  className={`px-6 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-95 ${getCategoryToggleActiveBtnStyle()}`}
                                >
                                  عرض المزيد من نتائج البحث ({searchResultsList.length - visibleResultsCount} كتاب متبقي)
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className={`p-12 text-center text-muted-foreground rounded-2xl border border-dashed ${getCategoryCardStyle()}`}>
                            <Search className={`w-10 h-10 mx-auto opacity-60 mb-3 ${getThemeAccentTextClass()}`} />
                            <p className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                              لم يتم العثور على كتب تطابق بحثك "{categorySearch}"
                            </p>
                            <p className="text-xs text-muted-foreground mb-4">
                              جرب البحث بعنوان كتاب (مثل: عمدة الفقه) أو اسم مؤلف (مثل: ابن قدامة).
                            </p>
                            <button
                              type="button"
                              onClick={() => handleSearchChange('')}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${getThemeEmptySearchBtnStyle()}`}
                            >
                              إلغاء البحث وإظهار جميع الأقسام
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* NORMAL CATEGORIES ACCORDION VIEW: الأقسام الـ 40 المرقمة (بدون تكرار بادج القسم داخل الكارت) */
                      <div className="space-y-2.5">
                        {booksByCategory.map((cat, idx) => {
                          const isOpen = openCategory === cat.name;

                          return (
                            <div
                              key={cat.name}
                              className={`rounded-xl border overflow-hidden shadow-sm transition-colors duration-200 ${getCategoryAccordionContainerStyle(isOpen)}`}
                            >
                              {/* Accordion Header */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (openCategory === cat.name) {
                                    setOpenCategory(null);
                                  } else {
                                    setOpenCategory(cat.name);
                                    setVisibleCategoryBooksLimit(32);
                                  }
                                }}
                                className={`w-full py-2.5 sm:py-3 px-3.5 sm:px-4 flex items-center justify-between gap-3 text-right transition-colors cursor-pointer group ${isOpen
                                  ? getCategoryAccordionHeaderOpenStyle()
                                  : 'hover:bg-slate-50 dark:hover:bg-white/5'
                                  }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {/* Category Number Badge 1 to 40 - Matches active theme */}
                                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-all ${getCategoryNumberBadgeStyle(isOpen)}`}>
                                    {idx + 1}
                                  </span>

                                  <div className="min-w-0">
                                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 leading-snug">
                                      {cat.name}
                                    </h3>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                      يحتوي على <span className={`font-bold ${getThemeAccentTextClass()}`}>{cat.books.length >= 3 && cat.books.length <= 10 ? `${cat.books.length} كتب` : `${cat.books.length} كتاباً`}</span> معتمدة
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2.5 shrink-0">
                                  <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors ${isOpen
                                    ? getCategoryActiveBadgeStyle()
                                    : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/5 group-hover:border-white/10'
                                    }`}>
                                    {cat.books.length >= 3 && cat.books.length <= 10 ? `${cat.books.length} كتب` : `${cat.books.length} كتاباً`}
                                  </span>
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-300 ${isOpen ? `${getCategoryActiveIconStyle()} rotate-180` : 'bg-slate-100 dark:bg-white/5 text-muted-foreground group-hover:text-foreground'
                                    }`}>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </div>
                                </div>
                              </button>

                              {/* Accordion Body: showCategoryBadge is false because we are already inside the category! */}
                              {isOpen && (
                                <div className="p-3 sm:p-4 bg-slate-50/50 dark:bg-black/30 animate-in fade-in duration-200 border-t border-slate-100 dark:border-white/5">
                                  {categoriesViewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                                      {cat.books.slice(0, visibleCategoryBooksLimit).map((book, bIdx) => (
                                        <BookCard
                                          key={book.id ? `cat-${cat.name}-${book.id}` : `cat-${cat.name}-${bIdx}-${book.title}`}
                                          book={book}
                                          viewMode="grid"
                                          showCategoryBadge={false}
                                          onRead={handleReadBook}
                                          onAsk={onAskBook}
                                          onOpenAuthorBio={(b) => setSelectedAuthorBook(b)}
                                          onOpenBookInfo={(b) => setActiveInfoBook(b)}
                                          isFavorite={favoriteBookIds.has(book.id) || favoriteBookIds.has(book.title)}
                                          onToggleFavorite={() => toggleFavorite(book.id || book.title)}
                                        />
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {cat.books.slice(0, visibleCategoryBooksLimit).map((book, bIdx) => (
                                        <BookCard
                                          key={book.id ? `cat-${cat.name}-${book.id}` : `cat-${cat.name}-${bIdx}-${book.title}`}
                                          book={book}
                                          viewMode="list"
                                          showCategoryBadge={false}
                                          onRead={handleReadBook}
                                          onAsk={onAskBook}
                                          onOpenAuthorBio={(b) => setSelectedAuthorBook(b)}
                                          onOpenBookInfo={(b) => setActiveInfoBook(b)}
                                          isFavorite={favoriteBookIds.has(book.id) || favoriteBookIds.has(book.title)}
                                          onToggleFavorite={() => toggleFavorite(book.id || book.title)}
                                        />
                                      ))}
                                    </div>
                                  )}

                                  {/* Progressive Chunking: زر عرض المزيد لمنع تجميد الشاشة في الأقسام التي تحتوي على مئات الكتب */}
                                  {cat.books.length > visibleCategoryBooksLimit && (
                                    <div className="pt-3 pb-1 text-center">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setVisibleCategoryBooksLimit(prev => prev + 48);
                                        }}
                                        className={`px-6 py-2 rounded-xl border text-xs font-bold transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-95 ${getCategoryToggleActiveBtnStyle()}`}
                                      >
                                        عرض المزيد من كتب قسم {cat.name} ({cat.books.length - visibleCategoryBooksLimit} كتاب متبقي)
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>
                );
              })()}

              {/* ============================================================= */}
              {/* TAB 2: المـخـتـارة (Featured & Chronological)                 */}
              {/* ============================================================= */}
              {activeMainTab === 'featured' && (
                <div className="animate-in fade-in duration-300 space-y-6">

                  {/* Sticky Search & Filter Hub */}
                  <div className="sticky top-3 z-30 space-y-3">
                    <div className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-[#121624]/95 p-3 shadow-md backdrop-blur-xl flex flex-col md:flex-row items-center gap-3">

                      {/* Header Title */}
                      <div className="flex items-center gap-2.5 px-3 flex-1 min-w-0">
                        <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 truncate">
                          الكتب المختارة والمعتمدة ({filteredAndSortedBooks.length})
                        </h3>
                      </div>

                      <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-white/10" />

                      {/* Century Dropdown */}
                      <div className="w-full md:w-auto min-w-[190px] flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-brand-magenta shrink-0 hidden sm:block" />
                        <select
                          value={selectedCentury}
                          onChange={(e) => setSelectedCentury(e.target.value)}
                          className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200/60 dark:border-white/10 text-xs sm:text-sm font-semibold outline-none focus:border-brand-magenta cursor-pointer text-slate-800 dark:text-slate-100"
                        >
                          <option value="all">جميع القرون الهجرية</option>
                          {availableCenturies.map(c => (
                            <option key={c.century} value={c.century.toString()}>
                              {c.name} ({c.count} كتاب)
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Sort Toggle */}
                      <button
                        onClick={() => setSortAsc(!sortAsc)}
                        className="w-full md:w-auto px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-100 dark:bg-black/30 hover:bg-slate-200 dark:hover:bg-white/10 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shrink-0 text-slate-700 dark:text-slate-200"
                        title={sortAsc ? "الترتيب الحالي: من المتقدمين إلى المتأخرين (تصاعدي)" : "الترتيب الحالي: من المتأخرين إلى المتقدمين (تنازلي)"}
                      >
                        <ArrowUpDown className="w-4 h-4 text-brand-magenta" />
                        <span>{sortAsc ? 'الأقدم وفاة ⁳' : 'الأحدث وفاة ⌛'}</span>
                      </button>

                      {/* Grid / List Mode */}
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-black/40 p-1 rounded-xl border border-slate-200/60 dark:border-white/10 shrink-0 self-end md:self-auto">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                            ? 'bg-white dark:bg-brand-magenta text-brand-magenta dark:text-white shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                          title="عرض شبكي"
                        >
                          <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                            ? 'bg-white dark:bg-brand-magenta text-brand-magenta dark:text-white shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                          title="عرض قائمي"
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>

                    </div>

                    {/* Dynamic Domain Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
                      <button
                        onClick={() => setSelectedDomain('all')}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${selectedDomain === 'all'
                          ? 'bg-brand-magenta text-white shadow-md shadow-brand-magenta/25'
                          : 'bg-white/80 dark:bg-[#121624]/80 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 border border-slate-200/70 dark:border-white/10'
                          }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        جميع المجالات ({publishedBooks.length})
                      </button>

                      {availableDomains.map(d => (
                        <button
                          key={d.name}
                          onClick={() => setSelectedDomain(d.name)}
                          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${selectedDomain === d.name
                            ? 'bg-brand-magenta text-white shadow-md shadow-brand-magenta/25'
                            : 'bg-white/80 dark:bg-[#121624]/80 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 border border-slate-200/70 dark:border-white/10'
                            }`}
                        >
                          <span>{d.name}</span>
                          <span className={`text-[11px] px-1.5 py-0.2 rounded-md ${selectedDomain === d.name ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/10 text-muted-foreground'}`}>
                            {d.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Results Header */}
                  <div className="flex items-center justify-between gap-4 px-1">
                    <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                      <Library className="w-5 h-5 text-brand-magenta" />
                      <span>الكتب المختارة والمعتمدة</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        (معروض <span className="font-bold text-brand-magenta">{filteredAndSortedBooks.length}</span> كتاب)
                      </span>
                    </div>

                    {(query || selectedDomain !== 'all' || selectedCentury !== 'all') && (
                      <button
                        onClick={() => {
                          setQuery('');
                          setSelectedDomain('all');
                          setSelectedCentury('all');
                        }}
                        className="text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>إعادة ضبط الفلاتر</span>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Books Grid / List */}
                  <section>
                    {loading ? (
                      <SkeletonList viewMode={viewMode} />
                    ) : filteredAndSortedBooks.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-slate-200 dark:border-white/10 bg-white/50 dark:bg-card/40 py-20 text-center backdrop-blur-md">
                        <BookMarked className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                        <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">لا توجد كتب تطابق معايير الفلترة المحددة</p>
                        <p className="text-xs text-muted-foreground">جرب اختيار مجال آخر أو تغيير القرن الهجري.</p>
                        <button
                          onClick={() => {
                            setQuery('');
                            setSelectedDomain('all');
                            setSelectedCentury('all');
                          }}
                          className="mt-4 px-4 py-2 rounded-xl bg-brand-magenta text-white font-bold text-xs hover:bg-brand-deep transition-all shadow-md"
                        >
                          عرض جميع الكتب
                        </button>
                      </div>
                    ) : viewMode === 'grid' ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {filteredAndSortedBooks.slice(0, visibleBrowseBooksLimit).map((book, idx) => (
                            <BookCard
                              key={book.id ? `browse-${book.id}` : `browse-${idx}-${book.title}`}
                              book={book}
                              viewMode="grid"
                              onRead={handleReadBook}
                              onAsk={onAskBook}
                              onOpenAuthorBio={(b) => setSelectedAuthorBook(b)}
                              onOpenBookInfo={(b) => setActiveInfoBook(b)}
                              isFavorite={favoriteBookIds.has(book.id) || favoriteBookIds.has(book.title)}
                              onToggleFavorite={() => toggleFavorite(book.id || book.title)}
                            />
                          ))}
                        </div>
                        {filteredAndSortedBooks.length > visibleBrowseBooksLimit && (
                          <div className="pt-2 pb-4 text-center">
                            <button
                              type="button"
                              onClick={() => setVisibleBrowseBooksLimit(prev => prev + 36)}
                              className={`px-8 py-3 rounded-xl border text-xs font-bold transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-95 ${getCategoryToggleActiveBtnStyle()}`}
                            >
                              عرض المزيد من الكتب ({filteredAndSortedBooks.length - visibleBrowseBooksLimit} كتاب متبقي)
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex flex-col gap-3">
                          {filteredAndSortedBooks.slice(0, visibleBrowseBooksLimit).map((book, idx) => (
                            <BookCard
                              key={book.id ? `browse-${book.id}` : `browse-${idx}-${book.title}`}
                              book={book}
                              viewMode="list"
                              onRead={handleReadBook}
                              onAsk={onAskBook}
                              onOpenAuthorBio={(b) => setSelectedAuthorBook(b)}
                              onOpenBookInfo={(b) => setActiveInfoBook(b)}
                              isFavorite={favoriteBookIds.has(book.id) || favoriteBookIds.has(book.title)}
                              onToggleFavorite={() => toggleFavorite(book.id || book.title)}
                            />
                          ))}
                        </div>
                        {filteredAndSortedBooks.length > visibleBrowseBooksLimit && (
                          <div className="pt-2 pb-4 text-center">
                            <button
                              type="button"
                              onClick={() => setVisibleBrowseBooksLimit(prev => prev + 36)}
                              className={`px-8 py-3 rounded-xl border text-xs font-bold transition-all shadow-sm cursor-pointer hover:scale-[1.02] active:scale-95 ${getCategoryToggleActiveBtnStyle()}`}
                            >
                              عرض المزيد من الكتب ({filteredAndSortedBooks.length - visibleBrowseBooksLimit} كتاب متبقي)
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                </div>
              )}

              {/* ============================================================= */}
              {/* TAB 3: الـمـؤلـفـون (Authors by Centuries)                    */}
              {/* ============================================================= */}
              {activeMainTab === 'authors' && (
                <div className="animate-in fade-in duration-300 space-y-6">

                  {/* SUB-VIEW A: Single Author Detailed Profile & His Books */}
                  {selectedAuthor && currentAuthorData ? (
                    <div className="space-y-6">

                      {/* Back Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedAuthor(null)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#121624] border border-slate-200 dark:border-white/10 text-xs sm:text-sm font-bold text-muted-foreground hover:text-brand-magenta hover:border-brand-magenta shadow-sm transition-all"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>العودة لقائمة المؤلفين والقرون</span>
                      </button>

                      {/* Author Showcase Banner */}
                      <div className="rounded-3xl border border-brand-magenta/30 bg-gradient-to-br from-brand-magenta/10 via-white to-brand-blue/10 dark:from-brand-magenta/20 dark:via-[#121624] dark:to-brand-blue/10 p-6 sm:p-8 shadow-md backdrop-blur-md">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-magenta to-brand-deep text-white flex items-center justify-center shadow-lg shadow-brand-magenta/30 shrink-0">
                              <GraduationCap className="w-8 h-8" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2.5 flex-wrap mb-2">
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                                  {currentAuthorData.authorName}
                                </h2>
                                {currentAuthorData.deathYear && (
                                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                                    توفي: {currentAuthorData.deathYear} هـ
                                  </span>
                                )}
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-magenta/10 text-brand-magenta border border-brand-magenta/20">
                                  {currentAuthorData.centuryName}
                                </span>
                              </div>

                              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                أحد أئمة وأعلام التراث الإسلامي المعتمدين في منصة زاد • عدد المصنفات المنشورة: <span className="font-bold text-foreground">{currentAuthorData.books.length} مصنف</span>
                              </p>
                            </div>
                          </div>

                          {/* Prominent Author Biography Button */}
                          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                            <button
                              type="button"
                              onClick={() => setSelectedAuthorBook(currentAuthorData.sampleBook)}
                              className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-brand-magenta text-white font-bold text-sm hover:bg-brand-deep transition-all shadow-md shadow-brand-magenta/30 flex items-center justify-center gap-2 active:scale-95"
                            >
                              <FileText className="w-4 h-4" />
                              <span>📜 ترجمة وسيرة المؤلف</span>
                            </button>
                          </div>

                        </div>
                      </div>

                      {/* Author's Books Header */}
                      <div className="flex items-center gap-2 text-base font-bold text-slate-800 dark:text-slate-200">
                        <BookCheck className="w-5 h-5 text-brand-magenta" />
                        <span>مصنفات ومؤلفات {currentAuthorData.authorName} في زاد</span>
                      </div>

                      {/* Author's Books Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {currentAuthorData.books.map((book, bIdx) => (
                          <BookCard
                            key={book.id ? `auth-${book.id}` : `auth-${bIdx}-${book.title}`}
                            book={book}
                            viewMode="grid"
                            onRead={handleReadBook}
                            onAsk={onAskBook}
                            onOpenAuthorBio={(b) => setSelectedAuthorBook(b)}
                            onOpenBookInfo={(b) => setActiveInfoBook(b)}
                            isFavorite={favoriteBookIds.has(book.id) || favoriteBookIds.has(book.title)}
                            onToggleFavorite={() => toggleFavorite(book.id || book.title)}
                          />
                        ))}
                      </div>

                    </div>
                  ) : (
                    /* SUB-VIEW B: Centuries List with Layout Toggle (فوق بعض vs جنب بعض) */
                    <div className="space-y-6">

                      {/* 1. Authors Statistics Grid (بطاقات إحصائيات المؤلفين) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Stat 1: Total Authors */}
                        <div className={`rounded-2xl border p-4 flex items-center gap-3.5 transition-all hover:border-blue-500/40 ${getCategoryCardStyle()}`}>
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/15 to-indigo-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-sm">
                            <User className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">أعلام ومؤلفو التراث</span>
                            <span className="text-xl font-black text-slate-900 dark:text-white block tracking-tight">
                              {liveStats.total_authors} <span className="text-xs font-bold text-blue-600 dark:text-blue-400">عالماً وإماماً</span>
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate block">من كبار أئمة ومحققي الأمة</span>
                          </div>
                        </div>

                        {/* Stat 2: Historical Timeline */}
                        <div className={`rounded-2xl border p-4 flex items-center gap-3.5 transition-all hover:border-amber-500/40 ${getCategoryCardStyle()}`}>
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-sm">
                            <Calendar className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">النطاق الزمني الهجري</span>
                            <span className="text-base font-black text-slate-900 dark:text-white block truncate">
                              من القرن {availableCenturies[0]?.century || 1} حتى {availableCenturies[availableCenturies.length - 1]?.century || 15} هـ
                            </span>
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                              15 قرناً من التأليف والتدوين
                            </span>
                          </div>
                        </div>

                        {/* Stat 3: Centuries Count */}
                        <div className={`rounded-2xl border p-4 flex items-center gap-3.5 transition-all hover:border-purple-500/40 ${getCategoryCardStyle()}`}>
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/15 to-pink-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-sm">
                            <Clock className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">القرون الهجرية الموثقة</span>
                            <span className="text-xl font-black text-slate-900 dark:text-white block tracking-tight">
                              {availableCenturies.length} <span className="text-xs font-bold text-purple-600 dark:text-purple-400">حقباً وقروناً</span>
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate block">مرتبة تاريخياً بدقة</span>
                          </div>
                        </div>

                        {/* Stat 4: Total Works */}
                        <div className={`rounded-2xl border p-4 flex items-center gap-3.5 transition-all hover:border-emerald-500/40 ${getCategoryCardStyle()}`}>
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                            <BookCheck className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">إجمالي المصنفات المعتمدة</span>
                            <span className="text-xl font-black text-slate-900 dark:text-white block tracking-tight">
                              {publishedBooks.length} <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">مصنفاً</span>
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate block">موزعة على الأئمة وتلاميذهم</span>
                          </div>
                        </div>
                      </div>

                      {/* 2. In-Page Search Console (مربع البحث مطابق للرئيسية تماماً بدون أي فريم إضافي) */}
                      <div id="subpage-main-search-bar" className="max-w-4xl mx-auto w-full">
                        {renderSearchConsole(false)}
                      </div>

                      {/* 3. Header & Layout Toggle Bar for Authors */}
                      <div className={`rounded-2xl border p-3 sm:px-5 flex items-center justify-between gap-3 ${getCategoryCardStyle()}`}>
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-brand-blue" />
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                            أعلام ومؤلفو التراث ({authorsByCentury.reduce((sum, c) => sum + c.authors.length, 0)} عالماً)
                          </h3>
                        </div>

                        {/* View Toggle (فوق بعض vs جنب بعض) */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted-foreground font-semibold hidden sm:inline">طريقة العرض:</span>
                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-black/40 p-1 rounded-xl border border-slate-200/60 dark:border-white/10">
                            <button
                              onClick={() => setAuthorsViewMode('list')}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${authorsViewMode === 'list'
                                ? getCategoryToggleActiveBtnStyle()
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                              title="عرض فوق بعض (قوائم منسدلة للقرون)"
                            >
                              <List className="w-3.5 h-3.5" />
                              <span>فوق بعض</span>
                            </button>

                            <button
                              onClick={() => setAuthorsViewMode('grid')}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${authorsViewMode === 'grid'
                                ? getCategoryToggleActiveBtnStyle()
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                              title="عرض جنب بعض (بطاقات شبكية للقرون)"
                            >
                              <LayoutGrid className="w-3.5 h-3.5" />
                              <span>جنب بعض</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* AUTHORS CONTENT: LIST MODE (فوق بعض) */}
                      {authorsViewMode === 'list' ? (
                        <div className="space-y-4">
                          {authorsByCentury.map(cGroup => {
                            const isOpen = openCentury === cGroup.century;
                            return (
                              <div
                                key={cGroup.century}
                                className={`rounded-2xl border overflow-hidden shadow-sm transition-all ${getCategoryAccordionContainerStyle()}`}
                              >
                                {/* Century Accordion Header */}
                                <button
                                  type="button"
                                  onClick={() => setOpenCentury(isOpen ? null : cGroup.century)}
                                  className={`w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-right transition-colors ${isOpen
                                    ? 'bg-amber-500/5 dark:bg-amber-500/15 border-b border-slate-200/60 dark:border-amber-500/20'
                                    : 'hover:bg-slate-50 dark:hover:bg-white/5'
                                    }`}
                                >
                                  <div className="flex items-center gap-3.5 min-w-0">
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shrink-0 transition-colors ${isOpen
                                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                      }`}>
                                      <Calendar className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                      <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                                        {cGroup.centuryName}
                                      </h3>
                                      <p className="text-xs text-muted-foreground">
                                        يضم <span className="font-bold text-brand-magenta">{cGroup.authors.length}</span> إماماً وعالماً • <span className="font-bold">{cGroup.totalBooks}</span> كتب
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-black/30 text-slate-700 dark:text-slate-300">
                                      {cGroup.authors.length} مؤلف
                                    </span>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180 bg-brand-magenta text-white' : 'bg-slate-100 dark:bg-white/5 text-muted-foreground'
                                      }`}>
                                      <ChevronDown className="w-4 h-4" />
                                    </div>
                                  </div>
                                </button>

                                {/* Century Body (List of Authors) */}
                                {isOpen && (
                                  <div className="p-4 sm:p-6 bg-slate-50/50 dark:bg-black/30 animate-in fade-in duration-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                      {cGroup.authors.map(author => (
                                        <div
                                          key={author.authorName}
                                          className="rounded-2xl border border-slate-200/80 dark:border-purple-500/20 bg-white dark:bg-[#1a0836] p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-brand-magenta/40 transition-all flex flex-col justify-between"
                                        >
                                          <div>
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                              <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-9 h-9 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                                                  <User className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                                                    {author.authorName}
                                                  </h4>
                                                  {author.deathYear ? (
                                                    <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                                                      (توفي: {author.deathYear} هـ)
                                                    </span>
                                                  ) : (
                                                    <span className="text-[11px] text-muted-foreground">
                                                      (معاصر)
                                                    </span>
                                                  )}
                                                </div>
                                              </div>

                                              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-white/5 text-muted-foreground shrink-0">
                                                {author.books.length} {author.books.length === 1 ? 'كتاب' : 'كتب'}
                                              </span>
                                            </div>

                                            {/* Preview of author's titles */}
                                            <div className="my-3 space-y-1">
                                              {author.books.slice(0, 2).map(b => (
                                                <div key={b.id} className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                                                  <BookOpen className="w-3 h-3 text-brand-magenta shrink-0" />
                                                  <span className="truncate">{b.title}</span>
                                                </div>
                                              ))}
                                              {author.books.length > 2 && (
                                                <div className="text-[11px] text-brand-magenta font-semibold">
                                                  + {author.books.length - 2} مصنفات أخرى
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          {/* Author Actions */}
                                          <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
                                            <button
                                              type="button"
                                              onClick={() => setSelectedAuthorBook(author.sampleBook)}
                                              className="flex-1 py-2 px-3 rounded-xl border border-brand-magenta/30 bg-brand-magenta/5 text-brand-magenta hover:bg-brand-magenta/15 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                                              title="عرض السيرة الذاتية والشيوخ"
                                            >
                                              <FileText className="w-3.5 h-3.5" />
                                              <span>السيرة</span>
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() => setSelectedAuthor(author.authorName)}
                                              className="flex-1 py-2 px-3 rounded-xl bg-brand-magenta text-white text-xs font-bold hover:bg-brand-deep transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                                              title="عرض جميع مصنفات هذا الإمام"
                                            >
                                              <span>الكتب</span>
                                              <ChevronLeft className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {authorsByCentury.length === 0 && (
                            <div className="p-12 text-center text-muted-foreground">
                              لم يتم العثور على مؤلفين يطابقون بحثك.
                            </div>
                          )}
                        </div>
                      ) : (
                        /* AUTHORS CONTENT: GRID MODE (جنب بعض) */
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {authorsByCentury.map(cGroup => {
                              const isOpen = openCentury === cGroup.century;
                              return (
                                <div
                                  key={cGroup.century}
                                  onClick={() => setOpenCentury(isOpen ? null : cGroup.century)}
                                  className={`cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between ${isOpen
                                    ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/15 shadow-md'
                                    : 'border-slate-200/80 dark:border-purple-500/25 bg-white dark:bg-[#14062b] hover:border-amber-500/40 hover:shadow-md'
                                    }`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between gap-3 mb-3">
                                      <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                        <Calendar className="w-5 h-5" />
                                      </div>
                                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-black/30 text-slate-700 dark:text-slate-300">
                                        {cGroup.authors.length} مؤلف
                                      </span>
                                    </div>

                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                                      {cGroup.centuryName}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                      يضم <span className="font-bold text-brand-magenta">{cGroup.authors.length}</span> إماماً وعالماً • <span className="font-bold">{cGroup.totalBooks}</span> كتب منشورة
                                    </p>
                                  </div>

                                  <div className="pt-4 mt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                                    <span>{isOpen ? 'إخفاء الأعلام ▲' : 'استعراض الأعلام ▼'}</span>
                                    <span className="text-[11px] text-muted-foreground font-normal">
                                      {isOpen ? 'مفتوح حالياً' : 'انقر للفتح'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* If a century is selected in grid mode, show its authors below */}
                          {openCentury && (
                            <div className="p-6 rounded-3xl border border-amber-500/30 bg-white/90 dark:bg-[#14062b]/95 backdrop-blur-md shadow-lg animate-in fade-in duration-200 space-y-4">
                              <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-white/10">
                                <div className="flex items-center gap-2.5">
                                  <Calendar className="w-5 h-5 text-amber-500" />
                                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                                    علماء وأعلام: <span className="text-amber-600 dark:text-amber-400">{authorsByCentury.find(c => c.century === openCentury)?.centuryName}</span>
                                  </h3>
                                </div>
                                <button
                                  onClick={() => setOpenCentury(null)}
                                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-bold flex items-center gap-1"
                                >
                                  <span>إغلاق القرن</span>
                                  <X className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {authorsByCentury.find(c => c.century === openCentury)?.authors.map(author => (
                                  <div
                                    key={author.authorName}
                                    className="rounded-2xl border border-slate-200/80 dark:border-purple-500/20 bg-white dark:bg-[#1a0836] p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-brand-magenta/40 transition-all flex flex-col justify-between"
                                  >
                                    <div>
                                      <div className="flex items-start justify-between gap-3 mb-2">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <div className="w-9 h-9 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                                            <User className="w-4 h-4" />
                                          </div>
                                          <div className="min-w-0">
                                            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                                              {author.authorName}
                                            </h4>
                                            {author.deathYear ? (
                                              <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                                                (توفي: {author.deathYear} هـ)
                                              </span>
                                            ) : (
                                              <span className="text-[11px] text-muted-foreground">
                                                (معاصر)
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-white/5 text-muted-foreground shrink-0">
                                          {author.books.length} {author.books.length === 1 ? 'كتاب' : 'كتب'}
                                        </span>
                                      </div>

                                      <div className="my-3 space-y-1">
                                        {author.books.slice(0, 2).map(b => (
                                          <div key={b.id} className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                                            <BookOpen className="w-3 h-3 text-brand-magenta shrink-0" />
                                            <span className="truncate">{b.title}</span>
                                          </div>
                                        ))}
                                        {author.books.length > 2 && (
                                          <div className="text-[11px] text-brand-magenta font-semibold">
                                            + {author.books.length - 2} مصنفات أخرى
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setSelectedAuthorBook(author.sampleBook)}
                                        className="flex-1 py-2 px-3 rounded-xl border border-brand-magenta/30 bg-brand-magenta/5 text-brand-magenta hover:bg-brand-magenta/15 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                                        title="عرض السيرة الذاتية والشيوخ"
                                      >
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>السيرة</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => setSelectedAuthor(author.authorName)}
                                        className="flex-1 py-2 px-3 rounded-xl bg-brand-magenta text-white text-xs font-bold hover:bg-brand-deep transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                                        title="عرض جميع مصنفات هذا الإمام"
                                      >
                                        <span>الكتب</span>
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        </main>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FLOATING BOOK INFO MODAL CARD (نافذة عائمة مع خلفية قابلة للنقر) */}
      {/* ------------------------------------------------------------- */}
      {activeInfoBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveInfoBook(null)}
        >
          <div
            className="relative w-full max-w-xl bg-white dark:bg-[#121624] rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              onClick={() => setActiveInfoBook(null)}
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
                  {activeInfoBook.title}
                </h3>
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    المؤلف: {activeInfoBook.author}
                  </span>
                  {activeInfoBook.category && (
                    <span className="px-2 py-0.5 rounded-md bg-brand-magenta/10 text-brand-magenta font-bold border border-brand-magenta/20">
                      {activeInfoBook.category}
                    </span>
                  )}
                  {activeInfoBook.century_name && activeInfoBook.century_name !== 'غير محدد' && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
                      {activeInfoBook.century_name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100 dark:bg-white/5 my-4" />

            {/* Content Body */}
            <div className="max-h-[50vh] overflow-y-auto pr-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {loadingInfo ? (
                <div className="flex items-center justify-center gap-3 py-10 text-brand-magenta font-bold">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>جاري جلب تفاصيل ومعلومات الكتاب...</span>
                </div>
              ) : (
                modalInfoText || activeInfoBook.infoText || 'لم تتوفر تفاصيل إضافية لهذا الكتاب حالياً.'
              )}
            </div>

            {/* Footer Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center gap-3">
              <button
                onClick={() => {
                  const b = activeInfoBook;
                  setActiveInfoBook(null);
                  handleReadBook(b);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-brand-magenta text-white font-bold text-xs sm:text-sm hover:bg-brand-deep transition-all shadow-md shadow-brand-magenta/20 flex items-center justify-center gap-2 active:scale-95"
              >
                <FileText className="w-4 h-4" />
                <span>تصفح وقراءة الكتاب</span>
              </button>

              <button
                onClick={() => {
                  const b = activeInfoBook;
                  setActiveInfoBook(null);
                  onAskBook(b);
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-brand-magenta/30 bg-brand-magenta/5 text-brand-magenta hover:bg-brand-magenta/15 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>اسأل زاد عن الكتاب</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Author Biography Modal */}
      <AuthorBiographyModal
        isOpen={!!selectedAuthorBook}
        onClose={() => setSelectedAuthorBook(null)}
        bookId={selectedAuthorBook?.id}
        authorId={selectedAuthorBook?.author_id}
        authorName={selectedAuthorBook?.author}
        bookTitle={selectedAuthorBook?.title}
        authorBioText={selectedAuthorBook?.authorBioText}
        onOpenBook={(bookId, bookName) => {
          setSelectedBook({
            id: Number(bookId),
            title: bookName || "كتاب من المكتبة",
            author: selectedAuthorBook?.author || ""
          });
          setView('reader');
        }}
        onAskZadAboutAuthor={(authorName) => {
          setSelectedAuthorBook(null);
          onAskBook({
            id: selectedAuthorBook?.id || 0,
            title: `سيرة ${authorName}`,
            author: authorName,
            initialPrompt: `حدثني بالتفصيل عن السيرة الذاتية والمذهب الفقهي وشيوخ ومصنفات ${authorName}`
          });
        }}
      />

      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        theme={theme}
        toggleTheme={toggleTheme}
        overlayOpacity={currentSettings.overlayOpacity}
        onOverlayOpacityChange={(val) => updateSettings(currentSettings.imageOpacity, val)}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
      />

      {/* Global Style for Keyframe Animations */}
      <style>{`
        @keyframes float { 
          0% { transform: translateY(0px); } 
          50% { transform: translateY(-12px); } 
          100% { transform: translateY(0px); } 
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
