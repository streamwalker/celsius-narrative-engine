import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Users, Trash2, Edit2, Download, Upload, 
  Plus, Save, X, ImagePlus, Search, Wand2, ChevronDown, ChevronUp, Settings2,
  Grid3X3, List, Shuffle, Keyboard, GripVertical, Scale, Network, History,
  CheckSquare, Square, Users2, Clock, BookOpen, Heart
} from 'lucide-react';
import { toast } from 'sonner';
import { PoseGallery, CharacterPose, CharacterAnalysis } from '@/components/pose-gallery';
import { GenerateReferencesDialog } from '@/components/generate-references-dialog';
import { CharacterProfileEditor, CharacterProfileData } from '@/components/character-profile-editor';
import { ProfileWizard } from '@/components/profile-wizard';
import { ProfileStatusBadge } from '@/components/profile-status-badge';
import { StyleTransferDialog } from '@/components/style-transfer-dialog';
import { CharacterGallery } from '@/components/character-gallery';
import { CharacterDetailModal } from '@/components/character-detail-modal';
import { KeyboardShortcutsModal } from '@/components/keyboard-shortcuts-modal';
import { CharacterComparisonDialog } from '@/components/character-comparison-dialog';
import { CharacterImportDialog } from '@/components/character-import-dialog';
import { CharacterHistoryDialog } from '@/components/character-history-dialog';
import { CharacterRelationshipEditor } from '@/components/character-relationship-editor';
import { RelationshipGraph } from '@/components/relationship-graph';
import { BatchActionsToolbar } from '@/components/batch-actions-toolbar';
import { CharacterTimeline } from '@/components/character-timeline';
import { CharacterGroupManager } from '@/components/character-group-manager';
import { StoryEventManager } from '@/components/story-event-manager';
import { StoryArcPlanner } from '@/components/story-arc-planner';
import { CharacterMoodSelector } from '@/components/character-mood-selector';
import { useKeyboardShortcuts, KEYBOARD_SHORTCUTS } from '@/hooks/use-keyboard-shortcuts';
import { KeyFeatures } from '@/lib/character-consistency-model';
import { ImportedCharacter } from '@/lib/character-importers';
import { addCharacterVersion } from '@/lib/character-history';
import { getCharacterMood, getEmotionById } from '@/lib/character-moods';

export interface CharacterPreset {
  id: string;
  name: string;
  description: string;
  referenceImages: string[]; // legacy support
  poses?: CharacterPose[]; // new pose library
  analysis?: CharacterAnalysis; // AI analysis at character level
  profile?: CharacterProfileData; // detailed profile for consistency
}

const STORAGE_KEY = 'comic-character-presets';
const ORDER_STORAGE_KEY = 'comic-character-order';

