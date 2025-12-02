import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GoalProps {
  position: [number, number, number];
  onReach?: () => void;
}

export function Goal({ position }: GoalProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.5;
      meshRef.current.position.y = position[1] + Math.sin(time * 2) * 0.2;
    }
    
    if (ringRef.current) {
      ringRef.current.rotation.x = time * 0.3;
      ringRef.current.rotation.z = time * 0.5;
    }
    
    if (glowRef.current) {
      glowRef.current.intensity = 2 + Math.sin(time * 3) * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Central crystal */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color={0xffff00}
          emissive={0xffff00}
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Rotating ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.7, 0.05, 16, 32]} />
        <meshStandardMaterial
          color={0x00ffff}
          emissive={0x00ffff}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Outer ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.9, 0.03, 16, 32]} />
        <meshStandardMaterial
          color={0xff00ff}
          emissive={0xff00ff}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Point light for glow effect */}
      <pointLight
        ref={glowRef}
        color={0xffff00}
        intensity={2}
        distance={5}
        decay={2}
      />

      {/* Ground glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]}>
        <circleGeometry args={[1.2, 32]} />
        <meshBasicMaterial
          color={0xffff00}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}
