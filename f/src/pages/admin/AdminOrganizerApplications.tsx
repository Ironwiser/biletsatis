import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box, Chip, IconButton, Tooltip } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { api } from "../../api/client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import axios from "axios";

type AppRow = {
  id: string;
  user_id: string;
  user_username: string;
  first_name: string;
  last_name: string;
  city: string;
  phone: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export function AdminOrganizerApplications() {
  const [adminNote, setAdminNote] = useState("");

  const q = useQuery({
    queryKey: ["admin-organizer-applications"],
    queryFn: async () => {
      const r = await api.get<{ applications: AppRow[] }>("/admin/organizer-applications?status=pending");
      return r.data.applications;
    },
  });

  async function approve(id: string) {
    try {
      await api.post(`/admin/organizer-applications/${id}/approve`, { adminNote });
      toast.success("Onaylandı.");
      await q.refetch();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message ?? "Onay başarısız"
        : "Onay başarısız";
      toast.error(msg);
    }
  }

  async function reject(id: string) {
    try {
      await api.post(`/admin/organizer-applications/${id}/reject`, { adminNote });
      toast.success("Reddedildi.");
      await q.refetch();
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message ?? "Ret başarısız"
        : "Ret başarısız";
      toast.error(msg);
    }
  }

  const data = q.data ?? [];

  const columns = useMemo<MRT_ColumnDef<AppRow>[]>(
    () => [
      {
        header: "Kullanıcı",
        accessorFn: (row) => row.user_username,
        id: "user_username",
        size: 140,
      },
      {
        header: "Ad Soyad",
        accessorFn: (row) => `${row.first_name} ${row.last_name}`,
        id: "full_name",
        size: 180,
      },
      {
        header: "Şehir",
        accessorKey: "city",
        size: 80,
      },
      {
        header: "Telefon",
        accessorKey: "phone",
        size: 120,
      },
      {
        header: "E-posta",
        accessorKey: "email",
        size: 200,
      },
      {
        header: "Durum",
        accessorKey: "status",
        Cell: ({ cell }) => (
          <Chip
            size="small"
            label={cell.getValue<string>()}
            color={cell.getValue<string>() === "pending" ? "warning" : "default"}
          />
        ),
        size: 90,
      },
      {
        header: "Başvuru Tarihi",
        accessorKey: "created_at",
        Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString("tr-TR"),
        size: 180,
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
    <div className="space-y-4">
      <div>
        <div className="text-2xl font-semibold tracking-tight">Admin • Organizatör Başvuruları</div>
        <div className="text-sm text-muted-foreground">Bekleyen başvuruları incele ve karar ver.</div>
      </div>

      <Card className="border-white/10 bg-black/25">
        <CardHeader>
          <CardTitle>Bekleyenler</CardTitle>
          <CardDescription>Not (opsiyonel) ekleyip onaylayabilir veya reddedebilirsin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Admin notu</div>
            <Input value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Örn: Evrak eksik..." />
          </div>

          {q.isLoading && <div className="text-sm text-muted-foreground">Yükleniyor...</div>}
          {!q.isLoading && data.length === 0 && (
            <div className="text-sm text-muted-foreground">Bekleyen başvuru yok.</div>
          )}

          {data.length > 0 && (
            <ThemeProvider theme={theme}>
              <Box sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                <MaterialReactTable
                  columns={columns}
                  data={data}
                  enableRowActions
                  positionActionsColumn="last"
                  enableColumnActions={false}
                  enableColumnFilters={false}
                  enableColumnResizing
                  enableDensityToggle={false}
                  enableFullScreenToggle={false}
                  enableHiding={false}
                  muiTablePaperProps={{
                    elevation: 0,
                    sx: {
                      backgroundColor: "transparent",
                      color: "#fff",
                    },
                  }}
                  muiTableBodyProps={{
                    sx: { "& tr:nth-of-type(even)": { backgroundColor: "rgba(255,255,255,0.02)" } },
                  }}
                  renderRowActions={({ row }) => (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="Onayla">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => approve(row.original.id)}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reddet">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => reject(row.original.id)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                />
              </Box>
            </ThemeProvider>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

