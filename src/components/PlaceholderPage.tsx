import { Link } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PlaceholderPageProps {
  title: string;
  tagline: string;
  description: string;
  sourceLineCount?: number;
  phase?: string;
}

export function PlaceholderPage({
  title,
  tagline,
  description,
  sourceLineCount,
  phase = "Phase 2",
}: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-1" /> Home
          </Button>
        </Link>

        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-primary mb-2">{tagline}</p>
          <h1 className="font-display text-4xl md:text-5xl tracking-wider mb-4">{title}</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Construction className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Scheduled for {phase}</CardTitle>
            </div>
            <CardDescription>
              This route is registered and reachable. Full implementation is queued for {phase}.
              {sourceLineCount !== undefined && (
                <>
                  {" "}
                  The original implementation comprises approximately{" "}
                  <span className="font-mono text-foreground">{sourceLineCount.toLocaleString()}</span> lines.
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              The original source, database migrations, and edge functions have been preserved so no behavior
              is lost — they will be wired into this surface in a subsequent session.
            </p>
            <div className="flex gap-2">
              <Link to="/script-formatter">
                <Button size="sm">Use Script Formatter</Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="sm">Back to Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
