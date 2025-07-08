import { useState, useRef, useCallback } from 'react'

export interface VoiceRecordingState {
  isRecording: boolean
  isPaused: boolean
  timeLeft: number
  audioBlob: Blob | null
  audioUrl: string | null
  duration: number
}

export function useVoiceRecording(maxDuration: number = 60) {
  const [state, setState] = useState<VoiceRecordingState>({
    isRecording: false,
    isPaused: false,
    timeLeft: maxDuration,
    audioBlob: null,
    audioUrl: null,
    duration: 0
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number>(0)

  const startRecording = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })
      
      streamRef.current = stream
      startTimeRef.current = Date.now()
      
      // Create MediaRecorder with WebM format (fallback to available format)
      const options = { mimeType: 'audio/webm;codecs=opus' }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'audio/webm'
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options.mimeType = 'audio/mp4'
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            // Fallback to default
            delete options.mimeType
          }
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
          console.log('Audio chunk received:', event.data.size, 'bytes')
        }
      }

      mediaRecorder.onstop = () => {
        console.log('MediaRecorder stopped, chunks:', chunksRef.current.length)
        const audioBlob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType })
        const duration = Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000))
        
        console.log('Created audio blob:', audioBlob.size, 'bytes, duration:', duration, 'seconds')
        
        // Only create audio URL and set state if we have actual audio data
        if (audioBlob.size > 0 && duration > 0) {
          const audioUrl = URL.createObjectURL(audioBlob)
          setState(prev => ({
            ...prev,
            audioBlob,
            audioUrl,
            duration,
            isRecording: false
          }))
        } else {
          console.warn('Recording has no audio data or duration is 0')
          setState(prev => ({
            ...prev,
            audioBlob: null,
            audioUrl: null,
            duration: 0,
            isRecording: false
          }))
        }
      }

      // Start recording - collect data more frequently
      mediaRecorder.start(250) // Collect data every 250ms instead of 100ms
      
      setState(prev => ({
        ...prev,
        isRecording: true,
        timeLeft: maxDuration,
        audioBlob: null,
        audioUrl: null,
        duration: 0
      }))

      // Start countdown timer
      timerRef.current = setInterval(() => {
        setState(prev => {
          const newTimeLeft = prev.timeLeft - 1
          if (newTimeLeft <= 0) {
            stopRecording()
            return { ...prev, timeLeft: 0 }
          }
          return { ...prev, timeLeft: newTimeLeft }
        })
      }, 1000)

    } catch (error) {
      console.error('Error starting recording:', error)
      throw new Error('Failed to start recording. Please check microphone permissions.')
    }
  }, [maxDuration])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const resetRecording = useCallback(() => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl)
    }
    
    setState({
      isRecording: false,
      isPaused: false,
      timeLeft: maxDuration,
      audioBlob: null,
      audioUrl: null,
      duration: 0
    })
    
    chunksRef.current = []
  }, [maxDuration, state.audioUrl])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  return {
    ...state,
    startRecording,
    stopRecording,
    resetRecording,
    formatTime
  }
}