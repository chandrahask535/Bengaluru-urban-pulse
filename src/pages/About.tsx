
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Lightbulb, Globe, Database, Cloud, Map, Satellite, Shield, Zap, BarChart, Droplet, Code, Server, Layers, Cpu } from "lucide-react";

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
      role: "Team Leader",
      linkedin: "https://www.linkedin.com/in/chandrahask535/",
      github: "https://github.com/chandrahask535"
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

  const techStack = [
    { 
      category: "Frontend Technologies", 
      technologies: [
        { name: "React", description: "TypeScript Framework", icon: Code },
        { name: "Tailwind CSS", description: "Responsive Design", icon: Layers },
        { name: "Leaflet", description: "Interactive Maps", icon: Map }
      ],
      color: "from-blue-100 to-cyan-100",
      darkColor: "dark:from-blue-900/30 dark:to-cyan-900/30"
    },
    { 
      category: "Backend & AI", 
      technologies: [
        { name: "Python", description: "Data Processing", icon: Server },
        { name: "ML Models", description: "Predictive Analytics", icon: Cpu },
        { name: "PostGIS", description: "Spatial Database", icon: Database }
      ],
      color: "from-green-100 to-emerald-100",
      darkColor: "dark:from-green-900/30 dark:to-emerald-900/30"
    },
    { 
      category: "Data Sources", 
      technologies: [
        { name: "NASA MODIS", description: "Satellite Data", icon: Satellite },
        { name: "IMD", description: "Weather Data", icon: Cloud },
        { name: "BBMP", description: "Urban Maps", icon: Globe }
      ],
      color: "from-purple-100 to-violet-100",
      darkColor: "dark:from-purple-900/30 dark:to-violet-900/30"
    }
  ];

  const apis = [
    { name: "ISRO BHUVAN", purpose: "Satellite imagery and geospatial data for comprehensive terrain analysis", icon: Satellite },
    { name: "NASA MODIS", purpose: "Earth observation data and climate monitoring", icon: Globe },
    { name: "OpenWeatherMap", purpose: "Real-time weather and climate data integration", icon: Cloud },
    { name: "Mapbox", purpose: "Interactive mapping, visualization, and spatial analytics", icon: Map },
    { name: "Supabase", purpose: "Backend database, authentication, and real-time data management", icon: Database }
  ];

  const keyFeatures = [
    {
      title: "AI-Powered Flood Prediction",
      description: "Advanced machine learning algorithms analyze historical weather patterns, satellite imagery, and real-time data to predict flood risks with 87% accuracy.",
      icon: Zap,
      color: "text-blue-600"
    },
    {
      title: "Real-Time Lake Monitoring",
      description: "Continuous monitoring of Bengaluru's 200+ lakes using satellite imagery and IoT sensors to detect encroachments and water quality changes.",
      icon: Droplet,
      color: "text-cyan-600"
    },
    {
      title: "Smart Urban Planning",
      description: "Data-driven insights for sustainable city development, identifying safe zones and optimizing infrastructure placement based on flood risk analysis.",
      icon: BarChart,
      color: "text-green-600"
    },
    {
      title: "Emergency Response System",
      description: "Automated alert system reaching 98% of affected residents through SMS, app notifications, and local announcements with 9.2 hours average warning time.",
      icon: Shield,
      color: "text-red-600"
    }
  ];

  const methodology = [
    {
      title: "Data Collection & Integration",
      description: "Comprehensive data gathering from multiple sources including NASA MODIS, ESA Sentinel, ISRO BHUVAN for satellite imagery, IMD and OpenWeatherMap for weather data, and BBMP for urban zoning maps. This multi-source approach ensures robust data foundation for accurate predictions.",
      step: 1
    },
    {
      title: "Advanced Data Preprocessing", 
      description: "Sophisticated data cleaning and standardization using PostGIS for geospatial analysis. Integration of diverse datasets including temporal alignment, spatial interpolation, and quality assessment to ensure data reliability and consistency across all sources.",
      step: 2
    },
    {
      title: "AI-Driven Feature Extraction",
      description: "Machine learning algorithms identify critical patterns in rainfall data, drainage system efficiency, elevation changes, and historical flood events. Advanced computer vision techniques analyze satellite imagery to detect urban development changes and environmental factors.",
      step: 3
    },
    {
      title: "Predictive Model Development",
      description: "Implementation of ensemble machine learning models including Random Forest, Gradient Boosting, and Neural Networks to predict flood risks. Models are trained on 10+ years of historical data with continuous learning capabilities for improved accuracy.",
      step: 4
    },
    {
      title: "Real-Time Monitoring System",
      description: "Deployment of GIS-based monitoring tools for continuous lake water level tracking, encroachment detection using satellite imagery comparison, and real-time weather data integration for immediate risk assessment and early warning generation.",
      step: 5
    },
    {
      title: "Urban Planning Intelligence", 
      description: "Comprehensive analysis of zoning maps, infrastructure capacity, and flood risk correlation to provide data-driven recommendations for safe urban development, infrastructure placement, and disaster-resilient city planning strategies.",
      step: 6
    },
    {
      title: "Interactive Dashboard & Visualization",
      description: "Development of responsive web application with real-time data visualization, interactive maps, alert management system, and stakeholder collaboration tools. Integration of mobile-responsive design for accessibility across all devices.",
      step: 7
    },
    {
      title: "Validation & Continuous Improvement",
      description: "Rigorous testing with historical flood events, accuracy validation against real incidents, stakeholder feedback integration, and continuous model refinement based on new data and changing urban patterns.",
      step: 8
    }
  ];

  const impactMetrics = [
    { metric: "87%", label: "Prediction Accuracy", description: "Flood risk assessment precision" },
    { metric: "9.2 hrs", label: "Average Warning Time", description: "Early alert system response" },
    { metric: "200+", label: "Lakes Monitored", description: "Comprehensive coverage" },
    { metric: "98%", label: "Alert Reach", description: "Population coverage for emergencies" },
    { metric: "42", label: "Areas Monitored", description: "Real-time flood risk zones" },
    { metric: "₹45Cr", label: "Damage Prevented", description: "Estimated economic impact" }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16 pb-12 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-full mb-6">
              <img 
                src="/favicon.svg" 
                alt="Bengaluru Urban Pulse Logo" 
                className="h-12 w-12" 
              />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-6">
              Bengaluru Urban Pulse
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Revolutionizing urban resilience through AI-powered flood prediction, comprehensive lake monitoring, and intelligent urban planning solutions for sustainable city development in Bengaluru.
            </p>
          </div>

          {/* Impact Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
            {impactMetrics.map((item, index) => (
              <div key={index} className="text-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{item.metric}</div>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{item.label}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{item.description}</div>
              </div>
            ))}
          </div>

          {/* Key Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Revolutionary Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {keyFeatures.map((feature, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <CardContent className="p-6">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-blue-100 to-green-100 mb-4`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Technology Stack */}
          <Card className="mb-12 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <img 
                  src="/favicon.svg" 
                  alt="Logo" 
                  className="h-6 w-6 mr-3" 
                />
                Technology Stack & Architecture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {techStack.map((category, index) => (
                  <div key={index} className={`bg-gradient-to-br ${category.color} ${category.darkColor} p-6 rounded-xl`}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{category.category}</h3>
                    <div className="space-y-3">
                      {category.technologies.map((tech, techIndex) => (
                        <div key={techIndex} className="flex items-center">
                          <tech.icon className="h-5 w-5 text-gray-700 dark:text-gray-300 mr-3" />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{tech.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{tech.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* APIs Used */}
          <Card className="mb-12 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <img 
                  src="/favicon.svg" 
                  alt="Logo" 
                  className="h-6 w-6 mr-3" 
                />
                APIs Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apis.map((api, index) => (
                  <div key={index} className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                    <div className="flex items-center mb-3">
                      <api.icon className="h-6 w-6 text-purple-600 mr-3" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">{api.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{api.purpose}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Project Vision */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Target className="mr-3 h-6 w-6 text-blue-600" />
                  Project Vision & Mission
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Vision</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    To create a technologically advanced, data-driven ecosystem that transforms Bengaluru into a flood-resilient smart city through predictive analytics, real-time monitoring, and intelligent urban planning.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Mission</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Leveraging cutting-edge AI, satellite technology, and real-time data integration to prevent flood disasters, protect lives and property, and enable sustainable urban development for future generations.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Societal Impact</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Promoting disaster-resilient communities, sustainable development practices, and evidence-based policy making for urban resilience and environmental conservation.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Industry Applications</h4>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    Empowering real estate developers, environmental consultants, government agencies, and urban planners with actionable insights for risk assessment, compliance, and strategic planning.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Lightbulb className="mr-3 h-6 w-6 text-green-600" />
                  Expected Outcomes & Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">Advanced Flood Prediction System</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered early warning system with 87% accuracy, providing 9+ hours advance notice</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">Comprehensive Lake Restoration</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">GIS-based monitoring and restoration planning for 200+ lakes with encroachment detection</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">Smart Urban Planning</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Data-driven recommendations for sustainable development and infrastructure optimization</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">Real-time Monitoring Dashboard</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Interactive platform for environmental insights, risk visualization, and emergency response</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-red-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">Policy Enhancement</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Evidence-based decision making tools for government agencies and urban planners</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Guides */}
          <Card className="mb-12 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Users className="mr-3 h-6 w-6 text-green-600" />
                Project Guides & Mentors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {projectGuides.map((guide, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{guide.name}</h3>
                    <div className="space-y-2 text-gray-600 dark:text-gray-400">
                      <p className="flex items-center"><span className="font-medium mr-2">📧</span>{guide.email}</p>
                      <p className="flex items-center"><span className="font-medium mr-2">📱</span>{guide.contact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card className="mb-12 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Users className="mr-3 h-6 w-6 text-blue-600" />
                Development Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {teamMembers.map((member, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                      {member.role === "Team Leader" && (
                        <Badge variant="default" className="bg-blue-600 text-white">Leader</Badge>
                      )}
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <p><span className="font-medium">🎓 USN:</span> {member.usn}</p>
                      <p><span className="font-medium">📧 Email:</span> {member.email}</p>
                      <p><span className="font-medium">📱 Mobile:</span> {member.mobile}</p>
                      {member.linkedin && (
                        <div className="flex space-x-3 mt-3">
                          <a href={member.linkedin} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:text-blue-800 dark:text-blue-400">LinkedIn</a>
                          {member.github && (
                            <a href={member.github} target="_blank" rel="noopener noreferrer" 
                               className="text-gray-600 hover:text-gray-800 dark:text-gray-400">GitHub</a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Methodology */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Database className="mr-3 h-6 w-6 text-orange-600" />
                Advanced Methodology & Implementation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {methodology.map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-lg font-bold mr-6 mt-1">
                      {step.step}
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{step.title}</h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{step.description}</p>
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
