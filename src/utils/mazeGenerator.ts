export type Cell = {
  x: number;
  y: number;
  walls: { north: boolean; south: boolean; east: boolean; west: boolean };
  visited: boolean;
};

export type Maze = Cell[][];

// Recursive backtracking maze generation
export function generateMaze(width: number, height: number): Maze {
  // Initialize grid
  const maze: Maze = [];
  for (let y = 0; y < height; y++) {
    maze[y] = [];
    for (let x = 0; x < width; x++) {
      maze[y][x] = {
        x,
        y,
        walls: { north: true, south: true, east: true, west: true },
        visited: false,
      };
    }
  }

  // Recursive backtracking
  const stack: Cell[] = [];
  const startCell = maze[0][0];
  startCell.visited = true;
  stack.push(startCell);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(current, maze, width, height);

    if (neighbors.length === 0) {
      stack.pop();
    } else {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      removeWall(current, next);
      next.visited = true;
      stack.push(next);
    }
  }

  return maze;
}

function getUnvisitedNeighbors(
  cell: Cell,
  maze: Maze,
  width: number,
  height: number
): Cell[] {
  const neighbors: Cell[] = [];
  const { x, y } = cell;

  if (y > 0 && !maze[y - 1][x].visited) neighbors.push(maze[y - 1][x]);
  if (y < height - 1 && !maze[y + 1][x].visited) neighbors.push(maze[y + 1][x]);
  if (x > 0 && !maze[y][x - 1].visited) neighbors.push(maze[y][x - 1]);
  if (x < width - 1 && !maze[y][x + 1].visited) neighbors.push(maze[y][x + 1]);

  return neighbors;
}

function removeWall(current: Cell, next: Cell) {
  const dx = next.x - current.x;
  const dy = next.y - current.y;

  if (dx === 1) {
    current.walls.east = false;
    next.walls.west = false;
  } else if (dx === -1) {
    current.walls.west = false;
    next.walls.east = false;
  } else if (dy === 1) {
    current.walls.south = false;
    next.walls.north = false;
  } else if (dy === -1) {
    current.walls.north = false;
    next.walls.south = false;
  }
}

// Convert maze to wall positions for 3D rendering
export type WallPosition = {
  x: number;
  z: number;
  rotation: number; // 0 for north/south walls, Math.PI/2 for east/west
};

export function getMazeWalls(maze: Maze, cellSize: number): WallPosition[] {
  const walls: WallPosition[] = [];
  const height = maze.length;
  const width = maze[0].length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = maze[y][x];
      const worldX = x * cellSize;
      const worldZ = y * cellSize;

      // North wall
      if (cell.walls.north) {
        walls.push({
          x: worldX + cellSize / 2,
          z: worldZ,
          rotation: 0,
        });
      }

      // South wall (only for bottom row)
      if (y === height - 1 && cell.walls.south) {
        walls.push({
          x: worldX + cellSize / 2,
          z: worldZ + cellSize,
          rotation: 0,
        });
      }

      // West wall
      if (cell.walls.west) {
        walls.push({
          x: worldX,
          z: worldZ + cellSize / 2,
          rotation: Math.PI / 2,
        });
      }

      // East wall (only for right column)
      if (x === width - 1 && cell.walls.east) {
        walls.push({
          x: worldX + cellSize,
          z: worldZ + cellSize / 2,
          rotation: Math.PI / 2,
        });
      }
    }
  }

  return walls;
}

// Get spawn positions for zombies
export function getZombieSpawnPositions(
  maze: Maze,
  cellSize: number,
  count: number,
  excludeStart: boolean = true,
  excludeEnd: boolean = true
): { x: number; z: number }[] {
  const positions: { x: number; z: number }[] = [];
  const height = maze.length;
  const width = maze[0].length;

  const validCells: { x: number; y: number }[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (excludeStart && x === 0 && y === 0) continue;
      if (excludeEnd && x === width - 1 && y === height - 1) continue;
      // Don't spawn too close to start
      if (x < 2 && y < 2) continue;
      validCells.push({ x, y });
    }
  }

  // Shuffle and pick
  for (let i = validCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [validCells[i], validCells[j]] = [validCells[j], validCells[i]];
  }

  for (let i = 0; i < Math.min(count, validCells.length); i++) {
    const cell = validCells[i];
    positions.push({
      x: cell.x * cellSize + cellSize / 2,
      z: cell.y * cellSize + cellSize / 2,
    });
  }

  return positions;
}
