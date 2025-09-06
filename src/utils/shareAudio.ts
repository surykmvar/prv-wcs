import { useAudioUrl } from '@/hooks/useAudioUrl'

export async function shareAudioFile(audioUrl: string, title: string = 'Voice Reply') {
  try {
    // For Web Share API with files, we need to fetch the actual file
    const response = await fetch(audioUrl)
    const blob = await response.blob()
    
    const file = new File([blob], `${title}.mp3`, { type: 'audio/mpeg' })
    
    const shareData = {
      title: title,
      files: [file]
    }
    
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData)
      return true
    }
    
    // Fallback: trigger download
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}.mp3`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    return true
  } catch (error) {
    console.error('Error sharing audio:', error)
    
    // Last fallback: copy link
    try {
      await navigator.clipboard.writeText(audioUrl)
      console.log('Audio URL copied to clipboard')
      return false
    } catch (clipboardError) {
      console.error('Failed to copy to clipboard:', clipboardError)
      return false
    }
  }
}