
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"

export function Header() {
  return (
    <header className="w-full px-4 sm:px-6 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-woices-violet to-woices-mint bg-clip-text text-transparent">
          Woices
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 rounded-md">
            Register for free
          </Button>
          <Button size="sm" className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 rounded-md">
            Login
          </Button>
        </div>
      </div>
    </header>
  )
}
