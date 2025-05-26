
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Lightbulb, Globe, Database, Cloud, Map, Satellite } from "lucide-react";

const About = () => {
  const projectGuides = [
    {
      name: "Prof. Bharani Prabhakar",
      email: "bharaniprabhakar22@gmail.com",
      contact: "7795706210"
    },
    {
      name: "Prof. Rekha Poral", 
      email: "rekha@mvjce.edu.in",
      contact: "8892754661"
    }
  ];

  const teamMembers = [
    {
      name: "CHANDRAHAS K",
      usn: "1MJ21CD010",
      email: "kchandrahas863@gmail.com",
      mobile: "7090207931",
      role: "Team Leader"
    },
    {
      name: "JAHNAVI V S",
      usn: "1MJ21CD018", 
      email: "jahnavivs712@gmail.com",
      mobile: "8310709992",
      role: "Team Member"
    },
    {
      name: "S KEDARESHWARA SUBBA REDDY",
      usn: "1MJ21CD045",
      email: "s.kedhareshwar@gmail.com", 
      mobile: "6304586390",
      role: "Team Member"
    },
    {
      name: "SHALINI P",
      usn: "1MJ21CD046",
      email: "shalini250703@gmail.com",
      mobile: "9148137192", 
      role: "Team Member"
    }
  ];

  const apis = [
    { name: "ISRO BHUVAN", purpose: "Satellite imagery and geospatial data" },
    { name: "NASA MODIS", purpose: "Earth observation data" },
    { name: "OpenWeatherMap", purpose: "Real-time weather and climate data" },
    { name: "Mapbox", purpose: "Interactive mapping and visualization" },
    { name: "Supabase", purpose: "Backend database and authentication" }
  ];

  const methodology = [
    {
      title: "Data Collection",
      description: "Gather satellite imagery from NASA MODIS, ESA Sentinel, and ISRO BHUVAN. Obtain weather data from IMD and OpenWeatherMap. Collect urban zoning maps from BBMP."
    },
    {
      title: "Data Preprocessing", 
      description: "Clean and standardize the collected data. Merge geospatial datasets for analysis using PostGIS."
    },
    {
      title: "Feature Extraction",
      description: "Identify critical features like rainfall, drainage systems, and flood-prone areas."
    },
    {
      title: "Flood Prediction",
      description: "Develop machine learning models like Random Forest to predict floods based on historical weather and hydrological data."
    },
    {
      title: "Real-Time Water Monitoring",
      description: "Use GIS tools to monitor water levels and detect encroachments in lakes."
    },
    {
      title: "Lake Restoration Planning", 
      description: "Compare historical and current data to identify encroachments and prioritize lake restoration."
    },
    {
      title: "Urban Planning",
      description: "Analyze zoning maps to provide safe zones and flood-prone area recommendations."
    },
    {
      title: "Dashboard Development",
      description: "Create an interactive dashboard to display flood alerts, GIS maps, and actionable insights."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16 pb-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              About Bengaluru Urban Pulse
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              A comprehensive solution for flood prediction, lake monitoring, and urban planning to build a more sustainable and resilient Bengaluru.
            </p>
          </div>

          {/* Project Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5 text-blue-600" />
                  Project Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Our project addresses critical urban challenges in Bengaluru, promoting sustainable development and disaster management through advanced technology and data-driven insights.
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Relevance to Society:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Promoting sustainable development and disaster management for urban resilience.
                  </p>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Relevance to Industry:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Real estate developers, environmental consultants, and government agencies can use the system for planning and compliance.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5 text-yellow-600" />
                  Expected Outcomes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Predicting floods and providing timely alerts to communities
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Offering data-driven urban planning recommendations
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Enabling GIS-based lake restoration and tracking
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Providing real-time dashboard for environmental insights
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Guides */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-green-600" />
                Project Guides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projectGuides.map((guide, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{guide.name}</h3>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p>📧 {guide.email}</p>
                      <p>📱 {guide.contact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-blue-600" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teamMembers.map((member, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                      {member.role === "Team Leader" && (
                        <Badge variant="default" className="bg-blue-600">Leader</Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p>🎓 USN: {member.usn}</p>
                      <p>📧 {member.email}</p>
                      <p>📱 {member.mobile}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* APIs and Technologies */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cloud className="mr-2 h-5 w-5 text-purple-600" />
                APIs & Technologies Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {apis.map((api, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{api.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{api.purpose}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Methodology */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5 text-orange-600" />
                Methodology
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {methodology.map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4 mt-1">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
