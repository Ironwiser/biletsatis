import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { EventCard, TopRow } from "../components/home/types";
import { HeroCarousel } from "../components/home/HeroCarousel";
import {
  CategoryBar,
  type Category,
  type Genre,
  type TopTab,
} from "../components/home/CategoryBar";
import { SectionRow } from "../components/home/SectionRow";
import { Top10List } from "../components/home/Top10List";
import { WideBanner } from "../components/home/WideBanner";
import { mockEvents } from "../data/mockEvents";
import wide1 from "../assets/placeholders/seatomountain.png";
import wide2 from "../assets/placeholders/faroeislandDenmark.png";
import { api, getApiOrigin } from "../api/client";

export function Home() {
  const [topTab, setTopTab] = useState<TopTab>("tumu");
  const [category, setCategory] = useState<Category>("tumu");
  const [genre, setGenre] = useState<Genre>("tumu");

  const events: EventCard[] = useMemo(() => mockEvents, []);

  // Ana sayfa bölümleri: sadece genre filtresi (arama metni etkilemez)
  const filteredForSections = useMemo(() => {
    const byGenre =
      genre === "tumu" || genre === "elektronik" || genre === "turkce"
        ? events
        : events.filter((e) => e.tags.some((t) => t.toLowerCase() === genre));
    return byGenre;
  }, [events, genre]);

  const top10 = useMemo<TopRow[]>(() => {
    const base = [...events, ...events, ...events].slice(0, 10);
    return base.map((e, idx) => ({
      rank: idx + 1,
      id: `${e.id}-${idx}`,
      eventId: e.id,
      title: e.title,
      subtitle: `${e.venue} • ${e.city}`,
      imageSrc: e.imageSrc,
      tag: e.tags[0] ?? "ETKİNLİK",
    }));
  }, [events]);

  type Org = {
    id: string;
    name: string;
    description: string | null;
    city: string;
    poster_url?: string | null;
  };

  const orgQuery = useQuery({
    queryKey: ["organizations-public"],
    queryFn: async () => {
      const r = await api.get<{ organizations: Org[] }>("/organizations");
      return r.data.organizations;
    },
  });

  return (
    <div className="space-y-6">
      <CategoryBar
        topTab={topTab}
        onTopTabChange={setTopTab}
        category={category}
        onCategoryChange={setCategory}
        genre={genre}
        onGenreChange={setGenre}
      />
      <HeroCarousel slides={events.slice(0, 10)} />

      {/* top 10 + sections (full width) */}
      <div className="space-y-4">
        <Top10List items={top10} />
        <SectionRow title="biletsatis'de En Yeniler!" items={filteredForSections} />
        <WideBanner src={wide1} />
        <SectionRow title="Sadece biletsatis'de" items={events} />
        <SectionRow title="Bu Hafta" items={[...events].reverse()} />
        <WideBanner src={wide2} />
        <div className="space-y-2">
          <div className="text-lg font-semibold">Organizasyonlar</div>
          {orgQuery.isLoading && (
            <div className="text-sm text-muted-foreground">Organizasyonlar yükleniyor...</div>
          )}
          {orgQuery.data && orgQuery.data.length === 0 && (
            <div className="text-sm text-muted-foreground">
              Henüz kayıtlı organizasyon yok. Organizatör hesabınla giriş yapıp organizasyon
              oluşturabilirsin.
            </div>
          )}
          {orgQuery.data && orgQuery.data.length > 0 && (
            <div className="grid gap-3 md:grid-cols-3">
              {orgQuery.data.map((o) => (
                <div
                  key={o.id}
                  className="overflow-hidden rounded-xl border border-white/10 bg-black/25"
                >
                  {o.poster_url && (
                    <div className="h-40 w-full overflow-hidden border-b border-white/10 bg-black/20">
                      <img
                        src={`${getApiOrigin()}${o.poster_url}`}
                        alt={`${o.name} afiş`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="space-y-1 p-3 text-sm">
                    <div className="font-semibold">
                      {o.name}{" "}
                      <span className="text-xs text-white/60">• {o.city}</span>
                    </div>
                    {o.description && (
                      <div className="line-clamp-2 text-xs text-white/60">{o.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
