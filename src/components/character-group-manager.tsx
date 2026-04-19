import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users2, 
  Plus, 
  Trash2, 
  Edit2, 
  Save,
  X,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { 
  CharacterGroup, 
  loadGroups, 
  createGroup, 
  updateGroup, 
  deleteGroup,
  addCharacterToGroup,
  removeCharacterFromGroup,
  GROUP_COLORS
} from '@/lib/character-groups';
import { toast } from 'sonner';

interface Character {
  id: string;
  name: string;
  image?: string;
}

interface CharacterGroupManagerProps {
  characters: Character[];
  onGroupsChange?: () => void;
  trigger?: React.ReactNode;
}

export function CharacterGroupManager({ 
  characters, 
  onGroupsChange,
  trigger 
}: CharacterGroupManagerProps) {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<CharacterGroup[]>([]);
  const [editingGroup, setEditingGroup] = useState<CharacterGroup | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupColor, setNewGroupColor] = useState(GROUP_COLORS[0].color);
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setGroups(loadGroups());
    }
  }, [open]);

  const refreshGroups = () => {
    setGroups(loadGroups());
    onGroupsChange?.();
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast.error('Group name is required');
      return;
    }

    createGroup(
      newGroupName.trim(),
      newGroupDescription.trim() || undefined,
      newGroupColor,
      Array.from(selectedCharacterIds)
    );

    setNewGroupName('');
    setNewGroupDescription('');
    setNewGroupColor(GROUP_COLORS[0].color);
    setSelectedCharacterIds(new Set());
    setShowNewForm(false);
    refreshGroups();
    toast.success('Group created');
  };

  const handleUpdateGroup = () => {
    if (!editingGroup) return;

    updateGroup(editingGroup.id, {
      name: editingGroup.name,
      description: editingGroup.description,
      color: editingGroup.color,
      characterIds: editingGroup.characterIds,
    });

    setEditingGroup(null);
    refreshGroups();
    toast.success('Group updated');
  };

  const handleDeleteGroup = (id: string) => {
    deleteGroup(id);
    refreshGroups();
    toast.success('Group deleted');
  };

  const toggleCharacterInNewGroup = (charId: string) => {
    const newSet = new Set(selectedCharacterIds);
    if (newSet.has(charId)) {
      newSet.delete(charId);
    } else {
      newSet.add(charId);
    }
    setSelectedCharacterIds(newSet);
  };

  const toggleCharacterInEditingGroup = (charId: string) => {
    if (!editingGroup) return;

    const newIds = editingGroup.characterIds.includes(charId)
      ? editingGroup.characterIds.filter(id => id !== charId)
      : [...editingGroup.characterIds, charId];

    setEditingGroup({ ...editingGroup, characterIds: newIds });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Users2 className="w-4 h-4" />
            Manage Groups
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users2 className="w-5 h-5 text-primary" />
            Character Groups
          </DialogTitle>
          <DialogDescription>
            Organize characters into parties, factions, or teams
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* New Group Button / Form */}
          {!showNewForm && !editingGroup && (
            <Button onClick={() => setShowNewForm(true)} className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Create New Group
            </Button>
          )}

          {/* New Group Form */}
          {showNewForm && (
            <div className="p-4 border border-border rounded-lg space-y-4 animate-fade-in">
              <h4 className="font-medium">New Group</h4>
              
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., The Fellowship"
                />
              </div>

              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="A brief description of this group..."
                  className="min-h-[60px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {GROUP_COLORS.map(c => (
                    <button
                      key={c.id}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        newGroupColor === c.color ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-background' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.color }}
                      onClick={() => setNewGroupColor(c.color)}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Members ({selectedCharacterIds.size} selected)</Label>
                <ScrollArea className="h-[120px] border rounded-lg p-2">
                  <div className="space-y-2">
                    {characters.map(char => (
                      <label
                        key={char.id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedCharacterIds.has(char.id)}
                          onCheckedChange={() => toggleCharacterInNewGroup(char.id)}
                        />
                        {char.image ? (
                          <img src={char.image} alt={char.name} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                            {char.name.charAt(0)}
                          </div>
                        )}
                        <span className="text-sm">{char.name}</span>
                      </label>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateGroup} className="flex-1 gap-1">
                  <Save className="w-4 h-4" />
                  Create Group
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowNewForm(false);
                  setNewGroupName('');
                  setNewGroupDescription('');
                  setSelectedCharacterIds(new Set());
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Edit Group Form */}
          {editingGroup && (
            <div className="p-4 border border-primary rounded-lg space-y-4 animate-fade-in">
              <h4 className="font-medium">Edit Group</h4>
              
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editingGroup.name}
                  onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingGroup.description || ''}
                  onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                  className="min-h-[60px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {GROUP_COLORS.map(c => (
                    <button
                      key={c.id}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        editingGroup.color === c.color ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-background' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.color }}
                      onClick={() => setEditingGroup({ ...editingGroup, color: c.color })}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Members ({editingGroup.characterIds.length})</Label>
                <ScrollArea className="h-[120px] border rounded-lg p-2">
                  <div className="space-y-2">
                    {characters.map(char => (
                      <label
                        key={char.id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer"
                      >
                        <Checkbox
                          checked={editingGroup.characterIds.includes(char.id)}
                          onCheckedChange={() => toggleCharacterInEditingGroup(char.id)}
                        />
                        {char.image ? (
                          <img src={char.image} alt={char.name} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                            {char.name.charAt(0)}
                          </div>
                        )}
                        <span className="text-sm">{char.name}</span>
                      </label>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUpdateGroup} className="flex-1 gap-1">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingGroup(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Group List */}
          {!showNewForm && !editingGroup && (
            <ScrollArea className="h-[300px]">
              {groups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users2 className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No groups created yet</p>
                  <p className="text-xs mt-1">Create groups to organize your characters</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {groups.map(group => {
                    const groupChars = characters.filter(c => group.characterIds.includes(c.id));
                    
                    return (
                      <div
                        key={group.id}
                        className="p-3 border border-border rounded-lg hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                            style={{ backgroundColor: group.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{group.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {group.characterIds.length} member{group.characterIds.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                            {group.description && (
                              <p className="text-xs text-muted-foreground mt-1">{group.description}</p>
                            )}
                            {groupChars.length > 0 && (
                              <div className="flex -space-x-2 mt-2">
                                {groupChars.slice(0, 5).map(char => (
                                  char.image ? (
                                    <img
                                      key={char.id}
                                      src={char.image}
                                      alt={char.name}
                                      className="w-6 h-6 rounded-full border-2 border-background object-cover"
                                      title={char.name}
                                    />
                                  ) : (
                                    <div
                                      key={char.id}
                                      className="w-6 h-6 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-[10px]"
                                      title={char.name}
                                    >
                                      {char.name.charAt(0)}
                                    </div>
                                  )
                                ))}
                                {groupChars.length > 5 && (
                                  <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px]">
                                    +{groupChars.length - 5}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setEditingGroup(group)}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteGroup(group.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
