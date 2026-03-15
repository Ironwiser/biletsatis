import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import type { EventCard } from "./types";

export function HeroCarousel({ slides }: { slides: EventCard[] }) {
  const [index, setIndex] = useState(0);
  const current = slides[index] ?? slides[0];

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  function go(delta: number) {
    if (slides.length <= 1) return;
    const total = slides.length;
    const next = (index + delta + total) % total;
    setIndex(next);
  }

  return (
    <Card className="relative overflow-hidden border-white/10 bg-black/25 p-0">
      <div className="relative h-[260px] w-full md:h-[420px] lg:h-[480px]">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="flex h-full w-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((s) => (
              <div key={s.id} className="relative h-full w-full shrink-0">
                {s.imageSrc && (
                  <img
                    src={s.imageSrc}
                    alt={s.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-90"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/placeholderposter.webp";
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.75),rgba(0,0,0,0.25),rgba(0,0,0,0.85))]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_260px_at_50%_15%,rgba(255,255,255,0.18),transparent_60%)]" />

        <div className="relative flex h-full items-center justify-between gap-4 p-4 md:p-6">
          <div className="max-w-xl">
            <div className="text-xs font-semibold tracking-widest text-white/70">
              MASSANO PRESENTS
            </div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight md:text-5xl">
              {current?.title ?? "SIMULATE"}
            </div>
            <div className="mt-3 inline-flex flex-col gap-1 rounded-lg border border-white/10 bg-black/30 px-4 py-3 backdrop-blur">
              <div className="text-sm font-semibold">{current?.city ?? "ISTANBUL"}</div>
              <div className="text-xs text-white/70">{current?.venue}</div>
              <div className="text-xs text-white/70">
                {current?.dateText} • {current?.timeText}
              </div>
            </div>
          </div>

          <div className="hidden md:block" />
        </div>

        {/* sağ alt aksiyonlar */}
        <div className="absolute bottom-4 right-4 hidden items-end gap-3 md:flex md:bottom-6 md:right-6">
          <Button
            asChild
            size="lg"
            className="h-12 px-8 text-base border-white/20 bg-white/90 text-black hover:bg-white"
          >
            <Link to={current ? `/events/${current.id}` : "/"}>Bilet</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 px-8 text-base border-white/30 text-white/80 hover:text-white"
          >
            <Link to={current ? `/events/${current.id}` : "/"}>Detay</Link>
          </Button>
        </div>

        {/* oklar */}
        <button
          type="button"
          className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md border border-white/15 bg-black/40 text-white/70 hover:bg-white/10 hover:text-white"
          onClick={() => go(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md border border-white/15 bg-black/40 text-white/70 hover:bg-white/10 hover:text-white"
          onClick={() => go(1)}
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* dotlar */}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              className={
                "h-1.5 rounded-full bg-white/40 transition-all" +
                (i === index ? " w-5 bg-white" : " w-2")
              }
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

