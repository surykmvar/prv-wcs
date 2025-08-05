import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RandomThoughtRecorder } from '@/components/RandomThoughtRecorder'
import { ThoughtsFeed } from '@/components/ThoughtsFeed'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function BreakTheIce() {
  const [showRecorder, setShowRecorder] = useState(false)
  const navigate = useNavigate()

  const handleBack = () => {
    if (showRecorder) {
      setShowRecorder(false)
    } else {
      navigate('/')
    }
  }

  const handleRecorderSuccess = () => {
    setShowRecorder(false)
  }

  if (showRecorder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50">
        <div className="absolute inset-0 bg-gradient-to-br from-woices-violet/5 via-transparent to-woices-mint/5 pointer-events-none"></div>
        <div className="relative">
          <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </div>
          </div>
          <main className="py-6 sm:py-8">
            <RandomThoughtRecorder 
              onBack={handleBack}
              onSuccess={handleRecorderSuccess}
            />
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50">
      <div className="absolute inset-0 bg-gradient-to-br from-woices-violet/5 via-transparent to-woices-mint/5 pointer-events-none"></div>
      <div className="relative">
        <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
              <h1 className="text-xl font-semibold">Break the Ice</h1>
              <div className="w-[100px]"></div>
            </div>
          </div>
        </div>
        <main className="py-6 sm:py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="mb-8 text-center">
              <p className="text-muted-foreground text-lg mb-6">
                Discover thoughts from the community and share your voice
              </p>
              <Button 
                onClick={() => setShowRecorder(true)}
                className="bg-gradient-to-r from-woices-violet to-woices-mint text-white hover:opacity-90 transition-opacity"
              >
                Record a Random Thought
              </Button>
            </div>
            <ThoughtsFeed />
          </div>
        </main>
      </div>
    </div>
  )
}