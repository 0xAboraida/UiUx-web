file_path = r"e:\AI\AI-Code\ML Codes\UiUx-web\zad-islamic-ai-web\src\features\knowledge\TurathReader.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Header to include Book Title in the center
old_header = r"""      {/* Top Navigation Bar (Study Mode Style) */}
      <header 
        className={`shrink-0 h-16 w-full flex items-center justify-between px-4 z-40 transition-transform duration-500 border-b ${distractionFree ? '-translate-y-full opacity-0 absolute' : 'translate-y-0 opacity-100'} ${readerTheme === 'dark' ? 'bg-[#0a0514]/80 backdrop-blur-md border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : readerTheme === 'sepia' ? 'bg-[#EAE0C8]/90 backdrop-blur-md border-[#D4C4A8]' : 'bg-white/80 backdrop-blur-md border-gray-200/80'}`}
      >
        <div className="flex items-center gap-2 h-full">
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-magenta/10 text-brand-magenta hover:bg-brand-magenta hover:text-white transition-all shadow-sm group" 
            title="العودة"
          >
            <ArrowRight className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div className="h-8 w-px bg-border/50 mx-2" />

          {/* Tools Toggles */}
          <div className="flex items-center gap-1.5 h-full py-2">
            <button 
              onClick={() => setSidebarTab(sidebarTab === 'toc' ? 'none' : 'toc')} 
              className={`px-4 h-full rounded-xl flex justify-center items-center gap-2 transition-all font-semibold text-sm ${sidebarTab === 'toc' ? 'bg-brand-magenta text-white shadow-md' : 'text-muted-foreground border border-transparent hover:border-border hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'}`}
            >
              <BookText className="h-4 w-4" /> الفهرس
            </button>
            <button 
              onClick={() => setSidebarTab(sidebarTab === 'chat' ? 'none' : 'chat')} 
              className={`px-4 h-full rounded-xl flex justify-center items-center gap-2 transition-all font-semibold text-sm ${sidebarTab === 'chat' ? 'bg-brand-magenta text-white shadow-md' : 'text-muted-foreground border border-transparent hover:border-border hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'}`}
            >
              {sidebarTab === 'chat' ? <img src={whiteLogo} alt="Zad" className="h-4 w-4 object-contain" /> : <img src={readerTheme === 'dark' ? whiteLogo : zadDarkLogo} alt="Zad" className="h-4 w-4 object-contain opacity-70 group-hover:opacity-100 transition-opacity" />}
              مساعد القراءة
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 relative h-full py-2" ref={settingsRef}>"""

new_header = r"""      {/* Top Navigation Bar (Study Mode Style) */}
      <header 
        className={`shrink-0 h-16 w-full flex items-center justify-between px-4 z-40 transition-transform duration-500 border-b ${distractionFree ? '-translate-y-full opacity-0 absolute' : 'translate-y-0 opacity-100'} ${readerTheme === 'dark' ? 'bg-[#0a0514]/80 backdrop-blur-md border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : readerTheme === 'sepia' ? 'bg-[#EAE0C8]/90 backdrop-blur-md border-[#D4C4A8]' : 'bg-white/80 backdrop-blur-md border-gray-200/80'}`}
      >
        <div className="flex items-center gap-2 h-full">
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-magenta/10 text-brand-magenta hover:bg-brand-magenta hover:text-white transition-all shadow-sm group" 
            title="العودة"
          >
            <ArrowRight className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div className="h-8 w-px bg-border/50 mx-2" />

          {/* Tools Toggles */}
          <div className="flex items-center gap-1.5 h-full py-2">
            <button 
              onClick={() => setSidebarTab(sidebarTab === 'toc' ? 'none' : 'toc')} 
              className={`px-4 h-full rounded-xl flex justify-center items-center gap-2 transition-all font-semibold text-sm ${sidebarTab === 'toc' ? 'bg-brand-magenta text-white shadow-md' : 'text-muted-foreground border border-transparent hover:border-border hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'}`}
            >
              <BookText className="h-4 w-4" /> الفهرس
            </button>
            <button 
              onClick={() => setSidebarTab(sidebarTab === 'chat' ? 'none' : 'chat')} 
              className={`px-4 h-full rounded-xl flex justify-center items-center gap-2 transition-all font-semibold text-sm ${sidebarTab === 'chat' ? 'bg-brand-magenta text-white shadow-md' : 'text-muted-foreground border border-transparent hover:border-border hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'}`}
            >
              {sidebarTab === 'chat' ? <img src={whiteLogo} alt="Zad" className="h-4 w-4 object-contain" /> : <img src={readerTheme === 'dark' ? whiteLogo : zadDarkLogo} alt="Zad" className="h-4 w-4 object-contain opacity-70 group-hover:opacity-100 transition-opacity" />}
              مساعد القراءة
            </button>
          </div>
        </div>

        {/* Center: Book Title & Author */}
        <div className="flex flex-col items-center justify-center px-4 max-w-[45%]">
          <h1 className="font-display text-base md:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-magenta to-brand-blue truncate max-w-full">
            {book.title}
          </h1>
          {book.author && (
            <span className="text-[11px] font-semibold opacity-70 truncate max-w-full">
              المؤلف: {book.author}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 relative h-full py-2" ref={settingsRef}>"""

