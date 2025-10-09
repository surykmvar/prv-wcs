import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Share, Plus, Download } from 'lucide-react'
import { usePWAInstall } from '@/hooks/usePWAInstall'

export function PWAInstallPrompt() {
  const { isInstallable, isIOS, isStandalone, showPrompt, installApp, dismissPrompt } = usePWAInstall()
  const [isVisible, setIsVisible] = useState(true)

  // Don't show if already installed or prompt dismissed
  if (isStandalone || !showPrompt || !isVisible) {
    return null
  }

  const handleInstall = async () => {
    if (isIOS) {
      // For iOS, just show the instructions
      return
    }

    // For Android, trigger the install prompt
    const installed = await installApp()
    if (installed) {
      setIsVisible(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    dismissPrompt()
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom duration-500 md:left-auto md:right-4 md:max-w-md">
      <Card className="shadow-2xl border-2 border-woices-violet/20 bg-gradient-to-br from-card to-card/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* App Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-woices-violet to-woices-bloom flex items-center justify-center">
              <img 
                src="/lovable-uploads/0d554336-6d8b-4a92-a538-27f0d97b6191.png" 
                alt="Woices" 
                className="w-10 h-10 rounded-lg"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">Install Woices App</h3>
              
              {isIOS ? (
                // iOS Instructions
                <div className="text-xs text-muted-foreground space-y-2">
                  <p>Add to your home screen for the best experience:</p>
                  <ol className="space-y-1 pl-4 list-decimal">
                    <li className="flex items-center gap-1">
                      Tap the <Share className="w-3 h-3 inline mx-1" /> Share button below
                    </li>
                    <li className="flex items-center gap-1">
                      Select "Add to Home Screen" <Plus className="w-3 h-3 inline mx-1" />
                    </li>
                    <li>Tap "Add" to confirm</li>
                  </ol>
                </div>
              ) : (
                // Android Instructions
                <>
                  <p className="text-xs text-muted-foreground mb-3">
                    Get quick access and a better experience. Install now!
                  </p>
                  {isInstallable && (
                    <Button 
                      onClick={handleInstall}
                      size="sm"
                      className="w-full bg-woices-violet hover:bg-woices-violet/90 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Install App
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Close Button */}
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="flex-shrink-0 h-6 w-6 p-0 hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
