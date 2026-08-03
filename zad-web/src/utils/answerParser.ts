export enum AnswerItemType {
  paragraph,
  listItem,
  quote
}

export interface AnswerItem {
  type: AnswerItemType;
  text: string;
}

export interface AnswerSection {
  title: string;
  items: AnswerItem[];
}

export interface ParsedAnswer {
  intro?: string;
  sections: AnswerSection[];
}

export class AnswerParser {
  static parse(raw: string): ParsedAnswer {
    const lines = raw.split('\n');

    let intro: string | undefined = undefined;
    const sections: AnswerSection[] = [];
    let current: AnswerSection | null = null;

    let introBuffer = '';
    let foundFirstSection = false;

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const cleanLine = rawLine.trim();

      // Check if this line is a section header
      let isHeader = false;
      let headerTitle = '';

      if (cleanLine.startsWith('###')) {
        isHeader = true;
        headerTitle = cleanLine.replace(/^#+\s*/, '').trim();
      } else if (cleanLine.startsWith('**') && 
                 (cleanLine.endsWith('**') || cleanLine.endsWith(':**') || cleanLine.endsWith(':'))) {
        isHeader = true;
        headerTitle = cleanLine.replace(/\*\*/g, '').replace(/:$/, '').trim();
      }

      if (isHeader) {
        foundFirstSection = true;
        if (current !== null) {
          sections.push(current);
        }
        current = { title: headerTitle, items: [] };
      } else if (!foundFirstSection) {
        if (cleanLine === '') {
          introBuffer += '\n\n';
        } else {
          if (introBuffer.length > 0 && !introBuffer.endsWith('\n\n')) {
            introBuffer += '\n';
          }
          introBuffer += rawLine;
        }
      } else {
        if (cleanLine === '') {
          current?.items.push({ type: AnswerItemType.paragraph, text: '' });
          continue;
        }

        const bulletMatch = cleanLine.match(/^[\*\-\+]\s+(.+)$/);
        const numberedMatch = cleanLine.match(/^\d+\.\s*(.+)$/);
        const quoteMatch = cleanLine.match(/^>\s*(.+)$/);

        if (bulletMatch) {
          current?.items.push({ type: AnswerItemType.listItem, text: bulletMatch[1].trim() });
        } else if (numberedMatch) {
          current?.items.push({ type: AnswerItemType.listItem, text: cleanLine });
        } else if (quoteMatch) {
          current?.items.push({ type: AnswerItemType.quote, text: quoteMatch[1].trim() });
        } else {
          current?.items.push({ type: AnswerItemType.paragraph, text: cleanLine });
        }
      }
    }

    if (current !== null) {
      sections.push(current);
    }

    const introText = introBuffer.trim();
    if (introText.length > 0) {
      intro = introText;
    }

    return { intro, sections };
  }
}