content = content.replace(old_header, new_header)

# 2. Remove floating title header inside main & adjust padding
old_banner_code = r"""        {/* Book Title & Metadata Header */}
        <div className={`absolute top-8 w-full z-20 flex flex-col items-center pointer-events-none transition-all duration-500 ${distractionFree ? 'opacity-0 -translate-y-4' : 'opacity-100'}`}>
           <h2 className="font-display text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-magenta to-brand-blue drop-shadow-sm mb-4">
             {book.title}
           </h2>
           
           <div className="flex flex-wrap justify-center gap-2 max-w-3xl px-4 pointer-events-auto">
              <span className={`px-4 py-1.5 rounded-full text-[13px] font-bold border backdrop-blur-md shadow-sm flex items-center gap-2 ${readerTheme === 'dark' ? 'bg-brand-magenta/10 border-brand-magenta/30 text-brand-magenta' : 'bg-brand-magenta/5 border-brand-magenta/20 text-brand-magenta'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-magenta/70 animate-pulse" />
                المؤلف: {book.author || 'غير معروف'}
              </span>
              {(book as any).domain && (
                <span className={`px-4 py-1.5 rounded-full text-[13px] font-bold border backdrop-blur-md shadow-sm ${readerTheme === 'dark' ? 'bg-brand-blue/10 border-brand-blue/30 text-brand-blue' : 'bg-brand-blue/5 border-brand-blue/20 text-brand-blue'}`}>
                  المجال: {(book as any).domain}
                </span>
              )}
              {(book as any).madhhab && (
                <span className={`px-4 py-1.5 rounded-full text-[13px] font-bold border backdrop-blur-md shadow-sm ${readerTheme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600'}`}>
                  المذهب: {(book as any).madhhab}
                </span>
              )}
              {(book as any).century && (
                <span className={`px-4 py-1.5 rounded-full text-[13px] font-bold border backdrop-blur-md shadow-sm ${readerTheme === 'dark' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-500/5 border-amber-500/20 text-amber-600'}`}>
                  القرن: {(book as any).century}
                </span>
              )}
           </div>
        </div>"""

content = content.replace(old_banner_code, "")

# 3. Adjust padding in main reading area
old_padding = r"""<div className="flex-1 overflow-y-auto px-6 md:px-12 lg:px-24 pb-32 pt-24 custom-scrollbar relative flex justify-center">"""
new_padding = r"""<div className="flex-1 overflow-y-auto px-6 md:px-12 lg:px-24 pb-32 pt-8 custom-scrollbar relative flex justify-center">"""
content = content.replace(old_padding, new_padding)

old_mt = r"""<div className={`mt-24 ${readerTheme === 'dark' ? 'dark-reader' : readerTheme === 'sepia' ? 'sepia-reader' : ''}`}>"""
new_mt = r"""<div className={`${readerTheme === 'dark' ? 'dark-reader' : readerTheme === 'sepia' ? 'sepia-reader' : ''}`}>"""
content = content.replace(old_mt, new_mt)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Title successfully moved to top bar.")
