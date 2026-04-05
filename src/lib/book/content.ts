import type { BookChapter, BookPart } from "./types";

/** Mapping from chapter ID to markdown filename */
export const CHAPTER_SLUG_MAP: Record<string, string> = {
  "ch-1": "ch-1-from-hierarchy-to-intelligence",
  "ch-2": "ch-2-the-ai-native-blueprint",
  "ch-3": "ch-3-the-refinery",
  "ch-4": "ch-4-the-forge",
  "ch-5": "ch-5-blueprints",
  "ch-6": "ch-6-the-arena",
  "ch-7": "ch-7-institutional-memory",
  "ch-8": "ch-8-the-swarm",
  "ch-9": "ch-9-the-governance-layer",
  "ch-10": "ch-10-the-world-model",
  "ch-11": "ch-11-the-machine-that-builds-machines",
  "ch-12": "ch-12-the-road-ahead",
};

export const PARTS: BookPart[] = [
  {
    number: 1,
    title: "The Blueprint",
    description: "Why organizations need AI-native architecture and how to think about it",
  },
  {
    number: 2,
    title: "The Factory",
    description: "Four stations that transform intent into autonomous execution",
  },
  {
    number: 3,
    title: "The Network",
    description: "Memory, coordination, and trust at organizational scale",
  },
  {
    number: 4,
    title: "The Vision",
    description: "From world models to self-building systems and the road ahead",
  },
];

export const CHAPTERS: BookChapter[] = [
  {
    id: "ch-1",
    number: 1,
    title: "From Hierarchy to Intelligence",
    subtitle: "Two Thousand Years of Organizational Design — and Why It's About to Break",
    part: PARTS[0],
    readingTime: 14,
    sections: [],
  },
  {
    id: "ch-2",
    number: 2,
    title: "The AI-Native Blueprint",
    subtitle: "From Factory Metaphor to Working Architecture",
    part: PARTS[0],
    readingTime: 12,
    sections: [],
  },
  {
    id: "ch-3",
    number: 3,
    title: "The Refinery",
    subtitle: "From Intent to Structured Work",
    part: PARTS[1],
    readingTime: 15,
    relatedDocs: ["projects", "documents", "home-workspace"],
    relatedJourney: "personal-use",
    sections: [],
  },
  {
    id: "ch-4",
    number: 4,
    title: "The Forge",
    subtitle: "Task Execution at Scale",
    part: PARTS[1],
    readingTime: 16,
    relatedDocs: ["agent-intelligence", "profiles", "monitoring"],
    relatedJourney: "work-use",
    sections: [],
  },
  {
    id: "ch-5",
    number: 5,
    title: "Blueprints",
    subtitle: "Workflow Orchestration",
    part: PARTS[1],
    readingTime: 14,
    relatedDocs: ["workflows", "agent-intelligence"],
    relatedJourney: "power-user",
    sections: [],
  },
  {
    id: "ch-6",
    number: 6,
    title: "The Arena",
    subtitle: "Scheduled Intelligence",
    part: PARTS[1],
    readingTime: 12,
    relatedDocs: ["schedules", "monitoring"],
    relatedJourney: "power-user",
    sections: [],
  },
  {
    id: "ch-7",
    number: 7,
    title: "Institutional Memory",
    subtitle: "The Knowledge Graph",
    part: PARTS[2],
    readingTime: 14,
    relatedDocs: ["agent-intelligence", "profiles"],
    relatedJourney: "developer",
    sections: [],
  },
  {
    id: "ch-8",
    number: 8,
    title: "The Swarm",
    subtitle: "Multi-Agent Coordination",
    part: PARTS[2],
    readingTime: 16,
    relatedDocs: ["profiles", "agent-intelligence"],
    sections: [],
  },
  {
    id: "ch-9",
    number: 9,
    title: "The Governance Layer",
    subtitle: "Trust at Scale",
    part: PARTS[2],
    readingTime: 13,
    relatedDocs: ["inbox-notifications", "tool-permissions", "settings"],
    sections: [],
  },
  {
    id: "ch-10",
    number: 10,
    title: "The World Model",
    subtitle: "From Project State to Organizational Intelligence",
    part: PARTS[3],
    readingTime: 15,
    relatedDocs: ["workflows", "profiles", "schedules"],
    sections: [],
  },
  {
    id: "ch-11",
    number: 11,
    title: "The Machine That Builds Machines",
    subtitle: "Stagent Building Itself Using Itself",
    part: PARTS[3],
    readingTime: 14,
    relatedDocs: ["workflows", "profiles", "schedules"],
    sections: [],
  },
  {
    id: "ch-12",
    number: 12,
    title: "The Road Ahead",
    subtitle: "What the Case Studies Tell Us About the Future",
    part: PARTS[3],
    readingTime: 10,
    relatedDocs: ["workflows", "profiles", "schedules"],
    sections: [],
  },
];

export function getChaptersByPart(): Map<number, BookChapter[]> {
  const grouped = new Map<number, BookChapter[]>();
  for (const ch of CHAPTERS) {
    const part = ch.part.number;
    if (!grouped.has(part)) grouped.set(part, []);
    grouped.get(part)!.push(ch);
  }
  return grouped;
}
