
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Square, Send, AlertCircle } from "lucide-react"
import { useVoiceRecording } from "@/hooks/useVoiceRecording"
import { useSupabase } from "@/hooks/useSupabase"
import { useUserSession } from "@/hooks/useUserSession"
import { VoicePlayer } from "@/components/VoicePlayer"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

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
  
  const { submitVoiceResponse, loading, canUserSubmitVoice } = useSupabase()
  const { userSession } = useUserSession()
  const { toast } = useToast()

  const [thoughtScope, setThoughtScope] = useState<"global" | "regional" | null>(null)
  const [countryCode, setCountryCode] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    async function loadThoughtMeta() {
      try {
        const { data, error } = await supabase
          .from("thoughts")
          .select("thought_scope, country_code")
          .eq("id", thoughtId)
          .single()
        if (!error && data && isMounted) {
          setThoughtScope(data.thought_scope as "global" | "regional")
          setCountryCode((data.country_code as string | null) || null)
        }
      } catch (e) {
        // ignore
      }
    }
    loadThoughtMeta()
    return () => { isMounted = false }
  }, [thoughtId])

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
      toast({
        title: 'Nothing to send',
        description: 'Please record your Woice before sending.',
        variant: 'destructive'
      })
      return
    }
    
    try {
      // Double-check permissions before submitting
      const permissionCheck = await canUserSubmitVoice(thoughtId, userSession)
      
      if (!permissionCheck.canSubmit) {
        console.error('Permission denied:', permissionCheck.reason)
        // Show error to user
        toast({
          title: 'Cannot submit Woice',
          description: permissionCheck.reason || 'You cannot submit a voice response for this thought',
          variant: 'destructive'
        })
        onClose()
        return
      }
      
      await submitVoiceResponse(thoughtId, audioBlob, duration, userSession)
      resetRecording()
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to send recording:', error)
      toast({
        title: 'Failed to send recording',
        description: 'Please try again.',
        variant: 'destructive'
      })
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
          <div className="mt-3 pr-4 sm:pr-6 pl-4 sm:pl-6">
            <ul className="text-sm text-muted-foreground space-y-2 text-left">
              <li className="flex items-start gap-2">
                <span aria-hidden>🔁</span>
                <span><span className="font-medium">One reply</span> per thought</span>
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden>⏱️</span>
                <span>Up to 60s — be clear, kind, and concise</span>
              </li>
              {thoughtScope === "global" && (
                <li className="flex items-start gap-2">
                  <span aria-hidden>🌐</span>
                  <span>Please reply in English on Global Thoughts/Topics.</span>
                </li>
              )}
              {thoughtScope === "regional" && (
                <li className="flex items-start gap-2">
                  <span aria-hidden>📍</span>
                  <span>Please reply in region/country specific language for clarity (e.g., {countryCode || "IN, DE, FR"}), or in English.</span>
                </li>
              )}
            </ul>
          </div>
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
                  className="mx-auto w-full sm:w-auto max-w-xs px-4 py-2 text-base sm:text-lg rounded-xl"
                >
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
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
                  className="w-full sm:w-auto max-w-xs px-4 py-2 text-base sm:text-lg rounded-xl"
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
