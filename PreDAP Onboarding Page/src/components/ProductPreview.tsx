import { Lock, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";

/**
 * Animated product demo — the hero centerpiece, dark technical edition.
 *
 * A glass browser window running a real-looking app, with PreDAP doing its job
 * on top: a coach-mark guiding the next step, a glowing highlight on the target
 * control, and a "masked on-device" badge that makes the privacy promise
 * tangible. Shows the product instead of describing it. All motion is CSS-based
 * and respects prefers-reduced-motion.
 */
const ProductPreview = () => {
  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      {/* Ambient brand glow + slow decorative ring */}
      <div className="absolute inset-0 -z-10 m-auto h-3/4 w-3/4 rounded-full bg-brand/25 blur-[130px]" />
      <div className="absolute -inset-6 -z-10 animate-spin-slow rounded-[2rem] border border-dashed border-white/[0.06]" />

      {/* Browser window */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-[#0c0e14] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
        {/* Chrome */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-white/15" />
            <span className="h-3 w-3 rounded-full bg-white/15" />
            <span className="h-3 w-3 rounded-full bg-white/15" />
          </div>
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/[0.05] bg-white/[0.03] px-3 py-1.5">
            <Lock className="h-3 w-3 text-brand-cyan" />
            <span className="font-mono text-[11px] text-muted-foreground">
              app.acme.com/settings
            </span>
          </div>
        </div>

        {/* App body */}
        <div className="flex gap-5 p-5">
          {/* Sidebar */}
          <div className="hidden w-24 shrink-0 flex-col gap-2 sm:flex" aria-hidden="true">
            <div className="h-2.5 w-16 rounded-full bg-white/[0.06]" />
            <div className="h-8 rounded-lg border border-brand/20 bg-brand/15" />
            <div className="h-8 rounded-lg bg-white/[0.04]" />
            <div className="h-8 rounded-lg bg-white/[0.04]" />
            <div className="h-8 rounded-lg bg-white/[0.04]" />
          </div>

          {/* Main panel */}
          <div className="flex-1 space-y-4" aria-hidden="true">
            <div className="space-y-1.5">
              <div className="h-3 w-32 rounded-full bg-white/20" />
              <div className="h-2 w-44 rounded-full bg-white/[0.07]" />
            </div>

            {/* Workspace field */}
            <div className="space-y-1.5">
              <div className="h-2 w-20 rounded-full bg-white/[0.07]" />
              <div className="h-9 rounded-lg border border-white/[0.06] bg-white/[0.02]" />
            </div>

            {/* Billing email — abstracted on-device */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="h-2 w-16 rounded-full bg-white/[0.07]" />
                <span className="inline-flex items-center gap-1 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-2 py-0.5 text-[9px] font-medium text-brand-cyan">
                  <ShieldCheck className="h-2.5 w-2.5" /> masked
                </span>
              </div>
              <div className="flex h-9 items-center rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 font-mono text-xs tracking-[0.2em] text-muted-foreground">
                ••••••@••••••.com
              </div>
            </div>

            {/* Highlighted target — what PreDAP wants the user to click */}
            <div className="relative pt-1">
              <span
                className="absolute -inset-1.5 top-0 animate-pulse rounded-xl ring-2 ring-brand"
                aria-hidden="true"
              />
              <div className="relative flex w-full items-center justify-between rounded-lg bg-gradient-to-r from-brand to-brand-secondary px-4 py-2.5 text-sm font-medium text-white shadow-glow">
                Connect data source
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coach-mark — pops out bottom-right, gently floating */}
      <div className="absolute -bottom-6 right-2 w-60 animate-float rounded-xl border border-white/[0.1] bg-[#0e1118]/90 p-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:-right-8">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-brand-secondary">
            <Sparkles className="h-3 w-3" /> PreDAP
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">Step 2 / 4</span>
        </div>
        <p className="mt-2 text-sm font-semibold text-white">
          Connect your data source
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Click the highlighted button — we'll guide the rest.
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1" aria-hidden="true">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            <span className="h-1.5 w-4 rounded-full bg-brand" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-secondary">
            Next <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>

      {/* Privacy badge — pops out top-left, floating on a different beat */}
      <div className="absolute -top-5 -left-3 animate-float-delayed rounded-xl border border-white/[0.1] bg-[#0e1118]/90 px-3.5 py-2.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:-left-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-secondary text-white shadow-glow">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-white">Private by design</p>
            <p className="text-[10px] text-muted-foreground">Data abstracted on-device</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;
