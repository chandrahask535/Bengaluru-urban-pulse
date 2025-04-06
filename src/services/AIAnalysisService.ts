
// AI Analysis Service - Uses free AI models to generate insights

import { LakeDataService } from "./LakeDataService";

// Interface for analysis requests and responses
export interface AnalysisRequest {
  lakeId: string;
  lakeName: string;
  coordinates: [number, number];
  waterQuality?: any;
  encroachment?: any;
  historicalData?: any;
}

export interface AnalysisResponse {
  summary: string;
  insights: string[];
  recommendations: string[];
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  confidenceScore: number;
}

// Simple NLP processing function using rules-based approach
function processTextRules(input: string): string {
  // Replace specific keywords with more formal terminology
  const replacements: Record<string, string> = {
    'bad': 'concerning',
    'good': 'satisfactory',
    'excellent': 'optimal',
    'problem': 'issue',
    'big': 'significant',
    'small': 'minor',
    'ok': 'acceptable'
  };
  
  let processed = input;
  Object.entries(replacements).forEach(([key, value]) => {
    processed = processed.replace(new RegExp(`\\b${key}\\b`, 'gi'), value);
  });
  
  return processed;
}

// Simple keyword-based analysis function that doesn't require external API
function generateAnalysisFromKeywords(data: AnalysisRequest): AnalysisResponse {
  // Extract key metrics
  const waterQuality = data.waterQuality || { ph: 7, do: 5, bod: 10, turbidity: 5 };
  const encroachment = data.encroachment || { percentage: 15, hotspots: 2 };
  
  // Analyze water quality
  let waterHealthy = waterQuality.do >= 5 && waterQuality.ph >= 6.5 && waterQuality.ph <= 8.5 && waterQuality.bod < 10;
  
  // Analyze encroachment
  let encroachmentSevere = encroachment.percentage > 20 || encroachment.hotspots > 3;
  
  // Generate insights based on data
  const insights: string[] = [];
  const recommendations: string[] = [];
  
  // Water quality insights
  if (waterQuality.do < 4) {
    insights.push(`Dissolved oxygen levels (${waterQuality.do} mg/L) are critically low, indicating potential eutrophication.`);
    recommendations.push('Install aeration systems to increase oxygen levels in the water.');
  } else if (waterQuality.do < 5) {
    insights.push(`Dissolved oxygen levels (${waterQuality.do} mg/L) are below optimal ranges for aquatic life.`);
    recommendations.push('Monitor oxygen levels regularly and consider supplemental aeration during summer months.');
  }
  
  if (waterQuality.ph < 6.5) {
    insights.push(`The pH level (${waterQuality.ph}) is acidic, which may stress aquatic organisms.`);
    recommendations.push('Investigate potential sources of acidification in the watershed.');
  } else if (waterQuality.ph > 8.5) {
    insights.push(`The pH level (${waterQuality.ph}) is alkaline, potentially due to algal activity.`);
    recommendations.push('Monitor algal blooms and implement nutrient management strategies.');
  }
  
  if (waterQuality.bod > 15) {
    insights.push(`Biochemical Oxygen Demand (${waterQuality.bod} mg/L) is elevated, indicating high organic pollution.`);
    recommendations.push('Identify and address sources of organic waste entering the lake.');
  } else if (waterQuality.bod > 10) {
    insights.push(`Biochemical Oxygen Demand (${waterQuality.bod} mg/L) is moderately elevated.`);
    recommendations.push('Implement buffer zones to filter runoff before it enters the lake.');
  }
  
  if (waterQuality.turbidity > 10) {
    insights.push(`High turbidity (${waterQuality.turbidity} NTU) is reducing light penetration and affecting aquatic plants.`);
    recommendations.push('Control erosion in the watershed to reduce sediment input.');
  }
  
  // Encroachment insights
  if (encroachment.percentage > 30) {
    insights.push(`Critical encroachment (${encroachment.percentage}% of lake area) severely threatens the lake ecosystem.`);
    recommendations.push('Immediate enforcement of lake boundary restrictions and removal of illegal structures.');
  } else if (encroachment.percentage > 20) {
    insights.push(`Significant encroachment (${encroachment.percentage}% of lake area) is compromising the lake boundary.`);
    recommendations.push('Survey and clearly mark the legal lake boundary to prevent further encroachment.');
  } else if (encroachment.percentage > 10) {
    insights.push(`Moderate encroachment (${encroachment.percentage}% of lake area) is occurring around the lake.`);
    recommendations.push('Increase surveillance and community awareness about lake conservation.');
  }
  
  if (encroachment.hotspots > 3) {
    insights.push(`Multiple encroachment hotspots (${encroachment.hotspots}) identified around the lake perimeter.`);
    recommendations.push('Targeted enforcement at identified hotspots to prevent expansion of encroachment.');
  }
  
  // Add general recommendations if list is short
  if (recommendations.length < 3) {
    recommendations.push('Engage local communities in lake conservation efforts through awareness programs.');
    recommendations.push('Establish a regular water quality monitoring program with public reporting.');
    recommendations.push('Create vegetative buffer zones around the lake to filter pollutants and prevent erosion.');
  }
  
  // Determine overall risk level based on combined factors
  let riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  if ((!waterHealthy && encroachmentSevere) || encroachment.percentage > 30 || waterQuality.do < 3) {
    riskLevel = 'Critical';
  } else if (!waterHealthy || encroachmentSevere) {
    riskLevel = 'High';
  } else if (waterQuality.do < 6 || encroachment.percentage > 10) {
    riskLevel = 'Moderate';
  } else {
    riskLevel = 'Low';
  }
  
  // Generate summary
  const summary = `${data.lakeName} currently faces ${riskLevel.toLowerCase()} risk conditions. ${
    waterHealthy ? 'Water quality parameters are within acceptable ranges' : 'Water quality concerns have been identified'
  }${encroachmentSevere ? ', and significant encroachment issues threaten the lake ecosystem' : 
    encroachment.percentage > 10 ? ', and moderate encroachment issues are present' : 
    ', with minimal encroachment detected'}. Intervention measures ${
    riskLevel === 'Critical' || riskLevel === 'High' ? 'are urgently needed' : 'should be considered'
  } to ensure the long-term health and sustainability of this water body.`;
  
  return {
    summary: processTextRules(summary),
    insights,
    recommendations,
    riskLevel,
    confidenceScore: 0.75 // Fixed confidence since this is rule-based
  };
}

// Main service methods
export class AIAnalysisService {
  // Generate lake health analysis using local rule-based system
  static async analyzeLakeHealth(lakeId: string, lakeName: string, coordinates: [number, number]): Promise<AnalysisResponse> {
    try {
      // Fetch real data about the lake
      const [waterQualityRes, encroachmentRes, historicalDataRes] = await Promise.all([
        LakeDataService.getWaterQuality(lakeId),
        LakeDataService.getEncroachmentData(lakeId),
        LakeDataService.getHistoricalData(lakeId)
      ]);
      
      // Create analysis request with real data
      const request: AnalysisRequest = {
        lakeId,
        lakeName,
        coordinates,
        waterQuality: waterQualityRes.data,
        encroachment: encroachmentRes.data,
        historicalData: historicalDataRes.data
      };
      
      // Generate analysis
      return generateAnalysisFromKeywords(request);
    } catch (error) {
      console.error('Error generating lake health analysis:', error);
      
      // Fallback to basic analysis with minimal data
      return generateAnalysisFromKeywords({
        lakeId,
        lakeName,
        coordinates
      });
    }
  }
  
  // This can be extended in the future to connect to external AI APIs
  // when API keys are provided
}

export default AIAnalysisService;
