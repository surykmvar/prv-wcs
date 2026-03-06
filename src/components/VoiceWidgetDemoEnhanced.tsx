import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Instagram, Facebook, Linkedin } from "lucide-react"
import { ModernVoicePlayer } from "./ModernVoicePlayer"
import { VotingButtons } from "./VotingButtons"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { supabase } from "@/integrations/supabase/client"
import { ErrorBoundary } from "./ErrorBoundary"
import demoVoiceFemale from "@/assets/demo-voice-female-15s.wav"
import demoVoiceMale32 from "@/assets/demo-voice-male-32s.wav"
import demoVoiceMale45 from "@/assets/demo-voice-male-45s.wav"

// X/Twitter icon component (updated from Twitter)
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

interface VoiceWidget {
  id: string
  reviewer_name: string
  product_name: string
  location: string
  duration: number
  rating: number
  audio_url?: string
  gender: 'male' | 'female'
  avatar_url?: string
  myth_votes: number
  fact_votes: number
  unclear_votes: number
  widget_type: 'website' | 'social'
  display_order: number
}

const VoiceWidgetDemoEnhanced = () => {
  const [websiteWidgets, setWebsiteWidgets] = useState<VoiceWidget[]>([])
  const [socialWidgets, setSocialWidgets] = useState<VoiceWidget[]>([])
  const [loading, setLoading] = useState(true)

  // Fallback demo data with real audio files
  const fallbackWebsiteWidgets: VoiceWidget[] = [
    {
      id: "demo-1",
      reviewer_name: "Lisa Martinez",
      product_name: "Premium Wireless Headphones",
      location: "San Francisco, CA",
      duration: 15,
      rating: 2,
      audio_url: demoVoiceFemale,
      gender: 'female',
      myth_votes: 12,
      fact_votes: 3,
      unclear_votes: 8,
      widget_type: 'website',
      display_order: 1
    },
    {
      id: "demo-2",
      reviewer_name: "David Kim",
      product_name: "Smart Fitness Tracker",
      location: "Austin, TX",
      duration: 32,
      rating: 3,
      audio_url: demoVoiceMale32,
      gender: 'male',
      myth_votes: 8,
      fact_votes: 15,
      unclear_votes: 6,
      widget_type: 'website',
      display_order: 2
    },
    {
      id: "demo-3",
      reviewer_name: "Alex Johnson",
      product_name: "Ergonomic Office Chair",
      location: "Seattle, WA",
      duration: 45,
      rating: 5,
      audio_url: demoVoiceMale45,
      gender: 'male',
      myth_votes: 2,
      fact_votes: 28,
      unclear_votes: 4,
      widget_type: 'website',
      display_order: 3
    }
  ]

  const fallbackSocialWidgets: VoiceWidget[] = [
    {
      id: "demo-social-1",
      reviewer_name: "Alex Johnson",
      product_name: "Ergonomic Office Chair",
      location: "Seattle, WA",
      duration: 45,
      rating: 5,
      audio_url: demoVoiceMale45,
      gender: 'male',
      myth_votes: 2,
      fact_votes: 28,
      unclear_votes: 4,
      widget_type: 'social',
      display_order: 1
    }
  ]

  useEffect(() => {
    loadWidgets()
  }, [])

  const loadWidgets = async () => {
    try {
      const { data: widgets, error } = await supabase
        .from('landing_page_widgets')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (error) throw error

      if (widgets && widgets.length > 0) {
        const websiteWidgets = widgets.filter(w => w.widget_type === 'website')
        const socialWidgets = widgets.filter(w => w.widget_type === 'social')
        
        setWebsiteWidgets(websiteWidgets.map(w => ({
          ...w,
          gender: w.gender as 'male' | 'female',
          widget_type: w.widget_type as 'website' | 'social',
          audio_url: w.audio_url || (w.gender === 'female' ? demoVoiceFemale : w.duration <= 32 ? demoVoiceMale32 : demoVoiceMale45)
        })))
        setSocialWidgets(socialWidgets.map(w => ({
          ...w,
          gender: w.gender as 'male' | 'female',
          widget_type: w.widget_type as 'website' | 'social',
          audio_url: w.audio_url || (w.gender === 'female' ? demoVoiceFemale : w.duration <= 32 ? demoVoiceMale32 : demoVoiceMale45)
        })))
      } else {
        // Use fallback data if no widgets in database
        setWebsiteWidgets(fallbackWebsiteWidgets)
        setSocialWidgets(fallbackSocialWidgets)
      }
    } catch (error) {
      console.error('Error loading widgets:', error)
      // Use fallback data on error
      setWebsiteWidgets(fallbackWebsiteWidgets)
      setSocialWidgets(fallbackSocialWidgets)
    } finally {
      setLoading(false)
    }
  }

  const socialPlatforms = [
    { icon: Instagram, name: "Instagram" },
    { icon: Facebook, name: "Facebook" }, 
    { icon: XIcon, name: "X" },
    { icon: Linkedin, name: "LinkedIn" }
  ]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <section className="py-20 px-4 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading demo widgets...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background via-muted/20 to-background overflow-x-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Website Integration */}
        <ErrorBoundary>
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-foreground">
            Website Integration
          </h3>
          <p className="text-center text-muted-foreground text-sm mb-8 max-w-2xl mx-auto">
            Authentic • Personal • Trustworthy • Portfolio Ready
          </p>
          
          <div className="relative max-w-5xl mx-auto px-12">
            <Carousel 
              className="w-full"
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {websiteWidgets.map((widget, index) => (
                  <CarouselItem key={widget.id} className="pl-2 md:pl-4 basis-11/12 sm:basis-1/2 lg:basis-1/3">
                    <div className="h-full">
                      <VoiceReviewCard widget={widget} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
        </ErrorBoundary>

        {/* Social Media Integration */}
        <ErrorBoundary>
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-foreground">
            Social Media Integration
          </h3>
          <p className="text-center text-muted-foreground text-sm mb-8 max-w-2xl mx-auto">
            Instagram • TikTok • LinkedIn • Twitter • Link in Bio
          </p>
          
          <div className="max-w-md mx-auto">
            {socialWidgets.length > 0 && (
              <Card className="panel overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-woices-violet to-woices-sky"
                      style={socialWidgets[0].avatar_url ? {
                        backgroundImage: `url(${socialWidgets[0].avatar_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      } : {}}
                    ></div>
                    <div>
                      <p className="font-semibold text-sm">{socialWidgets[0].reviewer_name}</p>
                      <p className="text-xs text-muted-foreground">{socialWidgets[0].location} • 2 hours ago</p>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-4">
                    Just tried the {socialWidgets[0].product_name} - here's my honest voice review! 🎧
                  </p>
                  
                  <div className="mb-4">
                    <ModernVoicePlayer
                      voiceResponseId={socialWidgets[0].id}
                      audioUrl={socialWidgets[0].audio_url || ""}
                      duration={socialWidgets[0].duration}
                      mythVotes={socialWidgets[0].myth_votes}
                      factVotes={socialWidgets[0].fact_votes}
                      unclearVotes={socialWidgets[0].unclear_votes}
                      className="bg-muted/30"
                      demo={true}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <div className="flex gap-4">
                      <span>{socialWidgets[0].fact_votes + socialWidgets[0].myth_votes + socialWidgets[0].unclear_votes} votes</span>
                      <span>12 shares</span>
                    </div>
                    <span>89 likes</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Social Platform Logos */}
          <div className="flex justify-center items-center gap-6 mt-8">
            <p className="text-sm text-muted-foreground mr-4">Share across platforms:</p>
            {socialPlatforms.map((platform) => (
              <div key={platform.name} className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 hover:bg-muted transition-colors">
                <platform.icon className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const VoiceReviewCard = ({ widget }: { widget: VoiceWidget }) => {
  return (
    <Card className="panel h-full transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-12 h-12 rounded-full bg-gradient-to-br from-woices-violet via-woices-sky to-woices-mint"
            style={widget.avatar_url ? {
              backgroundImage: `url(${widget.avatar_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } : {}}
          ></div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{widget.reviewer_name}</p>
            <p className="text-xs text-muted-foreground">{widget.location}</p>
          </div>
        </div>
        
        <h4 className="font-medium text-sm mb-3 line-clamp-2">{widget.product_name}</h4>
        
        <div className="flex-1 flex flex-col justify-end">
          <ModernVoicePlayer
            voiceResponseId={widget.id}
            audioUrl={widget.audio_url || ""}
            duration={widget.duration}
            mythVotes={widget.myth_votes}
            factVotes={widget.fact_votes}
            unclearVotes={widget.unclear_votes}
            demo={true}
          />
          
          <p className="text-xs text-muted-foreground mt-2">2 hours ago</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default VoiceWidgetDemoEnhanced