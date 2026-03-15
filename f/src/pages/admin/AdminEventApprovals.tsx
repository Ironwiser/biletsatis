import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box, Chip, IconButton, Tooltip } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { api } from "../../api/client";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import axios from "axios";

type EventRow = {
  id: string;
  organization_id: string;
  name: string;
  venue: string;
  city: string;
  poster_url: string | null;
  category: string | null;
  starts_at: string;
  is_approved: boolean;
  organization_name: string;
};

export function AdminEventApprovals() {
  const queryClient = useQueryClient();
  const [featuredEventId, setFeaturedEventId] = useState<string>("");

  const eventsQuery = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const r = await api.get<{ events: EventRow[] }>("/admin/events");
      return r.data.events;
    },
  });

  const featuredQuery = useQuery({
    queryKey: ["admin-settings-featured-popup"],
    queryFn: async () => {
      const r = await api.get<{ eventId: string | null }>("/admin/settings/featured-popup");
      return r.data.eventId;
    },
  });

  const setFeaturedMutation = useMutation({
    mutationFn: async (eventId: string | null) => {
      const r = await api.put<{ eventId: string | null }>("/admin/settings/featured-popup", {
        eventId,
      });
      return r.data;
    },
    onSuccess: (_, eventId) => {
      queryClient.setQueryData(["admin-settings-featured-popup"], eventId);
      toast.success(eventId ? "Popup etkinliği güncellendi." : "Popup etkinliği kaldırıldı.");
    },
    onError: (err: unknown) => {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? "Kaydedilemedi"
        : "Kaydedilemedi";
      toast.error(msg);
    },
  });

  async function approve(id: string) {
    try {
      await api.put(`/admin/events/${id}/approve`);
      toast.success("Etkinlik onaylandı.");
      await eventsQuery.refetch();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? "Onay başarısız"
        : "Onay başarısız";
      toast.error(msg);
    }
  }

  async function reject(id: string) {
    try {
      await api.put(`/admin/events/${id}/reject`);
      toast.success("Etkinlik onayı kaldırıldı.");
      await eventsQuery.refetch();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? "İşlem başarısız"
        : "İşlem başarısız";
      toast.error(msg);
    }
  }

  const events = eventsQuery.data ?? [];
  const approvedEvents = events.filter((e) => e.is_approved);
  const currentFeaturedId = featuredQuery.data ?? null;
  const effectiveFeatured = featuredEventId || currentFeaturedId || "";

  const columns = useMemo<MRT_ColumnDef<EventRow>[]>(
    () => [
      {
        header: "Etkinlik",
        accessorKey: "name",
        size: 220,
      },
      {
        header: "Organizasyon",
        accessorKey: "organization_name",
        size: 160,
      },
      {
        header: "Şehir",
        accessorKey: "city",
        size: 100,
      },
      {
        header: "Tarih",
        accessorFn: (row) => new Date(row.starts_at).toLocaleString("tr-TR"),
        id: "starts_at",
        size: 140,
      },
      {
        header: "Onay",
        accessorKey: "is_approved",
        Cell: ({ cell }) => (
          <Chip
            size="small"
            label={cell.getValue<boolean>() ? "Onaylı" : "Bekliyor"}
            color={cell.getValue<boolean>() ? "success" : "warning"}
          />
        ),
        size: 100,
      },
      {
        header: "İşlem",
        id: "actions",
        size: 120,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", gap: 1 }}>
            {!row.original.is_approved && (
              <Tooltip title="Onayla">
                <IconButton size="small" color="success" onClick={() => approve(row.original.id)}>
                  <CheckIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {row.original.is_approved && (
              <Tooltip title="Onayı kaldır">
                <IconButton size="small" color="default" onClick={() => reject(row.original.id)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ],
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "dark",
          background: { default: "#050509", paper: "#050509" },
          primary: { main: "#ffffff" },
        },
      }),
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-semibold tracking-tight">Admin • Etkinlik onayları</div>
        <div className="text-sm text-muted-foreground">
          Etkinlikleri onayla veya onayı kaldır. Sadece onaylı etkinlikler ana sayfada listelenir.
        </div>
      </div>

      <Card className="border-white/10 bg-black/25">
        <CardHeader>
          <CardTitle>Etkinlikler</CardTitle>
          <CardDescription>Onaylı etkinlikler ana sayfada görünür; onaysızlar sadece organizatörde görünür.</CardDescription>
        </CardHeader>
        <CardContent>
          {eventsQuery.isLoading && <div className="text-sm text-muted-foreground">Yükleniyor...</div>}
          {!eventsQuery.isLoading && events.length === 0 && (
            <div className="text-sm text-muted-foreground">Henüz etkinlik yok.</div>
          )}
          {!eventsQuery.isLoading && events.length > 0 && (
            <ThemeProvider theme={theme}>
              <Box sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                <MaterialReactTable
                  columns={columns}
                  data={events}
                  enableRowActions={false}
                  enableColumnActions={false}
                  enableColumnFilters={false}
                  enableColumnResizing
                  enableDensityToggle={false}
                  enableFullScreenToggle={false}
                  enableHiding={false}
                  muiTablePaperProps={{
                    elevation: 0,
                    sx: { backgroundColor: "transparent", color: "#fff" },
                  }}
                  muiTableBodyProps={{
                    sx: { "& tr:nth-of-type(even)": { backgroundColor: "rgba(255,255,255,0.02)" } },
                  }}
                />
              </Box>
            </ThemeProvider>
          )}
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-black/25">
        <CardHeader>
          <CardTitle>Ana sayfa popup’ında gösterilecek etkinlik</CardTitle>
          <CardDescription>
            Ziyaretçiler ana sayfada açılan dialog’da bu etkinliği görür. Sadece onaylı etkinlikler seçilebilir.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {featuredQuery.isLoading && <div className="text-sm text-muted-foreground">Yükleniyor...</div>}
          {!featuredQuery.isLoading && (
            <>
              <select
                value={effectiveFeatured}
                onChange={(e) => {
                  const v = e.target.value;
                  setFeaturedEventId(v);
                  setFeaturedMutation.mutate(v || null);
                }}
                className="w-full max-w-md rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Popup gösterme</option>
                {approvedEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} — {ev.venue}, {ev.city}
                  </option>
                ))}
              </select>
              {setFeaturedMutation.isPending && (
                <div className="text-xs text-muted-foreground">Kaydediliyor...</div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
