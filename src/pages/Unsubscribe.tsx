import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type State =
  | { kind: "loading" }
  | { kind: "valid" }
  | { kind: "already" }
  | { kind: "invalid"; message: string }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ kind: "invalid", message: "Missing unsubscribe token." });
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON_KEY } }
        );
        const data = await res.json();
        if (!res.ok) {
          setState({ kind: "invalid", message: data.error || "Invalid or expired link." });
          return;
        }
        if (data.valid === false && data.reason === "already_unsubscribed") {
          setState({ kind: "already" });
          return;
        }
        if (data.valid) {
          setState({ kind: "valid" });
          return;
        }
        setState({ kind: "invalid", message: "Invalid or expired link." });
      } catch (e: any) {
        setState({ kind: "invalid", message: e?.message || "Network error." });
      }
    })();
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setState({ kind: "submitting" });
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setState({ kind: "error", message: data.error || "Failed to unsubscribe." });
        return;
      }
      if (data.success || data.reason === "already_unsubscribed") {
        setState({ kind: "success" });
      } else {
        setState({ kind: "error", message: "Unexpected response." });
      }
    } catch (e: any) {
      setState({ kind: "error", message: e?.message || "Network error." });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Unsubscribe</CardTitle>
          <CardDescription>Manage your email preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.kind === "loading" && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Verifying link…
            </div>
          )}
          {state.kind === "valid" && (
            <>
              <p className="text-sm text-muted-foreground">
                Click below to unsubscribe from these emails.
              </p>
              <Button onClick={confirm} className="w-full">Confirm unsubscribe</Button>
            </>
          )}
          {state.kind === "submitting" && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Processing…
            </div>
          )}
          {state.kind === "success" && (
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              <p>You've been unsubscribed. You won't receive these emails anymore.</p>
            </div>
          )}
          {state.kind === "already" && (
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              <p>This email address is already unsubscribed.</p>
            </div>
          )}
          {(state.kind === "invalid" || state.kind === "error") && (
            <div className="flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{state.message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
