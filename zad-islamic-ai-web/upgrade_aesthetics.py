import os

file_path = r'src/features/knowledge/TurathReader.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Main Background in Dark Mode
main_bg_old = "readerTheme === 'dark' ? 'bg-[#0B0F19] text-white' : readerTheme === 'sepia' ? 'bg-[#F4ECD8] text-[#5C4B37]' : 'bg-[#FAFAFA] text-foreground'"
main_bg_new = "readerTheme === 'dark' ? 'bg-[#080410] text-slate-100 selection:bg-brand-magenta/30' : readerTheme === 'sepia' ? 'bg-[#F4ECD8] text-[#5C4B37]' : 'bg-[#FAFAFA] text-foreground'"
content = content.replace(main_bg_old, main_bg_new)

# 2. Vertical Icon Rail (Sidebar Toolbar)
rail_old = "readerTheme === 'dark' ? 'bg-[#121826]/90 border-white/10' : readerTheme === 'sepia' ? 'bg-[#EAE0C8]/90 border-[#D4C4A8]' : 'bg-white/90 border-gray-200/80'"
rail_new = "readerTheme === 'dark' ? 'bg-[#0a0514]/95 border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)]' : readerTheme === 'sepia' ? 'bg-[#EAE0C8]/90 border-[#D4C4A8]' : 'bg-white/90 border-gray-200/80'"
content = content.replace(rail_old, rail_new)

# 3. Settings Dropdown
settings_old = "readerTheme === 'dark' ? 'bg-[#1A2235]/95 border-white/10 shadow-black/50' : readerTheme === 'sepia' ? 'bg-[#F4ECD8]/95 border-[#D4C4A8] shadow-[#D4C4A8]/40' : 'bg-white/95 border-gray-200 shadow-xl'"
settings_new = "readerTheme === 'dark' ? 'bg-[#0d071a]/95 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.7)]' : readerTheme === 'sepia' ? 'bg-[#F4ECD8]/95 border-[#D4C4A8] shadow-[#D4C4A8]/40' : 'bg-white/95 border-gray-200 shadow-xl'"
content = content.replace(settings_old, settings_new)

# 4. Sliding Panel Area
aside_old = "readerTheme === 'dark' ? 'border-white/10 bg-[#121826]/40' : readerTheme === 'sepia' ? 'border-[#D4C4A8] bg-[#EAE0C8]/40' : 'border-gray-200/60 bg-white/40'"
aside_new = "readerTheme === 'dark' ? 'border-white/5 bg-[#0d071a]/85 shadow-[-10px_0_30px_rgba(0,0,0,0.4)]' : readerTheme === 'sepia' ? 'border-[#D4C4A8] bg-[#EAE0C8]/40' : 'border-gray-200/60 bg-white/40'"
content = content.replace(aside_old, aside_new)

# 5. Insert Ambient Glows inside the sliding panel
panel_inner_old = '<div className="w-full h-full flex flex-col relative">'
panel_inner_new = """<div className="w-full h-full flex flex-col relative">
          {readerTheme === 'dark' && (
            <>
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-magenta/15 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-brand-blue/15 rounded-full blur-[80px] pointer-events-none"></div>
            </>
          )}"""
content = content.replace(panel_inner_old, panel_inner_new)

# 6. Sliding Panel Header
header_old = "readerTheme === 'dark' ? 'border-white/10' : readerTheme === 'sepia' ? 'border-[#D4C4A8]' : 'border-gray-200/60'"
header_new = "readerTheme === 'dark' ? 'border-white/5 bg-white/[0.02]' : readerTheme === 'sepia' ? 'border-[#D4C4A8]' : 'border-gray-200/60'"
content = content.replace(header_old, header_new)

# 7. TOC Search Input
search_old = "readerTheme === 'dark' ? 'bg-black/20 text-white placeholder-white/40' : readerTheme === 'sepia' ? 'bg-white/40 text-[#5C4B37] placeholder-[#5C4B37]/50 border border-[#D4C4A8]/50' : 'bg-black/5 text-foreground placeholder-black/40'"
search_new = "readerTheme === 'dark' ? 'bg-white/5 border border-white/10 text-white placeholder-white/40 focus:bg-white/10' : readerTheme === 'sepia' ? 'bg-white/40 text-[#5C4B37] placeholder-[#5C4B37]/50 border border-[#D4C4A8]/50' : 'bg-black/5 text-foreground placeholder-black/40'"
content = content.replace(search_old, search_new)

# 8. Empty Chat Icon background
chat_icon_old = "readerTheme === 'dark' ? 'bg-[#0f041c]/80 border border-white/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-white border border-primary/20 shadow-[0_0_12px_rgba(168,85,247,0.2)]'"
chat_icon_new = "readerTheme === 'dark' ? 'bg-gradient-to-br from-brand-magenta/20 to-brand-blue/20 border border-brand-magenta/30 shadow-[0_0_20px_rgba(168,85,247,0.25)]' : 'bg-white border border-primary/20 shadow-[0_0_12px_rgba(168,85,247,0.2)]'"
content = content.replace(chat_icon_old, chat_icon_new)

# 9. Book content max-width container background for dark mode (if any)
# Currently it's a floating footer, let's make it glow in dark mode
floating_footer_old = "readerTheme === 'dark' ? 'bg-[#181825] text-gray-200 border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' : readerTheme === 'sepia' ? 'bg-[#f4ecd8] text-[#5b4636] border-[#d3c6a6]/50 shadow-[0_8px_32px_rgba(91,70,54,0.1)]'"
floating_footer_new = "readerTheme === 'dark' ? 'bg-[#120a1f]/95 backdrop-blur-xl text-gray-200 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_20px_rgba(168,85,247,0.1)]' : readerTheme === 'sepia' ? 'bg-[#f4ecd8] text-[#5b4636] border-[#d3c6a6]/50 shadow-[0_8px_32px_rgba(91,70,54,0.1)]'"
content = content.replace(floating_footer_old, floating_footer_new)


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied Glassmorphic aesthetics!")
