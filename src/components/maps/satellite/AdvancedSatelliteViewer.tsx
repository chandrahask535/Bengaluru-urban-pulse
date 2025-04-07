
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Eye, Calendar, RefreshCw, ZoomIn, ZoomOut, Download, Layers } from 'lucide-react';
import MapComponent from '@/components/maps/MapComponent';
import SatelliteImage from './SatelliteImage';
import ChangeAnalysisCard from './ChangeAnalysisCard';
import { useSatelliteImagery } from './SatelliteImageryFetcher';

interface AdvancedSatelliteViewerProps {
  lakeName: string;
  coordinates: [number, number];
  years?: string[];
  onAnalysisComplete?: (data: any) => void;
}

const AdvancedSatelliteViewer = ({ 
  lakeName, 
  coordinates, 
  years = ['2005', '2010', '2015', '2020', '2025'],
  onAnalysisComplete
}: AdvancedSatelliteViewerProps) => {
  const [selectedYears, setSelectedYears] = useState<[string, string]>(['2010', '2025']);
  const [zoom, setZoom] = useState(1);
  const [activeView, setActiveView] = useState('splitView');
  
  const {
    historicalImage,
    currentImage,
    changes,
    loading,
    error,
    handleRetry
  } = useSatelliteImagery(coordinates, selectedYears[0], selectedYears[1]);
  
  useEffect(() => {
    if (changes && onAnalysisComplete) {
      onAnalysisComplete(changes);
    }
  }, [changes, onAnalysisComplete]);
  
  const handleYearChange = (position: 0 | 1, year: string) => {
    const newYears = [...selectedYears] as [string, string];
    newYears[position] = year;
    setSelectedYears(newYears);
  };
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };
  
  return (
    <Card className="p-4 border-t-4 border-t-karnataka-lake-medium">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Eye className="h-5 w-5 mr-2 text-karnataka-lake-medium" />
            Advanced Satellite Imagery: {lakeName}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 3}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 0.5}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            {error && (
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <Tabs defaultValue="splitView" value={activeView} onValueChange={setActiveView} className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="splitView">Split View</TabsTrigger>
              <TabsTrigger value="timelapseView">Timeline</TabsTrigger>
              <TabsTrigger value="analysisView">Analysis</TabsTrigger>
            </TabsList>
            
            <div className="flex space-x-2">
              <select 
                className="text-xs border rounded p-1 bg-background"
                value={selectedYears[0]}
                onChange={(e) => handleYearChange(0, e.target.value)}
              >
                {years.map(year => (
                  <option key={`from-${year}`} value={year}>{year}</option>
                ))}
              </select>
              <span className="text-xs self-center">vs</span>
              <select 
                className="text-xs border rounded p-1 bg-background"
                value={selectedYears[1]}
                onChange={(e) => handleYearChange(1, e.target.value)}
              >
                {years.map(year => (
                  <option key={`to-${year}`} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          
          <TabsContent value="splitView" className="mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="text-sm font-medium text-gray-500">{selectedYears[0]}</span>
                </div>
                <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }} className="transition-transform duration-200">
                  <SatelliteImage
                    imageUrl={historicalImage}
                    altText={`${selectedYears[0]} satellite image of ${lakeName}`}
                    loading={loading}
                    error={error}
                    coordinates={coordinates}
                    onImageError={() => {}}
                    showFallbackMap={!historicalImage}
                    onRetry={handleRetry}
                    year={selectedYears[0]}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="text-sm font-medium text-gray-500">{selectedYears[1]}</span>
                </div>
                <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }} className="transition-transform duration-200">
                  <SatelliteImage
                    imageUrl={currentImage}
                    altText={`${selectedYears[1]} satellite image of ${lakeName}`}
                    loading={loading}
                    error={error}
                    coordinates={coordinates}
                    onImageError={() => {}}
                    showFallbackMap={!currentImage}
                    onRetry={handleRetry}
                    year={selectedYears[1]}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="timelapseView" className="mt-2">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Lake Evolution Over Time</h3>
                <Button variant="outline" size="sm">
                  <Layers className="h-4 w-4 mr-2" />
                  <span>Toggle Layers</span>
                </Button>
              </div>
              <div className="h-60 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Timeline view will be available soon.</p>
              </div>
              <div className="flex justify-center mt-4">
                <div className="flex items-center space-x-2">
                  {years.map(year => (
                    <Button 
                      key={year} 
                      variant={selectedYears.includes(year) ? "default" : "outline"} 
                      size="sm" 
                      className="text-xs"
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analysisView" className="mt-2">
            {changes ? (
              <ChangeAnalysisCard
                changes={changes}
                lakeName={lakeName}
                historicalYear={selectedYears[0]}
                currentYear={selectedYears[1]}
                loading={loading}
              />
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex items-center justify-center h-60">
                <p className="text-gray-500 dark:text-gray-400">
                  {loading ? "Analyzing satellite imagery..." : "No analysis data available."}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
          <div>
            Images source: Satellite Data Repository
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            <Download className="h-3 w-3 mr-1" />
            Export Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedSatelliteViewer;
