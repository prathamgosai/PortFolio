"use client";

import { useEffect, useRef } from "react";

/**
 * The living data layer behind every glass panel: a drifting node mesh with
 * packets travelling the links, plus floating IPv4 labels.
 *
 * Everything the glass refracts lives here, on a single fixed canvas at z=-1.
 * It is deliberately the ONLY animated canvas on the page — the glass panels
 * above it are pure CSS, so the per-frame cost stays flat as sections are
 * added. Node count scales with viewport area and drops to zero under
 * prefers-reduced-motion.
 */

type Node = { x: number; y: number; vx: number; vy: number; hue: string };
type Packet = { a: number; b: number; t: number; speed: number; hue: string };

const HUES = ["#00f0ff", "#0078d4", "#8b5cf6", "#00ff88"];
const LINK_DIST = 168;

export function NetworkCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Cap DPR at 2: beyond that we pay 2x fill rate for no visible gain.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let nodes: Node[] = [];
    let packets: Packet[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Mobile gets a much sparser mesh — link-finding is O(n²).
      const target = w < 768 ? 26 : Math.min(96, Math.round((w * h) / 20000));
      nodes = Array.from({ length: target }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        hue: HUES[Math.floor(Math.random() * HUES.length)],
      }));
      packets = Array.from({ length: w < 768 ? 8 : 22 }, () => spawnPacket());
    }

    function spawnPacket(): Packet {
      const a = Math.floor(Math.random() * Math.max(nodes.length, 1));
      const b = Math.floor(Math.random() * Math.max(nodes.length, 1));
      return {
        a,
        b,
        t: Math.random(),
        speed: 0.0016 + Math.random() * 0.0035,
        hue: Math.random() > 0.75 ? "#00ff88" : "#00f0ff",
      };
    }

    function frame() {
      ctx!.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      // Links. Opacity falls off with distance, and rises near the cursor —
      // the mesh "strengthens" where the user is looking.
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK_DIST * LINK_DIST) continue;

          const d = Math.sqrt(d2);
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const near = Math.hypot(mx - mouse.x, my - mouse.y);
          const boost = near < 200 ? 1 - near / 200 : 0;

          ctx!.globalAlpha = (1 - d / LINK_DIST) * (0.13 + boost * 0.5);
          ctx!.strokeStyle = boost > 0.25 ? "#00f0ff" : "#3f5a72";
          ctx!.lineWidth = 0.7;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y);
          ctx!.lineTo(b.x, b.y);
          ctx!.stroke();
        }
      }

      // Nodes.
      for (const n of nodes) {
        const near = Math.hypot(n.x - mouse.x, n.y - mouse.y);
        const glow = near < 190 ? 1 - near / 190 : 0;
        ctx!.globalAlpha = 0.35 + glow * 0.65;
        ctx!.fillStyle = n.hue;
        ctx!.shadowBlur = 8 + glow * 16;
        ctx!.shadowColor = n.hue;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, 1.2 + glow * 1.8, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.shadowBlur = 0;

      // Packets in flight along their link.
      for (const p of packets) {
        const a = nodes[p.a];
        const b = nodes[p.b];
        if (!a || !b) continue;
        p.t += p.speed;
        if (p.t > 1) {
          Object.assign(p, spawnPacket(), { t: 0 });
          continue;
        }
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        ctx!.globalAlpha = 0.85;
        ctx!.fillStyle = p.hue;
        ctx!.shadowBlur = 10;
        ctx!.shadowColor = p.hue;
        ctx!.beginPath();
        ctx!.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx!.fill();
      }

      ctx!.shadowBlur = 0;
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    function onMove(e: PointerEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }

    resize();
    window.addEventListener("resize", resize);

    if (reduced) {
      // Draw the mesh once, statically, and stop. Still gives depth behind the
      // glass without any motion.
      frame();
      cancelAnimationFrame(raf);
    } else {
      window.addEventListener("pointermove", onMove, { passive: true });
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-[1] h-full w-full"
    />
  );
}
