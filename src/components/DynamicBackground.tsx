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

      {/* Gentle moving wave hint (voice vibe) */}
      <svg
        className="absolute inset-x-0 bottom-0 w-[200%] h-[40vh] opacity-[0.08] animate-[drift_30s_linear_infinite]"
        viewBox="0 0 800 200"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="currentColor" />
            <stop offset="100%" stopColor="currentColor" />
          </linearGradient>
        </defs>
        <g style={{ color: 'hsl(var(--primary))' }}>
          <path d="M0,100 C150,50 250,150 400,100 C550,50 650,150 800,100 L800,200 L0,200 Z" fill="currentColor" />
        </g>
      </svg>

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
      `}</style>
    </div>
  )
}
