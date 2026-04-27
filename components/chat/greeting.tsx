"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldIcon } from "lucide-react";

const SUGGESTIONS = [
  "Run an nmap scan on 192.168.1.0/24",
  "Start an autonomous pentest on 10.0.0.1",
  "Find SQL injection vulnerabilities on target URL",
  "Generate a penetration test report",
  "Enumerate WordPress plugins with wpscan",
];

const TYPEWRITER_FULL = "How can I assist with your assessment?";

export const Greeting = () => {
  const [typed, setTyped] = useState("");
  const [hint, setHint] = useState(0);

  // Typewriter effect for subtitle
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      if (i <= TYPEWRITER_FULL.length) {
        setTyped(TYPEWRITER_FULL.slice(0, i));
        i++;
      } else {
        clearInterval(id);
      }
    }, 38);
    return () => clearInterval(id);
  }, []);

  // Cycle through suggestion hints
  useEffect(() => {
    const id = setInterval(() => setHint((h) => (h + 1) % SUGGESTIONS.length), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center px-4 font-mono" key="overview">
      {/* Shield icon with glow */}
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="mb-5 flex size-16 items-center justify-center rounded-xl border border-[#367BF0]/30 bg-[#367BF0]/8 shadow-[0_0_24px_rgba(54,123,240,0.2)]"
        initial={{ opacity: 0, scale: 0.8 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <ShieldIcon className="size-8 text-[#367BF0]" />
      </motion.div>

      {/* Title */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-2xl font-bold tracking-tight text-white md:text-3xl"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="text-[#367BF0]">Kali</span> AI Terminal
      </motion.div>

      {/* Typewriter subtitle */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 h-5 text-center text-sm text-[#22c55e]"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <span className="terminal-cursor">{typed}</span>
      </motion.div>

      {/* Prompt line */}
      <motion.div
        animate={{ opacity: 1 }}
        className="mt-6 w-full max-w-sm rounded border border-[#367BF0]/20 bg-[#060810] px-4 py-3 text-[11px]"
        initial={{ opacity: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <div className="mb-2 flex items-center gap-1 text-gray-600">
          <span className="text-[#367BF0]">root@kali-ai</span>
          <span>:</span>
          <span className="text-[#00cfff]">~</span>
          <span>$ suggest --random</span>
        </div>
        <motion.div
          key={hint}
          animate={{ opacity: 1, x: 0 }}
          className="text-[#22c55e] leading-relaxed"
          initial={{ opacity: 0, x: -6 }}
          transition={{ duration: 0.3 }}
        >
          {SUGGESTIONS[hint]}
        </motion.div>
      </motion.div>

      {/* Tag line */}
      <motion.div
        animate={{ opacity: 1 }}
        className="mt-4 text-center text-[11px] text-gray-600 tracking-widest uppercase"
        initial={{ opacity: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        Powered by Claude · MCP · Kali Linux
      </motion.div>
    </div>
  );
};
