import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, ChevronDown, User, Building2, Shield, Menu, X } from "lucide-react"
// import HeaderSearch from "./HeaderSearch"
import { useAuth } from "@/context/AuthContext"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const location = useLocation()
  const currentPath = location.pathname

  useEffect(() => {
    const loginPaths = ["/student/signin", "/club/signin", "/admin/signin"];
    const isLoginPage = loginPaths.includes(currentPath);

    if (user !== null && isLoginPage) {
      // If user is logged in and is on a login page, redirect them away.
      if (user.userType === "super_admin") {
        navigate("/admin/dashboard");
      } else if (user.userType === "admin") {
        navigate("/club/dashboard");
      } else if (user.userType === "student") {
        window.open("/practice", "_blank");
        navigate("/"); // Also navigate to home after opening practice in new tab
      } else {
        navigate("/"); // Fallback for unexpected userType
      }
    }
  }, [user, navigate, currentPath]);

  const navigationItems = [
    { href: "/", label: "Home" },
    { href: "/practice", label: "Practice Zone", isExternal: true },
    { href: "/club/dashboard", label: "For Clubs" },
    { href: "/admin/dashboard", label: "For Super Admin" },
    { href: "#club-request", label: "Register a Club", isHash: true },
    { href: "/student/register", label: "Register as Learner" },
  ]

  const handleLogout = () => {
    logout()
    navigate("/") // Immediately navigate to home after logout is initiated
  }

  const handleNavClick = (item: typeof navigationItems[0]) => {
    if (item.isHash) {
      // Check if we're already on the home page
      if (currentPath === '/') {
        // Handle hash scrolling manually if already on home page
        const element = document.getElementById(item.href.substring(1))
        if (element) {
          const headerHeight = 80 // Account for fixed header height
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          const offsetPosition = elementPosition - headerHeight
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          })
        }
      } else {
        // Navigate to home page first, then scroll to section
        navigate('/')
        // Use setTimeout to ensure navigation completes before scrolling
        setTimeout(() => {
          const element = document.getElementById(item.href.substring(1))
          if (element) {
            const headerHeight = 80
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
            const offsetPosition = elementPosition - headerHeight
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            })
          }
        }, 100) // Small delay to ensure DOM is ready
      }
    }
  }

  // Check user types
  const isStudent = user?.userType === "student"
  const isAdmin = user?.userType === "admin"
  const isSuperAdmin = user?.userType === "super_admin"

  // Filter navigation items based on user type
  const filteredNavigationItems = navigationItems.filter(item => {
    if (isSuperAdmin) {
      // Super admin sees Home and For Super Admin
      return item.href === "/" || item.href === "/admin/dashboard";
    }
    if (isAdmin) {
      // Admin sees Home and For Clubs
      return item.href === "/" || item.href === "/club/dashboard";
    }
    if (isStudent) {
      // Students see only Home and Practice Zone
      return item.href === "/" || item.href === "/practice";
    }
    return item.href === "/" || item.href === "/practice" || item.href === "#club-request" || item.href === "/student/register";
  });

  // Check if current path matches or is a subpath of the navigation item
  const isActivePath = (path: string) => {
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center" aria-label="TrainingX.AI Home">
              <div className="flex items-center gap-3">
                {/* <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TX</span>
                </div> */}
                {/* <img 
                src="/logo.png"
                alt="TrainingX.AI Logo" 
                className="h-8 w-auto"
              /> */}
                <span className="text-xl font-bold font-mono bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TrainingX.AI 
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation with Search */}
          {user ? (
            <div className="flex-1 flex items-center justify-center gap-6">
              {/* <HeaderSearch /> */}
              <nav className="hidden md:flex items-center space-x-1" aria-label="Main navigation">
                {filteredNavigationItems.map((item) => (
                  item.isHash ? (
                    <button
                      key={item.href}
                      onClick={() => handleNavClick(item)}
                      className="px-4 py-2 rounded-lg text-sm font-medium font-mono transition-all duration-200 text-gray-900 hover:text-gray-900 hover:bg-gray-100"
                    >
                      {item.label}
                    </button>
                  ) : item.isExternal ? (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg text-sm font-medium font-mono transition-all duration-200 text-gray-900 hover:text-gray-900 hover:bg-gray-100"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.href}
                      to={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium font-mono transition-all duration-200 ${
                        isActivePath(item.href)
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-900 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                ))}
              </nav>
            </div>
          ) : (
            <nav className="flex-1 hidden md:flex items-center justify-center space-x-1" aria-label="Main navigation">
              {filteredNavigationItems.map((item) => (
                item.isHash ? (
                  <button
                    key={item.href}
                    onClick={() => handleNavClick(item)}
                    className="px-4 py-2 rounded-lg text-sm font-medium font-mono transition-all duration-200 text-gray-900 hover:text-gray-900 hover:bg-gray-100"
                  >
                    {item.label}
                  </button>
                ) : item.isExternal ? (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg text-sm font-medium font-mono transition-all duration-200 text-gray-900 hover:text-gray-900 hover:bg-gray-100"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium font-mono transition-all duration-200 ${
                      isActivePath(item.href)
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-900 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </nav>
          )}

          {/* Desktop Navigation */}

          {/* Desktop User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar || undefined} alt={user.username} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium font-mono text-gray-900">{user.username}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-900 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-blue-700 hover:to-purple-700 rounded-lg px-6 py-2 text-sm font-medium font-mono transition-all duration-200 flex items-center gap-2 shadow-lg"
                    >
                      Log In As
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-xl rounded-lg">
                    <DropdownMenuItem asChild>
                      <Link
                        to="/student/signin"
                        className="flex items-center gap-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer px-3 py-2 font-mono"
                      >
                        <User className="h-4 w-4" />
                        <span>Learner Login</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/club/signin"
                        className="flex items-center gap-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer px-3 py-2 font-mono"
                      >
                        <Building2 className="h-4 w-4" />
                        <span>Club Login</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/admin/signin"
                        className="flex items-center gap-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer px-3 py-2 font-mono"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Super Admin Login</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-transparent">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {filteredNavigationItems.map((item) => (
                item.isHash ? (
                  <button
                    key={item.href}
                    onClick={() => {
                      handleNavClick(item)
                      setIsMobileMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium font-mono transition-colors duration-200 text-gray-900 hover:text-gray-900 hover:bg-gray-100"
                  >
                    {item.label}
                  </button>
                ) : item.isExternal ? (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-2 rounded-lg text-sm font-medium font-mono transition-colors duration-200 text-gray-900 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium font-mono transition-colors duration-200 ${isActivePath(item.href)
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-900 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              ))}

              {/* Mobile User Section */}
              {user ? (
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar || undefined} alt={user.username} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium font-mono text-gray-900">{user.username}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleLogout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="text-gray-900 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center mt-4 pt-4"></div>
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                    <Link to="/student/signin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full flex items-center gap-2 text-gray-900 hover:bg-blue-100 font-mono"
                      >
                        <User className="h-4 w-4" />
                        Learner Login
                      </Button>
                    </Link>
                    <Link to="/club/signin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full flex items-center gap-2 text-gray-900 hover:bg-blue-100 font-mono"
                      >
                        <Building2 className="h-4 w-4" />
                        Club Login
                      </Button>
                    </Link>
                    <Link to="/admin/signin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full flex items-center gap-2 text-gray-900 hover:bg-blue-100 font-mono"
                      >
                        <Shield className="h-4 w-4" />
                        Super Admin Login
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
