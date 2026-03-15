import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { api, getApiOrigin } from "../api/client";
import { mapApiEventToCard } from "../api/events";
import type { ApiEvent } from "../api/events";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";

const DEFAULT_POSTER = "/placeholderposter.webp";

export function Home() {
  const [topTab, setTopTab] = useState<TopTab>("tumu");
  const [category, setCategory] = useState<Category>("tumu");
  const [genre, setGenre] = useState<Genre>("tumu");
  const [popupOpen, setPopupOpen] = useState(false);

  const featuredPopupQuery = useQuery({
    queryKey: ["events-featured-popup"],
    queryFn: async () => {
      const r = await api.get<{ event: ApiEvent | null }>("/events/featured-popup");
      return r.data.event;
    },
  });

  // Ana sayfaya her girildiğinde öne çıkan etkinlik varsa dialog aç
  useEffect(() => {
    const featured = featuredPopupQuery.data;
    if (featured) {
      const t = setTimeout(() => setPopupOpen(true), 0);
      return () => clearTimeout(t);
    }
  }, [featuredPopupQuery.data]);

  const handleClosePopup = () => setPopupOpen(false);

  const eventsQuery = useQuery({
    queryKey: ["events-public"],
    queryFn: async () => {
      const r = await api.get<{ events: import("../api/events").ApiEvent[] }>("/events");
      return r.data.events.map(mapApiEventToCard);
    },
  });

  const events: EventCard[] = useMemo(
    () => eventsQuery.data ?? [],
    [eventsQuery.data]
  );

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

  const featuredEvent = featuredPopupQuery.data;
  const featuredPosterSrc = featuredEvent?.poster_url
    ? featuredEvent.poster_url.startsWith("http")
      ? featuredEvent.poster_url
      : `${getApiOrigin()}${featuredEvent.poster_url}`
    : DEFAULT_POSTER;
  const featuredDateText = featuredEvent
    ? new Date(featuredEvent.starts_at).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        weekday: "long",
      })
    : "";
  const featuredTimeText = featuredEvent
    ? new Date(featuredEvent.starts_at).toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="space-y-6">
      <Dialog
        open={popupOpen}
        onOpenChange={setPopupOpen}
      >
        <DialogContent className="max-w-md border-white/20 bg-black/90 backdrop-blur [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-md [&>button]:border [&>button]:border-white/15 [&>button]:bg-white/5 [&>button]:text-white/80 [&>button]:opacity-100 [&>button]:hover:bg-white/15 [&>button]:hover:text-white [&>button]:focus:ring-white/30">
          {featuredEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-left text-xl">Öne çıkan etkinlik</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="overflow-hidden rounded-lg border border-white/10">
                  <img
                    src={featuredPosterSrc}
                    alt={featuredEvent.name}
                    className="h-48 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/placeholderposter.webp";
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-lg">{featuredEvent.name}</div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                    <span><span className="text-white/50">Mekan:</span> {featuredEvent.venue}</span>
                    <span><span className="text-white/50">Şehir:</span> {featuredEvent.city}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                    <span><span className="text-white/50">Tarih:</span> {featuredDateText}</span>
                    <span><span className="text-white/50">Saat:</span> {featuredTimeText}</span>
                  </div>
                </div>
                <Button
                  asChild
                  className="w-full border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/30"
                >
                  <Link to={`/events/${featuredEvent.id}`} onClick={handleClosePopup}>
                    Etkinliği gör & bilet al
                  </Link>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <CategoryBar
        topTab={topTab}
        onTopTabChange={setTopTab}
        category={category}
        onCategoryChange={setCategory}
        genre={genre}
        onGenreChange={setGenre}
      />

      {eventsQuery.isLoading && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Etkinlikler yükleniyor...
        </div>
      )}

      {!eventsQuery.isLoading && events.length > 0 && (
        <>
          <HeroCarousel slides={events.slice(0, 10)} />

          {/* top 10 + sections (full width) */}
          <div className="space-y-4">
            <Top10List items={top10} />
            <SectionRow title="biletsatis'de En Yeniler!" items={filteredForSections} />
            <WideBanner src="https://placehold.co/1200x200/1a1a1a/555?text=biletsatis" />
            <SectionRow title="Sadece biletsatis'de" items={events} />
            <SectionRow title="Bu Hafta" items={[...events].reverse()} />
            <WideBanner src="https://placehold.co/1200x200/252525/666?text=Etkinlikler" />
          </div>
        </>
      )}

      {!eventsQuery.isLoading && events.length === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Henüz etkinlik yok.
        </div>
      )}

      <div className="space-y-4">
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
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/placeholderposter.webp";
                        }}
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
