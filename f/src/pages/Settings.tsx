import { useMemo, useState } from "react";
import { api } from "../api/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { cn } from "../lib/utils";
import axios from "axios";

type OrganizerApplication = {
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
};

export function Settings() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [status, setStatus] = useState<"unknown" | "none" | "pending" | "approved" | "rejected">(
    "unknown"
  );
  const [statusNote, setStatusNote] = useState<string | null>(null);

  const statusLabel = useMemo(() => {
    switch (status) {
      case "none":
        return { text: "Başvuru yok", color: "default" as const };
      case "pending":
        return { text: "İncelemede", color: "warning" as const };
      case "approved":
        return { text: "Onaylandı", color: "success" as const };
      case "rejected":
        return { text: "Reddedildi", color: "error" as const };
      default:
        return { text: "Bilinmiyor", color: "default" as const };
    }
  }, [status]);

  async function loadMyStatus() {
    setError(null);
    try {
      const r = await api.get<{ applications: OrganizerApplication[] }>("/organizer-applications/me");
      const latest = r.data.applications?.[0] ?? null;
      if (!latest) {
        setStatus("none");
        setStatusNote(null);
        return;
      }
      setStatus(latest.status);
      setStatusNote(latest.admin_note ?? null);
    } catch (err: unknown) {
      setStatus("unknown");
      setStatusNote(null);
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message ??
          "Başvuru durumu alınamadı (giriş gerekli olabilir)"
        : "Başvuru durumu alınamadı (giriş gerekli olabilir)";
      setError(msg);
    }
  }

  async function submitApplication() {
    setError(null);
    setOk(null);
    try {
      await api.post("/organizer-applications", { firstName, lastName, city, phone });
      setOk("Başvurun alındı. Admin incelemesinden sonra organizatör rolün açılacak.");
      await loadMyStatus();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message ?? "Başvuru gönderilemedi"
        : "Başvuru gönderilemedi";
      setError(msg);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-2xl font-semibold tracking-tight">Organizatör Paneli</div>
        <div className="text-sm text-muted-foreground">
          Başvurunu gönder, durumunu takip et. Onaylanınca organizasyon oluşturabilirsin.
        </div>
      </div>

      <Card className="max-w-2xl border-white/10 bg-black/25">
        <CardHeader>
          <CardTitle>Başvuru ve Durum</CardTitle>
          <CardDescription>Admin incelemesi sonrası rolün güncellenir.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
          {ok && (
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {ok}
            </div>
          )}

          <div className="rounded-lg border border-border bg-background/30 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm font-medium">Durum</div>
              <Badge
                variant={status === "approved" ? "default" : status === "pending" ? "secondary" : "outline"}
                className={cn(status === "rejected" && "border-red-500/40 text-red-200")}
              >
                {statusLabel.text}
              </Badge>
              <Button variant="outline" size="sm" onClick={loadMyStatus} className="h-8">
                Durumu yenile
              </Button>
            </div>
            {statusNote && (
              <div className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Admin notu:</span> {statusNote}
              </div>
            )}
          </div>

          <div className="h-px w-full bg-border" />

          <div className="space-y-3">
            <div className="text-sm font-semibold">Organizatör olmak için başvur</div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Ad</div>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Soyad</div>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Şehir</div>
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Telefon</div>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <Button onClick={submitApplication} className="w-full">
              Başvuru gönder
            </Button>
            <div className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
              Onaydan sonra <b>Organizatör → Organizasyonlarım</b> sayfasından organizasyon oluşturabilirsin.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

