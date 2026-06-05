import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: React.ReactNode;
  /** Render the brand dot with a live pulse (use for "new"/"live" contexts). */
  pulse?: boolean;
  /** Kept for API compatibility; both tones read on the dark canvas. */
  tone?: "light" | "dark";
  className?: string;
}

/**
 * The signature section-label pill: a glass badge with a glowing electric-blue
 * dot and uppercase monospace text. Opens every major section for rhythm.
 */
const SectionLabel = ({
  children,
  pulse = false,
  className,
}: SectionLabelProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-brand-secondary backdrop-blur-md",
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {pulse && (
          <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-brand" />
        )}
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand shadow-glow" />
      </span>
      {children}
    </span>
  );
};

export default SectionLabel;
