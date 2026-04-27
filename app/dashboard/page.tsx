"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ActivityIcon,
  BugIcon,
  ChevronRightIcon,
  CpuIcon,
  DatabaseIcon,
  FileSearchIcon,
  GlobeIcon,
  HardDriveIcon,
  KeyIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  NetworkIcon,
  PlusIcon,
  RadioIcon,
  SearchIcon,
  ServerIcon,
  ShieldAlertIcon,
  ShieldIcon,
  TerminalIcon,
  WifiIcon,
  ZapIcon,
  CircleIcon,
} from "lucide-react";
import { getSessions } from "@/lib/pentest/session-store";
import type { PentestSession } from "@/lib/pentest/types";
import { PHASE_LABELS } from "@/lib/pentest/types";
import { cn } from "@/lib/utils";

/* ── Simulated system stats ───────────────────────────────────── */
function useStats() {
  const [cpu, setCpu] = useState(34);
  const [ram, setRam] = useState(61);
  const [netUp, setNetUp] = useState(1.2);
  const [netDn, setNetDn] = useState(4.8);
  const [disk, setDisk] = useState(47);
  const [sessions, setSessions] = useState(2);

  useEffect(() => {
    const id = setInterval(() => {
      setCpu((v) => Math.min(98, Math.max(8, v + (Math.random() - 0.48) * 8)));
      setRam((v) => Math.min(95, Math.max(40, v + (Math.random() - 0.5) * 3)));
      setNetUp((v) => Math.max(0.1, +(v + (Math.random() - 0.5) * 0.6).toFixed(1)));
      setNetDn((v) => Math.max(0.2, +(v + (Math.random() - 0.5) * 1.2).toFixed(1)));
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return { cpu, ram, netUp, netDn, disk, sessions };
}

/* ── Kali tool definitions ────────────────────────────────────── */
const TOOLS = [
  { id: "nmap", name: "Nmap", desc: "Network scanner", icon: NetworkIcon, color: "#367BF0", category: "Network" },
  { id: "sqlmap", name: "SQLMap", desc: "SQL injection", icon: DatabaseIcon, color: "#f97316", category: "Web" },
  { id: "wpscan", name: "WPScan", desc: "WordPress audit", icon: GlobeIcon, color: "#a855f7", category: "Web" },
  { id: "ffuf", name: "ffuf", desc: "Web fuzzer", icon: SearchIcon, color: "#22c55e", category: "Web" },
  { id: "medusa", name: "Medusa", desc: "Brute force", icon: KeyIcon, color: "#ef4444", category: "Password" },
  { id: "hydra", name: "Hydra", desc: "Login cracker", icon: ZapIcon, color: "#eab308", category: "Password" },
  { id: "metasploit", name: "Metasploit", desc: "Exploit framework", icon: BugIcon, color: "#ec4899", category: "Exploit" },
  { id: "wireshark", name: "Wireshark", desc: "Packet analysis", icon: RadioIcon, color: "#06b6d4", category: "Network" },
  { id: "gobuster", name: "Gobuster", desc: "Dir/DNS brute", icon: FileSearchIcon, color: "#84cc16", category: "Web" },
  { id: "aircrack", name: "Aircrack-ng", desc: "WiFi auditing", icon: WifiIcon, color: "#f59e0b", category: "Wireless" },
  { id: "autopsy", name: "Autopsy", desc: "Digital forensics", icon: HardDriveIcon, color: "#8b5cf6", category: "Forensics" },
  { id: "pentest", name: "Auto-Pentest", desc: "AI pentest agent", icon: ShieldIcon, color: "#367BF0", category: "AI" },
];

const CATEGORIES = ["All", "Network", "Web", "Password", "Exploit", "Wireless", "Forensics", "AI"];

/* ── Mock activity log ────────────────────────────────────────── */
const INITIAL_LOGS = [
  { time: "13:42:11", msg: "nmap scan completed — 192.168.1.0/24", level: "ok" },
  { time: "13:39:05", msg: "sqlmap: 2 injection points found on /login", level: "warn" },
  { time: "13:31:58", msg: "ffuf: 47 valid paths discovered", level: "ok" },
  { time: "13:28:34", msg: "wpscan: 3 vulnerable plugins detected", level: "warn" },
  { time: "13:15:22", msg: "SSH brute force attempt blocked — 10.0.0.5", level: "error" },
  { time: "13:02:09", msg: "Pentest session #A4F2 initiated", level: "info" },
  { time: "12:58:44", msg: "Autopsy: forensic image mounted successfully", level: "ok" },
  { time: "12:44:17", msg: "Metasploit: CVE-2023-0386 payload staged", level: "warn" },
];

/* ── Stat bar ─────────────────────────────────────────────────── */
function StatBar({ value, color = "#367BF0" }: { value: number; color?: string }) {
  return (
    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
      <motion.div
        animate={{ width: `${value}%` }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { cpu, ram, netUp, netDn, disk, sessions } = useStats();
  const [activeCategory, setActiveCategory] = useState("All");
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [time, setTime] = useState("");
  const [pentestSessions, setPentestSessions] = useState<PentestSession[]>([]);

  useEffect(() => {
    setPentestSessions(getSessions().slice(0, 3));
  }, []);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Randomly push fake log entries
  useEffect(() => {
    const NEW_EVENTS = [
      { msg: "Port scan — 10.0.0.100:22 open", level: "info" },
      { msg: "HTTP 200 on /admin — credentials valid", level: "warn" },
      { msg: "Reverse shell established — 10.10.14.3:4444", level: "ok" },
      { msg: "DNS lookup: target.local resolved", level: "info" },
      { msg: "Privilege escalation attempt detected", level: "error" },
    ];
    const id = setInterval(() => {
      const evt = NEW_EVENTS[Math.floor(Math.random() * NEW_EVENTS.length)];
      const t = new Date().toLocaleTimeString("en-US", { hour12: false });
      setLogs((prev) => [{ time: t, msg: evt.msg, level: evt.level }, ...prev.slice(0, 14)]);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const filteredTools =
    activeCategory === "All"
      ? TOOLS
      : TOOLS.filter((t) => t.category === activeCategory);

  const levelColor: Record<string, string> = {
    ok: "text-[#22c55e]",
    warn: "text-[#f59e0b]",
    error: "text-[#ef4444]",
    info: "text-[#367BF0]",
  };

  const levelDot: Record<string, string> = {
    ok: "bg-[#22c55e]",
    warn: "bg-[#f59e0b]",
    error: "bg-[#ef4444]",
    info: "bg-[#367BF0]",
  };

  return (
    <div className="min-h-dvh bg-[#060810] font-mono text-gray-200">
      {/* ── Top nav ── */}
      <header className="sticky top-0 z-50 border-b border-[#367BF0]/20 bg-[#060810]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-screen-xl items-center gap-4 px-4 py-3">
          {/* Logo */}
          <Link className="flex items-center gap-2.5 mr-2" href="/dashboard">
            <div className="flex size-7 items-center justify-center rounded border border-[#367BF0]/40 bg-[#367BF0]/10">
              <ShieldIcon className="size-4 text-[#367BF0]" />
            </div>
            <span className="text-sm font-semibold tracking-widest text-[#367BF0] uppercase hidden sm:block">
              Kali AI
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1 text-xs">
            <Link
              className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[#367BF0] bg-[#367BF0]/10 border border-[#367BF0]/25"
              href="/dashboard"
            >
              <LayoutDashboardIcon className="size-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link
              className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-white/5 hover:text-gray-300"
              href="/"
            >
              <TerminalIcon className="size-3.5" />
              <span className="hidden sm:inline">AI Terminal</span>
            </Link>
            <Link
              className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
              href="/pentest"
            >
              <ShieldAlertIcon className="size-3.5" />
              <span className="hidden sm:inline">Pentest</span>
            </Link>
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-4 text-xs text-gray-600">
            <div className="hidden sm:flex items-center gap-1.5">
              <CircleIcon className="size-1.5 fill-[#22c55e] text-[#22c55e] animate-pulse" />
              <span className="text-[#22c55e]">ONLINE</span>
            </div>
            <span className="tabular-nums text-[#367BF0]/60">{time}</span>
            <Link
              className="flex items-center gap-1.5 text-gray-600 transition-colors hover:text-gray-300"
              href="/login"
            >
              <LogOutIcon className="size-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl space-y-5 p-4 md:p-6">
        {/* ── System stats row ── */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3 md:grid-cols-4"
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.4 }}
        >
          {/* CPU */}
          <div className="rounded border border-[#367BF0]/20 bg-[#0a0f1e] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <CpuIcon className="size-3.5 text-[#367BF0]" />
                CPU
              </div>
              <span
                className={cn(
                  "text-lg font-bold tabular-nums",
                  cpu > 80 ? "text-[#ef4444]" : cpu > 60 ? "text-[#f59e0b]" : "text-[#22c55e]"
                )}
              >
                {Math.round(cpu)}%
              </span>
            </div>
            <StatBar color={cpu > 80 ? "#ef4444" : cpu > 60 ? "#f59e0b" : "#22c55e"} value={cpu} />
          </div>

          {/* RAM */}
          <div className="rounded border border-[#367BF0]/20 bg-[#0a0f1e] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <ServerIcon className="size-3.5 text-[#367BF0]" />
                RAM
              </div>
              <span
                className={cn(
                  "text-lg font-bold tabular-nums",
                  ram > 85 ? "text-[#ef4444]" : ram > 65 ? "text-[#f59e0b]" : "text-[#22c55e]"
                )}
              >
                {Math.round(ram)}%
              </span>
            </div>
            <StatBar color={ram > 85 ? "#ef4444" : ram > 65 ? "#f59e0b" : "#22c55e"} value={ram} />
          </div>

          {/* Network */}
          <div className="rounded border border-[#367BF0]/20 bg-[#0a0f1e] p-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <ActivityIcon className="size-3.5 text-[#367BF0]" />
              Network
            </div>
            <div className="space-y-0.5 text-xs tabular-nums">
              <div className="flex justify-between">
                <span className="text-gray-600">↑</span>
                <span className="text-[#22c55e]">{netUp.toFixed(1)} MB/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">↓</span>
                <span className="text-[#367BF0]">{netDn.toFixed(1)} MB/s</span>
              </div>
            </div>
          </div>

          {/* Disk + Sessions */}
          <div className="rounded border border-[#367BF0]/20 bg-[#0a0f1e] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <HardDriveIcon className="size-3.5 text-[#367BF0]" />
                Disk
              </div>
              <span className="text-sm font-bold text-gray-300 tabular-nums">{disk}%</span>
            </div>
            <StatBar color="#367BF0" value={disk} />
            <div className="mt-3 flex items-center gap-1.5 text-xs">
              <ShieldIcon className="size-3 text-[#22c55e]" />
              <span className="text-gray-600">Sessions:</span>
              <span className="text-[#22c55e] font-bold">{sessions}</span>
            </div>
          </div>
        </motion.div>

        {/* ── Main grid ── */}
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          {/* ── Tools panel ── */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="rounded border border-[#367BF0]/20 bg-[#0a0f1e]"
            initial={{ opacity: 0, y: 8 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-[#367BF0]/15 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-[#367BF0]">
                <ZapIcon className="size-4" />
                <span className="tracking-wider uppercase text-xs">Kali Toolbox</span>
              </div>
              <Link
                className="flex items-center gap-1 text-[10px] text-gray-600 transition-colors hover:text-[#367BF0]"
                href="/"
              >
                Open Terminal
                <ChevronRightIcon className="size-3" />
              </Link>
            </div>

            {/* Category filter */}
            <div className="flex gap-1 overflow-x-auto border-b border-[#367BF0]/10 px-4 py-2 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={cn(
                    "shrink-0 rounded px-2.5 py-1 text-[11px] tracking-wide uppercase transition-all",
                    activeCategory === cat
                      ? "bg-[#367BF0]/20 text-[#367BF0] border border-[#367BF0]/35"
                      : "text-gray-600 hover:text-gray-400 hover:bg-white/5"
                  )}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Tool grid */}
            <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 md:grid-cols-4">
              {filteredTools.map((tool, i) => {
                const Icon = tool.icon;
                return (
                  <motion.div
                    key={tool.id}
                    animate={{ opacity: 1, scale: 1 }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                  >
                    <Link
                      className="group flex flex-col gap-2 rounded border border-white/5 bg-white/[0.02] p-3 transition-all hover:border-[#367BF0]/30 hover:bg-[#367BF0]/5 hover:shadow-[0_0_12px_rgba(54,123,240,0.1)]"
                      href={`/?tool=${tool.id}`}
                    >
                      <Icon className="size-5 transition-colors" style={{ color: tool.color }} />
                      <div>
                        <div className="text-xs font-semibold text-gray-200 group-hover:text-white">
                          {tool.name}
                        </div>
                        <div className="text-[10px] text-gray-600 leading-tight">{tool.desc}</div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* ── Right column ── */}
          <div className="space-y-4">
            {/* Pentest Engagements */}
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="rounded border border-[#367BF0]/20 bg-[#0a0f1e]"
              initial={{ opacity: 0, y: 8 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <div className="flex items-center gap-2 border-b border-[#367BF0]/15 px-4 py-3 text-xs text-[#367BF0]">
                <ShieldAlertIcon className="size-3.5" />
                <span className="tracking-wider uppercase">Pentest Engagements</span>
                <Link
                  href="/pentest"
                  className="ml-auto flex items-center gap-1 text-[10px] text-gray-600 hover:text-[#367BF0] transition-colors"
                >
                  <PlusIcon className="size-3" />
                  New
                </Link>
              </div>
              {pentestSessions.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-[11px] text-gray-700 mb-2">No engagements yet</p>
                  <Link
                    href="/pentest"
                    className="text-[11px] text-[#367BF0]/60 hover:text-[#367BF0] transition-colors"
                  >
                    Start a pentest →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-white/5 px-4">
                  {pentestSessions.map((sess) => (
                    <div key={sess.id} className="flex items-start justify-between py-3">
                      <div className="space-y-0.5 min-w-0 flex-1 mr-2">
                        <div className="text-[11px] font-semibold text-gray-300 truncate">{sess.config.name}</div>
                        <div className="text-[10px] text-gray-600">{sess.config.targetNetwork}</div>
                        <div className="text-[10px] text-[#367BF0]/70">{PHASE_LABELS[sess.activePhase]}</div>
                      </div>
                      <Link
                        className="shrink-0 rounded border border-[#367BF0]/20 px-2 py-1 text-[10px] text-[#367BF0]/60 transition-colors hover:border-[#367BF0]/40 hover:text-[#367BF0]"
                        href={`/pentest/${sess.id}`}
                      >
                        Resume
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Activity log */}
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="rounded border border-[#367BF0]/20 bg-[#0a0f1e]"
              initial={{ opacity: 0, y: 8 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="flex items-center gap-2 border-b border-[#367BF0]/15 px-4 py-3 text-xs text-[#367BF0]">
                <ActivityIcon className="size-3.5" />
                <span className="tracking-wider uppercase">Activity Log</span>
                <span className="ml-auto size-1.5 animate-pulse rounded-full bg-[#22c55e]" />
              </div>
              <div className="max-h-64 overflow-y-auto px-3 py-2 space-y-0.5">
                {logs.map((log, i) => (
                  <motion.div
                    key={`${log.time}-${i}`}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2 py-1 text-[10px] leading-relaxed"
                    initial={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span
                      className={cn(
                        "mt-[3px] size-1.5 shrink-0 rounded-full",
                        levelDot[log.level]
                      )}
                    />
                    <span className="shrink-0 tabular-nums text-gray-700">{log.time}</span>
                    <span className={cn("min-w-0", levelColor[log.level])}>{log.msg}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Footer status bar ── */}
        <div className="flex items-center justify-between border-t border-[#367BF0]/10 pt-3 text-[10px] text-gray-700">
          <span>
            root@kali-ai <span className="text-gray-800">|</span> Kali AI Terminal v2.0.0
          </span>
          <div className="flex items-center gap-4">
            <span>MCP: <span className="text-[#22c55e]">CONNECTED</span></span>
            <span>AI: <span className="text-[#22c55e]">READY</span></span>
            <span className="tabular-nums text-[#367BF0]/50">{time}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
