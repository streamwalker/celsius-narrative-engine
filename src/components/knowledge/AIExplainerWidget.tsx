import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, Sparkles, X } from 'lucide-react';
import { getEntry, getAllEntries } from '@/lib/knowledge-glossary';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

function sampleAnswer(question: string): string {
  const q = question.toLowerCase().trim();
  if (!q) return "Ask me anything about a term on the page!";
  // Try to match a known term
  const all = getAllEntries();
  const hit = all.find((e) => q.includes(e.term.toLowerCase()) || q.includes(e.id.toLowerCase()));
  if (hit) {
    if (q.includes('simple') || q.includes('plain')) return `In plain English: ${hit.plain}`;
    if (q.includes('why')) return hit.whyItMatters ?? `${hit.term} matters because: ${hit.short}`;
    if (q.includes('related')) {
      const rel = (hit.related ?? []).map((r) => getEntry(r)?.term).filter(Boolean).join(', ');
      return rel ? `Related to ${hit.term}: ${rel}.` : `No related entries listed for ${hit.term}.`;
    }
    return `${hit.term} — ${hit.short}`;
  }
  return "I don't have that one yet. Try a highlighted term on this page, or ask me to explain a concept in simple terms.";
}

export function AIExplainerWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: "Hi! I'm a placeholder explainer. Ask me about any highlighted term — try 'What is an Astralnaut?' or 'Explain the Astral Field in simple terms.'" },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setTimeout(() => {
      setMessages((m) => [...m, { role: 'assistant', content: sampleAnswer(text) }]);
    }, 250);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
          aria-label="Open AI Explainer"
        >
          <Sparkles className="h-4 w-4" />
          Ask Explainer
        </button>
      )}
      {open && (
        <div className="fixed bottom-4 right-4 z-40 w-[min(360px,calc(100vw-2rem))] rounded-xl border border-border bg-card shadow-2xl shadow-primary/10 flex flex-col max-h-[70vh]">
          <header className="flex items-center justify-between border-b border-border px-3 py-2">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Explainer</p>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">demo</span>
            </div>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setOpen(false)} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </header>
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm leading-relaxed rounded-lg px-3 py-2 max-w-[85%] ${
                  m.role === 'user'
                    ? 'ml-auto bg-primary/20 text-foreground'
                    : 'bg-secondary text-foreground/90'
                }`}
              >
                {m.content}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form
            className="flex items-center gap-2 border-t border-border p-2"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a term…"
              className="h-9 text-sm"
            />
            <Button type="submit" size="icon" className="h-9 w-9" aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
