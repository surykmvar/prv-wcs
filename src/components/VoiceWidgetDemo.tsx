import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Star, User, MapPin } from "lucide-react"
import { useState } from "react"

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

  const WaveformAnimation = ({ isPlaying }: { isPlaying: boolean }) => (
    <div className="flex items-center gap-0.5 h-8">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className={`w-0.5 bg-gradient-to-t from-woices-violet to-woices-sky rounded-full transition-all duration-150 ${
            isPlaying ? 'animate-pulse' : ''
          }`}
          style={{
            height: `${Math.random() * 16 + 8}px`,
            animationDelay: `${i * 50}ms`,
            opacity: isPlaying ? 1 : 0.6
          }}
        />
      ))}
    </div>
  )

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
            <Card key={review.id} className="border-border/30 hover:border-woices-violet/30 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-woices-violet to-woices-sky flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{review.reviewerName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {review.location} • {review.date}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-woices-mint text-woices-mint" />
                    ))}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  Voice review for: <span className="font-medium text-foreground">{review.productName}</span>
                </p>
                
                <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handlePlayPause(review.id)}
                    className="w-8 h-8 p-0 rounded-full bg-woices-violet hover:bg-woices-violet/90 text-white"
                  >
                    {currentPlaying === review.id ? (
                      <Pause className="w-3 h-3" />
                    ) : (
                      <Play className="w-3 h-3 ml-0.5" />
                    )}
                  </Button>
                  
                  <div className="flex-1">
                    <WaveformAnimation isPlaying={currentPlaying === review.id} />
                  </div>
                  
                  <span className="text-xs text-muted-foreground">{review.duration}s</span>
                </div>
              </CardContent>
            </Card>
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
              <div className="bg-muted/30 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-8 h-8 p-0 rounded-full bg-woices-violet hover:bg-woices-violet/90 text-white"
                  >
                    <Play className="w-3 h-3 ml-0.5" />
                  </Button>
                  <div className="flex-1">
                    <WaveformAnimation isPlaying={false} />
                  </div>
                  <span className="text-xs text-muted-foreground">28s</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                "Amazing experience with their design service..."
              </p>
              <div className="flex items-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-woices-mint text-woices-mint" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}