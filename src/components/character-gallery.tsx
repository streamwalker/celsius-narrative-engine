import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Grid3X3, List, Search, Filter, User } from 'lucide-react';
import { RACES } from '@/lib/races';
import { CLASSES } from '@/lib/classes';

interface CharacterPose {
  id: string;
  image: string;
  poseType: string;
  tags: string[];
}

interface CharacterPreset {
  id: string;
  name: string;
  description: string;
  referenceImages: string[];
  poses?: CharacterPose[];
  race?: string;
  class?: string;
}

interface CharacterGalleryProps {
  characters: CharacterPreset[];
  selectedId?: string;
  onSelectCharacter?: (character: CharacterPreset) => void;
}

export function CharacterGallery({ characters, selectedId, onSelectCharacter }: CharacterGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [raceFilter, setRaceFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredCharacters = useMemo(() => {
    return characters.filter(char => {
      const matchesSearch = char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           char.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRace = raceFilter === 'all' || char.race === raceFilter;
      const matchesClass = classFilter === 'all' || char.class === classFilter;
      
      return matchesSearch && matchesRace && matchesClass;
    });
  }, [characters, searchQuery, raceFilter, classFilter]);

  const getCharacterImage = (char: CharacterPreset) => {
    if (char.poses && char.poses.length > 0) {
      return char.poses[0].image;
    }
    if (char.referenceImages && char.referenceImages.length > 0) {
      return char.referenceImages[0];
    }
    return null;
  };

  const getRaceName = (raceId?: string) => {
    if (!raceId) return null;
    const race = RACES.find(r => r.id === raceId);
    return race?.name || raceId;
  };

  const getClassName = (classId?: string) => {
    if (!classId) return null;
    const cls = CLASSES.find(c => c.id === classId);
    return cls?.name || classId;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search characters..."
            className="pl-9"
          />
        </div>
        
        <Select value={raceFilter} onValueChange={setRaceFilter}>
          <SelectTrigger className="w-[140px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Race" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Races</SelectItem>
            {RACES.map(race => (
              <SelectItem key={race.id} value={race.id}>{race.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-[140px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {CLASSES.map(cls => (
              <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex items-center gap-1 border border-border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredCharacters.length} of {characters.length} characters
      </div>

      {/* Gallery */}
      {filteredCharacters.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No characters found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or search query
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredCharacters.map(char => {
            const image = getCharacterImage(char);
            return (
              <div
                key={char.id}
                className={`group relative bg-card rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                  selectedId === char.id 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onSelectCharacter?.(char)}
              >
                <div className="aspect-square bg-secondary">
                  {image ? (
                    <img
                      src={image}
                      alt={char.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-foreground text-sm truncate">{char.name}</h4>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {char.race && (
                      <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                        {getRaceName(char.race)}
                      </span>
                    )}
                    {char.class && (
                      <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                        {getClassName(char.class)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCharacters.map(char => {
            const image = getCharacterImage(char);
            return (
              <div
                key={char.id}
                className={`flex items-center gap-4 p-3 bg-card rounded-xl border cursor-pointer transition-all ${
                  selectedId === char.id 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onSelectCharacter?.(char)}
              >
                <div className="w-16 h-16 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                  {image ? (
                    <img src={image} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground">{char.name}</h4>
                  <p className="text-sm text-muted-foreground truncate">{char.description}</p>
                  <div className="flex gap-2 mt-1">
                    {char.race && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                        {getRaceName(char.race)}
                      </span>
                    )}
                    {char.class && (
                      <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">
                        {getClassName(char.class)}
                      </span>
                    )}
                    {char.poses && char.poses.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {char.poses.length} pose{char.poses.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}