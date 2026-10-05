"use client";

import { useState } from "react";
import { soundFx } from "@/utils/audio";
import { Shield, Terminal, Skull, Lock, Unlock, Play, Server, AlertTriangle } from "lucide-react";

interface CybersecurityCTFSectionProps {
  onOpenRegister: (eventSlug?: string) => void;
}

const HEX_DUMP = [
  "00000000  7f 45 4c 46 02 01 01 00  00 00 00 00 00 00 00 00  |.ELF............|",
  "00000010  03 00 3e 00 01 00 00 00  b0 10 00 00 00 00 00 00  |..>.............|",
  "00000020  40 00 00 00 00 00 00 00  c8 3a 00 00 00 00 00 00  |@........:......|",
  "00000030  00 00 00 00 40 00 38 00  0b 00 40 00 1f 00 1e 00  |....@.8...@.....|",
  "00000040  06 00 00 00 04 00 00 00  40 00 00 00 00 00 00 00  |........@.......|",
];

const TARGET_HOSTS = [
  { ip: "10.0.4.12", name: "auth-gateway.core", status: "COMPROMISED", difficulty: "EASY", points: 150 },
  { ip: "10.0.8.44", name: "neural-api.defense", status: "SECURE", difficulty: "MEDIUM", points: 300 },
  { ip: "10.0.12.99", name: "blockchain-vault.pwn", status: "FIREWALLED", difficulty: "HARD", points: 500 },
  { ip: "10.0.16.2", name: "kernel-exploit.root", status: "ARMORED", difficulty: "INSANE", points: 850 },
];

