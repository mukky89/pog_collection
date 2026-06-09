import { cn } from "@/lib/utils";

/**
 * POGMAN — vlastná POG postavička v 90s štýle (okrúhly milkcap s tvárou,
 * mávajúcou rukou a topánkami). Čisté SVG, žiadna externá závislosť.
 * Mávanie rešpektuje `prefers-reduced-motion` (globálne vypnutie animácií).
 */
export function PogMascot({
  className,
  waving = true,
}: {
  className?: string;
  waving?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 120 130"
      className={cn("select-none", className)}
      role="img"
      aria-label="POGMAN — POG postavička"
    >
      {/* topánky */}
      <ellipse cx="44" cy="118" rx="15" ry="8" fill="hsl(var(--pog-purple))" />
      <ellipse cx="76" cy="118" rx="15" ry="8" fill="hsl(var(--pog-purple))" />
      <rect x="40" y="104" width="10" height="12" rx="5" fill="hsl(var(--foreground)/0.85)" />
      <rect x="70" y="104" width="10" height="12" rx="5" fill="hsl(var(--foreground)/0.85)" />

      {/* mávajúca ruka (ľavá) */}
      <g
        className={cn(waving && "pog-wave")}
        style={{ transformOrigin: "30px 78px" }}
      >
        <rect x="14" y="60" width="10" height="26" rx="5" fill="hsl(var(--foreground)/0.85)" />
        <circle cx="19" cy="56" r="8" fill="hsl(var(--pog-yellow))" stroke="hsl(var(--foreground)/0.85)" strokeWidth="2.5" />
      </g>
      {/* pravá ruka (palec hore) */}
      <rect x="96" y="64" width="10" height="24" rx="5" fill="hsl(var(--foreground)/0.85)" />
      <circle cx="101" cy="60" r="8" fill="hsl(var(--pog-yellow))" stroke="hsl(var(--foreground)/0.85)" strokeWidth="2.5" />

      {/* telo = milkcap */}
      <circle cx="60" cy="58" r="46" fill="hsl(var(--pog-yellow))" stroke="hsl(var(--foreground)/0.85)" strokeWidth="4" />
      {/* starburst lúče */}
      <g fill="hsl(var(--pog-orange)/0.35)">
        <circle cx="60" cy="58" r="38" />
      </g>
      <circle cx="60" cy="58" r="33" fill="hsl(var(--pog-yellow))" />

      {/* oči */}
      <ellipse cx="48" cy="50" rx="9" ry="11" fill="#fff" stroke="hsl(var(--foreground)/0.7)" strokeWidth="2" />
      <ellipse cx="72" cy="50" rx="9" ry="11" fill="#fff" stroke="hsl(var(--foreground)/0.7)" strokeWidth="2" />
      <circle cx="50" cy="52" r="4.5" fill="hsl(var(--foreground))" />
      <circle cx="74" cy="52" r="4.5" fill="hsl(var(--foreground))" />
      <circle cx="51.5" cy="50.5" r="1.5" fill="#fff" />
      <circle cx="75.5" cy="50.5" r="1.5" fill="#fff" />

      {/* obočie (cool výraz) */}
      <path d="M40 38 q9 -5 18 0" fill="none" stroke="hsl(var(--foreground)/0.8)" strokeWidth="3" strokeLinecap="round" />
      <path d="M64 38 q9 -5 18 0" fill="none" stroke="hsl(var(--foreground)/0.8)" strokeWidth="3" strokeLinecap="round" />

      {/* usmiate ústa s jazykom */}
      <path d="M44 68 q16 20 32 0 z" fill="hsl(var(--foreground)/0.85)" />
      <path d="M52 76 q8 9 16 0 z" fill="hsl(var(--pog-pink))" />
    </svg>
  );
}
