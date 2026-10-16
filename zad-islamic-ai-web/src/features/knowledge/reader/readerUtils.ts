import { BookMeta } from '../types/bookTypes';

export type Heading = {
  id: number;
  title: string;
  level: number;
  page: number;
};

export interface TreeNode extends Heading {
  children: TreeNode[];
  originalIndex: number;
}

export const buildTree = (headings: Heading[]): TreeNode[] => {
  const root: TreeNode[] = [];
  const stack: TreeNode[] = [];

  headings.forEach((h, i) => {
    const node: TreeNode = { ...h, originalIndex: i, children: [] };
    while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
      stack.pop();
    }
    if (stack.length === 0) root.push(node);
    else stack[stack.length - 1].children.push(node);
    stack.push(node);
  });
  return root;
};

export function replaceIslamicLigatures(text: string): string {
  if (!text) return '';

  let newText = text;

  const phraseReplacements: [RegExp, string][] = [
    [/(?<!<[^>]*)(?:صلّى|صلى)\s+الله\s+عليه\s+(?:وآله\s+)?وسلّم?(?![^<]*>)/g, 'ﷺ'],
    [/(?<!<[^>]*)(?:صلّى|صلى)\s+الله\s+عليه(?![^<]*>)/g, 'ﷺ'],
    [/(?<!<[^>]*)(?:جلّ|جل)\s+جلاله(?![^<]*>)/g, 'ﷻ'],
    [/(?<!<[^>]*)(?:عزّ|عز)\s+وجلّ?(?![^<]*>)/g, 'ﷻ'],
    [/(?<!<[^>]*)(?:تبارك|سبحانه)\s+وتعالى(?![^<]*>)/g, 'ﷻ'],
    [/(?<!<[^>]*)(?:رضي|رضى)\s+الله\s+عنهما(?![^<]*>)/g, 'رضي الله عنهما'],
    [/(?<!<[^>]*)(?:رضي|رضى)\s+الله\s+عنهم(?![^<]*>)/g, 'رضي الله عنهم'],
    [/(?<!<[^>]*)(?:رضي|رضى)\s+الله\s+عنها(?![^<]*>)/g, 'رضي الله عنها'],
    [/(?<!<[^>]*)(?:رضي|رضى)\s+الله\s+عنه(?![^<]*>)/g, 'رضي الله عنه'],
    [/(?<!<[^>]*)(?:رحمه|رحمة)\s+الله(?![^<]*>)/g, 'رحمه الله'],
    [/(?<!<[^>]*)(?:رحمهم|رحمة)\s+الله(?![^<]*>)/g, 'رحمهم الله'],
    [/(?<!<[^>]*)(?:حفظه|رعاه)\s+الله(?![^<]*>)/g, 'حفظه الله'],
    [/(?<!<[^>]*)(?:عليهما|عليهم|عليه)\s+الصلاة\s+والسلام(?![^<]*>)/g, 'عليه السلام'],
    [/(?<!<[^>]*)(?:عليهما|عليهم|عليه)\s+السلام(?![^<]*>)/g, 'عليه السلام']
  ];

  phraseReplacements.forEach(([pattern, replacement]) => {
    newText = newText.replace(pattern, (match, offset, fullStr) => {
      const prev = fullStr.slice(Math.max(0, offset - 40), offset);
      if (prev.includes('data-type="honorific"') || prev.includes('islamic-honorific')) return match;
      return `<span data-type="honorific" class="islamic-honorific font-bold mx-0.5">- ${replacement} -</span>`;
    });
  });

  const phrases = [
    'رضي الله عنهما',
    'رضي الله عنهم',
    'رضي الله عنها',
    'رضي الله عنه',
    'رحمه الله',
    'رحمها الله',
    'رحمهم الله',
    'حفظه الله',
    'عليهما السلام',
    'عليهم السلام',
    'عليه السلام',
    'سبحانه وتعالى',
    'عز وجل',
    'جل جلاله'
  ];

  phrases.forEach(phrase => {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(?<!<[^>]*)${escaped}(?![^<]*>)`, 'g');

    newText = newText.replace(pattern, (match, offset, fullStr) => {
      const prev = fullStr.slice(Math.max(0, offset - 40), offset);
      if (prev.includes('data-type="honorific"') || prev.includes('islamic-honorific')) return match;
      return `<span data-type="honorific" class="islamic-honorific font-bold mx-0.5">- ${match} -</span>`;
    });
  });

  return newText;
}

function makeTashkeelPattern(word: string): string {
  const tashkeel = '[\\u064B-\\u065F\\u0670\\u06D6-\\u06ED]*';
  let pattern = '';
  for (const ch of word) {
    if (ch === 'ا' || ch === 'أ' || ch === 'إ' || ch === 'آ') {
      pattern += '[اأإآ]' + tashkeel;
    } else if (ch === 'ي' || ch === 'ى') {
      pattern += '[ييى]' + tashkeel;
    } else {
      pattern += ch + tashkeel;
    }
  }
  return pattern;
}

const NARRATOR_WORDS = [
  'وكقوله', 'كقوله', 'فكقوله',
  'ولقوله', 'لقوله', 'فلقوله',
  'وبقوله', 'بقوله',
  'وقوله', 'قوله', 'فقوله',
  'وقولهم', 'قولهم', 'فقولهم',
  'وقال', 'قال', 'فقال',
  'وقالت', 'قالت', 'فقالت',
  'وقالوا', 'قالوا', 'فقالوا',
  'ويقول', 'يقول', 'فيقول',
  'وتقول', 'تقول', 'فتقول',
  'ويقولون', 'يقولون', 'فيقولون',
  'وقلت', 'قلت', 'فقلت',
  'وقلنا', 'قلنا', 'فقلنا',
  'وقيل', 'قيل', 'فقيل',
  'ويقال', 'يقال', 'فيقال',
  'وحدثنا', 'حدثنا', 'فحدثنا',
  'وحدثني', 'حدثني', 'فحدثني',
  'وأخبرنا', 'أخبرنا', 'فأخبرنا',
  'وأخبرني', 'أخبرني', 'فأخبرني',
  'وأنبأنا', 'أنبأنا', 'فأنبأنا',
  'وأنبأني', 'أنبأني',
  'وسمعت', 'سمعت',
  'وروى', 'روى',
  'وروي', 'روي',
  'وروينا', 'روينا'
];

const SPEECH_PATTERNS_STR = NARRATOR_WORDS.map(w => makeTashkeelPattern(w)).join('|');
const SPEECH_REGEX = new RegExp(`(?<!<[^>]*)(?<![\\p{L}\\p{M}])(${SPEECH_PATTERNS_STR})((?:[:：]|[-–—]|،)*(?=[\\s،:：-]|$))(?![^<]*>)`, 'gu');

export function parseIslamicTypography(text: string): string {
  if (!text) return '';

  // 1. Protect titles
  const titles: string[] = [];
  let parsed = text.replace(/<span\s+data-type="title"[^>]*>[\s\S]*?<\/span>/gi, (match) => {
    const idx = titles.length;
    titles.push(match);
    return `__TITLE_TOKEN_${idx}__`;
  });

  // 2. Protect existing HTML footnote badges
  const footnoteTokens: string[] = [];
  parsed = parsed.replace(/<span\s+class="[^"]*islamic-footnote-sup[^"]*"[^>]*>[\s\S]*?<\/span>/gi, (match) => {
    const idx = footnoteTokens.length;
    footnoteTokens.push(match);
    return `__FN_TOKEN_${idx}__`;
  });

  // 3. Protect honorific spans
  const honorificTokens: string[] = [];
  parsed = parsed.replace(/<span\s+data-type="honorific"[^>]*>[\s\S]*?<\/span>/gi, (match) => {
    const idx = honorificTokens.length;
    honorificTokens.push(match);
    return `__HONOR_TOKEN_${idx}__`;
  });

  // 4. Extract and wrap Quran verses in green styling (including ornate brackets ﴿ ﴾ or { })
  const quranTokens: string[] = [];
  const quranRegex = /([﴿﴾][^﴿﴾\r\n]+[﴿﴾]|\{[\u0600-\u06FF\s،.:!؟-]{3,}\})/gu;
  parsed = parsed.replace(quranRegex, (match) => {
    const idx = quranTokens.length;
    quranTokens.push(`<span data-type="quran" class="islamic-quran-verse font-scheherazade">${match}</span>`);
    return `__QURAN_TOKEN_${idx}__`;
  });

  // 5. Quotes / Hadith text: «...»
  const quoteRegex = /(?<!<[^>]*)(«[^»\r\n]+»)(?![^<]*>)/gu;
  parsed = parsed.replace(quoteRegex, '<span data-type="hadith-quote" class="islamic-hadith-quote">$1</span>');

  // 6. Parentheses (...) and Brackets [...]
  const parenRegex = /(?<!<[^>]*)\(([^()<>\r\n]+)\)(?![^<]*>)/gu;
  parsed = parsed.replace(parenRegex, '<span data-type="parenthetical" class="islamic-parenthetical">($1)</span>');

  const bracketRegex = /(?<!<[^>]*)(?<!\[)\[([^\[\]<>\r\n]+)\](?![^<]*>)/gu;
  parsed = parsed.replace(bracketRegex, '<span data-type="bracketed-note" class="islamic-bracketed-note">[$1]</span>');

  // 7. Speech / Attribution keywords
  parsed = parsed.replace(SPEECH_REGEX, (match, word, punct) => {
    return `<span data-type="narrator-keyword" class="islamic-narrator-keyword font-bold">${word}${punct}</span>`;
  });

  // 8. Restore tokens in reverse order
  parsed = parsed.replace(/__QURAN_TOKEN_(\d+)__/g, (_, idx) => quranTokens[Number(idx)] || '');
  parsed = parsed.replace(/__HONOR_TOKEN_(\d+)__/g, (_, idx) => honorificTokens[Number(idx)] || '');
  parsed = parsed.replace(/__FN_TOKEN_(\d+)__/g, (_, idx) => footnoteTokens[Number(idx)] || '');
  parsed = parsed.replace(/__TITLE_TOKEN_(\d+)__/g, (_, idx) => titles[Number(idx)] || '');

  return parsed;
}

export interface ProcessedContent {
  main: string;
  matn: string;
  sharh?: string;
  footnote: string;
}

export const processTextContent = (rawText: string): ProcessedContent => {
  if (!rawText) return { main: '', matn: '', footnote: '' };

  let matnPart = '';
  let sharhPart = '';
  let footnotePart = '';

  const footnoteRegex = /<span\s+data-type="footnote"[^>]*>([\s\S]*?)<\/span>/i;
  const footnoteMatch = rawText.match(footnoteRegex);

  let textWithoutFootnotes = rawText;
  if (footnoteMatch) {
    footnotePart = footnoteMatch[1].trim();
    textWithoutFootnotes = rawText.replace(footnoteRegex, '').trim();
  } else {
    const dividerPatterns = [
      /\n\s*(?:_{3,}|-{3,}|—{3,}|={3,})\s*\n/g,
      /\n\s*\[\s*الحاشية\s*\]\s*\n/gi,
      /\n\s*\[\s*الهامش\s*\]\s*\n/gi,
      /\n\s*الحواشي\s*:\s*\n/gi
    ];

    let splitIndex = -1;
    for (const pattern of dividerPatterns) {
      pattern.lastIndex = 0;
      const match = pattern.exec(rawText);
      if (match && match.index > rawText.length * 0.15) {
        splitIndex = match.index;
        break;
      }
    }

    if (splitIndex !== -1) {
      textWithoutFootnotes = rawText.slice(0, splitIndex).trim();
      footnotePart = rawText.slice(splitIndex).replace(/^[\s\S]*?\n/, '').trim();
    }
  }

  const sharhDividerRegex = /<span\s+data-type="sharh-divider"[^>]*>[\s\S]*?<\/span>|\n\s*[-–—=]{4,}\s*الشرح\s*[-–—=]{4,}\s*\n/i;
  const sharhMatch = textWithoutFootnotes.match(sharhDividerRegex);

  if (sharhMatch && sharhMatch.index !== undefined) {
    matnPart = textWithoutFootnotes.slice(0, sharhMatch.index).trim();
    sharhPart = textWithoutFootnotes.slice(sharhMatch.index + sharhMatch[0].length).trim();
  } else {
    matnPart = textWithoutFootnotes;
  }

  const formatMainText = (textToFormat: string): string => {
    if (!textToFormat) return '';
    let processedText = replaceIslamicLigatures(textToFormat);

    processedText = processedText.replace(/<span\s+([^>]*?)data-type="title"([^>]*?)>([\s\S]*?)<\/span>/gi, (match, before, after, titleText) => {
      const attrs = `${before} ${after}`.trim();
      if (/data-level=/i.test(attrs)) {
        return match;
      }
      const cleanTitle = titleText.replace(/<[^>]+>/g, '').trim();
      const isLevel1 = /^(?:كتاب|كِتَابُ?|باب|بَابُ?)\s+/i.test(cleanTitle);
      const levelAttr = isLevel1 ? 'data-level="1"' : 'data-level="2"';
      return `<span data-type="title" ${levelAttr} ${attrs}>${titleText}</span>`;
    });

    const fnBadge = (_: string, num: string) =>
      `<span class="islamic-footnote-sup inline-flex items-center justify-center mx-1 align-baseline"><a href="#fn-${num}" data-type="footnote-ref" class="islamic-footnote-ref font-sans font-extrabold text-[12px] shadow-2xs no-underline transition-all hover:scale-110 border-b-0 cursor-pointer">${num}</a></span>`;

    const rawFormatted = processedText
      .replace(/\s*[-–—]?\s*\(\^\s*([\d\u0660-\u0669]+)\)\s*[-–—]?/g, fnBadge)
      .replace(/\s*[-–—]?\s*\^\(([\d\u0660-\u0669]+)\)\s*[-–—]?/g, fnBadge)
      .replace(/\s*[-–—]?\s*\^([\d\u0660-\u0669]+)\s*[-–—]?/g, fnBadge)
      .replace(/\s*\(([\d\u0660-\u0669]+)\^\)\s*/g, fnBadge)
      .replace(/\s*[-–—]+\s*\(([\d\u0660-\u0669]+)\)\s*[-–—]+/g, fnBadge)
      .replace(/\s*\(([\d\u0660-\u0669]{1,2})\)\s*/g, fnBadge)
      .replace(/\s*\[([\d\u0660-\u0669]{1,2})\]\s*/g, fnBadge)
      .replace(/(?<=[\p{L}])([\d\u0660-\u0669]{1,2})(?=[.,،:;"'«»)\s]|$)/gu, fnBadge)
      .replace(/(?<=["'»])\s*([\d\u0660-\u0669]{1,2})(?=[.,،:;]|\s*[.,،:;])/gu, fnBadge);

    return parseIslamicTypography(rawFormatted);
  };

  const formattedMatn = formatMainText(matnPart);
  const formattedSharh = formatMainText(sharhPart);
  const mainCombined = formattedSharh ? `${formattedMatn}\n\n${formattedSharh}` : formattedMatn;

  return {
    main: mainCombined,
    matn: formattedMatn,
    sharh: formattedSharh || undefined,
    footnote: footnotePart || ''
  };
};

export type FootnoteItem = {
  num: string;
  text: string;
};

export const parseFootnoteItems = (rawFootnoteText: string): FootnoteItem[] => {
  if (!rawFootnoteText || !rawFootnoteText.trim()) return [];

  const normalizedText = rawFootnoteText
    .replace(/(<span\s+data-type="footnote-ref"[^>]*>.*?<\/span>)/gi, '\n$1')
    .replace(/(<a\s+[^>]*href="#fn-[^"]*"[^>]*>.*?<\/a>)/gi, '\n$1')
    .replace(/(?:^|\n|\s+)\((\d{1,2}|[\u0660-\u0669]{1,2})\)/g, '\n($1)')
    .replace(/(?:^|\n|\s+)\[(\d{1,2}|[\u0660-\u0669]{1,2})\]/g, '\n[$1]')
    .replace(/(?:^|\n|\s+)(\d{1,2}|[\u0660-\u0669]{1,2})[\s\-–—:=]/g, '\n$1 - ');

  const lines = normalizedText.split('\n');
  const items: FootnoteItem[] = [];
  let currentItem: FootnoteItem | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const htmlMatch = trimmed.match(/^(?:<span[^>]*>)?<a[^>]*href="#fn-([^"]+)"[^>]*>.*?<\/a>(?:<\/span>)?[:\s\-–—]?(.*)$/i);
    const textMatch = trimmed.match(/^[\(\[]?(\d{1,2}|[\u0660-\u0669]{1,2})[\)\]]?[\s\-–—:=]+(.*)$/);

    if (htmlMatch) {
      if (currentItem) items.push(currentItem);
      currentItem = {
        num: htmlMatch[1],
        text: htmlMatch[2] ? htmlMatch[2].trim() : ''
      };
    } else if (textMatch) {
      if (currentItem) items.push(currentItem);
      currentItem = {
        num: textMatch[1],
        text: textMatch[2] ? textMatch[2].trim() : ''
      };
    } else if (currentItem) {
      currentItem.text += ' ' + trimmed;
    } else {
      currentItem = {
        num: (items.length + 1).toString(),
        text: trimmed
      };
    }
  }

  if (currentItem) {
    items.push(currentItem);
  }

  return items;
};

export const formatPageCopyText = (
  matn: string,
  sharh?: string,
  footnote?: string,
  bookTitle?: string,
  author?: string,
  pageNum?: number
): string => {
  const stripHtmlTags = (html: string) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || doc.body.innerText || '';
  };

  const matnClean = stripHtmlTags(matn).trim();
  const sharhClean = sharh ? stripHtmlTags(sharh).trim() : '';

  let footnoteFormatted = '';
  if (footnote) {
    const footnoteItems = parseFootnoteItems(footnote);
    if (footnoteItems.length > 0) {
      footnoteFormatted = footnoteItems
        .map(item => `[${item.num}] ${stripHtmlTags(item.text).trim()}`)
        .join('\n');
    } else {
      footnoteFormatted = stripHtmlTags(footnote).trim();
    }
  }

  let fullText = matnClean;

  if (sharhClean) {
    fullText += `\n\n--- [ الشرح والبيان ] ---\n${sharhClean}`;
  }

  if (footnoteFormatted) {
    fullText += `\n\n--- [ الحواشي والتعليقات ] ---\n${footnoteFormatted}`;
  }

  if (bookTitle) {
    fullText += `\n\n[${bookTitle}${author ? ' - ' + author : ''}${pageNum ? ' - صـ ' + pageNum : ''}]`;
  }

  return fullText;
};
