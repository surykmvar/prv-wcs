
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <header className="w-full px-4 sm:px-6 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
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
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => console.log('Navigate to profile')}>
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
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
                Login
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
