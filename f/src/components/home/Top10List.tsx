import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import type { TopRow } from "./types";

export function Top10List({ items }: { items: TopRow[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">TOP 10 on biletsatis</div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-md border-white/15 bg-black/40 text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => {
              const el = ref.current;
              if (!el) return;
              const amount = el.clientWidth * 0.8;
              el.scrollTo({ left: el.scrollLeft - amount, behavior: "smooth" });
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-md border-white/15 bg-black/40 text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => {
              const el = ref.current;
              if (!el) return;
              const amount = el.clientWidth * 0.8;
              el.scrollTo({ left: el.scrollLeft + amount, behavior: "smooth" });
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it) => (
          <Link key={it.id} to={`/events/${it.eventId}`} className="block">
            <Card className="w-[260px] shrink-0 border-white/10 bg-black/25 p-3 transition-colors hover:bg-white/5">
              <div className="flex w-full items-center gap-3 text-left">
              <div className="w-5 text-xs font-semibold text-white/70">{it.rank}</div>
              <div className="h-10 w-10 overflow-hidden rounded border border-white/10 bg-white/5">
                {it.imageSrc && (
                  <img
                    src={it.imageSrc}
                    alt={it.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/placeholderposter.webp";
                    }}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold">{it.title}</div>
                <div className="truncate text-[11px] text-white/60">{it.subtitle}</div>
              </div>
              <Badge variant="outline" className="border-white/15 text-[10px]">
                {it.tag}
              </Badge>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

