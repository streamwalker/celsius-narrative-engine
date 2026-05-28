import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "./AppSidebar";
import { Telemetry } from "./jarvis/Telemetry";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* Ambient HUD layers */}
      <div className="hud-grid" />
      <div className="hud-vignette" />

      {/* Telemetry strip */}
      <Telemetry />

      {/* Mobile sidebar overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-[hsl(var(--primary)/0.18)] bg-sidebar transform transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: 'linear-gradient(180deg, hsl(var(--bg-2) / 0.6), hsl(var(--bg-1) / 0.4))' }}
      >
        <AppSidebar onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Main content */}
      <div className="lg:pl-64 relative z-10">
        {/* Mobile top bar */}
        <div className="sticky top-[34px] z-30 flex h-12 items-center justify-between border-b border-[hsl(var(--primary)/0.18)] bg-[hsl(var(--bg-1))] px-4 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div
              className="grid h-7 w-7 place-items-center rounded-md border border-primary"
              style={{
                background: 'radial-gradient(circle, hsl(var(--primary)/0.25), transparent 70%)',
                boxShadow: '0 0 18px hsl(var(--primary)/0.35), inset 0 0 8px hsl(var(--primary)/0.4)',
              }}
            >
              <span className="font-display text-[11px] font-bold text-primary" style={{ textShadow: '0 0 8px hsl(var(--primary)/0.55)' }}>
                C°
              </span>
            </div>
            <span className="font-display text-sm font-bold tracking-[0.14em]">CELSIUS</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
            className="border border-[hsl(var(--primary)/0.42)] text-primary font-mono text-[11px] tracking-[0.14em]"
          >
            <Menu className="h-4 w-4 mr-1" /> MENU
          </Button>
        </div>

        <main>{children}</main>
      </div>
    </div>
  );
}
