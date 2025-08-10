
import { useState } from 'react'
import { Header } from "@/components/Header"
import { MainActions } from "@/components/MainActions"
import { VotingExplanationModal } from '@/components/VotingExplanationModal'
import { DynamicBackground } from "@/components/DynamicBackground"

const Index = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-background font-inter starry-surface">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="size-full bg-gradient-to-br from-woices-violet/5 via-transparent to-woices-mint/5" />
        <DynamicBackground />
      </div>
      <div className="relative">
        <Header />
        <main className="py-6 sm:py-8 md:py-12">
          <div className="container px-4">
              <div className="panel surface-elevated">
                <MainActions />
              </div>
          </div>
        </main>
      </div>
      <VotingExplanationModal />
    </div>
  )
}

export default Index
