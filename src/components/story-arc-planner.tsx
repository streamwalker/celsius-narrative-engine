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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { 
  BookMarked, Plus, Trash2, Edit2, Check, X, 
  ChevronRight, Users, Calendar, MapPin, Sparkles
} from 'lucide-react';
import { 
  StoryArc, Chapter, CharacterArc,
  loadStoryArcs, createStoryArc, updateStoryArc, deleteStoryArc,
  addChapter, updateChapter, deleteChapter,
  getCharacterDevelopment, GENRE_OPTIONS, THEME_OPTIONS
} from '@/lib/story-arcs';
import { loadStoryEvents, StoryEvent } from '@/lib/story-events';
import { toast } from 'sonner';

interface Character {
  id: string;
  name: string;
}

interface StoryArcPlannerProps {
  characters: Character[];
  trigger?: React.ReactNode;
}

export function StoryArcPlanner({ characters, trigger }: StoryArcPlannerProps) {
  const [open, setOpen] = useState(false);
  const [arcs, setArcs] = useState<StoryArc[]>([]);
  const [events, setEvents] = useState<StoryEvent[]>([]);
  const [selectedArc, setSelectedArc] = useState<StoryArc | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);

  const [newArc, setNewArc] = useState({
    title: '',
    description: '',
    genre: '',
    themes: [] as string[],
    setting: '',
    timespan: '',
    mainCharacterIds: [] as string[],
    antagonistIds: [] as string[]
  });

  const [newChapter, setNewChapter] = useState({
    title: '',
    description: '',
    themes: [] as string[]
  });

  useEffect(() => {
    if (open) {
      setArcs(loadStoryArcs());
      setEvents(loadStoryEvents());
    }
  }, [open]);

  const handleCreateArc = () => {
    if (!newArc.title) {
      toast.error('Title is required');
      return;
    }
    const created = createStoryArc({
      ...newArc,
      chapters: []
    });
    setArcs(loadStoryArcs());
    setSelectedArc(created);
    setIsCreating(false);
    setNewArc({
      title: '', description: '', genre: '', themes: [],
      setting: '', timespan: '', mainCharacterIds: [], antagonistIds: []
    });
    toast.success('Story arc created');
  };

  const handleDeleteArc = (arcId: string) => {
    deleteStoryArc(arcId);
    setArcs(loadStoryArcs());
    if (selectedArc?.id === arcId) setSelectedArc(null);
    toast.success('Story arc deleted');
  };

  const handleAddChapter = () => {
    if (!selectedArc || !newChapter.title) {
      toast.error('Chapter title required');
      return;
    }
    addChapter(selectedArc.id, {
      number: selectedArc.chapters.length + 1,
      title: newChapter.title,
      description: newChapter.description,
      themes: newChapter.themes,
      eventIds: [],
      characterArcs: [],
      status: 'planned'
    });
    setArcs(loadStoryArcs());
    setSelectedArc(loadStoryArcs().find(a => a.id === selectedArc.id) || null);
    setNewChapter({ title: '', description: '', themes: [] });
    toast.success('Chapter added');
  };

  const handleUpdateChapterStatus = (chapterId: string, status: Chapter['status']) => {
    if (!selectedArc) return;
    updateChapter(selectedArc.id, chapterId, { status });
    setArcs(loadStoryArcs());
    setSelectedArc(loadStoryArcs().find(a => a.id === selectedArc.id) || null);
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (!selectedArc) return;
    deleteChapter(selectedArc.id, chapterId);
    setArcs(loadStoryArcs());
    setSelectedArc(loadStoryArcs().find(a => a.id === selectedArc.id) || null);
    toast.success('Chapter deleted');
  };

  const handleLinkEvent = (chapterId: string, eventId: string) => {
    if (!selectedArc) return;
    const chapter = selectedArc.chapters.find(c => c.id === chapterId);
    if (!chapter) return;
    
    const newEventIds = chapter.eventIds.includes(eventId)
      ? chapter.eventIds.filter(id => id !== eventId)
      : [...chapter.eventIds, eventId];
    
    updateChapter(selectedArc.id, chapterId, { eventIds: newEventIds });
    setArcs(loadStoryArcs());
    setSelectedArc(loadStoryArcs().find(a => a.id === selectedArc.id) || null);
  };

  const getArcProgress = (arc: StoryArc): number => {
    if (arc.chapters.length === 0) return 0;
    const completed = arc.chapters.filter(c => c.status === 'completed').length;
    return Math.round((completed / arc.chapters.length) * 100);
  };

  const toggleTheme = (theme: string, target: 'arc' | 'chapter') => {
    if (target === 'arc') {
      setNewArc(prev => ({
        ...prev,
        themes: prev.themes.includes(theme)
          ? prev.themes.filter(t => t !== theme)
          : [...prev.themes, theme]
      }));
    } else {
      setNewChapter(prev => ({
        ...prev,
        themes: prev.themes.includes(theme)
          ? prev.themes.filter(t => t !== theme)
          : [...prev.themes, theme]
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <BookMarked className="h-4 w-4" />
            Story Arcs
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-primary" />
            Story Arc Planner
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 h-[70vh]">
          {/* Arc List */}
          <div className="border-r pr-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Story Arcs</h3>
              <Button size="sm" variant="ghost" onClick={() => setIsCreating(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <ScrollArea className="h-[60vh]">
              <div className="space-y-2">
                {arcs.map((arc) => (
                  <Card 
                    key={arc.id}
                    className={`cursor-pointer transition-all ${
                      selectedArc?.id === arc.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => { setSelectedArc(arc); setIsCreating(false); }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{arc.title}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => { e.stopPropagation(); handleDeleteArc(arc.id); }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">{arc.genre || 'No genre'}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {arc.chapters.length} chapters
                        </span>
                      </div>
                      <Progress value={getArcProgress(arc)} className="h-1 mt-2" />
                    </CardContent>
                  </Card>
                ))}
                
                {arcs.length === 0 && !isCreating && (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookMarked className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No story arcs yet</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Main Content */}
          <div className="col-span-2">
            <ScrollArea className="h-[68vh] pr-4">
              {isCreating ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Create New Story Arc</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={newArc.title}
                        onChange={(e) => setNewArc(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="The Hero's Journey"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Genre</Label>
                      <Select
                        value={newArc.genre}
                        onValueChange={(v) => setNewArc(prev => ({ ...prev, genre: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select genre" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENRE_OPTIONS.map((genre) => (
                            <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newArc.description}
                      onChange={(e) => setNewArc(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="A brief overview of your story..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Setting</Label>
                      <Input
                        value={newArc.setting}
                        onChange={(e) => setNewArc(prev => ({ ...prev, setting: e.target.value }))}
                        placeholder="Medieval fantasy kingdom"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Timespan</Label>
                      <Input
                        value={newArc.timespan}
                        onChange={(e) => setNewArc(prev => ({ ...prev, timespan: e.target.value }))}
                        placeholder="One year"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Themes</Label>
                    <div className="flex flex-wrap gap-1">
                      {THEME_OPTIONS.map((theme) => (
                        <Badge
                          key={theme}
                          variant={newArc.themes.includes(theme) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleTheme(theme, 'arc')}
                        >
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Main Characters</Label>
                    <div className="flex flex-wrap gap-1">
                      {characters.map((char) => (
                        <Badge
                          key={char.id}
                          variant={newArc.mainCharacterIds.includes(char.id) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => setNewArc(prev => ({
                            ...prev,
                            mainCharacterIds: prev.mainCharacterIds.includes(char.id)
                              ? prev.mainCharacterIds.filter(id => id !== char.id)
                              : [...prev.mainCharacterIds, char.id]
                          }))}
                        >
                          {char.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCreateArc}>
                      <Check className="h-4 w-4 mr-2" />
                      Create Arc
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreating(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : selectedArc ? (
                <Tabs defaultValue="chapters">
                  <TabsList className="mb-4">
                    <TabsTrigger value="chapters">Chapters</TabsTrigger>
                    <TabsTrigger value="characters">Character Arcs</TabsTrigger>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                  </TabsList>

                  <TabsContent value="chapters" className="space-y-4">
                    {/* Add Chapter Form */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="New chapter title..."
                            value={newChapter.title}
                            onChange={(e) => setNewChapter(prev => ({ ...prev, title: e.target.value }))}
                            className="flex-1"
                          />
                          <Button onClick={handleAddChapter}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add Chapter
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Chapters List */}
                    <Accordion type="single" collapsible>
                      {selectedArc.chapters.map((chapter, idx) => (
                        <AccordionItem key={chapter.id} value={chapter.id}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 flex-1">
                              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                {idx + 1}
                              </span>
                              <span className="font-medium">{chapter.title}</span>
                              <Badge 
                                variant={
                                  chapter.status === 'completed' ? 'default' :
                                  chapter.status === 'in-progress' ? 'secondary' : 'outline'
                                }
                                className="ml-auto mr-4"
                              >
                                {chapter.status}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pl-11 space-y-4">
                              <p className="text-sm text-muted-foreground">
                                {chapter.description || 'No description'}
                              </p>
                              
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant={chapter.status === 'planned' ? 'default' : 'outline'}
                                  onClick={() => handleUpdateChapterStatus(chapter.id, 'planned')}
                                >
                                  Planned
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant={chapter.status === 'in-progress' ? 'default' : 'outline'}
                                  onClick={() => handleUpdateChapterStatus(chapter.id, 'in-progress')}
                                >
                                  In Progress
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant={chapter.status === 'completed' ? 'default' : 'outline'}
                                  onClick={() => handleUpdateChapterStatus(chapter.id, 'completed')}
                                >
                                  Completed
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleDeleteChapter(chapter.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Linked Events */}
                              <div>
                                <Label className="text-sm">Linked Events ({chapter.eventIds.length})</Label>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {events.map((event) => (
                                    <Badge
                                      key={event.id}
                                      variant={chapter.eventIds.includes(event.id) ? 'default' : 'outline'}
                                      className="cursor-pointer text-xs"
                                      onClick={() => handleLinkEvent(chapter.id, event.id)}
                                    >
                                      {event.title}
                                    </Badge>
                                  ))}
                                  {events.length === 0 && (
                                    <span className="text-xs text-muted-foreground">No events created yet</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>

                    {selectedArc.chapters.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No chapters yet. Add your first chapter above.</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="characters" className="space-y-4">
                    <h3 className="font-medium">Character Development Tracking</h3>
                    
                    {characters
                      .filter(c => selectedArc.mainCharacterIds.includes(c.id))
                      .map((char) => {
                        const dev = getCharacterDevelopment(char.id, selectedArc.id);
                        return (
                          <Card key={char.id}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {char.name}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Event Appearances:</span>
                                  <p className="font-medium">{dev.appearances}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Chapters:</span>
                                  <p className="font-medium">
                                    {dev.chaptersIn.length > 0 ? dev.chaptersIn.join(', ') : 'None'}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Roles:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {dev.roleProgression.map((role) => (
                                      <Badge key={role} variant="secondary" className="text-xs">
                                        {role}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    
                    {selectedArc.mainCharacterIds.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No main characters assigned to this arc.</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="overview">
                    <Card>
                      <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground">Genre</Label>
                            <p className="font-medium">{selectedArc.genre || 'Not set'}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Progress</Label>
                            <div className="flex items-center gap-2">
                              <Progress value={getArcProgress(selectedArc)} className="flex-1" />
                              <span className="text-sm font-medium">{getArcProgress(selectedArc)}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-muted-foreground">Description</Label>
                          <p>{selectedArc.description || 'No description'}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> Setting
                            </Label>
                            <p>{selectedArc.setting || 'Not set'}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> Timespan
                            </Label>
                            <p>{selectedArc.timespan || 'Not set'}</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-muted-foreground">Themes</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedArc.themes.map((theme) => (
                              <Badge key={theme} variant="secondary">{theme}</Badge>
                            ))}
                            {selectedArc.themes.length === 0 && (
                              <span className="text-muted-foreground text-sm">No themes</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <BookMarked className="h-12 w-12 mb-4 opacity-50" />
                  <p>Select a story arc or create a new one</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
