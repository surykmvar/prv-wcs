
import { Header } from "@/components/Header"
import { MainActions } from "@/components/MainActions"

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 font-inter">
      <div className="absolute inset-0 bg-gradient-to-br from-woices-violet/5 via-transparent to-woices-mint/5 pointer-events-none"></div>
      <div className="relative">
        <Header />
        <main className="py-12">
          <MainActions />
        </main>
      </div>
    </div>
  )
}

export default Index
