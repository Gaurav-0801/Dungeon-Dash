import { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { MazeWalls } from './MazeWalls';
import { Floor } from './Floor';
import { Goal } from './Goal';
import { Player } from './Player';
import { Zombie } from './Zombie';
import { Bullet } from './Bullet';
import { MiniMap } from './MiniMap';
import { GameHUD } from './GameHUD';
import {
  generateMaze,
  getMazeWalls,
  getZombieSpawnPositions,
  Maze,
} from '@/utils/mazeGenerator';
import { findPath, pathToWorldCoords } from '@/utils/pathfinding';

interface GameSceneProps {
  onGameOver: (score: number, time: number, level: number) => void;
  initialLevel?: number;
}

export function GameScene({ onGameOver, initialLevel = 1 }: GameSceneProps) {
  const CELL_SIZE = 4;
  const WALL_HEIGHT = 3;
  const BASE_SIZE = 10;

  const [level, setLevel] = useState(initialLevel);
  const [mazeSize, setMazeSize] = useState(BASE_SIZE);
  const [maze, setMaze] = useState<Maze | null>(null);
  const [walls, setWalls] = useState<any[]>([]);
  const [playerPosition, setPlayerPosition] = useState(new THREE.Vector3(CELL_SIZE / 2, 1.5, CELL_SIZE / 2));
  const [playerRotation, setPlayerRotation] = useState(0);
  const [goalPosition, setGoalPosition] = useState<[number, number, number]>([0, 1, 0]);
  
  const [zombieData, setZombieData] = useState<{ id: number; initialPos: THREE.Vector3 }[]>([]);
  const zombiePositionsRef = useRef<Map<number, THREE.Vector3>>(new Map());
  const [hitZombies, setHitZombies] = useState<Set<number>>(new Set());
  const [bullets, setBullets] = useState<{ id: number; start: THREE.Vector3; direction: THREE.Vector3 }[]>([]);
  const bulletIdRef = useRef(0);
  
  const [time, setTime] = useState(0);
  const [score, setScore] = useState(0);
  const [zombiesKilled, setZombiesKilled] = useState(0);
  const [ammo, setAmmo] = useState(50);
  
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [autoPath, setAutoPath] = useState<{ x: number; z: number }[] | null>(null);

  // Update zombie position callback
  const handleZombiePositionUpdate = useCallback((id: number, position: THREE.Vector3) => {
    zombiePositionsRef.current.set(id, position);
  }, []);

  // Generate maze
  const generateNewMaze = useCallback((size: number) => {
    const newMaze = generateMaze(size, size);
    setMaze(newMaze);
    setWalls(getMazeWalls(newMaze, CELL_SIZE));
    
    // Set goal at bottom-right corner
    const goalX = (size - 1) * CELL_SIZE + CELL_SIZE / 2;
    const goalZ = (size - 1) * CELL_SIZE + CELL_SIZE / 2;
    setGoalPosition([goalX, 1, goalZ]);

    // Spawn zombies (more per level)
    const zombieCount = 3 + level * 2;
    const spawnPositions = getZombieSpawnPositions(newMaze, CELL_SIZE, zombieCount);
    
    const newZombies = spawnPositions.map((pos, i) => {
      const position = new THREE.Vector3(pos.x, 0.8, pos.z);
      zombiePositionsRef.current.set(i, position);
      return {
        id: i,
        initialPos: position,
      };
    });
    
    setZombieData(newZombies);
    setHitZombies(new Set());
    setZombiesKilled(0);

    // Reset player position
    setPlayerPosition(new THREE.Vector3(CELL_SIZE / 2, 1.5, CELL_SIZE / 2));
    setPlayerRotation(0);
    setAutoPath(null);
  }, [level]);

  // Initialize game
  useEffect(() => {
    const size = BASE_SIZE + Math.floor((level - 1) * 2);
    setMazeSize(size);
    generateNewMaze(size);
    setAmmo(50 + level * 10);
  }, [level, generateNewMaze]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-pilot toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'p' && maze) {
        setIsAutoMode(prev => {
          const newMode = !prev;
          if (newMode) {
            // Calculate path
            const playerCellX = Math.floor(playerPosition.x / CELL_SIZE);
            const playerCellZ = Math.floor(playerPosition.z / CELL_SIZE);
            const goalCellX = Math.floor(goalPosition[0] / CELL_SIZE);
            const goalCellZ = Math.floor(goalPosition[2] / CELL_SIZE);
            
            const path = findPath(maze, playerCellX, playerCellZ, goalCellX, goalCellZ);
            if (path) {
              setAutoPath(pathToWorldCoords(path, CELL_SIZE));
            }
          } else {
            setAutoPath(null);
          }
          return newMode;
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [maze, playerPosition, goalPosition]);

  // Handle shooting
  const handleShoot = useCallback((position: THREE.Vector3, direction: THREE.Vector3) => {
    if (ammo <= 0) return;
    
    setBullets(prev => [
      ...prev,
      { id: bulletIdRef.current++, start: position.clone(), direction: direction.clone() }
    ]);
    setAmmo(a => a - 1);
  }, [ammo]);

  // Handle bullet removal
  const handleBulletRemove = useCallback((id: number) => {
    setBullets(prev => prev.filter(b => b.id !== id));
  }, []);

  // Handle zombie hit
  const handleZombieHit = useCallback((zombieId: number) => {
    setHitZombies(prev => {
      if (prev.has(zombieId)) return prev;
      const newSet = new Set(prev);
      newSet.add(zombieId);
      return newSet;
    });
    setZombiesKilled(k => k + 1);
    setScore(s => s + 100 * level);
    zombiePositionsRef.current.delete(zombieId);
  }, [level]);

  // Handle reaching goal
  const handleReachGoal = useCallback(() => {
    const timeBonus = Math.max(0, 300 - time) * 10;
    const levelBonus = level * 500;
    const zombieBonus = zombiesKilled * 50;
    const newScore = score + timeBonus + levelBonus + zombieBonus;
    setScore(newScore);
    
    // Next level or game complete
    if (level >= 5) {
      onGameOver(newScore, time, level);
    } else {
      setLevel(l => l + 1);
      setTime(0);
    }
  }, [score, time, level, zombiesKilled, onGameOver]);

  if (!maze) return null;

  // Get active zombie positions for bullet collision
  const activeZombiePositions = zombieData
    .filter(z => !hitZombies.has(z.id))
    .map(z => ({
      id: z.id,
      position: zombiePositionsRef.current.get(z.id) || z.initialPos,
    }));

  // Get zombie positions for minimap
  const zombieWorldPositions = activeZombiePositions.map(z => ({ 
    x: z.position.x, 
    z: z.position.z 
  }));

  return (
    <div className="relative w-full h-screen bg-background">
      <Canvas shadows camera={{ fov: 75, near: 0.1, far: 1000 }}>
        {/* Lighting */}
        <ambientLight intensity={0.25} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={0.6}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <fog attach="fog" args={['#0a0a12', 1, 45]} />

        {/* Environment */}
        <Floor width={mazeSize} height={mazeSize} cellSize={CELL_SIZE} />
        <MazeWalls walls={walls} cellSize={CELL_SIZE} wallHeight={WALL_HEIGHT} />
        <Goal position={goalPosition} />

        {/* Zombies */}
        {zombieData.map(zombie => (
          !hitZombies.has(zombie.id) && (
            <Zombie
              key={zombie.id}
              id={zombie.id}
              initialPosition={[zombie.initialPos.x, zombie.initialPos.y, zombie.initialPos.z]}
              playerPosition={playerPosition}
              maze={maze}
              cellSize={CELL_SIZE}
              isHit={hitZombies.has(zombie.id)}
              onUpdatePosition={handleZombiePositionUpdate}
            />
          )
        ))}

        {/* Bullets */}
        {bullets.map(bullet => (
          <Bullet
            key={bullet.id}
            id={bullet.id}
            startPosition={bullet.start}
            direction={bullet.direction}
            onRemove={handleBulletRemove}
            onHitZombie={handleZombieHit}
            zombiePositions={activeZombiePositions}
          />
        ))}

        {/* Player */}
        <Player
          maze={maze}
          cellSize={CELL_SIZE}
          position={playerPosition}
          setPosition={setPlayerPosition}
          setRotation={setPlayerRotation}
          goalPosition={goalPosition}
          onReachGoal={handleReachGoal}
          autoPath={autoPath}
          isAutoMode={isAutoMode}
          onShoot={handleShoot}
        />
      </Canvas>

      {/* HUD Overlay */}
      <GameHUD
        time={time}
        score={score}
        level={level}
        zombiesKilled={zombiesKilled}
        totalZombies={zombieData.length}
        ammo={ammo}
        isAutoMode={isAutoMode}
      />

      {/* Mini Map */}
      <MiniMap
        maze={maze}
        playerX={playerPosition.x}
        playerZ={playerPosition.z}
        playerRotation={playerRotation}
        cellSize={CELL_SIZE}
        goalX={goalPosition[0]}
        goalZ={goalPosition[2]}
        zombiePositions={zombieWorldPositions}
      />
    </div>
  );
}
