import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BulletProps {
  id: number;
  startPosition: THREE.Vector3;
  direction: THREE.Vector3;
  onRemove: (id: number) => void;
  onHitZombie?: (zombieId: number) => void;
  zombiePositions: { id: number; position: THREE.Vector3 }[];
}

export function Bullet({
  id,
  startPosition,
  direction,
  onRemove,
  onHitZombie,
  zombiePositions,
}: BulletProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const positionRef = useRef(startPosition.clone());
  const speed = 1.2;
  const maxDistance = 60;
  const distanceTraveled = useRef(0);
  const [removed, setRemoved] = useState(false);

  useFrame(() => {
    if (!meshRef.current || removed) return;

    // Move bullet
    const movement = direction.clone().multiplyScalar(speed);
    positionRef.current.add(movement);
    meshRef.current.position.copy(positionRef.current);
    distanceTraveled.current += speed;

    // Check collision with zombies - larger hit radius for easier hits
    for (const zombie of zombiePositions) {
      const dx = positionRef.current.x - zombie.position.x;
      const dy = positionRef.current.y - zombie.position.y;
      const dz = positionRef.current.z - zombie.position.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      if (distance < 1.2) { // Increased hit radius
        setRemoved(true);
        onHitZombie?.(zombie.id);
        onRemove(id);
        return;
      }
    }

    // Remove if traveled too far
    if (distanceTraveled.current > maxDistance) {
      setRemoved(true);
      onRemove(id);
    }
  });

  if (removed) return null;

  return (
    <mesh ref={meshRef} position={positionRef.current}>
      <sphereGeometry args={[0.15, 8, 8]} />
      <meshBasicMaterial color={0x00ffff} />
      <pointLight color={0x00ffff} intensity={3} distance={3} decay={2} />
    </mesh>
  );
}
