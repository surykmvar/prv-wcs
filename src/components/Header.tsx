
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useAuth } from '@/hooks/useAuth'
import { useAdminRole } from '@/hooks/useAdminRole'
import { useCredits } from '@/hooks/useCredits'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Mic, Shield, GitBranch, CreditCard, Coins, Home, Play } from 'lucide-react'
import { MembershipModal } from '@/components/MembershipModal'
import { useState } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { useLocation } from 'react-router-dom'
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

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <header className="w-full px-4 sm:px-6 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center mt-2 sm:mt-3 md:mt-4">
        <div 
          className="cursor-pointer hover:opacity-80 transition-opacity relative"
          onClick={(e) => {
            console.log('Woices header clicked'); // Debug log
            e.preventDefault();
            navigate('/');
          }}
        >
          <img 
            src="/lovable-uploads/ccb13ffe-01c5-48bb-9a1d-19f49502baa9.png" 
            alt="Woices" 
            className="h-12 sm:h-14 rounded-full"
          />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          
          {/* Get Started Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/start')}
            className="hidden sm:inline-flex"
          >
            Get Started
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/start')}
            className="sm:hidden"
            aria-label="Get Started"
            title="Get Started"
          >
            <Play className="h-5 w-5" />
          </Button>
          
          {/* Feed Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/feed')}
            className="hidden sm:inline-flex"
          >
            Feed
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/feed')}
            className="sm:hidden"
            aria-label="Feed"
            title="Feed"
          >
            <Mic className="h-5 w-5" />
          </Button>
          {user ? (
            <div className="flex items-center gap-2">
              {!creditsLoading && creditsInfo && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMembershipModalOpen(true)}
                    className="flex items-center gap-1.5 px-2 py-1 h-8 text-xs font-medium rounded-full border border-border/50 hover:bg-accent hover:border-border transition-colors"
                  >
                    <Coins className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                    <span className="text-foreground">{Math.floor(creditsInfo.balance * 100) / 100}</span>
                  </Button>
                   {/* Low credits warning dot */}
                   {creditsInfo.balance < 45 && (
                     <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                   )}
                </div>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.email}</span>
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
                className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 rounded-md"
              >
                Sign up
              </Button>
              <Button 
                size="sm" 
                onClick={() => navigate('/auth?mode=signin')}
                className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 rounded-md"
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
