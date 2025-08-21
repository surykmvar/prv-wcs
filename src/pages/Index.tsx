
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from "@/components/Header"
import { MainActions } from "@/components/MainActions"
import { VotingExplanationModal } from '@/components/VotingExplanationModal'
import { DynamicBackground } from "@/components/DynamicBackground"
import { Helmet } from "react-helmet-async"

const Index = () => {
  const location = useLocation()

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-background font-inter">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="hidden sm:block absolute inset-0 starry-surface" aria-hidden />
        <div className="hidden sm:block size-full bg-gradient-to-br from-woices-violet/5 via-transparent to-woices-mint/5" />
        {/* <DynamicBackground /> */}
      </div>
      <Helmet>
        <title>Woices | Speak or Write</title>
        <meta name="description" content="Speak your Woice or write a thought. Minimal, human-friendly voice social." />
        <link rel="canonical" href="/" />
      </Helmet>
      <div className="relative">
        <Header />
        <main className="py-4 sm:py-8 md:py-12">
          <MainActions />
        </main>
      </div>
      <VotingExplanationModal />
    </div>
  )
}

export default Index
