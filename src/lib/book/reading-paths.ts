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
    description: "Essential chapters for new users learning the basics",
    persona: "new",
    chapterIds: ["ch-1", "ch-2", "ch-3"],
  },
  {
    id: "team-lead",
    name: "Team Lead",
    description: "Chapters focused on team management and workflows",
    persona: "work",
    chapterIds: ["ch-1", "ch-4", "ch-5"],
  },
  {
    id: "power-user",
    name: "Power User",
    description: "Advanced chapters for active users ready to go deeper",
    persona: "active",
    chapterIds: ["ch-4", "ch-5", "ch-6", "ch-7", "ch-8"],
  },
  {
    id: "developer",
    name: "Developer",
    description: "Comprehensive path covering the full technical depth",
    persona: "developer",
    chapterIds: ["ch-1", "ch-2", "ch-3", "ch-4", "ch-5", "ch-6", "ch-7", "ch-8", "ch-9"],
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
