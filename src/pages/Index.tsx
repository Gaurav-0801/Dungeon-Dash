import { useState, useCallback } from 'react';
import { StartScreen } from '@/components/game/StartScreen';
import { GameScene } from '@/components/game/GameScene';
import { GameOverScreen } from '@/components/game/GameOverScreen';

type GameState = 'start' | 'playing' | 'gameover';

const Index = () => {
  const [gameState, setGameState] = useState<GameState>('start');
  const [finalScore, setFinalScore] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [finalLevel, setFinalLevel] = useState(1);

  const handleStart = useCallback(() => {
    setGameState('playing');
  }, []);

  const handleGameOver = useCallback((score: number, time: number, level: number) => {
    setFinalScore(score);
    setFinalTime(time);
    setFinalLevel(level);
    setGameState('gameover');
  }, []);

  const handleRestart = useCallback(() => {
    setFinalScore(0);
    setFinalTime(0);
    setFinalLevel(1);
    setGameState('start');
  }, []);

  return (
    <main className="w-full h-screen overflow-hidden">
      {gameState === 'start' && <StartScreen onStart={handleStart} />}
      {gameState === 'playing' && <GameScene onGameOver={handleGameOver} />}
      {gameState === 'gameover' && (
        <GameOverScreen
          score={finalScore}
          time={finalTime}
          level={finalLevel}
          onRestart={handleRestart}
        />
      )}
    </main>
  );
};

export default Index;
