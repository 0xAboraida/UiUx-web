import React, { useState, useContext } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Keyboard, X, Moon, Sun, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../App';

export const VoiceChatPage = () => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(true);
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      position: 'relative',
      padding: '40px 40px',
      overflow: 'hidden',
      backgroundColor: 'transparent'
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
          zIndex: 1
        }} />
      )}


      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        zIndex: 10
      }}>
        {/* Top Left: Mode Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            position: 'absolute',
            left: 0,
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

        {/* Center: Status Pill */}
        <div style={{
          padding: '8px 24px',
          borderRadius: '30px',
          background: 'var(--frame-bg)',
          display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}>
          <span style={{
            width: '8px', height: '8px',
            borderRadius: '50%',
            backgroundColor: 'gray'
          }} />
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-color)' }}>
            متصل
          </span>
        </div>
      </div>

      {/* Center Area: Glowing Circles & Logo */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 5
      }}>

        <div style={{
          position: 'relative',
          width: '288px',
          height: '288px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Outer Glow (Radius 144) */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: theme === 'light' 
              ? 'radial-gradient(circle, rgba(192, 32, 240, 0.9) 0%, rgba(192, 32, 240, 0.4) 50%, transparent 80%)'
              : 'radial-gradient(circle, #C020F0 0%, transparent 70%)',
            opacity: theme === 'light' ? 0.9 : 0.4,
            filter: 'blur(40px)',
          }} />

          {/* Inner Circle (Radius 112) */}
          <div style={{
            position: 'absolute',
            width: '224px',
            height: '224px',
            borderRadius: '50%',
            background: theme === 'light' ? 'rgba(25, 5, 40, 0.75)' : 'rgba(255, 255, 255, 0.05)',
            boxShadow: theme === 'light' 
              ? '0 20px 60px rgba(122, 23, 201, 0.8), 0 0 40px rgba(192, 32, 240, 0.5)' 
              : '0 20px 60px rgba(122, 23, 201, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(12px)'
          }}>
            {/* Logo */}
            <img
              src="/WhiteLogo.png"
              alt="Zad AI"
              style={{
                width: '120px',
                height: '120px',
                objectFit: 'contain',
                opacity: 0.9
              }}
            />
          </div>
        </div>

        {/* Text */}
        <p style={{
          marginTop: '50px',
          fontSize: '20px',
          fontWeight: '500',
          color: 'var(--text-color)',
          textAlign: 'center',
          letterSpacing: '0.5px'
        }}>
          أهلاً بك، أنا زاد. تفضل بطرح سؤالك.
        </p>
      </div>

      {/* Bottom Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '24px',
        paddingBottom: '30px',
        zIndex: 10
      }}>

        {/* Left: History */}
        <button
          onClick={() => navigate('/chat')}
          style={{
            background: 'var(--frame-bg)',
            border: 'none',
            borderRadius: '50%',
            width: '56px', height: '56px',
            color: 'var(--text-color)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
          }}
        >
          <History size={24} />
        </button>

        {/* Center: Main Mic Button (Radius 48 -> 96x96) */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            color: 'white',
            background: 'linear-gradient(135deg, #5B0E9C 0%, #8A17C9 50%, #C020F0 100%)',
            boxShadow: '0 15px 40px rgba(192, 32, 240, 0.7)',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isMuted ? <MicOff size={36} /> : <Mic size={36} />}
        </button>

        {/* Right: End Call (X) */}
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'var(--frame-bg)',
            border: 'none',
            borderRadius: '50%',
            width: '56px', height: '56px',
            color: 'var(--text-color)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
          }}
        >
          <X size={24} />
        </button>

      </div>
    </div>
  );
};
