import { useMemo } from 'react';
import * as THREE from 'three';
import { WallPosition } from '@/utils/mazeGenerator';

interface MazeWallsProps {
  walls: WallPosition[];
  cellSize: number;
  wallHeight: number;
}

export function MazeWalls({ walls, cellSize, wallHeight }: MazeWallsProps) {
  // Create wall material with better visuals
  const wallMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.7,
      metalness: 0.3,
      emissive: 0x00ffff,
      emissiveIntensity: 0.05,
    });
  }, []);

  // Create edge glow material
  const edgeMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6,
    });
  }, []);

  return (
    <group>
      {walls.map((wall, index) => (
        <group
          key={index}
          position={[wall.x, wallHeight / 2, wall.z]}
          rotation={[0, wall.rotation, 0]}
        >
          {/* Main wall */}
          <mesh castShadow receiveShadow material={wallMaterial}>
            <boxGeometry args={[cellSize, wallHeight, 0.2]} />
          </mesh>
          
          {/* Top edge glow */}
          <mesh position={[0, wallHeight / 2 - 0.05, 0]} material={edgeMaterial}>
            <boxGeometry args={[cellSize, 0.1, 0.25]} />
          </mesh>
          
          {/* Bottom edge glow */}
          <mesh position={[0, -wallHeight / 2 + 0.05, 0]} material={edgeMaterial}>
            <boxGeometry args={[cellSize, 0.1, 0.25]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
