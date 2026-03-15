import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import type { EventCard } from "./types";

export function SectionRow({ title, items }: { title: string; items: EventCard[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">{title}</div>
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
        {items.map((e) => (
          <Link key={`${title}-${e.id}`} to={`/events/${e.id}`} className="block">
            <Card className="group relative w-[230px] shrink-0 overflow-hidden border-white/10 bg-black/20 p-0 transition-colors hover:bg-white/5">
              <div className="relative h-36 w-full">
                {e.imageSrc && (
                  <img
                    src={e.imageSrc}
                    alt={e.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-300 group-hover:scale-[1.04]"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/placeholderposter.webp";
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.92))]" />
                {e.badge && (
                  <div className="absolute left-2 top-2">
                    <Badge className="text-[11px]">{e.badge}</Badge>
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="truncate text-sm font-semibold">{e.title}</div>
                <div className="mt-1 truncate text-xs text-white/60">
                  {e.city} • {e.dateText}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <Badge variant="outline" className="border-white/15 text-[11px]">
                    {e.tags[0] ?? "ETKİNLİK"}
                  </Badge>
                  <div className="text-xs font-semibold">{e.priceText}</div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

