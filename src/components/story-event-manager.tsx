import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Plus, Link2, Trash2, Users, Calendar, MapPin } from 'lucide-react';
import { 
  StoryEvent, 
  EventType, 
  EventSignificance,
  CharacterInvolvement,
  loadStoryEvents, 
  addStoryEvent, 
  deleteStoryEvent,
  EVENT_TYPE_CONFIG,
  SIGNIFICANCE_CONFIG
} from '@/lib/story-events';
import { toast } from 'sonner';

interface Character {
  id: string;
  name: string;
}

interface StoryEventManagerProps {
  characters: Character[];
  trigger?: React.ReactNode;
}

export function StoryEventManager({ characters, trigger }: StoryEventManagerProps) {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<StoryEvent[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<StoryEvent>>({
    title: '',
    description: '',
    type: 'custom',
    significance: 'moderate',
    involvedCharacters: [],
    consequences: [],
    linkedEventIds: [],
    tags: []
  });

  useEffect(() => {
    if (open) {
      setEvents(loadStoryEvents());
    }
  }, [open]);

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.description) {
      toast.error('Please fill in title and description');
      return;
    }

    addStoryEvent({
      title: newEvent.title,
      description: newEvent.description,
      type: newEvent.type as EventType,
      significance: newEvent.significance as EventSignificance,
      storyDate: newEvent.storyDate,
      location: newEvent.location,
      involvedCharacters: newEvent.involvedCharacters || [],
      consequences: newEvent.consequences || [],
      linkedEventIds: newEvent.linkedEventIds || [],
      tags: newEvent.tags || []
    });

    setEvents(loadStoryEvents());
    setNewEvent({
      title: '',
      description: '',
      type: 'custom',
      significance: 'moderate',
      involvedCharacters: [],
      consequences: [],
      linkedEventIds: [],
      tags: []
    });
    setIsCreating(false);
    toast.success('Event created');
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteStoryEvent(eventId);
    setEvents(loadStoryEvents());
    toast.success('Event deleted');
  };

  const addCharacterInvolvement = (characterId: string) => {
    const character = characters.find(c => c.id === characterId);
    if (!character) return;

    const involvement: CharacterInvolvement = {
      characterId,
      characterName: character.name,
      role: 'witness',
      impact: ''
    };

    setNewEvent(prev => ({
      ...prev,
      involvedCharacters: [...(prev.involvedCharacters || []), involvement]
    }));
  };

  const updateCharacterRole = (index: number, role: CharacterInvolvement['role']) => {
    setNewEvent(prev => {
      const updated = [...(prev.involvedCharacters || [])];
      updated[index] = { ...updated[index], role };
      return { ...prev, involvedCharacters: updated };
    });
  };

  const removeCharacterInvolvement = (index: number) => {
    setNewEvent(prev => ({
      ...prev,
      involvedCharacters: prev.involvedCharacters?.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Story Events
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Story Event Manager
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="timeline" className="h-full">
          <TabsList className="mb-4">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="create">Create Event</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline">
            <ScrollArea className="h-[55vh]">
              {events.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No story events yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsCreating(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {events
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((event) => {
                      const typeConfig = EVENT_TYPE_CONFIG[event.type];
                      const sigConfig = SIGNIFICANCE_CONFIG[event.significance];
                      
                      return (
                        <Card key={event.id} className="relative">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <span className={typeConfig.color}>{typeConfig.icon}</span>
                                {event.title}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant={event.significance === 'pivotal' ? 'default' : 'secondary'}>
                                  {sigConfig.label}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => handleDeleteEvent(event.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                              {event.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                              {event.storyDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {event.storyDate}
                                </span>
                              )}
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </span>
                              )}
                            </div>

                            {event.involvedCharacters.length > 0 && (
                              <div className="flex items-center gap-2 flex-wrap">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                {event.involvedCharacters.map((char) => (
                                  <Badge key={char.characterId} variant="outline">
                                    {char.characterName} ({char.role})
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {event.linkedEventIds.length > 0 && (
                              <div className="flex items-center gap-2">
                                <Link2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {event.linkedEventIds.length} linked events
                                </span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="create">
            <ScrollArea className="h-[55vh] pr-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Event Title</Label>
                    <Input
                      value={newEvent.title}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="The Battle of Moonhaven"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Event Type</Label>
                    <Select
                      value={newEvent.type}
                      onValueChange={(v) => setNewEvent(prev => ({ ...prev, type: v as EventType }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <span className="flex items-center gap-2">
                              <span>{config.icon}</span>
                              {config.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what happened in this event..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Significance</Label>
                    <Select
                      value={newEvent.significance}
                      onValueChange={(v) => setNewEvent(prev => ({ ...prev, significance: v as EventSignificance }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SIGNIFICANCE_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Story Date</Label>
                    <Input
                      value={newEvent.storyDate || ''}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, storyDate: e.target.value }))}
                      placeholder="Day 42, Third Moon"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={newEvent.location || ''}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Moonhaven Castle"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Involved Characters</Label>
                  <Select onValueChange={addCharacterInvolvement}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add character..." />
                    </SelectTrigger>
                    <SelectContent>
                      {characters
                        .filter(c => !newEvent.involvedCharacters?.some(inv => inv.characterId === c.id))
                        .map((char) => (
                          <SelectItem key={char.id} value={char.id}>
                            {char.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {(newEvent.involvedCharacters || []).length > 0 && (
                    <div className="space-y-2 mt-3">
                      {newEvent.involvedCharacters?.map((involvement, index) => (
                        <div key={involvement.characterId} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                          <span className="flex-1 text-sm">{involvement.characterName}</span>
                          <Select
                            value={involvement.role}
                            onValueChange={(v) => updateCharacterRole(index, v as CharacterInvolvement['role'])}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="protagonist">Protagonist</SelectItem>
                              <SelectItem value="antagonist">Antagonist</SelectItem>
                              <SelectItem value="witness">Witness</SelectItem>
                              <SelectItem value="catalyst">Catalyst</SelectItem>
                              <SelectItem value="victim">Victim</SelectItem>
                              <SelectItem value="savior">Savior</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeCharacterInvolvement(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button onClick={handleAddEvent} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
