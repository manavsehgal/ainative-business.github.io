import type {
  ContentBlock,
  TextBlock,
  CodeBlock,
  CalloutBlock,
  ImageBlock,
  InteractiveLinkBlock,
  InteractiveCollapsibleBlock,
} from "./types";

interface ParsedSection {
  id: string;
  title: string;
  content: ContentBlock[];
}

/**
 * Parse a markdown chapter body (frontmatter already stripped) into structured sections.
 * Uses a line-by-line state machine to identify content blocks.
 */
export function parseMarkdownChapter(
  markdown: string,
  chapterSlug: string
): { sections: ParsedSection[] } {
  const lines = markdown.split("\n");
  const sections: ParsedSection[] = [];

  const sectionChunks: Array<{ title: string; lines: string[] }> = [];
  let currentTitle = "Introduction";
  let currentLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentLines.length > 0 || sectionChunks.length > 0) {
        sectionChunks.push({ title: currentTitle, lines: currentLines });
      }
      currentTitle = line.slice(3).trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  if (currentLines.length > 0 || sectionChunks.length > 0) {
    sectionChunks.push({ title: currentTitle, lines: currentLines });
  }

  if (sectionChunks.length === 0 && currentLines.length > 0) {
    sectionChunks.push({ title: "Introduction", lines: currentLines });
  }

  for (const chunk of sectionChunks) {
    const sectionId = generateSectionId(chapterSlug, chunk.title);
    const content = parseContentBlocks(chunk.lines);
    sections.push({ id: sectionId, title: chunk.title, content });
  }

  return { sections };
}

function generateSectionId(chapterSlug: string, title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${chapterSlug}-${slug}`;
}

function parseContentBlocks(lines: string[]): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let textBuffer: string[] = [];
  let i = 0;

  function flushText() {
    if (textBuffer.length === 0) return;
    const text = textBuffer.join("\n").trim();
    if (text) {
      blocks.push({ type: "text", markdown: text } as TextBlock);
    }
    textBuffer = [];
  }

  while (i < lines.length) {
    const line = lines[i];

    // --- Fenced code block ---
    if (line.trimStart().startsWith("```")) {
      flushText();
      const indent = line.length - line.trimStart().length;
      const lang = line.trimStart().slice(3).trim();
      let filename: string | undefined;

      if (blocks.length > 0 || textBuffer.length > 0) {
        const prevLine = i > 0 ? lines[i - 1] : "";
        const filenameMatch = prevLine.match(/^<!--\s*filename:\s*(.+?)\s*-->$/);
        if (filenameMatch) {
          filename = filenameMatch[1];
          if (blocks.length > 0 && blocks[blocks.length - 1].type === "text") {
            const lastBlock = blocks[blocks.length - 1] as TextBlock;
            const mdLines = lastBlock.markdown.split("\n");
            if (mdLines.length > 0 && mdLines[mdLines.length - 1].match(/^<!--\s*filename:\s*.+\s*-->$/)) {
              mdLines.pop();
              const trimmed = mdLines.join("\n").trim();
              if (trimmed) {
                lastBlock.markdown = trimmed;
              } else {
                blocks.pop();
              }
            }
          }
        }
      } else {
        const prevLine = i > 0 ? lines[i - 1] : "";
        const filenameMatch = prevLine.match(/^<!--\s*filename:\s*(.+?)\s*-->$/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const codeLines: string[] = [];
      i++;
      while (i < lines.length) {
        const codeLine = lines[i];
        if (
          codeLine.trimStart().startsWith("```") &&
          codeLine.trimStart() === "```" &&
          (codeLine.length - codeLine.trimStart().length) <= indent
        ) {
          i++;
          break;
        }
        codeLines.push(codeLine);
        i++;
      }

      const block: CodeBlock = {
        type: "code",
        language: lang || "text",
        code: codeLines.join("\n"),
      };
      if (filename) block.filename = filename;
      blocks.push(block);
      continue;
    }

    // --- Callout blockquote ---
    const calloutMatch = line.match(/^>\s*\[!(tip|warning|info|lesson|authors-note|case-study)\]\s*$/);
    if (calloutMatch) {
      flushText();
      const variant = calloutMatch[1] as CalloutBlock["variant"];
      const calloutLines: string[] = [];
      let title: string | undefined;
      let imageSrc: string | undefined;
      let imageAlt: string | undefined;
      let defaultCollapsed = false;

      i++;
      if (i < lines.length) {
        const titleMatch = lines[i].match(/^>\s*\*\*(.+?)\*\*\s*$/);
        if (titleMatch) {
          title = titleMatch[1];
          i++;
        }
      }

      while (i < lines.length) {
        const bqLine = lines[i];
        if (bqLine.startsWith("> ") || bqLine === ">") {
          let content = bqLine === ">" ? "" : bqLine.slice(2);

          const imgMatch = content.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
          if (imgMatch) {
            imageAlt = imgMatch[1];
            imageSrc = imgMatch[2];
            i++;
            continue;
          }

          if (content.trim() === "[collapsed]") {
            defaultCollapsed = true;
            i++;
            continue;
          }

          calloutLines.push(content);
          i++;
        } else if (bqLine.trim() === "") {
          i++;
          break;
        } else {
          break;
        }
      }

      if (variant === "authors-note") {
        defaultCollapsed = true;
      }

      const block: CalloutBlock = {
        type: "callout",
        variant,
        markdown: calloutLines.join("\n").trim(),
      };
      if (title) block.title = title;
      if (imageSrc) block.imageSrc = imageSrc;
      if (imageAlt) block.imageAlt = imageAlt;
      if (defaultCollapsed) block.defaultCollapsed = true;
      blocks.push(block);
      continue;
    }

    // --- Image ---
    const imageMatch = line.match(/^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]*)")?\)\s*$/);
    if (imageMatch) {
      flushText();
      const block: ImageBlock = {
        type: "image",
        src: imageMatch[2],
        alt: imageMatch[1],
      };
      if (imageMatch[3]) block.caption = imageMatch[3];
      blocks.push(block);
      i++;
      continue;
    }

    // --- Interactive link ---
    const tryMatch = line.match(/^\[Try:\s*(.+?)\]\((.+?)\)\s*$/);
    if (tryMatch) {
      flushText();
      blocks.push({
        type: "interactive",
        interactiveType: "link",
        label: `Try: ${tryMatch[1]}`,
        description: "",
        href: tryMatch[2],
      } as InteractiveLinkBlock);
      i++;
      continue;
    }

    // --- Details/collapsible ---
    const detailsMatch = line.match(/^<details>\s*<summary>(.+?)<\/summary>\s*$/);
    if (detailsMatch) {
      flushText();
      const label = detailsMatch[1];
      const contentLines: string[] = [];
      i++;
      while (i < lines.length) {
        if (lines[i].trim() === "</details>") {
          i++;
          break;
        }
        contentLines.push(lines[i]);
        i++;
      }

      blocks.push({
        type: "interactive",
        interactiveType: "collapsible",
        label,
        markdown: contentLines.join("\n").trim(),
      } as InteractiveCollapsibleBlock);
      continue;
    }

    // --- Filename comment ---
    if (line.match(/^<!--\s*filename:\s*.+\s*-->$/)) {
      if (i + 1 < lines.length && lines[i + 1].trimStart().startsWith("```")) {
        textBuffer.push(line);
        i++;
        continue;
      }
    }

    // --- Regular text ---
    textBuffer.push(line);
    i++;
  }

  flushText();
  return blocks;
}
