import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, BarChart2, Calendar, Settings } from "lucide-react";
import CarbonDashboardFixed from "./CarbonDashboardFixed";
import CarbonInputForm from "./CarbonInputForm";
import CalendarView from "./CalendarView";
import ResetConfirmationDialog from "./ResetConfirmationDialog";
import SustainARideButton from "./SustainARideButton";
import { getFormData, resetAllData } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const Home = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [username, setUsername] = useState("");
  const [formData, setFormData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = sessionStorage.getItem("currentUser");
    if (currentUser) {
      setUsername(currentUser);
      // Get form data from local storage
      const data = getFormData();
      setFormData(data);
    }
  }, []);

  // Function to handle form submission and update dashboard data
  const handleFormSubmit = (data: any) => {
    setFormData(data);
  };

  // Function to handle data reset
  const handleResetData = () => {
    // Reset data using the utility function
    resetAllData();

    // Clear form data state
    setFormData(null);

    // Show a toast notification instead of an alert
    toast({
      title: "Data Reset",
      description: "All carbon tracking data has been reset successfully.",
      variant: "default",
      duration: 3000,
      className: "bg-green-600 text-white border-green-700",
    });

    // Fetch empty initial data to avoid blank dashboard
    const emptyData = getFormData();
    setFormData(emptyData);

    // Wait for the state update before reloading the page
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Toast component */}
      <Toaster />

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-500" />
            <h1 className="text-xl font-bold">Carbon Footprint Calculator</h1>
            {username && (
              <span className="ml-4 text-sm text-green-500">
                Welcome, {username}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <SustainARideButton
              onClick={() => {
                toast({
                  title: "SustainARide",
                  description: "Sustainable ride-sharing feature coming soon!",
                  variant: "default",
                  duration: 3000,
                  className: "bg-blue-600 text-white border-blue-700",
                });
              }}
            />
            <ResetConfirmationDialog onConfirm={handleResetData} />
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-green-600 text-green-500 hover:bg-green-900/20"
              onClick={() => {
                sessionStorage.removeItem("currentUser");
                window.location.href = "/login";
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="border-gray-800 bg-gray-900">
          <CardContent className="p-0">
            <Tabs
              defaultValue="dashboard"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="border-b border-gray-800 px-6 py-2">
                <TabsList className="bg-gray-800">
                  <TabsTrigger
                    value="dashboard"
                    className="data-[state=active]:bg-green-900/30 data-[state=active]:text-green-500"
                  >
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger
                    value="input"
                    className="data-[state=active]:bg-green-900/30 data-[state=active]:text-green-500"
                  >
                    <Leaf className="mr-2 h-4 w-4" />
                    Input Form
                  </TabsTrigger>
                  <TabsTrigger
                    value="calendar"
                    className="data-[state=active]:bg-green-900/30 data-[state=active]:text-green-500"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Calendar
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="dashboard" className="mt-0">
                  <div className="space-y-4">
                    <CarbonDashboardFixed
                      transportationData={formData?.transportation}
                      foodData={formData?.food}
                      energyData={formData?.energy}
                      onViewCalendar={() => setActiveTab("calendar")}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="input" className="mt-0">
                  <div className="space-y-4">
                    <CarbonInputForm onSubmit={handleFormSubmit} />
                  </div>
                </TabsContent>

                <TabsContent value="calendar" className="mt-0">
                  <div className="space-y-4">
                    <CalendarView />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900 px-6 py-4 text-center text-sm text-gray-500">
        <div className="container mx-auto">
          <p>
            © {new Date().getFullYear()} Carbon Footprint Calculator. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
