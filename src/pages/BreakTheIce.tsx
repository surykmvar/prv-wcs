import { Header } from "@/components/Header"
import { ThoughtsFeed } from '@/components/ThoughtsFeed'

export default function BreakTheIce() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 font-inter">
      <div className="absolute inset-0 bg-gradient-to-br from-woices-violet/5 via-transparent to-woices-mint/5 pointer-events-none"></div>
      <div className="relative">
        <Header />
        <main className="py-6 sm:py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-4">Break the Ice</h1>
              <p className="text-muted-foreground text-lg">
                Discover thoughts from the community and share your voice
              </p>
            </div>
            <ThoughtsFeed />
          </div>
        </main>
      </div>
    </div>
  )
}