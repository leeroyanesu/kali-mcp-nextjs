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
  SunIcon,
  MoonIcon,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSessions } from "@/lib/pentest/session-store";
import type { PentestSession } from "@/lib/pentest/types";
import { PHASE_LABELS } from "@/lib/pentest/types";
import { checkMcpStatus } from "./actions";
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
  { id: "nmap", name: "Nmap", desc: "Network scanning and service detection", icon: NetworkIcon, color: "#367BF0", category: "Network" },
  { id: "sqlmap", name: "SQLMap", desc: "SQL injection testing and exploitation", icon: DatabaseIcon, color: "#f97316", category: "Web" },
  { id: "nikto", name: "Nikto", desc: "Web server vulnerability scanning", icon: ShieldAlertIcon, color: "#ef4444", category: "Web" },
  { id: "gobuster", name: "Gobuster", desc: "Directory and file brute-forcing", icon: FileSearchIcon, color: "#84cc16", category: "Web" },
  { id: "dirb", name: "Dirb", desc: "Web content scanner", icon: SearchIcon, color: "#eab308", category: "Web" },
  { id: "wpscan", name: "WPScan", desc: "WordPress security scanner", icon: GlobeIcon, color: "#a855f7", category: "Web" },
  { id: "ffuf", name: "ffuf", desc: "Fast web fuzzer for directories/vhosts/parameters", icon: ZapIcon, color: "#22c55e", category: "Web" },
  { id: "metasploit", name: "Metasploit", desc: "Exploitation framework integration", icon: BugIcon, color: "#ec4899", category: "Exploit" },
  { id: "hydra", name: "Hydra", desc: "Network login cracker", icon: ActivityIcon, color: "#06b6d4", category: "Password" },
  { id: "medusa", name: "Medusa", desc: "Parallel password cracker", icon: KeyIcon, color: "#ef4444", category: "Password" },
  { id: "john", name: "John the Ripper", desc: "Password hash cracker", icon: KeyIcon, color: "#f59e0b", category: "Password" },
  { id: "enum4linux", name: "Enum4linux", desc: "SMB/Windows enumeration", icon: ServerIcon, color: "#8b5cf6", category: "Network" },
];

const CATEGORIES = ["All", "Network", "Web", "Password", "Exploit"];

/* ── Mock activity log ────────────────────────────────────────── */
const INITIAL_LOGS: Array<{ time: string; msg: string; level: string }> = [];

