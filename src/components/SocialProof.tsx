import { Star, Users, MessageCircle, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function SocialProof() {
  const stats = [
    { icon: Users, label: 'Active Users', value: '1,000+', color: 'text-woices-violet' },
    { icon: MessageCircle, label: 'Voice Responses', value: '5,000+', color: 'text-woices-bloom' },
    { icon: TrendingUp, label: 'Thoughts Shared', value: '2,500+', color: 'text-woices-mint' },
    { icon: Star, label: 'Average Rating', value: '4.8/5', color: 'text-yellow-500' },
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Product Designer',
      avatar: '👩‍💼',
      text: 'Voice feedback is so much richer than text reviews. I can hear the emotion and context that text misses.',
      rating: 5
    },
    {
      name: 'Marcus Thompson',
      role: 'Entrepreneur',
      avatar: '👨‍💻',
      text: 'Getting authentic voice responses helped me validate my product idea faster than any survey could.',
      rating: 5
    },
    {
      name: 'Elena Rodriguez',
      role: 'Content Creator',
      avatar: '👩‍🎨',
      text: 'The community here is genuinely engaged. Voice makes conversations feel more human and real.',
      rating: 5
    }
  ]

  return (
    <div className="space-y-12">
      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 text-center border-border/50 bg-card/50 backdrop-blur-sm hover:border-border transition-colors">
            <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
            <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Testimonials Section */}
      <div>
        <h3 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-woices-violet to-woices-bloom bg-clip-text text-transparent">
          What Users Are Saying
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 border-border/50 bg-card/50 backdrop-blur-sm hover:border-border transition-all hover:shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">{testimonial.avatar}</div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground italic">"{testimonial.text}"</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-gradient-to-r from-woices-violet/10 via-woices-bloom/10 to-woices-mint/10 rounded-2xl p-8 border border-border/50">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <p className="text-lg font-semibold text-foreground">
            🔒 Trusted by Individuals & Businesses Worldwide
          </p>
          <p className="text-sm text-muted-foreground">
            Secure, anonymous voting • GDPR compliant • Your voice, your privacy
          </p>
          <div className="flex justify-center gap-8 text-xs text-muted-foreground pt-4">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>End-to-end encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Anonymous feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>No data selling</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
