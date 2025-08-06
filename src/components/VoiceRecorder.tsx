
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Square, Send, AlertCircle } from "lucide-react"
import { useVoiceRecording } from "@/hooks/useVoiceRecording"
import { useSupabase } from "@/hooks/useSupabase"
import { useUserSession } from "@/hooks/useUserSession"
import { VoicePlayer } from "@/components/VoicePlayer"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface VoiceRecorderProps {
  thoughtId: string
  onClose: () => void
  onSuccess?: () => void
}

export function VoiceRecorder({ thoughtId, onClose, onSuccess }: VoiceRecorderProps) {
  const { 
    isRecording, 
    timeLeft, 
    audioBlob, 
    audioUrl, 
    duration,
    startRecording, 
    stopRecording, 
    resetRecording, 
    formatTime 
  } = useVoiceRecording(60)
  
  const { submitVoiceResponse, loading } = useSupabase()
  const userSession = useUserSession()

  const handleStartRecording = async () => {
    try {
      await startRecording()
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }

  const handleSendRecording = async () => {
    if (!audioBlob || audioBlob.size === 0 || duration === 0) {
      console.error('Cannot send empty recording')
      return
    }
    
    try {
      await submitVoiceResponse(thoughtId, audioBlob, duration, userSession)
      resetRecording()
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to send recording:', error)
    }
  }

  const handleReRecord = () => {
    resetRecording()
  }

  return (
    <div className="w-full px-4 sm:px-6 max-w-md mx-auto">
      <Card className="p-4 sm:p-6 rounded-xl shadow-lg">
        <CardHeader className="text-center p-0 mb-6">
          <CardTitle className="text-xl sm:text-2xl font-semibold">Record Your Woice</CardTitle>
          <p className="text-sm text-muted-foreground mt-2 px-4">
            *You can send only one thoughtful, respectful, and valuable Woice reply for this thought. Be kind and make your voice count! 😉
          </p>
        </CardHeader>
        <CardContent className="text-center space-y-6 p-0">
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto relative">
            <div className={`w-full h-full rounded-full bg-gradient-to-br from-woices-violet to-woices-bloom flex items-center justify-center ${
              isRecording ? 'animate-pulse-glow' : ''
            }`}>
              <Mic className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
            </div>
            {isRecording && (
              <div className="absolute inset-0 rounded-full border-4 border-woices-violet animate-ping opacity-20"></div>
            )}
          </div>

          <div className="text-2xl sm:text-3xl font-mono font-bold">
            {formatTime(timeLeft)}
          </div>

          {/* Audio playback section */}
          {audioUrl && (
            <div className="mb-6">
              <VoicePlayer audioUrl={audioUrl} duration={duration} />
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
            {!isRecording && !audioBlob && (
              <Button
                onClick={handleStartRecording}
                disabled={loading}
                className="mx-auto w-32 xs:w-36 sm:w-40 md:w-44 lg:w-48 px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 text-xs xs:text-sm sm:text-base md:text-lg bg-gradient-to-r from-woices-violet to-woices-bloom hover:from-woices-violet/90 hover:to-woices-bloom/90 text-white rounded-xl shadow-md transition-all duration-300"
              >
                <Mic className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 mr-1 xs:mr-2" />
                Start Recording
              </Button>
            )}

            {isRecording && (
              <Button
                onClick={stopRecording}
                variant="destructive"
                className="w-full sm:w-auto max-w-xs px-4 py-2 text-base sm:text-lg rounded-xl shadow-md"
              >
                <Square className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Stop Recording
              </Button>
            )}

            {audioBlob && !isRecording && (
              <>
                <Button
                  onClick={handleReRecord}
                  variant="outline"
                  disabled={loading}
                  className="w-full sm:w-auto max-w-xs px-4 py-2 text-base rounded-xl"
                >
                  Re-record
                </Button>
                <Button
                  onClick={handleSendRecording}
                  disabled={loading}
                  className="w-full sm:w-auto max-w-xs px-4 py-2 text-base sm:text-lg bg-gradient-to-r from-woices-mint to-woices-sky hover:from-woices-mint/90 hover:to-woices-sky/90 text-white rounded-xl shadow-md"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Sending...' : 'Send Woice'}
                </Button>
              </>
            )}
          </div>

          {/* Error state */}
          {!navigator.mediaDevices && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Voice recording is not supported in this browser. Please use a modern browser with microphone access.
              </AlertDescription>
            </Alert>
          )}

          <Button variant="ghost" onClick={onClose} className="text-base">
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
