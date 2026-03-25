import type { BookChapter, BookPart } from "./types";

/** Mapping from chapter ID to markdown filename */
export const CHAPTER_SLUG_MAP: Record<string, string> = {
  "ch-1": "ch-1-project-management",
  "ch-2": "ch-2-task-execution",
  "ch-3": "ch-3-document-processing",
  "ch-4": "ch-4-workflow-orchestration",
  "ch-5": "ch-5-scheduled-intelligence",
  "ch-6": "ch-6-agent-self-improvement",
  "ch-7": "ch-7-multi-agent-swarms",
  "ch-8": "ch-8-human-in-the-loop",
  "ch-9": "ch-9-the-autonomous-organization",
};

export const PARTS: BookPart[] = [
  {
    number: 1,
    title: "Foundation",
    description: "Operations — from manual processes to AI-assisted automation",
  },
  {
    number: 2,
    title: "Intelligence",
    description: "Workflows & Learning — adaptive systems that improve over time",
  },
  {
    number: 3,
    title: "Autonomy",
    description: "Advanced Patterns — fully delegated business processes",
  },
];

export const CHAPTERS: BookChapter[] = [
  {
    id: "ch-1",
    number: 1,
    title: "Project Management",
    subtitle: "From Manual Planning to Autonomous Sprint Planning",
    part: PARTS[0],
    readingTime: 12,
    relatedDocs: ["projects", "dashboard"],
    sections: [],
  },
  {
    id: "ch-2",
    number: 2,
    title: "Task Execution",
    subtitle: "Single-Agent to Multi-Agent Task Orchestration",
    part: PARTS[0],
    readingTime: 15,
    relatedDocs: ["agents", "profiles", "monitoring"],
    sections: [],
  },
  {
    id: "ch-3",
    number: 3,
    title: "Document Processing",
    subtitle: "Unstructured Input to Structured Knowledge",
    part: PARTS[0],
    readingTime: 14,
    relatedDocs: ["documents"],
    sections: [],
  },
  {
    id: "ch-4",
    number: 4,
    title: "Workflow Orchestration",
    subtitle: "From Linear Sequences to Adaptive Blueprints",
    part: PARTS[1],
    readingTime: 14,
    relatedDocs: ["workflows", "agents"],
    sections: [],
  },
  {
    id: "ch-5",
    number: 5,
    title: "Scheduled Intelligence",
    subtitle: "Time-Based Automation and Recurring Intelligence Loops",
    part: PARTS[1],
    readingTime: 11,
    relatedDocs: ["schedules", "monitoring"],
    sections: [],
  },
  {
    id: "ch-6",
    number: 6,
    title: "Agent Self-Improvement",
    subtitle: "Learning from Execution Logs and Feedback",
    part: PARTS[1],
    readingTime: 13,
    relatedDocs: ["agents", "profiles"],
    sections: [],
  },
  {
    id: "ch-7",
    number: 7,
    title: "Multi-Agent Swarms",
    subtitle: "Parallel Execution, Consensus, and Specialization",
    part: PARTS[2],
    readingTime: 16,
    relatedDocs: ["profiles", "agents"],
    sections: [],
  },
  {
    id: "ch-8",
    number: 8,
    title: "Human-in-the-Loop",
    subtitle: "Permission Systems and Graceful Escalation",
    part: PARTS[2],
    readingTime: 12,
    relatedDocs: ["inbox", "settings"],
    sections: [],
  },
  {
    id: "ch-9",
    number: 9,
    title: "The Autonomous Organization",
    subtitle: "Fully Delegated Business Processes",
    part: PARTS[2],
    readingTime: 18,
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
