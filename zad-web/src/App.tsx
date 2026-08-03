import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun, BookOpen, MessageSquare, Home, Plus, MessageCircle, X, Menu, Mic } from 'lucide-react';
import { ChatPage } from './pages/ChatPage';
import { VoiceChatPage } from './pages/VoiceChatPage';
import KnowledgeBase from './components/knowledge/KnowledgeBase';
import { type Book } from './components/knowledge/data';
import './index.css';

// Starry Background Component for Islamic Theme
const StarryBackground = () => {
  const [stars, setStars] = useState<{ id: number, left: string, top: string, size: string, duration: string, delay: string }[]>([]);

  useEffect(() => {
    // Generate static stars once on mount to avoid hydration mismatches or re-renders
    const generatedStars = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 2.5 + 1}px`,
      duration: `${Math.random() * 3 + 2}s`,
      delay: `${Math.random() * 4}s`,
      driftDuration: `${Math.random() * 15 + 15}s`
    }));
    setStars(generatedStars);
  }, []);

  return (
    <div className="animated-bg-container">

      {/* Twinkling Stars */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
        {stars.map(star => (
          <div
            key={star.id}
            className="twinkle-star"
            style={{
              position: 'absolute',
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              backgroundColor: 'var(--star-color)',
              borderRadius: '50%',
              boxShadow: '0 0 8px var(--star-shadow-1), 0 0 12px var(--star-shadow-2)',
              animation: `twinkle ${star.duration} infinite alternate ${star.delay}, driftStar ${star.driftDuration} infinite alternate linear`
            }}
          />
        ))}
      </div>

      {/* Subtle Noise for texture */}
      <div className="noise-overlay"></div>
    </div>
  );
};

// Context for theme sharing
export const ThemeContext = React.createContext({ theme: 'light', toggleTheme: () => { } });

// Layout Component with Sidebar & Header
const Layout = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState('light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const isVoiceCall = location.pathname === '/voice';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--bg-color)', position: 'relative' }}>

        {/* Islamic Starry Background */}
        <StarryBackground />

        {/* Sidebar (History Only) */}
        {!isVoiceCall && (
          <aside style={{
            width: isSidebarOpen ? '300px' : '0',
            opacity: isSidebarOpen ? 1 : 0,
            pointerEvents: isSidebarOpen ? 'auto' : 'none',
            backgroundColor: 'var(--card-bg)',
            borderLeft: isSidebarOpen ? '1px solid rgba(0,0,0,0.05)' : 'none',
            padding: isSidebarOpen ? '24px 20px' : '0',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            zIndex: 40,
            boxShadow: '-2px 0 10px rgba(0,0,0,0.02)',
            overflowY: 'auto',
            overflowX: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            flexShrink: 0
          }}>

            {/* Header: Logo, Title, and Close Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', flexShrink: 0,
                  borderRadius: '50%',
                  background: 'var(--gradient-text)',
                  padding: '2px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    width: '100%', height: '100%',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img src="/ZadDarkLogo.png" alt="Zad" style={{ width: '75%', height: '75%', objectFit: 'contain' }} className="dark-invert" />
                  </div>
                </div>
                <h1 className="gradient-text" style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>زاد</h1>
              </div>

              <button
                onClick={() => setIsSidebarOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-color)',
                  cursor: 'pointer',
                  opacity: 0.5,
                  padding: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.opacity = '1'}
                onMouseOut={e => e.currentTarget.style.opacity = '0.5'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Main Navigation Tabs (Moved to Sidebar) */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '8px',
              background: 'var(--bg-color)',
              padding: '8px',
              borderRadius: '20px',
              border: '1px solid rgba(0,0,0,0.03)',
              marginBottom: '8px'
            }}>
              <TabLink to="/" label="الرئيسية" icon={<Home size={18} />} active={location.pathname === '/'} />
              <TabLink to="/chat" label="المحادثة" icon={<MessageSquare size={18} />} active={location.pathname === '/chat'} />
              <TabLink to="/study" label="وضع الدراسة" icon={<BookOpen size={18} />} active={location.pathname === '/study'} />
            </div>

            {/* New Chat Button - Primary Action */}
            <button style={{
              width: '100%',
              padding: '14px',
              borderRadius: '16px',
              background: 'var(--gradient-primary)',
              color: 'white',
              fontSize: '15px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(106, 27, 154, 0.3)',
              transition: 'transform 0.2s ease',
            }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Plus size={20} />
              <span>محادثة جديدة</span>
            </button>


            {/* Chat History Section */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', marginTop: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-color)', margin: '0 8px 4px 0', opacity: 0.7 }}>سجل المحادثات</h3>

              <ChatHistoryGroup title="اليوم">
                <ChatHistoryItem title="ما حكم من صلى بدون وضوء ثم تذكر..." />
              </ChatHistoryGroup>

              <ChatHistoryGroup title="منذ يومين">
                <ChatHistoryItem title="حكم الحلف بالله في البيع وهل كثرته..." />
                <ChatHistoryItem title="ما هو اسمك" />
              </ChatHistoryGroup>

              <ChatHistoryGroup title="محادثات سابقة">
                <ChatHistoryItem title="ما إعراب قوله تعالى: واتقوا يوماً تر..." />
                <ChatHistoryItem title="عليكم ورحمة الله وبركاته" />
              </ChatHistoryGroup>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'margin 0.3s ease',
          position: 'relative'
        }}>

          {/* Top Navbar */}
          {!isVoiceCall && (
            <header style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 24px',
              backgroundColor: 'transparent',
              borderBottom: 'none',
              zIndex: 50

            }}>
              {/* Right Area: Sidebar Toggle & Padding */}
              <div style={{ display: 'flex', alignItems: 'center', minWidth: '80px' }}>
                {!isSidebarOpen && (
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    style={{
                      padding: '8px',
                      borderRadius: '12px',
                      backgroundColor: 'transparent',
                      color: 'var(--text-color)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <Menu size={24} />
                  </button>
                )}
              </div>

              {/* Left Area: Theme Toggle & Login */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '80px', justifyContent: 'flex-end' }}>
                <button
                  onClick={toggleTheme}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '10px', borderRadius: '50%',
                    backgroundColor: 'var(--field-bg)',
                    color: 'var(--text-color)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--color-primary)'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--field-bg)'}
                >
                  {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                <button style={{
                  padding: '8px 20px',
                  borderRadius: '20px',
                  background: 'transparent',
                  color: 'var(--color-primary)',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  border: '1px solid rgba(106, 27, 154, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                  onMouseOver={e => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.color = 'white'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                >
                  تسجيل الدخول
                </button>
              </div>
            </header>
          )}

          {/* Page Content */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {children}
          </div>
        </main>
      </div>
    </ThemeContext.Provider>
  );
};

const ChatHistoryGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <span style={{ fontSize: '13px', opacity: 0.5, fontWeight: '700', padding: '0 4px', textAlign: 'right', color: 'var(--text-color)' }}>{title}</span>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {children}
    </div>
  </div>
);

const ChatHistoryItem = ({ title, active }: { title: string, active?: boolean }) => (
  <button style={{
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '8px 4px', borderRadius: '12px',
    backgroundColor: 'transparent',
    color: 'var(--text-color)',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'right',
    justifyContent: 'flex-start',
    width: '100%'
  }}>
    <div style={{
      padding: '8px',
      borderRadius: '12px',
      backgroundColor: active ? 'rgba(46, 204, 113, 0.15)' : 'rgba(192, 132, 252, 0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <MessageSquare size={18} color={active ? '#2ECC71' : 'var(--color-accent)'} />
    </div>
    <span style={{
      fontSize: '14px', flex: 1,
      fontWeight: active ? '700' : '500',
      opacity: active ? 1 : 0.7,
      color: active ? '#2ECC71' : 'var(--text-color)',
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      textAlign: 'right', direction: 'rtl'
    }}>
      {title}
    </span>
  </button>
);

const TabLink = ({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active?: boolean }) => {
  return (
    <Link
      to={to}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 20px', borderRadius: '16px',
        color: active ? 'var(--color-primary)' : 'var(--text-color)',
        backgroundColor: active ? 'var(--card-bg)' : 'transparent',
        transition: 'all 0.2s ease',
        textDecoration: 'none',
        fontWeight: active ? '700' : '600',
        fontSize: '14px',
        boxShadow: active ? '0 2px 10px rgba(0,0,0,0.05)' : 'none'
      }}
      onMouseOver={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'var(--card-bg)';
          e.currentTarget.style.color = 'var(--color-primary)';
        }
      }}
      onMouseOut={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = 'var(--text-color)';
        }
      }}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

// Pages
const HomePage = () => {
  const navigate = useNavigate();
  const { theme } = React.useContext(ThemeContext);

  return (
    <div style={{
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Background Image Pattern */}
      {theme === 'dark' && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'url("/image.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          opacity: 0.15,
          zIndex: 0,
          pointerEvents: 'none'
        }} />
      )}

      {/* Scrolling Content Wrapper */}
      <div style={{
        padding: '60px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1
      }}>
      {/* Hero Section */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        gap: '40px',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
        zIndex: 10
      }}>

        {/* Welcome Text */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontFamily: '"Aref Ruqaa", serif',
            fontSize: '56px',
            fontWeight: '700',
            margin: '0 0 16px 0',
            paddingTop: '16px', // Prevent top clipping of Arabic ascenders
            lineHeight: 1.4,
            textShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            السلام عليكم..
          </h1>
          <p style={{
            fontFamily: '"Aref Ruqaa", serif',
            fontSize: '32px',
            color: 'var(--text-color)',
            margin: 0,
            fontWeight: '400',
            opacity: 0.9,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
          }}>
            <span className="gradient-text" style={{ fontSize: '38px', fontWeight: '700' }}>زاد</span> رفيقك الذكي في طلب العلم الشرعي
          </p>
        </div>

        {/* Big Search Bar (Navigates to Chat) */}
        <div style={{ width: '100%', maxWidth: '750px', position: 'relative' }} className="animated-gradient-border">
          <div className="animated-gradient-border-inner" style={{
            padding: '4px',
            backgroundColor: 'var(--frame-bg)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '28px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              backgroundColor: 'var(--card-bg)',
              borderRadius: '24px',
              padding: '12px 12px 12px 24px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.02)'
            }}>
              <input
                type="text"
                placeholder="ابحث في آلاف المراجع أو اسأل المساعد الذكي..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate('/chat');
                }}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: '16px',
                  fontSize: '18px',
                  color: 'var(--text-color)',
                  fontFamily: 'var(--font-family)',
                  outline: 'none',
                }}
              />
              <button
                className="animated-gradient-bg"
                onClick={() => navigate('/chat')}
                style={{
                  padding: '16px 32px',
                  borderRadius: '18px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  transition: 'transform 0.2s ease',
                  boxShadow: '0 4px 15px rgba(106, 27, 154, 0.3)'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                إسأل الآن
              </button>
            </div>
          </div>
        </div>

        {/* Suggested Questions */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '-10px' }}>
          <SuggestedChip text="ما حكم صيام المسافر؟" onClick={() => navigate('/chat')} />
          <SuggestedChip text="قارن بين المذاهب في المواريث" onClick={() => navigate('/chat')} />
          <SuggestedChip text="اشرح لي مبطلات الوضوء" onClick={() => navigate('/chat')} />
          <SuggestedChip text="أريد كتاباً في تفسير القرآن" onClick={() => navigate('/chat')} />
        </div>
      </div>

      {/* Bottom Feature Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '24px',
        marginTop: '80px',
        maxWidth: '1000px',
        margin: '80px auto 0 auto',
        width: '100%',
        zIndex: 10
      }}>
        <FeatureCard
          icon={<BookOpen size={32} color="white" />}
          title="وضع الدراسة المتقدم"
          description="بيئة دراسية عميقة خالية من التشتيت، تعتمد على المقارنة العلمية الشاملة بين المذاهب الأربعة لتأصيل المسائل."
          gradient="linear-gradient(135deg, #4A148C, #6A1B9A)"
        />
        <FeatureCard
          icon={<MessageSquare size={32} color="white" />}
          title="المحادثة الفورية"
          description="تفاعل بمرونة مع زاد للحصول على إجابات سريعة وموثوقة مدعومة بمئات المراجع الإسلامية المعتمدة."
          gradient="var(--gradient-primary)"
          onClick={() => navigate('/chat')}
        />
        <FeatureCard
          icon={<Mic size={32} color="white" />}
          title="المحادثة الصوتية المباشرة"
          description="تحدث مع الذكاء الاصطناعي وكأنك في مكالمة هاتفية، واحصل على إجابات صوتية دقيقة وطبيعية."
          gradient="linear-gradient(135deg, #FF6B6B, #C54EEC)"
          onClick={() => navigate('/voice')}
        />
      </div>
      </div>
    </div>
  );
};

const SuggestedChip = ({ text, onClick }: { text: string, onClick?: () => void }) => (
  <button
    onClick={onClick}
    style={{
      padding: '12px 24px',
      borderRadius: '24px',
      backgroundColor: 'var(--frame-bg)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid var(--frame-border)',
      color: 'var(--text-color)',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
    }}
    onMouseOver={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.borderColor = 'var(--color-primary)';
      e.currentTarget.style.boxShadow = '0 6px 20px rgba(106, 27, 154, 0.15)';
    }}
    onMouseOut={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = 'var(--frame-border)';
      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.02)';
    }}
  >
    {text}
  </button>
);

const FeatureCard = ({ icon, title, description, gradient, onClick }: { icon: React.ReactNode, title: string, description: string, gradient: string, onClick?: () => void }) => (
  <div
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      padding: '32px',
      backgroundColor: 'var(--frame-bg)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: '32px',
      border: '1px solid var(--frame-border)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',

      cursor: 'pointer'
    }}
    onMouseOver={e => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 12px 40px rgba(106, 27, 154, 0.08)';
    }}
    onMouseOut={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.03)';
    }}
  >
    <div style={{
      padding: '16px',
      background: gradient,
      borderRadius: '20px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{title}</h3>
      <p style={{ opacity: 0.6, lineHeight: 1.6, margin: 0, fontSize: '14px' }}>{description}</p>
    </div>
  </div>
);

const StudyPage = () => {
  const navigate = useNavigate();
  const handleAskBook = (book: Book) => {
    navigate('/chat', { state: { initialQuestion: `حدّثني عن كتاب "${book.title}" للمؤلف ${book.author}، وما أبرز موضوعاته؟` } });
  };
  return <KnowledgeBase onExit={() => navigate('/')} onAskBook={handleAskBook} />;
};

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/voice" element={<VoiceChatPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
