import React from 'react';
import { BookOpen, ArrowLeft, ChevronDown } from 'lucide-react';
import whiteLogo from '@/assets/images/WhiteLogo.png';
import darkLogo from '@/assets/images/ZadDarkLogo.png';
import { BookMeta } from '../types/bookTypes';

interface LibraryHeroProps {
  accentColor: 'purple' | 'emerald' | 'amber' | 'blue';
  isDark: boolean;
  renderSearchConsole: (isCompact?: boolean) => React.ReactNode;
  recentBook: BookMeta | null;
  isRecentBannerDismissed: boolean;
  setIsRecentBannerDismissed: (dismissed: boolean) => void;
  handleReadBook: (book: BookMeta) => void;
  onScrollToDomains?: () => void;
  onBrowseLibrary?: () => void;
}

export default function LibraryHero({
  accentColor,
  isDark,
  renderSearchConsole,
  recentBook,
  isRecentBannerDismissed,
  setIsRecentBannerDismissed,
  handleReadBook,
  onScrollToDomains,
  onBrowseLibrary,
}: LibraryHeroProps) {
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

  const getBrowseLibraryButtonStyle = () => {
    if (isDark) {
      switch (accentColor) {
        case 'emerald':
          return 'bg-black/25 hover:bg-black/35 text-white backdrop-blur-xl border border-teal-500/35 hover:border-teal-400/60 shadow-[0_8px_25px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.2)] ring-1 ring-teal-500/20';
        case 'amber':
          return 'bg-black/25 hover:bg-black/35 text-white backdrop-blur-xl border border-[#dfbf83]/35 hover:border-[#dfbf83]/60 shadow-[0_8px_25px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.2)] ring-1 ring-[#dfbf83]/20';
        case 'blue':
          return 'bg-black/25 hover:bg-black/35 text-white backdrop-blur-xl border border-blue-500/35 hover:border-blue-400/60 shadow-[0_8px_25px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.2)] ring-1 ring-blue-500/20';
        case 'purple':
        default:
          return 'bg-black/25 hover:bg-black/35 text-white backdrop-blur-xl border border-purple-500/35 hover:border-purple-400/60 shadow-[0_8px_25px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.2)] ring-1 ring-purple-500/20';
      }
    } else {
      switch (accentColor) {
        case 'emerald':
          return 'bg-white/18 hover:bg-white/28 text-white backdrop-blur-xl border border-white/50 hover:border-teal-200/80 shadow-[0_8px_25px_rgba(0,0,0,0.22),inset_0_1px_2px_rgba(255,255,255,0.85)] ring-1 ring-white/25 drop-shadow-xs';
        case 'amber':
          return 'bg-white/18 hover:bg-white/28 text-white backdrop-blur-xl border border-white/50 hover:border-[#dfbf83]/80 shadow-[0_8px_25px_rgba(0,0,0,0.22),inset_0_1px_2px_rgba(255,255,255,0.85)] ring-1 ring-white/25 drop-shadow-xs';
        case 'blue':
          return 'bg-white/18 hover:bg-white/28 text-white backdrop-blur-xl border border-white/50 hover:border-blue-200/80 shadow-[0_8px_25px_rgba(0,0,0,0.22),inset_0_1px_2px_rgba(255,255,255,0.85)] ring-1 ring-white/25 drop-shadow-xs';
        case 'purple':
        default:
          return 'bg-white/18 hover:bg-white/28 text-white backdrop-blur-xl border border-white/50 hover:border-purple-200/80 shadow-[0_8px_25px_rgba(0,0,0,0.22),inset_0_1px_2px_rgba(255,255,255,0.85)] ring-1 ring-white/25 drop-shadow-xs';
      }
    }
  };

  return (
    <>
      {/* HOME HERO SECTION (يتوسط الشاشة رأسياً) */}
      <div className="relative z-30 flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-center animate-in fade-in duration-300">
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

            {/* Main Title colored with active Accent Color */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[40px] font-black tracking-tight font-tajawal">
              <span className={`inline-block transition-all duration-300 ${getHeroTitleColorClass()}`}>
                مكتبة متكاملة لدراسة العلوم الشرعية
              </span>
            </h1>

            {/* Clean White Subtitle */}
            <p className="text-xs sm:text-sm md:text-base font-bold text-white/95 dark:text-white max-w-xl mx-auto leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              ابحث في مجموعة مختارة من كتب المكتبة الشاملة، واستكشف الشروح المرئية والصوتية والدورات العلمية.
            </p>
          </div>

          {/* Taller Search Bar */}
          <div id="hero-main-search-bar" className="max-w-4xl mx-auto w-full relative z-50">
            {renderSearchConsole(false)}
          </div>

          {/* BROWSE LIBRARY CTA BUTTON */}
          <div className="flex items-center justify-center pt-1.5 sm:pt-2">
            <button
              type="button"
              onClick={onBrowseLibrary}
              className={`group relative inline-flex items-center gap-2.5 px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg cursor-pointer ${getBrowseLibraryButtonStyle()}`}
            >
              <BookOpen className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>تصفح كافة كتب وأقسام المكتبة</span>
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            </button>
          </div>

        </div>
      </div>

      {/* مؤشر التمرير للأسفل للانتقال للقسم الثاني */}
      <div className="relative z-0 pb-4 sm:pb-5 flex flex-col items-center justify-center text-center">
        <button
          type="button"
          onClick={onScrollToDomains || (() => {
            const el = document.getElementById('library-domains-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          })}
          className="inline-flex flex-col items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-brand-magenta transition-colors cursor-pointer group"
        >
          <span className="opacity-80 group-hover:opacity-100 transition-opacity">تصفح العلوم الشرعية</span>
          <ChevronDown className="w-4 h-4 text-brand-magenta animate-bounce" />
        </button>
      </div>
    </>
  );
}
