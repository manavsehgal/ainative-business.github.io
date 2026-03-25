import { cn } from "../../lib/utils";
import { READING_PATHS } from "../../lib/book/reading-paths";

interface PathSelectorProps {
  activePath: string | null;
  onSelectPath: (pathId: string | null) => void;
}

export function PathSelector({ activePath, onSelectPath }: PathSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        className={cn(
          "h-7 px-3 text-xs font-medium rounded-md border transition-colors cursor-pointer",
          activePath === null
            ? "bg-primary text-white border-primary"
            : "border-border hover:bg-surface-raised"
        )}
        onClick={() => onSelectPath(null)}
      >
        All Chapters
      </button>
      {READING_PATHS.map((path) => (
        <button
          key={path.id}
          className={cn(
            "h-7 px-3 text-xs font-medium rounded-md border transition-colors cursor-pointer",
            activePath === path.id
              ? "bg-primary text-white border-primary"
              : "border-border hover:bg-surface-raised"
          )}
          onClick={() => onSelectPath(path.id)}
        >
          {path.name}
        </button>
      ))}
    </div>
  );
}
