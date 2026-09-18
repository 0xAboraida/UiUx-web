import os
import re

file_path = r'src/features/knowledge/TurathReader.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add states
states_hook = """
  const [sidebarWidth, setSidebarWidth] = useState(360)
  const [isResizing, setIsResizing] = useState(false)

  const startResizing = React.useCallback((e: React.MouseEvent) => {
    setIsResizing(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none' // Prevent text selection
    e.preventDefault()
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const railWidth = window.innerWidth >= 768 ? 80 : 64 // md:w-20 or w-16
      const newWidth = document.body.clientWidth - e.clientX - railWidth
      if (newWidth > 280 && newWidth < 800) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false)
        document.body.style.cursor = 'default'
        document.body.style.userSelect = 'auto'
      }
    }

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])
"""

# Insert states after chatInput
state_marker = 'const [chatInput, setChatInput] = useState("")'
content = content.replace(state_marker, state_marker + states_hook)

# 2. Update Aside wrapper
aside_start = """      {/* Sliding Panel Area (TOC / Chat) */}
      <aside 
        className={`shrink-0 h-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-30 ${
          distractionFree || sidebarTab === 'none' ? 'w-0 opacity-0 overflow-hidden' : 'w-[320px] md:w-[360px] opacity-100 border-l'
        } ${readerTheme === 'dark' ? 'border-white/10 bg-[#121826]/40' : readerTheme === 'sepia' ? 'border-[#D4C4A8] bg-[#EAE0C8]/40' : 'border-gray-200/60 bg-white/40'} backdrop-blur-md`}
      >"""

aside_new = """      {/* Sliding Panel Area (TOC / Chat) */}
      <aside 
        className={`shrink-0 h-full relative ${isResizing ? '' : 'transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]'} z-30 ${
          distractionFree || sidebarTab === 'none' ? 'opacity-0 overflow-hidden border-none' : 'opacity-100 border-l'
        } ${readerTheme === 'dark' ? 'border-white/10 bg-[#121826]/40' : readerTheme === 'sepia' ? 'border-[#D4C4A8] bg-[#EAE0C8]/40' : 'border-gray-200/60 bg-white/40'} backdrop-blur-md`}
        style={{ width: distractionFree || sidebarTab === 'none' ? 0 : sidebarWidth }}
      >
        {/* Resize Handle (Left edge in RTL) */}
        {(sidebarTab !== 'none' && !distractionFree) && (
          <div 
            className="absolute top-0 bottom-0 left-0 w-2 -translate-x-1 cursor-col-resize z-50 hover:bg-brand-magenta/30 transition-colors"
            onMouseDown={startResizing}
          />
        )}
"""
content = content.replace(aside_start, aside_new)

# Update the inner div width to match 100% instead of hardcoded
inner_div = '<div className="w-[320px] md:w-[360px] h-full flex flex-col relative">'
new_inner_div = '<div className="w-full h-full flex flex-col relative">'
content = content.replace(inner_div, new_inner_div)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied resizing script!")
