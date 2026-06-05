import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: React.ReactNode;
  /** Render the brand dot with a live pulse (use for "new"/"live" contexts). */
  pulse?: boolean;
  /** Tone — `light` for default sections, `dark` for inverted sections. */
  tone?: "light" | "dark";
  className?: string;
}

/**
 * The signature section-label pill: a rounded badge with a brand dot and
 * uppercase monospace text. Opens every major section to create visual rhythm.
 */
const SectionLabel = ({
  children,
  pulse = false,
  tone = "light",
  className,
}: SectionLabelProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 rounded-full border px-5 py-2 font-mono text-xs uppercase tracking-[0.15em]",
        tone === "light"
          ? "border-brand/30 bg-brand/5 text-brand"
          : "border-white/15 bg-white/5 text-brand-secondary",
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-brand" />
        )}
        <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
      </span>
      {children}
    </span>
  );
};

export default SectionLabel;
