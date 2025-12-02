import { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Maze } from '@/utils/mazeGenerator';

interface PlayerProps {
  maze: Maze;
  cellSize: number;
  position: THREE.Vector3;
  setPosition: (pos: THREE.Vector3) => void;
  setRotation: (rot: number) => void;
  goalPosition: [number, number, number];
  onReachGoal: () => void;
  autoPath: { x: number; z: number }[] | null;
  isAutoMode: boolean;
  onShoot: (position: THREE.Vector3, direction: THREE.Vector3) => void;
}

export function Player({
  maze,
  cellSize,
  position,
  setPosition,
  setRotation,
  goalPosition,
  onReachGoal,
  autoPath,
  isAutoMode,
  onShoot,
}: PlayerProps) {
  const { camera } = useThree();
  const moveSpeed = 0.15; // Increased speed
  const rotationSpeed = 0.003; // Slightly faster rotation
  
  const keysPressed = useRef<Set<string>>(new Set());
  const yaw = useRef(0);
  const pitch = useRef(0);
  const isPointerLocked = useRef(false);
  const autoPathIndex = useRef(0);
  const velocity = useRef(new THREE.Vector3());

  // Check collision with walls - smoother collision
  const checkCollision = useCallback((newX: number, newZ: number): { canMoveX: boolean; canMoveZ: boolean } => {
    const result = { canMoveX: true, canMoveZ: true };
    
    const cellX = Math.floor(newX / cellSize);
    const cellZ = Math.floor(newZ / cellSize);
    
    // Out of bounds
    if (cellX < 0 || cellX >= maze[0].length || cellZ < 0 || cellZ >= maze.length) {
      return { canMoveX: false, canMoveZ: false };
    }

    const cell = maze[cellZ][cellX];
    const localX = (newX % cellSize) / cellSize;
    const localZ = (newZ % cellSize) / cellSize;
    const margin = 0.12; // Slightly smaller margin for smoother wall sliding

    // Check walls for X movement
    if (cell.walls.west && localX < margin) result.canMoveX = false;
    if (cell.walls.east && localX > 1 - margin) result.canMoveX = false;
    
    // Check walls for Z movement
    if (cell.walls.north && localZ < margin) result.canMoveZ = false;
    if (cell.walls.south && localZ > 1 - margin) result.canMoveZ = false;

    // Check adjacent cells for better wall detection
    const currentCellX = Math.floor(position.x / cellSize);
    const currentCellZ = Math.floor(position.z / cellSize);
    
    if (cellX !== currentCellX || cellZ !== currentCellZ) {
      const currentCell = maze[currentCellZ]?.[currentCellX];
      if (currentCell) {
        // Moving east
        if (cellX > currentCellX && currentCell.walls.east) result.canMoveX = false;
        // Moving west
        if (cellX < currentCellX && currentCell.walls.west) result.canMoveX = false;
        // Moving south
        if (cellZ > currentCellZ && currentCell.walls.south) result.canMoveZ = false;
        // Moving north
        if (cellZ < currentCellZ && currentCell.walls.north) result.canMoveZ = false;
      }
    }

    return result;
  }, [maze, cellSize, position]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle mouse movement and pointer lock
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked.current) return;
      
      yaw.current -= e.movementX * rotationSpeed;
      pitch.current -= e.movementY * rotationSpeed;
      pitch.current = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, pitch.current));
    };

    const handleClick = () => {
      if (!isPointerLocked.current) {
        document.body.requestPointerLock();
      } else {
        // Shoot from camera position
        const shootPos = new THREE.Vector3(position.x, 1.5, position.z);
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyEuler(new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ'));
        onShoot(shootPos, direction);
      }
    };

    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === document.body;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [position, onShoot]);

  useFrame((_, delta) => {
    const newPosition = position.clone();
    const dampingFactor = 0.85; // Smooth deceleration

    if (isAutoMode && autoPath && autoPath.length > 0) {
      // Auto-pilot mode
      const target = autoPath[autoPathIndex.current];
      if (target) {
        const dx = target.x - newPosition.x;
        const dz = target.z - newPosition.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < 0.3) {
          autoPathIndex.current++;
          if (autoPathIndex.current >= autoPath.length) {
            autoPathIndex.current = autoPath.length - 1;
          }
        } else {
          const autoSpeed = moveSpeed * 1.2;
          newPosition.x += (dx / distance) * autoSpeed;
          newPosition.z += (dz / distance) * autoSpeed;
          
          // Face movement direction smoothly
          const targetYaw = Math.atan2(-dx, -dz);
          yaw.current += (targetYaw - yaw.current) * 0.1;
        }
      }
    } else {
      // Manual control with smooth acceleration
      const inputDirection = new THREE.Vector3();
      
      if (keysPressed.current.has('w')) inputDirection.z -= 1;
      if (keysPressed.current.has('s')) inputDirection.z += 1;
      if (keysPressed.current.has('a')) inputDirection.x -= 1;
      if (keysPressed.current.has('d')) inputDirection.x += 1;

      if (inputDirection.length() > 0) {
        inputDirection.normalize();
        inputDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);
        
        // Accelerate towards input direction
        velocity.current.x += inputDirection.x * moveSpeed * 0.5;
        velocity.current.z += inputDirection.z * moveSpeed * 0.5;
        
        // Clamp max velocity
        const maxVel = moveSpeed;
        if (velocity.current.length() > maxVel) {
          velocity.current.normalize().multiplyScalar(maxVel);
        }
      }

      // Apply damping
      velocity.current.multiplyScalar(dampingFactor);

      // Try to move - allow wall sliding
      const nextX = newPosition.x + velocity.current.x;
      const nextZ = newPosition.z + velocity.current.z;
      
      const collision = checkCollision(nextX, nextZ);
      
      // Wall sliding - try each axis separately
      if (collision.canMoveX) {
        newPosition.x = nextX;
      } else {
        velocity.current.x = 0;
      }
      
      if (collision.canMoveZ) {
        newPosition.z = nextZ;
      } else {
        velocity.current.z = 0;
      }
    }

    // Update camera with smooth interpolation
    camera.position.lerp(new THREE.Vector3(newPosition.x, 1.5, newPosition.z), 0.3);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw.current;
    camera.rotation.x = pitch.current;

    setPosition(newPosition);
    setRotation(yaw.current);

    // Check goal
    const goalDist = Math.sqrt(
      Math.pow(newPosition.x - goalPosition[0], 2) +
      Math.pow(newPosition.z - goalPosition[2], 2)
    );
    if (goalDist < 1.5) {
      onReachGoal();
    }
  });

  return null;
}
