import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Instagram, Facebook, Twitter, Linkedin } from "lucide-react"
import { EchoLevels } from "./EchoLevels"
import { DynamicWaveform } from "./DynamicWaveform"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useAudioUrl } from "@/hooks/useAudioUrl"

interface VoiceReview {
  id: string
  reviewerName: string
  productName: string
  duration: number
  rating: number
  isPlaying: boolean
  location: string
  date: string
  audioUrl?: string
  gender: 'male' | 'female'
}

const VoiceWidgetDemoEnhanced = () => {
  const [playingReview, setPlayingReview] = useState<string | null>(null)

  const sampleReviews: VoiceReview[] = [
    {
      id: "1",
      reviewerName: "Lisa Martinez",
      productName: "Premium Wireless Headphones",
      duration: 15,
      rating: 2,
      isPlaying: playingReview === "1",
      location: "San Francisco, CA",
      date: "2 hours ago",
      audioUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav",
      gender: 'female'
    },
    {
      id: "2", 
      reviewerName: "David Kim",
      productName: "Smart Fitness Tracker",
      duration: 32,
      rating: 3,
      isPlaying: playingReview === "2",
      location: "Austin, TX",
      date: "5 hours ago",
      audioUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/PinkPanther30.wav",
      gender: 'male'
    },
    {
      id: "3",
      reviewerName: "Alex Johnson", 
      productName: "Ergonomic Office Chair",
      duration: 45,
      rating: 5,
      isPlaying: playingReview === "3",
      location: "Seattle, WA", 
      date: "1 day ago",
      audioUrl: "https://www2.cs.uic.edu/~i101/SoundFiles/StarWars60.wav",
      gender: 'male'
    }
  ]

  const handlePlayPause = (reviewId: string) => {
    setPlayingReview(playingReview === reviewId ? null : reviewId)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const socialPlatforms = [
    { icon: Instagram, name: "Instagram" },
    { icon: Facebook, name: "Facebook" }, 
    { icon: Twitter, name: "Twitter" },
    { icon: Linkedin, name: "LinkedIn" }
  ]

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-woices-violet via-woices-sky to-woices-mint bg-clip-text text-transparent mb-4">
            Modern Voice Rating System
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The future of authentic reviews - beyond 5-star ratings. A new rating component for the new age of reviews.
          </p>
        </div>

        {/* Website Integration */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-foreground">
            Website Integration
          </h3>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Showcase authentic voice reviews on your website, portfolio, or blog - more personal and trustworthy than traditional text reviews.
          </p>
          
          <div className="relative max-w-4xl mx-auto">
            <Carousel className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {sampleReviews.map((review, index) => (
                  <CarouselItem key={review.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <div className="h-full">
                      <VoiceReviewCard review={review} onPlayPause={handlePlayPause} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        </div>

        {/* Social Media Integration */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-foreground">
            Social Media Integration
          </h3>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Share voice reviews across social platforms to build authentic connections and trust with your audience.
          </p>
          
          <div className="max-w-md mx-auto">
            <Card className="panel overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-woices-violet to-woices-sky"></div>
                  <div>
                    <p className="font-semibold text-sm">{sampleReviews[2].reviewerName}</p>
                    <p className="text-xs text-muted-foreground">{sampleReviews[2].location} • {sampleReviews[2].date}</p>
                  </div>
                </div>
                
                <p className="text-sm mb-4">
                  Just tried the {sampleReviews[2].productName} - here's my honest voice review! 🎧
                </p>
                
                <Card className="mb-4 bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-8 h-8 rounded-full p-0"
                          onClick={() => handlePlayPause(sampleReviews[2].id)}
                        >
                          {sampleReviews[2].isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <span className="text-sm font-medium">{formatTime(sampleReviews[2].duration)}</span>
                      </div>
                      <EchoLevels rating={sampleReviews[2].rating} size="sm" />
                    </div>
                    <DynamicWaveform isPlaying={sampleReviews[2].isPlaying} progress={sampleReviews[2].isPlaying ? 0.6 : 0} className="h-8" />
                  </CardContent>
                </Card>
                
                <p className="text-xs text-muted-foreground">
                  💬 24 comments • 🔄 12 shares • ❤️ 89 likes
                </p>
              </CardContent>
            </Card>
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

const VoiceReviewCard = ({ review, onPlayPause }: {
  review: VoiceReview
  onPlayPause: (id: string) => void
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="panel h-full transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-woices-violet via-woices-sky to-woices-mint"></div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{review.reviewerName}</p>
            <p className="text-xs text-muted-foreground">{review.location}</p>
          </div>
          <EchoLevels rating={review.rating} size="sm" />
        </div>
        
        <h4 className="font-medium text-sm mb-3 line-clamp-2">{review.productName}</h4>
        
        <div className="flex-1 flex flex-col justify-end">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="outline"
              size="sm"
              className="w-10 h-10 rounded-full p-0 bg-gradient-to-r from-woices-violet/10 to-woices-sky/10 border-woices-violet/20"
              onClick={() => onPlayPause(review.id)}
            >
              {review.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <span className="text-sm text-muted-foreground">
              {review.isPlaying ? `Playing...` : formatTime(review.duration)}
            </span>
          </div>
          
          <DynamicWaveform 
            isPlaying={review.isPlaying} 
            progress={review.isPlaying ? 0.4 : 0}
            className="h-6"
          />
          
          <p className="text-xs text-muted-foreground mt-2">{review.date}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default VoiceWidgetDemoEnhanced