import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, Sparkles } from 'lucide-react';
import { CHARACTER_TEMPLATES, CharacterTemplate } from '@/lib/character-templates';
import { getRaceById } from '@/lib/races';
import { getClassById } from '@/lib/classes';

interface CharacterTemplateSelectorProps {
  onSelect: (template: CharacterTemplate) => void;
  trigger?: React.ReactNode;
}

export function CharacterTemplateSelector({ onSelect, trigger }: CharacterTemplateSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const allTags = Array.from(
    new Set(CHARACTER_TEMPLATES.flatMap(t => t.tags))
  ).sort();

  const filteredTemplates = CHARACTER_TEMPLATES.filter(template => {
    const matchesSearch = searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = !selectedFilter || template.tags.includes(selectedFilter);

    return matchesSearch && matchesFilter;
  });

  const handleSelect = (template: CharacterTemplate) => {
    onSelect(template);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Start from Template
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Character Templates
          </DialogTitle>
          <DialogDescription>
            Choose a pre-built character template to quickly get started
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            <Badge
              variant={selectedFilter === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedFilter(null)}
            >
              All
            </Badge>
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedFilter === tag ? 'default' : 'outline'}
                className="cursor-pointer capitalize"
                onClick={() => setSelectedFilter(selectedFilter === tag ? null : tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTemplates.map(template => {
                const race = getRaceById(template.raceId);
                const charClass = getClassById(template.classId);

                return (
                  <Card
                    key={template.id}
                    className="cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5"
                    onClick={() => handleSelect(template)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <span className="text-2xl">{template.thumbnail}</span>
                        {template.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {race?.name || template.raceId}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {charClass?.name || template.classId}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-[10px] px-1.5 py-0.5 bg-muted rounded capitalize"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredTemplates.length === 0 && (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  No templates found matching your search.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
