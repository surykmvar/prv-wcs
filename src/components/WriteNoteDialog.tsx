
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Hash, MessageSquare, Users } from "lucide-react"
import { useSupabase } from "@/hooks/useSupabase"
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
  
  const { createThought, loading } = useSupabase()
  const { user } = useAuth()

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
    
    try {
      const thought = await createThought({
        title: title.trim(),
        description: description.trim() || null,
        tags: tags.length > 0 ? tags : null,
        max_woices_allowed: maxWoicesAllowed
      }, user?.id)
      
      // Reset form
      setTitle("")
      setDescription("")
      setTags([])
      setTagInput("")
      setMaxWoicesAllowed(10)
      
      onOpenChange(false)
      onSuccess?.(thought.id)
    } catch (error) {
      console.error('Failed to create thought:', error)
    }
  }

  const characterCount = description.length
  const maxChars = 600

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-2xl mx-auto p-0 rounded-2xl shadow-[var(--shadow-medium)] max-h-[90vh] overflow-hidden">
        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-center mb-2">
              What's on your mind?
            </DialogTitle>
            <p className="text-muted-foreground text-center text-sm">
              Share your thoughts and get insights from the community
            </p>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Title Input */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-woices-violet" />
                <Label htmlFor="title" className="text-base font-semibold">
                  Title
                </Label>
              </div>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your thought or question?"
                className="w-full text-base rounded-xl border-2 border-input focus:border-primary transition-all duration-200 px-4 py-3 bg-card"
              />
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Label htmlFor="description" className="text-base font-semibold">
                Description
              </Label>
              <p className="text-sm text-muted-foreground">
                Add some context to help others understand your note
              </p>
              <div className="relative">
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share more details about your thought..."
                  className="w-full min-h-[120px] resize-none text-base rounded-xl border-2 border-input focus:border-primary transition-all duration-200 px-4 py-3 bg-card"
                  maxLength={maxChars}
                />
                <div className={`absolute bottom-3 right-3 text-xs transition-colors ${
                  characterCount > maxChars * 0.9 ? 'text-destructive' : 'text-muted-foreground'
                }`}>
                  {characterCount}/{maxChars}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-woices-mint" />
                <Label htmlFor="tags" className="text-base font-semibold">
                  Tags <span className="text-sm font-normal text-muted-foreground">(Optional)</span>
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Type a tag and press Enter or Space. Max 3 tags.
              </p>
              <Input
                id="tags"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleAddTag}
                placeholder="startup, creativity, career..."
                className={`w-full text-base rounded-xl border-2 transition-all duration-200 px-4 py-3 bg-card ${
                  tagError ? 'border-destructive focus:border-destructive' : 'border-input focus:border-primary'
                }`}
                disabled={tags.length >= 3}
              />
              
              {tagError && (
                <Alert variant="destructive" className="rounded-xl">
                  <AlertDescription className="text-sm">
                    {tagError}
                  </AlertDescription>
                </Alert>
              )}
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      className="px-3 py-1.5 text-sm rounded-full bg-tag text-tag-foreground border-0 flex items-center gap-2 hover:bg-tag/80 transition-colors"
                    >
                      #{tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent opacity-70 hover:opacity-100"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Woice Count Selector */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-woices-sky" />
                <Label className="text-base font-semibold">
                  How many Woice reviews do you want?
                </Label>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[5, 10, 15, 20, 25, 30].map((num) => (
                  <Button
                    key={num}
                    variant={maxWoicesAllowed === num ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMaxWoicesAllowed(num)}
                    className={`rounded-xl font-medium transition-all duration-200 ${
                      maxWoicesAllowed === num 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'hover:bg-accent hover:text-accent-foreground border-2'
                    }`}
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button 
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-woices-violet to-woices-mint hover:opacity-90 text-white py-3 text-lg font-semibold rounded-xl shadow-[var(--shadow-soft)] transition-all duration-300 hover:shadow-[var(--shadow-medium)]"
                disabled={!title.trim() || loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Posting...
                  </div>
                ) : (
                  'Post and Wait for Woice-Replies'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
