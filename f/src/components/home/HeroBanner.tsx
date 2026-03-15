import { Button } from "../ui/button";
import { Card } from "../ui/card";

export function HeroBanner({ imageSrc }: { imageSrc: string }) {
  return (
    <Card className="relative overflow-hidden border-white/10 bg-black/25 p-0">
      <div className="relative h-[220px] w-full md:h-[320px]">
        <img
          src={imageSrc}
          alt="Hero"
          className="absolute inset-0 h-full w-full object-cover opacity-85"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/placeholderposter.webp";
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.65),rgba(0,0,0,0.25),rgba(0,0,0,0.7))]" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_260px_at_50%_20%,rgba(255,255,255,0.12),transparent_60%)]" />

        <div className="relative flex h-full items-center justify-between gap-4 p-4 md:p-6">
          <div className="max-w-xl">
            <div className="text-xs font-semibold tracking-widest text-white/70">MASSANO PRESENTS</div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight md:text-5xl">SIMULATE</div>
            <div className="mt-3 inline-flex flex-col gap-1 rounded-lg border border-white/10 bg-black/30 px-4 py-3 backdrop-blur">
              <div className="text-sm font-semibold">ISTANBUL</div>
              <div className="text-xs text-white/70">KüçükÇiftlik Park</div>
              <div className="text-xs text-white/70">23.05.2026 • 21:00</div>
            </div>
          </div>

          <div className="hidden items-end gap-2 md:flex">
            <Button variant="outline" size="sm" className="border-white/15">
              Bilet
            </Button>
            <Button size="sm">Detay</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

