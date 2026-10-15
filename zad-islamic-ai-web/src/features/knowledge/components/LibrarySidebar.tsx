import React from 'react';
import {
  X,
  Home,
  Layers,
  Users,
  ShieldCheck,
  Heart,
  HardDriveDownload,
  Bookmark
} from 'lucide-react';
import whiteLogo from '@/assets/images/WhiteLogo.png';
import darkLogo from '@/assets/images/ZadDarkLogo.png';
import { useTheme } from '../../../contexts/ThemeContext';
import { MainTab } from '../types/bookTypes';
export type { MainTab };

interface LibrarySidebarProps {
  isOpen: boolean;
  theme: string;
  activeMainTab: MainTab;
  counts: {
    domains: number;
    authors: number;
    featured?: number;
    favorites: number;
    narrators?: string | number;
    downloads?: number;
  };
  recentBook: any | null;
  onClose: () => void;
  onSelectTab: (tab: MainTab) => void;
  onReadRecentBook: (book: any) => void;
  // Optional / backward-compatible props
  selectedCentury?: string;
  onChangeCentury?: (c: string) => void;
  availableCenturies?: { century: number; name: string; count: number }[];
  sortAsc?: boolean;
  onToggleSort?: () => void;
  onOpenSettings?: () => void;
}

export default function LibrarySidebar({
  isOpen,
  theme,
  activeMainTab,
  counts,
  recentBook,
  onClose,
  onSelectTab,
  onReadRecentBook
}: LibrarySidebarProps) {
  const { accentColor, isDark } = useTheme();

  const getActiveTabClass = () => {
    switch (accentColor) {
      case 'emerald':
        return 'bg-teal-500/12 dark:bg-teal-400/15 text-teal-700 dark:text-teal-300 border border-teal-500/25 dark:border-teal-400/20 backdrop-blur-md shadow-xs font-bold';
      case 'amber':
        return 'bg-[#b88d46]/12 dark:bg-[#dfbf83]/15 text-[#8a652a] dark:text-[#f3dfb9] border border-[#b88d46]/25 dark:border-[#dfbf83]/20 backdrop-blur-md shadow-xs font-bold';
      case 'blue':
        return 'bg-blue-500/12 dark:bg-blue-400/15 text-blue-700 dark:text-blue-300 border border-blue-500/25 dark:border-blue-400/20 backdrop-blur-md shadow-xs font-bold';
      case 'purple':
      default:
        return 'bg-brand-magenta/12 dark:bg-brand-magenta/15 text-brand-magenta dark:text-purple-300 border border-brand-magenta/25 dark:border-brand-magenta/20 backdrop-blur-md shadow-xs font-bold';
    }
  };

  const getActiveIconContainerClass = () => {
    switch (accentColor) {
      case 'emerald':
        return 'bg-teal-500/20 text-teal-700 dark:text-teal-300';
      case 'amber':
        return 'bg-[#b88d46]/20 text-[#8a652a] dark:text-[#f3dfb9]';
      case 'blue':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
      case 'purple':
      default:
        return 'bg-brand-magenta/20 text-brand-magenta dark:text-purple-300';
    }
  };

  const getActiveBadgeClass = () => {
    switch (accentColor) {
      case 'emerald':
        return 'bg-teal-500/20 text-teal-800 dark:text-teal-200 border border-teal-500/25 font-bold';
      case 'amber':
        return 'bg-[#b88d46]/20 text-[#8a652a] dark:text-[#f3dfb9] border border-[#b88d46]/25 font-bold';
      case 'blue':
        return 'bg-blue-500/20 text-blue-800 dark:text-blue-200 border border-blue-500/25 font-bold';
      case 'purple':
      default:
        return 'bg-brand-magenta/20 text-purple-900 dark:text-purple-200 border border-brand-magenta/25 font-bold';
    }
  };

  const catalogItems: {
    id: MainTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
  }[] = [
    {
      id: 'home',
      label: 'الرئيسية',
      icon: <Home className="w-4 h-4" />
    },
    {
      id: 'categories',
      label: 'الكتب والأقسام',
      icon: <Layers className="w-4 h-4" />,
      badge: counts.domains > 0 ? counts.domains : undefined
    },
    {
      id: 'authors',
      label: 'المؤلفون',
      icon: <Users className="w-4 h-4" />,
      badge: counts.authors > 0 ? counts.authors : undefined
    },
    {
      id: 'narrators',
      label: 'الرواة',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: counts.narrators || '18.9K'
    }
  ];

  const myLibraryItems: {
    id: MainTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
  }[] = [
    {
      id: 'favorites',
      label: 'الكتب المفضلة',
      icon: <Heart className="w-4 h-4" />,
      badge: counts.favorites > 0 ? counts.favorites : undefined
    },
    {
      id: 'downloads',
      label: 'الكتب المحمّلة',
      icon: <HardDriveDownload className="w-4 h-4" />,
      badge: counts.downloads && counts.downloads > 0 ? counts.downloads : undefined
    }
  ];

  return (
    <>
      <aside
        dir="rtl"
        aria-label="القائمة الجانبية للمكتبة"
        className={`fixed top-0 right-0 z-[70] h-screen w-80 sm:w-96 transition-all duration-300 ease-in-out flex flex-col border-l shadow-2xl ${
          isOpen
            ? 'translate-x-0 pointer-events-auto visible opacity-100'
            : 'translate-x-full pointer-events-none invisible opacity-0'
        } ${
          isDark
            ? 'bg-[#10131d]/98 border-white/10 shadow-[-20px_0_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl'
            : accentColor === 'emerald'
            ? 'bg-white/98 border-teal-200/90 shadow-[-15px_0_45px_rgba(20,184,166,0.18)] backdrop-blur-2xl'
            : accentColor === 'amber'
            ? 'bg-white/98 border-[#ebd9b5] shadow-[-15px_0_45px_rgba(223,191,131,0.18)] backdrop-blur-2xl'
            : accentColor === 'blue'
            ? 'bg-white/98 border-blue-200/90 shadow-[-15px_0_45px_rgba(59,130,246,0.18)] backdrop-blur-2xl'
            : 'bg-white/98 border-purple-200/80 shadow-[-15px_0_45px_rgba(122,23,201,0.18)] backdrop-blur-2xl'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/60 dark:border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-magenta/20 to-brand-blue/20 border border-brand-magenta/30 p-2 flex items-center justify-center shrink-0 shadow-inner">
              <img
                src={theme === 'dark' ? whiteLogo : darkLogo}
                alt="زاد"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black tracking-tight brand-text-gradient truncate">
                مكتبة زاد الإسلامية
              </h2>
              <p className="text-[11px] text-muted-foreground truncate">
                فهرس وتصفح المكتبة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="إغلاق القائمة الجانبية"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-5 custom-scrollbar">

          {/* GROUP 1: فهرس المكتبة */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 tracking-wider px-2 pb-0.5">
              فهرس المكتبة
            </div>

            <div className="space-y-1">
              {catalogItems.map((item) => {
                const isActive = activeMainTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(item.id);
                      onClose();
                    }}
                    className={`w-full group flex items-center justify-between py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer select-none ${
                      isActive
                        ? getActiveTabClass()
                        : 'border border-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/[0.05] hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? getActiveIconContainerClass()
                            : 'bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 group-hover:text-amber-500 dark:group-hover:text-amber-400 group-hover:bg-amber-500/10'
                        }`}
                      >
                        {item.icon}
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10.5px] font-mono shrink-0 transition-colors ${
                          isActive
                            ? getActiveBadgeClass()
                            : 'bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-white/15'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* GROUP 2: مكتبتي */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-white/10">
            <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 tracking-wider px-2 pb-0.5">
              مكتبتي
            </div>

            <div className="space-y-1">
              {myLibraryItems.map((item) => {
                const isActive = activeMainTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(item.id);
                      onClose();
                    }}
                    className={`w-full group flex items-center justify-between py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer select-none ${
                      isActive
                        ? getActiveTabClass()
                        : 'border border-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-white/[0.05] hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? getActiveIconContainerClass()
                            : 'bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 group-hover:text-rose-500 dark:group-hover:text-rose-400 group-hover:bg-rose-500/10'
                        }`}
                      >
                        {item.icon}
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10.5px] font-mono shrink-0 transition-colors ${
                          isActive
                            ? getActiveBadgeClass()
                            : 'bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-white/15'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recent Book Shortcut (متابعة القراءة الأخيرة) */}
          {recentBook && (
            <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Bookmark className="w-3.5 h-3.5" />
                <span>متابعة القراءة الأخيرة</span>
              </div>
              <h4 className="font-bold text-xs truncate text-foreground">
                {recentBook.title}
              </h4>
              <p className="text-[10px] text-muted-foreground truncate">
                {recentBook.author}
              </p>
              <button
                type="button"
                onClick={() => {
                  onReadRecentBook(recentBook);
                  onClose();
                }}
                className="w-full py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
              >
                إكمال القراءة 📖
              </button>
            </div>
          )}

        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200/60 dark:border-white/10 shrink-0 text-center">
          <p className="text-[11px] text-muted-foreground font-medium">
            مكتبة زاد • الإصدار الثاني
          </p>
        </div>
      </aside>

      {/* Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[65] transition-opacity duration-300 animate-in fade-in cursor-pointer"
          title="انقر للإغلاق"
        />
      )}
    </>
  );
}
