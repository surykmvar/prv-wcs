
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useAuth } from '@/hooks/useAuth'
import { useAdminRole } from '@/hooks/useAdminRole'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Mic, Shield } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const { user, signOut } = useAuth()
  const { isAdmin } = useAdminRole()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <header className="w-full px-4 sm:px-6 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center mt-2 sm:mt-3 md:mt-4">
        <div 
          className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-woices-violet to-woices-mint bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity relative"
          onClick={(e) => {
            console.log('Woices header clicked'); // Debug log
            e.preventDefault();
            navigate('/');
          }}
          style={{ WebkitBackgroundClip: 'text', backgroundClip: 'text' }}
        >
          Woices
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              if (!user) {
                navigate('/auth?mode=signup&redirect=' + encodeURIComponent('/feed'))
              } else {
                navigate('/feed')
              }
            }} 
            className="hidden sm:inline-flex"
          >
            Feed
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (!user) {
                navigate('/auth?mode=signup&redirect=' + encodeURIComponent('/feed'))
              } else {
                navigate('/feed')
              }
            }}
            className="sm:hidden"
            aria-label="Feed"
            title="Feed"
          >
            <Mic className="h-5 w-5" />
          </Button>
          {user ? (
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
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/auth?mode=signup')}
                className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 rounded-md"
              >
                Register for free
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
    </header>
  )
}
