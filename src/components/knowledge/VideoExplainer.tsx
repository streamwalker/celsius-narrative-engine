import { useMemo } from 'react';

interface VideoExplainerProps {
  /** YouTube, Vimeo, Loom URL, or direct mp4/webm */
  src: string;
  title: string;
  caption?: string;
}

function toEmbedSrc(src: string): { kind: 'iframe' | 'video'; src: string } {
  try {
    const url = new URL(src);
    const host = url.hostname.replace(/^www\./, '');
    // YouTube
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const v = url.searchParams.get('v');
      if (v) return { kind: 'iframe', src: `https://www.youtube.com/embed/${v}` };
    }
    if (host === 'youtu.be') {
      return { kind: 'iframe', src: `https://www.youtube.com/embed${url.pathname}` };
    }
    // Vimeo
    if (host === 'vimeo.com') {
      return { kind: 'iframe', src: `https://player.vimeo.com/video${url.pathname}` };
    }
    // Loom
    if (host === 'loom.com' || host === 'www.loom.com') {
      return { kind: 'iframe', src: src.replace('/share/', '/embed/') };
    }
    // Direct video
    if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) return { kind: 'video', src };
    return { kind: 'iframe', src };
  } catch {
    return { kind: 'iframe', src };
  }
}

export function VideoExplainer({ src, title, caption }: VideoExplainerProps) {
  const embed = useMemo(() => toEmbedSrc(src), [src]);
  return (
    <figure className="space-y-2">
      <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-black">
        {embed.kind === 'iframe' ? (
          <iframe
            src={embed.src}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <video src={embed.src} title={title} controls className="h-full w-full" />
        )}
      </div>
      {caption && <figcaption className="text-xs text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}
