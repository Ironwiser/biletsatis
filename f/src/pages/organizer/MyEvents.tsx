import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getApiOrigin } from "../../api/client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import axios from "axios";

type Org = {
  id: string;
  name: string;
  city: string;
};

type EventRow = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  venue: string;
  city: string;
  poster_url: string | null;
  category: string | null;
  event_type: string | null;
  address: string | null;
  age_limit: string | null;
  door_time: string | null;
  rules: string | null;
  social_instagram: string | null;
  social_website: string | null;
  starts_at: string;
  ends_at: string | null;
  price_display: string | null;
};

export function MyEvents() {
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [eventType, setEventType] = useState("");
  const [address, setAddress] = useState("");
  const [ageLimit, setAgeLimit] = useState("");
  const [doorTime, setDoorTime] = useState("");
  const [rules, setRules] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialWebsite, setSocialWebsite] = useState("");
  const [startsAt, setStartsAt] = useState(""); // datetime-local
  const [endsAt, setEndsAt] = useState(""); // datetime-local
  const [priceDisplay, setPriceDisplay] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  const orgQuery = useQuery({
    queryKey: ["my-organizations"],
    queryFn: async () => {
      const r = await api.get<{ organizations: Org[] }>("/organizations/me");
      return r.data.organizations;
    },
  });

  useEffect(() => {
    if (!selectedOrgId && orgQuery.data && orgQuery.data.length > 0) {
      setSelectedOrgId(orgQuery.data[0].id);
      setCity(orgQuery.data[0].city);
    }
  }, [orgQuery.data, selectedOrgId]);

  const eventsQuery = useQuery({
    queryKey: ["my-events", selectedOrgId],
    enabled: !!selectedOrgId,
    queryFn: async () => {
      const r = await api.get<{ events: EventRow[] }>("/events", {
        params: { organizationId: selectedOrgId },
      });
      return r.data.events;
    },
  });

  function resetForm() {
    setName("");
    setDescription("");
    setVenue("");
    setCategory("");
    setEventType("");
    setAddress("");
    setAgeLimit("");
    setDoorTime("");
    setRules("");
    setSocialInstagram("");
    setSocialWebsite("");
    setStartsAt("");
    setEndsAt("");
    setPriceDisplay("");
    setEditingId(null);
    setPosterFile(null);
    setPosterPreview(null);
  }

  async function uploadPosterIfNeeded(): Promise<string | null> {
    if (!posterFile) return null;
    const form = new FormData();
    form.append("file", posterFile);
    const r = await api.post<{ url: string }>("/uploads/poster", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return r.data.url;
  }

  async function createOrUpdateEvent() {
    if (!selectedOrgId) {
      toast.error("Önce bir organizasyon seçmelisin.");
      return;
    }
    if (!name || !venue || !city || !startsAt) {
      toast.error("Ad, kategori, mekan, şehir ve başlangıç tarihi zorunlu.");
      return;
    }

    try {
      const startsIso = new Date(startsAt).toISOString();
      const endsIso = endsAt ? new Date(endsAt).toISOString() : null;
      const posterUrl = await uploadPosterIfNeeded();

      const payload = {
        name,
        description,
        venue,
        city,
        category,
        eventType,
        address,
        ageLimit,
        doorTime,
        rules,
        socialInstagram,
        socialWebsite,
        posterUrl,
        priceDisplay: priceDisplay.trim(),
        startsAt: startsIso,
        endsAt: endsIso,
      };

      if (editingId) {
        await api.put(`/events/${editingId}`, payload);
        toast.success("Etkinlik güncellendi.");
      } else {
        await api.post("/events", { organizationId: selectedOrgId, ...payload });
        toast.success("Etkinlik oluşturuldu.");
      }

      resetForm();
      await eventsQuery.refetch();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message ?? "Etkinlik oluşturulamadı"
        : "Etkinlik oluşturulamadı";
      toast.error(msg);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-2xl font-semibold tracking-tight">Organizatör • Etkinliklerim</div>
        <div className="text-sm text-white/50">
          Onaylı organizasyonların için tarihli etkinlikler oluştur.
        </div>
      </div>

      <Card className="max-w-3xl border-white/5 bg-black/40 shadow-none">
        <CardHeader>
          <CardTitle className="text-white/95">Yeni etkinlik</CardTitle>
          <CardDescription className="text-white/50">Etkinlik organizasyonuna bağlı olacak ve başlangıç tarihi takvim için kullanılacak.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
              <div className="text-xs text-white/50">Organizasyon</div>
              <select
                className="h-9 w-full rounded-md border border-white/10 bg-white/5 px-2 text-sm text-white/90 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
                value={selectedOrgId}
                onChange={(e) => {
                  setSelectedOrgId(e.target.value);
                  const found = orgQuery.data?.find((o) => o.id === e.target.value);
                  if (found) setCity(found.city);
                }}
              >
                <option value="">Seç...</option>
                {orgQuery.data?.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} • {o.city}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <div className="text-xs text-white/50">Etkinlik adı</div>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white/50">Kategori</div>
              <select
                className="h-9 w-full rounded-md border border-white/10 bg-white/5 px-2 text-sm text-white/90 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Kategori Seçiniz</option>
                <option value="Festival">Festival</option>
                <option value="Konser">Konser</option>
                <option value="Sahne">Sahne</option>
                <option value="Topluluklar">Topluluklar</option>
                <option value="Parti">Parti</option>
                <option value="Eğitim">Eğitim</option>
                <option value="Kamp">Kamp</option>
                <option value="Tiyatro">Tiyatro</option>
                <option value="Stand-Up">Stand-Up</option>
                <option value="Workshop">Workshop</option>
                <option value="Çocuk Etkinlikleri">Çocuk Etkinlikleri</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white/50">Etkinlik türü (opsiyonel)</div>
              <Input
                placeholder="Örn: Elektronik müzik, canlı performans..."
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <div className="text-xs text-white/50">Açıklama (opsiyonel)</div>
              <textarea
                className="min-h-[80px] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder:text-white/40 focus-visible:outline-none focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/20"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white/50">Mekan</div>
              <Input value={venue} onChange={(e) => setVenue(e.target.value)} />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white/50">Şehir</div>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white/50">Fiyat (gösterim metni, opsiyonel)</div>
              <Input
                placeholder="Örn: ₺ 150, Ücretsiz, ₺ 100 – 200"
                value={priceDisplay}
                onChange={(e) => setPriceDisplay(e.target.value)}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <div className="text-xs text-white/50">Adres (opsiyonel)</div>
              <Input
                placeholder="Mekan adresi"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white/50">Başlangıç (tarih & saat)</div>
              <Input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white/50">Bitiş (opsiyonel)</div>
              <Input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white/50">Kapı açılış saati (metin)</div>
              <Input
                placeholder="Örn: 20:00"
                value={doorTime}
                onChange={(e) => setDoorTime(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white/50">Yaş sınırı (metin)</div>
              <Input
                placeholder="Örn: 18+, 21+"
                value={ageLimit}
                onChange={(e) => setAgeLimit(e.target.value)}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <div className="text-xs text-white/50">Etkinlik kuralları (opsiyonel)</div>
              <textarea
                className="min-h-[80px] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder:text-white/40 focus-visible:outline-none focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/20"
                placeholder="Mekan kuralları, giriş koşulları vb."
                value={rules}
                onChange={(e) => setRules(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white/50">Instagram (opsiyonel)</div>
              <Input
                placeholder="https://instagram.com/xyz"
                value={socialInstagram}
                onChange={(e) => setSocialInstagram(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white/50">Web sitesi (opsiyonel)</div>
              <Input
                placeholder="https://..."
                value={socialWebsite}
                onChange={(e) => setSocialWebsite(e.target.value)}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <div className="text-xs text-white/50">Etkinlik afişi (opsiyonel)</div>
              <Input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="file:mr-2 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:text-white/90 file:transition-colors hover:file:bg-white/15"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setPosterFile(f);
                  setPosterPreview(f ? URL.createObjectURL(f) : null);
                }}
              />
              {posterPreview && (
                <div className="overflow-hidden rounded-md border border-white/10 bg-white/5">
                  <img
                    src={posterPreview}
                    alt="Etkinlik afiş önizleme"
                    className="h-40 w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
          <Button onClick={createOrUpdateEvent} className="w-full bg-white/10 text-white hover:bg-white/20 border-0">
            {editingId ? "Etkinliği güncelle" : "Etkinlik oluştur"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-black/40 shadow-none">
        <CardHeader>
          <CardTitle className="text-white/95">Etkinlik listesi</CardTitle>
          <CardDescription className="text-white/50">Seçili organizasyona ait etkinlikler.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {eventsQuery.isLoading && (
            <div className="text-sm text-white/50">Yükleniyor...</div>
          )}
          {selectedOrgId && eventsQuery.data && eventsQuery.data.length === 0 && (
            <div className="text-sm text-white/50">
              Bu organizasyona ait etkinlik yok. Yukarıdan yeni bir etkinlik oluştur.
            </div>
          )}
          {!selectedOrgId && (
            <div className="text-sm text-white/50">
              Önce yukarıdan bir organizasyon seç.
            </div>
          )}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {eventsQuery.data?.map((ev) => {
              const posterSrc =
                ev.poster_url && !ev.poster_url.startsWith("http")
                  ? `${getApiOrigin()}${ev.poster_url}`
                  : ev.poster_url ?? null;

              return (
                <Card key={ev.id} className="border-white/5 bg-white/5">
                  <CardContent className="flex gap-3 p-3">
                    {posterSrc && (
                      <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/5">
                        <img
                          src={posterSrc}
                          alt={`${ev.name} afiş`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/placeholderposter.webp";
                          }}
                        />
                      </div>
                    )}
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-white/95">{ev.name}</div>
                          <div className="text-[11px] text-white/50">
                            {ev.city} • {ev.venue}
                          </div>
                        </div>
                        <Button
                          size="xs"
                          variant="outline"
                          className="border-white/15 bg-transparent text-[11px] text-white/80 hover:bg-white/10 hover:text-white"
                          onClick={() => {
                            setEditingId(ev.id);
                            setSelectedOrgId(ev.organization_id);
                            setName(ev.name);
                            setDescription(ev.description ?? "");
                            setVenue(ev.venue);
                            setCity(ev.city);
                            setCategory(ev.category ?? "");
                            setEventType(ev.event_type ?? "");
                            setAddress(ev.address ?? "");
                            setAgeLimit(ev.age_limit ?? "");
                            setDoorTime(ev.door_time ?? "");
                            setRules(ev.rules ?? "");
                            setSocialInstagram(ev.social_instagram ?? "");
                            setSocialWebsite(ev.social_website ?? "");
                            setPriceDisplay(ev.price_display ?? "");
                            const resolvedPoster =
                              ev.poster_url && !ev.poster_url.startsWith("http")
                                ? `${getApiOrigin()}${ev.poster_url}`
                                : ev.poster_url ?? null;
                            setPosterPreview(resolvedPoster);
                            setPosterFile(null);
                            setStartsAt(
                              ev.starts_at
                                ? new Date(ev.starts_at).toISOString().slice(0, 16)
                                : ""
                            );
                            setEndsAt(
                              ev.ends_at ? new Date(ev.ends_at).toISOString().slice(0, 16) : ""
                            );
                          }}
                        >
                          Düzenle
                        </Button>
                      </div>
                      {ev.category && (
                        <div className="text-[11px] text-white/50">
                          Kategori: {ev.category}
                        </div>
                      )}
                      {ev.age_limit && (
                        <div className="text-[11px] text-white/50">
                          Yaş sınırı: {ev.age_limit}
                        </div>
                      )}
                      <div className="text-[11px] text-white/50">
                        {new Date(ev.starts_at).toLocaleString("tr-TR")}
                        {ev.ends_at && ` — ${new Date(ev.ends_at).toLocaleString("tr-TR")}`}
                      </div>
                      {ev.description && (
                        <div className="line-clamp-2 text-[11px] text-white/50">
                          {ev.description}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

