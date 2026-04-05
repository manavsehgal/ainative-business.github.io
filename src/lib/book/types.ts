/** Content block types for rich book content */
export type ContentBlock =
  | TextBlock
  | CodeBlock
  | ImageBlock
  | CalloutBlock
  | InteractiveBlock;

export interface TextBlock {
  type: "text";
  markdown: string;
}

export interface CodeBlock {
  type: "code";
  language: string;
  code: string;
  filename?: string;
  caption?: string;
}

export interface ImageBlock {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
  width?: number;
}

export interface CalloutBlock {
  type: "callout";
  variant: "tip" | "warning" | "info" | "lesson" | "authors-note" | "case-study";
  title?: string;
  markdown: string;
  imageSrc?: string;
  imageAlt?: string;
  defaultCollapsed?: boolean;
}

export interface InteractiveLinkBlock {
  type: "interactive";
  interactiveType: "link";
  label: string;
  description: string;
  href: string;
}

export interface InteractiveCollapsibleBlock {
  type: "interactive";
  interactiveType: "collapsible";
  label: string;
  markdown: string;
  defaultOpen?: boolean;
}

export interface InteractiveQuizBlock {
  type: "interactive";
  interactiveType: "quiz";
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export type InteractiveBlock =
  | InteractiveLinkBlock
  | InteractiveCollapsibleBlock
  | InteractiveQuizBlock;

export interface BookSection {
  id: string;
  title: string;
  content: ContentBlock[];
}

export interface BookChapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  part: BookPart;
  sections: BookSection[];
  readingTime: number;
  relatedDocs?: string[];
  relatedJourney?: string;
}

export interface BookPart {
  number: number;
  title: string;
  description: string;
}

export interface ReaderPreferences {
  fontSize: number;
  lineHeight: number;
  fontFamily: "sans" | "serif" | "mono";
  theme: "light" | "sepia" | "dark";
}

export const DEFAULT_READER_PREFS: ReaderPreferences = {
  fontSize: 17,
  lineHeight: 1.75,
  fontFamily: "sans",
  theme: "light",
};

export interface Book {
  title: string;
  subtitle: string;
  description: string;
  parts: BookPart[];
  chapters: BookChapter[];
  totalReadingTime: number;
}

export interface ReadingProgress {
  chapterId: string;
  progress: number;
  scrollPosition: number;
  lastReadAt: string;
}

export interface Bookmark {
  id: string;
  chapterId: string;
  sectionId: string | null;
  scrollPosition: number;
  label: string;
  createdAt: string;
}
