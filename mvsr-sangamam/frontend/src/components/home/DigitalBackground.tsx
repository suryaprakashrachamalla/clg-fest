"use client";

import { useEffect, useRef } from "react";

const CODE_TOKENS = [
  "01010101",
  "0x1337",
  "0x7F3A",
  "192.168.1.1",
  "HTTP 200",
  "GET /",
  "POST /",
  "sudo",
  "git commit",
  "git push",
  "npm run dev",
  "const",
  "function",
  "class",
  "API",
  "SQL",
  "JSON",
  "TCP",
  "UDP",
  "kernel.panic(0)",
  "0xCAFEBABE",
  "async/await",
];

export default function DigitalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // Subtle floating nodes
    const nodeCount = 45;
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 2 + 1,
      baseAlpha: Math.random() * 0.4 + 0.15,
    }));

    // Floating subtle code tokens
    const tokenCount = 20;
    const activeTokens = Array.from({ length: tokenCount }, (v, i) => ({
      text: CODE_TOKENS[i % CODE_TOKENS.length],
      x: Math.random() * width,
      y: Math.random() * height,
      vy: -0.25 - Math.random() * 0.35,
      alpha: Math.random() * 0.22 + 0.08,
      size: Math.floor(Math.random() * 2) + 10,
    }));

    let mouse = { x: -1000, y: -1000 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove);

    let animationId: number;
    let tick = 0;

    const draw = () => {
      tick += 0.01;
      ctx.clearRect(0, 0, width, height);

      // 1. Subtle moving digital grid waves
      ctx.strokeStyle = "rgba(53, 94, 88, 0.05)";
      ctx.lineWidth = 1;
      const gridSize = 65;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        const waveOffset = Math.sin(tick + y * 0.01) * 3;
        ctx.beginPath();
        ctx.moveTo(0, y + waveOffset);
        ctx.lineTo(width, y + waveOffset);
        ctx.stroke();
      }

      // 2. Subtle environmental tokens
      ctx.font = "11px 'Courier New', monospace";
      activeTokens.forEach((tok) => {
        tok.y += tok.vy;
        if (tok.y < -30) {
          tok.y = height + 20;
          tok.x = Math.random() * width;
          tok.text = CODE_TOKENS[Math.floor(Math.random() * CODE_TOKENS.length)];
        }

        ctx.fillStyle = `rgba(188, 221, 220, ${tok.alpha * 0.6})`;
        ctx.fillText(tok.text, tok.x, tok.y);
      });

      // 3. Glowing nodes & connected lines
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0) n.x = width;
        if (n.x > width) n.x = 0;
        if (n.y < 0) n.y = height;
        if (n.y > height) n.y = 0;

        // Mouse attraction / interaction
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let alpha = n.baseAlpha;
        if (dist < 180) {
          alpha = Math.min(0.9, alpha + (1 - dist / 180) * 0.6);
        }

        ctx.fillStyle = `rgba(184, 157, 71, ${alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Connect near nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const lineAlpha = (1 - dist / 130) * 0.12;
            ctx.strokeStyle = `rgba(53, 94, 88, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#05070D]">
      {/* Dynamic Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Cyber Ambient Radial Lighting - Spruce, Gold & Peacock */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#053229]/30 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-[#B89D47]/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[700px] h-[500px] rounded-full bg-[#355E58]/20 blur-[160px] pointer-events-none" />

      {/* Subtle Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] opacity-30" />
    </div>
  );
}
