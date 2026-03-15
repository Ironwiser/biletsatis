import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, setAccessToken } from "../api/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import axios from "axios";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const r = await api.post("/login", { email, password });
      setAccessToken(r.data.accessToken);
      if (r.data.accessToken) {
        localStorage.setItem("access_token", r.data.accessToken);
      }
      if (r.data.user?.username) {
        localStorage.setItem("auth_username", r.data.user.username);
      } else {
        localStorage.removeItem("auth_username");
      }
      if (r.data.user?.role) {
        localStorage.setItem("auth_role", r.data.user.role);
      } else {
        localStorage.removeItem("auth_role");
      }
      toast.success(`Giriş başarılı: ${r.data.user?.username ?? ""}`);
      window.location.href = "/";
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message ?? "Giriş başarısız"
        : "Giriş başarısız";
      toast.error(msg);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="border-white/10 bg-black/25">
        <CardHeader>
          <CardTitle>Giriş</CardTitle>
          <CardDescription>E-mail ve şifren ile giriş yap.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">E-mail</div>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
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
              Giriş yap
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

