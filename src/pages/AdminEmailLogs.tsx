import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, ShieldAlert } from "lucide-react";

type LogRow = {
  id: string;
  message_id: string | null;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  created_at: string;
};

type StateRow = {
  id: number;
  retry_after_until: string | null;
  batch_size: number;
  send_delay_ms: number;
  auth_email_ttl_minutes: number;
  transactional_email_ttl_minutes: number;
  updated_at: string;
};

const RANGES = [
  { label: "Last 24h", hours: 24 },
  { label: "Last 7 days", hours: 24 * 7 },
  { label: "Last 30 days", hours: 24 * 30 },
];

const statusVariant = (status: string) => {
  if (status === "sent") return "default" as const;
  if (status === "dlq" || status === "failed" || status === "bounced" || status === "complained")
    return "destructive" as const;
  return "secondary" as const;
};

export default function AdminEmailLogs() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<LogRow[]>([]);
  const [state, setState] = useState<StateRow | null>(null);
  const [rangeHours, setRangeHours] = useState(24 * 7);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.title = "Email Logs · Admin";
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCheckingAuth(false);
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
      setCheckingAuth(false);
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    const since = new Date(Date.now() - rangeHours * 3600 * 1000).toISOString();
    const [{ data: logs }, { data: st }] = await Promise.all([
      supabase
        .from("email_send_log")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(500),
      supabase.from("email_send_state").select("*").maybeSingle(),
    ]);
    setRows((logs as LogRow[]) ?? []);
    setState((st as StateRow) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, rangeHours]);

  // Deduplicate by message_id, keep latest status
  const dedupedRows = useMemo(() => {
    const seen = new Map<string, LogRow>();
    for (const r of rows) {
      const key = r.message_id ?? r.id;
      if (!seen.has(key)) seen.set(key, r);
    }
    return Array.from(seen.values());
  }, [rows]);

  const templates = useMemo(
    () => Array.from(new Set(dedupedRows.map((r) => r.template_name))).sort(),
    [dedupedRows]
  );

  const filtered = useMemo(() => {
    return dedupedRows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (templateFilter !== "all" && r.template_name !== templateFilter) return false;
      if (search && !r.recipient_email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [dedupedRows, statusFilter, templateFilter, search]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = { total: filtered.length, sent: 0, failed: 0, suppressed: 0, pending: 0 };
    for (const r of filtered) {
      if (r.status === "sent") counts.sent++;
      else if (r.status === "dlq" || r.status === "failed" || r.status === "bounced") counts.failed++;
      else if (r.status === "suppressed") counts.suppressed++;
      else if (r.status === "pending") counts.pending++;
    }
    return counts;
  }, [filtered]);

  if (checkingAuth) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Admin access required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            You must be signed in as an admin to view email send attempts and queue logs.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Email Pipeline Logs</h1>
          <p className="text-muted-foreground text-sm">
            Send attempts, queue processing, and rate-limit state for the email infrastructure.
          </p>
        </div>
        <Button onClick={load} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </header>

      {/* Queue state */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Queue processor state</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Batch size</div>
            <div className="font-medium">{state?.batch_size ?? "—"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Send delay</div>
            <div className="font-medium">{state?.send_delay_ms ?? "—"} ms</div>
          </div>
          <div>
            <div className="text-muted-foreground">Auth TTL</div>
            <div className="font-medium">{state?.auth_email_ttl_minutes ?? "—"} min</div>
          </div>
          <div>
            <div className="text-muted-foreground">Txn TTL</div>
            <div className="font-medium">{state?.transactional_email_ttl_minutes ?? "—"} min</div>
          </div>
          <div>
            <div className="text-muted-foreground">Rate-limit until</div>
            <div className="font-medium">
              {state?.retry_after_until ? new Date(state.retry_after_until).toLocaleString() : "—"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total", value: stats.total },
          { label: "Sent", value: stats.sent },
          { label: "Failed", value: stats.failed },
          { label: "Suppressed", value: stats.suppressed },
          { label: "Pending", value: stats.pending },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="text-muted-foreground text-xs uppercase tracking-wide">{s.label}</div>
              <div className="text-2xl font-semibold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 flex flex-wrap gap-3">
          <Select value={String(rangeHours)} onValueChange={(v) => setRangeHours(Number(v))}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {RANGES.map((r) => (
                <SelectItem key={r.hours} value={String(r.hours)}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="dlq">DLQ</SelectItem>
              <SelectItem value="suppressed">Suppressed</SelectItem>
              <SelectItem value="rate_limited">Rate limited</SelectItem>
            </SelectContent>
          </Select>
          <Select value={templateFilter} onValueChange={setTemplateFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Template" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All templates</SelectItem>
              {templates.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Search recipient…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Send attempts ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No email events in this range.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{r.template_name}</TableCell>
                      <TableCell>{r.recipient_email}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate text-xs text-muted-foreground" title={r.error_message ?? ""}>
                        {r.error_message ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
