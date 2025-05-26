
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Info, Users, Target, Database, Brain, Map, 
  Droplet, Building2, TreePine, AlertTriangle,
  Mail, Phone, GraduationCap, Code, Sparkles
} from "lucide-react";

const About = () => {
  const teamMembers = [
    {
      name: "CHANDRAHAS K",
      usn: "1MJ21CD010",
      email: "kchandrahas863@gmail.com",
      phone: "7090207931",
      role: "Team Leader",
      isLeader: true
    },
    {
      name: "JAHNAVI V S",
      usn: "1MJ21CD018",
      email: "jahnavivs712@gmail.com",
      phone: "8310709992",
      role: "Developer"
    },
    {
      name: "S KEDARESHWARA SUBBA REDDY",
      usn: "1MJ21CD045",
      email: "s.kedhareshwar@gmail.com",
      phone: "6304586390",
      role: "Developer"
    },
    {
      name: "SHALINI P",
      usn: "1MJ21CD046",
      email: "shalini250703@gmail.com",
      phone: "9148137192",
      role: "Developer"
    }
  ];

  const methodologySteps = [
    {
      title: "Data Collection",
      description: "Comprehensive gathering of satellite imagery from NASA MODIS, ESA Sentinel, and ISRO BHUVAN. Weather data acquisition from IMD and OpenWeatherMap APIs, along with urban zoning maps from BBMP.",
      icon: Database
    },
    {
      title: "Data Preprocessing",
      description: "Advanced cleaning and standardization of collected datasets. Integration of geospatial data using PostGIS for seamless analysis and processing.",
      icon: Code
    },
    {
      title: "Feature Extraction",
      description: "Intelligent identification of critical environmental features including rainfall patterns, drainage system efficiency, flood-prone zones, and urban development density.",
      icon: Brain
    },
    {
      title: "Flood Prediction",
      description: "Implementation of sophisticated machine learning models including Random Forest algorithms to predict flood events based on comprehensive historical weather and hydrological data analysis.",
      icon: AlertTriangle
    },
    {
      title: "Real-Time Monitoring",
      description: "Deployment of advanced GIS tools for continuous water level monitoring and automated detection of lake encroachments using satellite imagery analysis.",
      icon: Map
    },
    {
      title: "Urban Planning Integration",
      description: "Comprehensive analysis of municipal zoning maps to provide data-driven recommendations for safe development zones and flood-risk area identification.",
      icon: Building2
    }
  ];

  const expectedOutcomes = [
    {
      title: "Flood Prediction & Alerts",
      description: "Advanced early warning system capable of predicting flood events with high accuracy and providing timely alerts to authorities and citizens.",
      icon: Droplet
    },
    {
      title: "Data-Driven Urban Planning",
      description: "Intelligent recommendations for sustainable urban development based on comprehensive environmental and geological analysis.",
      icon: Building2
    },
    {
      title: "Lake Restoration & Monitoring",
      description: "Real-time GIS-based tracking system for lake health monitoring, encroachment detection, and restoration planning.",
      icon: TreePine
    },
    {
      title: "Interactive Dashboard",
      description: "Comprehensive real-time dashboard providing water level monitoring, environmental insights, and actionable intelligence for stakeholders.",
      icon: Map
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <main className="flex-grow pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-blue-700 dark:text-blue-300 font-medium">Bengaluru Urban Pulse</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              Intelligent Urban Management for
              <span className="block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Sustainable Bengaluru
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              A cutting-edge AI-powered platform combining satellite imagery, machine learning, and real-time data analytics to address Bengaluru's critical urban challenges through predictive flood management and intelligent lake monitoring.
            </p>
          </div>

          {/* Project Guide Section */}
          <Card className="border-l-4 border-l-blue-500 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="w-6 h-6 text-blue-600" />
                <span>Project Supervision</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-lg text-blue-800 dark:text-blue-300">Prof. Rekha Poral</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">Project Guide</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>8892754661</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-green-600" />
                <span>Development Team</span>
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                MVJ College of Engineering - Computer Science & Engineering
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teamMembers.map((member, index) => (
                  <div key={index} className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                    member.isLeader 
                      ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200 dark:from-green-900/20 dark:to-blue-900/20 dark:border-green-800' 
                      : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {member.name}
                      </h3>
                      {member.isLeader && (
                        <Badge variant="default" className="bg-green-600">
                          Team Leader
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      USN: {member.usn}
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                        <Phone className="w-4 h-4" />
                        <span>{member.phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Project Objectives */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-6 h-6 text-purple-600" />
                <span>Project Objectives</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-purple-800 dark:text-purple-300">Primary Goals</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 dark:text-gray-300">
                        Develop AI-powered flood prediction system with 85%+ accuracy using historical weather patterns and real-time data
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 dark:text-gray-300">
                        Create comprehensive lake monitoring system to track water levels and detect encroachments in real-time
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 dark:text-gray-300">
                        Provide data-driven urban planning recommendations for sustainable city development
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-blue-800 dark:text-blue-300">Societal Impact</h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-blue-800 dark:text-blue-300 text-sm mb-2">
                      <strong>Relevance to Society:</strong> Addresses critical urban challenges in Bengaluru, promoting sustainable development and comprehensive disaster management strategies.
                    </p>
                    <p className="text-blue-800 dark:text-blue-300 text-sm">
                      <strong>Industry Applications:</strong> Real estate developers, environmental consultants, and government agencies can leverage this system for strategic planning and regulatory compliance.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Methodology */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-6 h-6 text-orange-600" />
                <span>Advanced Methodology</span>
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400">
                Our systematic approach combines cutting-edge technology with proven scientific methods
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {methodologySteps.map((step, index) => (
                  <div key={index} className="flex space-x-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                        <step.icon className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-lg text-orange-800 dark:text-orange-300 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expected Outcomes */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-green-600" />
                <span>Expected Outcomes & Impact</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {expectedOutcomes.map((outcome, index) => (
                  <div key={index} className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <outcome.icon className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-green-800 dark:text-green-300">
                        {outcome.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {outcome.description}
                    </p>
                  </div>
                ))}
              </div>
              
              <Separator className="my-6" />
              
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg">
                <h3 className="font-semibold text-lg text-indigo-800 dark:text-indigo-300 mb-4">
                  Long-term Vision & Benefits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-indigo-700 dark:text-indigo-300 mb-2">Policy Impact</h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Enhanced decision-making capabilities for policymakers to address urban challenges with scientific precision and data-backed strategies.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-indigo-700 dark:text-indigo-300 mb-2">Community Engagement</h4>
                    <p className="text-gray-700 dark:text-gray-300">
                      Increased public awareness and active participation in sustainable urban development initiatives through accessible real-time information.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technology Stack */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="w-6 h-6 text-indigo-600" />
                <span>Technology Stack & Architecture</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Frontend Technologies</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">React</Badge>
                        <span className="text-gray-600 dark:text-gray-400">TypeScript Framework</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">Tailwind CSS</Badge>
                        <span className="text-gray-600 dark:text-gray-400">Responsive Design</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">Leaflet</Badge>
                        <span className="text-gray-600 dark:text-gray-400">Interactive Maps</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">Backend & AI</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">Python</Badge>
                        <span className="text-gray-600 dark:text-gray-400">Data Processing</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">ML Models</Badge>
                        <span className="text-gray-600 dark:text-gray-400">Predictive Analytics</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">PostGIS</Badge>
                        <span className="text-gray-600 dark:text-gray-400">Spatial Database</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-3">Data Sources</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">NASA MODIS</Badge>
                        <span className="text-gray-600 dark:text-gray-400">Satellite Data</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">IMD</Badge>
                        <span className="text-gray-600 dark:text-gray-400">Weather Data</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">BBMP</Badge>
                        <span className="text-gray-600 dark:text-gray-400">Urban Maps</span>
                      </div>
                    </div>
                  </div>
                </div>
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
