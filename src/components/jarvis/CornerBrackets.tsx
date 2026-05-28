import { cn } from '@/lib/utils';

export function CornerBrackets({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'corner-bracket lg' : 'corner-bracket';
  return (
    <>
      <span className={cn(cls, 'tl')} />
      <span className={cn(cls, 'tr')} />
      <span className={cn(cls, 'bl')} />
      <span className={cn(cls, 'br')} />
    </>
  );
}
