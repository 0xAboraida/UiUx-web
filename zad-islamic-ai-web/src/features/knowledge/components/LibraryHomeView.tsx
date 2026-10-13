import React, { useRef } from 'react';
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
import { Course, MediaPlaylist } from '../types/mediaTypes';
import IslamicPattern from './IslamicPattern';
import HomeChartsSection from './HomeChartsSection';
import { useTheme } from '../../../contexts/ThemeContext';

export interface DomainItem {
  name: string;
  count: number;
  id?: string;
}

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
  featuredPlaylist?: MediaPlaylist;
  activeCourse?: Course;
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
  featuredPlaylist,
  activeCourse,
  favoritesCount,
  onNavigateTab,
  onReadBook,
  onOpenLinkedBook
}: LibraryHomeViewProps) {
  const domainsScrollRef = useRef<HTMLDivElement>(null);
  const { isDark, accentColor } = useTheme();

  // Scroll handler for horizontal domains list
  const scrollDomains = (direction: 'left' | 'right') => {
    if (domainsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      domainsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
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
    return 'bg-white dark:bg-[#131620] border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 shadow-sm';
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

  const getDomainCardStyle = (isSelected: boolean) => {
    if (isDark) {
      switch (accentColor) {
        case 'amber':
          return isSelected
            ? 'bg-[#181c26] border-2 border-[#dfbf83] shadow-lg shadow-black/40 scale-[1.02]'
            : 'bg-[#131620]/90 border border-white/10 shadow-md shadow-black/20 hover:bg-[#181c28] hover:shadow-xl hover:border-[#dfbf83]/60 hover:-translate-y-1';
        case 'emerald':
          return isSelected
            ? 'bg-[#181c26] border-2 border-teal-400 shadow-lg shadow-black/40 scale-[1.02]'
            : 'bg-[#131620]/90 border border-white/10 shadow-md shadow-black/20 hover:bg-[#181c28] hover:shadow-xl hover:border-teal-400/60 hover:-translate-y-1';
        case 'blue':
          return isSelected
            ? 'bg-[#181c26] border-2 border-blue-400 shadow-lg shadow-black/40 scale-[1.02]'
            : 'bg-[#131620]/90 border border-white/10 shadow-md shadow-black/20 hover:bg-[#181c28] hover:shadow-xl hover:border-blue-400/60 hover:-translate-y-1';
        case 'purple':
        default:
          return isSelected
            ? 'bg-[#181c26] border-2 border-purple-400 shadow-lg shadow-black/40 scale-[1.02]'
            : 'bg-[#131620]/90 border border-white/10 shadow-md shadow-black/20 hover:bg-[#181c28] hover:shadow-xl hover:border-purple-400/60 hover:-translate-y-1';
      }
    } else {
      switch (accentColor) {
        case 'amber':
          return isSelected
            ? 'bg-white border-2 border-[#b88d46] shadow-md shadow-amber-900/10 scale-[1.02]'
            : 'bg-white border border-[#ebd9b5] shadow-xs hover:shadow-lg hover:border-[#b88d46]/70 hover:-translate-y-1';
        case 'emerald':
          return isSelected
            ? 'bg-white border-2 border-teal-600 shadow-md shadow-teal-900/10 scale-[1.02]'
            : 'bg-white border border-teal-200/80 shadow-xs hover:shadow-lg hover:border-teal-500/70 hover:-translate-y-1';
        case 'blue':
          return isSelected
            ? 'bg-white border-2 border-blue-600 shadow-md shadow-blue-900/10 scale-[1.02]'
            : 'bg-white border border-blue-200/80 shadow-xs hover:shadow-lg hover:border-blue-500/70 hover:-translate-y-1';
        case 'purple':
        default:
          return isSelected
            ? 'bg-white border-2 border-purple-500 shadow-lg shadow-purple-500/15 scale-[1.02]'
            : 'bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-purple-400/60 hover:-translate-y-1';
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

  const getSpotlightCardStyle = () => {
    if (isDark) {
      return 'border border-white/10 bg-[#131620]/90 shadow-lg shadow-black/20';
    }
    return 'border border-slate-200/80 bg-white/90';
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

  // Default main domains when no books are published yet
  const displayDomains = availableDomains.length > 0 ? availableDomains : [
    { name: 'العقيدة الإسلامية', count: 0 },
    { name: 'الفقه وأصوله', count: 0 },
    { name: 'الحديث الشريف', count: 0 },
    { name: 'علوم القرآن والتفسير', count: 0 },
  ];

  const handleDomainCardClick = (domainName: string) => {
    if (onSelectDomain) {
      onSelectDomain(domainName);
    }
    onNavigateTab('categories');
  };

  return (
    <div className="relative animate-in fade-in duration-300 space-y-12">
      
      {/* ========================================================================= */}
      {/* 1. DOMAINS SECTION: Title + Full-Width Line + Side-by-Side Cards           */}
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

          {/* Navigation Controls: Horizontal scroll arrows */}
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

        {/* Side-by-Side Cards (جنب بعض) Container */}
        <div 
          ref={domainsScrollRef}
          className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-4 pt-2 px-1 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-white/20"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {displayDomains.map((domain) => {
            const style = getDomainStyle(domain.name);
            const isSelected = selectedDomain === domain.name;

            return (
              <div
                key={domain.name}
                onClick={() => handleDomainCardClick(domain.name)}
                style={{ scrollSnapAlign: 'start' }}
                className={`group cursor-pointer shrink-0 w-[200px] sm:w-[230px] rounded-3xl p-5 sm:p-6 transition-all duration-300 flex flex-col items-center justify-between text-center select-none ${getDomainCardStyle(isSelected)}`}
              >
                {/* 1. Icon in Soft Rounded Square Container */}
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 shadow-sm ${style.bgColor}`}>
                  {style.icon}
                </div>

                {/* 2. Bold Domain Title */}
                <div className="w-full mb-3">
                  <h3 className={`font-black text-sm sm:text-base leading-snug truncate transition-colors ${getDomainTitleStyle(isSelected)}`}>
                    {domain.name}
                  </h3>
                  <span className="text-[11px] font-mono text-muted-foreground opacity-80">
                    {domain.count} مصنفاً
                  </span>
                </div>

                {/* 3. Action Sublink with Arrow: "استكشف الكتب" */}
                <div className={`pt-3 border-t border-slate-100 dark:border-white/5 w-full flex items-center justify-center gap-1.5 text-xs font-bold text-muted-foreground transition-colors ${getDomainLinkHoverStyle()}`}>
                  <span>استكشف الكتب</span>
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. ANALYTICS & CHARTS SECTION (قسم الإحصائيات والرسوم البيانية)              */}
      {/* ========================================================================= */}
      <section className="relative z-10">
        <HomeChartsSection 
          stats={liveStats}
          domainStats={displayDomains}
          onSelectDomain={handleDomainCardClick}
        />
      </section>

      {/* ========================================================================= */}
      {/* 5. SPOTLIGHT: ACTIVE COURSE & MEDIA PLAYLISTS                             */}
      {/* ========================================================================= */}
      <section className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spotlight 1: الدورة الحالية - الفقه الميسر للشيخ علاء حامد */}
        {activeCourse && (
          <div className={`rounded-3xl p-5 sm:p-6 shadow-sm backdrop-blur-md flex flex-col justify-between ${getSpotlightCardStyle()}`}>
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold">
                  {activeCourse.badgeLabel}
                </span>
                <span className="text-xs text-muted-foreground font-bold">
                  {activeCourse.totalLessons} محاضرة
                </span>
              </div>

              <h4 className="text-lg font-black text-foreground mb-2">
                {activeCourse.title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                {activeCourse.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onNavigateTab('courses')}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${getFeaturedBookButtonStyle()}`}
              >
                <span>الانتقال لصفحة الدورة</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>

              <a
                href={activeCourse.playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-brand-blue hover:underline"
              >
                فتح على يوتيوب ↗
              </a>
            </div>
          </div>
        )}

        {/* Spotlight 2: شرح الفقه الميسر للشيخ علاء حامد */}
        {featuredPlaylist && (
          <div className={`rounded-3xl p-5 sm:p-6 shadow-sm backdrop-blur-md flex flex-col justify-between ${getSpotlightCardStyle()}`}>
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-brand-magenta/10 text-brand-magenta text-xs font-bold">
                  سلسلة فقهية مميزة
                </span>
                <span className="text-xs text-brand-blue font-bold">
                  {featuredPlaylist.sheikhName}
                </span>
              </div>

              <h4 className="text-lg font-black text-foreground mb-2">
                {featuredPlaylist.title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                {featuredPlaylist.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onNavigateTab('media')}
                className="py-2 px-4 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-brand-magenta hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>بروفايل الشيخ والشروحات</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>

              {featuredPlaylist.linkedBook && onOpenLinkedBook && (
                <button
                  type="button"
                  onClick={() => onOpenLinkedBook(featuredPlaylist.linkedBook!.bookTitle)}
                  className="text-xs font-bold text-brand-magenta hover:underline cursor-pointer"
                >
                  قراءة متن الفقه الميسر
                </button>
              )}
            </div>
          </div>
        )}
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
