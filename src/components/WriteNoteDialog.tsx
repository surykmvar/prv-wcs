
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, MapPin, LocateFixed } from "lucide-react"
import { useSupabase } from "@/hooks/useSupabase"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { flagEmojiFromCountryCode, getBrowserCountryCode } from "@/utils/locale"

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

  // Step 1 -> Step 2 flow
  const [step, setStep] = useState<1 | 2>(1)
  const [city, setCity] = useState("")
  const [countryCode, setCountryCode] = useState<string>(getBrowserCountryCode() || "")
  const [scope, setScope] = useState<'global' | 'regional'>('global')
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string>("")

  const handleProceed = () => {
    if (!title.trim()) return
    setStep(2)
  }

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

  const detectLocation = async () => {
    setLocationError("")
    if (!('geolocation' in navigator)) {
      setLocationError("Geolocation is not supported in your browser.")
      return
    }
    try {
      setDetectingLocation(true)
      await new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const { latitude, longitude } = pos.coords
              const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
              const res = await fetch(url, {
                headers: { 'Accept': 'application/json' }
              })
              if (!res.ok) throw new Error('Reverse geocoding failed')
              const data = await res.json()
              const addr = data?.address || {}
              const foundCity = addr.city || addr.town || addr.village || addr.hamlet || addr.county || ""
              const code = (addr.country_code || "").toUpperCase()
              if (!foundCity || !code) {
                setLocationError("Couldn't determine city/country from your location. You can fill it manually.")
              }
              if (foundCity) setCity(foundCity)
              if (code) setCountryCode(code)
              resolve()
            } catch (e) {
              setLocationError("Failed to detect location. Please enter it manually.")
              resolve()
            }
          },
          (err) => {
            setLocationError(err.message || "Location permission denied. Please enter it manually.")
            resolve()
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
      })
    } finally {
      setDetectingLocation(false)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) return

    // Require authentication: if not logged in, save draft and redirect
    if (!user) {
      const draft = {
        title,
        description,
        tags,
        maxWoicesAllowed,
        city,
        countryCode,
        scope
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
        max_woices_allowed: maxWoicesAllowed,
        thought_scope: scope,
        country_code: scope === 'regional' ? (countryCode?.toUpperCase() || null) : null,
        city: scope === 'regional' && city.trim() ? city.trim() : null
      })
      
      // Reset form and clear draft
      setTitle("")
      setDescription("")
      setTags([])
      setTagInput("")
      setMaxWoicesAllowed(10)
      setCity("")
      setCountryCode(getBrowserCountryCode() || "")
      setScope('global')
      setStep(1)
      try { localStorage.removeItem('writeDraft') } catch {}
      
      onOpenChange(false)
      onSuccess?.(thought.id)
    } catch (error) {
      console.error('Failed to create thought:', error)
    }
  }
  useEffect(() => {
    if (open) {
      setStep(1)
      try {
        const raw = localStorage.getItem('writeDraft')
        if (raw) {
          const draft = JSON.parse(raw)
          setTitle(draft.title || '')
          setDescription(draft.description || '')
          setTags(Array.isArray(draft.tags) ? draft.tags : [])
          setMaxWoicesAllowed(draft.maxWoicesAllowed || 10)
          setCity(draft.city || '')
          setCountryCode(draft.countryCode || getBrowserCountryCode() || '')
          setScope(draft.scope === 'regional' ? 'regional' : 'global')
        } else {
          setCity('')
          setCountryCode(getBrowserCountryCode() || '')
          setScope('global')
        }
      } catch {}
    }
  }, [open])
  useEffect(() => {
    if (step === 2 && (!city || !countryCode)) {
      detectLocation()
    }
  }, [step])
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-lg mx-auto p-4 sm:p-6 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center sm:text-left">
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-center break-words px-2">
            What's your thought or question?
          </DialogTitle>
        </DialogHeader>
        
        {/* Sliding steps container */}
        <div className="relative overflow-hidden mt-4">
          <div
            className={`flex w-[200%] transition-transform duration-300 ease-out ${step === 1 ? 'translate-x-0' : '-translate-x-1/2'}`}
          >
            {/* Step 1: Core content */}
            <section className="w-1/2 px-1 sm:px-2 space-y-4 sm:space-y-5">
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
                          ? 'bg-woices-violet text-white hover:bg-woices-violet/95 active:bg-woices-violet focus-visible:ring-0 focus:ring-0 ring-0 outline-none'
                          : 'hover:bg-woices-violet/10'
                      }`}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleProceed}
                className="w-full bg-gradient-to-r from-woices-violet to-woices-mint hover:from-woices-violet/90 hover:to-woices-mint/90 text-white py-3 sm:py-3 text-base sm:text-lg font-medium rounded-xl shadow-md transition-all duration-300 mt-6"
                disabled={!title.trim()}
              >
                Proceed
              </Button>
            </section>

            {/* Step 2: Location & Scope */}
            <section className="w-1/2 px-1 sm:px-2 space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Where are you right now?</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="city" className="text-xs">City <span className="text-destructive">*</span></Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g., Berlin"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-xs">Country code <span className="text-destructive">*</span></Label>
                    <Input
                      id="country"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value.toUpperCase().slice(0,2))}
                      placeholder="e.g., DE, IN, US"
                      className="mt-1 uppercase"
                      maxLength={2}
                      required
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Detected: {flagEmojiFromCountryCode(countryCode)} {countryCode || 'Unknown'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button type="button" variant="outline" size="sm" onClick={detectLocation} disabled={detectingLocation}>
                    <LocateFixed className="h-4 w-4 mr-2" />
                    {detectingLocation ? 'Detecting...' : 'Use my current location'}
                  </Button>
                  {city && countryCode && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {city}, {countryCode} {flagEmojiFromCountryCode(countryCode)}
                    </div>
                  )}
                </div>
                {locationError && (
                  <p className="text-xs text-destructive mt-1">{locationError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Choose posting scope</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={scope === 'regional' ? 'default' : 'outline'}
                    onClick={() => setScope('regional')}
                    className={scope === 'regional' 
                      ? 'bg-woices-violet text-white hover:bg-woices-violet/95 active:bg-woices-violet focus-visible:ring-0 focus:ring-0 ring-0 outline-none shadow-none'
                      : 'hover:bg-woices-violet/10 focus-visible:ring-0 focus:ring-0 ring-0 outline-none'}
                  >
                    🏘️ Regional
                  </Button>
                  <Button
                    type="button"
                    variant={scope === 'global' ? 'default' : 'outline'}
                    onClick={() => setScope('global')}
                    className={scope === 'global' ? 'bg-woices-violet text-white' : ''}
                  >
                    🌐 Global
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {scope === 'global'
                    ? 'Global: anyone can reply (expect replies primarily in English).'
                    : 'Regional: only users in the same country can reply; replies may be in the local language.'}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="w-1/3" onClick={() => setStep(1)}>Back</Button>
                <Button 
                  onClick={handleSubmit}
                  className="w-2/3 bg-gradient-to-r from-woices-violet to-woices-mint hover:from-woices-violet/90 hover:to-woices-mint/90 text-white py-3 sm:py-3 text-base sm:text-lg font-medium rounded-xl shadow-md transition-all duration-300"
                  disabled={loading || !city.trim() || !countryCode}
                >
                  {loading ? 'Posting...' : 'Post and Wait for Woices'}
                </Button>
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
