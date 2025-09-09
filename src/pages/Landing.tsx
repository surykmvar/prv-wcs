import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Helmet } from "react-helmet-async"
import { Mic, MessageSquare, TrendingUp, Shield, Users, Clock, Heart } from "lucide-react"

const Landing = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <Mic className="w-8 h-8 text-woices-violet" />,
      title: "Real Voice Interactions",
      description: "Share authentic 60-second voice replies that capture emotion and nuance better than text."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-woices-sky" />,
      title: "Trending Topics",
      description: "Discover and contribute to conversations on topics that matter to the community."
    },
    {
      icon: <Users className="w-8 h-8 text-woices-mint" />,
      title: "Community-Driven",
      description: "Vote on the best responses and help quality content rise to the top."
    },
    {
      icon: <Shield className="w-8 h-8 text-woices-bloom" />,
      title: "Safe & Moderated",
      description: "Enjoy meaningful conversations in a respectful environment with community moderation."
    }
  ]

  const steps = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Record",
      description: "Share a 60-second voice reply on any topic"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Ask",
      description: "Post your own thoughts and questions"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Vote",
      description: "Help the best content trend and be discovered"
    }
  ]

  const faqs = [
    {
      question: "What is Woices?",
      answer: "Woices is a voice-based social feedback network where people share authentic thoughts and replies using their voice instead of text. It's designed for meaningful conversations, one voice at a time."
    },
    {
      question: "How do I start using Woices?",
      answer: "Simply click 'Open the App' to get started. You can browse trending topics and voice replies without signing up. To post your own content or vote, you'll need to create a free account."
    },
    {
      question: "Is Woices free to use?",
      answer: "Yes! Woices is free to start. You can listen to voice replies, browse trending topics, and participate in the community at no cost."
    },
    {
      question: "How are voice replies moderated?",
      answer: "We use a combination of community voting and moderation tools to ensure quality content. The community helps promote valuable voices while maintaining a respectful environment."
    },
    {
      question: "Can I use Woices on mobile?",
      answer: "Absolutely! Woices is designed to work seamlessly on both desktop and mobile devices, making it easy to record and listen to voice replies wherever you are."
    }
  ]

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-background font-inter">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="hidden sm:block absolute inset-0 starry-surface" aria-hidden />
        <div className="hidden sm:block size-full bg-gradient-to-br from-woices-violet/5 via-transparent to-woices-mint/5" />
      </div>
      
      <Helmet>
        <title>Woices — Voice-based Feedback Network</title>
        <meta name="description" content="Meaningful voice feedback, one voice at a time. Ask questions or give 60-second voice replies on trending topics." />
        <meta property="og:title" content="Woices — Voice-based Feedback Network" />
        <meta property="og:description" content="Meaningful voice feedback, one voice at a time. Ask questions or give 60-second voice replies on trending topics." />
        <meta name="twitter:title" content="Woices — Voice-based Feedback Network" />
        <meta name="twitter:description" content="Meaningful voice feedback, one voice at a time. Ask questions or give 60-second voice replies on trending topics." />
        <link rel="canonical" href="https://woices.app/" />
      </Helmet>

      <div className="relative">
        <Header />
        
        <main>
          {/* Hero Section */}
          <section className="py-12 sm:py-20 md:py-24 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Voice-based
                <span className="block bg-gradient-to-r from-woices-violet to-woices-sky bg-clip-text text-transparent">
                  Feedback Network
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Meaningful voice feedback, one voice at a time.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/feed')}
                  className="bg-woices-violet hover:bg-woices-violet/90 text-white px-8 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Open the App
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="px-8 py-6 text-lg font-medium"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-16 px-4 bg-card/50">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">How It Works</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                {steps.map((step, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-woices-violet/10 flex items-center justify-center">
                      <div className="text-woices-violet">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Why Choose Woices?</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                  <Card key={index} className="border-border/50 hover:border-border transition-colors duration-200">
                    <CardHeader className="pb-4">
                      <div className="mb-2">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-16 px-4 bg-card/50">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
              
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="border border-border/50 rounded-lg px-6 bg-card"
                  >
                    <AccordionTrigger className="text-left font-medium hover:no-underline py-6">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="py-16 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Ready to Share Your Voice?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join the community and start meaningful conversations today — it's free to start.
              </p>
              
              <Button 
                size="lg" 
                onClick={() => navigate('/feed')}
                className="bg-woices-violet hover:bg-woices-violet/90 text-white px-8 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Mic className="w-5 h-5 mr-2" />
                Try Woices Now
              </Button>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default Landing