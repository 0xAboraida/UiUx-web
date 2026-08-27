import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FeatureCards from './components/FeatureCards'
import HowItWorks from './components/HowItWorks'
import Showcase from './components/Showcase'
import CTA from './components/CTA'
import Footer from './components/Footer'
import ChatScreen from './components/chat/ChatScreen'
import VoiceScreen from './components/voice/VoiceScreen'
import KnowledgeBase from './components/knowledge/KnowledgeBase'
import StudyMode from './components/study/StudyMode'
import AdminDashboard from './components/admin/AdminDashboard'
import type { Book } from './components/knowledge/data'

type View = 'home' | 'chat' | 'voice' | 'knowledge' | 'study' | 'admin'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [pendingQuestion, setPendingQuestion] = useState<string | undefined>()
  const [heroTheme, setHeroTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    document.documentElement.dir = 'rtl'
    document.documentElement.lang = 'ar'
  }, [])

  const askAboutBook = (book: Book) => {
    setPendingQuestion(`حدّثني عن كتاب "${book.title}" للمؤلف ${book.author}، وما أبرز موضوعاته؟`)
    setView('chat')
  }

  const askQuestion = (question: string) => {
    setPendingQuestion(question)
    setView('chat')
  }

  if (view === 'chat') {
    return (
      <ChatScreen
        onExit={() => setView('home')}
        onOpenVoice={() => setView('voice')}
        initialQuestion={pendingQuestion}
        onConsumeInitial={() => setPendingQuestion(undefined)}
      />
    )
  }
  if (view === 'voice') {
    return <VoiceScreen onExit={() => setView('home')} onOpenText={() => setView('chat')} />
  }
  if (view === 'knowledge') {
    return <KnowledgeBase onExit={() => setView('home')} onAskBook={askAboutBook} theme={heroTheme} />
  }
  if (view === 'study') {
    return <StudyMode onExit={() => setView('home')} />
  }
  if (view === 'admin') {
    return <AdminDashboard onExit={() => setView('home')} />
  }

  const openChat = () => setView('chat')
  const openVoice = () => setView('voice')
  const openKnowledge = () => setView('knowledge')
  const openStudy = () => setView('study')
  const openAdmin = () => setView('admin')

  return (
    <div dir="rtl" className={`min-h-screen bg-background text-foreground transition-colors duration-300 ${heroTheme === 'dark' ? 'dark' : ''}`}>
      <Navbar
        onTryChat={openChat}
        onOpenKnowledge={openKnowledge}
        onOpenStudy={openStudy}
        onOpenAdmin={openAdmin}
        onOpenVoiceChat={openVoice}
        heroTheme={heroTheme}
        onToggleTheme={() => setHeroTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      />
      <main>
        <Hero onTryChat={openChat} onTryVoice={openVoice} onAsk={askQuestion} theme={heroTheme} />
        <FeatureCards />
        <HowItWorks />
        <Showcase />
        <CTA onTryChat={openChat} />
      </main>
      <Footer />
    </div>
  )
}
