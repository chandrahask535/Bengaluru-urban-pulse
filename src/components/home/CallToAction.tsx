
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CallToAction = () => {
  return (
    <div className="bg-karnataka-metro-dark dark:bg-karnataka-metro-medium">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          <span className="block">Ready to make an impact?</span>
          <span className="block text-karnataka-metro-light">Start using Urban Pulse today.</span>
        </h2>
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div className="inline-flex rounded-md shadow">
            <Link to="/dashboard">
              <Button className="bg-white hover:bg-gray-50 text-karnataka-metro-dark">
                Go to Dashboard
                <ArrowRight className="ml-2 -mr-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="ml-3 inline-flex rounded-md shadow">
            <Link to="/report">
              <Button variant="outline" className="border-white text-white hover:bg-karnataka-metro-medium">
                Report an Issue
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallToAction;
