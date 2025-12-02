import { useMemo } from 'react';
import * as THREE from 'three';

interface FloorProps {
  width: number;
  height: number;
  cellSize: number;
}

export function Floor({ width, height, cellSize }: FloorProps) {
  const totalWidth = width * cellSize;
  const totalHeight = height * cellSize;

  // Create grid texture
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Dark base
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, 512, 512);

    // Grid lines
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.15;

    const gridSize = 32;
    for (let i = 0; i <= 512; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }

    // Center cross
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(256, 0);
    ctx.lineTo(256, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 256);
    ctx.lineTo(512, 256);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(width, height);
    return tex;
  }, [width, height]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[totalWidth / 2, 0, totalHeight / 2]} receiveShadow>
      <planeGeometry args={[totalWidth, totalHeight]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.8}
        metalness={0.2}
        color={0x0a0a12}
      />
    </mesh>
  );
}