export default function CybersecurityCTFSection({ onOpenRegister }: CybersecurityCTFSectionProps) {
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "> SYSTEM INITIALIZED",
    "> NETWORK ONLINE",
    "> TARGETS: 24",
    "> CHALLENGES: 18",
    "> ACCESS LEVEL: USER",
    "> TYPE 'help' OR SELECT AN ACTION BELOW TO BEGIN INFILTRATION...",
  ]);
  const [inputVal, setInputVal] = useState("");

  const handleCommand = (cmd: string) => {
    soundFx.playClickTone();
    const clean = cmd.trim().toLowerCase();
    const newLogs = [...terminalLogs, `$ ${cmd}`];

    if (clean === "help") {
      newLogs.push(
        "AVAILABLE COMMANDS:",
        "  targets   - List all available target servers",
        "  scan      - Scan subnets for vulnerability vectors",
        "  decrypt   - Decrypt payload memory buffer",
        "  flag      - Submit or display sample flag format",
        "  enter ctf - Launch registration for MVSR CTF arena",
        "  clear     - Clear terminal buffer"
      );
    } else if (clean === "targets" || clean === "scan") {
      newLogs.push(
        "> [SCANNING MESH...] 24 Targets discovered.",
        "> [VULN] auth-gateway.core : SQLi bypass in token verify",
        "> [VULN] neural-api.defense : Prompt jailbreak via zero-width chars",
        "> [VULN] blockchain-vault.pwn : Reentrancy in smart contract #4",
        "> READY FOR ATTACK VECTORS."
      );
    } else if (clean === "decrypt") {
      newLogs.push(
        "> [AES-256-GCM] DECRYPTING BLOCK...",
        "> KEY: 0x94F8A3BC172900FE",
        "> PAYLOAD: SANGAMAM{ZER0_D4Y_EXPLO1T_2026_MVSR}",
        "> STATUS: HASH INTEGRITY VERIFIED (HMAC-SHA256)"
      );
    } else if (clean === "flag") {
      newLogs.push(
        "> FLAG FORMAT: SANGAMAM{<flag_string_here>}",
        "> First blood bonus: +100 bonus pts!"
      );
    } else if (clean === "enter ctf" || clean === "register") {
      newLogs.push("> REDIRECTING TO CTF REGISTRATION PROTOCOL...");
      onOpenRegister("ctf");
    } else if (clean === "clear") {
      setTerminalLogs(["> TERMINAL BUFFER CLEARED."]);
      setInputVal("");
      return;
    } else {
      newLogs.push(`> Command not recognized: '${cmd}'. Type 'help' for instructions.`);
    }

    setTerminalLogs(newLogs);
    setInputVal("");
  };

  return (
    <section id="cybersecurity" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#053229]/25 rounded-full blur-[130px] pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#CFB97E] font-mono text-xs tracking-[0.3em] uppercase mb-2">
            <Shield className="w-4 h-4 text-[#B89D47]" />
            <span>CYBERSECURITY // ZERO-DAY ARENA</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-cyber text-white tracking-tight">
            CAPTURE THE FLAG <span className="text-[#FE9179] italic font-black">(CTF)</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#FFEDD1]/75 max-w-2xl font-sans">
            Infiltrate hardened simulated targets, analyze disassembled binaries, exploit web vectors, and solve cryptographic puzzles in a battle for supremacy.
          </p>
        </div>

        <button
          onClick={() => {
            soundFx.playClickTone();
            onOpenRegister("ctf");
          }}
          className="flex items-center gap-3 px-6 py-3.5 rounded-xl font-cyber font-black text-xs sm:text-sm tracking-widest uppercase bg-gradient-to-r from-[#B89D47] via-[#CFB97E] to-[#B89D47] text-black hover:brightness-110 hover:shadow-[0_0_30px_rgba(184,157,71,0.5)] transition-all shrink-0"
        >
          <Lock className="w-4 h-4 text-black" />
          <span>ENTER CTF ARENA</span>
        </button>
      </div>

      {/* Grid: Interactive Terminal on Left, Target Server Grid & Hex Dump on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Terminal Command Center (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-[#355E58]/40 bg-[#070B10]/95 p-5 shadow-[0_0_40px_rgba(5,50,41,0.25)] flex flex-col justify-between">
          <div>
            {/* Terminal Top Bar */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 font-mono text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FE9179]/90 inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#CFB97E]/90 inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#355E58]/90 inline-block" />
                <span className="ml-2 text-[#FFEDD1]">user@sangamam-ctf:~#</span>
              </div>
              <div className="flex items-center gap-2 text-[#CFB97E]">
                <Terminal className="w-3.5 h-3.5" />
                <span>SHELL: ZSH / TTY1</span>
              </div>
            </div>

            {/* Terminal Output Stream */}
            <div className="font-mono text-xs space-y-2 h-64 overflow-y-auto scrollbar-none pr-2">
              {terminalLogs.map((log, i) => (
                <div
                  key={i}
                  className={`${
                    log.startsWith("$")
                      ? "text-white font-bold"
                      : log.includes("TARGETS:") || log.includes("ONLINE")
                      ? "text-[#BCDDDC]"
                      : log.includes("PAYLOAD") || log.includes("VULN")
                      ? "text-[#FE9179]"
                      : log.includes("KEY:") || log.includes("HASH")
                      ? "text-[#CFB97E]"
                      : "text-zinc-400"
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Shell Input & Quick Buttons */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-[10px] font-mono text-zinc-500">QUICK CMDS:</span>
              <button
                onClick={() => handleCommand("scan")}
                className="px-2.5 py-1 rounded bg-[#053229]/60 border border-[#355E58]/50 hover:border-[#CFB97E] text-[11px] font-mono text-[#BCDDDC] transition"
              >
                $ scan
              </button>
              <button
                onClick={() => handleCommand("decrypt")}
                className="px-2.5 py-1 rounded bg-[#053229]/60 border border-[#355E58]/50 hover:border-[#CFB97E] text-[11px] font-mono text-[#BCDDDC] transition"
              >
                $ decrypt
              </button>
              <button
                onClick={() => handleCommand("flag")}
                className="px-2.5 py-1 rounded bg-[#053229]/60 border border-[#355E58]/50 hover:border-[#CFB97E] text-[11px] font-mono text-[#BCDDDC] transition"
              >
                $ flag
              </button>
              <button
                onClick={() => handleCommand("enter ctf")}
                className="px-2.5 py-1 rounded bg-[#B89D47]/15 border border-[#B89D47]/40 text-[11px] font-mono text-[#CFB97E] font-bold hover:bg-[#B89D47]/25 transition"
              >
                $ enter ctf
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (inputVal) handleCommand(inputVal);
              }}
              className="flex items-center gap-2 bg-[#0A0F16] border border-[#355E58]/40 rounded-xl px-3 py-2"
            >
              <span className="text-[#B89D47] font-mono text-xs">&gt;</span>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Type command ('help', 'scan', 'decrypt', 'enter ctf')..."
                className="w-full bg-transparent text-white font-mono text-xs focus:outline-none placeholder:text-zinc-600"
              />
              <button
                type="submit"
                className="px-3.5 py-1 rounded bg-[#B89D47] text-black text-xs font-mono font-bold hover:bg-[#CFB97E] transition"
              >
                RUN
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Active Targets & Memory Hex Dump (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Active Targets List */}
          <div className="rounded-2xl border border-[#355E58]/35 bg-[#0A0F16]/90 backdrop-blur-xl p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <span className="font-cyber font-bold text-xs text-white tracking-wider">
                LIVE TARGET TOPOLOGY
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#053229] text-[#BCDDDC] border border-[#355E58]">
                24 ACTIVE
              </span>
            </div>

            <div className="space-y-2.5">
              {TARGET_HOSTS.map((target, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/[0.02] hover:border-[#CFB97E]/40 transition text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    <Server className="w-3.5 h-3.5 text-[#B89D47]" />
                    <div>
                      <div className="text-white font-bold">{target.name}</div>
                      <div className="text-zinc-500 text-[10px]">{target.ip}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        target.status === "COMPROMISED"
                          ? "bg-[#FE9179]/15 text-[#FE9179] border border-[#FE9179]/30"
                          : "bg-[#053229] text-[#BCDDDC] border border-[#355E58]"
                      }`}
                    >
                      {target.status}
                    </span>
                    <div className="text-[10px] text-[#CFB97E] mt-0.5 font-bold">+{target.points} PTS</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hex Memory Stream Inspector */}
          <div className="rounded-2xl border border-[#355E58]/30 bg-[#070B10] p-5">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10 text-xs font-mono text-zinc-400">
              <span className="text-[#FFEDD1]">HEX DUMP // ELF_HEADER</span>
              <span className="text-[#CFB97E] text-[10px]">OFFSET 0x00</span>
            </div>
            <div className="font-mono text-[10px] sm:text-[11px] text-zinc-400 leading-relaxed overflow-x-auto select-all">
              {HEX_DUMP.map((line, idx) => (
                <div key={idx} className="hover:text-[#CFB97E] transition">
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
