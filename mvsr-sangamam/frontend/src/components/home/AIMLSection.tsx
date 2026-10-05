"use client";

import { useState } from "react";
import { soundFx } from "@/utils/audio";
import { Sparkles, Cpu, Layers, Activity, Binary, Network, ArrowRight } from "lucide-react";

interface AIMLSectionProps {
  onOpenRegister: (eventSlug?: string) => void;
}

export default function AIMLSection({ onOpenRegister }: AIMLSectionProps) {
  const [activeLayer, setActiveLayer] = useState<number>(1);
  const [learningRate, setLearningRate] = useState<number>(0.001);
  const [epoch, setEpoch] = useState<number>(42);
  const [loss, setLoss] = useState<number>(0.0142);

  const triggerEpochStep = () => {
    soundFx.playHoverBlip();
    setEpoch((prev) => prev + 1);
    setLoss((prev) => Math.max(0.002, Number((prev * 0.94).toFixed(4))));
  };

  const layers = [
    { name: "INPUT TENSOR", shape: "[32, 512, 768]", nodes: 6, color: "#BCDDDC" },
    { name: "MULTI-HEAD ATTENTION", shape: "[32, 12, 64]", nodes: 8, color: "#CFB97E" },
    { name: "FEED FORWARD DENSE", shape: "[32, 2048]", nodes: 7, color: "#FE9179" },
    { name: "LATENT EMBEDDINGS", shape: "[32, 256]", nodes: 5, color: "#B89D47" },
    { name: "SOFTMAX OUTPUT", shape: "[32, 1000]", nodes: 4, color: "#355E58" },
  ];

  return (
    <section id="aiml" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-[#053229]/30 rounded-full blur-[140px] pointer-events-none" />

      {/* Section Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#CFB97E] font-mono text-xs tracking-[0.3em] uppercase mb-2">
            <Sparkles className="w-4 h-4 text-[#B89D47]" />
            <span>AI // MACHINE INTELLIGENCE LAB</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-cyber text-white tracking-tight">
            BUILD WHAT <span className="text-[#B89D47] italic font-black">THINKS.</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#FFEDD1]/75 max-w-2xl font-sans">
            Push the boundaries of deep neural networks, large language models, computer vision architectures, and autonomous decision systems.
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClickTone();
            onOpenRegister("ai-ml");
          }}
          className="flex items-center gap-3 px-6 py-3.5 rounded-xl font-cyber font-black text-xs sm:text-sm tracking-widest uppercase bg-gradient-to-r from-[#B89D47] via-[#CFB97E] to-[#B89D47] text-black hover:brightness-110 hover:shadow-[0_0_30px_rgba(184,157,71,0.5)] transition-all shrink-0"
        >
          <Cpu className="w-4 h-4 text-black" />
          <span>JOIN AI CHALLENGE</span>
        </button>
      </div>

      {/* Main Neural Lab Workbench */}
      <div className="rounded-3xl border border-[#355E58]/40 bg-[#0A0F16]/95 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(5,50,41,0.25)]">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10 font-mono text-xs text-zinc-300">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#BCDDDC] animate-pulse" />
              <span>MODEL STATUS: </span>
              <span className="text-[#BCDDDC] font-bold">CONVERGING</span>
            </div>
            <span className="text-zinc-600">|</span>
            <div>
              <span>EPOCH: </span>
              <span className="text-[#B89D47] font-bold">{epoch} / 100</span>
            </div>
            <span className="text-zinc-600">|</span>
            <div>
              <span>CROSS-ENTROPY LOSS: </span>
              <span className="text-[#FE9179] font-bold">{loss}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={triggerEpochStep}
              className="px-3.5 py-1.5 rounded-lg border border-[#CFB97E]/40 bg-[#CFB97E]/10 hover:bg-[#CFB97E]/20 text-[#CFB97E] font-bold transition flex items-center gap-1.5"
            >
              <span>TRAIN EPOCH +1</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Interactive Neural Layers Visualization */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {layers.map((layer, idx) => (
            <div
              key={idx}
              onClick={() => {
                soundFx.playHoverBlip();
                setActiveLayer(idx);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-56 ${
                activeLayer === idx
                  ? "border-[#B89D47] bg-[#053229]/60 shadow-[0_0_25px_rgba(184,157,71,0.25)] scale-[1.02]"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <div>
                <div className="text-[10px] font-mono text-[#FFEDD1]/70 uppercase tracking-widest">
                  LAYER {idx + 1}
                </div>
                <div className="text-xs font-cyber font-bold text-white mt-1">
                  {layer.name}
                </div>
                <div className="text-[10px] font-mono text-[#CFB97E] mt-1">
                  {layer.shape}
                </div>
              </div>

              {/* Simulated Nodes Column */}
              <div className="flex flex-col items-center justify-center gap-2 my-auto">
                {Array.from({ length: layer.nodes }).map((_, nIdx) => (
                  <div
                    key={nIdx}
                    className="w-3 h-3 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: layer.color,
                      boxShadow: activeLayer === idx ? `0 0 10px ${layer.color}` : "none",
                      opacity: activeLayer === idx ? 1 : 0.45,
                    }}
                  />
                ))}
              </div>

              <div className="text-[10px] font-mono text-zinc-500 text-center">
                WEIGHTS: {(layer.nodes * 128).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Vector Embeddings and Loss Graph */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/10 font-mono text-xs">
          {/* Vector Space Inspection */}
          <div className="p-4 rounded-xl border border-white/10 bg-black/40">
            <div className="text-zinc-400 mb-2 font-bold flex items-center justify-between">
              <span className="text-[#FFEDD1]">LATENT VECTOR SPACE (PCA 3D)</span>
              <span className="text-[#BCDDDC]">768-D</span>
            </div>
            <div className="h-28 flex items-center justify-center relative overflow-hidden rounded bg-slate-950/60 p-2">
              {Array.from({ length: 32 }).map((_, i) => (
                <span
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-[#CFB97E] animate-pulse"
                  style={{
                    left: `${(i * 19 + 7) % 92}%`,
                    top: `${(i * 31 + 13) % 85}%`,
                    animationDelay: `${i * 0.15}s`,
                    opacity: 0.7,
                  }}
                />
              ))}
              <div className="text-[10px] text-[#FFEDD1] z-10 bg-black/70 px-2 py-1 rounded border border-white/10">
                COSINE SIMILARITY: 0.9842
              </div>
            </div>
          </div>

          {/* Loss Curve Plot */}
          <div className="p-4 rounded-xl border border-white/10 bg-black/40">
            <div className="text-zinc-400 mb-2 font-bold flex items-center justify-between">
              <span className="text-[#FFEDD1]">LOSS CURVE GRADIENT</span>
              <span className="text-[#BCDDDC]">-0.0028/step</span>
            </div>
            <div className="h-28 flex items-end justify-between gap-1 p-2 bg-slate-950/60 rounded">
              {[80, 68, 55, 46, 38, 30, 24, 18, 14, 10, 8, 5].map((val, i) => (
                <div
                  key={i}
                  className="w-full bg-gradient-to-t from-[#053229] via-[#355E58] to-[#B89D47] rounded-t"
                  style={{ height: `${val}%` }}
                />
              ))}
            </div>
          </div>

          {/* Hardware Telemetry */}
          <div className="p-4 rounded-xl border border-white/10 bg-black/40 flex flex-col justify-between">
            <div>
              <div className="text-[#FFEDD1] mb-2 font-bold">COMPUTE ACCELERATOR</div>
              <div className="text-sm font-cyber text-white">NVIDIA H100 SXM5 80GB</div>
              <div className="text-[11px] text-zinc-400 mt-1">
                TENSOR CORES: 528 // FP8 TFLOPS: 3,958
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                <span>VRAM UTILIZATION</span>
                <span className="text-[#CFB97E]">68.4 GB / 80 GB</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#B89D47] w-[85%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
