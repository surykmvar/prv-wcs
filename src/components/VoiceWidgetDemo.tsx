import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Play, Pause } from "lucide-react"
import { useState } from "react"
import { VoiceReviewPlayer } from "./VoiceReviewPlayer"
import { EchoLevels } from "./EchoLevels"
import { DynamicWaveform } from "./DynamicWaveform"

interface VoiceReview {
  id: string
  reviewerName: string
  productName: string
  duration: number
  rating: number
  isPlaying: boolean
  location: string
  date: string
}

export const VoiceWidgetDemo = () => {
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null)

  // Three different examples showcasing rating levels
  const sampleReviews: VoiceReview[] = [
    {
      id: "1",
      reviewerName: "David Kim",
      productName: "Budget Earbuds 2024",
      duration: 15,
      rating: 1, // Bad - Red ripples
      isPlaying: false,
      location: "New York, NY",
      date: "1 day ago"
    },
    {
      id: "2", 
      reviewerName: "Lisa Martinez",
      productName: "Mid-Range Laptop",
      duration: 32,
      rating: 3, // Okay - Orange ripples
      isPlaying: false,
      location: "Denver, CO",
      date: "2 days ago"
    },
    {
      id: "3",
      reviewerName: "Alex Johnson",
      productName: "Premium Coffee Machine",
      duration: 45,
      rating: 5, // Amazing - Green ripples
      isPlaying: false,
      location: "Portland, OR", 
      date: "3 days ago"
    }
  ]

  const handlePlayPause = (reviewId: string) => {
    setCurrentPlaying(currentPlaying === reviewId ? null : reviewId)
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      <div className="text-center mb-4 sm:mb-6 px-2 sm:px-4">
        <h3 className="text-lg sm:text-xl font-semibold mb-2">Echo Levels Rating System Demo</h3>
        <p className="text-muted-foreground text-xs sm:text-sm">Experience the new visual rating system: Bad → Okay → Amazing!</p>
      </div>

      {/* Desktop/Website Demo */}
      <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-2 sm:p-4 mx-1 sm:mx-0 max-w-full">
        <div className="mb-3 sm:mb-4">
          <Badge variant="outline" className="text-xs">Website Integration</Badge>
          <p className="text-xs text-muted-foreground mt-2">Watch how the ripple colors change with each rating level</p>
        </div>
        <div className="grid gap-2 sm:gap-4 max-w-full">
          {sampleReviews.map((review, index) => (
            <div key={review.id} className="max-w-full overflow-hidden">
              <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2 max-w-full">
                <span className="text-xs font-medium text-muted-foreground px-1 sm:px-2 py-1 bg-muted/50 rounded text-center break-words flex-shrink min-w-0">
                  <span className="block sm:hidden">
                    {index === 0 && "📍 Bad (Red)"}
                    {index === 1 && "📍 Okay (Orange)"}
                    {index === 2 && "📍 Amazing (Green)"}
                  </span>
                  <span className="hidden sm:block">
                    {index === 0 && "📍 Bad Experience (1 star) - Red ripples"}
                    {index === 1 && "📍 Okay Experience (3 stars) - Orange ripples"}
                    {index === 2 && "📍 Amazing Experience (5 stars) - Green ripples"}
                  </span>
                </span>
              </div>
              <div className="max-w-full overflow-hidden">
                <VoiceReviewPlayer
                  reviewerName={review.reviewerName}
                  productName={review.productName}
                  duration={review.duration}
                  rating={review.rating}
                  location={review.location}
                  date={review.date}
                  isPlaying={currentPlaying === review.id}
                  onPlayPause={() => handlePlayPause(review.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile/Social Media Demo */}
      <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-2 sm:p-4 mx-1 sm:mx-0 max-w-full">
        <div className="mb-3 sm:mb-4">
          <Badge variant="outline" className="text-xs">Social Media Share</Badge>
          <p className="text-xs text-muted-foreground mt-2">Beautiful, shareable voice reviews with Echo Levels</p>
        </div>
        <div className="max-w-sm mx-auto">
          <Card className="border-border/30 max-w-full">
            <CardHeader className="pb-3 px-2 sm:px-6">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-woices-mint to-woices-sky flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs sm:text-sm font-bold">AJ</span>
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-xs sm:text-sm truncate">Alex Johnson</CardTitle>
                  <p className="text-xs text-muted-foreground truncate">@alexj_tech</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-2 sm:px-6">
              <p className="text-xs sm:text-sm mb-2 sm:mb-3 leading-relaxed">
                This premium coffee machine absolutely blew my mind! Listen to my full review 🎤✨
              </p>
              
              <div className="bg-muted/20 rounded-lg p-1.5 sm:p-3 flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3 max-w-full overflow-hidden">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handlePlayPause("social")}
                  className="w-5 h-5 sm:w-8 sm:h-8 p-0 rounded-full bg-woices-violet hover:bg-woices-violet/90 text-white flex-shrink-0"
                >
                  {currentPlaying === "social" ? (
                    <Pause className="w-2 h-2 sm:w-3 sm:h-3" />
                  ) : (
                    <Play className="w-2 h-2 sm:w-3 sm:h-3 ml-0.5" />
                  )}
                </Button>
                
                <div className="flex-1 min-w-0 overflow-hidden">
                  <DynamicWaveform 
                    isPlaying={currentPlaying === "social"} 
                    progress={0}
                    className="w-full"
                  />
                </div>
                
                <div className="text-xs text-muted-foreground flex-shrink-0 min-w-[20px] sm:min-w-[32px] text-right">
                  0:45
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground gap-1 sm:gap-2 min-w-0">
                <span className="truncate flex-1 min-w-0">Premium Coffee Machine</span>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <EchoLevels rating={5} size="sm" />
                  <span className="hidden sm:inline">Portland, OR</span>
                  <span className="sm:hidden text-xs">Portland</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}