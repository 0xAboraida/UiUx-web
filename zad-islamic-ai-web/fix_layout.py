import os

file_path = r'src/features/knowledge/TurathReader.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the header from its current position
header_start = "{/* Floating Header */}"
workspace_start = "{/* Workspace Area */}"
header_content = content[content.find(header_start):content.find(workspace_start)]

content = content.replace(header_content, "")

# 2. Modify the header content to be simpler and fit inside main
new_header_content = """{/* Floating Header */}
          <header className={`absolute top-4 left-4 right-4 z-40 flex shrink-0 items-center justify-between rounded-3xl border px-6 py-3 transition-all duration-500 backdrop-blur-xl shadow-lg ${distractionFree ? 'opacity-0 -translate-y-full pointer-events-none' : 'opacity-100 translate-y-0'} ${readerTheme === 'dark' ? 'bg-[#121826]/80 border-white/10 shadow-black/50' : readerTheme === 'sepia' ? 'bg-[#EAE0C8]/80 border-[#D4C4A8] shadow-[#D4C4A8]/30' : 'bg-white/80 border-gray-200/60 shadow-gray-200/50'}`}>
            {/* Reading Progress Bar (Top edge of header) */}
            <div className="absolute top-0 right-8 left-8 h-[2px] bg-black/5 dark:bg-white/5 overflow-hidden rounded-full">
               <div className="h-full brand-gradient transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="rounded-full p-2.5 bg-black/5 dark:bg-white/5 hover:bg-brand-magenta hover:text-white transition-all text-muted-foreground shadow-sm group" title="إغلاق الكتاب">
                <ArrowRight className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              </button>
              
              {sidebarTab === 'none' && (
                <button 
                  onClick={() => setSidebarTab('toc')} 
                  className="rounded-full p-2.5 bg-brand-magenta/10 text-brand-magenta hover:bg-brand-magenta hover:text-white transition-all shadow-sm"
                  title="إظهار القائمة الجانبية"
                >
                  <ListTree className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Centered Title */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center pointer-events-none">
              <h2 className="font-display text-lg md:text-xl font-bold drop-shadow-sm line-clamp-1">{book.title}</h2>
              <p className="text-[11px] text-brand-blue font-bold opacity-80 line-clamp-1">{book.author}</p>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`rounded-full p-2.5 transition-all duration-200 ${showSettings ? 'bg-brand-blue text-white shadow-md' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground'}`}
                  title="إعدادات القراءة"
                >
                  <Settings2 className="h-5 w-5" />
                </button>
                
                {/* Settings Dropdown */}
                {showSettings && (
                  <div className={`absolute top-14 left-0 w-[280px] backdrop-blur-2xl border rounded-3xl shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2 ${readerTheme === 'dark' ? 'bg-[#1A2235]/95 border-white/10 shadow-black/50' : readerTheme === 'sepia' ? 'bg-[#F4ECD8]/95 border-[#D4C4A8] shadow-[#D4C4A8]/40' : 'bg-white/95 border-gray-200 shadow-xl'}`}>
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
              
              <button
                onClick={() => { setDistractionFree(true); setShowSettings(false); }}
                className="rounded-full p-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground hidden sm:block"
                title="وضع ملء الشاشة (بدون تشتيت)"
              >
                <Maximize className="h-5 w-5" />
              </button>
            </div>
          </header>\n"""

# 3. Insert the new header inside `<main className="...">`
main_start = '<main className="flex-1 flex flex-col relative h-full transition-all duration-500 overflow-hidden">'
content = content.replace(main_start, main_start + "\n" + new_header_content)

# 4. Remove `pt-4` from Workspace Area
workspace_area = '<div className="flex flex-1 overflow-hidden relative w-full h-full pt-4">'
content = content.replace(workspace_area, '<div className="flex flex-1 overflow-hidden relative w-full h-full p-4 gap-4">')

# 5. Fix Sidebar styling to fit the new gap/padding layout
sidebar_start = '<aside \n          className={`shrink-0 flex flex-col h-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-30'
sidebar_end_class = '`}\n        >'
content = content.replace(sidebar_start + ' ' + '${' + "\n            distractionFree || sidebarTab === 'none' ? 'w-0 opacity-0 overflow-hidden' : 'w-[320px] md:w-[380px] lg:w-[420px] opacity-100'\n          }" + sidebar_end_class, sidebar_start + ' ${' + "\n            distractionFree || sidebarTab === 'none' ? 'w-0 opacity-0 overflow-hidden' : 'w-[320px] md:w-[340px] opacity-100'\n          }" + sidebar_end_class)

# Remove the internal margins of the sidebar since we added a gap-4 to the parent
sidebar_inner = 'mx-4 mb-4 rounded-3xl border flex flex-col shadow-2xl backdrop-blur-xl'
content = content.replace(sidebar_inner, 'rounded-3xl border flex flex-col shadow-2xl backdrop-blur-xl')
content = content.replace('h-[calc(100%-2rem)]', 'h-full')

# Add close button to the sidebar tabs
sidebar_tabs = """<button 
                onClick={() => setSidebarTab('chat')} 
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold transition-all ${sidebarTab === 'chat' ? 'bg-brand-magenta text-white shadow-md' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'}`}
              >
                <Sparkles className="h-4 w-4" /> مساعد القراءة
              </button>"""
sidebar_tabs_with_close = sidebar_tabs + """
              <button 
                onClick={() => setSidebarTab('none')} 
                className="p-2 ml-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground transition-colors"
                title="إغلاق"
              >
                <X className="h-4 w-4" />
              </button>"""
content = content.replace(sidebar_tabs, sidebar_tabs_with_close)


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied layout fixes!")
