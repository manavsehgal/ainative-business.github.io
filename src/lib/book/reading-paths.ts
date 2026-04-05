export interface ReadingPath {
  id: string;
  name: string;
  description: string;
  persona: string;
  chapterIds: string[];
}

export const READING_PATHS: ReadingPath[] = [
  {
    id: "getting-started",
    name: "Getting Started",
    description: "Foundation chapters on why AI-native matters and how to think about it",
    persona: "new",
    chapterIds: ["ch-1", "ch-2"],
  },
  {
    id: "personal-use",
    name: "Personal Use",
    description: "Chapters for individuals automating their own workflows",
    persona: "personal",
    chapterIds: ["ch-3", "ch-5", "ch-6"],
  },
  {
    id: "work-use",
    name: "Work Use",
    description: "Chapters for teams building AI-native operations at scale",
    persona: "work",
    chapterIds: ["ch-4", "ch-7", "ch-8", "ch-9"],
  },
  {
    id: "complete",
    name: "Complete",
    description: "The full journey from organizational history to the road ahead",
    persona: "developer",
    chapterIds: ["ch-1", "ch-2", "ch-3", "ch-4", "ch-5", "ch-6", "ch-7", "ch-8", "ch-9", "ch-10", "ch-11", "ch-12"],
  },
];

export function getReadingPath(id: string): ReadingPath | undefined {
  return READING_PATHS.find((p) => p.id === id);
}

export function getNextPathChapter(pathId: string, currentChapterId: string): string | null {
  const path = getReadingPath(pathId);
  if (!path) return null;
  const idx = path.chapterIds.indexOf(currentChapterId);
  if (idx === -1 || idx >= path.chapterIds.length - 1) return null;
  return path.chapterIds[idx + 1];
}

export function isChapterInPath(pathId: string, chapterId: string): boolean {
  const path = getReadingPath(pathId);
  if (!path) return false;
  return path.chapterIds.includes(chapterId);
}
