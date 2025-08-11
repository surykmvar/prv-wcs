import { useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { Header } from "@/components/Header"
import { RandomThoughtRecorder } from "@/components/RandomThoughtRecorder"

const Feed = () => {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-background font-inter starry-surface">
      <Helmet>
        <title>Break the Ice Feed | Woices</title>
        <meta name="description" content="Break the Ice voice feed – record and listen to 60-second Woice replies." />
        <link rel="canonical" href="/feed" />
      </Helmet>

      <div className="relative">
        <Header />
        <main className="py-6 sm:py-8 md:py-12">
          <h1 className="sr-only">Break the Ice – Voice Feed</h1>
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
            <RandomThoughtRecorder onBack={() => navigate(-1)} />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Feed
