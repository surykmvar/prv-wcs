import React from "react"

export function DynamicBackground() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      {/* Blurred gradient blobs (subtle, non-distracting) */}
      <div className="pointer-events-none">
        <span className="absolute -left-[10%] -top-[10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-woices-violet to-woices-bloom blur-3xl opacity-20 animate-[float1_16s_ease-in-out_infinite]" />
        <span className="absolute right-[-15%] top-1/4 w-[35vw] h-[35vw] rounded-full bg-gradient-to-br from-woices-mint to-woices-sky blur-3xl opacity-20 animate-[float2_18s_ease-in-out_infinite]" />
        <span className="absolute -bottom-[15%] left-1/3 w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-woices-bloom to-woices-violet blur-3xl opacity-10 animate-[float3_22s_ease-in-out_infinite]" />
      </div>

      {/* Subtle aurora ribbons (theme-aware, modern) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute left-[-20%] top-1/4 w-[140vw] h-[22vh] bg-gradient-to-r from-primary/10 via-transparent to-primary/10 dark:from-foreground/20 dark:to-foreground/20 blur-2xl opacity-70 animate-[pan_28s_ease-in-out_infinite]" style={{ transform: 'rotate(-6deg)' }} />
        <span className="absolute right-[-25%] top-1/2 w-[160vw] h-[18vh] bg-gradient-to-r from-woices-bloom/10 via-transparent to-woices-sky/10 dark:from-foreground/15 dark:to-foreground/15 blur-2xl opacity-60 animate-[pan_32s_ease-in-out_infinite]" style={{ transform: 'rotate(4deg)' }} />
        <span className="absolute -left-[15%] bottom-[12%] w-[120vw] h-[16vh] bg-gradient-to-r from-woices-violet/10 via-transparent to-woices-mint/10 dark:from-foreground/15 dark:to-foreground/15 blur-3xl opacity-50 animate-[pan_36s_ease-in-out_infinite]" style={{ transform: 'rotate(-2deg)' }} />
      </div>

      {/* Local keyframes for subtle motion */}
      <style>{`
        @keyframes float1 {
          0% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(30px,-20px,0) scale(1.05); }
          100% { transform: translate3d(0,0,0) scale(1); }
        }
        @keyframes float2 {
          0% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(-25px,15px,0) scale(1.03); }
          100% { transform: translate3d(0,0,0) scale(1); }
        }
        @keyframes float3 {
          0% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(20px,20px,0) scale(1.04); }
          100% { transform: translate3d(0,0,0) scale(1); }
        }
        @keyframes drift {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pan {
          0% { transform: translateX(-8%); }
          50% { transform: translateX(8%); }
          100% { transform: translateX(-8%); }
        }
      `}</style>
    </div>
  )
}
