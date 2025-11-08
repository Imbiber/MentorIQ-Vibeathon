import Link from 'next/link'
import { Brain, Upload, BarChart3, Settings, Sparkles, Zap } from 'lucide-react'

export function Navigation() {
  return (
    <nav className="fixed top-0 w-full z-50 glass border-b">
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <Sparkles className="w-3 h-3 text-primary absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <div className="text-xl font-bold gradient-text">MentorIQ</div>
              <div className="text-xs text-muted-foreground font-medium -mt-1">Behavior Intelligence</div>
            </div>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium group"
            >
              <BarChart3 className="w-4 h-4 group-hover:scale-110 transition-transform text-primary" />
              Dashboard
            </Link>
            <Link 
              href="/upload" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium group"
            >
              <Upload className="w-4 h-4 group-hover:scale-110 transition-transform text-secondary" />
              Upload
            </Link>
            <Link 
              href="/settings" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium group"
            >
              <Settings className="w-4 h-4 group-hover:scale-110 transition-transform text-accent" />
              Settings
            </Link>
          </div>

          {/* CTA Button */}
          <div className="flex items-center gap-4">
            <Link href="/upload" className="hidden sm:block">
              <button className="btn-hero px-6 py-2.5 rounded-xl font-semibold text-sm group transition-all duration-300">
                <Zap className="w-4 h-4 inline mr-2 group-hover:rotate-12 transition-transform" />
                Process Meeting
              </button>
            </Link>
            
            {/* Mobile Menu Button */}
            <button className="md:hidden glass p-2 rounded-xl">
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <div className="w-4 h-0.5 bg-foreground/70 mb-1"></div>
                <div className="w-4 h-0.5 bg-foreground/70 mb-1"></div>
                <div className="w-4 h-0.5 bg-foreground/70"></div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}