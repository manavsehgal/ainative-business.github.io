import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ContentBlock } from "../../lib/book/types";

/**
 * Lean block renderer for the printable book route.
 * Uses class names scoped by the print page's inline CSS — no tailwind,
 * no gradients, no backgrounds that would balloon a rasterized PDF.
 */
export function PrintBlock({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "text":
      return (
        <div className="book-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.markdown}</ReactMarkdown>
        </div>
      );

    case "code": {
      const label = block.filename ?? block.language ?? "";
      return (
        <figure className="print-code">
          {label && <figcaption className="print-code-label">{label}</figcaption>}
          <pre>
            <code>{block.code}</code>
          </pre>
          {block.caption && <figcaption className="print-caption">{block.caption}</figcaption>}
        </figure>
      );
    }

    case "image": {
      const resolvedSrc = block.src.startsWith("/book/images/")
        ? block.src
        : block.src.startsWith("http")
          ? block.src
          : `/book/images/${block.src}`;
      return (
        <figure className="print-image">
          <img src={resolvedSrc} alt={block.alt} />
          {block.caption && <figcaption className="print-caption">{block.caption}</figcaption>}
        </figure>
      );
    }

    case "callout":
      return (
        <aside className={`print-callout print-callout-${block.variant}`}>
          {block.title && <p className="print-callout-title">{block.title}</p>}
          <div className="book-prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.markdown}</ReactMarkdown>
          </div>
        </aside>
      );

    case "interactive": {
      if (block.interactiveType === "link") {
        return (
          <p className="print-interactive">
            See: <strong>{block.label}</strong> — {block.description}
          </p>
        );
      }
      if (block.interactiveType === "collapsible") {
        return (
          <aside className="print-callout print-callout-info">
            <p className="print-callout-title">{block.label}</p>
            <div className="book-prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.markdown}</ReactMarkdown>
            </div>
          </aside>
        );
      }
      if (block.interactiveType === "quiz") {
        return (
          <aside className="print-callout print-callout-info">
            <p className="print-callout-title">Question: {block.question}</p>
            <ul>
              {block.options.map((option, i) => (
                <li key={i}>{option}</li>
              ))}
            </ul>
            {block.explanation && <p>{block.explanation}</p>}
          </aside>
        );
      }
      return null;
    }
  }
}
