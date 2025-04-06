
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, MapPin, CloudRain, DropletIcon, Building, BarChart3, FileEdit, User, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { name: "Home", path: "/", icon: <MapPin className="w-4 h-4 mr-2" /> },
    { name: "Flood Prediction", path: "/flood-prediction", icon: <CloudRain className="w-4 h-4 mr-2" /> },
    { name: "Lake Monitoring", path: "/lake-monitoring", icon: <DropletIcon className="w-4 h-4 mr-2" /> },
    { name: "Urban Planning", path: "/urban-planning", icon: <Building className="w-4 h-4 mr-2" /> },
    { name: "Dashboard", path: "/dashboard", icon: <BarChart3 className="w-4 h-4 mr-2" /> },
    { name: "Report Issue", path: "/report", icon: <FileEdit className="w-4 h-4 mr-2" /> },
  ];

  return (
    <nav className="bg-white shadow-sm dark:bg-gray-900 fixed w-full z-20 top-0 left-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                className="h-8 w-auto"
                src="/placeholder.svg"
                alt="Karnataka Urban Pulse"
              />
              <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">Urban Pulse</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="mr-2"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-karnataka-metro-medium hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-primary flex items-center transition-colors duration-200"
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">
                  {user.email}
                </span>
                <Button variant="outline" className="ml-2 flex items-center" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="outline" className="ml-4 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-karnataka-metro-medium hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-primary flex items-center transition-colors duration-200"
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
          {user ? (
            <div className="pt-2 pb-1">
              <span className="block px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                {user.email}
              </span>
              <Button 
                variant="outline" 
                className="w-full justify-start mt-2 flex items-center"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Link to="/auth" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full justify-start mt-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
