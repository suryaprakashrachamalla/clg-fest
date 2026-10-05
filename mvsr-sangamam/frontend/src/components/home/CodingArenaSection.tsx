"use client";

import { useState, useEffect } from "react";
import { soundFx } from "@/utils/audio";
import { Code2, Play, Trophy, Clock, CheckCircle2, XCircle, Terminal, Check, Award } from "lucide-react";

interface CodingArenaSectionProps {
  onOpenRegister: (eventSlug?: string) => void;
}

const SAMPLE_CODE = `function solve(matrix: number[][]): number {
  // Optimal DAG path traversal with memoization
  const rows = matrix.length;
  const cols = matrix[0].length;
  const dp: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

  dp[0][0] = matrix[0][0];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (i > 0) dp[i][j] = Math.max(dp[i][j], dp[i - 1][j] + matrix[i][j]);
      if (j > 0) dp[i][j] = Math.max(dp[i][j], dp[i][j - 1] + matrix[i][j]);
    }
  }
  return dp[rows - 1][cols - 1];
}`;

const LEADERBOARD_DATA = [
  { rank: 1, handle: "binary_phantom", college: "MVSR CSE", solved: 12, score: 2400, time: "44m 12s" },
  { rank: 2, handle: "zero_day_ninja", college: "OU College of Eng", solved: 11, score: 2210, time: "51m 08s" },
  { rank: 3, handle: "syntax_error_0x", college: "CBIT CSE", solved: 11, score: 2180, time: "58m 30s" },
  { rank: 4, handle: "algo_queen", college: "VNR VJIET", solved: 10, score: 2010, time: "1h 02m" },
  { rank: 5, handle: "dp_wizard_99", college: "MVSR IT", solved: 10, score: 1980, time: "1h 14m" },
];

