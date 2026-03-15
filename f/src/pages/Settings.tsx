import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../api/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { cn } from "../lib/utils";
import axios from "axios";

type Profile = {
  id: string;
  email: string;
  username: string;
  role: string;
};

type OrganizerApplication = {
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
};

export function Settings() {
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"unknown" | "none" | "pending" | "approved" | "rejected">(
    "unknown"
  );
  const [statusNote, setStatusNote] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const r = await api.get<Profile>("/profile");
      return r.data;
    },
  });

  const profile = profileQuery.data;
  const profileSynced = useRef(false);
  useEffect(() => {
    if (profile?.username != null && !profileSynced.current) {
      setUsername(profile.username);
      profileSynced.current = true;
    }
  }, [profile?.username]);

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
      toast.error(msg);
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Kullanıcı adı boş olamaz.");
      return;
    }
    try {
      const r = await api.put<Profile>("/profile", { username: username.trim() });
      setUsername(r.data.username);
      localStorage.setItem("auth_username", r.data.username);
      toast.success("Profil güncellendi.");
      await profileQuery.refetch();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message ?? "Güncellenemedi"
        : "Güncellenemedi";
      toast.error(msg);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Yeni şifre en az 6 karakter olmalı.");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      toast.error("Yeni şifreler eşleşmiyor.");
      return;
    }
    try {
      await api.put("/profile/password", {
        currentPassword: currentPassword,
        newPassword: newPassword,
      });
      toast.success("Şifre güncellendi.");
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message ?? "Şifre güncellenemedi"
        : "Şifre güncellenemedi";
      toast.error(msg);
    }
  }

  async function submitApplication() {
    try {
      await api.post("/organizer-applications", { firstName, lastName, city, phone });
      toast.success("Başvurun alındı. Admin incelemesinden sonra organizatör rolün açılacak.");
      await loadMyStatus();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message ?? "Başvuru gönderilemedi"
        : "Başvuru gönderilemedi";
      toast.error(msg);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-semibold tracking-tight text-white/95">Hesap ayarları</div>
        <div className="text-sm text-white/50">
          Profil bilgilerini ve şifreni güncelle. Organizatör olmak için başvurabilirsin.
        </div>
      </div>

      {/* Hesap bilgileri */}
      <Card className="max-w-2xl border-white/5 bg-black/40 shadow-none">
        <CardHeader>
          <CardTitle className="text-white/95">Hesap bilgileri</CardTitle>
          <CardDescription className="text-white/50">
            E-posta girişte kullanılır ve değiştirilemez. Kullanıcı adı görünen ismindir.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileQuery.isLoading && (
            <div className="text-sm text-white/50">Yükleniyor...</div>
          )}
          {profileQuery.isError && (
            <div className="text-sm text-white/60">
              Hesap bilgileri yüklenemedi. Giriş yapmış olmalısın.
            </div>
          )}
          {profile && !profileQuery.isError && (
            <form onSubmit={saveProfile} className="space-y-3">
              <div className="space-y-1">
                <div className="text-xs text-white/50">E-posta</div>
                <Input
                  value={profile.email}
                  disabled
                  className="cursor-not-allowed opacity-70"
                />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-white/50">Kullanıcı adı</div>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Görünen adın"
                />
              </div>
              <Button type="submit" className="bg-white/10 text-white hover:bg-white/20 border-0">
                Kaydet
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Şifre değiştir */}
      <Card className="max-w-2xl border-white/5 bg-black/40 shadow-none">
        <CardHeader>
          <CardTitle className="text-white/95">Şifre değiştir</CardTitle>
          <CardDescription className="text-white/50">
            Mevcut şifreni girip yeni şifreni belirle (en az 6 karakter).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={savePassword} className="space-y-3">
            <div className="space-y-1">
              <div className="text-xs text-white/50">Mevcut şifre</div>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white/50">Yeni şifre</div>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="En az 6 karakter"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white/50">Yeni şifre (tekrar)</div>
              <Input
                type="password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="bg-white/10 text-white hover:bg-white/20 border-0">
              Şifreyi güncelle
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Organizatör başvurusu */}
      <Card className="max-w-2xl border-white/5 bg-black/40 shadow-none">
        <CardHeader>
          <CardTitle className="text-white/95">Organizatör başvurusu</CardTitle>
          <CardDescription className="text-white/50">
            Organizatör olmak için başvur. Admin onayından sonra organizasyon ve etkinlik oluşturabilirsin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm font-medium text-white/90">Durum</div>
              <Badge
                variant={status === "approved" ? "default" : status === "pending" ? "secondary" : "outline"}
                className={cn(
                  "border-white/15",
                  status === "rejected" && "border-red-500/40 text-red-200"
                )}
              >
                {statusLabel.text}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={loadMyStatus}
                className="h-8 border-white/15 text-white/80 hover:bg-white/10 hover:text-white"
              >
                Durumu yenile
              </Button>
            </div>
            {statusNote && (
              <div className="mt-2 text-sm text-white/60">
                <span className="font-medium text-white/80">Admin notu:</span> {statusNote}
              </div>
            )}
          </div>

          <div className="h-px w-full bg-white/10" />

          <div className="space-y-3">
            <div className="text-sm font-semibold text-white/90">Organizatör olmak için başvur</div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <div className="text-xs text-white/50">Ad</div>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-white/50">Soyad</div>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-white/50">Şehir</div>
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="space-y-1">
                <div className="text-xs text-white/50">Telefon</div>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
            <Button
              onClick={submitApplication}
              className="w-full bg-white/10 text-white hover:bg-white/20 border-0"
            >
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
