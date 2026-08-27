import 'regenerator-runtime/runtime'
import { useEffect, useState } from 'react'
import darkLogo from '@/assets/images/ZadDarkLogo.png'
import Navbar from './components/layout/Navbar'
import Hero from './components/layout/Hero'
import FeatureCards from './components/layout/FeatureCards'
import HowItWorks from './components/layout/HowItWorks'
import Showcase from './components/layout/Showcase'
import CTA from './components/layout/CTA'
import Footer from './components/layout/Footer'
import ChatScreen from './features/chat/ChatScreen'
import VoiceScreen from './features/voice/VoiceScreen'
import KnowledgeBase from './features/knowledge/KnowledgeBase'
import StudyMode from './features/study/StudyMode'
import AdminDashboard from './features/admin/AdminDashboard'
import AuthPage from './features/auth/AuthPage'
import type { Book } from './features/knowledge/data'
import { StudyProvider } from './contexts/StudyContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { TextSelectionToolbar } from './components/common/TextSelectionToolbar'

type View = 'home' | 'chat' | 'voice' | 'knowledge' | 'study' | 'admin' | 'login' | 'signup'

function AppContent() {
  const [view, setView] = useState<View>('home')
  const [isNavigating, setIsNavigating] = useState(false)
  const [pendingQuestion, setPendingQuestion] = useState<string | undefined>()
  const { isAuthenticated } = useAuth()
  const { isDark } = useTheme()

  const navigate = (newView: View) => {
    if (view === newView) return
    setIsNavigating(true)
    setTimeout(() => {
      // @ts-ignore - View Transitions API
      if (document.startViewTransition) {
        // @ts-ignore
        document.startViewTransition(() => {
          setView(newView)
          setIsNavigating(false)
        })
      } else {
        setView(newView)
        setIsNavigating(false)
      }
    }, 300)
  }

  useEffect(() => {
    document.documentElement.dir = 'rtl'
    document.documentElement.lang = 'ar'
  }, [])

  const askAboutBook = (book: Book) => {
    setPendingQuestion(`حدّثني عن كتاب "${book.title}" للمؤلف ${book.author}، وما أبرز موضوعاته؟`)
    navigate('chat')
  }

  const askQuestion = (question: string) => {
    setPendingQuestion(question)
    navigate('chat')
  }

  const openChat = () => isAuthenticated ? navigate('chat') : navigate('login')
  const openVoice = () => isAuthenticated ? navigate('voice') : navigate('login')
  const openKnowledge = () => navigate('knowledge')
  const openStudy = () => isAuthenticated ? navigate('study') : navigate('login')
  const openAdmin = () => navigate('admin')

  const renderView = () => {
    if (view === 'login' || view === 'signup') {
      return (
        <AuthPage 
          initialMode={view} 
          onBack={() => navigate('home')} 
          onSuccess={() => navigate('home')} 
        />
      )
    }
    if (view === 'chat') {
      return (
        <ChatScreen
          onExit={() => navigate('home')}
          onOpenVoice={() => navigate('voice')}
          initialQuestion={pendingQuestion}
          onConsumeInitial={() => setPendingQuestion(undefined)}
        />
      )
    }
    if (view === 'voice') {
      return <VoiceScreen onExit={() => navigate('home')} onOpenText={() => navigate('chat')} />
    }
    if (view === 'knowledge') {
      return <KnowledgeBase onExit={() => navigate('home')} onAskBook={askAboutBook} />
    }
    if (view === 'study') {
      return <StudyMode onExit={() => navigate('home')} />
    }
    if (view === 'admin') {
      return <AdminDashboard onExit={() => navigate('home')} />
    }

    return (
      <div dir="rtl" className={`min-h-screen bg-background text-foreground transition-colors duration-300 ${isDark ? 'dark' : ''}`}>
        <Navbar
          onTryChat={openChat}
          onOpenKnowledge={openKnowledge}
          onOpenStudy={openStudy}
          onOpenAdmin={openAdmin}
          onOpenVoiceChat={openVoice}
        />
        <main>
          <Hero onTryChat={openChat} onTryVoice={openVoice} onAsk={askQuestion} />
          <FeatureCards />
          <HowItWorks />
          <Showcase />
          <CTA onTryChat={openChat} />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <StudyProvider>
      <div className="relative min-h-screen w-full overflow-hidden bg-background">
        <div 
          key={view === 'login' || view === 'signup' ? 'auth' : view} 
          className="min-h-screen w-full"
        >
          {renderView()}
        </div>
        <TextSelectionToolbar dark={isDark} />
      </div>
    </StudyProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}
