import { useMemo } from 'react';
import { Maze } from '@/utils/mazeGenerator';

interface MiniMapProps {
  maze: Maze;
  playerX: number;
  playerZ: number;
  playerRotation: number;
  cellSize: number;
  goalX: number;
  goalZ: number;
  zombiePositions?: { x: number; z: number }[];
}

export function MiniMap({
  maze,
  playerX,
  playerZ,
  playerRotation,
  cellSize,
  goalX,
  goalZ,
  zombiePositions = [],
}: MiniMapProps) {
  const mapSize = 180;
  const cellPixelSize = mapSize / maze.length;

  const walls = useMemo(() => {
    const lines: JSX.Element[] = [];
    const height = maze.length;
    const width = maze[0].length;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = maze[y][x];
        const px = x * cellPixelSize;
        const py = y * cellPixelSize;

        if (cell.walls.north) {
          lines.push(
            <line
              key={`n-${x}-${y}`}
              x1={px}
              y1={py}
              x2={px + cellPixelSize}
              y2={py}
              stroke="hsl(180, 100%, 50%)"
              strokeWidth="1"
              strokeOpacity="0.7"
            />
          );
        }
        if (cell.walls.west) {
          lines.push(
            <line
              key={`w-${x}-${y}`}
              x1={px}
              y1={py}
              x2={px}
              y2={py + cellPixelSize}
              stroke="hsl(180, 100%, 50%)"
              strokeWidth="1"
              strokeOpacity="0.7"
            />
          );
        }
        // Add south and east walls for border cells
        if (y === height - 1 && cell.walls.south) {
          lines.push(
            <line
              key={`s-${x}-${y}`}
              x1={px}
              y1={py + cellPixelSize}
              x2={px + cellPixelSize}
              y2={py + cellPixelSize}
              stroke="hsl(180, 100%, 50%)"
              strokeWidth="1"
              strokeOpacity="0.7"
            />
          );
        }
        if (x === width - 1 && cell.walls.east) {
          lines.push(
            <line
              key={`e-${x}-${y}`}
              x1={px + cellPixelSize}
              y1={py}
              x2={px + cellPixelSize}
              y2={py + cellPixelSize}
              stroke="hsl(180, 100%, 50%)"
              strokeWidth="1"
              strokeOpacity="0.7"
            />
          );
        }
      }
    }

    return lines;
  }, [maze, cellPixelSize]);

  // Player position in pixels
  const playerPx = (playerX / cellSize) * cellPixelSize;
  const playerPy = (playerZ / cellSize) * cellPixelSize;

  // Goal position in pixels
  const goalPx = (goalX / cellSize) * cellPixelSize;
  const goalPy = (goalZ / cellSize) * cellPixelSize;

  return (
    <div className="minimap">
      <svg width={mapSize} height={mapSize} className="bg-background/80">
        {/* Background */}
        <rect width={mapSize} height={mapSize} fill="hsl(220, 20%, 6%)" fillOpacity="0.9" />
        
        {/* Walls */}
        {walls}

        {/* Goal */}
        <circle
          cx={goalPx}
          cy={goalPy}
          r={6}
          fill="hsl(60, 100%, 50%)"
          className="animate-pulse-neon"
        />

        {/* Zombies */}
        {zombiePositions.map((zombie, i) => (
          <circle
            key={i}
            cx={(zombie.x / cellSize) * cellPixelSize}
            cy={(zombie.z / cellSize) * cellPixelSize}
            r={4}
            fill="hsl(0, 100%, 50%)"
          />
        ))}

        {/* Player */}
        <g transform={`translate(${playerPx}, ${playerPy}) rotate(${(-playerRotation * 180) / Math.PI})`}>
          <polygon
            points="0,-6 4,4 -4,4"
            fill="hsl(180, 100%, 50%)"
          />
        </g>
      </svg>
    </div>
  );
}
