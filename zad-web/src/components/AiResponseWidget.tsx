import React from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown, Share2, FileDown } from 'lucide-react';
import { AnswerParser, ParsedAnswer, AnswerItemType } from '../utils/answerParser';
import { CitationsSection, CitationDTO } from './CitationsSection';

interface AiResponseWidgetProps {
  text: string;
  citations?: Record<string, CitationDTO>;
  isStreaming?: boolean;
}

// A simple rich text renderer to handle **bold** and [citations]
const renderRichText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|\[cit_\d+\]|\[\d+\])/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} style={{ fontWeight: '700' }}>{part.slice(2, -2)}</strong>;
    }
    if (part.match(/^\[(cit_\d+|\d+)\]$/)) {
      const num = part.replace(/[\[\]]/g, '').replace('cit_', '');
      return (
        <span key={index} style={{ 
          color: '#BA68C8', 
          fontWeight: 'bold',
          margin: '0 2px'
        }}>
          [{num}]
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

export const AiResponseWidget = ({ text, citations, isStreaming }: AiResponseWidgetProps) => {
  const parsed = AnswerParser.parse(text);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', width: '100%', gap: '12px',
      backgroundColor: 'var(--frame-bg)',
      border: '1px solid var(--frame-border)',
      borderRadius: '20px',
      borderTopRightRadius: '0',
      padding: '16px',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)'
    }}>
      
      {/* Intro Paragraph */}
      {parsed.intro && (
        <div style={{
          backgroundColor: 'var(--card-bg)',
          borderRadius: '14px',
          padding: '16px',
          boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
          color: 'var(--text-color)',
          lineHeight: 1.7,
          fontSize: '15px',
          fontWeight: '500'
        }}>
          {renderRichText(parsed.intro)}
        </div>
      )}

      {/* Sections */}
      {parsed.sections.map((section, idx) => (
        <div key={idx} style={{
          backgroundColor: 'var(--card-bg)',
          borderRadius: '14px',
          boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          marginTop: idx > 0 || parsed.intro ? '4px' : '0'
        }}>
          {/* Section Header */}
          <div style={{
            backgroundColor: 'var(--section-header-bg)',
            padding: '11px 14px',
            borderBottom: section.items.length > 0 ? '1px solid var(--section-header-border)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '4px',
              height: '18px',
              borderRadius: '4px',
              background: 'var(--gradient-text)'
            }}></div>
            <h4 style={{ 
              margin: 0, 
              color: 'var(--text-color)', 
              fontSize: '14px', 
              fontWeight: '700' 
            }}>
              {section.title}
            </h4>
          </div>

          {/* Section Items */}
          {section.items.length > 0 && (
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {section.items.map((item, itemIdx) => {
                if (!item.text) return <div key={itemIdx} style={{ height: '8px' }}></div>;
                
                if (item.type === AnswerItemType.listItem) {
                  return (
                    <div key={itemIdx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '6px', height: '6px',
                        backgroundColor: '#791fb1',
                        borderRadius: '50%',
                        marginTop: '8px',
                        flexShrink: 0
                      }}></div>
                      <div style={{ flex: 1, color: 'var(--text-color)', lineHeight: 1.6, fontSize: '14px' }}>
                        {renderRichText(item.text)}
                      </div>
                    </div>
                  );
                }
                
                if (item.type === AnswerItemType.quote) {
                  return (
                    <div key={itemIdx} style={{
                      backgroundColor: 'var(--quote-bg)',
                      borderRight: '4px solid #BA68C8',
                      padding: '12px',
                      borderRadius: '8px',
                      borderTopRightRadius: '0',
                      borderBottomRightRadius: '0',
                      color: 'var(--text-color)',
                      lineHeight: 1.6,
                      fontSize: '14px',
                      fontStyle: 'italic',
                      opacity: 0.8
                    }}>
                      {renderRichText(item.text)}
                    </div>
                  );
                }

                return (
                  <div key={itemIdx} style={{ color: 'var(--text-color)', lineHeight: 1.6, fontSize: '14px' }}>
                    {renderRichText(item.text)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Citations */}
      {citations && Object.keys(citations).length > 0 && (
        <CitationsSection citations={citations} />
      )}

      {/* Action Buttons Footer */}
      {!isStreaming && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          backgroundColor: 'transparent',
          marginTop: '4px'
        }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <ThumbsUp size={18} color="#10B981" style={{ cursor: 'pointer' }} />
            <ThumbsDown size={18} color="var(--text-color)" opacity={0.5} style={{ cursor: 'pointer' }} />
            <Copy size={18} color={copied ? "#10B981" : "var(--text-color)"} opacity={copied ? 1 : 0.5} style={{ cursor: 'pointer' }} onClick={handleCopy} />
            <Share2 size={18} color="var(--text-color)" opacity={0.5} style={{ cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.5, cursor: 'pointer' }}>
            <FileDown size={18} color="var(--text-color)" />
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>PDF</span>
          </div>
        </div>
      )}
    </div>
  );
};
