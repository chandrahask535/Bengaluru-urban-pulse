
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "../src/styles/cyberpunk-theme.css";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import FloodPrediction from "./pages/FloodPrediction";
import UrbanPlanning from "./pages/UrbanPlanning";
import LakeMonitoringEnhanced from "./pages/LakeMonitoringEnhanced";
import Report from "./pages/Report";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Alerts from "./pages/Alerts";
import About from "./pages/About";
import React from "react";

const App = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/prediction" element={<FloodPrediction />} />
                <Route path="/flood-prediction" element={<FloodPrediction />} />
                <Route path="/urban-planning" element={<UrbanPlanning />} />
                <Route path="/lakes" element={<LakeMonitoringEnhanced />} />
                <Route path="/lake-monitoring" element={<LakeMonitoringEnhanced />} />
                <Route path="/report" element={<Report />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/about" element={<About />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
