import { useState, useCallback } from "react";
import {
  Info,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  PenLine,
  ArrowRight,
  ChevronDown,
  Copy,
  Check,
  CircleCheck,
  CircleX,
  HelpCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { highlight } from "sugar-high";
import type {
  ContentBlock,
  InteractiveLinkBlock,
  InteractiveCollapsibleBlock,
  InteractiveQuizBlock,
} from "../../lib/book/types";
import { cn } from "../../lib/utils";

/* ─── Dispatch ─── */

export function ContentBlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "text":
      return <TextBlockView markdown={block.markdown} />;
    case "code":
      return (
        <CodeBlockView
          code={block.code}
          language={block.language}
          filename={block.filename}
          caption={block.caption}
        />
      );
    case "image":
      return (
        <ImageBlockView
          src={block.src}
          alt={block.alt}
          caption={block.caption}
          width={block.width}
        />
      );
    case "callout":
      return (
        <CalloutBlockView
          variant={block.variant}
          title={block.title}
          markdown={block.markdown}
          imageSrc={block.imageSrc}
          imageAlt={block.imageAlt}
          defaultCollapsed={block.defaultCollapsed}
        />
      );
    case "interactive":
      return <InteractiveBlockView block={block} />;
  }
}

/* ─── TextBlock ─── */

