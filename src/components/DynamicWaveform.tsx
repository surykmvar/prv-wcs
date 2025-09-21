import { useEffect, useRef } from "react"

interface DynamicWaveformProps {
  isPlaying: boolean
  progress: number
  className?: string
}

export const DynamicWaveform = ({ isPlaying, progress, className = "" }: DynamicWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  // Generate realistic waveform data
  const generateWaveformData = (length: number) => {
    const data = []
    for (let i = 0; i < length; i++) {
      // Create varied heights that simulate voice patterns
      const base = Math.sin(i * 0.1) * 0.3 + 0.7
      const variation = Math.random() * 0.4 + 0.1
      data.push(base * variation)
    }
    return data
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const waveformData = generateWaveformData(80)
    
    const animate = () => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)
      
      const barWidth = width / waveformData.length
      const progressPoint = progress * waveformData.length
      
      waveformData.forEach((amplitude, index) => {
        const barHeight = amplitude * height * 0.8
        const x = index * barWidth
        const y = (height - barHeight) / 2
        
        // Determine bar color based on progress and playing state
        let color
        if (index < progressPoint) {
          // Played portion - vibrant color
          color = isPlaying ? 'hsl(var(--woices-violet))' : 'hsl(var(--woices-sky))'
        } else {
          // Unplayed portion - muted color
          color = 'hsl(var(--muted-foreground) / 0.3)'
        }
        
        // Add animation effect for currently playing section
        if (isPlaying && Math.abs(index - progressPoint) < 3) {
          const animationScale = 1 + Math.sin(Date.now() * 0.01 + index) * 0.2
          const animatedHeight = barHeight * animationScale
          const animatedY = (height - animatedHeight) / 2
          
          ctx.fillStyle = color
          ctx.fillRect(x, animatedY, barWidth - 1, animatedHeight)
        } else {
          ctx.fillStyle = color
          ctx.fillRect(x, y, barWidth - 1, barHeight)
        }
      })
      
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }
    
    animate()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, progress])

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={32}
      className={`w-full h-8 ${className}`}
    />
  )
}