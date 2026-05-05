import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildSpeakerRoster,
  clamp01,
  clampBubbleBox,
  createBubble,
  loadBubblesForDraft,
  saveBubblesForDraft,
  seedBubblesFromScript,
  speakerIdFromName,
  SPEAKER_PALETTE,
  type PanelBubbleData,
} from '@/lib/comic-bubbles';

describe('comic-bubbles', () => {
  describe('createBubble', () => {
    it('creates a speech bubble with a tail', () => {
      const b = createBubble('speech');
      expect(b.kind).toBe('speech');
      expect(b.tail).toBeDefined();
      expect(b.text.length).toBeGreaterThan(0);
    });

    it('creates a caption with no tail', () => {
      const b = createBubble('caption');
      expect(b.kind).toBe('caption');
      expect(b.tail).toBeUndefined();
    });

    it('respects supplied text and speakerId', () => {
      const b = createBubble('shout', { text: 'STOP!', speakerId: 's_zeus' });
      expect(b.text).toBe('STOP!');
      expect(b.speakerId).toBe('s_zeus');
    });

    it('produces unique ids', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 50; i++) ids.add(createBubble('speech').id);
      expect(ids.size).toBe(50);
    });
  });

  describe('clampBubbleBox', () => {
    it('keeps a normal bubble unchanged', () => {
      const b: PanelBubbleData = {
        id: 'x',
        kind: 'speech',
        text: 'hi',
        x: 0.1,
        y: 0.1,
        w: 0.3,
        h: 0.2,
        tail: { x: 0.5, y: 0.6 },
      };
      expect(clampBubbleBox(b)).toEqual(b);
    });

    it('pulls an out-of-bounds bubble back inside the panel', () => {
      const b: PanelBubbleData = {
        id: 'x',
        kind: 'speech',
        text: 'hi',
        x: 1.5, // way off
        y: -0.4, // negative
        w: 0.3,
        h: 0.2,
      };
      const c = clampBubbleBox(b);
      expect(c.x).toBeGreaterThanOrEqual(0);
      expect(c.x + c.w).toBeLessThanOrEqual(1);
      expect(c.y).toBeGreaterThanOrEqual(0);
      expect(c.y + c.h).toBeLessThanOrEqual(1);
    });

    it('clamps the tail tip into [0,1]', () => {
      const b: PanelBubbleData = {
        id: 'x', kind: 'speech', text: '', x: 0.1, y: 0.1, w: 0.3, h: 0.2,
        tail: { x: 1.5, y: -0.2 },
      };
      const c = clampBubbleBox(b);
      expect(c.tail).toEqual({ x: 1, y: 0 });
    });

    it('enforces a minimum size so bubbles cannot collapse', () => {
      const b: PanelBubbleData = {
        id: 'x', kind: 'speech', text: '', x: 0.1, y: 0.1, w: 0.001, h: 0.001,
      };
      const c = clampBubbleBox(b);
      expect(c.w).toBeGreaterThan(0.05);
      expect(c.h).toBeGreaterThan(0.03);
    });
  });

  describe('clamp01', () => {
    it.each([
      [-1, 0],
      [0, 0],
      [0.5, 0.5],
      [1, 1],
      [42, 1],
    ])('clamp01(%s) = %s', (input, expected) => {
      expect(clamp01(input)).toBe(expected);
    });
  });

  describe('speakerIdFromName / buildSpeakerRoster', () => {
    it('produces stable ids that ignore case and punctuation', () => {
      expect(speakerIdFromName('Captain Celsius!')).toBe('s_captain-celsius-');
      expect(speakerIdFromName('captain celsius')).toBe('s_captain-celsius');
    });

    it('builds a roster, deduplicates, assigns palette colors in order', () => {
      const roster = buildSpeakerRoster(['Zeus', 'Astra', 'Zeus', '']);
      expect(roster).toHaveLength(2);
      expect(roster[0].name).toBe('Zeus');
      expect(roster[0].color).toBe(SPEAKER_PALETTE[0]);
      expect(roster[1].name).toBe('Astra');
      expect(roster[1].color).toBe(SPEAKER_PALETTE[1]);
    });
  });

  describe('seedBubblesFromScript', () => {
    it('produces a caption for narration and a speech bubble for dialogue', () => {
      const seeded = seedBubblesFromScript({
        narration: 'The day began like any other.',
        dialogue: "It's quiet out there.",
        characters: ['Zeus'],
      });
      expect(seeded).toHaveLength(2);
      expect(seeded[0].kind).toBe('caption');
      expect(seeded[1].kind).toBe('speech');
      expect(seeded[1].speakerId).toBe(speakerIdFromName('Zeus'));
    });

    it('skips empty narration and dialogue', () => {
      expect(seedBubblesFromScript({ narration: '', dialogue: '' })).toHaveLength(0);
      expect(seedBubblesFromScript({})).toHaveLength(0);
    });
  });

  describe('localStorage persistence', () => {
    beforeEach(() => {
      window.localStorage.clear();
    });

    it('round-trips bubbles through saveBubblesForDraft / loadBubblesForDraft', () => {
      const draftId = 'draft_abc';
      const bubbles = { 'p1-1': [createBubble('speech'), createBubble('caption')] };
      saveBubblesForDraft(draftId, bubbles);
      const loaded = loadBubblesForDraft(draftId);
      expect(loaded['p1-1']).toHaveLength(2);
      expect(loaded['p1-1'][0].kind).toBe('speech');
      expect(loaded['p1-1'][1].kind).toBe('caption');
    });

    it('returns {} when no entry exists', () => {
      expect(loadBubblesForDraft('nonexistent')).toEqual({});
    });

    it('survives corrupt JSON without throwing', () => {
      window.localStorage.setItem('celsius:bubbles:bad', 'not-json{{');
      expect(loadBubblesForDraft('bad')).toEqual({});
    });
  });
});
