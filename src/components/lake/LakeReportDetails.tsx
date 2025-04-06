
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Activity, AlertTriangle, AlertCircle, Clipboard, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LakeReport } from '@/services/LakeRealTimeService';

interface LakeReportDetailsProps {
  lakeId: string;
  lakeName: string;
  reports: LakeReport[];
}

const LakeReportDetails = ({ lakeId, lakeName, reports }: LakeReportDetailsProps) => {
  const [activeReport, setActiveReport] = useState<LakeReport | null>(reports.length > 0 ? reports[0] : null);

  const getReportTypeColor = (type: LakeReport['type']) => {
    switch (type) {
      case 'inspection':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'encroachment':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'biodiversity':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'quality':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getReportIcon = (type: LakeReport['type']) => {
    switch (type) {
      case 'inspection':
        return <Clipboard className="h-4 w-4" />;
      case 'encroachment':
        return <AlertCircle className="h-4 w-4" />;
      case 'biodiversity':
        return <Activity className="h-4 w-4" />;
      case 'quality':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getFullReport = (report: LakeReport) => {
    // In a real application, this would fetch the full report details
    // For now, we'll generate some mock content based on the report type
    switch (report.type) {
      case 'inspection':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-lg">{report.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
            
            <div className="space-y-2">
              <h4 className="font-medium">Inspection Findings</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Lake perimeter surveyed and mapped accurately</li>
                <li>Water level measurements taken at multiple points</li>
                <li>Inflow and outflow channels assessed for blockages</li>
                <li>Physical infrastructure (fences, walkways, etc.) inspected</li>
                <li>Water samples collected for laboratory analysis</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Recommendations</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Repair damaged sections of perimeter fencing</li>
                <li>Clear debris from the southwestern outflow channel</li>
                <li>Increase monitoring frequency during monsoon season</li>
                <li>Conduct follow-up inspection in 3 months</li>
              </ul>
            </div>
          </div>
        );
      
      case 'encroachment':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-lg">{report.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
            
            <div className="space-y-2">
              <h4 className="font-medium">Encroachment Assessment</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Total of 12 encroachment hotspots identified</li>
                <li>Approximately 35% reduction in lake surface area</li>
                <li>Commercial construction observed in buffer zone</li>
                <li>Waste dumping detected at northeastern shore</li>
                <li>Illegal drainage outlets identified at 5 locations</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Action Plan</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Issue notices to identified encroachers</li>
                <li>Coordinate with municipal authorities for enforcement</li>
                <li>Install additional boundary markers</li>
                <li>Implement regular patrolling schedule</li>
                <li>Organize community awareness programs</li>
              </ul>
            </div>
          </div>
        );
      
      case 'biodiversity':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-lg">{report.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
            
            <div className="space-y-2">
              <h4 className="font-medium">Survey Results</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>22 bird species observed (down from 35 in previous survey)</li>
                <li>5 fish species identified in sampling</li>
                <li>Aquatic vegetation covers approximately 15% of lake surface</li>
                <li>Invasive species (water hyacinth) present in isolated patches</li>
                <li>Microbial diversity assessed through water sampling</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Conservation Recommendations</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Create designated bird sanctuary zones</li>
                <li>Remove invasive plant species</li>
                <li>Introduce native aquatic plants</li>
                <li>Establish continuous monitoring program</li>
                <li>Develop educational signage about local biodiversity</li>
              </ul>
            </div>
          </div>
        );
      
      case 'quality':
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-lg">{report.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
            
            <div className="space-y-2">
              <h4 className="font-medium">Water Quality Parameters</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>pH: 8.5 (above recommended range)</li>
                <li>Dissolved Oxygen: 2.1 mg/L (critically low)</li>
                <li>BOD: 30.5 mg/L (high)</li>
                <li>Turbidity: 15 NTU (moderate)</li>
                <li>Total Phosphates: 2.5 mg/L (elevated)</li>
                <li>Fecal Coliform: Present (indicates sewage contamination)</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Remediation Strategies</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Install additional sewage treatment capacity</li>
                <li>Deploy floating aerators to increase oxygen levels</li>
                <li>Implement bioremediation using microbial cultures</li>
                <li>Divert and treat stormwater runoff</li>
                <li>Establish regular water quality monitoring program</li>
              </ul>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-lg">{report.title}</h3>
            <p>{report.description}</p>
            <p className="text-sm text-gray-500">Full report details not available.</p>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5 text-karnataka-metro-medium" />
          <span>{lakeName} Reports</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="list">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Report List</TabsTrigger>
            <TabsTrigger value="details" disabled={!activeReport}>Report Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-4 mt-4">
            {reports.length > 0 ? (
              <div className="space-y-3">
                {reports.map((report, index) => (
                  <div 
                    key={index} 
                    className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() => setActiveReport(report)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm">{report.title}</h3>
                      <Badge className={getReportTypeColor(report.type)}>
                        <span className="flex items-center">
                          {getReportIcon(report.type)}
                          <span className="ml-1">{report.type.charAt(0).toUpperCase() + report.type.slice(1)}</span>
                        </span>
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{report.description}</p>
                    <p className="text-xs text-gray-500">Date: {report.date}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500">No reports available for {lakeName}</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="details" className="mt-4">
            {activeReport ? (
              <div className="space-y-4">
                {getFullReport(activeReport)}
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Report date: {activeReport.date}
                  </p>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Download className="mr-1 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Select a report to view details</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LakeReportDetails;
