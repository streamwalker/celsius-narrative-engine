import { useState } from "react";
import { Copy, Download, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parseScriptPages } from "@/lib/script-page-parser";

interface Props {
  result: string;
  format: string;
  onCopy: () => void;
  onDownload: () => void;
}

export function FormattedScriptViewer({ result, format, onCopy, onDownload }: Props) {
  const [view, setView] = useState<"annotated" | "raw">(format === "graphic-novel" ? "annotated" : "raw");
  const isGraphicNovel = format === "graphic-novel";
  const pages = isGraphicNovel ? parseScriptPages(result) : [];
  const canAnnotate = isGraphicNovel && pages.length > 0;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Formatted Script</span>
          {canAnnotate && (
            <div className="flex ml-3 border border-border rounded-md overflow-hidden">
              <button
                onClick={() => setView("annotated")}
                className={`px-2.5 py-1 text-xs font-medium flex items-center gap-1 transition-colors ${
                  view === "annotated" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye className="h-3 w-3" /> Annotated
              </button>
              <button
                onClick={() => setView("raw")}
                className={`px-2.5 py-1 text-xs font-medium flex items-center gap-1 transition-colors border-l border-border ${
                  view === "raw" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="h-3 w-3" /> Raw
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onCopy}>
            <Copy className="h-4 w-4 mr-1" /> Copy
          </Button>
          <Button variant="ghost" size="sm" onClick={onDownload}>
            <Download className="h-4 w-4 mr-1" /> .txt
          </Button>
        </div>
      </div>

      {/* Content */}
      {canAnnotate && view === "annotated" ? (
        <div className="p-4 space-y-1 max-h-[70vh] overflow-y-auto">
          {pages.map((page, pi) => {
            const spreadPosition = page.isOdd ? "Right (Recto)" : "Left (Verso)";
            const showSpreadSeparator = page.isOdd && page.pageNumber > 1;

            return (
              <div key={pi}>
                {showSpreadSeparator && (
                  <div className="border-t-2 border-dashed border-muted-foreground/20 my-4" />
                )}
                <div className="mb-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 mb-2">
                    <span className="font-mono font-bold text-sm">PAGE {page.pageNumber}</span>
                    <span className="text-xs text-muted-foreground">— {spreadPosition}</span>
                  </div>

                  {page.panels.length > 0 ? (
                    <div className="space-y-1.5 pl-2">
                      {page.panels.map((panel, panelIdx) => {
                        const isCliffhanger = page.isOdd && panelIdx === page.panels.length - 1;
                        const isReveal = !page.isOdd && panelIdx === 0;

                        let borderClass = "border-l-4 border-transparent";
                        let bgClass = "";
                        let badge: React.ReactNode = null;

                        if (isCliffhanger) {
                          borderClass = "border-l-4 border-amber-500";
                          bgClass = "bg-amber-500/5";
                          badge = (
                            <Badge variant="outline" className="text-[10px] border-amber-500/50 text-amber-500">
                              CLIFFHANGER
                            </Badge>
                          );
                        } else if (isReveal) {
                          borderClass = "border-l-4 border-primary";
                          bgClass = "bg-primary/5";
                          badge = (
                            <Badge variant="outline" className="text-[10px] border-primary/50 text-primary">
                              REVEAL
                            </Badge>
                          );
                        }

                        return (
                          <div key={panelIdx} className={`rounded-md px-3 py-2 ${borderClass} ${bgClass}`}>
                            <div className="flex items-start gap-2 mb-1">
                              <span className="font-mono text-xs text-muted-foreground shrink-0 mt-0.5">
                                Panel {panel.panelNumber}
                              </span>
                              {badge}
                            </div>
                            <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed text-foreground/90">
                              {panel.text}
                            </pre>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed text-foreground/80 pl-2">
                      {page.rawText}
                    </pre>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <pre className="p-4 text-xs whitespace-pre-wrap font-mono leading-relaxed max-h-[70vh] overflow-y-auto bg-card">
          {result}
        </pre>
      )}
    </div>
  );
}
