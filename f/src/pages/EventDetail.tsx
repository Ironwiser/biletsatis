import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { mapApiEventToCard } from "../api/events";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export function EventDetail() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const r = await api.get<{ event: import("../api/events").ApiEvent }>(`/events/${id}`);
      return mapApiEventToCard(r.data.event);
    },
    enabled: !!id,
  });

  const event = data;

  if (!id) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">Geçersiz etkinlik adresi.</div>
        <Button asChild variant="outline">
          <Link to="/">Ana sayfaya dön</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">Etkinlik yükleniyor...</div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">Böyle bir etkinlik bulunamadı.</div>
        <Button asChild variant="outline">
          <Link to="/">Ana sayfaya dön</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
      <Card className="overflow-hidden border border-white/10 bg-black/60">
        <div className="relative">
          {event.imageSrc && (
            <img
              src={event.imageSrc}
              alt={event.title}
              className="h-[420px] w-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/placeholderposter.webp";
              }}
            />
          )}
          {!event.imageSrc && (
            <div className="flex h-[420px] w-full items-center justify-center bg-black/40 text-muted-foreground">
              Afiş yok
            </div>
          )}
          {event.badge && (
            <div className="absolute left-4 top-4">
              <Badge className="bg-amber-500 text-black">{event.badge}</Badge>
            </div>
          )}
        </div>
      </Card>

      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold leading-tight">{event.title}</h1>
          <div className="text-sm text-muted-foreground">
            {event.venue} • {event.city}
          </div>
        </div>

        <Card className="space-y-3 border border-white/10 bg-black/60 p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="space-y-1">
              <div className="font-medium">Tarih</div>
              <div className="text-muted-foreground">
                {event.dateText} • {event.timeText}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase text-muted-foreground">Başlangıç</div>
              <div className="text-lg font-semibold">{event.priceText}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {event.tags.map((t) => (
              <Badge key={t} variant="secondary" className="border border-white/10 bg-white/5">
                {t}
              </Badge>
            ))}
          </div>

          <div className="grid gap-2">
            <Button className="w-full">Bilet Al</Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Geri</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
