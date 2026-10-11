// apps/web/src/components/landing/Hero3DBackground.tsx
// Full-bleed 3D Isometric Voxel & Perspective Canvas Background for the Hero Section
// Visualizes real-time inventory stock depletion ("stock finishing"), ROP threshold breaches,
// and automated EOQ replenishment drops in 3D space centered behind the hero content.

import React, { useEffect, useRef } from "react";

interface StockTower {
  gx: number;
  gz: number;
  sku: string;
  maxBlocks: number;
  currentBlocks: number;
  ropLevel: number;
  depleteTimer: number;
  depleteSpeed: number;
  state: "DEPLETING" | "CRITICAL" | "REPLENISHING";
  criticalTimer: number;
  fallingBlocks: {
    targetIndex: number;
    y: number;
    vy: number;
  }[];
  pulseRing: number;
}

interface FloatingParticle {
  x: number;
  y: number;
  z: number;
  vy: number;
  alpha: number;
  label?: string;
  color: string;
}

const SKU_LABELS = [
  "ORS-01",
  "PCM-500",
  "AMX-250",
  "INS-GLG",
  "AZI-500",
  "BND-04",
  "MET-850",
  "IBU-400",
  "CET-10",
  "VIT-C",
  "OMO-20",
  "SAL-100",
];

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

    // Mouse parallax state
    let targetMouseX = 0;
    let targetMouseY = 0;
    let smoothMouseX = 0;
    let smoothMouseY = 0;

    // 3D Grid Setup (8x8 matrix spanning the full hero background)
    const GRID_SIZE = 8;
    const SPACING = 62;
    const BLOCK_SIZE = 19;
    const BLOCK_HEIGHT = 11;

    const towers: StockTower[] = [];
    const particles: FloatingParticle[] = [];

    let skuCounter = 0;
    for (let gx = -GRID_SIZE / 2; gx < GRID_SIZE / 2; gx++) {
      for (let gz = -GRID_SIZE / 2; gz < GRID_SIZE / 2; gz++) {
        const maxBlocks = 6 + ((Math.abs(gx * 3 + gz * 5)) % 4);
        const startBlocks = 2 + ((Math.abs(gx * 7 + gz * 2)) % (maxBlocks - 1));
        towers.push({
          gx,
          gz,
          sku: SKU_LABELS[skuCounter++ % SKU_LABELS.length],
          maxBlocks,
          currentBlocks: startBlocks,
          ropLevel: 2,
          depleteTimer: Math.random() * 60,
          depleteSpeed: 0.5 + Math.random() * 0.85,
          state: startBlocks <= 2 ? "CRITICAL" : "DEPLETING",
          criticalTimer: 0,
          fallingBlocks: [],
          pulseRing: 0,
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

    // 3D Isometric + Perspective Projection helper centered in the Hero section
    let time = 0;
    const project = (x: number, y: number, z: number) => {
      const angleY = 0.78 + Math.sin(time * 0.0035) * 0.08 + smoothMouseX * 0.18;
      const angleX = 0.52 + Math.cos(time * 0.0028) * 0.035 + smoothMouseY * 0.1;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Rotate around Y axis
      const rx = x * cosY - z * sinY;
      const rz = x * sinY + z * cosY;

      // Rotate around X axis
      const ry = y * cosX - rz * sinX;
      const rz2 = y * sinX + rz * cosX;

      // Perspective scale
      const fov = 940;
      const viewerDist = 760;
      const scale = fov / Math.max(200, viewerDist + rz2);

      // Centered across the entire Hero canvas
      const centerX = width * 0.5;
      const centerY = height * 0.58;

      return {
        x: centerX + rx * scale,
        y: centerY - ry * scale,
        depth: rz2,
        scale,
      };
    };

    // Draw a 3D shaded voxel box centered at (cx, bottomY, cz)
    const drawVoxelBox = (
      cx: number,
      bottomY: number,
      cz: number,
      halfW: number,
      boxH: number,
      palette: {
        top: string;
        left: string;
        right: string;
        stroke: string;
      }
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

      ctx.lineWidth = 0.8;
      ctx.lineJoin = "round";

      // Front-Left Face
      ctx.beginPath();
      ctx.moveTo(p011.x, p011.y);
      ctx.lineTo(p111.x, p111.y);
      ctx.lineTo(p101.x, p101.y);
      ctx.lineTo(p001.x, p001.y);
      ctx.closePath();
      ctx.fillStyle = palette.left;
      ctx.fill();
      ctx.strokeStyle = palette.stroke;
      ctx.stroke();

      // Front-Right Face
      ctx.beginPath();
      ctx.moveTo(p110.x, p110.y);
      ctx.lineTo(p111.x, p111.y);
      ctx.lineTo(p101.x, p101.y);
      ctx.lineTo(p100.x, p100.y);
      ctx.closePath();
      ctx.fillStyle = palette.right;
      ctx.fill();
      ctx.strokeStyle = palette.stroke;
      ctx.stroke();

      // Top Face
      ctx.beginPath();
      ctx.moveTo(p010.x, p010.y);
      ctx.lineTo(p110.x, p110.y);
      ctx.lineTo(p111.x, p111.y);
      ctx.lineTo(p011.x, p011.y);
      ctx.closePath();
      ctx.fillStyle = palette.top;
      ctx.fill();
      ctx.strokeStyle = palette.stroke;
      ctx.stroke();
    };

    const render = () => {
      time += 1;
      smoothMouseX += (targetMouseX - smoothMouseX) * 0.06;
      smoothMouseY += (targetMouseY - smoothMouseY) * 0.06;

      const isDark = document.documentElement.classList.contains("dark");

      ctx.clearRect(0, 0, width, height);

      // 1. Draw 3D Warehouse Floor Grid
      const gridExtent = (GRID_SIZE / 2 + 1.2) * SPACING;
      const step = SPACING / 2;
      ctx.lineWidth = 1;
      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.045)" : "rgba(23,23,23,0.05)";

      for (let x = -gridExtent; x <= gridExtent; x += step) {
        const pStart = project(x, 0, -gridExtent);
        const pEnd = project(x, 0, gridExtent);
        ctx.beginPath();
        ctx.moveTo(pStart.x, pStart.y);
        ctx.lineTo(pEnd.x, pEnd.y);
        ctx.stroke();
      }
      for (let z = -gridExtent; z <= gridExtent; z += step) {
        const pStart = project(-gridExtent, 0, z);
        const pEnd = project(gridExtent, 0, z);
        ctx.beginPath();
        ctx.moveTo(pStart.x, pStart.y);
        ctx.lineTo(pEnd.x, pEnd.y);
        ctx.stroke();
      }

      // 2. Update Tower Physics (Stock Depleting -> Stockout Warning -> Automated EOQ Restock)
      for (const t of towers) {
        const worldX = (t.gx + 0.5) * SPACING;
        const worldZ = (t.gz + 0.5) * SPACING;

        if (t.state === "DEPLETING") {
          t.depleteTimer += t.depleteSpeed;
          if (t.depleteTimer >= 72) {
            t.depleteTimer = 0;
            if (t.currentBlocks > 0) {
              const removedTopY = t.currentBlocks * (BLOCK_HEIGHT + 2);
              t.currentBlocks -= 1;

              particles.push({
                x: worldX,
                y: removedTopY + 8,
                z: worldZ,
                vy: 0.75,
                alpha: 0.9,
                label: t.currentBlocks <= t.ropLevel ? "LOW STOCK" : "-1",
                color:
                  t.currentBlocks <= t.ropLevel
                    ? "#e11d48"
                    : isDark
                    ? "#a3a3a3"
                    : "#525252",
              });
            }

            if (t.currentBlocks <= 1) {
              t.state = "CRITICAL";
              t.criticalTimer = 0;
              t.pulseRing = 0.05;
            }
          }
        } else if (t.state === "CRITICAL") {
          t.criticalTimer += 1;
          t.pulseRing = Math.min(1, t.pulseRing + 0.025);

          if (t.criticalTimer === 35 && t.currentBlocks > 0) {
            t.currentBlocks = 0;
            particles.push({
              x: worldX,
              y: 14,
              z: worldZ,
              vy: 0.9,
              alpha: 0.95,
              label: "ROP TRIGGERED",
              color: "#e11d48",
            });
          }

          if (t.criticalTimer >= 80) {
            t.state = "REPLENISHING";
            t.fallingBlocks = [];
            const blocksToOrder = t.maxBlocks - t.currentBlocks;
            for (let b = 0; b < blocksToOrder; b++) {
              t.fallingBlocks.push({
                targetIndex: t.currentBlocks + b,
                y: 165 + b * 28,
                vy: 0,
              });
            }
            particles.push({
              x: worldX,
              y: 95,
              z: worldZ,
              vy: 0.5,
              alpha: 0.95,
              label: `+${blocksToOrder * 40} EOQ`,
              color: "#10b981",
            });
          }
        } else if (t.state === "REPLENISHING") {
          let allLanded = true;
          for (const fb of t.fallingBlocks) {
            const targetY = fb.targetIndex * (BLOCK_HEIGHT + 2);
            if (fb.y > targetY) {
              fb.vy += 0.48;
              fb.y = Math.max(targetY, fb.y - fb.vy);
              allLanded = false;
            }
          }
          if (allLanded) {
            t.currentBlocks = t.maxBlocks;
            t.fallingBlocks = [];
            t.state = "DEPLETING";
            t.depleteTimer = 0;
            t.pulseRing = 0;
          }
        }
      }

      // 3. Sort towers back-to-front (Painter's Algorithm by 3D depth)
      const sortedTowers = [...towers].sort((a, b) => {
        const pa = project((a.gx + 0.5) * SPACING, 0, (a.gz + 0.5) * SPACING);
        const pb = project((b.gx + 0.5) * SPACING, 0, (b.gz + 0.5) * SPACING);
        return pb.depth - pa.depth;
      });

      // 4. Draw each 3D Stock Tower
      for (const t of sortedTowers) {
        const wx = (t.gx + 0.5) * SPACING;
        const wz = (t.gz + 0.5) * SPACING;
        const isLow = t.currentBlocks <= t.ropLevel || t.state === "CRITICAL";
        const isRestocking = t.state === "REPLENISHING";

        // Base slot pad on warehouse floor
        const padHalf = BLOCK_SIZE + 4;
        const b0 = project(wx - padHalf, 0, wz - padHalf);
        const b1 = project(wx + padHalf, 0, wz - padHalf);
        const b2 = project(wx + padHalf, 0, wz + padHalf);
        const b3 = project(wx - padHalf, 0, wz + padHalf);

        ctx.beginPath();
        ctx.moveTo(b0.x, b0.y);
        ctx.lineTo(b1.x, b1.y);
        ctx.lineTo(b2.x, b2.y);
        ctx.lineTo(b3.x, b3.y);
        ctx.closePath();

        if (t.state === "CRITICAL") {
          ctx.fillStyle = isDark ? "rgba(225, 29, 72, 0.24)" : "rgba(225, 29, 72, 0.14)";
          ctx.strokeStyle = "rgba(225, 29, 72, 0.65)";
        } else if (isRestocking) {
          ctx.fillStyle = isDark ? "rgba(16, 185, 129, 0.2)" : "rgba(21, 128, 61, 0.14)";
          ctx.strokeStyle = "rgba(16, 185, 129, 0.6)";
        } else {
          ctx.fillStyle = isDark ? "rgba(255,255,255,0.025)" : "rgba(23,23,23,0.03)";
          ctx.strokeStyle = isDark ? "rgba(255,255,255,0.08)" : "rgba(23,23,23,0.1)";
        }
        ctx.fill();
        ctx.stroke();

        // Expanding 3D shockwave ring when stock is critical / empty
        if (t.state === "CRITICAL" && t.pulseRing > 0) {
          const ringHalf = padHalf + t.pulseRing * 16;
          const r0 = project(wx - ringHalf, 0, wz - ringHalf);
          const r1 = project(wx + ringHalf, 0, wz - ringHalf);
          const r2 = project(wx + ringHalf, 0, wz + ringHalf);
          const r3 = project(wx - ringHalf, 0, wz + ringHalf);
          ctx.beginPath();
          ctx.moveTo(r0.x, r0.y);
          ctx.lineTo(r1.x, r1.y);
          ctx.lineTo(r2.x, r2.y);
          ctx.lineTo(r3.x, r3.y);
          ctx.closePath();
          ctx.strokeStyle = `rgba(225, 29, 72, ${(1 - t.pulseRing) * 0.85})`;
          ctx.lineWidth = 1.1;
          ctx.stroke();
        }

        // Draw Ghost Wireframe of Maximum Capacity
        const maxTopY = t.maxBlocks * (BLOCK_HEIGHT + 2);
        const g0 = project(wx - BLOCK_SIZE, maxTopY, wz - BLOCK_SIZE);
        const g1 = project(wx + BLOCK_SIZE, maxTopY, wz - BLOCK_SIZE);
        const g2 = project(wx + BLOCK_SIZE, maxTopY, wz + BLOCK_SIZE);
        const g3 = project(wx - BLOCK_SIZE, maxTopY, wz + BLOCK_SIZE);
        ctx.beginPath();
        ctx.moveTo(g0.x, g0.y);
        ctx.lineTo(g1.x, g1.y);
        ctx.lineTo(g2.x, g2.y);
        ctx.lineTo(g3.x, g3.y);
        ctx.closePath();
        ctx.strokeStyle = isDark ? "rgba(255,255,255,0.05)" : "rgba(23,23,23,0.06)";
        ctx.lineWidth = 0.7;
        ctx.stroke();

        // Draw standing stock blocks
        for (let b = 0; b < t.currentBlocks; b++) {
          const bottomY = b * (BLOCK_HEIGHT + 2);
          let palette;

          if (isLow) {
            palette = {
              top: isDark ? "#fb7185" : "#f43f5e",
              left: isDark ? "#e11d48" : "#e11d48",
              right: isDark ? "#9f1239" : "#be123c",
              stroke: isDark ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.6)",
            };
          } else {
            const ratio = b / t.maxBlocks;
            if (isDark) {
              const lTop = Math.round(38 + ratio * 42);
              const lLeft = Math.round(24 + ratio * 32);
              const lRight = Math.round(16 + ratio * 22);
              palette = {
                top: `rgb(${lTop}, ${lTop}, ${lTop})`,
                left: `rgb(${lLeft}, ${lLeft}, ${lLeft})`,
                right: `rgb(${lRight}, ${lRight}, ${lRight})`,
                stroke: "rgba(255,255,255,0.12)",
              };
            } else {
              const lTop = Math.round(252 - ratio * 35);
              const lLeft = Math.round(232 - ratio * 45);
              const lRight = Math.round(205 - ratio * 55);
              palette = {
                top: `rgb(${lTop}, ${lTop}, ${lTop})`,
                left: `rgb(${lLeft}, ${lLeft}, ${lLeft})`,
                right: `rgb(${lRight}, ${lRight}, ${lRight})`,
                stroke: "rgba(23,23,23,0.18)",
              };
            }
          }

          drawVoxelBox(wx, bottomY, wz, BLOCK_SIZE, BLOCK_HEIGHT, palette);
        }

        // Draw falling EOQ replenishment blocks
        for (const fb of t.fallingBlocks) {
          const palette = isDark
            ? {
                top: "#f5f5f5",
                left: "#d4d4d4",
                right: "#a3a3a3",
                stroke: "rgba(10,10,10,0.4)",
              }
            : {
                top: "#404040",
                left: "#262626",
                right: "#171717",
                stroke: "rgba(255,255,255,0.35)",
              };
          drawVoxelBox(wx, fb.y, wz, BLOCK_SIZE, BLOCK_HEIGHT, palette);
        }
      }

      // 5. Draw Translucent 3D Reorder Point (ROP) Laser Plane slicing across the grid
      const ropY = 2 * (BLOCK_HEIGHT + 2) + 2;
      const planeExtent = (GRID_SIZE / 2 + 0.35) * SPACING;
      const rp0 = project(-planeExtent, ropY, -planeExtent);
      const rp1 = project(planeExtent, ropY, -planeExtent);
      const rp2 = project(planeExtent, ropY, planeExtent);
      const rp3 = project(-planeExtent, ropY, planeExtent);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(rp0.x, rp0.y);
      ctx.lineTo(rp1.x, rp1.y);
      ctx.lineTo(rp2.x, rp2.y);
      ctx.lineTo(rp3.x, rp3.y);
      ctx.closePath();
      ctx.fillStyle = isDark ? "rgba(225, 29, 72, 0.03)" : "rgba(225, 29, 72, 0.025)";
      ctx.fill();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = isDark ? "rgba(244, 63, 94, 0.4)" : "rgba(225, 29, 72, 0.35)";
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.restore();

      // 6. Update and draw floating 3D telemetry particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.y += pt.vy;
        pt.alpha -= 0.015;
        if (pt.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }
        const proj = project(pt.x, pt.y, pt.z);
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.font = "600 10px 'JetBrains Mono', monospace";
        ctx.fillStyle = pt.color;
        if (pt.label) {
          ctx.fillText(pt.label, proj.x - 12, proj.y);
        }
        ctx.restore();
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
      {/* 3D Interactive Canvas completely in the background */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-75 dark:opacity-65"
      />

      {/* Centered Radial Vignette + Edge Fade so Centered Hero Typography stays razor-sharp */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background:
            "radial-gradient(circle at 50% 46%, rgba(250,250,250,0.88) 0%, rgba(250,250,250,0.68) 38%, rgba(250,250,250,0.32) 72%, rgba(250,250,250,0.85) 100%)",
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            "radial-gradient(circle at 50% 46%, rgba(10,10,10,0.86) 0%, rgba(10,10,10,0.64) 38%, rgba(10,10,10,0.28) 72%, rgba(10,10,10,0.85) 100%)",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#fafafa] dark:from-[#0a0a0a] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#fafafa] dark:from-[#0a0a0a] to-transparent" />
    </div>
  );
};

export default Hero3DBackground;

