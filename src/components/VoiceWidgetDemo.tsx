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
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Echo Levels Rating System Demo</h3>
        <p className="text-muted-foreground text-sm">Experience the new visual rating system: Bad → Okay → Amazing!</p>
      </div>

      {/* Desktop/Website Demo */}
      <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-4">
        <div className="mb-4">
          <Badge variant="outline" className="text-xs">Website Integration</Badge>
          <p className="text-xs text-muted-foreground mt-2">Watch how the ripple colors change with each rating level</p>
        </div>
        <div className="grid gap-4">
          {sampleReviews.map((review, index) => (
            <div key={review.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-muted/50 rounded">
                  {index === 0 && "📍 Bad Experience (1 star) - Red ripples"}
                  {index === 1 && "📍 Okay Experience (3 stars) - Orange ripples"}
                  {index === 2 && "📍 Amazing Experience (5 stars) - Green ripples"}
                </span>
              </div>
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
          ))}
        </div>
      </div>

      {/* Mobile/Social Media Demo */}
      <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-4">
        <div className="mb-4">
          <Badge variant="outline" className="text-xs">Social Media Share</Badge>
          <p className="text-xs text-muted-foreground mt-2">Beautiful, shareable voice reviews with Echo Levels</p>
        </div>
        <div className="max-w-sm mx-auto">
          <Card className="border-border/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-woices-mint to-woices-sky flex items-center justify-center">
                  <span className="text-white text-sm font-bold">AJ</span>
                </div>
                <div>
                  <CardTitle className="text-sm">Alex Johnson</CardTitle>
                  <p className="text-xs text-muted-foreground">@alexj_tech</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm mb-3">
                This premium coffee machine absolutely blew my mind! Listen to my full review 🎤✨
              </p>
              
              <div className="bg-muted/20 rounded-lg p-3 flex items-center gap-2 mb-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handlePlayPause("social")}
                  className="w-8 h-8 p-0 rounded-full bg-woices-violet hover:bg-woices-violet/90 text-white flex-shrink-0"
                >
                  {currentPlaying === "social" ? (
                    <Pause className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3 ml-0.5" />
                  )}
                </Button>
                
                <div className="flex-1 min-w-0 mx-1">
                  <DynamicWaveform 
                    isPlaying={currentPlaying === "social"} 
                    progress={0}
                    className="w-full"
                  />
                </div>
                
                <div className="text-xs text-muted-foreground flex-shrink-0 min-w-[32px] text-right">
                  0:45
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Premium Coffee Machine</span>
                <div className="flex items-center gap-2">
                  <EchoLevels rating={5} size="sm" />
                  <span>Portland, OR</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}