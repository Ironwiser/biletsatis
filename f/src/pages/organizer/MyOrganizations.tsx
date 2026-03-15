import { useState } from "react";
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
  description: string | null;
  city: string;
  poster_url?: string | null;
  created_at: string;
  website?: string | null;
  instagram?: string | null;
};

export function MyOrganizations() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["my-organizations"],
    queryFn: async () => {
      const r = await api.get<{ organizations: Org[] }>("/organizations/me");
      return r.data.organizations;
    },
  });

  async function uploadPosterIfNeeded(): Promise<string | null> {
    if (!posterFile) return null;
    const form = new FormData();
    form.append("file", posterFile);
    const r = await api.post<{ url: string }>("/uploads/poster", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return r.data.url;
  }

  async function create() {
    try {
      const posterUrl = await uploadPosterIfNeeded();
      await api.post("/organizations", {
        name,
        description,
        city,
        posterUrl,
        website,
        instagram,
      });
      toast.success("Organizasyon oluşturuldu.");
      setName("");
      setDescription("");
      setCity("");
      setWebsite("");
      setInstagram("");
      setPosterFile(null);
      setPosterPreview(null);
      await q.refetch();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message ?? "Oluşturma başarısız"
        : "Oluşturma başarısız";
      toast.error(msg);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-2xl font-semibold tracking-tight">Organizatör • Organizasyonlarım</div>
        <div className="text-sm text-muted-foreground">Onay sonrası organizasyon oluşturup yönetebilirsin.</div>
      </div>

      <Card className="max-w-3xl border-white/5 bg-black/40 shadow-none">
        <CardHeader>
          <CardTitle className="text-white/95">Yeni organizasyon</CardTitle>
          <CardDescription className="text-white/50">En az ad ve şehir zorunlu.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
              <div className="text-xs text-muted-foreground">Ad</div>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <div className="text-xs text-muted-foreground">Açıklama (opsiyonel)</div>
              <textarea
                className="min-h-[90px] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder:text-white/40 focus-visible:outline-none focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/20"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <div className="text-xs text-muted-foreground">Şehir</div>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white/50">Web sitesi (opsiyonel)</div>
              <Input
                placeholder="https://..."
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white/50">Instagram (opsiyonel)</div>
              <Input
                placeholder="https://instagram.com/..."
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <div className="text-xs text-white/50">Afiş (jpg/png/webp)</div>
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
                    alt="Afiş önizleme"
                    className="h-48 w-full object-cover"
                  />
                </div>
              )}
              <div className="text-xs text-white/40">
                İpucu: Afiş otomatik sıkıştırılır ve WebP olarak kaydedilir.
              </div>
            </div>
          </div>
          <Button onClick={create} className="w-full bg-white/10 text-white hover:bg-white/20 border-0">
            Oluştur
          </Button>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-black/25">
        <CardHeader>
          <CardTitle>Liste</CardTitle>
          <CardDescription>Senin oluşturduğun organizasyonlar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {q.isLoading && <div className="text-sm text-muted-foreground">Yükleniyor...</div>}
          {q.data?.length === 0 && <div className="text-sm text-muted-foreground">Henüz organizasyon yok.</div>}
          <div className="grid gap-3 md:grid-cols-2">
            {q.data?.map((o) => (
              <Card key={o.id} className="border-white/10 bg-black/20">
                <CardContent className="space-y-1 p-4">
                  {o.poster_url && (
                    <div className="mb-2 overflow-hidden rounded-md border border-white/10 bg-black/20">
                      <img
                        src={`${getApiOrigin()}${o.poster_url}`}
                        alt={`${o.name} afiş`}
                        className="h-36 w-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/placeholderposter.webp";
                        }}
                      />
                    </div>
                  )}
                  <div className="text-sm font-semibold">
                    {o.name} <span className="text-muted-foreground">• {o.city}</span>
                  </div>
                  {o.description && (
                    <div className="text-sm text-muted-foreground">{o.description}</div>
                  )}
                  {(o.website || o.instagram) && (
                    <div className="text-xs text-muted-foreground">
                      {o.website && (
                        <div>
                          Web:{" "}
                          <a
                            href={o.website}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            {o.website}
                          </a>
                        </div>
                      )}
                      {o.instagram && (
                        <div>
                          Instagram:{" "}
                          <a
                            href={o.instagram}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            {o.instagram}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-muted-foreground">
            Bu sayfa organizatör rolü ister. Başvurun admin tarafından onaylanınca çalışır.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

