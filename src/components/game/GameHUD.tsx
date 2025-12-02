import { Timer, Trophy, Crosshair, Skull, Zap } from 'lucide-react';

interface GameHUDProps {
  time: number;
  score: number;
  level: number;
  zombiesKilled: number;
  totalZombies: number;
  ammo: number;
  isAutoMode: boolean;
}

export function GameHUD({
  time,
  score,
  level,
  zombiesKilled,
  totalZombies,
  ammo,
  isAutoMode,
}: GameHUDProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Crosshair */}
      <div className="crosshair" />

      {/* Top HUD */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="hud-stat">
          <Timer className="w-5 h-5 text-primary" />
          <span className="font-display text-lg neon-text">{formatTime(time)}</span>
        </div>
        
        <div className="hud-stat">
          <Trophy className="w-5 h-5 text-accent" />
          <span className="font-display text-lg neon-text-yellow">{score.toLocaleString()}</span>
        </div>

        <div className="hud-stat">
          <Zap className="w-5 h-5 text-secondary" />
          <span className="font-display text-lg neon-text-magenta">LEVEL {level}</span>
        </div>
      </div>

      {/* Auto mode indicator */}
      {isAutoMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <div className="hud-stat border-secondary">
            <span className="font-display text-secondary animate-pulse-neon">AUTO-PILOT ENGAGED</span>
          </div>
        </div>
      )}

      {/* Bottom HUD */}
      <div className="absolute bottom-4 left-4 flex gap-4">
        <div className="hud-stat">
          <Skull className="w-5 h-5 text-destructive" />
          <span className="font-display text-lg text-foreground">
            {zombiesKilled} / {totalZombies}
          </span>
        </div>

        <div className="hud-stat">
          <Crosshair className="w-5 h-5 text-primary" />
          <span className="font-display text-lg neon-text">{ammo}</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <p className="text-muted-foreground text-sm font-body">
          WASD to move • Click to shoot • P for auto-pilot
        </p>
      </div>
    </>
  );
}
