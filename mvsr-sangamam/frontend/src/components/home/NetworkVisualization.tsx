"use client";

import { useEffect, useRef, useState } from "react";
import { soundFx } from "@/utils/audio";
import { Cpu, Network, ShieldCheck, Database, Cloud, Code2, Globe, Server } from "lucide-react";

interface NodeItem {
  id: string;
  name: string;
  desc: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  icon: string;
  category: "TECHNICAL" | "SEMITECHNICAL";
}

const INITIAL_NODES: Omit<NodeItem, "x" | "y" | "vx" | "vy">[] = [
  { id: "ai", name: "AI", desc: "Neural Architectures & Deep Learning Models", radius: 36, color: "#8b5cf6", icon: "AI", category: "TECHNICAL" },
  { id: "web", name: "WEB", desc: "Next-Gen Fullstack & Distributed Web", radius: 32, color: "#00f0ff", icon: "WEB", category: "TECHNICAL" },
  { id: "cyber", name: "CYBER", desc: "Zero-Trust Exploitation & CTF Arena", radius: 36, color: "#06b6d4", icon: "CYBER", category: "TECHNICAL" },
  { id: "cloud", name: "CLOUD", desc: "Hyperscale Infrastructure & Microservices", radius: 30, color: "#3b82f6", icon: "CLOUD", category: "TECHNICAL" },
  { id: "data", name: "DATA", desc: "Data Science, Embeddings & Vector Search", radius: 30, color: "#ec4899", icon: "DATA", category: "TECHNICAL" },
  { id: "code", name: "CODE", desc: "Competitive Algorithms & Complexity Theory", radius: 34, color: "#10b981", icon: "CODE", category: "TECHNICAL" },
  { id: "systems", name: "SYSTEMS", desc: "Robotics, Embedded Firmware & IoT Hubs", radius: 34, color: "#f59e0b", icon: "SYS", category: "SEMITECHNICAL" },
  { id: "networks", name: "NETWORKS", desc: "Mesh Topologies, Protocols & Packets", radius: 32, color: "#6366f1", icon: "NET", category: "TECHNICAL" },
];

export default function NetworkVisualization({ onSelectCategory }: { onSelectCategory?: (cat: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<NodeItem | null>(null);
  const nodesRef = useRef<NodeItem[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = 480);

    const onResize = () => {
      if (canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
      }
    };
    window.addEventListener("resize", onResize);

    // Initialize node positions in a circular topological graph layout
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.36;

    nodesRef.current = INITIAL_NODES.map((item, idx) => {
      const angle = (idx / INITIAL_NODES.length) * Math.PI * 2;
      return {
        ...item,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      };
    });

    // Traveling packet particles across lines
    const packets = Array.from({ length: 18 }, () => ({
      from: Math.floor(Math.random() * nodesRef.current.length),
      to: Math.floor(Math.random() * nodesRef.current.length),
      progress: Math.random(),
      speed: 0.005 + Math.random() * 0.008,
    }));

    let mouse = { x: -1000, y: -1000 };
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;

      let found: NodeItem | null = null;
      for (const n of nodesRef.current) {
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        if (Math.sqrt(dx * dx + dy * dy) < n.radius + 10) {
          found = n;
          break;
        }
      }
      if (found !== hoveredNode) {
        if (found) soundFx.playHoverBlip();
        setHoveredNode(found);
      }
    };

    const onClick = () => {
      if (hoveredNode && onSelectCategory) {
        soundFx.playClickTone();
        onSelectCategory(hoveredNode.category);
      }
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("click", onClick);

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const nodes = nodesRef.current;

      // Update positions with gentle drift and bounds
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;

        // Soft bounce within boundary
        if (n.x < n.radius + 20 || n.x > width - n.radius - 20) n.vx *= -1;
        if (n.y < n.radius + 20 || n.y > height - n.radius - 20) n.vy *= -1;

        // Mouse gentle repulsion / interaction
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140 && dist > 0) {
          const force = (1 - dist / 140) * 0.8;
          n.x -= (dx / dist) * force;
          n.y -= (dy / dist) * force;
        }
      });

      // Draw connection lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Check if mouse is near line or nodes
          const mouseNear =
            Math.sqrt((mouse.x - n1.x) ** 2 + (mouse.y - n1.y) ** 2) < 150 ||
            Math.sqrt((mouse.x - n2.x) ** 2 + (mouse.y - n2.y) ** 2) < 150;

          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);

          if (mouseNear) {
            ctx.strokeStyle = "rgba(0, 240, 255, 0.45)";
            ctx.lineWidth = 1.8;
          } else {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
            ctx.lineWidth = 1;
          }
          ctx.stroke();
        }
      }

      // Draw traveling packet particles along connections
      packets.forEach((p) => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          p.progress = 0;
          p.from = Math.floor(Math.random() * nodes.length);
          p.to = (p.from + 1 + Math.floor(Math.random() * (nodes.length - 1))) % nodes.length;
        }

        const n1 = nodes[p.from];
        const n2 = nodes[p.to];
        if (n1 && n2) {
          const px = n1.x + (n2.x - n1.x) * p.progress;
          const py = n1.y + (n2.y - n1.y) * p.progress;

          ctx.fillStyle = "#00f0ff";
          ctx.shadowColor = "#00f0ff";
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Draw Nodes
      nodes.forEach((n) => {
        const isHovered = hoveredNode?.id === n.id;

        // Outer glow
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + (isHovered ? 12 : 5), 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? "rgba(0, 240, 255, 0.2)" : "rgba(10, 15, 28, 0.6)";
        ctx.fill();

        // Node circle border
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#0A0F1C";
        ctx.fill();
        ctx.lineWidth = isHovered ? 2.5 : 1.5;
        ctx.strokeStyle = isHovered ? "#00f0ff" : n.color;
        ctx.stroke();

        // Node label
        ctx.font = `bold 11px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isHovered ? "#ffffff" : "#e2e8f0";
        ctx.fillText(n.name, n.x, n.y);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("click", onClick);
      cancelAnimationFrame(animId);
    };
  }, [hoveredNode, onSelectCategory]);

  return (
    <div className="relative w-full rounded-2xl border border-white/10 bg-[#0A0F1C]/70 backdrop-blur-xl p-6 overflow-hidden">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950/60 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-cyber font-bold text-white text-base tracking-wide flex items-center gap-2">
              INTERACTIVE DIGITAL TOPOLOGY
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/30">
                LIVE BUS
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Hover nodes to inspect computing domains. Traveling packets illuminate network throughput.
            </p>
          </div>
        </div>

        {/* Hovered Node Telemetry Pill */}
        {hoveredNode && (
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-cyan-400/40 bg-cyan-950/60 text-xs font-mono text-cyan-300 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-bold text-white">{hoveredNode.name}:</span>
            <span className="text-zinc-300">{hoveredNode.desc}</span>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="relative w-full h-[480px]">
        <canvas ref={canvasRef} className="w-full h-full cursor-pointer" />
      </div>

      {/* Footer System Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-2 border-t border-white/[0.08] text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff]" />
            <span>PRIMARY CORE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]" />
            <span>AI / NEURAL</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
            <span>EMBEDDED / HARDWARE</span>
          </div>
        </div>
        <div>
          <span>PACKET PROTOCOL: </span>
          <span className="text-cyan-400">TCP/IP MESH v6</span>
        </div>
      </div>
    </div>
  );
}
