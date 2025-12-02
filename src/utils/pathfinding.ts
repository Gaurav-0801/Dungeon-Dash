import { Maze, Cell } from './mazeGenerator';

type Node = {
  x: number;
  y: number;
  g: number; // Cost from start
  h: number; // Heuristic (estimated cost to goal)
  f: number; // Total cost (g + h)
  parent: Node | null;
};

// A* pathfinding algorithm
export function findPath(
  maze: Maze,
  startX: number,
  startY: number,
  endX: number,
  endY: number
): { x: number; y: number }[] | null {
  const height = maze.length;
  const width = maze[0].length;

  // Clamp coordinates to valid range
  startX = Math.max(0, Math.min(width - 1, Math.floor(startX)));
  startY = Math.max(0, Math.min(height - 1, Math.floor(startY)));
  endX = Math.max(0, Math.min(width - 1, Math.floor(endX)));
  endY = Math.max(0, Math.min(height - 1, Math.floor(endY)));

  const openSet: Node[] = [];
  const closedSet: Set<string> = new Set();

  const startNode: Node = {
    x: startX,
    y: startY,
    g: 0,
    h: heuristic(startX, startY, endX, endY),
    f: 0,
    parent: null,
  };
  startNode.f = startNode.g + startNode.h;
  openSet.push(startNode);

  while (openSet.length > 0) {
    // Get node with lowest f score
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;

    // Check if we reached the goal
    if (current.x === endX && current.y === endY) {
      return reconstructPath(current);
    }

    closedSet.add(`${current.x},${current.y}`);

    // Get neighbors
    const neighbors = getWalkableNeighbors(maze, current.x, current.y, width, height);

    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (closedSet.has(key)) continue;

      const g = current.g + 1;
      const h = heuristic(neighbor.x, neighbor.y, endX, endY);
      const f = g + h;

      const existingNode = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);

      if (!existingNode) {
        openSet.push({
          x: neighbor.x,
          y: neighbor.y,
          g,
          h,
          f,
          parent: current,
        });
      } else if (g < existingNode.g) {
        existingNode.g = g;
        existingNode.f = f;
        existingNode.parent = current;
      }
    }
  }

  return null; // No path found
}

function heuristic(x1: number, y1: number, x2: number, y2: number): number {
  // Manhattan distance
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function getWalkableNeighbors(
  maze: Maze,
  x: number,
  y: number,
  width: number,
  height: number
): { x: number; y: number }[] {
  const neighbors: { x: number; y: number }[] = [];
  const cell = maze[y][x];

  // North
  if (!cell.walls.north && y > 0) {
    neighbors.push({ x, y: y - 1 });
  }
  // South
  if (!cell.walls.south && y < height - 1) {
    neighbors.push({ x, y: y + 1 });
  }
  // East
  if (!cell.walls.east && x < width - 1) {
    neighbors.push({ x: x + 1, y });
  }
  // West
  if (!cell.walls.west && x > 0) {
    neighbors.push({ x: x - 1, y });
  }

  return neighbors;
}

function reconstructPath(node: Node): { x: number; y: number }[] {
  const path: { x: number; y: number }[] = [];
  let current: Node | null = node;

  while (current) {
    path.unshift({ x: current.x, y: current.y });
    current = current.parent;
  }

  return path;
}

// Convert path to world coordinates
export function pathToWorldCoords(
  path: { x: number; y: number }[],
  cellSize: number
): { x: number; z: number }[] {
  return path.map(p => ({
    x: p.x * cellSize + cellSize / 2,
    z: p.y * cellSize + cellSize / 2,
  }));
}
