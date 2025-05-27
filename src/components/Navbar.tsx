
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Flood Prediction", href: "/prediction" },
    { name: "Lake Monitoring", href: "/lakes" },
    { name: "Urban Planning", href: "/urban-planning" },
    { name: "About", href: "/about" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <img 
              src="/favicon.svg" 
              alt="Bengaluru Urban Pulse Logo" 
              className="h-8 w-8" 
            />
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold gradient-heading">
                Bengaluru Urban Pulse
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-karnataka-metro-light text-karnataka-metro-dark dark:bg-karnataka-metro-dark dark:text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Theme Toggle and Mobile Menu Button */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}
            </Button>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-700">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-karnataka-metro-light text-karnataka-metro-dark dark:bg-karnataka-metro-dark dark:text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
