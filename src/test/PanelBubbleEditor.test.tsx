/**
 * Visual / DOM-snapshot tests for PanelBubbleEditor that lock in the
 * `transparentBackground` contract: when enabled, the editor MUST NOT paint
 * an opaque placeholder layer that would obscure the artwork rendered behind
 * it on the LetterPage. We validate this across a few representative panel
 * states (empty, with a bubble, with a selected bubble, and with an explicit
 * imageUrl) so a future change to the placeholder branch can't silently
 * reintroduce the regression.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { PanelBubbleEditor } from '@/components/PanelBubbleEditor';
import type { PanelBubbleData, Speaker } from '@/lib/comic-bubbles';

afterEach(cleanup);

const speakers: Speaker[] = [
  { id: 's1', name: 'Hero', color: '#ff0000' },
];

const bubble = (over: Partial<PanelBubbleData> = {}): PanelBubbleData => ({
  id: 'b1',
  kind: 'speech',
  text: 'Hello',
  x: 0.1,
  y: 0.1,
  w: 0.4,
  h: 0.2,
  tail: { x: 0.5, y: 0.6 },
  speakerId: 's1',
  ...over,
});

/** The opaque placeholder is the `bg-gradient-to-br` layer rendered when no
 *  imageUrl exists and transparentBackground is falsy. */
function queryPlaceholderLayer(container: HTMLElement) {
  return container.querySelector(
    '.absolute.inset-0.bg-gradient-to-br.from-secondary.to-muted',
  );
}

function queryArtworkImg(container: HTMLElement) {
  return container.querySelector('img');
}

describe('PanelBubbleEditor transparentBackground', () => {
  it('omits the placeholder layer when no image and transparentBackground=true (empty panel)', () => {
    const { container } = render(
      <PanelBubbleEditor
        bubbles={[]}
        speakers={speakers}
        onChange={() => {}}
        transparentBackground
      />,
    );
    expect(queryPlaceholderLayer(container)).toBeNull();
    expect(queryArtworkImg(container)).toBeNull();
    // Container itself should not have a solid background class either.
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).not.toMatch(/bg-(secondary|muted|background)/);
  });

  it('omits the placeholder layer when transparentBackground=true and bubbles are present', () => {
    const { container } = render(
      <PanelBubbleEditor
        bubbles={[bubble()]}
        speakers={speakers}
        onChange={() => {}}
        transparentBackground
      />,
    );
    expect(queryPlaceholderLayer(container)).toBeNull();
    // Bubbles still render (text + svg shape layer).
    expect(container.textContent).toContain('Hello');
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('omits placeholder even with a custom placeholder node when transparentBackground=true', () => {
    const { container, queryByText } = render(
      <PanelBubbleEditor
        bubbles={[]}
        speakers={speakers}
        onChange={() => {}}
        transparentBackground
        placeholder={<span>SHOULD NOT RENDER</span>}
      />,
    );
    expect(queryPlaceholderLayer(container)).toBeNull();
    expect(queryByText('SHOULD NOT RENDER')).toBeNull();
  });

  it('renders the opaque placeholder when transparentBackground is NOT set (regression guard)', () => {
    const { container, getByText } = render(
      <PanelBubbleEditor
        bubbles={[]}
        speakers={speakers}
        onChange={() => {}}
      />,
    );
    expect(queryPlaceholderLayer(container)).not.toBeNull();
    expect(getByText(/No image yet/i)).toBeInTheDocument();
  });

  it('renders the artwork (not the placeholder) when imageUrl is provided, regardless of flag', () => {
    const url = 'https://example.test/page.png';
    const { container } = render(
      <PanelBubbleEditor
        bubbles={[bubble()]}
        speakers={speakers}
        onChange={() => {}}
        imageUrl={url}
        transparentBackground
      />,
    );
    const img = queryArtworkImg(container);
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe(url);
    // Exactly one background layer (the image wrapper), no extra placeholder.
    const layers = container.querySelectorAll(
      '.absolute.inset-0.bg-gradient-to-br.from-secondary.to-muted',
    );
    expect(layers.length).toBe(1);
    expect(layers[0].contains(img!)).toBe(true);
  });

  it('DOM snapshot: transparent + bubbles produces no opaque overlay markup', () => {
    const { container } = render(
      <PanelBubbleEditor
        bubbles={[bubble()]}
        speakers={speakers}
        onChange={() => {}}
        transparentBackground
      />,
    );
    const html = container.innerHTML;
    expect(html).not.toMatch(/bg-gradient-to-br[^"]*from-secondary[^"]*to-muted/);
    expect(html).not.toMatch(/No image yet/);
  });
});