/* ── Stat bar ─────────────────────────────────────────────────── */
function StatBar({ value, color = "#367BF0" }: { value: number; color?: string }) {
  return (
    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-primary/5 dark:bg-white/5">
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
  const [mcpConnected, setMcpConnected] = useState(false);

  useEffect(() => {
    async function pingMcp() {
      const status = await checkMcpStatus();
      setMcpConnected(status.connected);
    }
    pingMcp();
    const id = setInterval(pingMcp, 5000);
    return () => clearInterval(id);
  }, []);

  const filteredTools =
    activeCategory === "All"
      ? TOOLS
      : TOOLS.filter((t) => t.category === activeCategory);

  const levelColor: Record<string, string> = {
    ok: "text-green-500",
    warn: "text-yellow-500",
    error: "text-red-500",
    info: "text-primary",
  };

  const levelDot: Record<string, string> = {
    ok: "bg-green-500",
    warn: "bg-yellow-500",
    error: "bg-red-500",
    info: "bg-primary",
  };

  return (
    <div className="min-h-dvh bg-background font-mono text-foreground transition-colors duration-300">
      {/* ── Top nav ── */}
      <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-screen-xl items-center gap-4 px-4 py-3">
          {/* Logo */}
          <Link className="flex items-center gap-2.5 mr-2" href="/dashboard">
            <div className="flex size-7 items-center justify-center rounded border border-primary/40 bg-primary/10">
              <ShieldIcon className="size-4 text-primary" />
            </div>
            <span className="text-sm font-semibold tracking-widest text-primary uppercase hidden sm:block">
              Kali AI
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1 text-xs">
            <Link
              className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-primary bg-primary/10 border border-primary/25"
              href="/dashboard"
            >
              <LayoutDashboardIcon className="size-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            {/* <Link
              className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-white/5 hover:text-gray-300"
              href="/"
            >
              <TerminalIcon className="size-3.5" />
              <span className="hidden sm:inline">AI Terminal</span>
            </Link> */}
            <Link
              className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
              href="/pentest"
            >
              <ShieldAlertIcon className="size-3.5" />
              <span className="hidden sm:inline">Pentest</span>
            </Link>
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-1.5">
              <CircleIcon className="size-1.5 fill-green-500 text-green-500 animate-pulse" />
              <span className="text-green-500">ONLINE</span>
            </div>
            <span className="tabular-nums text-primary/60">{time}</span>
            <button
              className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => {
                document.cookie = "kali-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                document.cookie = "kali-username=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                window.location.href = "/login";
              }}
            >
              <LogOutIcon className="size-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
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
          <div className="rounded border border-primary/20 bg-card p-4 transition-all hover:border-primary/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CpuIcon className="size-3.5 text-primary" />
                CPU
              </div>
              <span
                className={cn(
                  "text-lg font-bold tabular-nums",
                  cpu > 80 ? "text-red-500" : cpu > 60 ? "text-yellow-500" : "text-green-500"
                )}
              >
                {Math.round(cpu)}%
              </span>
            </div>
            <StatBar color={cpu > 80 ? "var(--kali-red)" : cpu > 60 ? "var(--kali-yellow)" : "var(--kali-green)"} value={cpu} />
          </div>

          {/* RAM */}
          <div className="rounded border border-primary/20 bg-card p-4 transition-all hover:border-primary/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ServerIcon className="size-3.5 text-primary" />
                RAM
              </div>
              <span
                className={cn(
                  "text-lg font-bold tabular-nums",
                  ram > 85 ? "text-red-500" : ram > 65 ? "text-yellow-500" : "text-green-500"
                )}
              >
                {Math.round(ram)}%
              </span>
            </div>
            <StatBar color={ram > 85 ? "var(--kali-red)" : ram > 65 ? "var(--kali-yellow)" : "var(--kali-green)"} value={ram} />
          </div>

          {/* Network */}
          <div className="rounded border border-primary/20 bg-card p-4 transition-all hover:border-primary/40">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <ActivityIcon className="size-3.5 text-primary" />
              Network
            </div>
            <div className="space-y-0.5 text-xs tabular-nums">
              <div className="flex justify-between">
                <span className="text-muted-foreground/60">↑</span>
                <span className="text-green-500">{netUp.toFixed(1)} MB/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground/60">↓</span>
                <span className="text-primary">{netDn.toFixed(1)} MB/s</span>
              </div>
            </div>
          </div>

          {/* Disk + Sessions */}
          <div className="rounded border border-primary/20 bg-card p-4 transition-all hover:border-primary/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <HardDriveIcon className="size-3.5 text-primary" />
                Disk
              </div>
              <span className="text-sm font-bold text-foreground/70 tabular-nums">{disk}%</span>
            </div>
            <StatBar color="var(--primary)" value={disk} />
            <div className="mt-3 flex items-center gap-1.5 text-xs">
              <ShieldIcon className="size-3 text-green-500" />
              <span className="text-muted-foreground">Sessions:</span>
              <span className="text-green-500 font-bold">{sessions}</span>
            </div>
          </div>
        </motion.div>

        {/* ── Main grid ── */}
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          {/* ── Tools panel ── */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="rounded border border-primary/20 bg-card"
            initial={{ opacity: 0, y: 8 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-primary/15 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-primary">
                <ZapIcon className="size-4" />
                <span className="tracking-wider uppercase text-xs">Kali Toolbox</span>
              </div>
              {/* <Link
                className="flex items-center gap-1 text-[10px] text-gray-600 transition-colors hover:text-[#367BF0]"
                href="/"
              >
                Open Terminal
                <ChevronRightIcon className="size-3" />
              </Link> */}
            </div>

            {/* Category filter */}
            <div className="flex gap-1 overflow-x-auto border-b border-primary/10 px-4 py-2 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={cn(
                    "shrink-0 rounded px-2.5 py-1 text-[11px] tracking-wide uppercase transition-all",
                    activeCategory === cat
                      ? "bg-primary/20 text-primary border border-primary/35"
                      : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
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
                      className="group flex flex-col gap-2 rounded border border-primary/5 bg-primary/[0.02] p-3 transition-all hover:border-primary/30 hover:bg-primary/5 hover:shadow-[0_0_12px_rgba(var(--primary-rgb),0.1)]"
                      href={`/?tool=${tool.id}`}
                    >
                      <Icon className="size-5 transition-colors" style={{ color: tool.color }} />
                      <div>
                        <div className="text-xs font-semibold text-foreground/90 group-hover:text-foreground">
                          {tool.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground/60 leading-tight">{tool.desc}</div>
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
              className="rounded border border-primary/20 bg-card"
              initial={{ opacity: 0, y: 8 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <div className="flex items-center gap-2 border-b border-primary/15 px-4 py-3 text-xs text-primary">
                <ShieldAlertIcon className="size-3.5" />
                <span className="tracking-wider uppercase">Pentest</span>
                <Link
                  href="/pentest"
                  className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                >
                  <PlusIcon className="size-3" />
                  New
                </Link>
              </div>
              {pentestSessions.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-[11px] text-muted-foreground/60 mb-2">No engagements yet</p>
                  <Link
                    href="/pentest"
                    className="text-[11px] text-primary/60 hover:text-primary transition-colors"
                  >
                    Start a pentest →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-primary/5 px-4">
                  {pentestSessions.map((sess) => (
                    <div key={sess.id} className="flex items-start justify-between py-3">
                      <div className="space-y-0.5 min-w-0 flex-1 mr-2">
                        <div className="text-[11px] font-semibold text-foreground/80 truncate">{sess.config.name}</div>
                        <div className="text-[10px] text-muted-foreground/60">{sess.config.targetNetwork}</div>
                        <div className="text-[10px] text-primary/70">{PHASE_LABELS[sess.activePhase]}</div>
                      </div>
                      <Link
                        className="shrink-0 rounded border border-primary/20 px-2 py-1 text-[10px] text-primary/60 transition-colors hover:border-primary/40 hover:text-primary"
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
              className="rounded border border-primary/20 bg-card"
              initial={{ opacity: 0, y: 8 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="flex items-center gap-2 border-b border-primary/15 px-4 py-3 text-xs text-primary">
                <ActivityIcon className="size-3.5" />
                <span className="tracking-wider uppercase">Activity Log</span>
                <span className="ml-auto size-1.5 animate-pulse rounded-full bg-green-500" />
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
                    <span className="shrink-0 tabular-nums text-muted-foreground/60">{log.time}</span>
                    <span className={cn("min-w-0 font-medium", levelColor[log.level])}>{log.msg}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Footer status bar ── */}
        <div className="flex items-center justify-between border-t border-primary/10 pt-3 text-[10px] text-muted-foreground/50">
          <span>
            root@kali-ai <span className="text-muted-foreground/20">|</span> Kali AI Terminal v2.0.0
          </span>
          <div className="flex items-center gap-4">
            <span>MCP: <span className={mcpConnected ? "text-green-500" : "text-red-500"}>{mcpConnected ? "CONNECTED" : "OFFLINE"}</span></span>
            <span>AI: <span className="text-green-500">READY</span></span>
            <span className="tabular-nums text-primary/50">{time}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
