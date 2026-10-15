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
import libraryBgLight from '@/assets/images/library background light 2.webp'
import libraryBgDark from '@/assets/images/library background Sunset 1.webp'
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
import CategoriesView from './components/CategoriesView'
import AuthorsView from './components/AuthorsView'
import UnifiedCatalogView, { CatalogSubTab } from './components/UnifiedCatalogView'
import { BrowseBooksView } from './components/BrowseBooksView'
import LibraryNavbar from './components/LibraryNavbar'
import SearchConsole from './components/SearchConsole'
import BookDetailsModal from './components/BookDetailsModal'
import LibraryHero from './components/LibraryHero'
import { useLibraryData } from './hooks/useLibraryData'
import { INITIAL_SHEIKHS, INITIAL_PLAYLISTS, INITIAL_STANDALONE, INITIAL_COURSES } from './data/mediaData'
import { Sheikh, MediaPlaylist, MediaStandalone, Course } from './types/mediaTypes'
import { fetchTurathBookIndexes } from '../../api/turathApi'
import { BookMeta, LibraryAnalytics, MainTab } from './types/bookTypes'
import {
  hasBookPdf,
  getBookPdfUrl,
  CENTURY_NAMES_MAP,
  lookupAuthorDeathYear,
  normalizeBook,
  inferCenturyAndDeath
} from './utils/turathMeta'
import { normalizeArabicText } from './utils/arabicText'
import { downloadBookFile } from './utils/bookExport'

import BookCard from './components/BookCard'
import SkeletonList from './components/BookSkeletons'

