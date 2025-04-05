
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Camera, MapPin, Upload, Droplet, Building, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const issueFormSchema = z.object({
  issueType: z.string().min(1, "Please select an issue type"),
  location: z.string().min(3, "Please provide a location"),
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  contactInfo: z.string().optional(),
});

type IssueFormValues = z.infer<typeof issueFormSchema>;

const Report = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const form = useForm<IssueFormValues>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: {
      issueType: "",
      location: "",
      title: "",
      description: "",
      contactInfo: "",
    },
  });

  useEffect(() => {
    // Redirect to auth page if not logged in and finished loading
    if (!isLoading && !user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to report an issue",
      });
      navigate("/auth");
    }
  }, [user, isLoading, navigate, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 5) {
      toast({
        variant: "destructive",
        title: "Too many files",
        description: "Maximum 5 images allowed",
      });
      return;
    }
    
    // Check file sizes
    const validFiles = selectedFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
        });
        return false;
      }
      return true;
    });
    
    setFiles(validFiles);
    
    // Create preview URLs
    const urls = validFiles.map(file => URL.createObjectURL(file));
    setFileUrls(urls);
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (files.length === 0) return [];
    
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('issue_images')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('issue_images')
        .getPublicUrl(filePath);
        
      return publicUrl;
    });
    
    return Promise.all(uploadPromises);
  };

  const onSubmit = async (values: IssueFormValues) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to report an issue",
      });
      navigate("/auth");
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Upload images first
      const imageUrls = await uploadFiles();
      
      // Save issue to database
      const { error } = await supabase.from('issues').insert({
        user_id: user.id,
        issue_type: values.issueType,
        title: values.title,
        description: values.description,
        location: values.location,
        images: imageUrls,
        contact_info: values.contactInfo || null,
      });
      
      if (error) throw error;
      
      // Success
      toast({
        title: "Report Submitted",
        description: "Thank you for your report. Officials will review it shortly.",
      });
      
      // Reset form
      form.reset();
      setFiles([]);
      setFileUrls([]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error submitting report",
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const issueTypes = [
    { id: "flooding", name: "Flooding", icon: Droplet },
    { id: "lake_encroachment", name: "Lake Encroachment", icon: Building },
    { id: "water_pollution", name: "Water Pollution", icon: Droplet },
    { id: "illegal_construction", name: "Illegal Construction", icon: Building },
    { id: "drainage_issues", name: "Drainage Issues", icon: Droplet },
    { id: "other", name: "Other Issue", icon: AlertTriangle },
  ];

  // Show loading or redirect if not logged in
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-16 pb-12 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

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
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="issueType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Issue Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select issue type" />
                                </SelectTrigger>
                              </FormControl>
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
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Brief title of the issue" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <div className="flex space-x-2">
                              <FormControl>
                                <Input placeholder="Enter the location" {...field} />
                              </FormControl>
                              <Button 
                                type="button" 
                                variant="outline" 
                                className="flex items-center space-x-1"
                                onClick={() => {
                                  if (navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition(
                                      (position) => {
                                        const location = `${position.coords.latitude}, ${position.coords.longitude}`;
                                        form.setValue('location', location);
                                        toast({
                                          title: "Location updated",
                                          description: "Your current location will be used for this report.",
                                        });
                                      },
                                      (error) => {
                                        toast({
                                          variant: "destructive",
                                          title: "Error getting location",
                                          description: error.message,
                                        });
                                      }
                                    );
                                  } else {
                                    toast({
                                      variant: "destructive",
                                      title: "Geolocation not supported",
                                      description: "Your browser doesn't support geolocation.",
                                    });
                                  }
                                }}
                              >
                                <MapPin className="h-4 w-4" />
                                <span>Use My Location</span>
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Please describe the issue in detail..." 
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Photos/Evidence
                        </FormLabel>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                          />
                          {fileUrls.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                              {fileUrls.map((url, index) => (
                                <div key={index} className="relative aspect-square">
                                  <img
                                    src={url}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover rounded"
                                  />
                                  <button
                                    type="button"
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                    onClick={() => {
                                      const newFiles = [...files];
                                      newFiles.splice(index, 1);
                                      setFiles(newFiles);
                                      
                                      const newUrls = [...fileUrls];
                                      URL.revokeObjectURL(newUrls[index]);
                                      newUrls.splice(index, 1);
                                      setFileUrls(newUrls);
                                    }}
                                  >
                                    <AlertTriangle className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <>
                              <Camera className="h-8 w-8 text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Drag and drop files here, or click to select files
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                (Max 5 images, 10MB each)
                              </p>
                            </>
                          )}
                          <label htmlFor="file-upload">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              className="mt-4 cursor-pointer"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {fileUrls.length > 0 ? "Add More Photos" : "Upload Files"}
                            </Button>
                          </label>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="contactInfo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Information (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Email or phone number" {...field} />
                            </FormControl>
                            <FormDescription>
                              We may need to contact you for more details
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="pt-4">
                        <Button type="submit" className="w-full" disabled={submitting}>
                          {submitting ? "Submitting..." : "Submit Report"}
                        </Button>
                      </div>
                    </form>
                  </Form>
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
