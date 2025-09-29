import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ContactSalesModal } from "@/components/ContactSalesModal"
import { SparkleField } from "@/components/SparkleField"
import { FoundersNoteToggle } from "@/components/FoundersNoteToggle"
import { Helmet } from "react-helmet-async"
import { Mic, MessageSquare, TrendingUp, Shield, Users, Clock, Heart, Code, Zap, Globe, Star, ChevronRight, Check, Building, User, Share2, Link2, Type, ArrowRight, ArrowDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { VoiceWidgetDemo } from "@/components/VoiceWidgetDemo"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

const Landing = () => {
  const navigate = useNavigate()
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [carouselApi, setCarouselApi] = useState<any>(null)
  const [animateIcon, setAnimateIcon] = useState(false)

  useEffect(() => {
    if (!carouselApi) return

    const onSelect = () => {
      const newStep = carouselApi.selectedScrollSnap()
      setCurrentStep(newStep)
      
      // Reset animation first
      setAnimateIcon(false)
      
      // Trigger breathing animation after carousel settles
      setTimeout(() => {
        setAnimateIcon(true)
      }, 300)
    }

    carouselApi.on("select", onSelect)

    return () => {
      carouselApi.off("select", onSelect)
    }
  }, [carouselApi])

  const useCases = [
    {
      icon: <Users className="w-8 h-8 text-woices-violet" />,
      title: "Freelancer Portfolio",
      description: "\"Leave me voice feedback on my design draft.\"",
      detail: "Get authentic client testimonials that showcase your work's impact."
    },
    {
      icon: <Building className="w-8 h-8 text-woices-sky" />,
      title: "Startups",
      description: "\"Listen to what our users are saying.\"",
      detail: "Build trust with real user voices instead of fake text reviews."
    },
    {
      icon: <Star className="w-8 h-8 text-woices-mint" />,
      title: "Creator Link-in-Bio",
      description: "\"Send me a voice review or idea.\"",
      detail: "Connect with your audience through authentic voice interactions."
    },
    {
      icon: <Globe className="w-8 h-8 text-woices-bloom" />,
      title: "E-commerce Store",
      description: "\"Hear what customers really think.\"",
      detail: "Voice reviews that customers actually trust and believe."
    }
  ]

  const benefits = [
    {
      icon: <Shield className="w-6 h-6 text-woices-violet" />,
      title: "Trust & Authenticity",
      description: "Voice reviews are a revolutionary new form of authentic feedback—instantly recognizable as real human emotion that's nearly impossible to fake."
    },
    {
      icon: <Code className="w-6 h-6 text-woices-sky" />,
      title: "Universal Integration",
      description: "Our API widget works seamlessly anywhere—websites, Notion, Shopify, Webflow, social media, and mobile apps."
    },
    {
      icon: <Users className="w-6 h-6 text-woices-mint" />,
      title: "Complete Control",
      description: "Reviews live on your platform under your brand. No dependency on external review networks or third-party credibility."
    },
    {
      icon: <Zap className="w-6 h-6 text-woices-bloom" />,
      title: "Effortless Experience",
      description: "One-click voice recording with automatic transcription, AI analysis, and beautiful presentation—no technical setup required."
    }
  ]

  const howItWorksSteps = [
    {
      icon: <Type className="w-6 h-6 text-woices-violet" />,
      title: "Create Your Topic",
      description: "Start a voice review topic about your product, service, or experience in seconds."
    },
    {
      icon: <Share2 className="w-6 h-6 text-woices-sky" />,
      title: "Share the Link",
      description: "Send the simple link to your customers via email, SMS, social media, or embed it on your website."
    },
    {
      icon: <Mic className="w-6 h-6 text-woices-mint" />,
      title: "Collect Voice Feedback",
      description: "Customers leave authentic voice reviews with one click—no app downloads or account creation required."
    },
    {
      icon: <Star className="w-6 h-6 text-woices-bloom" />,
      title: "Showcase Reviews",
      description: "Display beautiful voice review widgets on your website, social media, or anywhere you want to build trust."
    }
  ]

  const roadmapPhases = [
    {
      phase: "Phase 1",
      title: "Review API",
      description: "iFrame widget for websites/Notion pages/Portfolios",
      features: ["Voice recording → transcript + summary", "Embeddable review cards", "Simple integration"],
      status: "current"
    },
    {
      phase: "Phase 2", 
      title: "Community Layer",
      description: "Businesses/creators manage voice reviews in a dashboard",
      features: ["Brand channels on Woices", "Moderation tools", "Review showcase walls"],
      status: "upcoming"
    },
    {
      phase: "Phase 3",
      title: "Social Discovery",
      description: "The network effect emerges once enough reviews exist",
      features: ["Social feed of authentic voices", "Search voice knowledge", "Voice-powered recommendations"],
      status: "future"
    }
  ]

  const faqs = [
    {
      question: "What is Woices API?",
      answer: "Woices API is a voice-powered review layer that integrates into existing websites, portfolios, and products via iFrame or API. Think of it as a 'comment box 2.0' — but voice-first, authentic, and human."
    },
    {
      question: "How does the API integration work?",
      answer: "Simply embed our iFrame widget anywhere on your website, Notion page, or portfolio. Visitors can leave voice feedback with one click, and you get authentic testimonials that build trust."
    },
    {
      question: "Why voice instead of text reviews?",
      answer: "Text reviews are easily faked and lack emotion. Voice captures tone, energy, hesitation, and excitement — the real feedback that written comments can never convey. Voice reviews are authentic and hard to fake."
    },
    {
      question: "Can I control which reviews are shown?",
      answer: "Absolutely! You have full control over moderation and can showcase the best reviews while filtering out inappropriate content. Your brand, your rules."
    },
    {
      question: "Does this have AI features, or what premium features do I get when I pay?",
      answer: "Yes! Our premium features include: AI-powered automatic transcription, sentiment analysis and review categorization, advanced moderation tools, custom branding options, detailed analytics dashboard, priority customer support, and API access for seamless integrations. Free users can still create voice topics and collect basic feedback."
    },
    {
      question: "What subscription plans do you offer?",
      answer: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-woices-violet/5 to-woices-sky/5 p-4 rounded-lg">
            <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
              💡 Subscription Plans
            </h4>
          </div>
          
          <div className="space-y-4">
            <div className="border-l-4 border-woices-violet pl-4">
              <h5 className="font-semibold text-woices-violet mb-2">1. Pro Plan (for freelancers & solopreneurs)</h5>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Embeddable voice review widget (iframe/JS snippet)</li>
                <li>• Basic customization (colors, fonts, logo)</li>
                <li>• Audio transcription → text format</li>
                <li>• "Wall of Trust" page (auto-compiled review wall to share with clients)</li>
                <li>• Light analytics (number of reviews, listens, and shares)</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-woices-sky pl-4">
              <h5 className="font-semibold text-woices-sky mb-2">2. Creator Plan (for influencers, artists, UGC creators)</h5>
              <div className="text-sm text-muted-foreground mb-2">Everything in Pro, plus:</div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Advanced branding & widget styling (carousel, grid, single review card)</li>
                <li>• AI-generated summaries of top feedback ("Top 3 things fans say")</li>
                <li>• Shareable snippets for social media (Spotify-style cards/waveforms)</li>
                <li>• Highlight & pin "best reviews" on profiles</li>
                <li>• Engagement analytics (shares, replays, top supporters)</li>
                <li>• UGC Monetization: tipping system (fans can tip creators when leaving reviews)</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-woices-mint pl-4">
              <h5 className="font-semibold text-woices-mint mb-2">3. Business Plan (for startups, SMEs, agencies, e-commerce)</h5>
              <div className="text-sm text-muted-foreground mb-2">Everything in Creator, plus:</div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Team dashboard with moderation controls (approve/reject/feature reviews)</li>
                <li>• Advanced analytics (review trends, audience insights, top-requested features)</li>
                <li>• Voice emotion cues (highlights excitement, hesitation, frustration)</li>
                <li>• AI categorization (auto-group reviews by product, topic, or theme)</li>
                <li>• Review export (CSV, API access for integration into CRMs)</li>
                <li>• "Enterprise Wall of Trust" → showcase page with embedded reviews across multiple products</li>
                <li>• Priority support + API scaling</li>
                <li>• Scales with business usage and customer range</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      question: "What future features are you planning for users?",
      answer: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-woices-mint/5 to-woices-bloom/5 p-4 rounded-lg">
            <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
              🎁 Future User-Side Incentives
            </h4>
            <p className="text-sm text-muted-foreground">
              Keeping it clean, aspirational, and flexible — businesses see serious value, creators see monetization potential, and users feel motivated to contribute.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="border-l-4 border-woices-bloom pl-4">
              <h5 className="font-semibold text-woices-bloom mb-2">Engagement Features</h5>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• <strong>Tipping:</strong> Fans/customers can tip creators or businesses for products/services they love</li>
                <li>• <strong>Gamified Trust Score:</strong> Reviewers earn recognition when their reviews are upvoted, shared, or featured</li>
                <li>• <strong>Reward/Coins System:</strong> Businesses can reward reviewers with perks, discounts, or exclusive access</li>
                <li>• <strong>Top Trusted Voices:</strong> Highlighted reviewers gain visibility across the Woices network</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-woices-violet pl-4">
              <h5 className="font-semibold text-woices-violet mb-2">Community Benefits</h5>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Recognition when reviews are upvoted, shared, or featured</li>
                <li>• Visibility across the Woices network for top contributors</li>
                <li>• Exclusive access and discounts from partnered businesses</li>
                <li>• Creator and business reward programs for loyal reviewers</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-card rounded-lg border border-border/50">
            <p className="text-xs text-muted-foreground italic">
              👉 This keeps users engaged and motivated while providing businesses and creators with powerful tools to build authentic community around their brand.
            </p>
          </div>
        </div>
      )
    },
    {
      question: "What's the pricing for API access?",
      answer: "We offer flexible pricing based on usage. Contact our sales team for a custom quote that fits your business needs."
    }
  ]

  return (
    <div className="relative min-h-screen bg-background font-inter">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <SparkleField className="absolute inset-0" density={24} />
        <div className="absolute inset-0 bg-gradient-to-br from-woices-violet/5 via-transparent to-woices-mint/5" />
      </div>
      
      <Helmet>
        <title>Woices API — Voice-Powered Review Layer for the Internet</title>
        <meta name="description" content="Authentic voice reviews and feedback API. Replace fake text reviews with real human voices. Easy integration for websites, portfolios, and apps." />
        <meta property="og:title" content="Woices API — Voice-Powered Review Layer for the Internet" />
        <meta property="og:description" content="Authentic voice reviews and feedback API. Replace fake text reviews with real human voices. Easy integration for websites, portfolios, and apps." />
        <meta name="twitter:title" content="Woices API — Voice-Powered Review Layer for the Internet" />
        <meta name="twitter:description" content="Authentic voice reviews and feedback API. Replace fake text reviews with real human voices. Easy integration for websites, portfolios, and apps." />
        <link rel="canonical" href="https://woices.app/" />
      </Helmet>

      <div className="relative">
        <Header />
        
        <main>
          {/* Hero Section */}
          <section className="py-6 sm:py-8 md:py-12 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 sm:mb-16">
                <div className="inline-flex items-center gap-2 bg-woices-violet/10 text-woices-violet px-3 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                  Now in Beta — API Access Available
                </div>
                
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 sm:mb-8 leading-tight px-2">
                  The Voice-Powered
                  <span className="block bg-gradient-to-r from-woices-violet via-woices-sky to-woices-mint bg-clip-text text-transparent">
                    Social Feedback Tool
                  </span>
                  <span className="block text-foreground">for the Internet</span>
                </h1>
                
                <p className="text-base sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
                  Replace fake text reviews with authentic human voices. 
                  <span className="block mt-1 sm:mt-2 font-medium text-foreground">Google Reviews, but in real human voices.</span>
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16 px-4">
                  <Button 
                    size="lg" 
                    onClick={() => setContactModalOpen(true)}
                    className="bg-woices-violet hover:bg-woices-violet/90 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
                  >
                    <Code className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Get API Access
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => navigate('/start')}
                    className="px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-medium w-full sm:w-auto"
                  >
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Get Started
                  </Button>
                </div>

                {/* Code Preview */}
                <div className="max-w-2xl mx-auto bg-card border rounded-xl p-4 sm:p-6 text-left">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs sm:text-sm text-muted-foreground ml-2">Integration Example</span>
                  </div>
                  <pre className="text-xs sm:text-sm text-muted-foreground overflow-x-auto">
                    <code>{`<iframe src="https://api.woices.app/widget?id=your-id"
        width="100%" height="400px">
</iframe>`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section className="py-12 sm:py-16 md:py-20 px-4 bg-card/50">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 px-4">Built for expression, not just opinions.</h2>
                <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
                  Perfect for freelancers, creators, startups, and businesses who want authentic feedback from their Users/Customers.
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {useCases.map((useCase, index) => (
                  <Card key={index} className="border-border/50 hover:border-woices-violet/30 transition-all duration-300 hover:shadow-lg group">
                    <CardHeader className="pb-4">
                      <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                        {useCase.icon}
                      </div>
                      <CardTitle className="text-lg mb-2">{useCase.title}</CardTitle>
                      <CardDescription className="text-woices-violet font-medium italic">
                        {useCase.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {useCase.detail}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-12 sm:py-16 md:py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 px-4">How It Works</h2>
                <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
                  Get started in minutes—no technical expertise required. Perfect for businesses, creators, and entrepreneurs of all sizes.
                </p>
              </div>
              
              {/* Carousel Layout */}
              <div className="max-w-3xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20">
                <Carousel
                  opts={{
                    align: "center",
                    loop: true,
                  }}
                  setApi={setCarouselApi}
                  className="w-full"
                >
                  <CarouselContent>
                    {howItWorksSteps.map((step, index) => (
                      <CarouselItem key={index}>
                        <div className="p-2 sm:p-4 md:p-6 lg:p-8">
                          {/* Premium Card with Gradient Border */}
                          <div className="relative group">
                            {/* Animated Gradient Border */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-woices-violet via-woices-sky to-woices-mint rounded-2xl sm:rounded-3xl opacity-30 group-hover:opacity-50 blur-sm transition-all duration-500" />
                            
                            {/* Card Content */}
                            <div className="relative bg-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 border border-border/50 shadow-xl">
                              <div className="text-center">
                                {/* Animated Icon Container */}
                                <div className="relative mb-6 sm:mb-8 md:mb-10">
                                  {/* Glow effect behind icon */}
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 bg-gradient-to-br from-woices-violet/20 via-woices-sky/20 to-woices-mint/20 rounded-full blur-2xl animate-pulse" />
                                  </div>
                                  
                                  {/* Icon with breathing animation on step change */}
                                   <div className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-36 lg:h-36 mx-auto rounded-2xl sm:rounded-3xl bg-gradient-to-br from-woices-violet/15 via-woices-sky/10 to-woices-mint/15 flex items-center justify-center border-2 border-woices-violet/30 shadow-lg hover:scale-110 transition-transform duration-300 ${
                                     animateIcon ? 'animate-[breathe_8s_ease-in-out_infinite]' : ''
                                   }`}>
                                    <div className="text-woices-violet [&>svg]:w-8 [&>svg]:h-8 sm:[&>svg]:w-10 sm:[&>svg]:h-10 md:[&>svg]:w-12 md:[&>svg]:h-12 lg:[&>svg]:w-14 lg:[&>svg]:h-14">
                                      {step.icon}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Content */}
                                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 text-foreground bg-gradient-to-r from-woices-violet via-woices-sky to-woices-mint bg-clip-text text-transparent">
                                  {step.title}
                                </h3>
                                <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed px-2 sm:px-4 md:px-6">
                                  {step.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  
                  {/* Modern Navigation Arrows - Responsive sizing */}
                  <CarouselPrevious className="bg-gradient-to-br from-woices-violet/20 to-woices-sky/20 border-woices-violet/30 hover:from-woices-violet/30 hover:to-woices-sky/30 text-woices-violet -left-8 sm:-left-12 md:-left-16 lg:-left-20 w-10 h-10 sm:w-12 sm:h-12 md:w-13 md:h-13 lg:w-14 lg:h-14 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm" />
                  <CarouselNext className="bg-gradient-to-br from-woices-violet/20 to-woices-sky/20 border-woices-violet/30 hover:from-woices-violet/30 hover:to-woices-sky/30 text-woices-violet -right-8 sm:-right-12 md:-right-16 lg:-right-20 w-10 h-10 sm:w-12 sm:h-12 md:w-13 md:h-13 lg:w-14 lg:h-14 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm" />
                </Carousel>
                
                {/* Animated Step Progress Indicator - Responsive */}
                <div className="flex justify-center items-center gap-2 sm:gap-3 md:gap-4 mt-8 sm:mt-10 md:mt-12">
                  {howItWorksSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => carouselApi?.scrollTo(index)}
                      className="group relative"
                      aria-label={`Go to step ${index + 1}`}
                    >
                      {/* Outer ring for active step */}
                      <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
                        currentStep === index 
                          ? 'bg-gradient-to-r from-woices-violet via-woices-sky to-woices-mint p-0.5 animate-pulse' 
                          : 'bg-transparent'
                      }`}>
                        <div className="w-full h-full rounded-full bg-background" />
                      </div>
                      
                      {/* Step number circle - Responsive sizing */}
                      <div className={`relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full font-bold text-xs sm:text-sm md:text-base transition-all duration-300 ${
                        currentStep === index
                          ? 'bg-gradient-to-br from-woices-violet to-woices-sky text-white shadow-lg scale-110'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted group-hover:scale-105'
                      }`}>
                        {index + 1}
                      </div>
                      
                      {/* Progress line to next step - Responsive */}
                      {index < howItWorksSteps.length - 1 && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 w-6 sm:w-8 md:w-10 lg:w-12 h-0.5">
                          <div className={`h-full transition-all duration-500 ${
                            currentStep > index
                              ? 'bg-gradient-to-r from-woices-violet to-woices-sky'
                              : 'bg-muted/30'
                          }`} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Step Label with Animation - Responsive text */}
                <div className="text-center mt-4 sm:mt-6 md:mt-8">
                  <span className="inline-block px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-woices-violet bg-gradient-to-r from-woices-violet/15 via-woices-sky/15 to-woices-mint/15 rounded-full border border-woices-violet/30 shadow-sm animate-fade-in">
                    Step {currentStep + 1} of {howItWorksSteps.length}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Core Benefits */}
          <section className="py-12 sm:py-16 md:py-20 px-4 bg-gradient-to-br from-woices-violet/5 via-background to-woices-mint/5">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 px-4">Why Voice Reviews Work Better</h2>
                <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
                  When you hear someone's voice, you don't just get information—you feel tone, energy, hesitation, excitement. 
                  That's the real feedback loop that written comments will never capture.
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-8 sm:gap-12">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-woices-violet/30">
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-woices-violet/10 to-woices-sky/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            {benefit.icon}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-semibold mb-3 text-foreground">{benefit.title}</h3>
                          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{benefit.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Widget Demo */}
          <section className="py-12 sm:py-16 md:py-20 px-4 bg-card/50">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 px-4">See Voice Reviews in Action</h2>
                <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
                  Experience how voice reviews look when embedded on websites, social media, and mobile apps. 
                  This is what your customers will see and interact with.
                </p>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <VoiceWidgetDemo />
              </div>
            </div>
          </section>

          {/* Roadmap */}
          <section className="py-12 sm:py-16 md:py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 px-4">The Roadmap</h2>
                <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
                  Starting as a voice review API, evolving into the social platform for authentic human voices.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
                {roadmapPhases.map((phase, index) => (
                  <div key={index} className="relative group">
                    {phase.status === 'current' && (
                      <Badge className="absolute -top-3 -right-3 bg-woices-mint text-woices-dark text-xs px-2 py-1 block z-10">
                        Current
                      </Badge>
                    )}
                    {phase.status === 'upcoming' && (
                      <Badge className="absolute -top-3 -right-3 bg-woices-violet text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block z-10">
                        Coming Soon
                      </Badge>
                    )}
                    {phase.status === 'upcoming' && (
                      <Badge className="absolute -top-3 -right-3 bg-woices-violet text-white text-xs px-2 py-1 block sm:hidden z-10">
                        Coming Soon
                      </Badge>
                    )}
                    {phase.status === 'future' && (
                      <Badge className="absolute -top-3 -right-3 bg-gradient-to-r from-woices-violet to-woices-mint text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block z-10">
                        #1 Milestone
                      </Badge>
                    )}
                    {phase.status === 'future' && (
                      <Badge className="absolute -top-3 -right-3 bg-gradient-to-r from-woices-violet to-woices-mint text-white text-xs px-2 py-1 block sm:hidden z-10">
                        #1 Milestone
                      </Badge>
                    )}
                    
                    <Card className={`relative border-2 ${phase.status === 'current' ? 'border-woices-violet/50 bg-woices-violet/5' : 'border-border/50'} transition-all duration-300 group-hover:shadow-lg group-hover:shadow-woices-violet/10 h-full`}>
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-8 h-8 rounded-full ${phase.status === 'current' ? 'bg-woices-violet' : 'bg-muted'} flex items-center justify-center text-sm font-bold ${phase.status === 'current' ? 'text-white' : 'text-muted-foreground'} group-hover:scale-110 transition-transform duration-300`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="text-sm text-woices-violet font-medium">{phase.phase}</div>
                            <CardTitle className="text-xl">{phase.title}</CardTitle>
                          </div>
                        </div>
                        <CardDescription className="text-base">{phase.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {phase.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Check className="w-4 h-4 text-woices-mint flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-12 sm:py-16 md:py-20 px-4 bg-card/50">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 px-4">Frequently Asked Questions</h2>
                <p className="text-base sm:text-xl text-muted-foreground px-4">
                  Everything you need to know about Woices API and voice reviews.
                </p>
              </div>
              
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="border border-border/50 rounded-xl px-6 bg-card hover:border-woices-violet/30 transition-colors duration-300"
                  >
                    <AccordionTrigger className="text-left font-medium hover:no-underline py-6 text-lg">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-6 leading-relaxed text-base">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* Founder's Note Toggle */}
          <FoundersNoteToggle />

          {/* Bottom CTA */}
          <section className="py-12 sm:py-16 md:py-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-gradient-to-br from-woices-violet/10 via-woices-sky/5 to-woices-mint/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-woices-violet/20">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 px-4">
                  Ready to Add Voice to Your Platform?
                </h2>
                <p className="text-base sm:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
                  Join the businesses already using Woices API to collect authentic voice feedback from their customers.
                  <span className="block mt-1 sm:mt-2 font-medium text-foreground">Start with our beta program today.</span>
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
                  <Button 
                    size="lg" 
                    onClick={() => setContactModalOpen(true)}
                    className="bg-woices-violet hover:bg-woices-violet/90 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
                  >
                    <Code className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Get API Access
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => navigate('/start')}
                    className="px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-medium border-woices-violet/30 hover:border-woices-violet/50 w-full sm:w-auto"
                  >
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Begin
                  </Button>
                </div>

                <div className="mt-8 pt-8 border-t border-border/50">
                  <Button 
                    variant="ghost"
                    onClick={() => navigate('/auth?mode=signup&redirect=/start')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    or sign up for the social platform
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      <ContactSalesModal 
        open={contactModalOpen} 
        onOpenChange={setContactModalOpen} 
      />
    </div>
  )
}

export default Landing