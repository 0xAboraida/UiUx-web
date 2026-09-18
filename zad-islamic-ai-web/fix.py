import os

file_path = r'src/features/knowledge/TurathReader.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Split the content at the `return (` statement
split_marker = '  return (\n    <div dir="rtl" className="fixed inset-0 z-50 flex flex-col bg-background dot-grid text-foreground animate-in fade-in zoom-in-95 duration-300 overflow-hidden">'
if split_marker not in content:
    print("Split marker not found!")
    exit(1)

pre_return = content.split(split_marker)[0]

new_return = split_marker + """
      {/* Main Content Area */}
      <div className={`flex flex-1 overflow-hidden relative transition-all duration-300 ease-in-out ${isChatOpen ? 'md:mr-[28rem]' : ''}`}>
        
        {/* Sidebar TOC */}
        <aside className={`border-l border-white/20 dark:border-white/10 bg-white/50 dark:bg-black/40 backdrop-blur-2xl flex-col shadow-[inset_-1px_0_0_rgba(255,255,255,0.05)] transition-all duration-500 z-10 ${distractionFree ? 'w-0 opacity-0 overflow-hidden' : 'w-[320px] md:w-[340px] opacity-100 hidden md:flex'}`}>
          <div className="p-5 border-b border-white/10 dark:border-white/5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-foreground font-bold font-display text-lg">
              <ListTree className="h-5 w-5 text-brand-magenta" /> الفهرس
            </div>
            <div className="relative group">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-brand-magenta transition-colors" />
              <input
                type="text"
                placeholder="ابحث في العناوين..."
                value={tocSearch}
                onChange={(e) => setTocSearch(e.target.value)}
                className="w-full bg-white/60 dark:bg-black/60 border border-white/40 dark:border-white/10 rounded-xl pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-magenta backdrop-blur-md shadow-inner transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            {loadingBook ? (
              <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-brand-magenta" />
                <p className="text-sm font-semibold">جاري تحميل الفهرس...</p>
              </div>
            ) : filteredToc.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground bg-black/5 dark:bg-white/5 rounded-xl mt-4">لا توجد نتائج مطابقة للبحث</div>
            ) : tocSearch ? (
              <div className="space-y-0.5">
                {filteredToc.map((heading, idx) => {
                  const isExactActive = currentPage === heading.page;
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(heading.page)}
                      className={`w-full flex items-center justify-between py-2.5 px-3 text-sm rounded-lg transition-all duration-200 group ${isExactActive
                          ? 'bg-brand-magenta/15 text-brand-magenta font-bold border-r-4 border-r-brand-magenta shadow-sm'
                          : 'text-foreground hover:bg-black/5 dark:hover:bg-white/5 border-r-4 border-r-transparent'
                        }`}
                    >
                      <span className="truncate text-right max-w-[80%] leading-relaxed">{heading.title}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors ${isExactActive ? 'bg-brand-magenta/20 text-brand-magenta' : 'bg-black/5 dark:bg-white/10 text-muted-foreground group-hover:bg-background/80'
                        }`}>
                        صـ {heading.page}
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-0.5">
                {tocTree.map(node => (
                  <TocNode
                    key={node.originalIndex}
                    node={node}
                    expandedNodes={expandedNodes}
                    toggleExpand={toggleExpand}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main Area */}
        <main className={`flex-1 flex flex-col relative bg-transparent transition-all duration-500`}>
          
          {/* Header */}
          <header className={`relative z-40 flex shrink-0 items-center justify-between border-b border-white/20 dark:border-white/10 bg-white/60 dark:bg-black/60 px-6 backdrop-blur-2xl shadow-sm transition-all duration-500 origin-top ${distractionFree ? 'h-0 opacity-0 border-none overflow-hidden pointer-events-none' : 'h-16 opacity-100 overflow-visible'}`}>
            {/* Reading Progress Bar */}
            <div className="absolute top-0 right-0 h-1 brand-gradient transition-all duration-300 z-50" style={{ width: `${progressPercent}%` }} />
            
            <div className="flex items-center gap-4">
              <button onClick={onClose} className="rounded-full p-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground shadow-sm">
                <ArrowRight className="h-5 w-5" />
              </button>
              <div className="flex flex-col">
                <h2 className="font-display text-lg md:text-xl font-bold text-foreground drop-shadow-sm line-clamp-1">{book.title}</h2>
                <p className="text-xs text-brand-blue font-bold opacity-80 line-clamp-1">{book.author}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`rounded-full p-2 transition-all duration-200 ${showSettings ? 'bg-brand-blue/20 text-brand-blue' : 'hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground'}`}
                  title="إعدادات القراءة"
                >
                  <Settings2 className="h-5 w-5" />
                </button>
                
                {/* Settings Dropdown */}
                {showSettings && (
                  <div className="absolute top-12 left-0 w-[280px] bg-white/95 dark:bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2">
                     {/* Theme */}
                     <div className="mb-5">
                        <label className="text-[11px] font-bold text-muted-foreground mb-2 block uppercase tracking-wider">مظهر القراءة</label>
                        <div className="flex gap-2">
                           <button onClick={() => setReaderTheme('light')} className={`flex-1 py-2 rounded-xl border transition-all ${readerTheme === 'light' ? 'border-brand-blue bg-brand-blue/10 text-brand-blue shadow-sm' : 'border-border/50 hover:bg-black/5 dark:hover:bg-white/5'} flex flex-col items-center justify-center gap-1.5`}>
                             <Sun className="h-4 w-4" />
                             <span className="text-[10px] font-semibold">فاتح</span>
                           </button>
                           <button onClick={() => setReaderTheme('sepia')} className={`flex-1 py-2 rounded-xl border transition-all ${readerTheme === 'sepia' ? 'border-[#d3c6a6] bg-[#e4dac0] text-[#5b4636] shadow-sm' : 'border-border/50 hover:bg-black/5 dark:hover:bg-white/5'} flex flex-col items-center justify-center gap-1.5`}>
                             <BookOpen className="h-4 w-4" />
                             <span className="text-[10px] font-semibold">ورقي</span>
                           </button>
                           <button onClick={() => setReaderTheme('dark')} className={`flex-1 py-2 rounded-xl border transition-all ${readerTheme === 'dark' ? 'border-brand-blue bg-brand-blue/10 text-brand-blue shadow-sm' : 'border-border/50 hover:bg-black/5 dark:hover:bg-white/5'} flex flex-col items-center justify-center gap-1.5`}>
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
                          <button onClick={() => setFontFamily('font-read')} className={`text-right px-3 py-2 rounded-lg text-sm transition-colors ${fontFamily === 'font-read' ? 'bg-brand-blue/10 text-brand-blue font-bold shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
                            الخط الافتراضي (نسخ)
                          </button>
                          <button onClick={() => setFontFamily('font-sans')} className={`text-right px-3 py-2 rounded-lg text-sm font-sans transition-colors ${fontFamily === 'font-sans' ? 'bg-brand-blue/10 text-brand-blue font-bold shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
                            خط حديث (Sans)
                          </button>
                        </div>
                     </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => { setDistractionFree(true); setShowSettings(false); }}
                className="rounded-full p-2 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground hidden sm:block"
                title="وضع ملء الشاشة (بدون تشتيت)"
              >
                <Maximize className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => setIsChatOpen(true)}
                className="rounded-xl brand-gradient px-4 py-2 text-sm font-bold text-white shadow-lg shadow-brand-magenta/20 hover:scale-105 hover:shadow-brand-magenta/40 transition-all duration-300 border border-white/20 flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" /> مساعد القراءة
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 custom-scrollbar relative group/main">
            {/* Distraction Free Exit Button */}
            {distractionFree && (
              <div className="fixed top-6 right-6 z-50 opacity-0 group-hover/main:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={() => setDistractionFree(false)}
                  className="p-3 rounded-full bg-black/40 text-white hover:bg-brand-magenta backdrop-blur-md shadow-lg transition-all hover:scale-110"
                  title="إنهاء وضع ملء الشاشة"
                >
                  <Minimize className="h-5 w-5" />
                </button>
              </div>
            )}
            
            <div className={`mx-auto max-w-4xl min-h-full p-8 md:p-14 lg:p-20 rounded-3xl border relative transition-colors duration-500 ${readerThemeClasses[readerTheme]}`}>
              {loadingPage ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-5 bg-inherit rounded-3xl z-10 backdrop-blur-sm">
                  <div className="relative">
                    <div className="absolute inset-0 brand-gradient rounded-full blur-xl opacity-40 animate-pulse" />
                    <Loader2 className="h-12 w-12 animate-spin text-brand-blue relative z-10" />
                  </div>
                  <p className="font-bold text-lg animate-pulse tracking-wide">جاري تحميل الصفحة...</p>
                </div>
              ) : pageText ? (
                <div className="animate-in fade-in duration-700">
                  <style>{`
                    .turath-content span[data-type="title"] {
                      display: block;
                      font-weight: 800;
                      font-size: 1.6em;
                      text-align: center;
                      margin: 3rem 0 2rem 0;
                      color: var(--color-brand-deep);
                    }
                    .dark-reader .turath-content span[data-type="title"] {
                        color: #e9d5ff;
                    }
                    .sepia-reader .turath-content span[data-type="title"] {
                        color: #5c3f22;
                    }
                    .turath-content span[data-type="poetry"] {
                      display: block;
                      text-align: center;
                      color: var(--color-primary);
                      font-style: italic;
                      margin: 1.5rem 0;
                      font-size: 1.1em;
                    }
                    .turath-content {
                        white-space: pre-wrap;
                        word-wrap: break-word;
                        text-align: justify;
                    }
                  `}</style>
                  <div className={`${readerTheme === 'dark' ? 'dark-reader' : readerTheme === 'sepia' ? 'sepia-reader' : ''}`}>
                    <div
                      className={`turath-content prose prose-lg max-w-none leading-[2.4] selection:bg-brand-magenta/30 selection:text-brand-deep dark:selection:text-white ${fontFamily} ${readerTextClasses[readerTheme]}`}
                      style={{ fontSize: `${fontSize}px` }}
                      dangerouslySetInnerHTML={{ __html: pageText.main }}
                    />
                    
                    {pageText.footnote && (
                      <div className={`mt-16 pt-8 border-t text-sm transition-colors duration-500 ${readerTheme === 'dark' ? 'border-white/20' : readerTheme === 'sepia' ? 'border-[#d3c6a6]' : 'border-gray-300'}`}>
                        <div
                          className={`turath-content prose max-w-none leading-loose opacity-80 ${fontFamily} ${readerTextClasses[readerTheme]}`}
                          style={{ fontSize: `${Math.max(12, fontSize - 4)}px` }}
                          dangerouslySetInnerHTML={{ __html: pageText.footnote }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Pagination Footer */}
          <footer className={`shrink-0 border-t border-white/20 dark:border-white/10 bg-white/60 dark:bg-black/60 backdrop-blur-2xl flex items-center justify-between px-6 md:px-10 shadow-[0_-4px_24px_rgba(0,0,0,0.03)] transition-all duration-500 origin-bottom overflow-hidden ${distractionFree ? 'h-0 opacity-0 border-none' : 'h-20 opacity-100'}`}>
            <button
              onClick={goPrev}
              disabled={currentPage <= 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-white/10 text-foreground hover:bg-brand-magenta hover:text-white transition-all duration-300 font-bold text-sm shadow-sm border border-white/40 dark:border-transparent group disabled:opacity-40 disabled:pointer-events-none hover:shadow-brand-magenta/30 hover:shadow-lg"
            >
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /> <span className="hidden sm:inline">الصفحة السابقة</span>
            </button>

            <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground bg-white/50 dark:bg-black/50 px-5 py-2.5 rounded-2xl border border-white/40 dark:border-white/10 backdrop-blur-md shadow-inner">
              <span className="hidden sm:inline">صفحة</span>
              <form onSubmit={handlePageSubmit} className="flex items-center">
                <input
                  type="number"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onBlur={handlePageSubmit}
                  className="w-16 text-center bg-white/90 dark:bg-black/80 px-2 py-1.5 rounded-lg border border-border/50 focus:outline-none focus:ring-2 focus:ring-brand-magenta focus:border-transparent font-sans shadow-sm"
                  min="1"
                />
              </form>
              <span className="hidden sm:inline">من {maxPage}</span>
            </div>

            <button
              onClick={goNext}
              disabled={currentPage >= (maxPage || 1)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/80 dark:bg-white/10 text-foreground hover:bg-brand-magenta hover:text-white transition-all duration-300 font-bold text-sm shadow-sm border border-white/40 dark:border-transparent group disabled:opacity-40 disabled:pointer-events-none hover:shadow-brand-magenta/30 hover:shadow-lg"
            >
              <span className="hidden sm:inline">الصفحة التالية</span> <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            </button>
          </footer>
        </main>
      </div>

      {/* Chat Sidebar Panel */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-full md:w-[28rem] bg-card border-l border-border z-[60] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border bg-brand-blue/5">
           <h3 className="font-display font-bold flex items-center gap-2 text-brand-magenta">
             <Sparkles className="h-5 w-5" /> مساعد القراءة (زاد)
           </h3>
           <button 
             onClick={() => setIsChatOpen(false)}
             className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground transition-colors"
           >
             <X className="h-5 w-5" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar bg-secondary/10">
           {chatHistory.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8 opacity-70">
               <Sparkles className="h-12 w-12 text-brand-magenta/40 mb-4" />
               <p className="font-semibold mb-2">أهلاً بك في مساعد القراءة</p>
               <p className="text-sm">حدد أي نص من الكتاب واضغط "اشرح" أو اسألني مباشرة وسأقوم بتوضيحه لك.</p>
             </div>
           ) : (
             chatHistory.map((msg, idx) => (
               <div 
                 key={idx} 
                 className={`p-4 rounded-2xl max-w-[90%] shadow-sm ${
                   msg.role === 'user' 
                     ? 'bg-brand-magenta text-white self-end rounded-tr-sm' 
                     : 'bg-card border border-border text-foreground self-start rounded-tl-sm prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-headings:font-display'
                 }`}
               >
                  {msg.role === 'user' ? (
                    <div className="whitespace-pre-wrap text-sm font-semibold">{msg.content}</div>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\\n/g, '<br/>') }} />
                  )}
               </div>
             ))
           )}
           {chatLoading && (
             <div className="flex items-center gap-3 text-muted-foreground self-start bg-card border border-border p-4 rounded-2xl rounded-tl-sm w-[80%]">
               <Loader2 className="animate-spin text-brand-magenta h-5 w-5" />
               <span className="text-sm font-semibold animate-pulse">زاد يقوم بالتفكير...</span>
             </div>
           )}
        </div>

        <div className="p-4 border-t border-border bg-card">
          <form onSubmit={handleSendChatMessage} className="relative flex items-center">
            <input 
              className="w-full bg-secondary text-foreground text-sm rounded-xl py-3 px-4 outline-none placeholder:text-muted-foreground border border-transparent focus:border-brand-magenta/40 transition-colors pr-12"
              value={chatInput} 
              onChange={e => setChatInput(e.target.value)} 
              placeholder="اكتب سؤالك هنا عن الكتاب..."
              disabled={chatLoading}
            />
            <button 
              type="submit"
              disabled={!chatInput.trim() || chatLoading}
              className="absolute right-2 p-2 rounded-lg text-brand-magenta hover:bg-brand-magenta/10 disabled:opacity-50 transition-colors"
            >
              <Send className="h-5 w-5 rtl:rotate-180" />
            </button>
          </form>
        </div>
      </div>

    </div>
  )
}
"""

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(pre_return + new_return)

print("Fixed TurathReader.tsx!")
