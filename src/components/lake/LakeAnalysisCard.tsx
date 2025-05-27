
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Check, Info, Brain, BarChart3, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIAnalysisService, AnalysisResponse } from '@/services/AIAnalysisService';

interface LakeAnalysisCardProps {
  lakeId: string;
  lakeName: string;
  coordinates: [number, number];
}

const LakeAnalysisCard = ({ lakeId, lakeName, coordinates }: LakeAnalysisCardProps) => {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const lakeAnalysis = await AIAnalysisService.analyzeLakeHealth(
          lakeId, 
          lakeName,
          coordinates
        );
        
        setAnalysis(lakeAnalysis);
      } catch (err) {
        console.error('Failed to analyze lake health:', err);
        setError('Could not generate lake analysis. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalysis();
  }, [lakeId, lakeName, coordinates]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  
  const getIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'High':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'Moderate':
        return <Info className="h-5 w-5 text-yellow-500" />;
      case 'Low':
        return <Check className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="mr-2 h-5 w-5 text-karnataka-metro-medium" />
            <span>AI Lake Analysis</span>
          </div>
          {analysis && (
            <Badge variant="outline" className={getRiskColor(analysis.riskLevel)}>
              {analysis.riskLevel} Risk
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-karnataka-lake-medium mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Analyzing lake health data...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="h-48 flex items-center justify-center">
            <div className="text-center text-red-500">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>{error}</p>
            </div>
          </div>
        ) : analysis ? (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-start">
                {getIcon(analysis.riskLevel)}
                <p className="ml-2 text-gray-700 dark:text-gray-300">{analysis.summary}</p>
              </div>
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <BarChart3 className="h-3 w-3 mr-1" />
                <span>Confidence score: {Math.round(analysis.confidenceScore * 100)}%</span>
              </div>
            </div>
            
            <Tabs defaultValue="insights">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="insights">Key Insights</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
              <TabsContent value="insights" className="mt-4 space-y-2">
                {analysis.insights.map((insight, index) => (
                  <div key={index} className="flex items-start p-2 border-b last:border-b-0">
                    <Info className="h-4 w-4 text-karnataka-lake-medium mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="recommendations" className="mt-4 space-y-2">
                {analysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start p-2 border-b last:border-b-0">
                    <Check className="h-4 w-4 text-karnataka-park-medium mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default LakeAnalysisCard;
