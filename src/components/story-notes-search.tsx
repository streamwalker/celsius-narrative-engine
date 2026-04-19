'use client';

import { Search } from 'lucide-react';

interface StoryNotesSearchProps {
  query: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function StoryNotesSearch({ query, onChange, placeholder = 'Search notes…' }: StoryNotesSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex h-11 w-full rounded-lg glass-panel border-glow px-10 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
      />
    </div>
  );
}
