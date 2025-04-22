
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
import { useToast } from "@/hooks/use-toast";

import React, { useEffect, useState } from "react";
import axios from "axios";

// Define an interface for the response data structure
interface BackendResponse {
  message: string;
}

const App = () => {
  const [message, setMessage] = useState("");
  const [connectionError, setConnectionError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    axios
      .get<BackendResponse>("http://localhost:8000/")
      .then((response) => {
        // Now TypeScript knows response.data has a message property
        setMessage(response.data.message || (response.data as any).toString());
        setConnectionError(false);
      })
      .catch((error) => {
        console.error("Backend connection error:", error);
        setConnectionError(true);
        toast({
          variant: "destructive",
          title: "Backend Connection Error",
          description: "Unable to connect to the backend server. Please ensure it is running."
        });
      });
  }, []);

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
                <Route path="/flood-prediction" element={<FloodPrediction />} />
                <Route path="/urban-planning" element={<UrbanPlanning />} />
                <Route path="/lake-monitoring" element={<LakeMonitoringEnhanced />} />
                <Route path="/report" element={<Report />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/about" element={<About />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              {message && !connectionError && (
                <div style={{ textAlign: "center", padding: "10px", background: "#f0f0f0" }}>
                  <strong>Backend says:</strong> {message}
                </div>
              )}
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
