import os

file_path = r'src/features/knowledge/TurathReader.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace('ListTree,', 'BookText,')

# 2. TocNode arrows
arrow_old = """          {hasChildren ? (
            <button
              onClick={() => toggleExpand(node.originalIndex)}
              className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            </button>"""
arrow_new = """          {hasChildren ? (
            <button
              onClick={() => toggleExpand(node.originalIndex)}
              className="p-1 rounded-md bg-black/5 border border-black/5 dark:bg-white/10 dark:border-white/10 shadow-sm transition-all text-muted-foreground hover:text-brand-magenta hover:scale-105"
            >
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} /> : <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.5} />}
            </button>"""
content = content.replace(arrow_old, arrow_new)

# 3. Sidebar Rail TOC Icon & Header TOC Icon
content = content.replace('<ListTree', '<BookText')

# 4. Close Button
close_old = """             <button 
               onClick={() => setSidebarTab('none')}
               className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground"
             >
               <X className="h-4 w-4" />
             </button>"""
close_new = """             <button 
               onClick={() => setSidebarTab('none')}
               className="p-2 rounded-full backdrop-blur-md bg-black/5 border border-black/5 dark:bg-white/10 dark:border-white/10 hover:bg-brand-magenta hover:text-white hover:border-transparent transition-all text-muted-foreground shadow-sm"
             >
               <X className="h-4 w-4" strokeWidth={2.5} />
             </button>"""
content = content.replace(close_old, close_new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied TOC UI updates!")
