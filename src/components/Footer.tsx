
import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, Globe, Linkedin, Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center">
              <img src="/favicon.svg" alt="Bengaluru Urban Pulse" className="h-8 w-8" />
              <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">Urban Pulse</span>
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Smart urban management system for Bengaluru's sustainable development.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Modules</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/prediction" className="text-sm text-gray-600 hover:text-karnataka-metro-medium dark:text-gray-400">
                  Flood Prediction
                </Link>
              </li>
              <li>
                <Link to="/lakes" className="text-sm text-gray-600 hover:text-karnataka-metro-medium dark:text-gray-400">
                  Lake Monitoring
                </Link>
              </li>
              <li>
                <Link to="/urban-planning" className="text-sm text-gray-600 hover:text-karnataka-metro-medium dark:text-gray-400">
                  Urban Planning
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/dashboard" className="text-sm text-gray-600 hover:text-karnataka-metro-medium dark:text-gray-400">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/report" className="text-sm text-gray-600 hover:text-karnataka-metro-medium dark:text-gray-400">
                  Report Issues
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-gray-600 hover:text-karnataka-metro-medium dark:text-gray-400">
                  About
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Contact</h3>
            <ul className="mt-4 space-y-2">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  BBMP Complex, Hudson Circle, Bengaluru, 560002
                </span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                <a href="mailto:kchandrahas863@gmail.com" className="text-sm text-gray-600 hover:text-karnataka-metro-medium dark:text-gray-400">
                  kchandrahas863@gmail.com
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-2" />
                <a href="tel:+917090207931" className="text-sm text-gray-600 hover:text-karnataka-metro-medium dark:text-gray-400">
                  +91 70902 07931
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Bengaluru Urban Pulse. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="https://www.linkedin.com/in/chandrahask535/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-karnataka-metro-medium">
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-6 w-6" />
            </a>
            <a href="https://github.com/chandrahask535" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-karnataka-metro-medium">
              <span className="sr-only">GitHub</span>
              <Github className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
