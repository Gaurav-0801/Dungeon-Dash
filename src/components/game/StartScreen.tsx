import { Gamepad2, Target, Map, Timer, Skull, Zap } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-display font-black mb-4 neon-text tracking-wider">
          MAZE
        </h1>
        <h2 className="text-3xl md:text-5xl font-display font-bold mb-8 neon-text-magenta">
          NAVIGATOR
        </h2>

        {/* Subtitle */}
        <p className="text-xl text-muted-foreground font-body mb-12">
          Navigate the procedural maze, avoid zombies, and reach the goal
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          <div className="game-panel p-4">
            <Gamepad2 className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="font-display text-sm">WASD Controls</p>
          </div>
          <div className="game-panel p-4">
            <Map className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="font-display text-sm">Mini-Map</p>
          </div>
          <div className="game-panel p-4">
            <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="font-display text-sm">Auto-Pilot (P)</p>
          </div>
          <div className="game-panel p-4">
            <Skull className="w-8 h-8 mx-auto mb-2 text-destructive" />
            <p className="font-display text-sm">Zombies</p>
          </div>
          <div className="game-panel p-4">
            <Timer className="w-8 h-8 mx-auto mb-2 text-accent" />
            <p className="font-display text-sm">Time Bonus</p>
          </div>
          <div className="game-panel p-4">
            <Zap className="w-8 h-8 mx-auto mb-2 text-secondary" />
            <p className="font-display text-sm">5 Levels</p>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="game-button text-2xl px-12 py-4 rounded-lg"
        >
          START GAME
        </button>

        {/* Instructions */}
        <div className="mt-12 text-left game-panel p-6">
          <h3 className="font-display text-xl mb-4 neon-text">HOW TO PLAY</h3>
          <ul className="space-y-2 text-muted-foreground font-body">
            <li>• Use <span className="text-primary">WASD</span> keys to move through the maze</li>
            <li>• <span className="text-primary">Click</span> to lock mouse and shoot</li>
            <li>• Press <span className="text-primary">P</span> to toggle auto-pilot pathfinding</li>
            <li>• Reach the <span className="text-accent">yellow goal</span> to complete each level</li>
            <li>• <span className="text-destructive">Avoid or shoot zombies</span> for bonus points</li>
            <li>• Complete faster for <span className="text-secondary">time bonuses</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
