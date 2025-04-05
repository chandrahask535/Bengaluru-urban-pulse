
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Camera, MapPin, Upload, Droplet, Building, AlertTriangle } from "lucide-react";

const Report = () => {
  const { toast } = useToast();
  const [issueType, setIssueType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      toast({
        title: "Report Submitted",
        description: "Thank you for your report. Officials will review it shortly.",
      });
    }, 1500);
  };

  const issueTypes = [
    { id: "flooding", name: "Flooding", icon: Droplet },
    { id: "lake_encroachment", name: "Lake Encroachment", icon: Building },
    { id: "water_pollution", name: "Water Pollution", icon: Droplet },
    { id: "illegal_construction", name: "Illegal Construction", icon: Building },
    { id: "drainage_issues", name: "Drainage Issues", icon: Droplet },
    { id: "other", name: "Other Issue", icon: AlertTriangle },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16 pb-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Report an Urban Issue
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              Help us identify and address urban challenges in Karnataka
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Submit a Report</CardTitle>
                  <CardDescription>
                    Please provide details about the issue you've observed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="issue-type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Issue Type
                      </label>
                      <Select value={issueType} onValueChange={setIssueType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select issue type" />
                        </SelectTrigger>
                        <SelectContent>
                          {issueTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              <div className="flex items-center">
                                <type.icon className="h-4 w-4 mr-2" />
                                {type.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="location" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Location
                      </label>
                      <div className="flex space-x-2">
                        <Input id="location" placeholder="Enter the location" className="flex-grow" />
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex items-center space-x-1"
                          onClick={() => {
                            toast({
                              title: "Using Current Location",
                              description: "Your current location will be used for this report.",
                            });
                          }}
                        >
                          <MapPin className="h-4 w-4" />
                          <span>Use My Location</span>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Description
                      </label>
                      <Textarea 
                        id="description" 
                        placeholder="Please describe the issue in detail..." 
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Photos/Evidence
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Drag and drop files here, or click to select files
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          (Max 5 images, 10MB each)
                        </p>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="mt-4"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Files
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="contact" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Contact Information (Optional)
                      </label>
                      <Input id="contact" placeholder="Email or phone number" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        We may need to contact you for more details
                      </p>
                    </div>

                    <div className="pt-4">
                      <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit Report"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Reporting Guidelines</CardTitle>
                  <CardDescription>
                    How to submit an effective report
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Be Specific
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Provide exact location details and clear description of the issue.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Include Evidence
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Photos help officials understand and address the issue faster.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Stay Safe
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Don't put yourself at risk when documenting issues.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Follow Up
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Check back on the dashboard for updates on reported issues.
                    </p>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      What happens next?
                    </h3>
                    <ol className="list-decimal list-inside text-sm text-gray-500 dark:text-gray-400 space-y-1">
                      <li>Your report is reviewed by our team</li>
                      <li>Verified reports are forwarded to relevant authorities</li>
                      <li>Issue is categorized and prioritized</li>
                      <li>Action is taken to address the issue</li>
                      <li>You can track status on the public dashboard</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Report;
