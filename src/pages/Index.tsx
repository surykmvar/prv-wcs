
import { useState } from 'react'
import { Header } from "@/components/Header"
import { MainActions } from "@/components/MainActions"
import { VotingExplanationModal } from '@/components/VotingExplanationModal'

const Index = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-background font-inter">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-woices-violet/5 via-transparent to-woices-mint/5 pointer-events-none"></div>
      <div className="relative">
        <Header />
        <main className="py-6 sm:py-8 md:py-12">
          <MainActions />
        </main>
      </div>
      <VotingExplanationModal />
    </div>
  )
}

export default Index
