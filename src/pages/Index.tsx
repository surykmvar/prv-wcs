
import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from "@/components/Header"
import { MainActions } from "@/components/MainActions"
import { VotingExplanationModal } from '@/components/VotingExplanationModal'
import { DynamicBackground } from "@/components/DynamicBackground"
import { LowCreditBanner } from "@/components/LowCreditBanner"
import { SocialProof } from "@/components/SocialProof"
import { MembershipModal } from "@/components/MembershipModal"
import { useCredits } from "@/hooks/useCredits"
import { useAuth } from "@/hooks/useAuth"
import { Helmet } from "react-helmet-async"

const Index = () => {
  const location = useLocation()
  const { user } = useAuth()
  const { creditsInfo } = useCredits()
  const [showMembershipModal, setShowMembershipModal] = useState(false)

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-background font-inter">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="hidden sm:block absolute inset-0 starry-surface" aria-hidden />
        <div className="hidden sm:block size-full bg-gradient-to-br from-woices-violet/5 via-transparent to-woices-mint/5" />
        {/* <DynamicBackground /> */}
      </div>
      <Helmet>
        <title>Voice based Feedback Network</title>
        <meta name="description" content="Woices — meaningful voice feedback, one voice at a time." />
        <meta property="og:title" content="Woices" />
        <meta name="twitter:title" content="Woices" />
        <link rel="canonical" href="https://woices.app/" />
      </Helmet>
      <div className="relative">
        <Header />
        <main className="py-4 sm:py-8 md:py-12 pt-20 sm:pt-24 md:pt-28">
          <div className="container mx-auto px-4 max-w-4xl">
            {user && creditsInfo && (
              <LowCreditBanner 
                credits={creditsInfo.balance} 
                onPurchaseClick={() => setShowMembershipModal(true)}
              />
            )}
            <MainActions />
            
          </div>
        </main>
      </div>
      <VotingExplanationModal />
      <MembershipModal 
        open={showMembershipModal} 
        onOpenChange={setShowMembershipModal}
      />
    </div>
  )
}

export default Index
