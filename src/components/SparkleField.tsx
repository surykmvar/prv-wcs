import { memo, useMemo } from "react"
import { motion } from "framer-motion"

interface SparkleFieldProps {
  className?: string
  density?: number // approx number of sparkles
}

// Lightweight sparkle background using framer-motion
  export const SparkleField = memo(function SparkleField({ className = "", density = 28 }: SparkleFieldProps) {
  const items = useMemo(() =>
    Array.from({ length: density }).map((_, i) => {
      const seed = i + 1
      // pseudo-random positions using seed
      const left = ((Math.sin(seed * 12.9898) * 43758.5453) % 1 + 1) % 1 * 100
      const top = ((Math.sin(seed * 78.233) * 96453.5453) % 1 + 1) % 1 * 100
      const size = 2 + (((seed * 7) % 10) / 10) * 2 // 2 - 4px
      const duration = 3 + ((seed * 13) % 30) / 10 // 3 - 6s
      const y = ((seed * 17) % 12) - 6 // -6 to 6 px
      const delay = ((seed * 23) % 20) / 10 // 0 - 2s
      return { left: `${left}%`, top: `${top}%`, size, duration, y, delay, key: `sp-${i}` }
    })
  , [density])

  return (
    <div className={`pointer-events-none ${className}`} aria-hidden>
      <div className="absolute inset-0">
        {items.map(({ key, left, top, size, duration, y, delay }) => (
          <motion.span
            key={key}
            className="absolute rounded-full bg-foreground/90 dark:bg-foreground/90 shadow-[0_0_10px_hsl(var(--foreground)/0.35)]"
            style={{ left, top, width: size, height: size }}
            initial={{ opacity: 0.7, y: 0, scale: 0.95 }}
            animate={{ opacity: [0.6, 1, 0.6], y: [0, -y, 0, y, 0], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration, ease: "easeInOut", repeat: Infinity, delay, repeatType: "mirror" }}
          />
        ))}
      </div>
    </div>
  )
})