export default function CodingArenaSection({ onOpenRegister }: CodingArenaSectionProps) {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [language, setLanguage] = useState("typescript");
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 18 });

  // Countdown timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRunCode = () => {
    soundFx.playClickTone();
    setRunning(true);
    setRunResult(null);

    setTimeout(() => {
      soundFx.playSuccessTone();
      setRunning(false);
      setRunResult("✓ ALL 12 TEST CASES PASSED! Runtime: 14ms | Memory: 16.4 MB (Faster than 98.4%)");
    }, 1200);
  };

  const formatDigits = (n: number) => String(n).padStart(2, "0");

  return (
    <section id="arena" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#053229]/25 rounded-full blur-[140px] pointer-events-none" />

      {/* Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#CFB97E] font-mono text-xs tracking-[0.3em] uppercase mb-2">
            <Code2 className="w-4 h-4 text-[#B89D47]" />
            <span>ALGORITHMIC COMBAT // SPEED PROGRAMMING</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-cyber text-white tracking-tight">
            CODING <span className="text-[#B89D47] italic font-black">ARENA</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#FFEDD1]/75 max-w-2xl font-sans">
            Solve intricate algorithmic challenges under strict time constraints. Battle against top collegiate competitive programmers in real-time.
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClickTone();
            onOpenRegister("coding-arena");
          }}
          className="flex items-center gap-3 px-6 py-3.5 rounded-xl font-cyber font-black text-xs sm:text-sm tracking-widest uppercase bg-gradient-to-r from-[#B89D47] via-[#CFB97E] to-[#B89D47] text-black hover:brightness-110 hover:shadow-[0_0_30px_rgba(184,157,71,0.5)] transition-all shrink-0"
        >
          <Trophy className="w-4 h-4 text-black" />
          <span>ENTER CODING ARENA</span>
        </button>
      </div>

      {/* Arena Telemetry Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <div className="p-4 rounded-xl border border-white/10 bg-[#0A0F16]/90 backdrop-blur-md">
          <div className="text-[10px] font-mono text-[#FFEDD1]/70 uppercase">PROBLEM SET</div>
          <div className="text-2xl font-cyber font-bold text-white mt-1">12 PROBLEMS</div>
        </div>
        <div className="p-4 rounded-xl border border-[#CFB97E]/30 bg-[#0A0F16]/90 backdrop-blur-md">
          <div className="text-[10px] font-mono text-[#CFB97E] uppercase flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>TIME REMAINING</span>
          </div>
          <div className="text-2xl font-mono font-bold text-[#CFB97E] mt-1">
            {formatDigits(timeLeft.hours)}:{formatDigits(timeLeft.minutes)}:{formatDigits(timeLeft.seconds)}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-[#0A0F16]/90 backdrop-blur-md">
          <div className="text-[10px] font-mono text-[#FFEDD1]/70 uppercase">LEADER RANK</div>
          <div className="text-2xl font-cyber font-bold text-[#B89D47] mt-1">RANK #1</div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-[#0A0F16]/90 backdrop-blur-md">
          <div className="text-[10px] font-mono text-[#FFEDD1]/70 uppercase">SUBMISSIONS</div>
          <div className="text-2xl font-cyber font-bold text-[#BCDDDC] mt-1">1,482</div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-[#0A0F16]/90 backdrop-blur-md">
          <div className="text-[10px] font-mono text-[#FFEDD1]/70 uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#CFB97E]" />
            <span>ACCEPTED</span>
          </div>
          <div className="text-2xl font-cyber font-bold text-[#CFB97E] mt-1">1,029</div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-[#0A0F16]/90 backdrop-blur-md">
          <div className="text-[10px] font-mono text-[#FFEDD1]/70 uppercase flex items-center gap-1">
            <XCircle className="w-3 h-3 text-[#FE9179]" />
            <span>FAILED</span>
          </div>
          <div className="text-2xl font-cyber font-bold text-[#FE9179] mt-1">453</div>
        </div>
      </div>

      {/* Interactive Code Editor & Leaderboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stylized Interactive Code Editor (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-[#355E58]/40 bg-[#070B10]/95 p-5 shadow-[0_0_40px_rgba(5,50,41,0.25)] flex flex-col justify-between">
          <div>
            {/* Editor Top Bar */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 font-mono text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B89D47]" />
                <span className="font-bold text-[#FFEDD1]">PROBLEM 04: MAXIMUM_DAG_PATH.ts</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-[#0A0F16] border border-[#355E58]/50 text-[#FFEDD1] rounded px-2 py-1 text-xs focus:outline-none"
                >
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python 3.12</option>
                  <option value="cpp">C++ 20 (GCC)</option>
                  <option value="java">Java 21</option>
                </select>
              </div>
            </div>

            {/* Code Box */}
            <div className="relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-72 bg-[#05070D] border border-white/10 rounded-xl p-4 font-mono text-xs text-[#BCDDDC] leading-relaxed focus:outline-none focus:border-[#CFB97E]/50 resize-none selection:bg-[#B89D47]/30 selection:text-white"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Run Code Action & Judge Result */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-3">
            {runResult && (
              <div className="p-3 rounded-lg bg-[#053229]/70 border border-[#355E58] text-[#BCDDDC] font-mono text-xs animate-fade-in flex items-center gap-2">
                <Check className="w-4 h-4 text-[#CFB97E] shrink-0" />
                <span>{runResult}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-500">
                MEMORY LIMIT: 256MB // TIME LIMIT: 1000ms
              </span>
              <button
                onClick={handleRunCode}
                disabled={running}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono font-black text-xs bg-gradient-to-r from-[#B89D47] via-[#CFB97E] to-[#B89D47] text-black hover:brightness-110 transition shadow-[0_0_20px_rgba(184,157,71,0.4)] disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{running ? "COMPILING & TESTING..." : "RUN CODE"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Leaderboard (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-[#355E58]/35 bg-[#0A0F16]/90 backdrop-blur-xl p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#B89D47]" />
              <span className="font-cyber font-bold text-xs text-white tracking-wider">
                LIVE ARENA LEADERBOARD
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#BCDDDC] bg-[#053229] border border-[#355E58] px-2 py-0.5 rounded">
              SYNCED
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {LEADERBOARD_DATA.map((entry) => (
              <div
                key={entry.rank}
                className={`p-3 rounded-xl border flex items-center justify-between transition ${
                  entry.rank === 1
                    ? "border-[#B89D47]/60 bg-[#053229]/60 shadow-[0_0_20px_rgba(184,157,71,0.2)]"
                    : "border-white/5 bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
                      entry.rank === 1
                        ? "bg-[#B89D47] text-black"
                        : entry.rank === 2
                        ? "bg-[#CFB97E] text-black"
                        : entry.rank === 3
                        ? "bg-[#355E58] text-[#FFEDD1]"
                        : "bg-white/10 text-zinc-400"
                    }`}
                  >
                    #{entry.rank}
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{entry.handle}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500">{entry.college}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[#B89D47] font-bold">{entry.score} PTS</div>
                  <div className="text-[10px] text-zinc-400">{entry.solved} solved ({entry.time})</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
