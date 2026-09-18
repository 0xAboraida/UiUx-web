const fs = require('fs');

let content = fs.readFileSync('src/components/common/AudioReaderButton.tsx', 'utf-8');

// 1. Update Props
const propsInterface = `interface AudioReaderButtonProps {
  text: string
  dark?: boolean
  className?: string
  showTextLabel?: boolean
  hidePodcast?: boolean
  onStateChange?: (isPlaying: boolean) => void
  colorTheme?: 'emerald' | 'purple'
  orientation?: 'horizontal' | 'vertical'
  menuPlacement?: 'top' | 'left' | 'right'
}`;
content = content.replace(/interface AudioReaderButtonProps \{[^}]+\}/s, propsInterface);

const destructuring = `export function AudioReaderButton({
  text,
  dark = true,
  className = '',
  showTextLabel = true,
  hidePodcast = false,
  onStateChange,
  colorTheme = 'emerald',
  orientation = 'horizontal',
  menuPlacement = 'top',
}: AudioReaderButtonProps) {`;
content = content.replace(/export function AudioReaderButton\([^)]+\) \{/s, destructuring);

// 2. Add usePurple
const usePurpleVar = `  const menuRef = useRef<HTMLDivElement>(null)\n\n  const usePurple = isPodcastMode || colorTheme === 'purple'`;
content = content.replace('  const menuRef = useRef<HTMLDivElement>(null)', usePurpleVar);

// 3. Fix Layout / Orientation classes
content = content.replace(
  'className={`flex items-center gap-1.5 p-1 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 ${', 
  'className={`flex ${orientation === \'vertical\' ? \'flex-col\' : \'items-center\'} gap-1.5 p-1 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 ${'
);
content = content.replace(
  '/* Idle State: Clean Action Buttons (Full Read + Podcast Only) */\n        <div className="flex items-center gap-1.5">',
  '/* Idle State: Clean Action Buttons (Full Read + Podcast Only) */\n        <div className={`flex ${orientation === \'vertical\' ? \'flex-col\' : \'items-center\'} gap-1.5`}>'
);

const speedMenuClass = `\${menuPlacement === 'top' ? 'bottom-full mb-1.5 left-0' : menuPlacement === 'left' ? 'top-0 right-full mr-1.5' : 'top-0 left-full ml-1.5'}`;
content = content.replace('absolute bottom-full mb-1.5 left-0 z-50 p-1.5', `absolute ${speedMenuClass} z-50 p-1.5`);
content = content.replace('absolute bottom-full mb-1.5 left-0 z-50 w-64 p-2', `absolute ${speedMenuClass} z-50 w-64 p-2`);

// 4. Replace isPodcastMode with usePurple ONLY in styling
content = content.replace(/className=\{`([^`]+)`\}/g, (match, classStr) => {
  if (classStr.includes('onClick') || classStr.includes('disabled')) return match;
  return `className={\`${classStr.replace(/isPodcastMode/g, 'usePurple')}\`}`;
});
// also fix the icon fill string cases
content = content.replace(/className=\{isPodcastMode \? 'text-purple-400' \: 'text-emerald-400'\}/g, "className={usePurple ? 'text-purple-400' : 'text-emerald-400'}");

// fix confirm modal
content = content.replace(/isPodcastMode \? 'bg-purple-500\/20/g, "usePurple ? 'bg-purple-500/20");
content = content.replace(/isPodcastMode \? 'text-purple-400' \: 'text-emerald-400'/g, "usePurple ? 'text-purple-400' : 'text-emerald-400'");
content = content.replace(/isPodcastMode\n\s+\? 'bg-purple-600/g, "usePurple\n                      ? 'bg-purple-600");

fs.writeFileSync('src/components/common/AudioReaderButton.tsx', content);
console.log('updated');
