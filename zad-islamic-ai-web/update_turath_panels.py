import re

file_path = r"e:\AI\AI-Code\ML Codes\UiUx-web\zad-islamic-ai-web\src\features\knowledge\TurathReader.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update aside (TOC Panel)
old_aside = r"""      <aside 
        className={`shrink-0 h-full relative ${isResizing ? '' : 'transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]'} z-30 ${
          distractionFree || sidebarTab === 'none' ? 'opacity-0 overflow-hidden border-none' : 'opacity-100 border-l'
        } ${readerTheme === 'dark' ? 'border-white/5 bg-[#0d071a]/85 shadow-[-10px_0_30px_rgba(0,0,0,0.4)]' : readerTheme === 'sepia' ? 'border-[#D4C4A8] bg-[#EAE0C8]/40' : 'border-gray-200/60 bg-white/40'} backdrop-blur-md`}"""

new_aside = r"""      <aside 
        className={`shrink-0 h-full relative rounded-3xl overflow-hidden ${isResizing ? '' : 'transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]'} z-30 ${
          distractionFree || sidebarTab === 'none' ? 'opacity-0 border-none' : 'opacity-100 border'
        } ${readerTheme === 'dark' ? 'border-white/10 bg-[#0d071a]/60 shadow-[0_0_40px_rgba(0,0,0,0.5)]' : readerTheme === 'sepia' ? 'border-[#D4C4A8] bg-[#EAE0C8]/70 shadow-[0_0_20px_rgba(212,196,168,0.3)]' : 'border-gray-200/80 bg-white/70 shadow-lg'} backdrop-blur-xl`}"""
content = content.replace(old_aside, new_aside)

# 2. Update main reading area
old_main = r"""      <main className="flex-1 relative h-full flex flex-col overflow-hidden">"""
new_main = r"""      <main className={`flex-1 relative h-full flex flex-col overflow-hidden rounded-3xl border backdrop-blur-xl ${readerTheme === 'dark' ? 'border-white/10 bg-[#0d071a]/60 shadow-[0_0_40px_rgba(0,0,0,0.5)]' : readerTheme === 'sepia' ? 'border-[#D4C4A8] bg-[#EAE0C8]/70 shadow-[0_0_20px_rgba(212,196,168,0.3)]' : 'border-gray-200/80 bg-white/70 shadow-lg'}`}>"""
content = content.replace(old_main, new_main)

# 3. Add Metadata Badges inside Main, under Book Title Floating Banner
old_banner = r"""        {/* Book Title Floating Banner */}
        <div className={`absolute top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none transition-all duration-500 ${distractionFree ? 'opacity-0 -translate-y-4' : 'opacity-100'}`}>
           <h2 className="font-display text-xl md:text-2xl font-bold opacity-40 mix-blend-multiply dark:mix-blend-screen">{book.title}</h2>
        </div>"""

new_banner = r"""        {/* Book Title & Metadata Header */}
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
content = content.replace(old_banner, new_banner)

# Fix background color of inner content (reading text). Because we have an immersive background now, the text should just sit inside the glass container.
old_reading_content = r"""<div className={`${readerTheme === 'dark' ? 'dark-reader' : readerTheme === 'sepia' ? 'sepia-reader' : ''}`}>"""
new_reading_content = r"""<div className={`mt-24 ${readerTheme === 'dark' ? 'dark-reader' : readerTheme === 'sepia' ? 'sepia-reader' : ''}`}>"""
content = content.replace(old_reading_content, new_reading_content)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Panels and metadata updated.")
