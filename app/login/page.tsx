"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MatrixRain } from "@/components/kali/matrix-rain";
import { ShieldIcon, EyeIcon, EyeOffIcon, AlertCircleIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { db } from "@/lib/db/dexie";
import { nanoid } from "nanoid";
import { hash, compare } from "bcrypt-ts";

/* ── Valid credentials ─────────────────────────────────────────
   Classic Kali Linux defaults. Either pair works.
   username: root   password: toor
   username: kali   password: kali
──────────────────────────────────────────────────────────────── */
const VALID_CREDENTIALS: Record<string, string> = {
  root: "toor",
  kali: "kali",
};

const BOOT_SEQUENCE = [
  { text: "ARTEMIS v2.4.1 — Advanced Threat & Recon Intelligence System", delay: 0 },
  { text: "Initializing hardware drivers...", delay: 180 },
  { text: "Loading kernel modules [OK]", delay: 360 },
  { text: "Mounting encrypted volumes [OK]", delay: 540 },
  { text: "Starting network daemon [OK]", delay: 700 },
  { text: "Loading AI inference engine [OK]", delay: 860 },
  { text: "Configuring security stack [OK]", delay: 1020 },
  { text: "All systems operational.", delay: 1180 },
  { text: "", delay: 1300 },
  { text: "ARTEMIS Terminal — Unauthorized access prohibited.", delay: 1400 },
  { text: "Authentication required to continue.", delay: 1560 },
];

const ASCII_KALI = `
 █████╗ ██████╗ ████████╗███████╗███╗   ███╗██╗███████╗
██╔══██╗██╔══██╗╚══██╔══╝██╔════╝████╗ ████║██║██╔════╝
███████║██████╔╝   ██║   █████╗  ██╔████╔██║██║███████╗
██╔══██║██╔══██╗   ██║   ██╔══╝  ██║╚██╔╝██║██║╚════██║
██║  ██║██║  ██║   ██║   ███████╗██║ ╚═╝ ██║██║███████║
╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝     ╚═╝╚═╝╚══════╝`.trim();

export default function LoginPage() {
  const router = useRouter();
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [bootDone, setBootDone] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    BOOT_SEQUENCE.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines(i + 1);
        if (i === BOOT_SEQUENCE.length - 1) {
          setTimeout(() => setBootDone(true), 500);
        }
      }, line.delay);
    });
  }, []);

  useEffect(() => {
    if (bootDone) {
      setTimeout(() => usernameRef.current?.focus(), 300);
    }
  }, [bootDone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Error: username and password are required");
      return;
    }

    if (isRegisterMode && password !== confirmPassword) {
      setError("Error: passwords do not match");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Simulate auth handshake delay
      await new Promise((r) => setTimeout(r, 1200));

      if (isRegisterMode) {
        // Check if user already exists
        const existingUser = await db.users.where("username").equalsIgnoreCase(username.trim()).first();
        if (existingUser) {
          setError("Error: username already exists");
          setLoading(false);
          return;
        }

        const hashedPassword = await hash(password, 10);
        await db.users.add({
          id: nanoid(),
          username: username.trim().toLowerCase(),
          password: hashedPassword,
          createdAt: new Date(),
        });

        // Set session and redirect
        document.cookie = "kali-auth=true; path=/; max-age=86400; SameSite=Lax";
        document.cookie = `kali-username=${username.trim().toLowerCase()}; path=/; max-age=86400; SameSite=Lax`;
        router.push("/dashboard");
      } else {
        // Try DB first
        const user = await db.users.where("username").equalsIgnoreCase(username.trim()).first();
        let isValid = false;

        if (user) {
          isValid = await compare(password, user.password);
        } else {
          // Fallback to hardcoded defaults
          const expected = VALID_CREDENTIALS[username.trim().toLowerCase()];
          if (expected && expected === password) {
            isValid = true;
          }
        }

        if (!isValid) {
          setError("Authentication failed: invalid credentials");
          setLoading(false);
          return;
        }

        // Set session and redirect
        document.cookie = "kali-auth=true; path=/; max-age=86400; SameSite=Lax";
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("Critical system error during authentication");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background font-mono transition-colors duration-300">
      {/* Matrix rain */}
      <MatrixRain
        className="absolute inset-0 opacity-[0.12] dark:opacity-[0.18]"
        color="var(--primary)"
        speed={38}
      />

      {/* Radial vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_40%,var(--background)_100%)] opacity-80" />

      {/* Theme Toggle Position */}
      <div className="absolute right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      {/* Top scanline */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-0 right-0 h-[2px] bg-primary/20"
          style={{ animation: "scanline 8s linear infinite" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-8">
        {/* ASCII Logo */}
        <motion.div
          animate={{ opacity: 1 }}
          className="mb-6 text-center"
          initial={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <pre className="hidden select-none text-center text-[9px] leading-[1.15] text-primary sm:block">
            {ASCII_KALI}
          </pre>
          <div className="mt-2 text-[10px] tracking-[0.35em] text-primary/60 uppercase">
            Reconnaissance & Exploitation <br /> Cyber Security
          </div>
        </motion.div>

        {/* Boot terminal */}
        <AnimatePresence>
          {!bootDone && (
            <motion.div
              animate={{ opacity: 1 }}
              className="mb-4 rounded border border-primary/20 bg-card/80 p-4 text-xs backdrop-blur-sm"
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {BOOT_SEQUENCE.slice(0, visibleLines).map((line, i) => (
                <div
                  key={i}
                  className="boot-line leading-5"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {line.text === "" ? (
                    <div className="h-2" />
                  ) : (
                    <span
                      className={
                        line.text.includes("[OK]")
                          ? "text-green-500"
                          : line.text.startsWith("BIOS") ||
                              line.text.startsWith("KALI")
                            ? "text-primary"
                            : "text-muted-foreground"
                      }
                    >
                      {line.text}
                    </span>
                  )}
                </div>
              ))}
              {visibleLines < BOOT_SEQUENCE.length && (
                <span className="inline-block h-3 w-2 animate-pulse bg-primary" />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login window */}
        <AnimatePresence>
          {bootDone && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="rounded border border-primary/30 bg-card/90 shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)] backdrop-blur-md"
              initial={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Title bar */}
              <div className="flex items-center gap-2 border-b border-primary/20 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="size-2.5 rounded-full bg-red-500/80" />
                  <div className="size-2.5 rounded-full bg-yellow-500/80" />
                  <div className="size-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="mx-auto text-[11px] text-primary/60 tracking-widest uppercase">
                  artemis — authentication
                </span>
                <ShieldIcon className="size-3.5 text-primary/40" />
              </div>

              <div className="p-6">
                {/* Prompt line */}
                <div className="mb-5 text-xs">
                  <span className="text-primary font-bold">root@kali-ai</span>
                  <span className="text-muted-foreground">:</span>
                  <span className="text-cyan-500">~</span>
                  <span className="text-muted-foreground">$ </span>
                  <span className="text-foreground/80">login --system ai-terminal</span>
                  <span className="inline-block h-3 w-1.5 translate-y-[1px] animate-pulse bg-green-500 ml-0.5" />
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Username */}
                  <div>
                    <label className="mb-1.5 block text-[11px] text-muted-foreground tracking-wider uppercase">
                      Username
                    </label>
                    <div className="flex items-center rounded border border-primary/25 bg-muted/30 px-3 py-2.5 transition-all focus-within:border-primary/60 focus-within:shadow-[0_0_10px_rgba(var(--primary-rgb),0.15)]">
                      <span className="mr-2 text-primary text-sm select-none">›</span>
                      <input
                        ref={usernameRef}
                        autoComplete="off"
                        autoCorrect="off"
                        className="flex-1 bg-transparent text-sm text-green-500 outline-none placeholder:text-muted-foreground/50"
                        placeholder="root"
                        spellCheck={false}
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="mb-1.5 block text-[11px] text-muted-foreground tracking-wider uppercase">
                      Password
                    </label>
                    <div className="flex items-center rounded border border-primary/25 bg-muted/30 px-3 py-2.5 transition-all focus-within:border-primary/60 focus-within:shadow-[0_0_10px_rgba(var(--primary-rgb),0.15)]">
                      <span className="mr-2 text-primary text-sm select-none">›</span>
                      <input
                        autoComplete={isRegisterMode ? "new-password" : "current-password"}
                        className="flex-1 bg-transparent text-sm text-green-500 outline-none placeholder:text-muted-foreground/50"
                        placeholder="••••••••••"
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        className="ml-2 text-muted-foreground/60 transition-colors hover:text-muted-foreground"
                        tabIndex={-1}
                        type="button"
                        onClick={() => setShowPass((v) => !v)}
                      >
                        {showPass ? (
                          <EyeOffIcon className="size-3.5" />
                        ) : (
                          <EyeIcon className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password (only for register) */}
                  {isRegisterMode && (
                    <motion.div
                      animate={{ opacity: 1, height: "auto" }}
                      initial={{ opacity: 0, height: 0 }}
                    >
                      <label className="mb-1.5 block text-[11px] text-muted-foreground tracking-wider uppercase">
                        Confirm Password
                      </label>
                      <div className="flex items-center rounded border border-primary/25 bg-muted/30 px-3 py-2.5 transition-all focus-within:border-primary/60 focus-within:shadow-[0_0_10px_rgba(var(--primary-rgb),0.15)]">
                        <span className="mr-2 text-primary text-sm select-none">›</span>
                        <input
                          autoComplete="new-password"
                          className="flex-1 bg-transparent text-sm text-green-500 outline-none placeholder:text-muted-foreground/50"
                          placeholder="••••••••••"
                          type={showPass ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Error */}
                  {error && (
                    <motion.div
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-xs text-red-400"
                      initial={{ opacity: 0, x: -4 }}
                    >
                      <AlertCircleIcon className="size-3.5 shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  <div className="flex flex-col gap-3">
                    <button
                      className="group relative w-full overflow-hidden rounded border border-primary/40 bg-primary/8 px-4 py-2.5 text-sm text-primary transition-all hover:border-primary/70 hover:bg-primary/15 hover:shadow-[0_0_16px_rgba(var(--primary-rgb),0.25)] disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={loading}
                      type="submit"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="inline-block size-1.5 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
                          <span className="inline-block size-1.5 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
                          <span className="inline-block size-1.5 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
                          <span className="ml-2">
                            {isRegisterMode ? "INITIALIZING ACCOUNT" : "AUTHENTICATING"}
                          </span>
                        </span>
                      ) : (
                        `[ ${isRegisterMode ? "CREATE ACCOUNT" : "AUTHENTICATE"} ]`
                      )}
                    </button>

                    <button
                      className="text-[10px] text-primary/60 transition-colors hover:text-primary uppercase tracking-widest"
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(!isRegisterMode);
                        setError("");
                      }}
                    >
                      {isRegisterMode
                        ? "Already have access? Switch to Login"
                        : "No access? Create new credentials"}
                    </button>
                  </div>
                </form>

                {/* <div className="mt-5 border-t border-[#367BF0]/10 pt-4 space-y-2">
                  <p className="text-center text-[10px] text-gray-700 tracking-widest uppercase">
                    {isRegisterMode
                      ? "User registration system active"
                      : "Unauthorized access is strictly prohibited"}
                  </p>
                  <div className="flex justify-center gap-6 text-[10px] text-gray-800 font-mono">
                    <span>
                      <span className="text-[#367BF0]/40">user:</span>{" "}
                      <span className="text-gray-700">root</span>
                      <span className="text-gray-800 mx-1">/</span>
                      <span className="text-[#367BF0]/40">pass:</span>{" "}
                      <span className="text-gray-700">toor</span>
                    </span>
                    <span className="text-gray-800">·</span>
                    <span>
                      <span className="text-[#367BF0]/40">user:</span>{" "}
                      <span className="text-gray-700">kali</span>
                      <span className="text-gray-800 mx-1">/</span>
                      <span className="text-[#367BF0]/40">pass:</span>{" "}
                      <span className="text-gray-700">kali</span>
                    </span>
                  </div>
                </div> */}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status bar */}
        <div className="mt-3 flex justify-between text-[10px] text-muted-foreground/40 font-mono">
          <span>ARTEMIS Terminal v2.0.0</span>
          <span>admin@kali.local</span>
        </div>
      </div>
    </div>
  );
}
