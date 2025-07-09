import { useState, useEffect } from 'react'

export function useUserSession() {
  const [userSession, setUserSession] = useState<string>('')

  useEffect(() => {
    let session = localStorage.getItem('userSession')
    if (!session) {
      session = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('userSession', session)
    }
    setUserSession(session)
  }, [])

  return userSession
}