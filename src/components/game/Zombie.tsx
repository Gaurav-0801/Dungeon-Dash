import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ZombieProps {
  id: number;
  initialPosition: [number, number, number];
  playerPosition: THREE.Vector3;
  onHit?: (id: number) => void;
  isHit?: boolean;
  maze: any;
  cellSize: number;
  onUpdatePosition: (id: number, position: THREE.Vector3) => void;
}

export function Zombie({
  id,
  initialPosition,
  playerPosition,
  isHit = false,
  onUpdatePosition,
}: ZombieProps) {
  const groupRef = useRef<THREE.Group>(null);
  const positionRef = useRef(new THREE.Vector3(...initialPosition));
  const bobOffset = useRef(Math.random() * Math.PI * 2);

  useEffect(() => {
    if (isHit && groupRef.current) {
      groupRef.current.visible = false;
    }
  }, [isHit]);

  useFrame((state) => {
    if (!groupRef.current || isHit) return;

    const time = state.clock.getElapsedTime();
    
    // Move towards player
    const direction = new THREE.Vector3()
      .subVectors(playerPosition, positionRef.current)
      .normalize();
    
    // Slow zombie movement
    const speed = 0.025;
    positionRef.current.add(direction.multiplyScalar(speed));
    positionRef.current.y = 0.8;
    
    // Update position for collision detection
    onUpdatePosition(id, positionRef.current.clone());
    
    groupRef.current.position.copy(positionRef.current);
    
    // Bobbing animation
    groupRef.current.position.y = 0.8 + Math.sin(time * 4 + bobOffset.current) * 0.1;
    
    // Face player
    groupRef.current.lookAt(playerPosition.x, groupRef.current.position.y, playerPosition.z);
  });

  if (isHit) return null;

  return (
    <group ref={groupRef} position={initialPosition}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
        <meshStandardMaterial
          color={0x2d5a27}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color={0x3d6a37}
          roughness={0.9}
        />
      </mesh>

      {/* Eyes - glowing red */}
      <mesh position={[-0.08, 0.7, 0.2]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={0xff0000} />
      </mesh>
      <mesh position={[0.08, 0.7, 0.2]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={0xff0000} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.4, 0, 0.2]} rotation={[0.5, 0, 0.3]}>
        <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
        <meshStandardMaterial color={0x2d5a27} roughness={0.8} />
      </mesh>
      <mesh position={[0.4, 0, 0.2]} rotation={[0.5, 0, -0.3]}>
        <capsuleGeometry args={[0.08, 0.4, 4, 8]} />
        <meshStandardMaterial color={0x2d5a27} roughness={0.8} />
      </mesh>

      {/* Glow */}
      <pointLight color={0xff0000} intensity={0.8} distance={4} decay={2} />
    </group>
  );
}
