
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useAuth } from '@/hooks/useAuth'
import { useAdminRole } from '@/hooks/useAdminRole'
import { useCredits } from '@/hooks/useCredits'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Mic, Shield, GitBranch, CreditCard, Coins, Home, Play, Download } from 'lucide-react'
import { MembershipModal } from '@/components/MembershipModal'
import { useState } from 'react'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { useIsMobile } from '@/hooks/use-mobile'
import { useLocation } from 'react-router-dom'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function Header() {
  const { user, signOut } = useAuth()
  const { isAdmin } = useAdminRole()
  const { creditsInfo, loading: creditsLoading } = useCredits()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const [membershipModalOpen, setMembershipModalOpen] = useState(false)
  const [showSystemFlowMobileNotice, setShowSystemFlowMobileNotice] = useState(false)
  const { scrollDirection, isAtTop } = useScrollDirection()

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const shouldShowHeader = isAtTop || scrollDirection === 'up'

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 w-full px-4 sm:px-6 py-2 sm:py-3 bg-background/70 backdrop-blur-md border-b border-border/20 shadow-sm transition-all duration-300 ${
        shouldShowHeader ? 'transform translate-y-0 opacity-100' : 'transform -translate-y-full opacity-0'
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div 
          className="cursor-pointer hover:scale-105 transition-all duration-200 relative group"
          onClick={(e) => {
            console.log('Woices header clicked'); // Debug log
            e.preventDefault();
            navigate('/');
          }}
        >
          <img 
            src="/lovable-uploads/ccb13ffe-01c5-48bb-9a1d-19f49502baa9.png" 
            alt="Woices" 
            className="h-10 sm:h-12 rounded-full shadow-sm group-hover:shadow-md transition-shadow duration-200"
          />
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          
          {/* About Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/about')}
            className="hidden sm:inline-flex rounded-full px-4 py-2 text-sm font-medium hover:bg-accent/80 transition-all duration-200"
          >
            About
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/about')}
            className="sm:hidden rounded-full w-8 h-8 hover:bg-accent/80 transition-all duration-200"
            aria-label="About"
            title="About"
          >
            <Home className="h-4 w-4" />
          </Button>
          
          {/* Feed Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/feed')}
            className="hidden sm:inline-flex rounded-full px-4 py-2 text-sm font-medium hover:bg-accent/80 transition-all duration-200"
          >
            Feed
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/feed')}
            className="sm:hidden rounded-full w-8 h-8 hover:bg-accent/80 transition-all duration-200"
            aria-label="Feed"
            title="Feed"
          >
            <Mic className="h-4 w-4" />
          </Button>
          {user ? (
            <div className="flex items-center gap-2">
              {!creditsLoading && creditsInfo && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMembershipModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 h-8 text-xs font-medium rounded-full bg-accent/30 border border-border/30 hover:bg-accent/50 hover:border-border/50 backdrop-blur-sm transition-all duration-200"
                  >
                    <Coins className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                    <span className="text-foreground font-semibold">{Math.floor(creditsInfo.balance * 100) / 100}</span>
                  </Button>
                   {/* Low credits warning dot */}
                   {creditsInfo.balance < 45 && (
                     <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                   )}
                </div>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-full px-3 py-1.5 h-8 text-xs bg-background/80 border-border/30 hover:bg-accent/50 hover:border-border/50 backdrop-blur-sm transition-all duration-200">
                    <User className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline text-xs font-medium">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/feed')}>
                  <Mic className="mr-2 h-4 w-4" />
                  Feed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMembershipModalOpen(true)}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Get Credits
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      if (isMobile) {
                        setShowSystemFlowMobileNotice(true)
                      } else {
                        navigate('/system-flow')
                      }
                    }}>
                      <GitBranch className="mr-2 h-4 w-4" />
                      System Flow
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/auth?mode=signup')}
                className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-background/80 border-border/30 hover:bg-accent/50 hover:border-border/50 backdrop-blur-sm transition-all duration-200"
              >
                Sign up
              </Button>
              <Button 
                size="sm" 
                onClick={() => navigate('/auth?mode=signin')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
              >
                Sign in
              </Button>
            </>
          )}
        </div>
      </div>
      <MembershipModal 
        open={membershipModalOpen} 
        onOpenChange={setMembershipModalOpen} 
      />
      
      <AlertDialog open={showSystemFlowMobileNotice} onOpenChange={setShowSystemFlowMobileNotice}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desktop-only feature</AlertDialogTitle>
            <AlertDialogDescription>
              System Flow is only accessible on desktop. Please open Woices on a laptop or desktop to view it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {location.pathname === '/admin' && (
              <AlertDialogAction 
                className="bg-muted text-muted-foreground hover:bg-muted/80"
                onClick={() => {
                  setShowSystemFlowMobileNotice(false)
                }}
              >
                Stay on Admin Panel
              </AlertDialogAction>
            )}
            <AlertDialogAction onClick={() => {
              setShowSystemFlowMobileNotice(false)
              navigate('/')
            }}>
              Go Home
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  )
}
