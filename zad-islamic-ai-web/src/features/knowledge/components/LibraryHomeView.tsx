import React, { useRef, useState, useEffect } from 'react';
import {
  BookOpen,
  Layers,
  User,
  Sparkles,
  Video,
  GraduationCap,
  Heart,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Play,
  Pause,
  FileText,
  Clock,
  Compass,
  Scale,
  HeartHandshake,
  BookOpenText,
  Languages,
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import IslamicPattern from './IslamicPattern';
import HomeChartsSection from './HomeChartsSection';
import { useTheme } from '../../../contexts/ThemeContext';

export interface DomainItem {
  name: string;
  count: number;
  id?: string;
}

export interface ProminentAuthor {
  name: string;
  death: string;
}

export const PROMINENT_AUTHORS: ProminentAuthor[] = [
  { name: 'ابن تيمية', death: 'ت 728 هـ' },
  { name: 'البخاري', death: 'ت 256 هـ' },
  { name: 'الشيخ ياسر برهامي', death: 'حفظه الله' },
  { name: 'النووي', death: 'ت 676 هـ' },
  { name: 'ابن القيم', death: 'ت 751 هـ' },
  { name: 'الشيخ محمد إسماعيل المقدم', death: 'حفظه الله' },
  { name: 'ابن كثير', death: 'ت 774 هـ' },
  { name: 'الذهبي', death: 'ت 748 هـ' },
  { name: 'ابن حجر العسقلاني', death: 'ت 852 هـ' },
  { name: 'الشافعي', death: 'ت 204 هـ' },
  { name: 'مالك بن أنس', death: 'ت 179 هـ' },
  { name: 'أحمد بن حنبل', death: 'ت 241 هـ' },
  { name: 'الطبري', death: 'ت 310 هـ' },
  { name: 'ابن قدامة', death: 'ت 620 هـ' },
  { name: 'القرطبي', death: 'ت 671 هـ' },
  { name: 'السيوطي', death: 'ت 911 هـ' },
  { name: 'ابن الجوزي', death: 'ت 597 هـ' },
];

interface LibraryHomeViewProps {
  recentBook: any | null;
  featuredBooks: any[];
  liveStats: {
    total_books: number;
    total_authors: number;
    total_domains: number;
    timeline?: {
      earliest_century?: number;
      latest_century?: number;
    };
  };
  availableDomains?: DomainItem[];
  selectedDomain?: string;
  onSelectDomain?: (domainName: string) => void;
  availableAuthors?: { name: string; count: number }[];
  onSelectAuthor?: (authorName: string) => void;
  favoritesCount: number;
  onNavigateTab: (tab: 'categories' | 'authors' | 'featured' | 'media' | 'favorites' | 'courses') => void;
  onReadBook: (book: any) => void;
  onOpenLinkedBook?: (bookTitle: string) => void;
}

export default function LibraryHomeView({
  recentBook,
  featuredBooks,
  liveStats,
  availableDomains = [],
  selectedDomain = 'all',
  onSelectDomain,
  availableAuthors = [],
  onSelectAuthor,
  favoritesCount,
  onNavigateTab,
  onReadBook,
  onOpenLinkedBook
}: LibraryHomeViewProps) {
  // Default main domains when no books are published yet
  const displayDomains = availableDomains.length > 0 ? availableDomains : [
    { name: 'العقيدة الإسلامية', count: 0 },
    { name: 'الفقه وأصوله', count: 0 },
    { name: 'الحديث الشريف', count: 0 },
    { name: 'علوم القرآن والتفسير', count: 0 },
  ];

  // Dynamic loop multiplier so cards stream seamlessly across the entire monitor width
  const loopMultiplier = Math.max(3, Math.ceil(24 / Math.max(1, displayDomains.length)));
  const loopedDomains = Array.from({ length: loopMultiplier }, () => displayDomains).flat();

  const domainsScrollRef = useRef<HTMLDivElement>(null);
  const { isDark, accentColor } = useTheme();

  // Auto-Scroll State and Interaction Refs
  const [isAutoScrollActive, setIsAutoScrollActive] = useState(true);
  const isHoveredRef = useRef(false);
  const isUserInteractingRef = useRef(false);
  const userInteractionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Smooth Infinite Auto-Scroll Loop
  useEffect(() => {
    if (!isAutoScrollActive) return;
    const el = domainsScrollRef.current;
    if (!el) return;

    let animId: number;
    let lastTime = performance.now();
    const scrollSpeed = 0.55; // Pixels per frame (~33px/sec, buttery smooth and readable)

    const step = (time: number) => {
      const delta = Math.min(time - lastTime, 40);
      lastTime = time;

      if (!isHoveredRef.current && !isUserInteractingRef.current && el) {
        // Calculate the width of one single cycle of the looped domains list
        const singleSetWidth = el.scrollWidth / loopMultiplier;
        const currentScroll = Math.abs(el.scrollLeft);

        // Scroll smoothly towards left in RTL
        el.scrollBy({ left: -scrollSpeed * (delta / 16), behavior: 'auto' });

        // When scrolled past one full loop set, reset seamlessly to start
        if (currentScroll >= singleSetWidth) {
          el.scrollLeft = 0;
        }
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(animId);
      if (userInteractionTimeoutRef.current) clearTimeout(userInteractionTimeoutRef.current);
    };
  }, [isAutoScrollActive, displayDomains.length, loopMultiplier]);

  // Scroll handler for horizontal domains list
  const scrollDomains = (direction: 'left' | 'right') => {
    // Pause auto-scroll briefly when user clicks arrow buttons
    isUserInteractingRef.current = true;
    if (userInteractionTimeoutRef.current) clearTimeout(userInteractionTimeoutRef.current);
    userInteractionTimeoutRef.current = setTimeout(() => {
      isUserInteractingRef.current = false;
    }, 2500);

    if (domainsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      domainsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // =========================================================================
  // PROMINENT AUTHORS AUTO-SCROLL LOOP & CONTROLS
  // =========================================================================
  const authorsLoopMultiplier = Math.max(3, Math.ceil(24 / Math.max(1, PROMINENT_AUTHORS.length)));
  const loopedAuthors = Array.from({ length: authorsLoopMultiplier }, () => PROMINENT_AUTHORS).flat();

  const authorsScrollRef = useRef<HTMLDivElement>(null);
  const isAuthorsHoveredRef = useRef(false);
  const isAuthorsUserInteractingRef = useRef(false);
  const authorsUserInteractionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const el = authorsScrollRef.current;
    if (!el) return;

    let animId: number;
    let lastTime = performance.now();
    const scrollSpeed = 0.55; // Buttery smooth scroll rate

    const step = (time: number) => {
      const delta = Math.min(time - lastTime, 40);
      lastTime = time;

      if (!isAuthorsHoveredRef.current && !isAuthorsUserInteractingRef.current && el) {
        const singleSetWidth = el.scrollWidth / authorsLoopMultiplier;
        const currentScroll = Math.abs(el.scrollLeft);

        // Scroll smoothly towards left in RTL
        el.scrollBy({ left: -scrollSpeed * (delta / 16), behavior: 'auto' });

        if (currentScroll >= singleSetWidth) {
          el.scrollLeft = 0;
        }
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(animId);
      if (authorsUserInteractionTimeoutRef.current) clearTimeout(authorsUserInteractionTimeoutRef.current);
    };
  }, [authorsLoopMultiplier]);

  const scrollAuthors = (direction: 'left' | 'right') => {
    isAuthorsUserInteractingRef.current = true;
    if (authorsUserInteractionTimeoutRef.current) clearTimeout(authorsUserInteractionTimeoutRef.current);
    authorsUserInteractionTimeoutRef.current = setTimeout(() => {
      isAuthorsUserInteractingRef.current = false;
    }, 2500);

    if (authorsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      authorsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getAuthorBookCount = (authorName: string): number => {
    if (!availableAuthors || availableAuthors.length === 0) return 0;
    const clean = authorName.replace(/^(الشيخ|الدكتور|د\.)\s+/, '').trim();
    const found = availableAuthors.find(a =>
      a.name === authorName ||
      a.name.includes(clean) ||
      clean.includes(a.name)
    );
    return found?.count || 0;
  };

  const handleAuthorCardClick = (authorName: string) => {
    if (onSelectAuthor) {
      onSelectAuthor(authorName);
    } else {
      onNavigateTab('authors');
    }
  };

  // Theme styling helpers
  const getHeaderSparkleStyle = () => {
    switch (accentColor) {
      case 'amber':
        return 'bg-[#dfbf83]/15 text-[#8a652a] dark:text-[#eed8ad]';
      case 'emerald':
        return 'bg-teal-500/15 text-teal-600 dark:text-teal-400';
      case 'blue':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400';
      case 'purple':
      default:
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-400';
    }
  };

  const getHeaderUnderlineStyle = () => {
    switch (accentColor) {
      case 'amber':
        return 'bg-gradient-to-l from-[#8e682d] via-[#dfbf83] to-[#eed8ae]';
      case 'emerald':
        return 'bg-gradient-to-l from-teal-700 via-teal-500 to-emerald-400';
      case 'blue':
        return 'bg-gradient-to-l from-blue-700 via-blue-500 to-sky-400';
      case 'purple':
      default:
        return 'bg-gradient-to-l from-purple-600 via-brand-magenta to-purple-400';
    }
  };

  const getNavControlButtonStyle = () => {
    return 'bg-white/90 dark:bg-[#131620]/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 shadow-sm';
  };

  const getViewAllCategoriesButtonStyle = () => {
    switch (accentColor) {
      case 'amber':
        return 'bg-[#dfbf83]/15 hover:bg-[#dfbf83] hover:text-stone-950 text-[#8a652a] dark:text-[#eed8ad]';
      case 'emerald':
        return 'bg-teal-500/15 hover:bg-teal-500 hover:text-white text-teal-700 dark:text-teal-300';
      case 'blue':
        return 'bg-blue-500/15 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-300';
      case 'purple':
      default:
        return 'bg-purple-500/15 hover:bg-brand-magenta hover:text-white text-purple-600 dark:text-purple-300';
    }
  };

  const getDomainGlowStyle = (domainName: string) => {
    const lower = domainName.toLowerCase();
    if (lower.includes('عقيدة') || lower.includes('توحيد')) {
      return 'group-hover:shadow-[0_0_24px_rgba(244,63,94,0.35)]';
    }
    if (lower.includes('فقه') || lower.includes('مذهب') || lower.includes('فتاوى') || lower.includes('قضاء')) {
      return 'group-hover:shadow-[0_0_24px_rgba(16,185,129,0.35)]';
    }
    if (lower.includes('حديث') || lower.includes('سنة') || lower.includes('أثر') || lower.includes('صحاح')) {
      return 'group-hover:shadow-[0_0_24px_rgba(59,130,246,0.35)]';
    }
    if (lower.includes('قرآن') || lower.includes('تفسير') || lower.includes('قراءات')) {
      return 'group-hover:shadow-[0_0_24px_rgba(245,158,11,0.35)]';
    }
    if (lower.includes('لغة') || lower.includes('نحو') || lower.includes('صرف') || lower.includes('أدب')) {
      return 'group-hover:shadow-[0_0_24px_rgba(20,184,166,0.35)]';
    }
    if (lower.includes('سيرة') || lower.includes('تاريخ') || lower.includes('تراجم')) {
      return 'group-hover:shadow-[0_0_24px_rgba(99,102,241,0.35)]';
    }
    return 'group-hover:shadow-[0_0_24px_rgba(217,119,6,0.35)]';
  };

  const getDomainCardStyle = (isSelected: boolean) => {
    if (isDark) {
      switch (accentColor) {
        case 'amber':
          return isSelected
            ? 'bg-gradient-to-b from-[#1c1914] to-[#120e0a] border-2 border-[#dfbf83] shadow-[0_15px_35px_rgba(223,191,131,0.25)] scale-[1.02]'
            : 'bg-gradient-to-b from-[#151824]/90 to-[#0d101a]/95 border border-white/10 hover:border-[#dfbf83]/70 hover:shadow-[0_18px_40px_rgba(223,191,131,0.20)] hover:-translate-y-2';
        case 'emerald':
          return isSelected
            ? 'bg-gradient-to-b from-[#0b1c18] to-[#081310] border-2 border-teal-400 shadow-[0_15px_35px_rgba(20,184,166,0.25)] scale-[1.02]'
            : 'bg-gradient-to-b from-[#151824]/90 to-[#0d101a]/95 border border-white/10 hover:border-teal-400/70 hover:shadow-[0_18px_40px_rgba(20,184,166,0.20)] hover:-translate-y-2';
        case 'blue':
          return isSelected
            ? 'bg-gradient-to-b from-[#0d182b] to-[#080f1c] border-2 border-blue-400 shadow-[0_15px_35px_rgba(59,130,246,0.25)] scale-[1.02]'
            : 'bg-gradient-to-b from-[#151824]/90 to-[#0d101a]/95 border border-white/10 hover:border-blue-400/70 hover:shadow-[0_18px_40px_rgba(59,130,246,0.20)] hover:-translate-y-2';
        case 'purple':
        default:
          return isSelected
            ? 'bg-gradient-to-b from-[#1a112c] to-[#0f091c] border-2 border-purple-400 shadow-[0_15px_35px_rgba(168,85,247,0.25)] scale-[1.02]'
            : 'bg-gradient-to-b from-[#151824]/90 to-[#0d101a]/95 border border-white/10 hover:border-purple-400/70 hover:shadow-[0_18px_40px_rgba(168,85,247,0.20)] hover:-translate-y-2';
      }
    } else {
      switch (accentColor) {
        case 'amber':
          return isSelected
            ? 'bg-gradient-to-b from-white to-[#fdfbf7] border-2 border-[#b88d46] shadow-[0_12px_30px_rgba(184,141,70,0.18)] scale-[1.02]'
            : 'bg-gradient-to-b from-white/95 to-[#fcfbf9]/95 border border-[#ebd9b5] shadow-sm hover:shadow-[0_18px_35px_rgba(184,141,70,0.18)] hover:border-[#b88d46] hover:-translate-y-2';
        case 'emerald':
          return isSelected
            ? 'bg-gradient-to-b from-white to-[#f7fdfc] border-2 border-teal-600 shadow-[0_12px_30px_rgba(13,148,136,0.18)] scale-[1.02]'
            : 'bg-gradient-to-b from-white/95 to-[#f7fdfc]/95 border border-teal-200/90 shadow-sm hover:shadow-[0_18px_35px_rgba(13,148,136,0.18)] hover:border-teal-500 hover:-translate-y-2';
        case 'blue':
          return isSelected
            ? 'bg-gradient-to-b from-white to-[#f7faff] border-2 border-blue-600 shadow-[0_12px_30px_rgba(37,99,235,0.18)] scale-[1.02]'
            : 'bg-gradient-to-b from-white/95 to-[#f8faff]/95 border border-blue-200/90 shadow-sm hover:shadow-[0_18px_35px_rgba(37,99,235,0.18)] hover:border-blue-500 hover:-translate-y-2';
        case 'purple':
        default:
          return isSelected
            ? 'bg-gradient-to-b from-white to-[#faf7ff] border-2 border-purple-500 shadow-[0_12px_30px_rgba(168,85,247,0.18)] scale-[1.02]'
            : 'bg-gradient-to-b from-white/95 to-[#faf7ff]/95 border border-purple-200/90 shadow-sm hover:shadow-[0_18px_35px_rgba(168,85,247,0.18)] hover:border-purple-400 hover:-translate-y-2';
      }
    }
  };

  const getDomainTitleStyle = (isSelected: boolean) => {
    switch (accentColor) {
      case 'amber':
        return isSelected
          ? 'text-[#8a652a] dark:text-[#eed8ad]'
          : 'text-slate-800 dark:text-white group-hover:text-[#b88d46] dark:group-hover:text-[#dfbf83]';
      case 'emerald':
        return isSelected
          ? 'text-teal-600 dark:text-teal-400'
          : 'text-slate-800 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400';
      case 'blue':
        return isSelected
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400';
      case 'purple':
      default:
        return isSelected
          ? 'text-purple-600 dark:text-purple-400'
          : 'text-slate-800 dark:text-white group-hover:text-purple-600';
    }
  };

  const getDomainLinkHoverStyle = () => {
    switch (accentColor) {
      case 'amber':
        return 'group-hover:text-[#b88d46] dark:group-hover:text-[#dfbf83]';
      case 'emerald':
        return 'group-hover:text-teal-600 dark:group-hover:text-teal-400';
      case 'blue':
        return 'group-hover:text-blue-600 dark:group-hover:text-blue-400';
      case 'purple':
      default:
        return 'group-hover:text-purple-600 dark:group-hover:text-purple-400';
    }
  };

  const getFeaturedBookCardStyle = () => {
    if (isDark) {
      return 'border border-white/10 bg-[#131620]/90 hover:bg-[#181c28] shadow-lg shadow-black/20';
    }
    return 'border border-slate-200/80 bg-white/90';
  };

  const getFeaturedBookButtonStyle = () => {
    switch (accentColor) {
      case 'amber':
        return 'bg-[#dfbf83]/15 hover:bg-[#dfbf83] hover:text-stone-950 text-[#8a652a] dark:text-[#eed8ad]';
      case 'emerald':
        return 'bg-teal-500/15 hover:bg-teal-500 hover:text-white text-teal-700 dark:text-teal-300';
      case 'blue':
        return 'bg-blue-500/15 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-300';
      case 'purple':
      default:
        return 'bg-brand-magenta/10 hover:bg-brand-magenta hover:text-white text-brand-magenta';
    }
  };

  // Helper to get domain-specific icon and theme colors
  const getDomainStyle = (domainName: string) => {
    const lower = domainName.toLowerCase();

    if (lower.includes('عقيدة') || lower.includes('توحيد')) {
      return {
        icon: <Heart className="w-7 h-7 text-rose-500 dark:text-rose-400" />,
        bgColor: 'bg-rose-500/10'
      };
    }
    if (lower.includes('فقه') || lower.includes('مذهب') || lower.includes('فتاوى') || lower.includes('قضاء')) {
      return {
        icon: <Scale className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />,
        bgColor: 'bg-emerald-500/10'
      };
    }
    if (lower.includes('حديث') || lower.includes('سنة') || lower.includes('أثر') || lower.includes('صحاح')) {
      return {
        icon: <BookOpen className="w-7 h-7 text-blue-600 dark:text-blue-400" />,
        bgColor: 'bg-blue-500/10'
      };
    }
    if (lower.includes('قرآن') || lower.includes('تفسير') || lower.includes('قراءات')) {
      return {
        icon: <Sparkles className="w-7 h-7 text-amber-500 dark:text-amber-400" />,
        bgColor: 'bg-amber-500/10'
      };
    }
    if (lower.includes('لغة') || lower.includes('نحو') || lower.includes('صرف') || lower.includes('أدب')) {
      return {
        icon: <Languages className="w-7 h-7 text-teal-600 dark:text-teal-400" />,
        bgColor: 'bg-teal-500/10'
      };
    }
    if (lower.includes('سيرة') || lower.includes('تاريخ') || lower.includes('تراجم')) {
      return {
        icon: <Clock className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />,
        bgColor: 'bg-indigo-500/10'
      };
    }

    return {
      icon: <Layers className="w-7 h-7 text-amber-500 dark:text-amber-400" />,
      bgColor: 'bg-amber-500/10'
    };
  };

  const handleDomainCardClick = (domainName: string) => {
    if (onSelectDomain) {
      onSelectDomain(domainName);
    }
    onNavigateTab('categories');
  };

  return (
    <div className="relative animate-in fade-in duration-300 space-y-12">

      {/* ========================================================================= */}
      {/* 1. DOMAINS SECTION: Title + Full-Width Line + Infinite Moving Cards       */}
      {/* ========================================================================= */}
      <section id="library-domains-section" className="relative z-10 space-y-5 scroll-mt-6">
        {/* Title and Controls */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="inline-flex flex-col items-start">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${getHeaderSparkleStyle()}`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                المجالات والعلوم الشرعية
              </h2>
            </div>
            {/* الخط ممتد تحت الجملة كاملة ويتناسق مع السمة */}
            <div className={`w-full h-1.5 rounded-full mt-2 shadow-sm ${getHeaderUnderlineStyle()}`} />
          </div>

          {/* Navigation Controls: Direction Buttons & View All */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollDomains('right')}
              className={`w-9 h-9 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer active:scale-95 ${getNavControlButtonStyle()}`}
              title="التمرير لليمين"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollDomains('left')}
              className={`w-9 h-9 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer active:scale-95 ${getNavControlButtonStyle()}`}
              title="التمرير لليسار"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('categories')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 mr-2 cursor-pointer ${getViewAllCategoriesButtonStyle()}`}
            >
              <span>عرض كل الأقسام ({displayDomains.length})</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Carousel Outer Wrapper - Full Bleed Screen Width (يمتد عبر عرض الشاشة بالكامل متماثلاً تماماً يميناً ويساراً) */}
        <div 
          className="relative group/carousel overflow-hidden py-2"
          style={{
            width: '100vw',
            marginLeft: 'calc(50% - 50vw)',
            marginRight: 'calc(50% - 50vw)',
          }}
          onMouseEnter={() => { isHoveredRef.current = true; }}
          onMouseLeave={() => { isHoveredRef.current = false; }}
          onTouchStart={() => {
            isUserInteractingRef.current = true;
            if (userInteractionTimeoutRef.current) clearTimeout(userInteractionTimeoutRef.current);
          }}
          onTouchEnd={() => {
            userInteractionTimeoutRef.current = setTimeout(() => {
              isUserInteractingRef.current = false;
            }, 2500);
          }}
        >
          {/* Right Fog Mask (حافة الدخول - ضباب بلوري متداخل مع الخلفية الإسلامية) */}
          <div 
            className="absolute right-0 top-0 bottom-4 w-20 sm:w-36 pointer-events-none z-20"
            style={{
              background: isDark
                ? 'linear-gradient(to left, rgba(12, 14, 20, 0.75) 0%, rgba(12, 14, 20, 0.3) 60%, transparent 100%)'
                : 'linear-gradient(to left, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.35) 60%, transparent 100%)',
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
              maskImage: 'linear-gradient(to left, black 25%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to left, black 25%, transparent 100%)',
            }}
          />

          {/* Left Fog Mask (حافة الخروج - ضباب بلوري متداخل مع الخلفية الإسلامية) */}
          <div 
            className="absolute left-0 top-0 bottom-4 w-20 sm:w-36 pointer-events-none z-20"
            style={{
              background: isDark
                ? 'linear-gradient(to right, rgba(12, 14, 20, 0.75) 0%, rgba(12, 14, 20, 0.3) 60%, transparent 100%)'
                : 'linear-gradient(to right, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.35) 60%, transparent 100%)',
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
              maskImage: 'linear-gradient(to right, black 25%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, black 25%, transparent 100%)',
            }}
          />

          {/* Cards Scroll Container (انزلاق لا نهائي مع تلاشٍ تدريجي عند الحافتين يبرز الزخرفة الإسلامية بالخلفية) */}
          <div
            ref={domainsScrollRef}
            className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-6 pt-3 px-6 sm:px-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 120px, black calc(100% - 120px), transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 120px, black calc(100% - 120px), transparent 100%)',
            }}
          >
            {loopedDomains.map((domain, idx) => {
              const style = getDomainStyle(domain.name);
              const isSelected = selectedDomain === domain.name;
              const staggerDelay = Math.min(idx * 110, 1100);

              return (
                <div
                  key={`${domain.name}-${idx}`}
                  onClick={() => handleDomainCardClick(domain.name)}
                  style={{
                    animationDelay: `${staggerDelay}ms`,
                  }}
                  className={`animate-card-entrance relative group cursor-pointer shrink-0 w-[205px] sm:w-[235px] min-h-[165px] rounded-[2rem] p-5 sm:p-6 transition-all duration-500 flex flex-col items-center justify-between text-center select-none overflow-hidden backdrop-blur-xl ${getDomainCardStyle(isSelected)}`}
                >
                  {/* Domain Title & Count Pill Badge */}
                  <div className="w-full my-auto flex flex-col items-center gap-2.5">
                    <h3 className={`font-black text-sm sm:text-base leading-snug truncate w-full transition-colors font-tajawal ${getDomainTitleStyle(isSelected)}`}>
                      {domain.name}
                    </h3>
                    
                    {/* Chic Pill Badge for Book Count */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-tajawal bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/10 text-muted-foreground group-hover:border-current/30 transition-colors">
                      <BookOpen className="w-3 h-3 opacity-70" />
                      <span>{domain.count} مصنفاً</span>
                    </div>
                  </div>

                  {/* Action Sublink with Dynamic Arrow: "استكشف الكتب" */}
                  <div className={`pt-3 border-t border-slate-100 dark:border-white/5 w-full flex items-center justify-center gap-2 text-xs font-bold transition-all duration-300 ${getDomainLinkHoverStyle()}`}>
                    <span>استكشف الكتب</span>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-black/[0.03] dark:bg-white/[0.06] group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PROMINENT SCHOLARS SECTION: Title + Full-Width Line + Infinite Moving Cards */}
      {/* ========================================================================= */}
      <section id="library-authors-section" className="relative z-10 space-y-5 scroll-mt-6">
        {/* Title and Controls */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="inline-flex flex-col items-start">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${getHeaderSparkleStyle()}`}>
                <GraduationCap className="w-4 h-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                من أبرز علماء المكتبة
              </h2>
            </div>
            {/* الخط ممتد تحت الجملة كاملة ويتناسق مع السمة */}
            <div className={`w-full h-1.5 rounded-full mt-2 shadow-sm ${getHeaderUnderlineStyle()}`} />
          </div>

          {/* Navigation Controls: Direction Buttons & View All */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollAuthors('right')}
              className={`w-9 h-9 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer active:scale-95 ${getNavControlButtonStyle()}`}
              title="التمرير لليمين"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollAuthors('left')}
              className={`w-9 h-9 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer active:scale-95 ${getNavControlButtonStyle()}`}
              title="التمرير لليسار"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('authors')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 mr-2 cursor-pointer ${getViewAllCategoriesButtonStyle()}`}
            >
              <span>عرض كل المؤلفين ({liveStats?.total_authors || (availableAuthors?.length || 0)})</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Carousel Outer Wrapper - Full Bleed Screen Width (يمتد عبر عرض الشاشة بالكامل مع الضباب الإسلامي) */}
        <div 
          className="relative group/carousel overflow-hidden py-2"
          style={{
            width: '100vw',
            marginLeft: 'calc(50% - 50vw)',
            marginRight: 'calc(50% - 50vw)',
          }}
          onMouseEnter={() => { isAuthorsHoveredRef.current = true; }}
          onMouseLeave={() => { isAuthorsHoveredRef.current = false; }}
          onTouchStart={() => {
            isAuthorsUserInteractingRef.current = true;
            if (authorsUserInteractionTimeoutRef.current) clearTimeout(authorsUserInteractionTimeoutRef.current);
          }}
          onTouchEnd={() => {
            authorsUserInteractionTimeoutRef.current = setTimeout(() => {
              isAuthorsUserInteractingRef.current = false;
            }, 2500);
          }}
        >
          {/* Right Fog Mask (حافة الدخول - ضباب بلوري متداخل مع الخلفية الإسلامية) */}
          <div 
            className="absolute right-0 top-0 bottom-4 w-20 sm:w-36 pointer-events-none z-20"
            style={{
              background: isDark
                ? 'linear-gradient(to left, rgba(12, 14, 20, 0.75) 0%, rgba(12, 14, 20, 0.3) 60%, transparent 100%)'
                : 'linear-gradient(to left, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.35) 60%, transparent 100%)',
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
              maskImage: 'linear-gradient(to left, black 25%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to left, black 25%, transparent 100%)',
            }}
          />

          {/* Left Fog Mask (حافة الخروج - ضباب بلوري متداخل مع الخلفية الإسلامية) */}
          <div 
            className="absolute left-0 top-0 bottom-4 w-20 sm:w-36 pointer-events-none z-20"
            style={{
              background: isDark
                ? 'linear-gradient(to right, rgba(12, 14, 20, 0.75) 0%, rgba(12, 14, 20, 0.3) 60%, transparent 100%)'
                : 'linear-gradient(to right, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.35) 60%, transparent 100%)',
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
              maskImage: 'linear-gradient(to right, black 25%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, black 25%, transparent 100%)',
            }}
          />

          {/* Cards Scroll Container (انزلاق لا نهائي مع تلاشٍ تدريجي عند الحافتين) */}
          <div
            ref={authorsScrollRef}
            className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-6 pt-3 px-6 sm:px-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 120px, black calc(100% - 120px), transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 120px, black calc(100% - 120px), transparent 100%)',
            }}
          >
            {loopedAuthors.map((author, idx) => {
              const bookCount = getAuthorBookCount(author.name);
              const staggerDelay = Math.min(idx * 110, 1100);

              return (
                <div
                  key={`${author.name}-${idx}`}
                  onClick={() => handleAuthorCardClick(author.name)}
                  style={{
                    animationDelay: `${staggerDelay}ms`,
                  }}
                  className={`animate-card-entrance relative group cursor-pointer shrink-0 w-[205px] sm:w-[235px] min-h-[165px] rounded-[2rem] p-5 sm:p-6 transition-all duration-500 flex flex-col items-center justify-between text-center select-none overflow-hidden backdrop-blur-xl ${getDomainCardStyle(false)}`}
                >
                  {/* Author Name & Metadata */}
                  <div className="w-full my-auto flex flex-col items-center gap-2">
                    <h3 className={`font-black text-sm sm:text-base leading-snug truncate w-full transition-colors font-tajawal ${getDomainTitleStyle(false)}`}>
                      {author.name}
                    </h3>

                    {/* Death / Status Badge */}
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-tajawal bg-amber-500/10 text-amber-700 dark:text-[#dfbf83] border border-amber-500/20">
                      <Clock className="w-3 h-3 opacity-70" />
                      <span>{author.death}</span>
                    </div>

                    {/* Chic Pill Badge for Book Count */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-tajawal bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/10 text-muted-foreground group-hover:border-current/30 transition-colors">
                      <BookOpen className="w-3 h-3 opacity-70" />
                      <span>{bookCount} {bookCount === 1 ? 'كتاب' : 'مصنفاً'}</span>
                    </div>
                  </div>

                  {/* Action Sublink: "تصفح المؤلفات" */}
                  <div className={`pt-3 border-t border-slate-100 dark:border-white/5 w-full flex items-center justify-center gap-2 text-xs font-bold transition-all duration-300 ${getDomainLinkHoverStyle()}`}>
                    <span>تصفح المؤلفات</span>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-black/[0.03] dark:bg-white/[0.06] group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. ANALYTICS & CHARTS SECTION (قسم الإحصائيات والرسوم البيانية)              */}
      {/* ========================================================================= */}
      <section className="relative z-10">
        <HomeChartsSection
          stats={liveStats}
          domainStats={displayDomains}
          onSelectDomain={handleDomainCardClick}
          onNavigateTab={onNavigateTab}
        />
      </section>


      {/* ========================================================================= */}
      {/* 6. FEATURED CLASSICAL BOOKS ROW (أمهات الكتب المختارة)                     */}
      {/* ========================================================================= */}
      {featuredBooks.length > 0 && (
        <section className="relative z-10 space-y-4 pt-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                من أمهات الكتب المختارة
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('featured')}
              className="text-xs font-bold text-brand-magenta hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>عرض جميع المختارة ({featuredBooks.length})</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredBooks.slice(0, 4).map((book) => (
              <div
                key={book.id || book.title}
                className={`rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between backdrop-blur-sm ${getFeaturedBookCardStyle()}`}
              >
                <div>
                  <h5 className="font-bold text-sm text-foreground truncate mb-1">
                    {book.title}
                  </h5>
                  <p className="text-xs text-muted-foreground truncate mb-3">
                    {book.author}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onReadBook(book)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-colors text-center cursor-pointer ${getFeaturedBookButtonStyle()}`}
                >
                  تصفح الكتاب
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
