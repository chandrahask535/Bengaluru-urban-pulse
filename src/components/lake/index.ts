
// Export all lake components for easier imports
export { default as LakeAnalysisCard } from './LakeAnalysisCard';
export { default as LakeHistoricalData } from './LakeHistoricalData';
export { default as LakeReportDetails } from './LakeReportDetails';
export { default as LandCoverStats } from './LandCoverStats';
export { default as LakeWaterQualityCard } from './LakeWaterQualityCard';
export { default as LakeWaterLevelCard } from './LakeWaterLevelCard';
export { default as LakeEncroachmentCard } from './LakeEncroachmentCard';
export { default as UrbanSprawlAnalysis } from './UrbanSprawlAnalysis';
// Export the components from satellite module to make them accessible via lake module
export { WaterQualityMonitor, AdvancedSatelliteViewer } from '../maps/satellite';
