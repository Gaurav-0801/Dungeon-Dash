import { Trophy, Timer, Zap, RotateCcw } from 'lucide-react';

interface GameOverScreenProps {
  score: number;
  time: number;
  level: number;
  onRestart: () => void;
}

export function GameOverScreen({ score, time, level, onRestart }: GameOverScreenProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isWin = level >= 5;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-lg w-full text-center">
        {/* Title */}
        <h1 className={`text-5xl md:text-7xl font-display font-black mb-4 ${isWin ? 'neon-text-yellow' : 'neon-text'}`}>
          {isWin ? 'VICTORY!' : 'GAME OVER'}
        </h1>

        {isWin && (
          <p className="text-xl text-muted-foreground font-body mb-8">
            You conquered all 5 levels!
          </p>
        )}

        {/* Stats */}
        <div className="game-panel p-8 mb-8">
          <div className="grid gap-6">
            <div className="flex items-center justify-between border-b border-border/30 pb-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-accent" />
                <span className="font-display text-xl">SCORE</span>
              </div>
              <span className="font-display text-3xl neon-text-yellow">{score.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between border-b border-border/30 pb-4">
              <div className="flex items-center gap-3">
                <Timer className="w-8 h-8 text-primary" />
                <span className="font-display text-xl">TIME</span>
              </div>
              <span className="font-display text-3xl neon-text">{formatTime(time)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-secondary" />
                <span className="font-display text-xl">LEVEL</span>
              </div>
              <span className="font-display text-3xl neon-text-magenta">{level}</span>
            </div>
          </div>
        </div>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="game-button text-xl px-10 py-4 rounded-lg flex items-center justify-center gap-3 mx-auto"
        >
          <RotateCcw className="w-6 h-6" />
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}
