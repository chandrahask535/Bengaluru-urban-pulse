
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, IndianRupee, Timer } from "lucide-react";

interface Project {
  id: string;
  name: string;
  type: string;
  location: string;
  budget: string;
  startDate: string;
  endDate: string;
  status: "In Progress" | "Completed" | "Planned";
  description: string;
  impactRadius: string;
  coordinates: [number, number];
  lastUpdated: string;
  latitude: string;
  longitude: string;
}

const projects: Project[] = [
  {
    id: "metro-purple",
    name: "Metro Line Extension - Purple Line",
    type: "Transit",
    location: "Whitefield",
    budget: "₹15.50 Cr",
    startDate: "15 May 2023",
    endDate: "30 Jun 2025",
    status: "In Progress",
    description: "Extension of the Purple Line metro route to improve connectivity",
    impactRadius: "3.2 km",
    coordinates: [12.9716, 77.5946],
    lastUpdated: "1 Mar 2024",
    latitude: "12.9716",
    longitude: "77.5946"
  },
  {
    id: "water-management",
    name: "Smart City Water Management",
    type: "Utilities",
    location: "Koramangala",
    budget: "₹8.75 Cr",
    startDate: "1 Feb 2023",
    endDate: "31 Dec 2024",
    status: "In Progress",
    description: "Implementation of smart water meters and leak detection systems",
    impactRadius: "3.2 km",
    coordinates: [12.9352, 77.6245],
    lastUpdated: "15 Feb 2024",
    latitude: "12.9352",
    longitude: "77.6245"
  },
  {
    id: "cbd-rejuvenation",
    name: "Central Business District Rejuvenation",
    type: "Urban Development",
    location: "MG Road",
    budget: "₹21.00 Cr",
    startDate: "10 Nov 2022",
    endDate: "30 Oct 2024",
    status: "In Progress",
    description: "Comprehensive rejuvenation of the CBD area including facade renovation",
    impactRadius: "1.8 km",
    coordinates: [12.9758, 77.6096],
    lastUpdated: "1 Mar 2024",
    latitude: "12.9758",
    longitude: "77.6096"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "In Progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "Completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "Planned":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }
};

const GovernmentProjects = () => {
  return (
    <div className="space-y-6">
      {projects.map((project) => (
        <Card key={project.id} className="p-6">
          <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold">{project.name}</h3>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {project.description}
              </p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center">
                <IndianRupee className="w-4 h-4 mr-1" />
                {project.budget}
              </span>
              <span className="flex items-center">
                <Timer className="w-4 h-4 mr-1" />
                {project.endDate}
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-karnataka-metro-medium" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {project.location}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <CalendarDays className="w-4 h-4 text-karnataka-lake-medium" />
              <div>
                <p className="text-sm font-medium">Timeline</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {project.startDate} - {project.endDate}
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Impact Radius: {project.impactRadius}</p>
              <p>Last Updated: {project.lastUpdated}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default GovernmentProjects;
