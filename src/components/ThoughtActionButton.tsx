import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Mic } from "lucide-react"
import { useSupabase } from "@/hooks/useSupabase"
import { useUserSession } from "@/hooks/useUserSession"

interface ThoughtActionButtonProps {
  thoughtId: string
  onStartRecording: () => void
}

export function ThoughtActionButton({ thoughtId, onStartRecording }: ThoughtActionButtonProps) {
  const { canUserSubmitVoice } = useSupabase()
  const { userSession, loading: sessionLoading } = useUserSession()
  const [canSubmit, setCanSubmit] = useState(true)
  const [submitMessage, setSubmitMessage] = useState("")
  const [loading, setLoading] = useState(true)

  const checkUserPermission = useCallback(async () => {
    if (sessionLoading) {
      return
    }

    if (!userSession) {
      setCanSubmit(false)
      setSubmitMessage("Please sign in to record")
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const result = await canUserSubmitVoice(thoughtId, userSession)
      console.log('Permission check result for thought', thoughtId, ':', result)
      setCanSubmit(result.canSubmit)
      setSubmitMessage(result.reason || "")
    } catch (error) {
      console.error('Error checking user permission:', error)
      setCanSubmit(false)
      setSubmitMessage("Error checking permissions. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [thoughtId, userSession, sessionLoading])

  useEffect(() => {
    checkUserPermission()
  }, [checkUserPermission])

  if (loading) {
    return (
      <Button
        disabled
        className="w-full sm:w-auto bg-muted text-muted-foreground rounded-xl px-3 sm:px-4 py-2 text-sm sm:text-base h-9 sm:h-10"
      >
        <Mic className="w-4 h-4 mr-2" />
        <span className="sm:hidden">Loading...</span>
        <span className="hidden sm:inline">Loading...</span>
      </Button>
    )
  }

  if (!canSubmit) {
    return (
      <Button
        disabled
        className="w-full sm:w-auto bg-muted text-muted-foreground rounded-xl px-3 sm:px-4 py-2 text-sm sm:text-base h-9 sm:h-10 cursor-not-allowed"
      >
        <Mic className="w-4 h-4 mr-2" />
        <span className="sm:hidden">{submitMessage.includes("already") ? "Already replied" : "Can't record"}</span>
        <span className="hidden sm:inline">{submitMessage}</span>
      </Button>
    )
  }

  return (
    <Button
      onClick={onStartRecording}
      className="w-full sm:w-auto bg-gradient-to-r from-woices-violet to-woices-bloom hover:from-woices-violet/90 hover:to-woices-bloom/90 text-white rounded-xl px-3 sm:px-4 py-2 text-sm sm:text-base h-9 sm:h-10"
    >
      <Mic className="w-4 h-4 mr-2" />
      <span className="sm:hidden">Record Woice 🎙️</span>
      <span className="hidden sm:inline">Record Your Woice Reply 🎙️</span>
    </Button>
  )
}