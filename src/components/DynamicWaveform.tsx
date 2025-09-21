import { useMemo } from "react"

interface DynamicWaveformProps {
  isPlaying: boolean
  progress: number
  className?: string
}

export const DynamicWaveform = ({ isPlaying, progress, className = "" }: DynamicWaveformProps) => {
  // Generate realistic waveform data once
  const waveformData = useMemo(() => {
    const data = []
    for (let i = 0; i < 60; i++) {
      // Create varied heights that simulate voice patterns
      const base = Math.sin(i * 0.15) * 0.4 + 0.6
      const variation = Math.random() * 0.5 + 0.2
      data.push(base * variation)
    }
    return data
  }, [])

  const progressPoint = progress * waveformData.length

  return (
    <div className={`flex items-center justify-center gap-[1px] h-8 w-full px-1 ${className}`}>
      {waveformData.map((amplitude, index) => {
        const isPlayed = index < progressPoint
        const isActive = isPlaying && Math.abs(index - progressPoint) < 2
        
        const height = Math.max(4, amplitude * 28) // min 4px, max 28px
        
        return (
          <div
            key={index}
            className={`
              w-[3px] rounded-full transition-all duration-150 flex-shrink-0
              ${isActive ? "scale-y-110" : ""}
            `}
            style={{ 
              height: `${height}px`,
              backgroundColor: isPlayed 
                ? `hsl(var(--waveform-progress-color))` 
                : `hsl(var(--waveform-color))`
            }}
          />
        )
      })}
    </div>
  )
}