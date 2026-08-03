import React, { useState } from 'react';
import { ChevronDown, BookOpen, ExternalLink, LayoutGrid, Book, FileText, PenTool } from 'lucide-react';

export interface CitationDTO {
  sourceUrl: string;
  madhhab: string;
  bookTitle: string;
  author: string;
  part: string;
  totalParts: string;
  pageId: string;
  authorDeath: string;
  hierarchy: string;
}

const madhhabColor = (madhhab: string) => {
  if (madhhab.includes('مالكي')) return '#F59E0B'; // Amber
  if (madhhab.includes('حنبلي')) return '#10B981'; // Emerald
  if (madhhab.includes('شافعي')) return '#3B82F6'; // Blue
  if (madhhab.includes('حنفي')) return '#8B5CF6'; // Violet
  return '#9333EA'; // Purple default
};

export const CitationsSection = ({ citations }: { citations: Record<string, CitationDTO> }) => {
  const [expanded, setExpanded] = useState(false);
  const entries = Object.entries(citations);
  const count = entries.length;

  if (count === 0) return null;

  return (
    <div style={{
      marginTop: '12px',
      backgroundColor: 'var(--card-bg)',
      borderRadius: '14px',
      border: '1px solid var(--section-header-border)',
      boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      <div 
        onClick={() => setExpanded(!expanded)}
        onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--section-header-bg)'}
        onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
        style={{
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'background-color 0.2s ease',
          borderBottom: expanded ? '1px solid var(--section-header-border)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)' }}>
          <BookOpen size={18} />
          <span style={{ fontSize: '14px', fontWeight: '700' }}>
            المصادر ({count})
          </span>
        </div>
        
        <div style={{ 
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', 
          transition: 'transform 0.3s ease', 
          display: 'flex',
          color: 'var(--text-color)',
          opacity: 0.6
        }}>
          <ChevronDown size={20} />
        </div>
      </div>

      <div style={{
        height: expanded ? 'auto' : 0,
        opacity: expanded ? 1 : 0,
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ padding: '16px' }}>
          {entries.map(([key, citation], index) => (
            <CitationCard key={key} citKey={key} citation={citation} index={index + 1} />
          ))}
        </div>
      </div>
    </div>
  );
};

const CitationCard = ({ citKey, citation, index }: { citKey: string, citation: CitationDTO, index: number }) => {
  const mColor = madhhabColor(citation.madhhab);

  const handleOpenUrl = () => {
    if (citation.sourceUrl) {
      window.open(citation.sourceUrl, '_blank');
    }
  };

  return (
    <div style={{
      marginBottom: '12px',
      backgroundColor: 'var(--field-bg)',
      borderRadius: '12px',
      border: '1px solid var(--section-header-border)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Right Thick Border Line */}
      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '4px',
        backgroundColor: mColor
      }}></div>

      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          
          {/* Badges Column */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: mColor + '20', // 20 hex is ~12% opacity
              color: mColor,
              fontWeight: 'bold',
              fontSize: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {index}
            </div>
            
            {citation.sourceUrl && (
              <button 
                onClick={handleOpenUrl}
                style={{
                  padding: '4px',
                  borderRadius: '6px',
                  border: `1px solid ${mColor}4D`, // 4D hex is ~30% opacity
                  backgroundColor: 'transparent',
                  color: mColor,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <ExternalLink size={16} />
              </button>
            )}
          </div>

          {/* Book Info Column */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-color)', lineHeight: 1.4 }}>
              {citation.bookTitle}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-color)', opacity: 0.6, marginTop: '4px', fontWeight: '500' }}>
              {citation.author}
            </span>
          </div>
        </div>

        {/* Chips Wrap */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
          <CustomChip label={citation.madhhab} icon={<LayoutGrid size={14} color={mColor} />} color={mColor} />
          <CustomChip label={`الجزء ${citation.part} من ${citation.totalParts}`} icon={<Book size={14} color="#3B82F6" />} color="#3B82F6" />
          <CustomChip label={`ص ${citation.pageId}`} icon={<FileText size={14} color="#10B981" />} color="#10B981" />
          {!citation.authorDeath.includes('غير معروف') && (
            <CustomChip label={citation.authorDeath} icon={<PenTool size={14} color="#6366F1" />} color="#6366F1" />
          )}
        </div>

        {/* Hierarchy */}
        {citation.hierarchy && (
          <div style={{ marginTop: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-color)', opacity: 0.5, fontWeight: '500' }}>
              {citation.hierarchy}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const CustomChip = ({ label, icon, color }: { label: string, icon: React.ReactNode, color: string }) => {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '4px',
      padding: '4px 8px',
      borderRadius: '6px',
      backgroundColor: color + '1A', // 1A hex is ~10% opacity
    }}>
      {icon}
      <span style={{ fontSize: '11px', fontWeight: '600', color: color, fontFamily: 'var(--font-family)' }}>
        {label}
      </span>
    </div>
  );
};
