"use client";

import { PanelLeftIcon, ShieldIcon, CircleIcon } from "lucide-react";
import Link from "next/link";
import { memo, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

function PureChatHeader({
  chatId,
  isReadonly,
}: {
  chatId: string;
  isReadonly: boolean;
}) {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    setMounted(true);
    const tick = () =>
      setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) {
    return (
      <header className="sticky top-0 z-10 flex h-11 items-center border-b border-[#367BF0]/15 bg-[#060810] px-3" />
    );
  }

  if (state === "collapsed" && !isMobile) {
    return null;
  }

  return (
    <header className="sticky top-0 z-10 flex h-11 items-center gap-2 border-b border-[#367BF0]/15 bg-[#060810]/95 px-3 backdrop-blur-sm font-mono">
      {/* Mobile sidebar toggle */}
      <Button
        className="md:hidden text-[#367BF0]/60 hover:text-[#367BF0]"
        onClick={toggleSidebar}
        size="icon-sm"
        variant="ghost"
      >
        <PanelLeftIcon className="size-4" />
      </Button>

      {/* Terminal prompt */}
      <div className="flex items-center gap-1.5 text-[11px] min-w-0 flex-1">
        <ShieldIcon className="size-3 shrink-0 text-[#367BF0]/50" />
        <span className="text-[#367BF0]/70 hidden sm:inline">root@kali-ai</span>
        <span className="text-gray-700 hidden sm:inline">:</span>
        <span className="text-[#00cfff]/60 hidden sm:inline">~/chat</span>
        {chatId && (
          <>
            <span className="text-gray-700 hidden sm:inline">/</span>
            <span className="text-gray-600 truncate max-w-[120px] hidden sm:inline">
              {chatId.slice(0, 8)}
            </span>
          </>
        )}
        {isReadonly && (
          <span className="ml-1 rounded border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-1.5 py-0.5 text-[9px] text-[#f59e0b] tracking-wider uppercase hidden sm:inline-block">
            readonly
          </span>
        )}
      </div>

      {/* Right status */}
      <div className="flex items-center gap-3 text-[10px] text-gray-700 shrink-0">
        <div className="hidden md:flex items-center gap-1.5">
          <CircleIcon className="size-1.5 fill-[#22c55e] text-[#22c55e]" />
          <span className="text-[#22c55e]/70">secure</span>
        </div>
        <Link
          href="/dashboard"
          className="hidden sm:block text-[#367BF0]/40 transition-colors hover:text-[#367BF0] text-[10px] tracking-wider uppercase"
        >
          dashboard
        </Link>
        <span className="tabular-nums text-[#367BF0]/30">{time}</span>
      </div>
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return (
    prevProps.chatId === nextProps.chatId &&
    prevProps.isReadonly === nextProps.isReadonly
  );
});
