import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export function LegalFooter() {
  return (
    <footer className="border-t border-border bg-card/50 mt-12">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Legal</p>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-xs text-foreground/70 hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-xs text-foreground/70 hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="text-xs text-foreground/70 hover:text-primary transition-colors">Cookie Policy</Link></li>
              <li><Link to="/patents" className="text-xs text-foreground/70 hover:text-primary transition-colors">Patent Portfolio</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Compliance</p>
            <ul className="space-y-2">
              <li><Link to="/compliance" className="text-xs text-foreground/70 hover:text-primary transition-colors">Security &amp; Compliance</Link></li>
              <li><Link to="/dpa" className="text-xs text-foreground/70 hover:text-primary transition-colors">Data Processing Agreement</Link></li>
              <li><Link to="/acceptable-use" className="text-xs text-foreground/70 hover:text-primary transition-colors">Acceptable Use Policy</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Contact</p>
            <ul className="space-y-2">
              <li className="text-xs text-foreground/70">legal@celsius.io</li>
              <li className="text-xs text-foreground/70">dpo@celsius.io</li>
              <li className="text-xs text-foreground/70">security@celsius.io</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Certifications</p>
            <ul className="space-y-2">
              <li className="text-xs text-foreground/70">SOC 2 Type II</li>
              <li className="text-xs text-foreground/70">ISO 27001</li>
              <li className="text-xs text-foreground/70">ISO 42001</li>
              <li className="text-xs text-foreground/70">GDPR · CCPA</li>
            </ul>
          </div>
        </div>
        <Separator className="opacity-50" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-6 text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Celsius Inc. All rights reserved.</span>
          <span className="font-mono uppercase tracking-widest">Patent Pending</span>
        </div>
      </div>
    </footer>
  );
}
