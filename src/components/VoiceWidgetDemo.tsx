import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Play } from "lucide-react"
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

  const sampleReviews: VoiceReview[] = [
    {
      id: "1",
      reviewerName: "Sarah Chen",
      productName: "Product Design Service",
      duration: 28,
      rating: 5,
      isPlaying: false,
      location: "New York, NY",
      date: "2 days ago"
    },
    {
      id: "2", 
      reviewerName: "Michael Rodriguez",
      productName: "Web Development",
      duration: 45,
      rating: 5,
      isPlaying: false,
      location: "Austin, TX",
      date: "1 week ago"
    },
    {
      id: "3",
      reviewerName: "Emma Thompson",
      productName: "Brand Consultation",
      duration: 32,
      rating: 4,
      isPlaying: false,
      location: "London, UK", 
      date: "3 days ago"
    }
  ]

  const handlePlayPause = (reviewId: string) => {
    setCurrentPlaying(currentPlaying === reviewId ? null : reviewId)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Live Widget Demo</h3>
        <p className="text-muted-foreground text-sm">See how voice reviews look embedded on your website</p>
      </div>

      {/* Desktop/Website Demo */}
      <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-4">
        <div className="mb-3">
          <Badge variant="outline" className="text-xs">Website Integration</Badge>
        </div>
        <div className="grid gap-3">
          {sampleReviews.map((review) => (
            <VoiceReviewPlayer
              key={review.id}
              reviewerName={review.reviewerName}
              productName={review.productName}
              duration={review.duration}
              rating={review.rating}
              location={review.location}
              date={review.date}
              isPlaying={currentPlaying === review.id}
              onPlayPause={() => handlePlayPause(review.id)}
            />
          ))}
        </div>
      </div>

      {/* Mobile/Social Media Demo */}
      <div className="bg-gradient-to-br from-card to-card/50 border border-border/50 rounded-xl p-4">
        <div className="mb-3">
          <Badge variant="outline" className="text-xs">Social Media Share</Badge>
        </div>
        <div className="max-w-sm mx-auto">
          <Card className="border-border/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-woices-mint to-woices-sky flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-sm">Sarah Chen</CardTitle>
                  <p className="text-xs text-muted-foreground">left a voice review</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="bg-muted/20 rounded-lg p-3 flex items-center gap-2 mb-3">
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-8 h-8 p-0 rounded-full bg-woices-violet hover:bg-woices-violet/90 text-white flex-shrink-0"
                >
                  <Play className="w-3 h-3 ml-0.5" />
                </Button>
                
                <div className="flex-1 min-w-0 mx-1">
                  <DynamicWaveform 
                    isPlaying={false} 
                    progress={0}
                    className="w-full"
                  />
                </div>
                
                <div className="text-xs text-muted-foreground flex-shrink-0 min-w-[32px] text-right">
                  0:28
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Product Design Service</span>
                <div className="flex items-center gap-2">
                  <EchoLevels rating={5} size="sm" />
                  <span>New York, NY</span>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2 italic">
                "Amazing experience with their design service..."
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}