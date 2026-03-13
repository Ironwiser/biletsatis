import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import axios from "axios";

export function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    try {
      await api.post("/register", { email, username, password });
      setOk("Kayıt başarılı. Giriş sayfasına yönlendiriliyorsun...");
      navigate("/login");
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message ?? "Kayıt başarısız"
        : "Kayıt başarısız";
      setError(msg);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="border-white/10 bg-black/25">
        <CardHeader>
          <CardTitle>Kayıt</CardTitle>
          <CardDescription>Yeni kullanıcı oluştur.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
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
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">E-mail</div>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Kullanıcı adı</div>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Şifre</div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Kayıt ol
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

