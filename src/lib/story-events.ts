// Story Event System - tracks plot points and character involvement

export type EventType = 'battle' | 'discovery' | 'betrayal' | 'alliance' | 'death' | 'resurrection' | 'transformation' | 'revelation' | 'journey' | 'celebration' | 'tragedy' | 'romance' | 'custom';

export type EventSignificance = 'minor' | 'moderate' | 'major' | 'pivotal';

export interface CharacterInvolvement {
  characterId: string;
  characterName: string;
  role: 'protagonist' | 'antagonist' | 'witness' | 'catalyst' | 'victim' | 'savior' | 'other';
  impact: string; // How this event affected them
  emotionalState?: string; // Their mood during/after the event
}

export interface StoryEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  significance: EventSignificance;
  timestamp: number;
  storyDate?: string; // In-universe date/time
  location?: string;
  involvedCharacters: CharacterInvolvement[];
  consequences: string[];
  linkedEventIds: string[]; // Events that are connected
  tags: string[];
}

export interface StoryTimeline {
  id: string;
  name: string;
  description: string;
  events: StoryEvent[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'story_events';
const TIMELINES_KEY = 'story_timelines';

export function loadStoryEvents(): StoryEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveStoryEvents(events: StoryEvent[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function addStoryEvent(event: Omit<StoryEvent, 'id' | 'timestamp'>): StoryEvent {
  const events = loadStoryEvents();
  const newEvent: StoryEvent = {
    ...event,
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now()
  };
  events.push(newEvent);
  saveStoryEvents(events);
  return newEvent;
}

export function updateStoryEvent(eventId: string, updates: Partial<StoryEvent>): void {
  const events = loadStoryEvents();
  const index = events.findIndex(e => e.id === eventId);
  if (index !== -1) {
    events[index] = { ...events[index], ...updates };
    saveStoryEvents(events);
  }
}

export function deleteStoryEvent(eventId: string): void {
  const events = loadStoryEvents();
  const filtered = events.filter(e => e.id !== eventId);
  // Remove references to this event from other events
  filtered.forEach(event => {
    event.linkedEventIds = event.linkedEventIds.filter(id => id !== eventId);
  });
  saveStoryEvents(filtered);
}

export function getEventsForCharacter(characterId: string): StoryEvent[] {
  const events = loadStoryEvents();
  return events.filter(event => 
    event.involvedCharacters.some(c => c.characterId === characterId)
  ).sort((a, b) => a.timestamp - b.timestamp);
}

export function getEventsByType(type: EventType): StoryEvent[] {
  return loadStoryEvents().filter(e => e.type === type);
}

export function getLinkedEvents(eventId: string): StoryEvent[] {
  const events = loadStoryEvents();
  const event = events.find(e => e.id === eventId);
  if (!event) return [];
  return events.filter(e => event.linkedEventIds.includes(e.id));
}

export function loadTimelines(): StoryTimeline[] {
  try {
    const stored = localStorage.getItem(TIMELINES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveTimelines(timelines: StoryTimeline[]): void {
  localStorage.setItem(TIMELINES_KEY, JSON.stringify(timelines));
}

export const EVENT_TYPE_CONFIG: Record<EventType, { label: string; icon: string; color: string }> = {
  battle: { label: 'Battle', icon: '⚔️', color: 'text-red-500' },
  discovery: { label: 'Discovery', icon: '🔍', color: 'text-blue-500' },
  betrayal: { label: 'Betrayal', icon: '🗡️', color: 'text-purple-500' },
  alliance: { label: 'Alliance', icon: '🤝', color: 'text-green-500' },
  death: { label: 'Death', icon: '💀', color: 'text-gray-500' },
  resurrection: { label: 'Resurrection', icon: '✨', color: 'text-yellow-500' },
  transformation: { label: 'Transformation', icon: '🔄', color: 'text-orange-500' },
  revelation: { label: 'Revelation', icon: '💡', color: 'text-cyan-500' },
  journey: { label: 'Journey', icon: '🗺️', color: 'text-emerald-500' },
  celebration: { label: 'Celebration', icon: '🎉', color: 'text-pink-500' },
  tragedy: { label: 'Tragedy', icon: '😢', color: 'text-slate-500' },
  romance: { label: 'Romance', icon: '❤️', color: 'text-rose-500' },
  custom: { label: 'Custom', icon: '📝', color: 'text-indigo-500' }
};

export const SIGNIFICANCE_CONFIG: Record<EventSignificance, { label: string; weight: number }> = {
  minor: { label: 'Minor', weight: 1 },
  moderate: { label: 'Moderate', weight: 2 },
  major: { label: 'Major', weight: 3 },
  pivotal: { label: 'Pivotal', weight: 4 }
};
