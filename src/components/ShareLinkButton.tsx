import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Check } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ShareLinkButtonProps {
  thoughtId: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  showLabel?: boolean
}

export function ShareLinkButton({ 
  thoughtId, 
  variant = 'outline', 
  size = 'sm', 
  className = '',
  showLabel = false 
}: ShareLinkButtonProps) {
  const [linkCopied, setLinkCopied] = useState(false)

  const handleShareLink = async () => {
    const shareUrl = `${window.location.origin}/thought/${thoughtId}`
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
      
      toast({
        title: "Link copied",
        description: "Share this thought anywhere."
      })
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textarea = document.createElement('textarea')
      textarea.value = shareUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
      
      toast({
        title: "Link copied",
        description: "Fallback copy succeeded."
      })
    }
  }

  return (
    <Button
      onClick={handleShareLink}
      variant={variant}
      size={size}
      className={`${className} ${size === 'sm' ? 'h-7 w-7 sm:h-8 sm:w-8 p-0' : ''}`}
      aria-label="Copy share link"
    >
      {linkCopied ? (
        <>
          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
          {showLabel && <span className="ml-1">Copied</span>}
        </>
      ) : (
        <>
          <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
          {showLabel && <span className="ml-1">Share</span>}
        </>
      )}
    </Button>
  )
}