function TextBlockView({ markdown }: { markdown: string }) {
  return (
    <div className="book-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}

/* ─── CodeBlock (syntax-highlighted with sugar-high) ─── */
/* Note: sugar-high produces trusted HTML from code strings at render time.
   The book content is static markdown loaded at build time, not user input. */

function CodeBlockView({
  code,
  language,
  filename,
  caption,
}: {
  code: string;
  language: string;
  filename?: string;
  caption?: string;
}) {
  const [copied, setCopied] = useState(false);
  const highlightedHtml = highlight(code);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <figure className="book-code-block my-8 group/code">
      <div className="book-code-header flex items-center justify-between px-4 py-2 text-xs font-mono rounded-t-lg">
        <span className="text-text-muted">{filename ?? language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-surface-raised transition-colors cursor-pointer opacity-0 group-hover/code:opacity-100 focus:opacity-100"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-success" />
              <span className="text-success">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <pre className="book-code-pre overflow-x-auto p-4 rounded-b-lg text-sm leading-relaxed">
        <code
          className="font-mono"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      </pre>

      {caption && (
        <figcaption className="mt-2 text-center text-sm text-text-muted italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ─── ImageBlock ─── */

function ImageBlockView({
  src,
  alt,
  caption,
  width,
}: {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
}) {
  const resolvedSrc = src.startsWith("/book/images/")
    ? src
    : src.startsWith("http")
      ? src
      : `/book/images/${src}`;

  return (
    <figure className="book-image-breakout my-8">
      <div className="mx-auto" style={width ? { maxWidth: width } : undefined}>
        <img
          src={resolvedSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="book-image rounded-xl mx-auto w-full"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-text-muted italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ─── CalloutBlock ─── */

const calloutConfig = {
  tip: { icon: Lightbulb, className: "book-callout-tip" },
  warning: { icon: AlertTriangle, className: "book-callout-warning" },
  info: { icon: Info, className: "book-callout-info" },
  lesson: { icon: BookOpen, className: "book-callout-lesson" },
  "authors-note": { icon: PenLine, className: "book-callout-authors-note" },
};

function CalloutBlockView({
  variant,
  title,
  markdown,
  imageSrc,
  imageAlt,
  defaultCollapsed,
}: {
  variant: "tip" | "warning" | "info" | "lesson" | "authors-note";
  title?: string;
  markdown: string;
  imageSrc?: string;
  imageAlt?: string;
  defaultCollapsed?: boolean;
}) {
  const config = calloutConfig[variant];
  const Icon = config.icon;

  const content = (
    <div className="flex items-start gap-3">
      <Icon className="book-callout-icon h-5 w-5 mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        {title && (
          <p className="book-callout-title font-semibold text-sm mb-2">{title}</p>
        )}
        <div className="text-sm leading-relaxed [&_p]:mb-0 [&_strong]:font-semibold [&_code]:text-xs [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded book-callout-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
        {imageSrc && (
          <img
            src={imageSrc}
            alt={imageAlt || ""}
            loading="lazy"
            decoding="async"
            className="mt-3 w-full rounded-lg border border-border"
          />
        )}
      </div>
    </div>
  );

  if (defaultCollapsed) {
    return (
      <details
        className={cn("book-callout my-8 rounded-lg border-l-4", config.className)}
        role="note"
      >
        <summary className="flex items-center gap-2 cursor-pointer p-5 select-none text-sm font-semibold">
          <Icon className="book-callout-icon h-4 w-4 shrink-0" />
          {title || "Note"}
          <ChevronDown className="h-4 w-4 ml-auto transition-transform [[open]>&]:rotate-180" />
        </summary>
        <div className="px-5 pb-5">{content}</div>
      </details>
    );
  }

  return (
    <aside
      className={cn("book-callout my-8 rounded-lg border-l-4 p-5", config.className)}
      role="note"
    >
      {content}
    </aside>
  );
}

/* ─── InteractiveBlock ─── */

function InteractiveBlockView({
  block,
}: {
  block: InteractiveLinkBlock | InteractiveCollapsibleBlock | InteractiveQuizBlock;
}) {
  switch (block.interactiveType) {
    case "link":
      return <InteractiveLinkView block={block} />;
    case "collapsible":
      return <InteractiveCollapsibleView block={block} />;
    case "quiz":
      return <InteractiveQuizView block={block} />;
  }
}

function InteractiveLinkView({ block }: { block: InteractiveLinkBlock }) {
  const href = block.href.startsWith("/") ? `/docs${block.href}` : block.href;

  return (
    <a
      href={href}
      className="book-interactive-link group my-8 flex items-center gap-4 rounded-lg border border-border p-5 transition-colors hover:bg-surface-raised no-underline"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-dim text-primary">
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
      </div>
      <div>
        <p className="font-semibold text-sm">{block.label}</p>
        <p className="text-sm text-text-muted mt-0.5">{block.description}</p>
      </div>
    </a>
  );
}

function InteractiveCollapsibleView({ block }: { block: InteractiveCollapsibleBlock }) {
  const [open, setOpen] = useState(block.defaultOpen ?? false);

  return (
    <div className="book-interactive-collapsible my-8 rounded-lg border border-border overflow-hidden">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-raised cursor-pointer"
        aria-expanded={open}
      >
        <span className="font-semibold text-sm">{block.label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-text-muted transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 border-t border-border/50 pt-4">
            <div className="book-prose text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.markdown}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InteractiveQuizView({ block }: { block: InteractiveQuizBlock }) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === block.correctIndex;

  return (
    <div className="book-interactive-quiz my-8 rounded-lg border border-border p-5 space-y-4">
      <div className="flex items-start gap-3">
        <HelpCircle className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
        <p className="font-semibold text-sm">{block.question}</p>
      </div>

      <div className="space-y-2 pl-8">
        {block.options.map((option, i) => {
          const isThisCorrect = i === block.correctIndex;
          const isThisSelected = i === selected;

          return (
            <button
              key={i}
              onClick={() => !answered && setSelected(i)}
              disabled={answered}
              className={cn(
                "book-quiz-option w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors cursor-pointer",
                !answered && "border-border hover:bg-surface-raised hover:border-border",
                answered && isThisCorrect && "book-quiz-correct",
                answered && isThisSelected && !isThisCorrect && "book-quiz-wrong",
                answered && !isThisSelected && !isThisCorrect && "border-border/50 opacity-50",
                answered && "cursor-default"
              )}
            >
              <span className="flex items-center gap-2">
                {answered && isThisCorrect && (
                  <CircleCheck className="h-4 w-4 shrink-0 text-success" />
                )}
                {answered && isThisSelected && !isThisCorrect && (
                  <CircleX className="h-4 w-4 shrink-0 text-red-500" />
                )}
                {option}
              </span>
            </button>
          );
        })}
      </div>

      {answered && block.explanation && (
        <div
          className={cn(
            "ml-8 rounded-lg border-l-4 p-4 text-sm leading-relaxed",
            isCorrect
              ? "border-success bg-success-dim"
              : "border-amber-500 bg-amber-500/10"
          )}
        >
          <p className={cn("font-semibold text-xs mb-1", isCorrect ? "text-success" : "text-amber-600")}>
            {isCorrect ? "Correct!" : "Not quite."}
          </p>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.explanation}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
