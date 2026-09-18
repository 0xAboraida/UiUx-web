import os

file_path = r'src/features/knowledge/TurathReader.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

split_marker = '  return (\n    <div dir="rtl"'
if split_marker not in content:
    print("Split marker not found!")
    exit(1)

pre_return = content.split(split_marker)[0]

new_return = split_marker + """ className={`fixed inset-0 z-50 flex transition-colors duration-500 overflow-hidden ${readerTheme === 'dark' ? 'bg-[#0B0F19] text-white' : readerTheme === 'sepia' ? 'bg-[#F4ECD8] text-[#5C4B37]' : 'bg-[#FAFAFA] text-foreground'} animate-in fade-in zoom-in-95 duration-300`}>
      
      {/* Vertical Icon Rail (Sidebar Toolbar) */}
      <nav 
        className={`shrink-0 h-full w-16 md:w-20 flex flex-col items-center py-6 gap-6 z-40 transition-transform duration-500 border-l ${distractionFree ? 'translate-x-full opacity-0 absolute' : 'translate-x-0 opacity-100'} ${readerTheme === 'dark' ? 'bg-[#121826]/90 border-white/10' : readerTheme === 'sepia' ? 'bg-[#EAE0C8]/90 border-[#D4C4A8]' : 'bg-white/90 border-gray-200/80'}`}
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
            <ListTree className="h-6 w-6" />
          </button>
          
          <button 
            onClick={() => setSidebarTab(sidebarTab === 'chat' ? 'none' : 'chat')} 
            className={`p-3 rounded-2xl flex justify-center items-center transition-all ${sidebarTab === 'chat' ? 'bg-brand-magenta text-white shadow-md scale-105' : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'}`}
            title="مساعد القراءة"
          >
            <Sparkles className="h-6 w-6" />
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
            <div className={`absolute bottom-0 right-full mr-4 w-[280px] backdrop-blur-2xl border rounded-3xl shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-right-2 ${readerTheme === 'dark' ? 'bg-[#1A2235]/95 border-white/10 shadow-black/50' : readerTheme === 'sepia' ? 'bg-[#F4ECD8]/95 border-[#D4C4A8] shadow-[#D4C4A8]/40' : 'bg-white/95 border-gray-200 shadow-xl'}`}>
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
      </nav>

      {/* Sliding Panel Area (TOC / Chat) */}
      <aside 
        className={`shrink-0 h-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-30 ${
          distractionFree || sidebarTab === 'none' ? 'w-0 opacity-0 overflow-hidden' : 'w-[320px] md:w-[360px] opacity-100 border-l'
        } ${readerTheme === 'dark' ? 'border-white/10 bg-[#121826]/40' : readerTheme === 'sepia' ? 'border-[#D4C4A8] bg-[#EAE0C8]/40' : 'border-gray-200/60 bg-white/40'} backdrop-blur-md`}
      >
        <div className="w-[320px] md:w-[360px] h-full flex flex-col relative">
          
          {/* Header of the sliding panel */}
          <div className={`flex items-center justify-between p-5 border-b ${readerTheme === 'dark' ? 'border-white/10' : readerTheme === 'sepia' ? 'border-[#D4C4A8]' : 'border-gray-200/60'}`}>
             <h3 className="font-bold font-display text-lg flex items-center gap-2">
               {sidebarTab === 'toc' ? <><ListTree className="h-5 w-5 text-brand-magenta" /> الفهرس</> : <><Sparkles className="h-5 w-5 text-brand-magenta" /> المساعد</>}
             </h3>
             <button 
               onClick={() => setSidebarTab('none')}
               className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground"
             >
               <X className="h-4 w-4" />
             </button>
          </div>

          <div className="flex-1 overflow-hidden relative">
            {/* TOC Panel */}
            <div className={`absolute inset-0 flex flex-col transition-all duration-300 ${sidebarTab === 'toc' ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-4 pointer-events-none -z-10'}`}>
              <div className="p-4">
                <div className="relative group">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-brand-magenta transition-colors" />
                  <input
                    type="text"
                    placeholder="ابحث في العناوين..."
                    value={tocSearch}
                    onChange={(e) => setTocSearch(e.target.value)}
                    className={`w-full rounded-2xl pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-magenta transition-all shadow-inner ${readerTheme === 'dark' ? 'bg-black/20 text-white placeholder-white/40' : readerTheme === 'sepia' ? 'bg-white/40 text-[#5C4B37] placeholder-[#5C4B37]/50 border border-[#D4C4A8]/50' : 'bg-black/5 text-foreground placeholder-black/40'}`}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
                {loadingBook ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-magenta" />
                    <p className="text-sm font-semibold">جاري تحميل الفهرس...</p>
                  </div>
                ) : filteredToc.length === 0 ? (
                  <div className={`p-8 text-center text-sm rounded-2xl mt-4 ${readerTheme === 'dark' ? 'bg-white/5 text-white/60' : 'bg-black/5 text-black/60'}`}>لا توجد نتائج مطابقة للبحث</div>
                ) : tocSearch ? (
                  <div className="space-y-1">
                    {filteredToc.map((heading, idx) => {
                      const isExactActive = currentPage === heading.page;
                      return (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(heading.page)}
                          className={`w-full flex items-center justify-between py-3 px-3 text-sm rounded-xl transition-all duration-200 group ${isExactActive
                              ? 'bg-brand-magenta/10 text-brand-magenta font-bold border-r-4 border-r-brand-magenta'
                              : 'text-inherit hover:bg-black/5 dark:hover:bg-white/5 border-r-4 border-r-transparent'
                            }`}
                        >
                          <span className="truncate text-right max-w-[80%] leading-relaxed">{heading.title}</span>
                          <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors ${isExactActive ? 'bg-brand-magenta/20 text-brand-magenta' : 'bg-black/5 dark:bg-white/10 text-muted-foreground group-hover:bg-black/10 dark:group-hover:bg-white/20'}`}>
                            صـ {heading.page}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="space-y-1">
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
            </div>

            {/* Chat Panel */}
            <div className={`absolute inset-0 flex flex-col transition-all duration-300 ${sidebarTab === 'chat' ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 -translate-x-4 pointer-events-none -z-10'}`}>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar relative">
                 {chatHistory.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-70">
                     <div className="w-16 h-16 rounded-full bg-brand-magenta/10 flex items-center justify-center mb-4">
                       <Sparkles className="h-8 w-8 text-brand-magenta" />
                     </div>
                     <p className="font-bold mb-2">كيف يمكنني مساعدتك؟</p>
                     <p className="text-sm opacity-80 leading-relaxed">حدد أي نص من الكتاب واضغط "اشرح" أو اسألني مباشرة وسأقوم بتوضيحه لك.</p>
                   </div>
                 ) : (
                   chatHistory.map((msg) => (
                     <Bubble key={msg.id} message={msg} dark={readerTheme === 'dark' || readerTheme === 'sepia'} />
                   ))
                 )}
                 {chatLoading && (
                   <TypingBubble dark={readerTheme === 'dark' || readerTheme === 'sepia'} />
                 )}
              </div>

              <div className={`p-4 border-t ${readerTheme === 'dark' ? 'border-white/10 bg-[#1A2235]' : readerTheme === 'sepia' ? 'border-[#D4C4A8] bg-[#EAE0C8]' : 'border-gray-200/60 bg-white'}`}>
                <form onSubmit={handleSendChatMessage} className="flex flex-col w-full gap-2 relative">
                  <div className="gradient-border min-w-0 flex-1 rounded-[22px] p-[2px] shadow-lg shadow-primary/20 transition-all duration-300">
                    <div className={`flex items-end gap-2 rounded-[20px] py-1.5 pr-4 pl-2 transition-all duration-300 ${readerTheme === 'dark' ? 'bg-[#1A2235]' : readerTheme === 'sepia' ? 'bg-[#F4ECD8]' : 'bg-white'}`}>
                      <textarea
                        rows={1}
                        className={`font-sans min-w-0 flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:opacity-50 [&::-webkit-scrollbar]:hidden`}
                        value={chatInput} 
                        onChange={e => setChatInput(e.target.value)} 
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendChatMessage(e as any);
                          }
                        }}
                        placeholder="اكتب سؤالك هنا..."
                        disabled={chatLoading}
                      />
                      <button 
                        type="submit"
                        disabled={!chatInput.trim() || chatLoading}
                        className="brand-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                      >
                        <Send className="h-4 w-4 rtl:-scale-x-100" />
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Reading Area */}
      <main className="flex-1 relative h-full flex flex-col overflow-hidden">
        
        {/* Distraction Free Exit Button */}
        {distractionFree && (
          <div className="fixed top-6 right-6 z-50 transition-opacity duration-300 opacity-30 hover:opacity-100">
            <button 
              onClick={() => setDistractionFree(false)}
              className="p-3 rounded-full bg-black/40 text-white hover:bg-brand-magenta backdrop-blur-md shadow-lg transition-all hover:scale-110"
              title="إنهاء وضع ملء الشاشة"
            >
              <Minimize className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Book Title Floating Banner */}
        <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none transition-all duration-500 ${distractionFree ? 'opacity-0 -translate-y-4' : 'opacity-100'}`}>
           <h2 className="font-display text-xl md:text-2xl font-bold opacity-40 mix-blend-multiply dark:mix-blend-screen">{book.title}</h2>
        </div>

        {/* Reading Progress Line */}
        {!distractionFree && (
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-black/5 dark:bg-white/5 z-20">
             <div className="h-full brand-gradient transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 md:px-12 lg:px-24 pb-32 pt-24 custom-scrollbar relative flex justify-center">
          <div className={`w-full max-w-4xl min-h-full transition-colors duration-500`}>
            {loadingPage ? (
              <div className="h-[60vh] flex flex-col items-center justify-center opacity-70 gap-5">
                <div className="relative">
                  <div className="absolute inset-0 brand-gradient rounded-full blur-xl opacity-40 animate-pulse" />
                  <Loader2 className="h-12 w-12 animate-spin text-brand-magenta relative z-10" />
                </div>
                <p className="font-bold text-lg animate-pulse tracking-wide">جاري إعداد الصفحة...</p>
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
                    className={`turath-content prose prose-lg max-w-none leading-[2.4] selection:bg-brand-magenta/30 selection:text-brand-deep dark:selection:text-white ${fontFamily}`}
                    style={{ fontSize: `${fontSize}px` }}
                    dangerouslySetInnerHTML={{ __html: pageText.main }}
                  />
                  
                  {pageText.footnote && (
                    <div className={`mt-16 pt-8 border-t text-sm transition-colors duration-500 ${readerTheme === 'dark' ? 'border-white/20' : readerTheme === 'sepia' ? 'border-[#D4C4A8]' : 'border-gray-300'}`}>
                      <div
                        className={`turath-content prose max-w-none leading-loose opacity-80 ${fontFamily}`}
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

        {/* Floating Pagination Footer */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ${distractionFree ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
          <footer className={`flex items-center gap-2 px-3 py-2 rounded-2xl border backdrop-blur-xl shadow-2xl ${readerTheme === 'dark' ? 'bg-[#121826]/90 border-white/10 shadow-black/50' : readerTheme === 'sepia' ? 'bg-[#EAE0C8]/90 border-[#D4C4A8] shadow-[#D4C4A8]/40' : 'bg-white/90 border-gray-200/80 shadow-gray-200/50'}`}>
            <button
              onClick={goPrev}
              disabled={currentPage <= 1}
              className="flex items-center justify-center p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-brand-magenta hover:text-white transition-all duration-300 font-bold shadow-sm disabled:opacity-40 disabled:pointer-events-none group"
            >
              <ChevronRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" /> 
            </button>

            <div className="flex items-center gap-2 text-sm font-bold opacity-80 px-4">
              <form onSubmit={handlePageSubmit} className="flex items-center">
                <input
                  type="number"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onBlur={handlePageSubmit}
                  className={`w-14 text-center rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-brand-magenta transition-colors font-sans ${readerTheme === 'dark' ? 'bg-black/20 text-white' : 'bg-black/5 text-inherit'}`}
                  min="1"
                />
              </form>
              <span>/</span>
              <span>{maxPage}</span>
            </div>

            <button
              onClick={goNext}
              disabled={currentPage >= (maxPage || 1)}
              className="flex items-center justify-center p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-brand-magenta hover:text-white transition-all duration-300 font-bold shadow-sm disabled:opacity-40 disabled:pointer-events-none group"
            >
               <ChevronLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          </footer>
        </div>
      </main>
    </div>
  )
}
"""

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(pre_return + new_return)

print("Applied vertical rail layout!")
