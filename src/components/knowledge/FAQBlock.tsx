import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export interface FAQItem {
  q: string;
  a: React.ReactNode;
}

export function FAQBlock({ items, title = 'Frequently asked' }: { items: FAQItem[]; title?: string }) {
  return (
    <section aria-labelledby="faq-title" className="rounded-xl border border-border bg-card/40 p-4 sm:p-6">
      <h2 id="faq-title" className="text-lg font-semibold mb-3">{title}</h2>
      <Accordion type="single" collapsible className="w-full">
        {items.map((it, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border-border">
            <AccordionTrigger className="text-left text-sm">{it.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-foreground/80 leading-relaxed">{it.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
