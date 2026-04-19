import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, SkipBack, SkipForward, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimationPose {
  id: string;
  image: string;
  label: string;
}

interface CharacterAnimationPreviewProps {
  poses: AnimationPose[];
  className?: string;
  autoPlay?: boolean;
  defaultSpeed?: number;
}

export function CharacterAnimationPreview({
  poses,
  className,
  autoPlay = false,
  defaultSpeed = 1500,
}: CharacterAnimationPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLooping, setIsLooping] = useState(true);
  const [speed, setSpeed] = useState(defaultSpeed);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToNext = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= poses.length) {
          if (isLooping) return 0;
          setIsPlaying(false);
          return prev;
        }
        return next;
      });
      setIsTransitioning(false);
    }, 300);
  }, [poses.length, isLooping]);

  const goToPrev = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + poses.length) % poses.length);
      setIsTransitioning(false);
    }, 300);
  }, [poses.length]);

  useEffect(() => {
    if (!isPlaying || poses.length <= 1) return;

    const interval = setInterval(goToNext, speed);
    return () => clearInterval(interval);
  }, [isPlaying, speed, goToNext, poses.length]);

  if (poses.length === 0) {
    return (
      <div className={cn("flex items-center justify-center bg-muted rounded-lg aspect-square", className)}>
        <p className="text-sm text-muted-foreground">No poses to animate</p>
      </div>
    );
  }

  const currentPose = poses[currentIndex];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Animation Display */}
      <div className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted">
        {poses.map((pose, idx) => (
          <img
            key={pose.id}
            src={pose.image}
            alt={pose.label}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-300",
              idx === currentIndex 
                ? "opacity-100 scale-100" 
                : "opacity-0 scale-95",
              isTransitioning && idx === currentIndex && "blur-sm"
            )}
          />
        ))}
        
        {/* Pose Label */}
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="backdrop-blur-sm bg-background/80">
            {currentPose.label}
          </Badge>
        </div>

        {/* Frame Counter */}
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="backdrop-blur-sm bg-background/80">
            {currentIndex + 1} / {poses.length}
          </Badge>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex gap-1">
        {poses.map((pose, idx) => (
          <button
            key={pose.id}
            onClick={() => {
              setIsPlaying(false);
              setCurrentIndex(idx);
            }}
            className={cn(
              "flex-1 h-2 rounded-full transition-all",
              idx === currentIndex 
                ? "bg-primary" 
                : "bg-muted hover:bg-muted-foreground/30"
            )}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={goToPrev}
          disabled={poses.length <= 1}
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          variant={isPlaying ? "secondary" : "default"}
          size="icon"
          className="h-10 w-10"
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={poses.length <= 1}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={goToNext}
          disabled={poses.length <= 1}
        >
          <SkipForward className="w-4 h-4" />
        </Button>

        <Button
          variant={isLooping ? "secondary" : "outline"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsLooping(!isLooping)}
        >
          <Repeat className={cn("w-4 h-4", isLooping && "text-primary")} />
        </Button>

        <div className="flex-1 flex items-center gap-2 ml-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Speed</span>
          <Slider
            value={[2500 - speed]}
            onValueChange={([v]) => setSpeed(2500 - v)}
            min={500}
            max={2000}
            step={100}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
