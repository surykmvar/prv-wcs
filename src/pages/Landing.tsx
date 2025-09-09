import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ContactSalesModal } from "@/components/ContactSalesModal"
import { SparkleField } from "@/components/SparkleField"
import { FoundersNoteToggle } from "@/components/FoundersNoteToggle"
import { Helmet } from "react-helmet-async"
import { Mic, MessageSquare, TrendingUp, Shield, Users, Clock, Heart, Code, Zap, Globe, Star, ChevronRight, Check, Building, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const Landing = () => {
  const navigate = useNavigate()
  const [contactModalOpen, setContactModalOpen] = useState(false)

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
      title: "Authenticity",
      description: "Fake text reviews plague the internet; real voices are hard to fake."
    },
    {
      icon: <Code className="w-6 h-6 text-woices-sky" />,
      title: "Portability",
      description: "iFrame/API widget works anywhere (websites, Notion, Shopify, Webflow, etc.)."
    },
    {
      icon: <Users className="w-6 h-6 text-woices-mint" />,
      title: "Trust",
      description: "Reviews are hosted where the creator/business wants, no need to join a new network."
    },
    {
      icon: <Zap className="w-6 h-6 text-woices-bloom" />,
      title: "Simplicity",
      description: "One-click voice recording, automatic transcript + AI summary."
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
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Try the Demo
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

          {/* Core Benefits */}
          <section className="py-12 sm:py-16 md:py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 px-4">Why Voice Reviews Work Better</h2>
                <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
                  When you hear someone's voice, you don't just get information—you feel tone, energy, hesitation, excitement. 
                  That's the real feedback loop that written comments will never capture.
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-woices-violet/10 to-woices-sky/10 flex items-center justify-center">
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </div>
                ))}
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
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Try the Demo
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