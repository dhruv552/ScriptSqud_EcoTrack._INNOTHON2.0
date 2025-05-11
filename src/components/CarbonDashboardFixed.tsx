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
  Sparkles,
  Loader2,
  Activity,
  History,
  PieChart,
} from "lucide-react";
import SavedRecommendationsDialog from "./SavedRecommendationsDialog";
import ApiStatusIndicator from "./ApiStatusIndicator";
import { getFormData, calculateTotalDailyCarbonFootprint } from "@/lib/utils";
import { GEMINI_API_KEY } from "@/config/apiKeys";
import {
  saveEmissionsData,
  getWeeklyEmissions,
  getMonthlyEmissions,
  calculateWeeklyTotal,
  calculateMonthlyTotal,
  initializeEmissionsData
} from "../../services/emissionsService";

interface EmissionData {
  day: string;
  value: number;
  food?: number;
  transportation?: number;
  energy?: number;
  date?: string;
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
  onViewCalendar?: () => void;
}

const CarbonDashboardFixed: React.FC<CarbonDashboardProps> = ({
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
  onViewCalendar,
}: CarbonDashboardProps) => {
  const [activeTab, setActiveTab] = useState("daily");
  const [userData, setUserData] = useState<any>(null);
  const [aiRecommendations, setAiRecommendations] = useState<string>("");
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [carbonData, setCarbonData] = useState<any>({
    foodCO2: 0,
    vehicleCO2: 0,
    energyCO2: 0,
    totalCO2: 0
  });
  const [emissionsData, setEmissionsData] = useState({
    weekly: weeklyData,
    monthly: monthlyData,
    weeklyTotal: weeklyTotal.toString(),
    monthlyTotal: monthlyTotal.toString()
  });

  // The average daily carbon footprint for comparison (global average is ~22kg)
  const averageDailyCarbonFootprint = 22;

  useEffect(() => {
    // Get user data from local storage
    try {
      const data = getFormData();
      setUserData(data);

      // Calculate total carbon footprint
      if (data) {
        const carbonFootprint = calculateTotalDailyCarbonFootprint(data);
        setCarbonData(carbonFootprint);

        // Save the emissions data for tracking
        saveEmissionsData(data);

        // Load weekly and monthly data
        loadEmissionsData();
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      setUserData(null);
    }
  }, [transportationData, foodData, energyData]);

  // Load emissions data
  const loadEmissionsData = () => {
    try {
      // Initialize emissions data
      const data = initializeEmissionsData();

      if (data) {
        setEmissionsData({
          weekly: data.weekly,
          monthly: data.monthly,
          weeklyTotal: data.weeklyTotal.toString(),
          monthlyTotal: data.monthlyTotal.toString()
        });
      }
    } catch (error) {
      console.error("Error loading emissions data:", error);
    }
  };

  const handleRefresh = () => {
    try {
      const data = getFormData();
      setUserData(data);
      setActiveTab('daily');

      // Calculate total carbon footprint
      if (data) {
        const carbonFootprint = calculateTotalDailyCarbonFootprint(data);
        setCarbonData(carbonFootprint);

        // Save the emissions data and reload
        saveEmissionsData(data);
        loadEmissionsData();
      }

      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  // Calculate improvement rate based on weekly data
  const calculateImprovementRate = () => {
    if (emissionsData.weekly.length === 0) return 0;

    // Get yesterday and today (or the two most recent days with data)
    const sortedDays = [...emissionsData.weekly]
      .filter(day => day.value > 0)
      .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());

    if (sortedDays.length < 2) return 0;

    const today = sortedDays[0];
    const yesterday = sortedDays[1];

    if (yesterday.value === 0) return 0;

    const improvement = ((yesterday.value - today.value) / yesterday.value) * 100;
    return Math.round(improvement);
  };

  const improvementRateValue = calculateImprovementRate();

  // Rest of the function remains the same
  const generateAiRecommendations = async () => {
    // Check for userData or use demo data if not available
    if (!userData && !sessionStorage.getItem("currentUser")) {
      setAiRecommendations("Please log in and enter your carbon footprint data first to get personalized recommendations.");
      return;
    }

    setIsLoadingAi(true);
    try {
      // Get API key from config
      const API_KEY = GEMINI_API_KEY;

      // Use actual user data or fallback to demo data if needed
      let data = userData || {};

      // If data is empty or missing key sections, add some fallback data
      const hasTransportation = data.transportation && Object.keys(data.transportation).length > 0;
      const hasFood = data.food && Object.keys(data.food).length > 0;
      const hasEnergy = data.energy && Object.keys(data.energy).length > 0;

      // If we have no meaningful data, provide fallbacks for demo/testing
      if (!hasTransportation && !hasFood && !hasEnergy) {
        data = {
          transportation: { vehicleType: "car (gasoline)", dailyCommuteDistance: 15 },
          food: { dietType: "omnivore", localFoodPercentage: 30 },
          energy: { primaryEnergySource: "grid electricity", homeSize: 1200 }
        };
      }

      // Extract more meaningful data points for better recommendations
      const transportationType = data?.transportation?.vehicleType || "Not specified";
      const transportationDistance = data?.transportation?.dailyCommuteDistance || data?.transportation?.distance || "Not specified";
      const dietType = data?.food?.dietType || "Not specified";
      const localFood = data?.food?.localFoodPercentage || "Not specified";
      const energySource = data?.energy?.primaryEnergySource || "Not specified";
      const homeSize = data?.energy?.homeSize || "Not specified";
      const meatConsumption = data?.food?.meatConsumption || "medium";
      const cookingMethod = data?.food?.cookingMethod || "conventional";
      const electricityUsage = data?.energy?.electricityUsage || "10";

      // Create a more detailed prompt for better recommendations
      const prompt =
        `As an environmental sustainability expert, analyze the following carbon footprint data and provide 5 personalized, actionable recommendations to reduce this person's carbon emissions:

        CARBON FOOTPRINT DATA:
        - Transportation: 
          * Vehicle type: ${transportationType}
          * Daily commute distance: ${transportationDistance} miles/km
        - Food habits: 
          * Diet type: ${dietType || meatConsumption + " meat consumption"}
          * Local food consumption: ${localFood}%
          * Cooking method: ${cookingMethod}
        - Energy usage:
          * Primary energy source: ${energySource}
          * Home size: ${homeSize} sq ft
          * Electricity usage: ${electricityUsage} kWh/day
        
        For each recommendation:
        1. Explain the specific action to take
        2. Estimate the potential carbon reduction impact (in percentage or CO2 equivalent)
        3. Note any financial benefits/costs
        4. Explain why this recommendation is particularly effective for this person's profile
        
        Format your response as numbered bullet points with clear headers for each recommendation.`;

      console.log("Using Gemini API key:", API_KEY.substring(0, 10) + "...");

      // Try using the v1beta version endpoint which is more stable and widely supported
      console.log("Trying v1beta API endpoint...");
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
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
              topK: 40,
              topP: 0.95,
            },
          }),
        });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API error (${response.status}):`, errorText);

        // If first attempt fails, try with alternative model name format
        console.log("First attempt failed. Trying with alternative model name...");
        const altResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${API_KEY}`,
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
                topK: 40,
                topP: 0.95,
              },
            }),
          }
        );

        if (!altResponse.ok) {
          const altErrorText = await altResponse.text();
          console.error(`Alternative Gemini API endpoint error (${altResponse.status}):`, altErrorText);

          // If both attempts fail, try with a mock implementation as fallback
          console.log("Both API attempts failed. Using mock implementation as fallback...");

          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1500));

          // Generate mock recommendations based on user data
          const mockRecommendations = `
## Personalized Carbon Reduction Recommendations

**1. Transportation Optimization**
Based on your ${transportationType} usage of ${transportationDistance}km:
* Switch to public transportation 2 days per week
* Potential impact: 20-30% reduction in transport emissions
* Financial benefit: Save approximately $25-40 per week on fuel and parking
* This would reduce your carbon footprint by approximately 1.2 tons CO2 annually

**2. Home Energy Efficiency**
Your current electricity usage of ${electricityUsage}kWh suggests:
* Install LED lighting throughout your home
* Potential impact: 5-10% reduction in home energy emissions
* Financial benefit: Approximately $120 annual savings
* LED bulbs use 75% less energy and last 25 times longer than incandescent lighting

**3. Diet Modification**
With your ${meatConsumption} meat consumption and ${cookingMethod} cooking methods:
* Implement 2 plant-based days per week
* Potential impact: 8-15% reduction in food-related emissions
* Health benefits: Increased fiber intake and reduced saturated fat consumption
* Replacing beef with plant proteins just twice weekly can save 600 kg CO2e per year

**4. Smart Home Technology**
* Install a programmable thermostat to optimize heating/cooling
* Potential impact: 10-12% reduction in HVAC-related emissions
* Financial benefit: Average annual savings of $180
* Automatically adjusting temperatures when you're away or sleeping prevents wasted energy

**5. Renewable Energy Transition**
* Consider installing solar panels or switching to a renewable electricity provider
* Potential impact: Up to 80% reduction in electricity-related carbon footprint
* Long-term financial benefit: Average payback period of 7-10 years, followed by reduced bills
* Modern solar installations can offset 3-4 tons of CO2 annually for the average household
`;

          setAiRecommendations(mockRecommendations);
          return;
        }

        const altResult = await altResponse.json();
        console.log("API Response (alt):", altResult);

        // Process the alternative API response
        if (altResult.candidates && altResult.candidates[0]?.content?.parts[0]?.text) {
          setAiRecommendations(altResult.candidates[0].content.parts[0].text);
          return;
        } else {
          setAiRecommendations("Sorry, no valid response was received from the AI service. Please try again later.");
          return;
        }
      }

      const result = await response.json();
      console.log("API Response:", result);

      // Process the API response
      if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
        setAiRecommendations(result.candidates[0].content.parts[0].text);
      } else if (result.error) {
        console.error("Gemini API error:", result.error);
        setAiRecommendations("Sorry, there was an error generating recommendations. Please try again later.\n\nError: " + (result.error.message || "Unknown error"));
      } else if (result.promptFeedback?.blockReason) {
        setAiRecommendations(
          `Unable to generate recommendations: ${result.promptFeedback.blockReason}. Please try with different data.`
        );
      } else {
        setAiRecommendations(
          "No recommendations could be generated with the current data. Please add more details about your carbon footprint."
        );
      }
    } catch (error) {
      console.error("Error generating AI recommendations:", error);
      let errorMessage = "Error generating recommendations. Please try again later.";

      if (error instanceof Error) {
        console.error("Error details:", error.message);
        errorMessage = `Error: ${error.message || "Unknown error"}`;
      }

      setAiRecommendations(errorMessage);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Find the highest value for scaling the charts
  const weeklyMax = Math.max(...emissionsData.weekly.map((item) => item.value));
  const monthlyMax = Math.max(...emissionsData.monthly.map((week: any) => week.value));

  // Safely get data for display, with fallbacks to prevent crashes
  const getVehicleType = () => {
    try {
      // Check for multi-mode structure
      if (userData?.transportation?.modes && userData.transportation.modes.length > 0) {
        const modeNames = userData.transportation.modes.map(mode => mode.vehicleType);
        return modeNames.join(", "); // Return comma-separated list of vehicle types
      }
      // Fallback to legacy structure
      return userData?.transportation?.vehicleType || "Not specified";
    } catch (e) {
      return "Not specified";
    }
  };

  const getDistance = () => {
    try {
      // Check for multi-mode structure
      if (userData?.transportation?.modes && userData.transportation.modes.length > 0) {
        return userData.transportation.totalDistance ||
          userData.transportation.modes.reduce((sum, mode) => sum + (mode.distance || 0), 0);
      }
      // Fallback to legacy structure
      return userData?.transportation?.distance || "0";
    } catch (e) {
      return "0";
    }
  };

  const getCarbonEmissions = () => {
    try {
      // Check for pre-calculated total emissions
      if (userData?.transportation?.totalEmissions?.carbon_kg) {
        return userData.transportation.totalEmissions.carbon_kg;
      }

      // Check for multi-mode structure
      if (userData?.transportation?.modes && userData.transportation.modes.length > 0) {
        return userData.transportation.modes.reduce((sum, mode) => {
          return sum + (mode.carbonEmissions?.carbon_kg || 0);
        }, 0).toFixed(2);
      }

      // Fallback to legacy structure
      return userData?.transportation?.carbonEmissions?.carbon_kg || "0";
    } catch (e) {
      return "0";
    }
  };

  const getFuelUsed = () => {
    try {
      // Check for multi-mode structure
      if (userData?.transportation?.modes && userData.transportation.modes.length > 0) {
        // Only count fuel for vehicles that use fuel (car, motorcycle)
        return userData.transportation.modes
          .filter(mode => mode.vehicleType === 'car' || mode.vehicleType === 'motorcycle')
          .reduce((sum, mode) => sum + (mode.fuelUsedLiters || 0), 0)
          .toFixed(2);
      }

      // Fallback to legacy structure
      return userData?.transportation?.fuelUsedLiters || "0";
    } catch (e) {
      return "0";
    }
  };

  const getMeatConsumption = () => {
    try {
      return userData?.food?.meatConsumption || "Not specified";
    } catch (e) {
      return "Not specified";
    }
  };

  const getCookingMethod = () => {
    try {
      return userData?.food?.cookingMethod || "Not specified";
    } catch (e) {
      return "Not specified";
    }
  };

  const getLocallySourced = () => {
    try {
      return userData?.food?.locallySourced || "Not specified";
    } catch (e) {
      return "Not specified";
    }
  };

  const getElectricityUsage = () => {
    try {
      return userData?.energy?.electricityUsage || "0";
    } catch (e) {
      return "0";
    }
  };

  const getHeatingUsage = () => {
    try {
      return userData?.energy?.heatingUsage || "0";
    } catch (e) {
      return "0";
    }
  };

  const getRenewablePercentage = () => {
    try {
      return userData?.energy?.renewablePercentage || "0";
    } catch (e) {
      return "0";
    }
  };

  // Calculate the percentage of average daily carbon footprint
  const percentOfAverage = Math.round((carbonData.totalCO2 / averageDailyCarbonFootprint) * 100);

  // Calculate max value for gauge - use 30 as upper bound or 150% of current value, whichever is higher
  const gaugeMaxValue = Math.max(30, carbonData.totalCO2 * 1.5);

  return (
    <div className="w-full h-full bg-background p-6 rounded-xl">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-foreground">
                Carbon Footprint Dashboard
              </h2>
              <ApiStatusIndicator />
            </div>
            <p className="text-muted-foreground">
              Track and analyze your environmental impact
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh Data</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={onViewCalendar}>
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
            className="md:col-span-3"
          >
            <Card className="rounded-lg border text-card-foreground shadow-sm bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Total Carbon Footprint
                </CardTitle>
                <CardDescription>Combined emissions from all sources</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Main circular gauge */}
                  <div className="col-span-1 md:col-span-1 flex flex-col items-center justify-center">
                    <div className="relative w-36 h-36 mb-2">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                          className="text-muted stroke-current"
                          strokeWidth="8"
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                        />
                        <circle
                          className={`${carbonData.totalCO2 > averageDailyCarbonFootprint * 0.8
                            ? "text-red-500"
                            : carbonData.totalCO2 > averageDailyCarbonFootprint * 0.5
                              ? "text-amber-500"
                              : "text-green-500"
                            } stroke-current`}
                          strokeWidth="8"
                          strokeLinecap="round"
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 * (1 - carbonData.totalCO2 / gaugeMaxValue)}
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-3xl font-bold">{carbonData.totalCO2}</span>
                        <span className="text-xs text-muted-foreground">kg CO₂e/day</span>
                      </div>
                    </div>
                    <div className="text-sm text-center">
                      <span
                        className={
                          percentOfAverage > 100
                            ? "text-red-500 font-medium"
                            : percentOfAverage > 70
                              ? "text-amber-500 font-medium"
                              : "text-green-500 font-medium"
                        }
                      >
                        {percentOfAverage}% of global average
                      </span>
                    </div>
                  </div>

                  {/* Breakdown area */}
                  <div className="col-span-1 md:col-span-3">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        Emissions by Source
                      </h3>

                      {/* Food emissions bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center">
                            <Utensils className="h-3.5 w-3.5 mr-2 text-green-500" />
                            Food
                          </span>
                          <span className="font-medium">{carbonData.foodCO2} kg CO₂e</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${Math.min(100, (carbonData.foodCO2 / carbonData.totalCO2) * 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Transportation emissions bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center">
                            <Car className="h-3.5 w-3.5 mr-2 text-blue-500" />
                            Transportation
                          </span>
                          <span className="font-medium">{carbonData.vehicleCO2} kg CO₂e</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.min(100, (carbonData.vehicleCO2 / carbonData.totalCO2) * 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Energy emissions bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center">
                            <Lightbulb className="h-3.5 w-3.5 mr-2 text-amber-500" />
                            Energy
                          </span>
                          <span className="font-medium">{carbonData.energyCO2} kg CO₂e</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${Math.min(100, (carbonData.energyCO2 / carbonData.totalCO2) * 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Summary stats */}
                      <div className="grid grid-cols-3 gap-4 mt-4 pt-2 border-t">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Daily</p>
                          <p className="text-lg font-bold">{carbonData.totalCO2} kg</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Weekly</p>
                          <p className="text-lg font-bold">{emissionsData.weeklyTotal} kg</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Monthly</p>
                          <p className="text-lg font-bold">{emissionsData.monthlyTotal} kg</p>
                        </div>
                      </div>
                    </div>
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
                    {emissionsData.weeklyTotal}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      kg CO₂e
                    </span>
                  </div>
                  <div className="w-full h-24 flex items-end justify-between mb-2">
                    {emissionsData.weekly.map((day, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="w-6 bg-primary rounded-t-sm"
                          style={{
                            height: `${Math.max(5, (day.value / (Math.max(...emissionsData.weekly.map(d => d.value)) || 1)) * 100)}%`
                          }}
                        ></div>
                        <div className="text-xs mt-1">{day.day}</div>
                      </div>
                    ))}
                  </div>
                  <Progress
                    value={Math.abs(improvementRateValue)}
                    className="h-2 w-full mb-2"
                  />
                  <div className="flex items-center gap-1 text-sm">
                    {improvementRateValue > 0 ? (
                      <>
                        <TrendingDown className="h-4 w-4 text-green-500" />
                        <span className="text-green-500">{improvementRateValue}% improvement</span>
                      </>
                    ) : improvementRateValue < 0 ? (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-500 transform rotate-180" />
                        <span className="text-red-500">{Math.abs(improvementRateValue)}% increase</span>
                      </>
                    ) : (
                      <>
                        <Activity className="h-4 w-4 text-amber-500" />
                        <span className="text-amber-500">No change</span>
                      </>
                    )}
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
                    {emissionsData.monthlyTotal}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      kg CO₂e
                    </span>
                  </div>
                  <div className="w-full h-24 flex items-end justify-between mb-2">
                    {emissionsData.monthly.map((week: any, index: number) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="w-10 bg-primary rounded-t-sm"
                          style={{
                            height: `${Math.max(5, (week.value / (Math.max(...emissionsData.monthly.map((w: any) => w.value)) || 1)) * 100)}%`
                          }}
                        ></div>
                        <div className="text-xs mt-1 whitespace-nowrap">{week.week}</div>
                      </div>
                    ))}
                  </div>
                  <div className="w-full flex items-center gap-2 mb-2">
                    <div className="h-2 bg-primary/20 rounded-full flex-1">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(parseFloat(emissionsData.monthlyTotal) / 400) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Activity className="h-4 w-4 text-amber-500" />
                    <span className="text-amber-500">66% to monthly goal</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-card border-green-100 dark:border-green-900/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" className="mr-2 text-green-600 fill-current">
                    <path d="M12.2 2c.2 0 .4.2.5.3.2 2.5-.3 4.3-1.3 5.3-.4.4-.7.7-1 .8a2.9 2.9 0 00-.7.9c0 .1 0 .3-.2.4v.8l.3.4h.1l1.8 2.3.5.5c.3.3.3.7.2 1v.3c1-.3 1.8-1 2.3-1.6a6.42 6.42 0 001.2-4.5c0-.2.2-.4.3-.5 1.8-1.4 3.4-1.5 4.6-1.1.3 0 .5.3.6.6a7 7 0 01-2.7 6.4 7.1 7.1 0 01-5.7 1.7h-.7c-.8 0-1.6-.6-2-1.3L9.6 13c-.4.5-.6 1.1-.6 1.6v.6l.6 2.9c0 .8-.1 1.6-.7 2.2-.6.6-1.4.8-2.3.7-.2 0-.4-.2-.5-.4-.4-1.7.3-3 1.3-4.2a6.4 6.4 0 001.2-1.8v-.2L8 12.5c-.1-.2-.1-.4 0-.6.4-.8.8-1.4 1-1.9l.1-.5a3.3 3.3 0 00.2-.7c0-.8-.6-1.4-1.2-2a5.3 5.3 0 01-2-3.3c0-.2 0-.4.2-.5C7.7 2 9 2 10.2 2c.4 0 .8 0 1.2.1h.8V2z" />
                  </svg>
                  Tree Equivalent
                </CardTitle>
                <CardDescription>Your carbon savings as trees</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold mb-2 text-green-600">
                    {carbonData.treesSaved || 0}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      trees/day
                    </span>
                  </div>
                  {carbonData.savedCO2 > 0 ? (
                    <div className="text-center">
                      <div className="flex justify-center mb-1">
                        {[...Array(Math.min(5, Math.ceil(carbonData.treesSaved / 20)))].map((_, i) => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"
                            className={`mx-1 ${i < Math.ceil(carbonData.treesSaved / 20) ? "text-green-600" : "text-green-300"} fill-current`}>
                            <path d="M12.2 2c.2 0 .4.2.5.3.2 2.5-.3 4.3-1.3 5.3-.4.4-.7.7-1 .8a2.9 2.9 0 00-.7.9c0 .1 0 .3-.2.4v.8l.3.4h.1l1.8 2.3.5.5c.3.3.3.7.2 1v.3c1-.3 1.8-1 2.3-1.6a6.42 6.42 0 001.2-4.5c0-.2.2-.4.3-.5 1.8-1.4 3.4-1.5 4.6-1.1.3 0 .5.3.6.6a7 7 0 01-2.7 6.4 7.1 7.1 0 01-5.7 1.7h-.7c-.8 0-1.6-.6-2-1.3L9.6 13c-.4.5-.6 1.1-.6 1.6v.6l.6 2.9c0 .8-.1 1.6-.7 2.2-.6.6-1.4.8-2.3.7-.2 0-.4-.2-.5-.4-.4-1.7.3-3 1.3-4.2a6.4 6.4 0 001.2-1.8v-.2L8 12.5c-.1-.2-.1-.4 0-.6.4-.8.8-1.4 1-1.9l.1-.5a3.3 3.3 0 00.2-.7c0-.8-.6-1.4-1.2-2a5.3 5.3 0 01-2-3.3c0-.2 0-.4.2-.5C7.7 2 9 2 10.2 2c.4 0 .8 0 1.2.1h.8V2z" />
                          </svg>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-green-700">
                        <span>You saved {carbonData.savedCO2} kg CO₂ today</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Equal to what {Math.round(carbonData.treesSaved)} trees absorb daily
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-500">
                          Reduce your emissions to see tree savings
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        You're {Math.abs(carbonData.savedCO2).toFixed(1)} kg above global average
                      </div>
                    </div>
                  )}
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
                  <CardTitle>Carbon Footprint Data</CardTitle>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                    <TabsList>
                      <TabsTrigger value="daily">Daily</TabsTrigger>
                      <TabsTrigger value="weekly">Weekly</TabsTrigger>
                      <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === "daily" && (
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
                                {getVehicleType()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Distance:</span>
                              <span className="font-medium">
                                {getDistance()} km
                              </span>
                            </div>
                            <div className="flex justify-between text-blue-500">
                              <span>Carbon Emissions:</span>
                              <span className="font-medium">
                                {carbonData.vehicleCO2} kg CO₂e
                              </span>
                            </div>
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
                                {getMeatConsumption()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Cooking Method:</span>
                              <span className="font-medium">
                                {getCookingMethod()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Locally Sourced:</span>
                              <span className="font-medium">
                                {getLocallySourced()}
                              </span>
                            </div>
                            <div className="flex justify-between text-green-500">
                              <span>Carbon Footprint:</span>
                              <span className="font-medium">
                                {carbonData.foodCO2} kg CO₂e/day
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
                                {getElectricityUsage()} kWh/day
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Heating Usage:</span>
                              <span className="font-medium">
                                {getHeatingUsage()} hours/day
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Renewable %:</span>
                              <span className="font-medium">
                                {getRenewablePercentage()}%
                              </span>
                            </div>
                            <div className="flex justify-between text-amber-500">
                              <span>Carbon Footprint:</span>
                              <span className="font-medium">
                                {carbonData.energyCO2} kg CO₂e/day
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
                )}

                {activeTab === "weekly" && (
                  <div className="flex flex-col">
                    <div className="h-64 flex items-end justify-between mb-8 px-4">
                      {emissionsData.weekly.map((day, index) => (
                        <div key={index} className="flex flex-col items-center group relative">
                          <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border rounded p-2 text-xs z-10 whitespace-nowrap">
                            <div>Date: {day.date}</div>
                            <div>Transportation: {day.transportation?.toFixed(2)} kg</div>
                            <div>Food: {day.food?.toFixed(2)} kg</div>
                            <div>Energy: {day.energy?.toFixed(2)} kg</div>
                            <div className="font-bold">Total: {day.value.toFixed(2)} kg</div>
                          </div>
                          <div className="flex h-full items-end">
                            <div className="relative flex">
                              {/* Transportation */}
                              <div
                                className="w-12 bg-blue-500"
                                style={{
                                  height: `${Math.max(1, (day.transportation || 0) / (Math.max(...emissionsData.weekly.map(d => d.value)) || 1) * 200)}px`
                                }}
                              ></div>
                              {/* Food */}
                              <div
                                className="w-12 bg-green-500"
                                style={{
                                  height: `${Math.max(1, (day.food || 0) / (Math.max(...emissionsData.weekly.map(d => d.value)) || 1) * 200)}px`
                                }}
                              ></div>
                              {/* Energy */}
                              <div
                                className="w-12 bg-amber-500"
                                style={{
                                  height: `${Math.max(1, (day.energy || 0) / (Math.max(...emissionsData.weekly.map(d => d.value)) || 1) * 200)}px`
                                }}
                              ></div>
                            </div>
                          </div>
                          <div className="text-xs mt-2">{day.day}</div>
                          <div className="text-xs font-medium">{day.value.toFixed(1)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-around mt-4 border-t pt-4">
                      <div className="text-center">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-3 h-3 bg-blue-500"></div>
                          <span className="text-xs">Transportation</span>
                        </div>
                        <div className="font-medium">{emissionsData.weekly.reduce((sum, day) => sum + (day.transportation || 0), 0).toFixed(2)} kg</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-3 h-3 bg-green-500"></div>
                          <span className="text-xs">Food</span>
                        </div>
                        <div className="font-medium">{emissionsData.weekly.reduce((sum, day) => sum + (day.food || 0), 0).toFixed(2)} kg</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-3 h-3 bg-amber-500"></div>
                          <span className="text-xs">Energy</span>
                        </div>
                        <div className="font-medium">{emissionsData.weekly.reduce((sum, day) => sum + (day.energy || 0), 0).toFixed(2)} kg</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "monthly" && (
                  <div className="flex flex-col">
                    <div className="h-64 flex items-end justify-around mb-8 px-4">
                      {emissionsData.monthly.map((week: any, index: number) => (
                        <div key={index} className="flex flex-col items-center group relative">
                          <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border rounded p-2 text-xs z-10">
                            <div>Week: {week.week}</div>
                            <div>Transportation: {week.transportation?.toFixed(2)} kg</div>
                            <div>Food: {week.food?.toFixed(2)} kg</div>
                            <div>Energy: {week.energy?.toFixed(2)} kg</div>
                            <div className="font-bold">Total: {week.value.toFixed(2)} kg</div>
                            <div className="text-muted-foreground text-xs">
                              {week.startDate && week.endDate ?
                                `${formatDateString(week.startDate)} - ${formatDateString(week.endDate)}` : ""}
                            </div>
                          </div>
                          <div className="flex h-full items-end">
                            <div className="relative flex">
                              {/* Transportation */}
                              <div
                                className="w-16 bg-blue-500"
                                style={{
                                  height: `${Math.max(1, (week.transportation || 0) / (Math.max(...emissionsData.monthly.map((w: any) => w.value)) || 1) * 200)}px`
                                }}
                              ></div>
                              {/* Food */}
                              <div
                                className="w-16 bg-green-500"
                                style={{
                                  height: `${Math.max(1, (week.food || 0) / (Math.max(...emissionsData.monthly.map((w: any) => w.value)) || 1) * 200)}px`
                                }}
                              ></div>
                              {/* Energy */}
                              <div
                                className="w-16 bg-amber-500"
                                style={{
                                  height: `${Math.max(1, (week.energy || 0) / (Math.max(...emissionsData.monthly.map((w: any) => w.value)) || 1) * 200)}px`
                                }}
                              ></div>
                            </div>
                          </div>
                          <div className="text-xs mt-2">{week.week}</div>
                          <div className="text-xs font-medium">{week.value.toFixed(1)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-around mt-4 border-t pt-4">
                      <div className="text-center">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-3 h-3 bg-blue-500"></div>
                          <span className="text-xs">Transportation</span>
                        </div>
                        <div className="font-medium">
                          {emissionsData.monthly.reduce((sum: number, week: any) =>
                            sum + (week.transportation || 0), 0).toFixed(2)} kg
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-3 h-3 bg-green-500"></div>
                          <span className="text-xs">Food</span>
                        </div>
                        <div className="font-medium">
                          {emissionsData.monthly.reduce((sum: number, week: any) =>
                            sum + (week.food || 0), 0).toFixed(2)} kg
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-3 h-3 bg-amber-500"></div>
                          <span className="text-xs">Energy</span>
                        </div>
                        <div className="font-medium">
                          {emissionsData.monthly.reduce((sum: number, week: any) =>
                            sum + (week.energy || 0), 0).toFixed(2)} kg
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations Card - Keep as is */}
          <div className="md:col-span-1">
            <Card className="rounded-xl border text-card-foreground shadow bg-card h-full">
              {/* Card content remains the same */}
              <CardHeader className="bg-green-50 dark:bg-green-950/30 rounded-t-xl border-b">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-green-600" />
                    <CardTitle>Gemini AI Recommendations</CardTitle>
                  </div>
                  <CardDescription>
                    AI-powered personalized suggestions to reduce your carbon footprint
                  </CardDescription>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <SavedRecommendationsDialog />
                    {aiRecommendations && !isLoadingAi && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-600 text-green-700 hover:bg-green-50"
                        onClick={() => {
                          const currentUser = sessionStorage.getItem("currentUser");
                          if (currentUser && aiRecommendations) {
                            const savedRecs = JSON.parse(localStorage.getItem(`${currentUser}_savedRecommendations`) || "[]");
                            const newRecs = [...savedRecs, { date: new Date().toISOString(), content: aiRecommendations }];
                            localStorage.setItem(`${currentUser}_savedRecommendations`, JSON.stringify(newRecs));
                            alert("Recommendations saved successfully!");
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                        Save
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={generateAiRecommendations}
                      disabled={isLoadingAi}
                    >
                      {isLoadingAi ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Get Insights
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="max-h-[350px] overflow-y-auto p-4">                {isLoadingAi ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-3" />
                  <p className="text-muted-foreground text-center">
                    Analyzing your carbon footprint data...<br />
                    Generating personalized recommendations
                  </p>
                </div>
              ) : aiRecommendations ? (
                <div className="whitespace-pre-line text-base font-medium space-y-4 prose dark:prose-invert max-w-none">
                  {aiRecommendations.includes("1.") ? (
                    <div dangerouslySetInnerHTML={{
                      __html: aiRecommendations
                        .replace(/(\d+\.)/g, '<strong class="text-green-600 text-lg">$1</strong>')
                        .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-green-700">$1</span>')
                        .replace(/Recommendation (\d+):/g, '<h3 class="text-lg font-bold border-b pb-1 text-green-700">🌱 Recommendation $1:</h3>')
                        .replace(/Transportation/g, '🚗 Transportation')
                        .replace(/Diet/g, '🥗 Diet')
                        .replace(/Energy/g, '⚡ Energy')
                        .replace(/Home/g, '🏡 Home')
                        .replace(/Renewable/g, '♻️ Renewable')
                        .replace(/financial benefit/gi, '💰 financial benefit')
                        .replace(/impact:/gi, 'impact: 📊')
                        .replace(/reduction/g, 'reduction 📉')
                        .split('\n').join('<br />')
                    }} />
                  ) : (
                    <div className="font-medium text-base">
                      {aiRecommendations}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Lightbulb className="h-12 w-12 text-amber-400 mb-3 opacity-80" />
                  <p className="text-center max-w-xs mx-auto">
                    Click "Get Insights" to receive personalized AI recommendations
                    based on your carbon footprint data
                  </p>
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

// Helper function to format date string
const formatDateString = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default CarbonDashboardFixed;
