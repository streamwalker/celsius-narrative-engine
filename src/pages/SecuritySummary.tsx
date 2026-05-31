import { CheckCircle2, ShieldCheck, AlertTriangle, FileCode } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FixedIssue {
  id: string;
  title: string;
  severity: "high" | "medium" | "low";
  category: string;
  description: string;
  resolution: string;
  files: string[];
  fixedOn: string;
}

const FIXED_ISSUES: FixedIssue[] = [
  {
    id: "SEC-001",
    title: "character-portraits bucket allowed anonymous writes",
    severity: "high",
    category: "Storage",
    description:
      "Storage policies on the character-portraits bucket permitted anonymous upload/update/delete and listing.",
    resolution:
      "Dropped anonymous-writable policies. Writes now require authentication, and users can only modify objects inside their own {user_id}/ prefix. Public reads remain via getPublicUrl.",
    files: [
      "supabase/migrations/20260528081522_5364a5b7-f9d3-45b8-b911-5ed058296cdc.sql",
      "supabase/migrations/20260530193001_42042e59-6016-42f1-861d-67495f634041.sql",
    ],
    fixedOn: "2026-05-28",
  },
  {
    id: "SEC-002",
    title: "Collaborator visibility missing on comic tables",
    severity: "medium",
    category: "RLS",
    description:
      "comic_projects, comic_pages, and comic_panels SELECT policies did not honour the project access helper, so collaborators could not view shared content.",
    resolution:
      "Extended SELECT policies to use has_project_access() across all three tables.",
    files: ["supabase/migrations/20260528081522_5364a5b7-f9d3-45b8-b911-5ed058296cdc.sql"],
    fixedOn: "2026-05-28",
  },
  {
    id: "SEC-003",
    title: "project_versions ignored collaborator roles",
    severity: "medium",
    category: "RLS",
    description:
      "project_versions SELECT/INSERT policies only checked ownership, blocking editors from reading or writing version history.",
    resolution:
      "SELECT now honours has_project_access(); INSERT allows editor+ via has_project_role().",
    files: ["supabase/migrations/20260528081522_5364a5b7-f9d3-45b8-b911-5ed058296cdc.sql"],
    fixedOn: "2026-05-28",
  },
  {
    id: "SEC-004",
    title: "Email queue helper functions exposed to public roles",
    severity: "high",
    category: "Functions",
    description:
      "move_to_dlq, read_email_batch, enqueue_email, and delete_email had no explicit search_path and were executable by PUBLIC/anon/authenticated.",
    resolution:
      "Set search_path = public and revoked all privileges from PUBLIC, anon, and authenticated. Only service_role can execute.",
    files: ["supabase/migrations/20260528081522_5364a5b7-f9d3-45b8-b911-5ed058296cdc.sql"],
    fixedOn: "2026-05-28",
  },
  {
    id: "SEC-005",
    title: "AI edge functions accepted unauthenticated requests",
    severity: "high",
    category: "Edge Functions",
    description:
      "35+ AI generation and analysis edge functions had verify_jwt = false, exposing them to unauthenticated abuse and API-credit draining.",
    resolution:
      "Set verify_jwt = true for all panelcraft-*, analyze-*, generate-*, and related AI functions plus send-notification.",
    files: ["supabase/config.toml"],
    fixedOn: "2026-05-30",
  },
  {
    id: "SEC-006",
    title: "send-notification trusted caller-supplied userId/email",
    severity: "high",
    category: "Edge Functions",
    description:
      "The send-notification function accepted userId and email from the request body, allowing an authenticated user to direct emails to arbitrary recipients.",
    resolution:
      "Rewrote the handler to resolve the user via auth.getUser() and derive the recipient from user_preferences or the authenticated account. Caller-supplied identifiers are now ignored.",
    files: ["supabase/functions/send-notification/index.ts"],
    fixedOn: "2026-05-30",
  },
  {
    id: "SEC-007",
    title: "character-portraits writes were not scoped to owner",
    severity: "medium",
    category: "Storage",
    description:
      "Authenticated users could write to any folder in the character-portraits bucket, not just their own.",
    resolution:
      "Added owner-folder check using auth.uid()::text = (storage.foldername(name))[1] for INSERT/UPDATE/DELETE policies.",
    files: ["supabase/migrations/20260530193001_42042e59-6016-42f1-861d-67495f634041.sql"],
    fixedOn: "2026-05-30",
  },
];

const REMAINING_ISSUES: { title: string; reason: string }[] = [];

const SEVERITY_STYLES: Record<FixedIssue["severity"], string> = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  medium: "bg-warn/15 text-warn border-warn/30",
  low: "bg-muted text-muted-foreground border-border",
};

export default function SecuritySummary() {
  const fixedCount = FIXED_ISSUES.length;
  const remainingCount = REMAINING_ISSUES.length;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span>Security · Scan Summary</span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Security Posture
        </h1>
        <p className="text-sm text-muted-foreground">
          Snapshot of the most recent security scan, the issues that have been remediated, and any
          findings still requiring attention.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="font-mono text-[10px] uppercase tracking-[0.2em]">
              Fixed
            </CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              {fixedCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="font-mono text-[10px] uppercase tracking-[0.2em]">
              Remaining
            </CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <AlertTriangle
                className={`h-6 w-6 ${remainingCount === 0 ? "text-muted-foreground" : "text-destructive"}`}
              />
              {remainingCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="font-mono text-[10px] uppercase tracking-[0.2em]">
              Last Scan
            </CardDescription>
            <CardTitle className="text-base font-medium">2026-05-30</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold tracking-tight">Fixed Issues</h2>
        <div className="space-y-3">
          {FIXED_ISSUES.map((issue) => (
            <Card key={issue.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {issue.id}
                  </Badge>
                  <Badge variant="outline" className={SEVERITY_STYLES[issue.severity]}>
                    {issue.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary">{issue.category}</Badge>
                  <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Fixed {issue.fixedOn}
                  </span>
                </div>
                <CardTitle className="pt-2 text-base">{issue.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">{issue.description}</p>
                <p>
                  <span className="font-semibold text-foreground">Resolution: </span>
                  <span className="text-muted-foreground">{issue.resolution}</span>
                </p>
                <div className="space-y-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Files Changed
                  </p>
                  <ul className="space-y-1">
                    {issue.files.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-2 py-1 font-mono text-xs"
                      >
                        <FileCode className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold tracking-tight">Remaining Issues</h2>
        {remainingCount === 0 ? (
          <Card>
            <CardContent className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              No outstanding findings reported by the most recent scan.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {REMAINING_ISSUES.map((r) => (
              <Card key={r.title}>
                <CardHeader>
                  <CardTitle className="text-base">{r.title}</CardTitle>
                  <CardDescription>{r.reason}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        The security scanner reports the most common issues but does not perform deep penetration
        testing. Re-run a scan after major backend changes.
      </p>
    </div>
  );
}
