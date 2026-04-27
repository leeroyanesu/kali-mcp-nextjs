"use client";

import { useEffect, useRef } from "react";

const CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&<>/\\|";

interface MatrixRainProps {
  className?: string;
  /** Hex color for the trail, e.g. "#367BF0" */
  color?: string;
  /** Milliseconds between frames – lower = faster */
  speed?: number;
}

export function MatrixRain({
  className,
  color = "#367BF0",
  speed = 40,
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const fontSize = 13;
    const colWidth = 16;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const cols = Math.ceil(canvas.width / colWidth);
    const drops: number[] = Array.from({ length: cols }, () =>
      Math.random() * -60
    );

    let last = 0;
    const tick = (ts: number) => {
      raf = requestAnimationFrame(tick);
      if (ts - last < speed) return;
      last = ts;

      // Fade trail
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px "Cascadia Code", "JetBrains Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const x = i * colWidth;
        const y = drops[i] * fontSize;

        // Lead char — bright white
        const leadChar = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillStyle = "rgba(210, 230, 255, 0.95)";
        ctx.fillText(leadChar, x, y);

        // Second char — full color
        if (y > fontSize) {
          const c2 = CHARS[Math.floor(Math.random() * CHARS.length)];
          ctx.fillStyle = color + "dd";
          ctx.fillText(c2, x, y - fontSize);
        }

        // Deeper trail — dimmer color
        if (y > fontSize * 2) {
          const c3 = CHARS[Math.floor(Math.random() * CHARS.length)];
          ctx.fillStyle = color + "55";
          ctx.fillText(c3, x, y - fontSize * 2);
        }

        drops[i] += 0.55;
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [color, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
