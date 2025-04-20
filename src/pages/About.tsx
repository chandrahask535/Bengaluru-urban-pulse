
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

const About = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16 pb-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">About The Project</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2 text-karnataka-metro-medium" />
                Project Overview
              </h2>
              <div className="space-y-2 text-gray-800 dark:text-gray-300 text-sm">
                <p><strong>Key Objectives</strong></p>
                <ol className="list-decimal list-inside space-y-1 mb-4">
                  <li>Predict and prevent flooding events through real-time monitoring and ML-based forecasting</li>
                  <li>Monitor water levels in Bengaluru's lakes and identify encroachments</li>
                  <li>Provide data-driven recommendations for urban planning and lake restoration</li>
                  <li>Create an integrated dashboard for stakeholders to make informed decisions</li>
                  <li>Facilitate community participation in water management and conservation</li>
                </ol>
                <p><strong>Technology Stack</strong></p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-blue-100 p-3 rounded text-blue-800 dark:text-blue-300 text-sm">
                    <p><strong>Frontend</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>React with TypeScript</li>
                      <li>Tailwind CSS for styling</li>
                      <li>Leaflet for interactive maps</li>
                    </ul>
                  </div>
                  <div className="bg-green-100 p-3 rounded text-green-800 dark:text-green-300 text-sm">
                    <p><strong>Backend</strong></p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Python for data processing</li>
                      <li>Machine learning models</li>
                      <li>PostgreSQL/PostGIS for spatial data</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-4"><strong>Data Sources</strong></p>
                <ul className="list-disc list-inside grid grid-cols-2 gap-2 text-sm">
                  <li>Satellite imagery (NASA MODIS, ESA Sentinel)</li>
                  <li>IMD weather data</li>
                  <li>BBMP zoning maps</li>
                  <li>ISRO BHUVAN data</li>
                  <li>OpenWeatherMap API</li>
                  <li>Historical encroachment data</li>
                </ul>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Project Impact</h2>
              <div className="space-y-4 text-sm text-gray-800 dark:text-gray-300">
                <div className="bg-blue-100 p-3 rounded text-blue-800 dark:text-blue-300">
                  <strong>Flood Management</strong>
                  <p>Early warnings could reduce flood damage by up to 40% and potentially save lives by enabling timely evacuations from high-risk areas.</p>
                </div>
                <div className="bg-green-100 p-3 rounded text-green-800 dark:text-green-300">
                  <strong>Lake Preservation</strong>
                  <p>Identifying and preventing encroachments could help restore 20-30% of lost lake area over the next decade.</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded text-yellow-800 dark:text-yellow-300">
                  <strong>Urban Planning</strong>
                  <p>Data-driven zoning recommendations could prevent an estimated 500 crores rupees in flood damage annually by guiding development away from high-risk areas.</p>
                </div>
                <div className="bg-purple-100 p-3 rounded text-purple-800 dark:text-purple-300">
                  <strong>Water Security</strong>
                  <p>Improved water management could help address Bengaluru's water scarcity issues by better preserving and utilizing local water bodies.</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 lg:col-span-3">
              <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-gray-700 dark:text-gray-400">
                <div>
                  <p><strong>Project Team</strong></p>
                  <p>Chandrahas K, Jahnavi V S, S Kedareshwara Subba Reddy, Shalini P</p>
                  <p>MVJ College Of Engineering</p>
                  <p>Email: kchandrahas863@gmail.com</p>
                </div>
                <div>
                  <p><strong>Collaborating Organizations</strong></p>
                  <ul>
                    <li>Bengaluru Water Supply and Sewerage Board</li>
                    <li>Karnataka State Natural Disaster Monitoring Centre</li>
                    <li>Bruhat Bengaluru Mahanagara Palike (BBMP)</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
