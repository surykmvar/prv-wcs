
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Square, Send } from "lucide-react"

interface VoiceRecorderProps {
  onClose: () => void
}

export function VoiceRecorder({ onClose }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const [hasRecording, setHasRecording] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isRecording && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRecording(false)
            setHasRecording(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isRecording, timeLeft])

  const startRecording = () => {
    setIsRecording(true)
    setTimeLeft(60)
    console.log("Started recording...")
  }

  const stopRecording = () => {
    setIsRecording(false)
    setHasRecording(true)
    console.log("Stopped recording...")
  }

  const sendRecording = () => {
    console.log("Sending voice recording...")
    onClose()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Record Your Woice</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="w-32 h-32 mx-auto relative">
          <div className={`w-full h-full rounded-full bg-gradient-to-br from-woices-violet to-woices-bloom flex items-center justify-center ${
            isRecording ? 'animate-pulse-glow' : ''
          }`}>
            <Mic className="w-16 h-16 text-white" />
          </div>
          {isRecording && (
            <div className="absolute inset-0 rounded-full border-4 border-woices-violet animate-ping opacity-20"></div>
          )}
        </div>

        <div className="text-3xl font-mono font-bold">
          {formatTime(timeLeft)}
        </div>

        <div className="flex justify-center gap-4">
          {!isRecording && !hasRecording && (
            <Button
              onClick={startRecording}
              className="bg-gradient-to-r from-woices-violet to-woices-bloom hover:from-woices-violet/90 hover:to-woices-bloom/90 text-white px-6 py-3"
            >
              <Mic className="w-5 h-5 mr-2" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="px-6 py-3"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop Recording
            </Button>
          )}

          {hasRecording && !isRecording && (
            <>
              <Button
                onClick={() => {
                  setHasRecording(false)
                  setTimeLeft(60)
                }}
                variant="outline"
              >
                Re-record
              </Button>
              <Button
                onClick={sendRecording}
                className="bg-gradient-to-r from-woices-mint to-woices-sky hover:from-woices-mint/90 hover:to-woices-sky/90 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Woice
              </Button>
            </>
          )}
        </div>

        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </CardContent>
    </Card>
  )
}
