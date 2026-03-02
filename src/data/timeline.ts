export interface TimelineItem {
  year: string;
  project: string;
  role: string;
  stats: string;
  techWave: string;
  isCurrent: boolean;
  tech?: string[];
}

export const timeline: TimelineItem[] = [
  {
    year: '2024',
    project: 'FinEdge',
    role: 'Fintech investment intelligence',
    stats: '45K LOC · Python + Anthropic + PostgreSQL',
    techWave: 'LLM APIs',
    isCurrent: false,
    tech: ['Python', 'Anthropic', 'PostgreSQL', 'LangGraph'],
  },
  {
    year: '2024',
    project: 'SuperCRM',
    role: 'Agentic social CRM',
    stats: '35.7K LOC · Next.js + Claude AI Agents',
    techWave: 'Agent Frameworks',
    isCurrent: false,
    tech: ['Next.js', 'Claude', 'TypeScript', 'Tailwind'],
  },
  {
    year: '2025',
    project: 'KnowledgeGraph',
    role: 'Strategic intelligence & benchmarks',
    stats: '81.7K LOC · Next.js + D3.js + React',
    techWave: 'RAG Systems',
    isCurrent: false,
    tech: ['Next.js', 'D3.js', 'React', 'MDX'],
  },
  {
    year: '2025',
    project: 'AgentKit',
    role: 'Visual agent testing platform',
    stats: '473 tests · React + TypeScript + Tauri',
    techWave: 'MCP Protocol',
    isCurrent: false,
    tech: ['React', 'TypeScript', 'Tauri', 'Pydantic'],
  },
  {
    year: '2025',
    project: 'Canvas OS',
    role: 'Analytics & data visualization',
    stats: '28.4K LOC · React + TypeScript',
    techWave: 'Agent Orchestration',
    isCurrent: false,
    tech: ['React', 'TypeScript', 'Zustand', 'React Flow'],
  },
  {
    year: '2025',
    project: 'DeepResearch',
    role: 'Grounded AI research assistant',
    stats: '36 blueprints · Python + LangGraph + Vue',
    techWave: 'Autonomous Agents',
    isCurrent: false,
    tech: ['Python', 'LangGraph', 'Vue', 'RAG'],
  },
  {
    year: '2025',
    project: 'BrowseAI',
    role: 'AI browsing companion',
    stats: '21.9K LOC · Browser extension + multi-provider LLM',
    techWave: 'AI Interfaces',
    isCurrent: false,
    tech: ['Browser Extension', 'Anthropic', 'OpenAI', 'Gemini'],
  },
  {
    year: '2025',
    project: 'TerminalOS',
    role: 'CLI workflow automation',
    stats: '15K LOC · Anthropic + OpenAI + Gemini + Ollama',
    techWave: 'AI Form Factors',
    isCurrent: false,
    tech: ['Anthropic', 'OpenAI', 'Gemini', 'Ollama'],
  },
  {
    year: '2026',
    project: 'Stagent',
    role: 'Multi-agent autonomous harness',
    stats: '7.3K+ LOC · 117 tests · Rust + TypeScript',
    techWave: 'The Harness Layer',
    isCurrent: true,
    tech: ['Rust', 'TypeScript', 'Tauri', 'MCP'],
  },
];
