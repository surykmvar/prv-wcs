
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
import { sanitizeText, sanitizeName } from "@/utils/sanitization"

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
    const value = sanitizeText(e.target.value)
    
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
      // Sanitize all inputs before creating thought
      const sanitizedTitle = sanitizeText(title.trim());
      const sanitizedDescription = description.trim() ? sanitizeText(description.trim()) : null;
      const sanitizedTags = tags.length > 0 ? tags.map(tag => sanitizeText(tag)) : null;
      const sanitizedCity = scope === 'regional' && city.trim() ? sanitizeName(city.trim()) : null;
      
      const thought = await createThought({
        title: sanitizedTitle,
        description: sanitizedDescription,
        tags: sanitizedTags,
        max_woices_allowed: maxWoicesAllowed,
        thought_scope: scope,
        country_code: countryCode?.toUpperCase() || null,
        city: sanitizedCity
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
                  onChange={(e) => setTitle(sanitizeText(e.target.value))}
                  placeholder="What's on your mind?"
                  className="w-full text-sm sm:text-base rounded-lg border-2 focus:border-woices-violet/50 transition-colors"
                  maxLength={200}
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
                  onChange={(e) => setDescription(sanitizeText(e.target.value))}
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
                    className={scope === 'global' 
                      ? 'bg-woices-violet text-white hover:bg-woices-violet/95 active:bg-woices-violet focus-visible:ring-0 focus:ring-0 ring-0 outline-none shadow-none'
                      : 'hover:bg-woices-violet/10 focus-visible:ring-0 focus:ring-0 ring-0 outline-none'}
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

              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium">Tell the viewers/voices where are you thinking from?</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {scope === 'regional' && (
                    <div>
                      <Label htmlFor="city" className="text-xs">City <span className="text-destructive">*</span></Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(sanitizeName(e.target.value))}
                        placeholder="e.g., Berlin"
                        className="mt-1"
                        maxLength={50}
                        required
                      />
                    </div>
                  )}
                  <div className={scope === 'regional' ? '' : 'sm:col-span-2'}>
                    <Label htmlFor="country" className="text-xs">
                      Country code {scope === 'regional' ? <span className="text-destructive">*</span> : '(optional)'}
                    </Label>
                    <select
                      id="country"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      required={scope === 'regional'}
                    >
                      <option value="">Select country...</option>
                      <option value="US">🇺🇸 United States (US)</option>
                      <option value="IN">🇮🇳 India (IN)</option>
                      <option value="GB">🇬🇧 United Kingdom (GB)</option>
                      <option value="DE">🇩🇪 Germany (DE)</option>
                      <option value="FR">🇫🇷 France (FR)</option>
                      <option value="CA">🇨🇦 Canada (CA)</option>
                      <option value="AU">🇦🇺 Australia (AU)</option>
                      <option value="JP">🇯🇵 Japan (JP)</option>
                      <option value="BR">🇧🇷 Brazil (BR)</option>
                      <option value="MX">🇲🇽 Mexico (MX)</option>
                      <option value="IT">🇮🇹 Italy (IT)</option>
                      <option value="ES">🇪🇸 Spain (ES)</option>
                      <option value="NL">🇳🇱 Netherlands (NL)</option>
                      <option value="SE">🇸🇪 Sweden (SE)</option>
                      <option value="NO">🇳🇴 Norway (NO)</option>
                      <option value="DK">🇩🇰 Denmark (DK)</option>
                      <option value="FI">🇫🇮 Finland (FI)</option>
                      <option value="CH">🇨🇭 Switzerland (CH)</option>
                      <option value="AT">🇦🇹 Austria (AT)</option>
                      <option value="BE">🇧🇪 Belgium (BE)</option>
                      <option value="PL">🇵🇱 Poland (PL)</option>
                      <option value="CZ">🇨🇿 Czech Republic (CZ)</option>
                      <option value="HU">🇭🇺 Hungary (HU)</option>
                      <option value="RO">🇷🇴 Romania (RO)</option>
                      <option value="BG">🇧🇬 Bulgaria (BG)</option>
                      <option value="HR">🇭🇷 Croatia (HR)</option>
                      <option value="SI">🇸🇮 Slovenia (SI)</option>
                      <option value="SK">🇸🇰 Slovakia (SK)</option>
                      <option value="LT">🇱🇹 Lithuania (LT)</option>
                      <option value="LV">🇱🇻 Latvia (LV)</option>
                      <option value="EE">🇪🇪 Estonia (EE)</option>
                      <option value="IE">🇮🇪 Ireland (IE)</option>
                      <option value="PT">🇵🇹 Portugal (PT)</option>
                      <option value="GR">🇬🇷 Greece (GR)</option>
                      <option value="CY">🇨🇾 Cyprus (CY)</option>
                      <option value="MT">🇲🇹 Malta (MT)</option>
                      <option value="LU">🇱🇺 Luxembourg (LU)</option>
                      <option value="IS">🇮🇸 Iceland (IS)</option>
                      <option value="LI">🇱🇮 Liechtenstein (LI)</option>
                      <option value="MC">🇲🇨 Monaco (MC)</option>
                      <option value="SM">🇸🇲 San Marino (SM)</option>
                      <option value="VA">🇻🇦 Vatican City (VA)</option>
                      <option value="AD">🇦🇩 Andorra (AD)</option>
                      <option value="RU">🇷🇺 Russia (RU)</option>
                      <option value="UA">🇺🇦 Ukraine (UA)</option>
                      <option value="BY">🇧🇾 Belarus (BY)</option>
                      <option value="MD">🇲🇩 Moldova (MD)</option>
                      <option value="CN">🇨🇳 China (CN)</option>
                      <option value="KR">🇰🇷 South Korea (KR)</option>
                      <option value="TW">🇹🇼 Taiwan (TW)</option>
                      <option value="HK">🇭🇰 Hong Kong (HK)</option>
                      <option value="MO">🇲🇴 Macau (MO)</option>
                      <option value="SG">🇸🇬 Singapore (SG)</option>
                      <option value="MY">🇲🇾 Malaysia (MY)</option>
                      <option value="TH">🇹🇭 Thailand (TH)</option>
                      <option value="VN">🇻🇳 Vietnam (VN)</option>
                      <option value="PH">🇵🇭 Philippines (PH)</option>
                      <option value="ID">🇮🇩 Indonesia (ID)</option>
                      <option value="BD">🇧🇩 Bangladesh (BD)</option>
                      <option value="PK">🇵🇰 Pakistan (PK)</option>
                      <option value="LK">🇱🇰 Sri Lanka (LK)</option>
                      <option value="NP">🇳🇵 Nepal (NP)</option>
                      <option value="BT">🇧🇹 Bhutan (BT)</option>
                      <option value="MV">🇲🇻 Maldives (MV)</option>
                      <option value="AF">🇦🇫 Afghanistan (AF)</option>
                      <option value="AE">🇦🇪 UAE (AE)</option>
                      <option value="SA">🇸🇦 Saudi Arabia (SA)</option>
                      <option value="QA">🇶🇦 Qatar (QA)</option>
                      <option value="KW">🇰🇼 Kuwait (KW)</option>
                      <option value="BH">🇧🇭 Bahrain (BH)</option>
                      <option value="OM">🇴🇲 Oman (OM)</option>
                      <option value="YE">🇾🇪 Yemen (YE)</option>
                      <option value="IQ">🇮🇶 Iraq (IQ)</option>
                      <option value="IR">🇮🇷 Iran (IR)</option>
                      <option value="TR">🇹🇷 Turkey (TR)</option>
                      <option value="IL">🇮🇱 Israel (IL)</option>
                      <option value="PS">🇵🇸 Palestine (PS)</option>
                      <option value="JO">🇯🇴 Jordan (JO)</option>
                      <option value="LB">🇱🇧 Lebanon (LB)</option>
                      <option value="SY">🇸🇾 Syria (SY)</option>
                      <option value="CY">🇨🇾 Cyprus (CY)</option>
                      <option value="GE">🇬🇪 Georgia (GE)</option>
                      <option value="AM">🇦🇲 Armenia (AM)</option>
                      <option value="AZ">🇦🇿 Azerbaijan (AZ)</option>
                      <option value="KZ">🇰🇿 Kazakhstan (KZ)</option>
                      <option value="UZ">🇺🇿 Uzbekistan (UZ)</option>
                      <option value="TM">🇹🇲 Turkmenistan (TM)</option>
                      <option value="KG">🇰🇬 Kyrgyzstan (KG)</option>
                      <option value="TJ">🇹🇯 Tajikistan (TJ)</option>
                      <option value="MN">🇲🇳 Mongolia (MN)</option>
                      <option value="ZA">🇿🇦 South Africa (ZA)</option>
                      <option value="EG">🇪🇬 Egypt (EG)</option>
                      <option value="MA">🇲🇦 Morocco (MA)</option>
                      <option value="DZ">🇩🇿 Algeria (DZ)</option>
                      <option value="TN">🇹🇳 Tunisia (TN)</option>
                      <option value="LY">🇱🇾 Libya (LY)</option>
                      <option value="SD">🇸🇩 Sudan (SD)</option>
                      <option value="ET">🇪🇹 Ethiopia (ET)</option>
                      <option value="KE">🇰🇪 Kenya (KE)</option>
                      <option value="UG">🇺🇬 Uganda (UG)</option>
                      <option value="TZ">🇹🇿 Tanzania (TZ)</option>
                      <option value="RW">🇷🇼 Rwanda (RW)</option>
                      <option value="BI">🇧🇮 Burundi (BI)</option>
                      <option value="DJ">🇩🇯 Djibouti (DJ)</option>
                      <option value="SO">🇸🇴 Somalia (SO)</option>
                      <option value="ER">🇪🇷 Eritrea (ER)</option>
                      <option value="SS">🇸🇸 South Sudan (SS)</option>
                      <option value="CF">🇨🇫 Central African Republic (CF)</option>
                      <option value="TD">🇹🇩 Chad (TD)</option>
                      <option value="CM">🇨🇲 Cameroon (CM)</option>
                      <option value="GQ">🇬🇶 Equatorial Guinea (GQ)</option>
                      <option value="GA">🇬🇦 Gabon (GA)</option>
                      <option value="CG">🇨🇬 Republic of Congo (CG)</option>
                      <option value="CD">🇨🇩 Democratic Republic of Congo (CD)</option>
                      <option value="AO">🇦🇴 Angola (AO)</option>
                      <option value="ZM">🇿🇲 Zambia (ZM)</option>
                      <option value="ZW">🇿🇼 Zimbabwe (ZW)</option>
                      <option value="BW">🇧🇼 Botswana (BW)</option>
                      <option value="NA">🇳🇦 Namibia (NA)</option>
                      <option value="SZ">🇸🇿 Eswatini (SZ)</option>
                      <option value="LS">🇱🇸 Lesotho (LS)</option>
                      <option value="MW">🇲🇼 Malawi (MW)</option>
                      <option value="MZ">🇲🇿 Mozambique (MZ)</option>
                      <option value="MG">🇲🇬 Madagascar (MG)</option>
                      <option value="MU">🇲🇺 Mauritius (MU)</option>
                      <option value="SC">🇸🇨 Seychelles (SC)</option>
                      <option value="KM">🇰🇲 Comoros (KM)</option>
                      <option value="ST">🇸🇹 São Tomé and Príncipe (ST)</option>
                      <option value="CV">🇨🇻 Cape Verde (CV)</option>
                      <option value="GW">🇬🇼 Guinea-Bissau (GW)</option>
                      <option value="GN">🇬🇳 Guinea (GN)</option>
                      <option value="SL">🇸🇱 Sierra Leone (SL)</option>
                      <option value="LR">🇱🇷 Liberia (LR)</option>
                      <option value="CI">🇨🇮 Côte d'Ivoire (CI)</option>
                      <option value="GH">🇬🇭 Ghana (GH)</option>
                      <option value="TG">🇹🇬 Togo (TG)</option>
                      <option value="BJ">🇧🇯 Benin (BJ)</option>
                      <option value="BF">🇧🇫 Burkina Faso (BF)</option>
                      <option value="NE">🇳🇪 Niger (NE)</option>
                      <option value="ML">🇲🇱 Mali (ML)</option>
                      <option value="SN">🇸🇳 Senegal (SN)</option>
                      <option value="GM">🇬🇲 Gambia (GM)</option>
                      <option value="MR">🇲🇷 Mauritania (MR)</option>
                      <option value="EH">🇪🇭 Western Sahara (EH)</option>
                      <option value="AR">🇦🇷 Argentina (AR)</option>
                      <option value="CL">🇨🇱 Chile (CL)</option>
                      <option value="UY">🇺🇾 Uruguay (UY)</option>
                      <option value="PY">🇵🇾 Paraguay (PY)</option>
                      <option value="BO">🇧🇴 Bolivia (BO)</option>
                      <option value="PE">🇵🇪 Peru (PE)</option>
                      <option value="EC">🇪🇨 Ecuador (EC)</option>
                      <option value="CO">🇨🇴 Colombia (CO)</option>
                      <option value="VE">🇻🇪 Venezuela (VE)</option>
                      <option value="GY">🇬🇾 Guyana (GY)</option>
                      <option value="SR">🇸🇷 Suriname (SR)</option>
                      <option value="GF">🇬🇫 French Guiana (GF)</option>
                      <option value="FK">🇫🇰 Falkland Islands (FK)</option>
                      <option value="GS">🇬🇸 South Georgia (GS)</option>
                      <option value="NZ">🇳🇿 New Zealand (NZ)</option>
                      <option value="FJ">🇫🇯 Fiji (FJ)</option>
                      <option value="PG">🇵🇬 Papua New Guinea (PG)</option>
                      <option value="SB">🇸🇧 Solomon Islands (SB)</option>
                      <option value="VU">🇻🇺 Vanuatu (VU)</option>
                      <option value="NC">🇳🇨 New Caledonia (NC)</option>
                      <option value="PF">🇵🇫 French Polynesia (PF)</option>
                      <option value="WF">🇼🇫 Wallis and Futuna (WF)</option>
                      <option value="CK">🇨🇰 Cook Islands (CK)</option>
                      <option value="NU">🇳🇺 Niue (NU)</option>
                      <option value="TK">🇹🇰 Tokelau (TK)</option>
                      <option value="WS">🇼🇸 Samoa (WS)</option>
                      <option value="AS">🇦🇸 American Samoa (AS)</option>
                      <option value="TO">🇹🇴 Tonga (TO)</option>
                      <option value="TV">🇹🇻 Tuvalu (TV)</option>
                      <option value="KI">🇰🇮 Kiribati (KI)</option>
                      <option value="NR">🇳🇷 Nauru (NR)</option>
                      <option value="MH">🇲🇭 Marshall Islands (MH)</option>
                      <option value="FM">🇫🇲 Micronesia (FM)</option>
                      <option value="PW">🇵🇼 Palau (PW)</option>
                      <option value="MP">🇲🇵 Northern Mariana Islands (MP)</option>
                      <option value="GU">🇬🇺 Guam (GU)</option>
                    </select>
                    <div className="text-xs text-muted-foreground mt-1">
                      Selected: {flagEmojiFromCountryCode(countryCode)} {countryCode || 'None'}
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


              <div className="flex flex-col gap-2 mt-4">
                <Button variant="outline" className="w-full" onClick={() => setStep(1)}>Back</Button>
                <Button 
                  onClick={handleSubmit}
                  className="w-full hover-scale bg-gradient-to-r from-woices-violet to-woices-mint hover:from-woices-violet/90 hover:to-woices-mint/90 text-white py-3 sm:py-3 text-base sm:text-lg font-medium rounded-xl shadow-md transition-all duration-300"
                  disabled={loading || (scope === 'regional' && (!city.trim() || !countryCode))}
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
