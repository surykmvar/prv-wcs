
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X } from "lucide-react"
import { useSupabase } from "@/hooks/useSupabase"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

interface WriteNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (thoughtId: string) => void
}

export function WriteNoteDialog({ open, onOpenChange, onSuccess }: WriteNoteDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [maxWoicesAllowed, setMaxWoicesAllowed] = useState(10)
  const [tagError, setTagError] = useState("")
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const { createThought, loading } = useSupabase()

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    
    // Check for manual hashtag entry
    if (value.includes('#')) {
      setTagError("Don't include '#' - just type the tag and hit Enter. We'll add the hashtag for you!")
      return
    }
    
    // Check for hashtags in between words (spaces with more content after)
    if (value.includes(' ') && value.trim().split(' ').length > 1) {
      setTagError("Please enter one tag at a time. Hit Enter after each tag.")
      return
    }
    
    setTagError("")
    setTagInput(value)
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      const tag = tagInput.trim()
      
      if (tagError) return
      
      if (tag && !tags.includes(tag) && tags.length < 3) {
        setTags([...tags, tag])
        setTagInput("")
        setTagError("")
      }
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async () => {
    if (!title.trim()) return

    // Require authentication: if not logged in, save draft and redirect
    if (!user) {
      const draft = {
        title,
        description,
        tags,
        maxWoicesAllowed
      }
      try { localStorage.setItem('writeDraft', JSON.stringify(draft)) } catch {}
      navigate(`/auth?mode=signup&redirect=${encodeURIComponent('/?open=write')}`)
      return
    }
    
    try {
      const thought = await createThought({
        title: title.trim(),
        description: description.trim() || null,
        tags: tags.length > 0 ? tags : null,
        max_woices_allowed: maxWoicesAllowed
      })
      
      // Reset form and clear draft
      setTitle("")
      setDescription("")
      setTags([])
      setTagInput("")
      setMaxWoicesAllowed(10)
      try { localStorage.removeItem('writeDraft') } catch {}
      
      onOpenChange(false)
      onSuccess?.(thought.id)
    } catch (error) {
      console.error('Failed to create thought:', error)
    }
  }
  useEffect(() => {
    if (open) {
      try {
        const raw = localStorage.getItem('writeDraft')
        if (raw) {
          const draft = JSON.parse(raw)
          setTitle(draft.title || '')
          setDescription(draft.description || '')
          setTags(Array.isArray(draft.tags) ? draft.tags : [])
          setMaxWoicesAllowed(draft.maxWoicesAllowed || 10)
        }
      } catch {}
    }
  }, [open])
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-lg mx-auto p-4 sm:p-6 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center sm:text-left">
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-center break-words px-2">
            What's your thought or question?
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm sm:text-base font-medium">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full text-sm sm:text-base rounded-lg border-2 focus:border-woices-violet/50 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm sm:text-base font-medium">
              Description
            </Label>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Add context to help others understand your note. (Maximum 600 characters)
            </p>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details about your thought or question..."
              className="w-full min-h-[100px] sm:min-h-[120px] resize-none text-sm sm:text-base rounded-lg border-2 focus:border-woices-violet/50 transition-colors"
              maxLength={600}
            />
            <div className="text-right text-xs sm:text-sm text-muted-foreground">
              {description.length}/600
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm sm:text-base font-medium">
              Tags (Optional)
            </Label>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Type a tag and hit Enter to add it as a hashtag. Maximum 3 tags allowed.
            </p>
            <Input
              id="tags"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleAddTag}
              placeholder="#startup #creativity #career"
              className={`w-full text-sm sm:text-base rounded-lg border-2 transition-colors ${
                tagError ? 'border-red-500 focus:border-red-500' : 'focus:border-woices-violet/50'
              }`}
              disabled={tags.length >= 3}
            />
            {tagError && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription className="text-xs sm:text-sm">
                  {tagError}
                </AlertDescription>
              </Alert>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md">
                    #{tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 p-0 hover:bg-transparent"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-2 w-2 sm:h-3 sm:w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm sm:text-base font-medium flex items-center gap-2">
              🗣️ Choose how many Woice Reviews you want:
            </Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[5, 10, 15, 20, 25, 30].map((num) => (
                <Button
                  key={num}
                  variant={maxWoicesAllowed === num ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMaxWoicesAllowed(num)}
                  className={`text-sm font-medium ${
                    maxWoicesAllowed === num 
                      ? 'bg-woices-violet text-white' 
                      : 'hover:bg-woices-violet/10'
                  }`}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-woices-violet to-woices-mint hover:from-woices-violet/90 hover:to-woices-mint/90 text-white py-3 sm:py-3 text-base sm:text-lg font-medium rounded-xl shadow-md transition-all duration-300 mt-6"
            disabled={!title.trim() || loading}
          >
            {loading ? 'Posting...' : 'Post and Wait for Woices'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
