import { Outlet, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { api, setAccessToken } from "../api/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command";
import { Input } from "../components/ui/input";
import { mockEvents } from "../data/mockEvents";

export function RootLayout() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const name = localStorage.getItem("auth_username");
    const r = localStorage.getItem("auth_role");
    if (token) {
      setAccessToken(token);
    }
    if (name) {
      setUsername(name);
    }
    if (r) {
      setRole(r);
    }
  }, []);

  async function handleLogout() {
    try {
      await api.post("/logout");
    } catch {
      // ignore
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_username");
    localStorage.removeItem("auth_role");
    setAccessToken(null);
    setUsername(null);
    setRole(null);
    navigate("/");
  }

  const searchItems = !searchQ.trim()
    ? mockEvents
    : mockEvents.filter((e) => {
        const q = searchQ.trim().toLowerCase();
        const hay = `${e.title} ${e.venue} ${e.city} ${e.tags.join(" ")}`.toLowerCase();
        return hay.includes(q);
      });

  return (
    <div className="min-h-full">
      <div className="sticky top-0 z-40 bg-transparent backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-xl font-semibold tracking-tight text-white/90 hover:text-white"
              onClick={() => navigate("/")}
              onDoubleClick={() => navigate("/admin/organizer-applications")}
              title="Ana sayfa (çift tık: admin)"
            >
              biletsatis
            </button>
          </div>
          <div className="hidden flex-1 items-center justify-center md:flex">
            <Popover>
              <PopoverTrigger asChild>
                <div className="relative w-full max-w-xl">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                  <Input
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Etkinlik, Mekan, Sanatçı veya Organizatör Ara"
                    className="h-10 rounded-full border-white/10 bg-black/30 pl-9 text-white/90 placeholder:text-white/40"
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent
                align="center"
                sideOffset={10}
                className="w-[70vw] max-w-5xl border-white/15 bg-black/95 p-0"
              >
                <Command className="border-none bg-transparent shadow-none">
                  <CommandInput
                    value={searchQ}
                    onValueChange={setSearchQ}
                    placeholder="Etkinlik, Mekan, Sanatçı veya Organizatör Ara"
                  />
                  <CommandList>
                    <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
                    <CommandGroup>
                      {searchItems.slice(0, 12).map((e) => (
                        <CommandItem
                          key={`top-search-${e.id}`}
                          value={`${e.title} ${e.venue} ${e.city}`}
                          onSelect={() => {
                            setSearchQ("");
                            navigate(`/events/${e.id}`);
                          }}
                        >
                          <div className="flex w-full items-center gap-4">
                            <div className="h-16 w-28 overflow-hidden rounded-md bg-white/10">
                              {e.imageSrc && (
                                <img
                                  src={e.imageSrc}
                                  alt={e.title}
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1 text-sm">
                              <div className="truncate font-semibold">{e.title}</div>
                              <div className="truncate text-xs text-white/70">{e.venue}</div>
                              <div className="mt-0.5 text-xs text-white/50">
                                {e.dateText} • {e.timeText}
                              </div>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {!username ? (
              <>
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="rounded-full text-white/80 hover:text-white"
                >
                  <Link to="/register">Kayıt ol</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="rounded-full bg-white text-black hover:bg-white/90"
                >
                  <Link to="/login">Giriş Yap</Link>
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-white/80 hover:text-white"
                  >
                    {username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[220px]">
                  {role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin/organizer-applications">Admin paneli</Link>
                    </DropdownMenuItem>
                  )}
                  {role === "organizer" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/organizer/organizations">Organizasyonlarım</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/organizer/events">Etkinliklerim</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Hesap ayarları</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout}>Çıkış yap</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 md:py-6">
        <Outlet />
      </div>
    </div>
  );
}