export default function Page() {
  const navigate = useNavigate();
  const [presets, setPresets] = useState<CharacterPreset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [showNewForm, setShowNewForm] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', description: '', poses: [] as CharacterPose[] });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'gallery' | 'relationships' | 'timeline'>('list');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterPreset | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // New state for keyboard shortcuts modal
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  
  // New state for comparison dialog
  const [comparisonOpen, setComparisonOpen] = useState(false);
  
  // Drag and drop state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [characterOrder, setCharacterOrder] = useState<string[]>([]);

  // Batch selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  // History dialog state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyCharacter, setHistoryCharacter] = useState<CharacterPreset | null>(null);

  // Relationship editor state
  const [relationshipOpen, setRelationshipOpen] = useState(false);
  const [relationshipSource, setRelationshipSource] = useState<CharacterPreset | null>(null);
  const [relationshipTarget, setRelationshipTarget] = useState<CharacterPreset | null>(null);
  const [relationshipsRefreshKey, setRelationshipsRefreshKey] = useState(0);

  useEffect(() => {
    loadPresets();
    loadOrder();
  }, []);

  const loadOrder = () => {
    const saved = localStorage.getItem(ORDER_STORAGE_KEY);
    if (saved) {
      try {
        setCharacterOrder(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load order:', e);
      }
    }
  };

  const saveOrder = (order: string[]) => {
    setCharacterOrder(order);
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
  };

  const loadPresets = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const loaded = JSON.parse(saved);
        // Migrate legacy referenceImages to poses format
        const migrated = loaded.map((preset: CharacterPreset) => {
          if (preset.referenceImages?.length > 0 && !preset.poses?.length) {
            return {
              ...preset,
              poses: preset.referenceImages.map((img, i) => ({
                id: `pose-${Date.now()}-${i}`,
                image: img,
                poseType: 'custom' as const,
                tags: [],
              })),
            };
          }
          return preset;
        });
        setPresets(migrated);
      } catch (e) {
        console.error('Failed to load presets:', e);
      }
    }
  };

  const savePresets = (newPresets: CharacterPreset[]) => {
    setPresets(newPresets);
    // Also update referenceImages for backward compatibility
    const toSave = newPresets.map(p => ({
      ...p,
      referenceImages: p.poses?.map(pose => pose.image) || p.referenceImages || [],
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };

  const handleDelete = (id: string) => {
    const updated = presets.filter(p => p.id !== id);
    savePresets(updated);
    toast.success('Character deleted');
  };

  const handleStartEdit = (preset: CharacterPreset) => {
    setEditingId(preset.id);
    setEditForm({ name: preset.name, description: preset.description });
  };

  const handleSaveEdit = (id: string) => {
    const updated = presets.map(p => 
      p.id === id ? { ...p, name: editForm.name, description: editForm.description } : p
    );
    savePresets(updated);
    setEditingId(null);
    toast.success('Character updated');
  };

  const handleAddNew = () => {
    if (!newForm.name.trim() || !newForm.description.trim()) {
      toast.error('Name and description are required');
      return;
    }
    const newPreset: CharacterPreset = {
      id: Date.now().toString(),
      name: newForm.name.trim(),
      description: newForm.description.trim(),
      referenceImages: newForm.poses.map(p => p.image),
      poses: newForm.poses,
    };
    savePresets([...presets, newPreset]);
    addCharacterVersion(newPreset.id, 'created', 'Character created', newPreset);
    setNewForm({ name: '', description: '', poses: [] });
    setShowNewForm(false);
    toast.success('Character added');
  };

  // Handle imported characters
  const handleImportedCharacters = (imported: ImportedCharacter[]) => {
    const newPresets = imported.map(char => ({
      id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: char.name,
      description: char.backstory || `A ${char.race} ${char.class}`,
      referenceImages: [],
      poses: [],
    }));
    
    savePresets([...presets, ...newPresets]);
    newPresets.forEach(p => {
      addCharacterVersion(p.id, 'created', 'Imported character', p);
    });
  };

  // Batch operations
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    if (newSelected.size === 0) {
      setSelectionMode(false);
    }
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredPresets.map(p => p.id)));
    setSelectionMode(true);
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
    setSelectionMode(false);
  };

  const handleBatchDelete = () => {
    const remaining = presets.filter(p => !selectedIds.has(p.id));
    savePresets(remaining);
    toast.success(`Deleted ${selectedIds.size} character(s)`);
    deselectAll();
  };

  const handleBatchExport = () => {
    const toExport = presets.filter(p => selectedIds.has(p.id));
    const data = JSON.stringify(toExport, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `characters-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${toExport.length} character(s)`);
  };

  // Restore from history
  const handleRestore = (snapshot: unknown) => {
    if (!historyCharacter) return;
    const restored = snapshot as CharacterPreset;
    const updated = presets.map(p => p.id === historyCharacter.id ? { ...restored, id: historyCharacter.id } : p);
    savePresets(updated);
    addCharacterVersion(historyCharacter.id, 'edited', 'Restored from history', restored);
    toast.success('Character restored from history');
  };

  const handlePosesChange = (presetId: string, poses: CharacterPose[]) => {
    const updated = presets.map(p => 
      p.id === presetId 
        ? { ...p, poses, referenceImages: poses.map(pose => pose.image) } 
        : p
    );
    savePresets(updated);
  };

  const handleExport = () => {
    const data = JSON.stringify(presets, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'character-presets.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Characters exported');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          const merged = [...presets];
          imported.forEach((item: CharacterPreset) => {
            if (item.id && item.name && item.description) {
              if (!merged.find(p => p.id === item.id)) {
                merged.push(item);
              }
            }
          });
          savePresets(merged);
          toast.success(`Imported ${imported.length} character(s)`);
        }
      } catch {
        toast.error('Invalid file format');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleGeneratedPoses = (characterId: string, poses: CharacterPose[]) => {
    const preset = presets.find(p => p.id === characterId);
    if (preset) {
      handlePosesChange(characterId, [...(preset.poses || []), ...poses]);
    }
  };

  const handleStyleTransferred = (targetId: string, newImages: string[]) => {
    const updated = presets.map(p => {
      if (p.id === targetId) {
        const newPoses: CharacterPose[] = newImages.map((img, i) => ({
          id: `style-${Date.now()}-${i}`,
          image: img,
          poseType: 'custom' as const,
          tags: ['style-transferred'],
        }));
        return {
          ...p,
          poses: [...(p.poses || []), ...newPoses],
          referenceImages: [...(p.referenceImages || []), ...newImages],
        };
      }
      return p;
    });
    savePresets(updated);
    toast.success('Style transferred successfully!');
  };

  const charactersForGeneration = presets
    .filter(p => !p.poses?.length || p.poses.length === 0)
    .map(p => ({ id: p.id, name: p.name, description: p.description, selected: true }));

  // Sort presets by custom order
  const sortedPresets = [...presets].sort((a, b) => {
    const aIndex = characterOrder.indexOf(a.id);
    const bIndex = characterOrder.indexOf(b.id);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const filteredPresets = sortedPresets.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== draggedId) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const currentOrder = characterOrder.length > 0 
      ? characterOrder 
      : sortedPresets.map(p => p.id);
    
    const draggedIndex = currentOrder.indexOf(draggedId);
    const targetIndex = currentOrder.indexOf(targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      // If not in order yet, build new order
      const newOrder = sortedPresets.map(p => p.id);
      const dIdx = newOrder.indexOf(draggedId);
      const tIdx = newOrder.indexOf(targetId);
      newOrder.splice(dIdx, 1);
      newOrder.splice(tIdx, 0, draggedId);
      saveOrder(newOrder);
    } else {
      const newOrder = [...currentOrder];
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedId);
      saveOrder(newOrder);
    }

    setDraggedId(null);
    setDragOverId(null);
    toast.success('Character order updated');
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onToggleView: () => setViewMode(v => v === 'list' ? 'gallery' : 'list'),
    onNewCharacter: () => setShowNewForm(true),
    onOpenDetail: () => {
      if (selectedCharacter) {
        setDetailModalOpen(true);
      } else if (filteredPresets.length > 0) {
        setSelectedCharacter(filteredPresets[0]);
        setSelectedIndex(0);
        setDetailModalOpen(true);
      }
    },
    onSearch: () => searchInputRef.current?.focus(),
    onEscape: () => {
      if (helpModalOpen) {
        setHelpModalOpen(false);
      } else if (comparisonOpen) {
        setComparisonOpen(false);
      } else if (detailModalOpen) {
        setDetailModalOpen(false);
      } else if (showNewForm) {
        setShowNewForm(false);
      } else if (editingId) {
        setEditingId(null);
      }
    },
    onNavigateNext: () => {
      if (filteredPresets.length > 0) {
        const nextIndex = (selectedIndex + 1) % filteredPresets.length;
        setSelectedIndex(nextIndex);
        setSelectedCharacter(filteredPresets[nextIndex]);
      }
    },
    onNavigatePrev: () => {
      if (filteredPresets.length > 0) {
        const prevIndex = selectedIndex <= 0 ? filteredPresets.length - 1 : selectedIndex - 1;
        setSelectedIndex(prevIndex);
        setSelectedCharacter(filteredPresets[prevIndex]);
      }
    },
    onEdit: () => {
      if (selectedCharacter) {
        handleStartEdit(selectedCharacter);
      }
    },
    onDelete: () => {
      if (selectedCharacter) {
        handleDelete(selectedCharacter.id);
        setSelectedCharacter(null);
      }
    },
    onShowHelp: () => setHelpModalOpen(true),
    onCompare: () => {
      if (presets.length >= 2) {
        setComparisonOpen(true);
      } else {
        toast.error('Need at least 2 characters to compare');
      }
    },
    isEnabled: !showNewForm && !editingId,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="font-comic text-xl text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Character Library
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Groups Manager */}
            <CharacterGroupManager
              characters={presets.map(p => ({
                id: p.id,
                name: p.name,
                image: p.poses?.[0]?.image,
              }))}
              onGroupsChange={() => setRelationshipsRefreshKey(k => k + 1)}
              trigger={
                <Button variant="outline" size="sm" className="gap-1">
                  <Users2 className="w-4 h-4" />
                  Groups
                </Button>
              }
            />
            {/* Compare Button */}
            {presets.length >= 2 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setComparisonOpen(true)}
                className="gap-1"
              >
                <Scale className="w-4 h-4" />
                Compare
              </Button>
            )}
            {/* Style Transfer Button */}
            {presets.filter(p => p.poses && p.poses.length > 0).length >= 2 && (
              <StyleTransferDialog
                characters={presets.filter(p => p.poses && p.poses.length > 0)}
                onStyleTransferred={handleStyleTransferred}
                trigger={
                  <Button variant="outline" size="sm" className="gap-1">
                    <Shuffle className="w-4 h-4" />
                    Transfer Style
                  </Button>
                }
              />
            )}
            {charactersForGeneration.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowGenerateDialog(true)}
                className="gap-1"
              >
                <Wand2 className="w-4 h-4" />
                Generate AI References
              </Button>
            )}
            {/* Story Events */}
            <StoryEventManager
              characters={presets.map(p => ({ id: p.id, name: p.name }))}
              trigger={
                <Button variant="outline" size="sm" className="gap-1">
                  <BookOpen className="w-4 h-4" />
                  Story Events
                </Button>
              }
            />
            {/* Story Arc Planner */}
            <StoryArcPlanner
              characters={presets.map(p => ({ id: p.id, name: p.name }))}
              trigger={
                <Button variant="outline" size="sm" className="gap-1">
                  <BookOpen className="w-4 h-4" />
                  Story Arcs
                </Button>
              }
            />
            {/* D&D Beyond Import */}
            <CharacterImportDialog
              onImport={handleImportedCharacters}
              trigger={
                <Button variant="outline" size="sm" className="gap-1">
                  <Upload className="w-4 h-4" />
                  Import D&D
                </Button>
              }
            />
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-1" />
                  Import JSON
                </span>
              </Button>
            </label>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={presets.length === 0}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </nav>

      <main className="container py-8 max-w-4xl">
        {/* View Toggle and Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'gallery' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('gallery')}
              title="Gallery view"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'relationships' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('relationships')}
              title="Relationships view"
            >
              <Network className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'timeline' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('timeline')}
              title="Timeline view"
            >
              <Clock className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search characters... (press /)"
              className="pl-9"
            />
          </div>
          {/* Selection mode toggle */}
          {presets.length > 0 && viewMode !== 'relationships' && (
            <Button 
              variant={selectionMode ? 'secondary' : 'outline'} 
              size="sm"
              onClick={() => {
                if (selectionMode) {
                  deselectAll();
                } else {
                  setSelectionMode(true);
                }
              }}
              className="gap-1"
            >
              {selectionMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              Select
            </Button>
          )}
          <Button onClick={() => setShowNewForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Character
          </Button>
        </div>

        {/* New Character Form */}
        {showNewForm && (
          <div className="mb-6 p-4 bg-card rounded-xl border border-border animate-fade-in">
            <h3 className="font-medium text-foreground mb-4">New Character</h3>
            <div className="space-y-4">
              <Input
                value={newForm.name}
                onChange={(e) => setNewForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Character name..."
              />
              <textarea
                value={newForm.description}
                onChange={(e) => setNewForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Physical description, clothing, distinctive features..."
                className="w-full h-24 p-3 bg-secondary/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none"
              />
              
              {/* Pose Gallery for new character */}
              <PoseGallery
                poses={newForm.poses}
                onPosesChange={(poses) => setNewForm(prev => ({ ...prev, poses }))}
                characterName={newForm.name}
              />
              
              <div className="flex gap-2">
                <Button onClick={handleAddNew}>
                  <Save className="w-4 h-4 mr-1" />
                  Save Character
                </Button>
                <Button variant="ghost" onClick={() => {
                  setShowNewForm(false);
                  setNewForm({ name: '', description: '', poses: [] });
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Character List */}
        {filteredPresets.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? 'No characters found' : 'No characters yet'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery 
                ? 'Try a different search term'
                : 'Create character presets to maintain visual consistency across your comics'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowNewForm(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add Your First Character
              </Button>
            )}
          </div>
        ) : viewMode === 'timeline' ? (
          <div className="h-[600px]">
            <CharacterTimeline
              characters={presets.map(p => ({
                id: p.id,
                name: p.name,
                image: p.poses?.[0]?.image,
              }))}
              onCharacterClick={(id) => {
                const preset = presets.find(p => p.id === id);
                if (preset) {
                  setSelectedCharacter(preset);
                  setDetailModalOpen(true);
                }
              }}
            />
          </div>
        ) : viewMode === 'relationships' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Character Relationships</h3>
              <p className="text-xs text-muted-foreground">Click on nodes to view, drag to rearrange, click edges to edit</p>
            </div>
            <RelationshipGraph
              characters={filteredPresets.map(p => ({
                id: p.id,
                name: p.name,
                image: p.poses?.[0]?.image,
              }))}
              onNodeClick={(id) => {
                const preset = presets.find(p => p.id === id);
                if (preset) {
                  setSelectedCharacter(preset);
                  setDetailModalOpen(true);
                }
              }}
              onRefresh={() => setRelationshipsRefreshKey(k => k + 1)}
              className="h-[500px]"
            />
          </div>
        ) : viewMode === 'gallery' ? (
          <CharacterGallery 
            characters={filteredPresets}
            selectedId={selectedCharacter?.id}
            onSelectCharacter={(char) => {
              if (selectionMode) {
                toggleSelection(char.id);
              } else {
                const preset = filteredPresets.find(p => p.id === char.id);
                if (preset) {
                  setSelectedCharacter(preset);
                  setSelectedIndex(filteredPresets.findIndex(p => p.id === char.id));
                  setDetailModalOpen(true);
                }
              }
            }}
          />
        ) : (
          <div className="grid gap-4">
            {filteredPresets.map((preset) => {
              const isExpanded = expandedId === preset.id;
              const poseCount = preset.poses?.length || 0;
              
              return (
                <div
                  key={preset.id}
                  draggable={!editingId}
                  onDragStart={(e) => handleDragStart(e, preset.id)}
                  onDragOver={(e) => handleDragOver(e, preset.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, preset.id)}
                  onDragEnd={handleDragEnd}
                  className={`bg-card rounded-xl border transition-all overflow-hidden ${
                    draggedId === preset.id 
                      ? 'opacity-50 scale-[0.98] border-primary' 
                      : dragOverId === preset.id 
                        ? 'border-primary ring-2 ring-primary/30' 
                        : 'border-border hover:border-primary/50'
                  }`}
                >
                  {editingId === preset.id ? (
                    <div className="p-4 space-y-3">
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Character name..."
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full h-24 p-3 bg-secondary/50 border border-border rounded-lg text-foreground resize-none"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveEdit(preset.id)}>
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 flex gap-4">
                        {/* Selection checkbox */}
                        {selectionMode && (
                          <div 
                            className="flex-shrink-0 flex items-center cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelection(preset.id);
                            }}
                          >
                            {selectedIds.has(preset.id) ? (
                              <CheckSquare className="w-5 h-5 text-primary" />
                            ) : (
                              <Square className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        )}
                        {/* Drag Handle */}
                        {!selectionMode && (
                          <div 
                            className="flex-shrink-0 flex items-center cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground"
                            title="Drag to reorder"
                          >
                            <GripVertical className="w-5 h-5" />
                          </div>
                        )}
                        {/* Preview images */}
                        {poseCount > 0 && (
                          <div className="flex-shrink-0">
                            <div className="flex gap-1">
                              {preset.poses!.slice(0, 3).map((pose) => (
                                <img
                                  key={pose.id}
                                  src={pose.image}
                                  alt={pose.poseType}
                                  className="w-16 h-16 object-cover rounded-lg border border-border"
                                />
                              ))}
                              {poseCount > 3 && (
                                <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center text-xs text-muted-foreground">
                                  +{poseCount - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground">{preset.name}</h3>
                            <ProfileStatusBadge profile={preset.profile} />
                            {poseCount > 0 && (
                              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                {poseCount} pose{poseCount !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {preset.description}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-start gap-1">
                          {/* AI Profile Wizard - shown if has poses but no profile */}
                          {poseCount > 0 && !preset.profile && (
                            <ProfileWizard
                              character={preset}
                              referenceImages={preset.poses?.map(p => p.image) || []}
                              onComplete={(profile) => {
                                const updated = presets.map(p => 
                                  p.id === preset.id ? { ...p, profile } : p
                                );
                                savePresets(updated);
                              }}
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-primary"
                                  title="AI Profile Wizard"
                                >
                                  <Wand2 className="w-4 h-4" />
                                </Button>
                              }
                            />
                          )}
                          <CharacterProfileEditor
                            character={preset}
                            existingProfile={preset.profile}
                            onSave={(profile) => {
                              const updated = presets.map(p => 
                                p.id === preset.id ? { ...p, profile } : p
                              );
                              savePresets(updated);
                              toast.success('Character profile saved');
                            }}
                            trigger={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Edit profile"
                              >
                                <Settings2 className="w-4 h-4" />
                              </Button>
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setExpandedId(isExpanded ? null : preset.id)}
                            title="Manage poses"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleStartEdit(preset)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          {/* History button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setHistoryCharacter(preset);
                              setHistoryOpen(true);
                            }}
                            title="View history"
                          >
                            <History className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(preset.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Expanded pose gallery */}
                      {isExpanded && (
                        <div className="border-t border-border p-4 bg-secondary/20">
                          <PoseGallery
                            poses={preset.poses || []}
                            onPosesChange={(poses) => handlePosesChange(preset.id, poses)}
                            characterName={preset.name}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Stats */}
        {presets.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            {presets.length} character{presets.length !== 1 ? 's' : ''} in library
            {presets.reduce((acc, p) => acc + (p.poses?.length || 0), 0) > 0 && (
              <> • {presets.reduce((acc, p) => acc + (p.poses?.length || 0), 0)} reference poses</>
            )}
          </div>
        )}
      </main>

      {/* Generate References Dialog */}
      <GenerateReferencesDialog
        isOpen={showGenerateDialog}
        onClose={() => setShowGenerateDialog(false)}
        onGenerated={handleGeneratedPoses}
        characters={charactersForGeneration}
      />

      {/* Character Detail Modal */}
      <CharacterDetailModal
        character={selectedCharacter}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
        }}
        onEdit={(id) => {
          const preset = presets.find(p => p.id === id);
          if (preset) {
            handleStartEdit(preset);
            setDetailModalOpen(false);
          }
        }}
        onDelete={(id) => {
          handleDelete(id);
          setDetailModalOpen(false);
          setSelectedCharacter(null);
        }}
        onGeneratePose={(id) => {
          setExpandedId(id);
          setDetailModalOpen(false);
        }}
        onExport={(id) => {
          const preset = presets.find(p => p.id === id);
          if (preset) {
            const data = JSON.stringify(preset, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${preset.name.replace(/\s+/g, '-').toLowerCase()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success(`${preset.name} exported`);
          }
        }}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />

      {/* Character Comparison Dialog */}
      <CharacterComparisonDialog
        isOpen={comparisonOpen}
        onClose={() => setComparisonOpen(false)}
        characters={presets}
      />

      {/* Character History Dialog */}
      {historyCharacter && (
        <CharacterHistoryDialog
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          characterId={historyCharacter.id}
          characterName={historyCharacter.name}
          onRestore={handleRestore}
        />
      )}

      {/* Batch Actions Toolbar */}
      <BatchActionsToolbar
        selectedCount={selectedIds.size}
        totalCount={filteredPresets.length}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        onDelete={handleBatchDelete}
        onExport={handleBatchExport}
      />

      {/* Keyboard Shortcuts Hint */}
      <div className="fixed bottom-4 right-4 hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm border border-border rounded-lg px-3 py-2">
        <Keyboard className="w-3 h-3" />
        <span>
          Press <kbd className="px-1 bg-muted rounded">?</kbd> for shortcuts
        </span>
      </div>
    </div>
  );
}
