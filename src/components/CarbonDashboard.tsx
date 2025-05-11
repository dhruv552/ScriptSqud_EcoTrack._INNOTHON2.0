import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  RefreshCw,
  TrendingDown,
  Calendar,
  Info,
  MessageSquare,
  Car,
  Utensils,
  Lightbulb,
  Activity,
} from "lucide-react";
import { getFormData } from "@/lib/utils";
import { useDataResetDetection } from "@/hooks/useDataResetDetection";

interface EmissionData {
  day: string;
  value: number;
}

interface CarbonDashboardProps {
  weeklyData?: EmissionData[];
  monthlyData?: EmissionData[];
  dailyTotal?: number;
  weeklyTotal?: number;
  monthlyTotal?: number;
  averageComparison?: number;
  improvementRate?: number;
  transportationData?: any;
  foodData?: any;
  energyData?: any;
}

// Default empty data to use when resetting
const emptyWeeklyData = [
  { day: "Mon", value: 0 },
  { day: "Tue", value: 0 },
  { day: "Wed", value: 0 },
  { day: "Thu", value: 0 },
  { day: "Fri", value: 0 },
  { day: "Sat", value: 0 },
  { day: "Sun", value: 0 },
];

const CarbonDashboard = ({
  weeklyData = [
    { day: "Mon", value: 0 },
    { day: "Tue", value: 0 },
    { day: "Wed", value: 0 },
    { day: "Thu", value: 0 },
    { day: "Fri", value: 0 },
    { day: "Sat", value: 0 },
    { day: "Sun", value: 0 },
  ],
  monthlyData = [
    { day: "Week 1", value: 0 },
    { day: "Week 2", value: 0 },
    { day: "Week 3", value: 0 },
    { day: "Week 4", value: 0 },
  ],
  dailyTotal = 0,
  weeklyTotal = 0,
  monthlyTotal = 0,
  averageComparison = 0,
  improvementRate = 0,
  transportationData,
  foodData,
  energyData,
}: CarbonDashboardProps) => {
  const [activeTab, setActiveTab] = useState("daily");
  const [localData, setLocalData] = useState<any>(null);
  
  // Check for data changes (including resets)
  useEffect(() => {
    const currentUser = sessionStorage.getItem("currentUser");
    if (currentUser) {
      const userDataKey = `${currentUser}_carbonData`;
      const dataJson = localStorage.getItem(userDataKey);
      
      // If there's data, parse and use it; otherwise keep using the defaults (all zeroes)
      if (dataJson) {
        const data = JSON.parse(dataJson);
        setLocalData(data);
      }
    }
  }, []);
  const [aiRecommendations, setAiRecommendations] = useState<string>("");
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Get user data from local storage
    const data = getFormData();
    setUserData(data);
  }, [transportationData, foodData, energyData]);

  // Check for reset using the hook
  const currentUser = sessionStorage.getItem("currentUser") || "default_user";
  const userDataKey = `${currentUser}_carbonData`;
  const isReset = useDataResetDetection(userDataKey);
  
  // React to data reset
  useEffect(() => {
    if (isReset) {
      setUserData(null);
      setAiRecommendations("");
    }
  }, [isReset]);

  // Use reset function from props or parent component instead of duplicating

    // Force reload the component
    window.location.reload();
  };

  const generateAiRecommendations = async () => {
    setIsLoadingAi(true);
    try {
      const API_KEY = "AIzaSyDZOjgGgojPSPdAj-is-xC-xWjEKgQCTVY"; // Updated API key
      const data = userData || {};

      const prompt =
        `Based on the following carbon footprint data, provide 3-5 personalized recommendations to reduce carbon emissions:\n\n` +
        `Transportation: ${JSON.stringify(data?.transportation || {})}\n` +
        `Food: ${JSON.stringify(data?.food || {})}\n` +
        `Energy: ${JSON.stringify(data?.energy || {})}\n\n` +
        `Format your response as bullet points with specific, actionable advice.`;

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" +
          API_KEY,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          }),
        },
      );

      const result = await response.json();
      if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
        setAiRecommendations(result.candidates[0].content.parts[0].text);
      } else if (result.promptFeedback?.blockReason) {
        setAiRecommendations(
          `Unable to generate recommendations: ${result.promptFeedback.blockReason}. Please try with different data.`,
        );
      } else {
        setAiRecommendations(
          "Unable to generate recommendations at this time. Please try again later.",
        );
      }
    } catch (error) {
      console.error("Error generating AI recommendations:", error);
      setAiRecommendations(
        "Error generating recommendations. Please try again later.",
      );
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Find the highest value for scaling the charts
  const weeklyMax = Math.max(...weeklyData.map((item) => item.value));
  const monthlyMax = Math.max(...monthlyData.map((item) => item.value));

  return (
    <div className="w-full h-full bg-background p-6 rounded-xl">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Carbon Footprint Dashboard
            </h2>
            <p className="text-muted-foreground">
              Track and analyze your environmental impact
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setActiveTab('daily')}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>View Calendar</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Daily Emissions</CardTitle>
                <CardDescription>Today's carbon footprint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-32 h-32 mb-4">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        className="text-muted stroke-current"
                        strokeWidth="10"
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                      />
                      <circle
                        className="text-primary stroke-current"
                        strokeWidth="10"
                        strokeLinecap="round"
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 * (1 - dailyTotal / 20)}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-3xl font-bold">{dailyTotal}</span>
                      <span className="text-xs text-muted-foreground">
                        kg CO₂e
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      className={
                        averageComparison < 100
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {averageComparison}% of avg
                    </span>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Weekly Emissions</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold mb-2">
                    {weeklyTotal}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      kg CO₂e
                    </span>
                  </div>
                  <Progress
                    value={improvementRate}
                    className="h-2 w-full mb-2"
                  />
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingDown className="h-4 w-4 text-green-500" />
                    <span className="text-green-500">
                      {improvementRate}% improvement
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Monthly Emissions</CardTitle>
                <CardDescription>This month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold mb-2">
                    {monthlyTotal}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      kg CO₂e
                    </span>
                  </div>
                  <div className="w-full flex items-center gap-2 mb-2">
                    <div className="h-2 bg-primary/20 rounded-full flex-1">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(monthlyTotal / 400) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      400 kg goal
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Activity className="h-4 w-4 text-amber-500" />
                    <span className="text-amber-500">66% to monthly goal</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Daily Carbon Footprint Data</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-card/50 border border-primary/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Car className="h-5 w-5 text-primary" />
                        <CardTitle className="text-md">
                          Transportation
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {userData?.transportation ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Vehicle Type:</span>
                            <span className="font-medium">
                              {userData.transportation.vehicleType}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Distance:</span>
                            <span className="font-medium">
                              {userData.transportation.distance} km
                            </span>
                          </div>
                          {userData.transportation.carbonEmissions && userData.transportation.carbonEmissions.carbon_kg !== undefined && (
                            <div className="flex justify-between text-green-500">
                              <span>Carbon Emissions:</span>
                              <span className="font-medium">
                                {userData.transportation.carbonEmissions.carbon_kg || "0"}{" "}
                                kg CO₂e
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No transportation data available
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 border border-primary/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-5 w-5 text-primary" />
                        <CardTitle className="text-md">Food</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {userData?.food ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Meat Consumption:</span>
                            <span className="font-medium">
                              {userData.food.meatConsumption}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cooking Method:</span>
                            <span className="font-medium">
                              {userData.food.cookingMethod}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Locally Sourced:</span>
                            <span className="font-medium">
                              {userData.food.locallySourced}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No food data available
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 border border-primary/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        <CardTitle className="text-md">Energy</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {userData?.energy ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Electricity Usage:</span>
                            <span className="font-medium">
                              {userData.energy.electricityUsage} kWh/day
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Heating Usage:</span>
                            <span className="font-medium">
                              {userData.energy.heatingUsage} hours/day
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Renewable %:</span>
                            <span className="font-medium">
                              {userData.energy.renewablePercentage}%
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No energy data available
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card className="bg-card h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <CardTitle>AI Recommendations</CardTitle>
                  </div>
                  <Button
                    size="sm"
                    onClick={generateAiRecommendations}
                    disabled={isLoadingAi || !userData}
                  >
                    {isLoadingAi ? "Loading..." : "Generate"}
                  </Button>
                </div>
                <CardDescription>
                  Personalized suggestions to reduce your carbon footprint
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-[350px] overflow-y-auto">
                {aiRecommendations ? (
                  <div className="whitespace-pre-line text-sm">
                    {aiRecommendations}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {isLoadingAi ? (
                      <p>Generating recommendations...</p>
                    ) : (
                      <p>
                        Click "Generate" to get personalized AI recommendations
                        based on your data
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonDashboard;
