import os

file_path = r'src/features/knowledge/TurathReader.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace the rail button Sparkles
rail_sparkles_old = '<Sparkles className="h-6 w-6" />'
rail_sparkles_new = "{sidebarTab === 'chat' ? <img src={whiteLogo} alt=\"Zad\" className=\"h-6 w-6 object-contain\" /> : <img src={readerTheme === 'dark' ? whiteLogo : zadDarkLogo} alt=\"Zad\" className=\"h-6 w-6 object-contain opacity-70 group-hover:opacity-100 transition-opacity\" />}"
content = content.replace(rail_sparkles_old, rail_sparkles_new)

# 2. Replace the sliding panel header Sparkles
header_sparkles_old = '<Sparkles className="h-5 w-5 text-brand-magenta" />'
header_sparkles_new = '<img src={readerTheme === \'dark\' ? whiteLogo : zadDarkLogo} alt="Zad" className="h-5 w-5 object-contain" />'
content = content.replace(header_sparkles_old, header_sparkles_new)

# 3. Replace the empty state Sparkles
empty_state_old = """                     <div className="w-16 h-16 rounded-full bg-brand-magenta/10 flex items-center justify-center mb-4">
                       <Sparkles className="h-8 w-8 text-brand-magenta" />
                     </div>"""
empty_state_new = """                     <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${readerTheme === 'dark' ? 'bg-[#0f041c]/80 border border-white/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-white border border-primary/20 shadow-[0_0_12px_rgba(168,85,247,0.2)]'}`}>
                       <img src={readerTheme === 'dark' ? whiteLogo : zadDarkLogo} alt="Zad" className="h-8 w-8 object-contain drop-shadow-md" />
                     </div>"""
content = content.replace(empty_state_old, empty_state_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied Logo replacements!")
