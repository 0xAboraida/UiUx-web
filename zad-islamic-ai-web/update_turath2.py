import os
import re

file_path = r'src/features/knowledge/TurathReader.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
if 'import { Bubble, TypingBubble }' not in content:
    content = content.replace(
        "import { useTheme } from '../../contexts/ThemeContext'",
        "import { useTheme } from '../../contexts/ThemeContext'\nimport { Bubble, TypingBubble } from '../chat/components/ChatBubble'\nimport type { Message } from '../chat/data'"
    )

# 2. Add isTocOpen state
content = content.replace(
    "const [showSettings, setShowSettings] = useState(false)",
    "const [showSettings, setShowSettings] = useState(false)\n  const [isTocOpen, setIsTocOpen] = useState(true)"
)

# 3. Fix chatHistory type
content = content.replace(
    "const [chatHistory, setChatHistory] = useState<{ role: 'user'|'model', content: string }[]>([])",
    "const [chatHistory, setChatHistory] = useState<Message[]>([])"
)

# 4. Fix handleAskExplain
content = content.replace(
    "const newUserMsg = { role: 'user' as const, content: `اشرح لي هذا النص:\\n\"${textToExplain}\"` };",
    "const newUserMsg: Message = { id: Date.now().toString(), role: 'user' as const, text: `اشرح لي هذا النص:\\n\"${textToExplain}\"` };"
)
content = content.replace(
    "history: chatHistory\n",
    "history: chatHistory.map(msg => ({ role: msg.role === 'model' ? 'model' : 'user', content: msg.text }))\n"
)
content = content.replace(
    "setChatHistory([...newHistory, { role: 'model', content: data.explanation }]);",
    "setChatHistory([...newHistory, { id: Date.now().toString(), role: 'model', text: data.explanation }]);"
)
content = content.replace(
    "setChatHistory([...newHistory, { role: 'model', content: 'عذراً، حدث خطأ أثناء محاولة شرح النص. يرجى المحاولة مرة أخرى.' }]);",
    "setChatHistory([...newHistory, { id: Date.now().toString(), role: 'model', text: 'عذراً، حدث خطأ أثناء محاولة شرح النص. يرجى المحاولة مرة أخرى.' }]);"
)

# 5. Fix handleSendChatMessage
content = content.replace(
    "const newUserMsg = { role: 'user' as const, content: msg };",
    "const newUserMsg: Message = { id: Date.now().toString(), role: 'user' as const, text: msg };"
)
content = content.replace(
    "history: chatHistory.map(msg => ({ role: msg.role === 'model' ? 'model' : 'user', content: msg.text }))",
    "history: chatHistory.map(msg => ({ role: msg.role === 'model' ? 'model' : 'user', content: msg.text }))"
)
content = content.replace(
    "setChatHistory([...newHistory, { id: Date.now().toString(), text: data.explanation, role: 'model' as const }])",
    "setChatHistory([...newHistory, { id: Date.now().toString(), text: data.explanation, role: 'model' as const }])"
)

# 6. Fix Layout and Main Content Area class
content = content.replace(
    "md:mr-[28rem]",
    "md:ml-[28rem]"
)

# 7. Sidebar TOC toggle logic
content = content.replace(
    "w-[320px] md:w-[340px] opacity-100 hidden md:flex",
    "${!isTocOpen ? 'w-0 opacity-0 overflow-hidden hidden' : 'w-[320px] md:w-[340px] opacity-100 hidden md:flex'}"
)
content = content.replace(
    "w-[320px] md:w-[340px] opacity-100 flex",
    "${!isTocOpen ? 'w-0 opacity-0 overflow-hidden hidden' : 'w-[320px] md:w-[340px] opacity-100 hidden md:flex'}"
)

# 8. Add TOC toggle button to Header
old_header_btn = '''<button onClick={onClose} className="rounded-full p-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground shadow-sm">
                <ArrowRight className="h-5 w-5" />
              </button>'''
new_header_btn = '''<button onClick={onClose} className="rounded-full p-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground shadow-sm">
                <ArrowRight className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setIsTocOpen(!isTocOpen)} 
                className="hidden md:flex rounded-full p-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground shadow-sm"
                title="الفهرس"
              >
                <ListTree className="h-5 w-5" />
              </button>'''
content = content.replace(old_header_btn, new_header_btn)

# 9. Update the Chat Sidebar HTML
chat_sidebar_start = "{/* Chat Sidebar Panel */}"
chat_sidebar_html = '''{/* Chat Sidebar Panel */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-full md:w-[28rem] bg-card border-r border-border z-[60] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isChatOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className={`flex items-center justify-between p-4 border-b ${readerTheme === 'dark' ? 'border-white/10 bg-black/40' : 'border-border bg-brand-blue/5'}`}>
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

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar bg-secondary/10 relative">
           {chatHistory.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8 opacity-70">
               <Sparkles className="h-12 w-12 text-brand-magenta/40 mb-4" />
               <p className="font-semibold mb-2">أهلاً بك في مساعد القراءة</p>
               <p className="text-sm">حدد أي نص من الكتاب واضغط "اشرح" أو اسألني مباشرة وسأقوم بتوضيحه لك.</p>
             </div>
           ) : (
             chatHistory.map((msg) => (
               <Bubble key={msg.id} message={msg} dark={readerTheme === 'dark'} />
             ))
           )}
           {chatLoading && (
             <TypingBubble dark={readerTheme === 'dark'} />
           )}
        </div>

        <div className={`p-4 border-t ${readerTheme === 'dark' ? 'border-white/10 bg-black/40' : 'border-border bg-card'}`}>
          <form onSubmit={handleSendChatMessage} className="flex flex-col w-full gap-2 relative">
            <div className="gradient-border min-w-0 flex-1 rounded-[22px] p-[2px] shadow-lg shadow-primary/20 transition-all duration-300">
              <div className={`flex items-end gap-2 rounded-[20px] py-1.5 sm:py-2 pr-3.5 sm:pr-5 pl-2 transition-all duration-300 ${readerTheme === 'dark' ? 'bg-[#1a0730]/90 backdrop-blur-md' : 'bg-white/95 backdrop-blur-md'}`}>
                <textarea
                  rows={1}
                  className={`font-sans min-w-0 flex-1 resize-none bg-transparent py-2 text-sm sm:text-base outline-none placeholder:text-current/50 [&::-webkit-scrollbar]:hidden ${readerTheme === 'dark' ? 'text-white placeholder:text-white/50' : 'text-brand-deep placeholder:text-brand-deep/45'}`}
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChatMessage(e as any);
                    }
                  }}
                  placeholder="اكتب سؤالك هنا عن الكتاب..."
                  disabled={chatLoading}
                />
                <button 
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="brand-gradient flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full text-white shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <Send className="h-4 w-4 rtl:-scale-x-100" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
'''
if chat_sidebar_start in content:
    content = content.split(chat_sidebar_start)[0] + chat_sidebar_html + '\n    </div>\n  )\n}\n'


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied update_turath2 fixes!")
