import React, { useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Clock, 
  Search,
  Filter,
  User,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { 
  loadCharacterHistory, 
  CharacterVersion,
  formatVersionDate,
  getChangeTypeLabel,
  getChangeTypeColor
} from '@/lib/character-history';

interface Character {
  id: string;
  name: string;
  image?: string;
}

interface CharacterTimelineProps {
  characters: Character[];
  onCharacterClick?: (characterId: string) => void;
  className?: string;
}

interface TimelineEntry extends CharacterVersion {
  characterName: string;
  characterImage?: string;
}

export function CharacterTimeline({ 
  characters, 
  onCharacterClick,
  className = '' 
}: CharacterTimelineProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCharacter, setFilterCharacter] = useState<string>('all');

  // Aggregate all character history
  const allHistory = useMemo(() => {
    const history = loadCharacterHistory();
    const entries: TimelineEntry[] = [];

    Object.entries(history).forEach(([characterId, versions]) => {
      const character = characters.find(c => c.id === characterId);
      if (!character) return;

      versions.forEach(version => {
        entries.push({
          ...version,
          characterName: character.name,
          characterImage: character.image,
        });
      });
    });

    // Sort by timestamp descending (newest first)
    return entries.sort((a, b) => b.timestamp - a.timestamp);
  }, [characters]);

  // Filter entries
  const filteredHistory = useMemo(() => {
    return allHistory.filter(entry => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!entry.characterName.toLowerCase().includes(query) &&
            !entry.changeDescription.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Type filter
      if (filterType !== 'all' && entry.changeType !== filterType) {
        return false;
      }

      // Character filter
      if (filterCharacter !== 'all' && entry.characterId !== filterCharacter) {
        return false;
      }

      return true;
    });
  }, [allHistory, searchQuery, filterType, filterCharacter]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, TimelineEntry[]> = {};

    filteredHistory.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dateKey = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(entry);
    });

    return groups;
  }, [filteredHistory]);

  const changeTypes = ['created', 'edited', 'profile_updated', 'pose_added', 'pose_removed', 'equipment_changed'];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search timeline..."
            className="pl-9"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {changeTypes.map(type => (
              <SelectItem key={type} value={type}>
                {getChangeTypeLabel(type as CharacterVersion['changeType'])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterCharacter} onValueChange={setFilterCharacter}>
          <SelectTrigger className="w-[180px]">
            <User className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Characters" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Characters</SelectItem>
            {characters.map(char => (
              <SelectItem key={char.id} value={char.id}>
                {char.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      <ScrollArea className="flex-1">
        {Object.keys(groupedByDate).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No history entries found</p>
            <p className="text-sm mt-1">Changes will appear here as you edit characters</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-border" />

            {Object.entries(groupedByDate).map(([dateKey, entries]) => (
              <div key={dateKey} className="mb-6">
                {/* Date header */}
                <div className="flex items-center gap-3 mb-3 relative">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center z-10">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground">{dateKey}</h3>
                  <Badge variant="outline" className="text-xs">
                    {entries.length} change{entries.length !== 1 ? 's' : ''}
                  </Badge>
                </div>

                {/* Entries for this date */}
                <div className="space-y-2 ml-6 pl-10 border-l-2 border-transparent">
                  {entries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="relative p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-all cursor-pointer animate-fade-in group"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => onCharacterClick?.(entry.characterId)}
                    >
                      {/* Connector dot */}
                      <div className="absolute -left-[26px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-border group-hover:bg-primary transition-colors" />

                      <div className="flex items-start gap-3">
                        {/* Character avatar */}
                        {entry.characterImage ? (
                          <img
                            src={entry.characterImage}
                            alt={entry.characterName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-border"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                            {entry.characterName.charAt(0)}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{entry.characterName}</span>
                            <Badge className={`text-[10px] ${getChangeTypeColor(entry.changeType)}`}>
                              {getChangeTypeLabel(entry.changeType)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {entry.changeDescription}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {new Date(entry.timestamp).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>

                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
