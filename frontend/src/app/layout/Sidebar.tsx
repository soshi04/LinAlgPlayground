import { Link, useParams } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CHAPTERS } from "@/app/config/chapters";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const { id } = useParams<{ id: string }>();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r bg-muted/30">
      <div className="p-4 font-medium text-sm text-muted-foreground">Chapters</div>
      <ScrollArea className="flex-1 px-2 pb-4">
        <nav className="flex flex-col gap-0.5">
          {CHAPTERS.map((ch) => (
            <Link
              key={ch.id}
              to={`/chapter/${ch.id}`}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                id === ch.id ? "bg-muted text-foreground" : "text-muted-foreground"
              )}
            >
              {ch.order}. {ch.title}
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
