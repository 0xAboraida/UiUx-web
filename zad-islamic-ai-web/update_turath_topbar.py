import re

file_path = r"e:\AI\AI-Code\ML Codes\UiUx-web\zad-islamic-ai-web\src\features\knowledge\TurathReader.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_nav = r"""      {/* Vertical Icon Rail (Sidebar Toolbar) */}
      <nav 
        className={`shrink-0 h-full w-16 md:w-20 flex flex-col items-center py-6 gap-6 z-40 transition-transform duration-500 border-l ${distractionFree ? 'translate-x-full opacity-0 absolute' : 'translate-x-0 opacity-100'} ${readerTheme === 'dark' ? 'bg-[#0a0514]/95 border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)]' : readerTheme === 'sepia' ? 'bg-[#EAE0C8]/90 border-[#D4C4A8]' : 'bg-white/90 border-gray-200/80'}`}
      >
        <button 
          onClick={onClose} 
          className="p-3 rounded-2xl bg-brand-magenta/10 text-brand-magenta hover:bg-brand-magenta hover:text-white transition-all shadow-sm group mb-4" 
          title="العودة"
        >
          <ArrowRight className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="flex flex-col gap-3 w-full px-3">
          <button 
            onClick={() => setSidebarTab(sidebarTab === 'toc' ? 'none' : 'toc')} 
            className={`p-3 rounded-2xl flex justify-center items-center transition-all ${sidebarTab === 'toc' ? 'bg-brand-magenta text-white shadow-md scale-105' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'}`}
            title="الفهرس"
          >
            <BookText className="h-6 w-6" />
          </button>
          
          <button 
            onClick={() => setSidebarTab(sidebarTab === 'chat' ? 'none' : 'chat')} 
            className={`p-3 rounded-2xl flex justify-center items-center transition-all ${sidebarTab === 'chat' ? 'bg-brand-magenta text-white shadow-md scale-105' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'}`}
            title="مساعد القراءة"
          >
            {sidebarTab === 'chat' ? <img src={whiteLogo} alt="Zad" className="h-6 w-6 object-contain" /> : <img src={readerTheme === 'dark' ? whiteLogo : zadDarkLogo} alt="Zad" className="h-6 w-6 object-contain opacity-70 group-hover:opacity-100 transition-opacity" />}
          </button>
        </div>

        <div className="mt-auto flex flex-col gap-3 w-full px-3 relative" ref={settingsRef}>
          <button 
            onClick={() => { setDistractionFree(true); setShowSettings(false); }}
            className="p-3 rounded-2xl flex justify-center items-center text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground transition-all"
            title="وضع ملء الشاشة"
          >
            <Maximize className="h-6 w-6" />
          </button>
          
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className={`p-3 rounded-2xl flex justify-center items-center transition-all ${showSettings ? 'bg-brand-blue text-white shadow-md scale-105' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'}`}
            title="إعدادات القراءة"
          >
            <Settings2 className="h-6 w-6" />
          </button>
          
          {/* Settings Dropdown (Pops out to the left of the rail) */}
          {showSettings && (
            <div className={`absolute bottom-0 right-full mr-4 w-[280px] backdrop-blur-2xl border rounded-3xl shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-right-2 ${readerTheme === 'dark' ? 'bg-[#0d071a]/95 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.7)]' : readerTheme === 'sepia' ? 'bg-[#F4ECD8]/95 border-[#D4C4A8] shadow-[#D4C4A8]/40' : 'bg-white/95 border-gray-200 shadow-xl'}`}>
               {/* Theme */}
               <div className="mb-5">
                  <label className="text-[11px] font-bold text-muted-foreground mb-2 block uppercase tracking-wider">مظهر القراءة</label>
                  <div className="flex gap-2">
                     <button onClick={() => setReaderTheme('light')} className={`flex-1 py-2 rounded-2xl border transition-all ${readerTheme === 'light' ? 'border-brand-blue bg-brand-blue/10 text-brand-blue shadow-sm' : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'} flex flex-col items-center justify-center gap-1.5`}>
                       <Sun className="h-4 w-4" />
                       <span className="text-[10px] font-semibold">فاتح</span>
                     </button>
                     <button onClick={() => setReaderTheme('sepia')} className={`flex-1 py-2 rounded-2xl border transition-all ${readerTheme === 'sepia' ? 'border-[#d3c6a6] bg-[#e4dac0] text-[#5b4636] shadow-sm' : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'} flex flex-col items-center justify-center gap-1.5`}>
                       <BookOpen className="h-4 w-4" />
                       <span className="text-[10px] font-semibold">ورقي</span>
                     </button>
                     <button onClick={() => setReaderTheme('dark')} className={`flex-1 py-2 rounded-2xl border transition-all ${readerTheme === 'dark' ? 'border-brand-blue bg-brand-blue/10 text-brand-blue shadow-sm' : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'} flex flex-col items-center justify-center gap-1.5`}>
                       <Moon className="h-4 w-4" />
                       <span className="text-[10px] font-semibold">داكن</span>
                     </button>
                  </div>
               </div>

               {/* Font Size */}
               <div className="mb-5">
                  <label className="text-[11px] font-bold text-muted-foreground mb-2 flex justify-between uppercase tracking-wider">
                    <span>حجم الخط</span>
                    <span className="text-brand-blue">{fontSize}px</span>
                  </label>
                  <div className="flex items-center gap-3">
                     <button onClick={() => setFontSize(s => Math.max(14, s - 2))} className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
                       <Type className="h-4 w-4" />
                     </button>
                     <input type="range" min="14" max="40" step="2" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="flex-1 accent-brand-blue h-1.5 bg-black/10 dark:bg-white/20 rounded-full appearance-none outline-none" />
                     <button onClick={() => setFontSize(s => Math.min(40, s + 2))} className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
                       <Type className="h-5 w-5" />
                     </button>
                  </div>
               </div>

               {/* Font Family */}
               <div>
                  <label className="text-[11px] font-bold text-muted-foreground mb-2 block uppercase tracking-wider">نوع الخط</label>
                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => setFontFamily('font-read')} className={`text-right px-4 py-2.5 rounded-2xl text-sm transition-colors ${fontFamily === 'font-read' ? 'bg-brand-blue/10 text-brand-blue font-bold shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
                      الخط الافتراضي (نسخ)
                    </button>
                    <button onClick={() => setFontFamily('font-sans')} className={`text-right px-4 py-2.5 rounded-2xl text-sm font-sans transition-colors ${fontFamily === 'font-sans' ? 'bg-brand-blue/10 text-brand-blue font-bold shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
                      خط حديث (Sans)
                    </button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </nav>"""

new_nav = r"""      {/* Top Navigation Bar (Study Mode Style) */}
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

        <div className="flex items-center gap-2 relative h-full py-2" ref={settingsRef}>
          <button 
            onClick={() => { setDistractionFree(true); setShowSettings(false); }}
            className="w-10 h-10 rounded-xl flex justify-center items-center text-muted-foreground border border-transparent hover:border-border hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground transition-all"
            title="وضع ملء الشاشة"
          >
            <Maximize className="h-5 w-5" />
          </button>
          
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className={`w-10 h-10 rounded-xl flex justify-center items-center transition-all ${showSettings ? 'bg-brand-blue text-white shadow-md' : 'text-muted-foreground border border-transparent hover:border-border hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'}`}
            title="إعدادات القراءة"
          >
            <Settings2 className="h-5 w-5" />
          </button>
          
          {/* Settings Dropdown (Pops out below) */}
          {showSettings && (
            <div className={`absolute top-full left-0 mt-2 w-[280px] backdrop-blur-2xl border rounded-3xl shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2 ${readerTheme === 'dark' ? 'bg-[#0d071a]/95 border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.7)]' : readerTheme === 'sepia' ? 'bg-[#F4ECD8]/95 border-[#D4C4A8] shadow-[#D4C4A8]/40' : 'bg-white/95 border-gray-200 shadow-xl'}`}>
               {/* Theme */}
               <div className="mb-5">
                  <label className="text-[11px] font-bold text-muted-foreground mb-2 block uppercase tracking-wider">مظهر القراءة</label>
                  <div className="flex gap-2">
                     <button onClick={() => setReaderTheme('light')} className={`flex-1 py-2 rounded-2xl border transition-all ${readerTheme === 'light' ? 'border-brand-blue bg-brand-blue/10 text-brand-blue shadow-sm' : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'} flex flex-col items-center justify-center gap-1.5`}>
                       <Sun className="h-4 w-4" />
                       <span className="text-[10px] font-semibold">فاتح</span>
                     </button>
                     <button onClick={() => setReaderTheme('sepia')} className={`flex-1 py-2 rounded-2xl border transition-all ${readerTheme === 'sepia' ? 'border-[#d3c6a6] bg-[#e4dac0] text-[#5b4636] shadow-sm' : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'} flex flex-col items-center justify-center gap-1.5`}>
                       <BookOpen className="h-4 w-4" />
                       <span className="text-[10px] font-semibold">ورقي</span>
                     </button>
                     <button onClick={() => setReaderTheme('dark')} className={`flex-1 py-2 rounded-2xl border transition-all ${readerTheme === 'dark' ? 'border-brand-blue bg-brand-blue/10 text-brand-blue shadow-sm' : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'} flex flex-col items-center justify-center gap-1.5`}>
                       <Moon className="h-4 w-4" />
                       <span className="text-[10px] font-semibold">داكن</span>
                     </button>
                  </div>
               </div>

               {/* Font Size */}
               <div className="mb-5">
                  <label className="text-[11px] font-bold text-muted-foreground mb-2 flex justify-between uppercase tracking-wider">
                    <span>حجم الخط</span>
                    <span className="text-brand-blue">{fontSize}px</span>
                  </label>
                  <div className="flex items-center gap-3">
                     <button onClick={() => setFontSize(s => Math.max(14, s - 2))} className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
                       <Type className="h-4 w-4" />
                     </button>
                     <input type="range" min="14" max="40" step="2" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="flex-1 accent-brand-blue h-1.5 bg-black/10 dark:bg-white/20 rounded-full appearance-none outline-none" />
                     <button onClick={() => setFontSize(s => Math.min(40, s + 2))} className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
                       <Type className="h-5 w-5" />
                     </button>
                  </div>
               </div>

               {/* Font Family */}
               <div>
                  <label className="text-[11px] font-bold text-muted-foreground mb-2 block uppercase tracking-wider">نوع الخط</label>
                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => setFontFamily('font-read')} className={`text-right px-4 py-2.5 rounded-2xl text-sm transition-colors ${fontFamily === 'font-read' ? 'bg-brand-blue/10 text-brand-blue font-bold shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
                      الخط الافتراضي (نسخ)
                    </button>
                    <button onClick={() => setFontFamily('font-sans')} className={`text-right px-4 py-2.5 rounded-2xl text-sm font-sans transition-colors ${fontFamily === 'font-sans' ? 'bg-brand-blue/10 text-brand-blue font-bold shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
                      خط حديث (Sans)
                    </button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace Container */}
      <div className="flex-1 flex overflow-hidden w-full relative p-2 md:p-4 gap-4">
"""

content = content.replace(old_nav, new_nav)

# Close the newly added div at the end
old_end = r"""        {/* Floating Pagination Footer */}"""
new_end = r"""      </div>
      {/* Floating Pagination Footer */}"""

if new_end not in content:
    content = content.replace(old_end, new_end)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Nav bar updated to horizontal top bar.")
