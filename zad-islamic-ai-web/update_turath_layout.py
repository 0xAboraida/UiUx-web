import re

file_path = r"e:\AI\AI-Code\ML Codes\UiUx-web\zad-islamic-ai-web\src\features\knowledge\TurathReader.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add background imports
if "bgDark" not in content:
    content = content.replace("import whiteLogo", "import bgDark from '@/assets/images/image.webp'\nimport bgLight from '@/assets/images/bg-islamic-light.webp'\nimport whiteLogo")

# 2. Update BookMeta type
content = content.replace("type BookMeta = {\n  id: number\n  title: string\n  author: string\n}", "type BookMeta = {\n  id: number\n  title: string\n  author: string\n  domain?: string\n  madhhab?: string\n  century?: string\n}")

# 3. Modify Main Wrapper to flex-col and add backgrounds
old_wrapper = r"""    <div dir="rtl" className={`fixed inset-0 z-50 flex transition-colors duration-500 overflow-hidden ${readerTheme === 'dark' ? 'bg-[#080410] text-slate-100 selection:bg-brand-magenta/30' : readerTheme === 'sepia' ? 'bg-[#F4ECD8] text-[#5C4B37]' : 'bg-[#FAFAFA] text-foreground'} animate-in fade-in zoom-in-95 duration-300`}>"""

new_wrapper = r"""    <div 
      dir="rtl" 
      className={`fixed inset-0 z-50 flex flex-col transition-colors duration-500 overflow-hidden ${readerTheme === 'dark' ? 'text-slate-100 selection:bg-brand-magenta/30' : readerTheme === 'sepia' ? 'bg-[#F4ECD8] text-[#5C4B37]' : 'text-foreground'} animate-in fade-in zoom-in-95 duration-300`}
      style={{ 
        backgroundImage: readerTheme === 'dark' ? `url(${bgDark})` : (readerTheme === 'light' ? `url(${bgLight})` : 'none'), 
        backgroundSize: 'cover', 
        backgroundPosition: 'center' 
      }}
    >"""
content = content.replace(old_wrapper, new_wrapper)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Basic layout and background updated.")
