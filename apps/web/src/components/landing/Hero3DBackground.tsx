// apps/web/src/components/landing/Hero3DBackground.tsx
// Minimalist, calm 3D isometric stock depletion & replenishment background animation

import React, { useEffect, useRef } from "react";

interface SimpleStockColumn {
  gx: number;
  gz: number;
  maxBlocks: number;
  currentBlocks: number;
  phaseOffset: number;
  speed: number;
}

export const Hero3DBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    let targetMouseX = 0;
    let targetMouseY = 0;
    let smoothMouseX = 0;
    let smoothMouseY = 0;

    // Clean 5x5 isometric matrix of stock columns
    const GRID_SIZE = 5;
    const SPACING = 56;
    const BLOCK_SIZE = 18;
    const BLOCK_HEIGHT = 10;

    const columns: SimpleStockColumn[] = [];
    for (let gx = -2; gx <= 2; gx++) {
      for (let gz = -2; gz <= 2; gz++) {
        const dist = Math.hypot(gx, gz);
        const maxBlocks = 6;
        columns.push({
          gx,
          gz,
          maxBlocks,
          currentBlocks: 3,
          phaseOffset: dist * 0.85 + (gx + gz) * 0.35,
          speed: 0.012,
        });
      }
    }

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      const ny = ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
      targetMouseX = Math.max(-1, Math.min(1, nx));
      targetMouseY = Math.max(-1, Math.min(1, ny));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    let time = 0;

    const project = (x: number, y: number, z: number) => {
      const angleY = 0.72 + smoothMouseX * 0.12;
      const angleX = 0.52 + smoothMouseY * 0.08;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      const rx = x * cosY - z * sinY;
      const rz = x * sinY + z * cosY;

      const ry = y * cosX - rz * sinX;
      const rz2 = y * sinX + rz * cosX;

      const fov = 900;
      const viewerDist = 760;
      const scale = fov / Math.max(200, viewerDist + rz2);

      const centerX = width > 900 ? width * 0.67 : width * 0.5;
      const centerY = height * 0.56;

      return {
        x: centerX + rx * scale,
        y: centerY - ry * scale,
        depth: rz2,
      };
    };

    const drawBox = (
      cx: number,
      bottomY: number,
      cz: number,
      halfW: number,
      boxH: number,
      alpha: number,
      isTopBlock: boolean
    ) => {
      const y0 = bottomY;
      const y1 = bottomY + boxH;

      const p100 = project(cx + halfW, y0, cz - halfW);
      const p101 = project(cx + halfW, y0, cz + halfW);
      const p001 = project(cx - halfW, y0, cz + halfW);

      const p010 = project(cx - halfW, y1, cz - halfW);
      const p110 = project(cx + halfW, y1, cz - halfW);
      const p111 = project(cx + halfW, y1, cz + halfW);
      const p011 = project(cx - halfW, y1, cz + halfW);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 0.75;
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(23, 23, 23, 0.16)";

      // Left face
      ctx.beginPath();
      ctx.moveTo(p011.x, p011.y);
      ctx.lineTo(p111.x, p111.y);
      ctx.lineTo(p101.x, p101.y);
      ctx.lineTo(p001.x, p001.y);
      ctx.closePath();
      ctx.fillStyle = isTopBlock ? "#262626" : "#e5e5e5";
      ctx.fill();
      ctx.stroke();

      // Right face
      ctx.beginPath();
      ctx.moveTo(p110.x, p110.y);
      ctx.lineTo(p111.x, p111.y);
      ctx.lineTo(p101.x, p101.y);
      ctx.lineTo(p100.x, p100.y);
      ctx.closePath();
      ctx.fillStyle = isTopBlock ? "#171717" : "#d4d4d4";
      ctx.fill();
      ctx.stroke();

      // Top face
      ctx.beginPath();
      ctx.moveTo(p010.x, p010.y);
      ctx.lineTo(p110.x, p110.y);
      ctx.lineTo(p111.x, p111.y);
      ctx.lineTo(p011.x, p011.y);
      ctx.closePath();
      ctx.fillStyle = isTopBlock ? "#404040" : "#f5f5f5";
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    const render = () => {
      time += 1;
      smoothMouseX += (targetMouseX - smoothMouseX) * 0.05;
      smoothMouseY += (targetMouseY - smoothMouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Subtle isometric floor grid
      const gridExtent = (GRID_SIZE / 2 + 0.8) * SPACING;
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = "rgba(23, 23, 23, 0.05)";

      for (let i = -3; i <= 3; i++) {
        const pos = i * SPACING;
        const pStartX = project(pos, 0, -gridExtent);
        const pEndX = project(pos, 0, gridExtent);
        ctx.beginPath();
        ctx.moveTo(pStartX.x, pStartX.y);
        ctx.lineTo(pEndX.x, pEndX.y);
        ctx.stroke();

        const pStartZ = project(-gridExtent, 0, pos);
        const pEndZ = project(gridExtent, 0, pos);
        ctx.beginPath();
        ctx.moveTo(pStartZ.x, pStartZ.y);
        ctx.lineTo(pEndZ.x, pEndZ.y);
        ctx.stroke();
      }

      // Depth-sort columns back-to-front
      const sorted = [...columns].sort((a, b) => {
        const pa = project(a.gx * SPACING, 0, a.gz * SPACING);
        const pb = project(b.gx * SPACING, 0, b.gz * SPACING);
        return pb.depth - pa.depth;
      });

      for (const col of sorted) {
        const wx = col.gx * SPACING;
        const wz = col.gz * SPACING;

        // Smooth sawtooth-like stock cycle: depletes down to 1 block, then refills smoothly
        const wave = (Math.sin(time * col.speed + col.phaseOffset) + 1) * 0.5;
        const exactHeight = 1 + wave * (col.maxBlocks - 1);
        const fullBlocks = Math.floor(exactHeight);
        const partial = exactHeight - fullBlocks;

        for (let b = 0; b < fullBlocks; b++) {
          const bottomY = b * (BLOCK_HEIGHT + 2.5);
          const isTop = b === fullBlocks - 1 && partial < 0.15;
          drawBox(wx, bottomY, wz, BLOCK_SIZE, BLOCK_HEIGHT, 1, isTop);
        }

        // Top block smoothly depleting / appearing
        if (partial >= 0.15) {
          const topY = fullBlocks * (BLOCK_HEIGHT + 2.5) + (1 - partial) * 6;
          drawBox(wx, topY, wz, BLOCK_SIZE, BLOCK_HEIGHT, partial, true);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block opacity-85" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(250,250,250,0.97) 0%, rgba(250,250,250,0.85) 42%, rgba(250,250,250,0.2) 75%, rgba(250,250,250,0.65) 100%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#fafafa] to-transparent" />
    </div>
  );
};

export default Hero3DBackground;
