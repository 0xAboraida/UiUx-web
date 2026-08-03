import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Send, User, Mic, AudioLines } from 'lucide-react';
import { AiResponseWidget } from '../components/AiResponseWidget';
import { CitationDTO } from '../components/CitationsSection';
import { ThemeContext } from '../App';
import { askChat, createSession } from '../api/zadApi';
import '../index.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  isStreaming?: boolean;
  citations?: Record<string, CitationDTO>;
}

export const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = React.useContext(ThemeContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Initialize Session
  useEffect(() => {
    async function initSession() {
      try {
        const session = await createSession({ name: 'محادثة زاد' });
        if (session.id) setSessionId(session.id);
      } catch (e) {
        console.error('Failed to create session', e);
      }
    }
    initSession();
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);

    const aiId = (Date.now() + 1).toString();
    const initialAiMsg: Message = {
      id: aiId,
      text: 'جاري البحث في مصادر زاد...',
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true
    };
    
    setMessages(prev => [...prev, initialAiMsg]);

    try {
      const res = await askChat({
        session_id: sessionId || 0,
        query: text,
        domain: 1 // default domain
      });

      setMessages(prev => prev.map(msg => {
        if (msg.id === aiId) {
          return {
            ...msg,
            text: res.answer,
            citations: res.citations,
            isStreaming: false
          };
        }
        return msg;
      }));
    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(msg => {
        if (msg.id === aiId) {
          return {
            ...msg,
            text: 'عذراً، حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى لاحقاً (أو التأكد من تسجيل الدخول).',
            isStreaming: false
          };
        }
        return msg;
      }));
    }
  };

  useEffect(() => {
    if (location.state?.initialQuestion && !hasInitialized.current) {
      hasInitialized.current = true;
      const initialQ = location.state.initialQuestion;
      sendMessage(initialQ);
    }
  }, [location.state, sessionId]); // dependency on sessionId so it sends after session init (or falls back to 0)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const text = inputValue;
    setInputValue('');
    sendMessage(text);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'transparent',
      position: 'relative',
      alignItems: 'center', // Center the chat interface
      padding: '0 0 24px 0',
      overflow: 'hidden'
    }}>
      {/* Background Image Pattern */}
      {theme === 'dark' && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'url("/image.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15,
          zIndex: 0,
          pointerEvents: 'none'
        }} />
      )}

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '900px', // Standard chat max-width
        height: '100%',
        position: 'relative'
      }}>
        {/* Chat Header Removed as requested */}

        {/* Messages Area */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          scrollBehavior: 'smooth',
          padding: '80px 10px 100px 10px', // Space for header (top) and input (bottom)
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 85%, transparent 60)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 85%, transparent 100%)'
        }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{
              display: 'flex',
              gap: '16px',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'column',
              width: msg.sender === 'ai' ? '100%' : 'auto',
              maxWidth: msg.sender === 'user' ? '85%' : '100%',
              animation: 'fadeInUp 0.3s ease forwards'
            }}>
              {/* Avatar for User only, AI uses its own layout */}
              {msg.sender === 'user' && (
                <div style={{
                  width: '46px', height: '46px', flexShrink: 0,
                  borderRadius: '50%',
                  background: 'var(--field-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-color)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                }}>
                  <User size={24} />
                </div>
              )}
              
              {/* Bubble / Content */}
              {msg.sender === 'user' ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '8px',
                  maxWidth: '100%'
                }}>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '20px',
                    borderBottomLeftRadius: '4px',
                    background: 'var(--gradient-primary)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    lineHeight: 1.7,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}>
                    {msg.text}
                  </div>
                  <span style={{ fontSize: '12px', opacity: 0.5, padding: '0 8px' }}>{msg.timestamp}</span>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '95%' }}>
                  
                  {/* AI Avatar */}
                  <div style={{ flexShrink: 0, marginTop: '-4px' }}>
                    <div style={{
                      width: '38px', height: '38px',
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
                        <img src="/ZadDarkLogo.png" alt="Zad" style={{ width: '85%', height: '85%', objectFit: 'contain' }} className="dark-invert" />
                      </div>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '4px' }}>
                      <span className="gradient-text" style={{ fontSize: '15px', fontWeight: '800' }}>زاد</span>
                      <span style={{ fontSize: '12px', opacity: 0.5 }}>{msg.timestamp}</span>
                    </div>
                    <AiResponseWidget text={msg.text} citations={msg.citations} isStreaming={msg.isStreaming} />
                  </div>

                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area (Transparent Overlay) */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '24px 20px',
          backgroundColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 20
        }}>
          <div style={{ flex: 1 }} className="animated-gradient-border">
            <div className="animated-gradient-border-inner" style={{ display: 'flex', alignItems: 'center' }}>
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اكتب سؤالك هنا..."
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                padding: '14px 12px',
                fontSize: '16px',
                color: 'var(--text-color)',
                fontFamily: 'var(--font-family)',
                outline: 'none',
              }}
            />
            {/* Mic button INSIDE the input field for a sleek look */}
            <button style={{
              padding: '10px',
              backgroundColor: 'transparent',
              color: 'var(--text-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0.5,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--color-primary)'; }}
            onMouseOut={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'var(--text-color)'; }}
            >
              <Mic size={20} />
            </button>
            </div>
          </div>

          {/* Voice Mode Button */}
          <button 
            onClick={() => navigate('/voice')}
            className="animated-gradient-bg"
            style={{
              width: '46px', height: '46px',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            title="وضع المحادثة الصوتية"
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <AudioLines size={20} />
          </button>

          {/* Premium Send Button */}
          <button 
          className="animated-gradient-bg"
          style={{
            width: '46px', height: '46px',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          onClick={handleSend}
          >
            <Send size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>
        </div>
      </div>
    </div>
  );
};