// Re-export for complete backwards compatibility across the project
export type { BookMeta, LibraryAnalytics, MainTab }
export {
  BookCard,
  SkeletonList,
  BrowseBooksView,
  SearchConsole,
  hasBookPdf,
  getBookPdfUrl,
  CENTURY_NAMES_MAP,
  lookupAuthorDeathYear,
  normalizeBook,
  inferCenturyAndDeath,
  normalizeArabicText,
  downloadBookFile
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
  const [isRecentBannerDismissed, setIsRecentBannerDismissed] = useState(false)



  const getSection2ContainerStyle = () => {
    if (isDark) {
      return 'bg-[#0c0e14] border-t border-white/10';
    } else {
      return 'bg-white border-t border-slate-100';
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
      if (initialTab === 'home') {
        setIsScrolledPastSearch(false);
        onScrolledPastSearchChange?.(false);
      }
    }
  }, [initialTab]);

  useEffect(() => {
    onTabChange?.(activeMainTab);
  }, [activeMainTab, onTabChange]);

  // Scroll Listener for Navbar Activation across all library views (يظهر فقط عند اختفاء شريط البحث تماماً من الشاشة)
  const [isScrolledPastSearch, setIsScrolledPastSearch] = useState(false);
  const isScrolledRef = useRef(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    isScrolledRef.current = isScrolledPastSearch;
  }, [isScrolledPastSearch]);

  const handleGoToLibraryHome = () => {
    lastScrollYRef.current = 0;
    isScrolledRef.current = false;
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
      isScrolledRef.current = true;
      return;
    }

    const initialScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    lastScrollYRef.current = initialScrollY;
    if (initialScrollY < 120) {
      setIsScrolledPastSearch(false);
      isScrolledRef.current = false;
    }

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (activeMainTab !== 'home') {
            if (!isScrolledRef.current) {
              setIsScrolledPastSearch(true);
              isScrolledRef.current = true;
            }
          } else {
            const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
            const isScrollingUp = scrollY < lastScrollYRef.current;
            lastScrollYRef.current = scrollY;

            // إذا كان المستخدم قريباً جداً من قمة الصفحة
            if (scrollY < 120) {
              if (isScrolledRef.current) {
                setIsScrolledPastSearch(false);
                isScrolledRef.current = false;
              }
              ticking = false;
              return;
            }

            const searchEl = document.getElementById('hero-main-search-bar');
            if (searchEl) {
              const rect = searchEl.getBoundingClientRect();
              if (rect.height > 0 && rect.width > 0) {
                if (isScrollingUp) {
                  // أثناء الصعود لأعلى: أول ما يقترب شريط البحث في الواجهة من الظهور (على بُعد 25px أو أقل من الحافة العلوية)، يختفي النافبار الثاني فوراً
                  if (rect.bottom >= -25) {
                    if (isScrolledRef.current) {
                      setIsScrolledPastSearch(false);
                      isScrolledRef.current = false;
                    }
                  }
                } else {
                  // أثناء النزول لأسفل: يظهر النافبار الثاني بمجرد اختفاء شريط البحث الرئيسي تماماً من الشاشة
                  if (rect.bottom <= 0 && scrollY > 150) {
                    if (!isScrolledRef.current) {
                      setIsScrolledPastSearch(true);
                      isScrolledRef.current = true;
                    }
                  }
                }
              } else {
                if (isScrollingUp && scrollY < 320) {
                  if (isScrolledRef.current) {
                    setIsScrolledPastSearch(false);
                    isScrolledRef.current = false;
                  }
                } else if (!isScrollingUp && scrollY > 380) {
                  if (!isScrolledRef.current) {
                    setIsScrolledPastSearch(true);
                    isScrolledRef.current = true;
                  }
                }
              }
            } else {
              if (isScrollingUp && scrollY < 320) {
                if (isScrolledRef.current) {
                  setIsScrolledPastSearch(false);
                  isScrolledRef.current = false;
                }
              } else if (!isScrollingUp && scrollY > 380) {
                if (!isScrolledRef.current) {
                  setIsScrolledPastSearch(true);
                  isScrolledRef.current = true;
                }
              }
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

  // Tab 2 (الأقسام) & Tab 3 (المؤلفون) Search & Selection State
  const [categorySearch, setCategorySearch] = useState<string>('')
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null)
  const [authorSearch, setAuthorSearch] = useState<string>('')

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
    }, 150);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const currentSearchValue = searchInput;
  const [isHomeSearchResultsDismissed, setIsHomeSearchResultsDismissed] = useState(false);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    setIsHomeSearchResultsDismissed(false);
    if (!val) {
      // Instant clear when emptied
      setCategorySearch('');
      setAuthorSearch('');
      setQuery('');
    }
  };

  const handleSearchSubmit = () => {
    if (activeMainTab === 'home') {
      window.scrollTo({ top: 0, behavior: 'instant' });
      setActiveMainTab('categories');
    }
  };

  // Book Info Floating Modal State
  const [activeInfoBook, setActiveInfoBook] = useState<BookMeta | null>(null)
  const [modalInfoText, setModalInfoText] = useState<string | null>(null)
  const [loadingInfo, setLoadingInfo] = useState(false)

  // Library Data Hook (إدارة البيانات، التخزين المؤقت، والتصفية فائقة السرعة)
  const {
    publishedBooks,
    loading,
    liveStats,
    availableDomains,
    availableAuthors,
    availableCenturies,
    filteredAndSortedBooks,
    booksByCategory,
    authorsByCentury,
    currentAuthorData,
    homeSearchResults,
    favoriteBooksList,
    featuredBookIds,
    getBaseUrl,
  } = useLibraryData({
    query,
    selectedDomain,
    filterAuthor,
    selectedCentury,
    sortAsc,
    activeMainTab,
    categorySearch,
    authorSearch,
    currentSearchValue,
    selectedAuthor,
    favoriteBookIds,
  });

  // Cache for fetched book details to provide instant opening on subsequent clicks
  const [bookDetailsCache, setBookDetailsCache] = useState<Record<string | number, string>>({});

  // Helper to verify if text is genuine printed book metadata rather than a generic auto-generated fallback
  const isRealBookInfo = (text?: string | null) => {
    if (!text) return false;
    const trimmed = text.trim();
    if (/^كتاب\s+.+\s+في\s+.+\s+للمؤلف\s+.+$/s.test(trimmed)) return false;
    return trimmed.includes('\n') || trimmed.includes('الكتاب:') || trimmed.includes('الناشر:') || trimmed.includes('المحقق:') || trimmed.includes('الطبعة:');
  };

  // Fetch book info for floating modal when activeInfoBook changes
  useEffect(() => {
    if (!activeInfoBook) {
      setModalInfoText(null);
      return;
    }

    const bookId = activeInfoBook.id;

    // 1. Check memory cache first (instant response)
    if (bookId && bookDetailsCache[bookId]) {
      setModalInfoText(bookDetailsCache[bookId]);
      return;
    }

    // 2. Check if the book object itself has genuine metadata (not the auto-generated single-line fallback)
    const existing = activeInfoBook.info || activeInfoBook.infoText;
    if (isRealBookInfo(existing)) {
      setModalInfoText(existing!);
      if (bookId) {
        setBookDetailsCache(prev => ({ ...prev, [bookId]: existing! }));
      }
      return;
    }

    // 3. Fetch from API
    const fetchInfo = async () => {
      setLoadingInfo(true);
      setModalInfoText(null);
      try {
        const baseUrl = getBaseUrl();
        if (bookId) {
          try {
            const res = await fetch(`${baseUrl}/api/v1/data-ingestion/zad-book-info/${bookId}`);
            if (res.ok) {
              const data = await res.json();
              if (data.meta?.info && typeof data.meta.info === 'string' && data.meta.info.trim()) {
                const infoStr = data.meta.info.trim();
                setModalInfoText(infoStr);
                setBookDetailsCache(prev => ({ ...prev, [bookId]: infoStr }));
                return;
              }
            }
          } catch (e) {
            console.error('Error fetching zad-book-info:', e);
          }

          // Fallback to official Turath API metadata
          try {
            const turathData = await fetchTurathBookIndexes(Number(bookId));
            if (turathData?.meta?.info && typeof turathData.meta.info === 'string' && turathData.meta.info.trim()) {
              const infoStr = turathData.meta.info.trim();
              setModalInfoText(infoStr);
              setBookDetailsCache(prev => ({ ...prev, [bookId]: infoStr }));
              return;
            }
          } catch (e) {
            console.error('Error fetching turath indexes fallback:', e);
          }
        }

        setModalInfoText('لم تتوفر تفاصيل إضافية لهذا الكتاب حالياً.');
      } catch (err) {
        setModalInfoText('حدث خطأ أثناء محاولة جلب المعلومات.');
      } finally {
        setLoadingInfo(false);
      }
    };

    fetchInfo();
  }, [activeInfoBook, getBaseUrl]);

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
  const [view, setView] = useState<'search' | 'reader'>('search');
  const [selectedBook, setSelectedBook] = useState<BookMeta | null>(null);
  const [selectedAuthorBook, setSelectedAuthorBook] = useState<BookMeta | null>(null);

  // Collapsible Sidebar & Recent Book State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [recentBook, setRecentBook] = useState<BookMeta | null>(() => {
    try {
      const saved = localStorage.getItem('zad_recent_read_book');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return null;
  });

  const handleReadBook = (book: BookMeta, page?: number) => {
    const bookWithPage = page && page > 0 ? { ...book, savedPage: page } : book;
    setSelectedBook(bookWithPage);
    setRecentBook(bookWithPage);
    try {
      localStorage.setItem('zad_recent_read_book', JSON.stringify(bookWithPage));
    } catch (e) { }
    setView('reader');
  };

  if (view === 'reader' && selectedBook) {
    return (
      <TurathReader
        book={selectedBook}
        onClose={() => setView('search')}
        onAskBook={onAskBook}
        globalFontSize={fontSize}
        onSelectAuthor={(authorName) => {
          setView('search');
          setActiveMainTab('authors');
          setSelectedAuthor(authorName);
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
      />
    );
  }

  // Render Search Console (Used in Navbar for non-home tabs and in Hero for home tab)
  const renderSearchConsole = (isCompact: boolean = false) => {
    return (
      <SearchConsole
        isCompact={isCompact}
        currentSearchValue={currentSearchValue}
        handleSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        selectedDomain={selectedDomain}
        setSelectedDomain={setSelectedDomain}
        availableDomains={availableDomains}
        filterAuthor={filterAuthor}
        setFilterAuthor={setFilterAuthor}
        availableAuthors={availableAuthors}
        publishedBooksCount={publishedBooks.length}
        activeMainTab={activeMainTab}
        homeSearchResults={homeSearchResults}
        isHomeSearchResultsDismissed={isHomeSearchResultsDismissed}
        setIsHomeSearchResultsDismissed={setIsHomeSearchResultsDismissed}
        favoriteBookIds={favoriteBookIds}
        toggleFavorite={toggleFavorite}
        handleReadBook={handleReadBook}
        onAskBook={onAskBook}
        setSelectedAuthorBook={setSelectedAuthorBook}
        setActiveInfoBook={setActiveInfoBook}
      />
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
            narrators: '18.9K',
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
            setIsSettingsModalOpen(true);
          }}
        />

        {/* ============================================================= */}
        {/* MAIN WORKSPACE AREA (مساحة التصفح والعرض الرئيسية)            */}
        {/* ============================================================= */}
        <main className="flex-1 min-w-0 flex flex-col min-h-screen">

          {/* ============================================================= */}
          {/* SECTION 1: TOP HERO (القسم الأول: النافبار + الهيدر + صورة الغروب - شاشة كاملة 100vh) */}
          {/* ============================================================= */}
          <div className={`relative z-20 w-full overflow-hidden ${isDark ? 'bg-[#0c0e14]' : 'bg-[#fbfbfb]'} ${activeMainTab === 'home'
            ? 'min-h-screen flex flex-col justify-between'
            : ''
            }`}>
            {/* Sunset Mosque Background - STRICTLY LIMITED TO SECTION 1 ON 'home' */}
            {activeMainTab === 'home' && (
              <div className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${isDark ? 'bg-[#0c0e14]' : 'bg-[#fbfbfb]'}`}>
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
            <LibraryNavbar
              isScrolledPastSearch={isScrolledPastSearch}
              activeMainTab={activeMainTab}
              setActiveMainTab={setActiveMainTab}
              onExit={onExit}
              onNavigateGlobal={onNavigateGlobal}
              onScrolledPastSearchChange={onScrolledPastSearchChange}
              setIsScrolledPastSearch={setIsScrolledPastSearch}
              handleGoToLibraryHome={handleGoToLibraryHome}
              setIsSidebarOpen={setIsSidebarOpen}
              onLogin={onLogin}
              setShowProfileModal={setShowProfileModal}
              setSelectedAuthor={setSelectedAuthor}
              renderSearchConsole={renderSearchConsole}
              categoriesCount={booksByCategory.length}
              authorsCount={liveStats.total_authors}
              favoritesCount={favoriteBooksList.length}
            />

            {/* HOME HERO SECTION */}
            {activeMainTab === 'home' && (
              <LibraryHero
                accentColor={accentColor}
                isDark={isDark}
                renderSearchConsole={renderSearchConsole}
                recentBook={recentBook}
                isRecentBannerDismissed={isRecentBannerDismissed}
                setIsRecentBannerDismissed={setIsRecentBannerDismissed}
                handleReadBook={handleReadBook}
                onScrollToDomains={() => {
                  const el = document.getElementById('library-domains-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                onBrowseLibrary={() => {
                  window.scrollTo({ top: 0, behavior: 'instant' });
                  setActiveMainTab('categories');
                }}
              />
            )}
          </div>

          {/* ============================================================= */}
          {/* SECTION 2: WORKSPACE & ISLAMIC PATTERN (القسم الثاني: الزخرفة)  */}
          {/* ============================================================= */}
          <div className={`relative z-10 flex-1 w-full overflow-hidden transition-colors duration-300 ${getSection2ContainerStyle()}`}>
            {/* الزخرفة الإسلامية الهندسية تغطي كامل خلفية القسم الثاني وتتلون حسب السمة */}
            <IslamicPattern
              isFixed={true}
              opacity={isDark ? 0.07 : 0.08}
              className={`${getSection2PatternColor()} pointer-events-none transition-colors duration-300`}
            />

            <div className={`relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 ${activeMainTab === 'home'
              ? ''
              : ['categories', 'authors', 'narrators', 'favorites', 'downloads'].includes(activeMainTab)
                ? 'pt-32 sm:pt-36 lg:pt-40'
                : 'pt-24 sm:pt-28 lg:pt-32'
              }`}>

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
                  availableAuthors={availableAuthors}
                  onSelectAuthor={(authorName) => {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                    setSelectedAuthor(authorName);
                    setActiveMainTab('authors');
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

              {/* TAB: دورات حالية (Courses) */}
              {activeMainTab === 'courses' && (
                <CurrentCoursesView
                  courses={courses}
                  onOpenLinkedBook={handleOpenLinkedBook}
                />
              )}

              {/* ============================================================= */}
              {/* TAB: المـخـتـارة (Featured & Chronological)                   */}
              {/* ============================================================= */}
              {activeMainTab === 'featured' && (
                <BrowseBooksView
                  filteredAndSortedBooks={filteredAndSortedBooks}
                  availableCenturies={availableCenturies}
                  availableDomains={availableDomains}
                  publishedBooksCount={publishedBooks.length}
                  selectedCentury={selectedCentury}
                  setSelectedCentury={setSelectedCentury}
                  sortAsc={sortAsc}
                  setSortAsc={setSortAsc}
                  selectedDomain={selectedDomain}
                  setSelectedDomain={setSelectedDomain}
                  query={query}
                  setQuery={setQuery}
                  loading={loading}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  visibleBrowseBooksLimit={visibleBrowseBooksLimit}
                  setVisibleBrowseBooksLimit={setVisibleBrowseBooksLimit}
                  handleReadBook={handleReadBook}
                  onAskBook={onAskBook}
                  setSelectedAuthorBook={setSelectedAuthorBook}
                  setActiveInfoBook={setActiveInfoBook}
                  favoriteBookIds={favoriteBookIds}
                  toggleFavorite={toggleFavorite}
                />
              )}

              {/* ============================================================= */}
              {/* UNIFIED HERITAGE CATALOG HUB (البوابة الشاملة الموحدة)         */}
              {/* [ الكتب والأقسام | المؤلفون | الرواة | المفضلة | المحمّلة ]    */}
              {/* ============================================================= */}
              {(['categories', 'authors', 'narrators', 'favorites', 'downloads'].includes(activeMainTab)) && (
                <UnifiedCatalogView
                  activeSubTab={activeMainTab as CatalogSubTab}
                  onSubTabChange={(tab) => {
                    setActiveMainTab(tab as MainTab);
                  }}
                  categoriesProps={{
                    categorySearch,
                    selectedDomain,
                    filterAuthor,
                    booksByCategory,
                    renderSearchConsole,
                    handleReadBook,
                    onAskBook,
                    setSelectedAuthorBook,
                    setActiveInfoBook,
                    favoriteBookIds,
                    toggleFavorite,
                    handleSearchChange,
                  }}
                  authorsProps={{
                    selectedAuthor,
                    setSelectedAuthor,
                    currentAuthorData,
                    authorsByCentury,
                    liveStats,
                    availableCenturies,
                    publishedBooksCount: publishedBooks.length,
                    renderSearchConsole,
                    handleReadBook,
                    onAskBook,
                    setSelectedAuthorBook,
                    setActiveInfoBook,
                    favoriteBookIds,
                    toggleFavorite,
                    authorSearch,
                    selectedDomain,
                    filterAuthor,
                    handleSearchChange,
                  }}
                  favoriteBooks={favoriteBooksList}
                  onRemoveFavorite={(id) => toggleFavorite(id)}
                  onOpenAuthorBio={(b) => setSelectedAuthorBook(b)}
                  handleReadBook={handleReadBook}
                  onAskBook={onAskBook}
                  publishedBooks={publishedBooks}
                />
              )}

            </div>
          </div>
        </main>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FLOATING BOOK INFO MODAL CARD (نافذة عائمة مع خلفية قابلة للنقر) */}
      {/* ------------------------------------------------------------- */}
      <BookDetailsModal
        book={activeInfoBook}
        onClose={() => setActiveInfoBook(null)}
        loadingInfo={loadingInfo}
        modalInfoText={modalInfoText}
        onReadBook={handleReadBook}
        onAskBook={onAskBook}
      />

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
