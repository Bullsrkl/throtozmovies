import { useEffect, useState } from "react";

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const s = Math.floor(ms / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

export function CountdownTimer({ target }: { target: string | Date }) {
  const targetDate = typeof target === "string" ? new Date(target) : target;
  const [t, setT] = useState(() => diff(targetDate));

  useEffect(() => {
    const i = setInterval(() => setT(diff(targetDate)), 1000);
    return () => clearInterval(i);
  }, [targetDate]);

  const Cell = ({ v, l }: { v: number; l: string }) => (
    <div className="flex flex-col items-center bg-card/80 backdrop-blur-sm border border-border rounded-lg px-3 py-2 min-w-[60px]">
      <span className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">{String(v).padStart(2, "0")}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</span>
    </div>
  );

  return (
    <div className="flex gap-2 justify-center">
      <Cell v={t.d} l="Days" />
      <Cell v={t.h} l="Hrs" />
      <Cell v={t.m} l="Min" />
      <Cell v={t.s} l="Sec" />
    </div>
  );
}