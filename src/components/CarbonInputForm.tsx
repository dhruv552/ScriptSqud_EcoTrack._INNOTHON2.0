import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";
import {
  Car,
  Utensils,
  Home,
  ArrowRight,
  Save,
  AlertCircle,
  Activity,
} from "lucide-react";
import {
  saveFormData,
  fetchVehicleMakes,
  fetchVehicleModels,
  calculateCarbonEmissions,
  calculateElectricityEmissions,
} from "@/lib/utils";
import {
  FormData,
  VehicleMake,
  VehicleModel,
  TransportationData,
} from "@/types/FormData";

interface CarbonInputFormProps {
  onSubmit?: (data: FormData) => void;
}

// Using FormData interface from types/FormData.ts

const CarbonInputForm: React.FC<CarbonInputFormProps> = ({
  onSubmit = () => { },
}) => {
  const [activeTab, setActiveTab] = useState("transportation");
  const [formData, setFormData] = useState<FormData>({
    transportation: {
      primaryMode: "car",
      modes: [
        {
          vehicleType: "car",
          distance: 20,
          fuelEfficiency: 25,
        }
      ],
      totalDistance: 20,
    },
    food: {
      meatConsumption: "medium",
      cookingMethod: "electric",
      locallySourced: "sometimes",
    },
    energy: {
      electricityUsage: 15,
      heatingUsage: 10,
      renewablePercentage: 20,
    },
  });

  // State for vehicle makes and models
  const [vehicleMakes, setVehicleMakes] = useState<VehicleMake[]>([]);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Initialize default user if not exists
  useEffect(() => {
    if (!sessionStorage.getItem("currentUser")) {
      sessionStorage.setItem("currentUser", "default_user");
    }
  }, []);

  // Fetch vehicle makes on component mount
  useEffect(() => {
    const loadVehicleMakes = async () => {
      setIsLoading(true);
      try {
        const makesData = await fetchVehicleMakes();
        if (makesData && makesData.length > 0) {
          setVehicleMakes(makesData.map((item: any) => item.data));
        }
      } catch (error) {
        setApiError("Failed to load vehicle makes. Please try again later.");
        console.error("Error loading vehicle makes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVehicleMakes();
  }, []);

  // Fetch vehicle models when make is selected
  useEffect(() => {
    if (!selectedMake) {
      setVehicleModels([]);
      setSelectedModel("");
      return;
    }

    const loadVehicleModels = async () => {
      setIsLoading(true);
      try {
        const modelsData = await fetchVehicleModels(selectedMake);
        if (modelsData && modelsData.length > 0) {
          setVehicleModels(modelsData.map((item: any) => item.data));
        }
      } catch (error) {
        setApiError("Failed to load vehicle models. Please try again later.");
        console.error("Error loading vehicle models:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVehicleModels();
  }, [selectedMake]);

  const handleTransportationChange = (
    field: string,
    value: string | number,
  ) => {
    setFormData({
      ...formData,
      transportation: {
        ...formData.transportation,
        [field]: value,
      },
    });
  };

  const handleFoodChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      food: {
        ...formData.food,
        [field]: value,
      },
    });
  };

  const handleEnergyChange = (field: string, value: number) => {
    setFormData({
      ...formData,
      energy: {
        ...formData.energy,
        [field]: value,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = saveFormData(formData);
    if (success) {
      setSuccessMessage("All data saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      onSubmit(formData);
    }
  };

  const handleTransportationSubmit = async () => {
    setApiError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      // Import utility functions
      const { calculateFuelEmissions, calculateVehicleCarbonFootprint } = await import("@/lib/utils");

      // Process each transportation mode
      const updatedModes = await Promise.all(formData.transportation.modes.map(async (mode) => {
        let updatedMode = { ...mode };

        // Handle car/motorcycle with fuel efficiency calculation
        if (mode.vehicleType === "car" || mode.vehicleType === "motorcycle") {
          // Use our local calculation method for fuel-based vehicles
          const emissionsResult = calculateFuelEmissions(
            mode.distance,
            mode.fuelEfficiency || 25
          );

          updatedMode = {
            ...updatedMode,
            fuelUsedLiters: emissionsResult.fuelUsedLiters,
            carbonEmissions: emissionsResult.carbonEmissions,
          };
        }
        // For other transportation types
        else {
          // Use the vehicle calculation function for other modes
          const emissions = calculateVehicleCarbonFootprint(mode.distance, mode.vehicleType);
          updatedMode = {
            ...updatedMode,
            carbonEmissions: {
              carbon_kg: emissions,
              carbon_g: emissions * 1000,
              carbon_lb: emissions * 2.20462,
              carbon_mt: emissions / 1000
            },
          };
        }

        return updatedMode;
      }));

      // Calculate total emissions
      let totalEmissions = {
        carbon_g: 0,
        carbon_kg: 0,
        carbon_lb: 0,
        carbon_mt: 0
      };

      updatedModes.forEach(mode => {
        if (mode.carbonEmissions) {
          totalEmissions.carbon_g += mode.carbonEmissions.carbon_g || 0;
          totalEmissions.carbon_kg += mode.carbonEmissions.carbon_kg || 0;
          totalEmissions.carbon_lb += mode.carbonEmissions.carbon_lb || 0;
          totalEmissions.carbon_mt += mode.carbonEmissions.carbon_mt || 0;
        }
      });

      // Update transportation data with modes and total
      const updatedTransportation: TransportationData = {
        ...formData.transportation,
        modes: updatedModes,
        totalEmissions: totalEmissions
      };

      // Update form data
      setFormData({
        ...formData,
        transportation: updatedTransportation,
      });

      // Save to local storage
      const success = saveFormData(updatedTransportation, "transportation");
      if (success) {
        setSuccessMessage(
          `Transportation data saved! Total carbon footprint: ${totalEmissions.carbon_kg.toFixed(2)} kg CO₂e`
        );
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      setApiError(
        "Failed to calculate carbon emissions. Please try again later."
      );
      console.error("Error calculating emissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFoodSubmit = async () => {
    setApiError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      // Import and use the food carbon footprint calculation using dynamic import
      const utils = await import("@/lib/utils");
      const calculateFoodCarbonFootprint = utils.calculateFoodCarbonFootprint;

      // Calculate food carbon footprint
      const foodEmissions = calculateFoodCarbonFootprint(
        formData.food.meatConsumption,
        formData.food.cookingMethod,
        formData.food.locallySourced
      );

      // Update form data with calculations
      const updatedFood = {
        ...formData.food,
        carbonFootprint: foodEmissions
      };

      // Update local state
      setFormData({
        ...formData,
        food: updatedFood
      });

      // Save to local storage
      const success = saveFormData(updatedFood, "food");
      if (success) {
        setApiError(""); // Ensure any error is cleared
        setSuccessMessage(`Food data saved! Weekly carbon footprint: ${foodEmissions.weeklyFootprint} kg CO₂e`);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error calculating food emissions:", error);

      // Save food data without calculations as fallback
      const success = saveFormData(formData.food, "food");
      if (success) {
        // Don't show the error if we successfully saved the data
        setApiError("");
        setSuccessMessage("Food data saved successfully.");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setApiError("Failed to save food data.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnergySubmit = async () => {
    setApiError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      // Import and use the energy carbon footprint calculation using dynamic import
      const utils = await import("@/lib/utils");
      const calculateEnergyFootprint = utils.calculateEnergyFootprint;

      // Calculate energy carbon footprint
      const energyFootprint = calculateEnergyFootprint(
        formData.energy.electricityUsage,
        formData.energy.heatingUsage,
        formData.energy.renewablePercentage
      );

      // Update energy data with calculations
      const updatedEnergy = {
        ...formData.energy,
        carbonFootprint: energyFootprint
      };

      // Update form data
      setFormData({
        ...formData,
        energy: updatedEnergy
      });

      // Save to local storage
      const success = saveFormData(updatedEnergy, "energy");
      if (success) {
        setApiError(""); // Ensure any error is cleared
        setSuccessMessage(`Energy data saved! Daily carbon footprint: ${energyFootprint.dailyFootprint} kg CO₂e`);
        setTimeout(() => setSuccessMessage(""), 5000);
      }
    } catch (error) {
      console.error("Error calculating energy emissions:", error);

      // Save energy data without calculations as fallback
      const success = saveFormData(formData.energy, "energy");
      if (success) {
        // Don't show the error if we successfully saved the data
        setApiError("");
        setSuccessMessage("Energy data saved successfully.");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setApiError("Failed to save energy data.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle changes for a specific transportation mode
  const handleTransportationModeChange = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    const updatedModes = [...formData.transportation.modes];
    updatedModes[index] = {
      ...updatedModes[index],
      [field]: value,
    };

    // Calculate total distance across all modes
    const totalDistance = updatedModes.reduce((sum, mode) => sum + mode.distance, 0);

    setFormData({
      ...formData,
      transportation: {
        ...formData.transportation,
        modes: updatedModes,
        totalDistance: totalDistance,
        primaryMode: updatedModes.length > 0 ? updatedModes[0].vehicleType : "car",
      },
    });
  };

  // Add a new transportation mode
  const addTransportationMode = () => {
    const newMode = {
      vehicleType: "bus", // Default to bus since car is likely already added
      distance: 5,
      fuelEfficiency: 25,
    };

    const updatedModes = [...formData.transportation.modes, newMode];
    const totalDistance = updatedModes.reduce((sum, mode) => sum + mode.distance, 0);

    setFormData({
      ...formData,
      transportation: {
        ...formData.transportation,
        modes: updatedModes,
        totalDistance: totalDistance,
      },
    });
  };

  // Remove a transportation mode
  const removeTransportationMode = (index: number) => {
    if (formData.transportation.modes.length <= 1) {
      // Don't remove if it's the last mode
      setApiError("At least one transportation mode is required");
      return;
    }

    const updatedModes = [...formData.transportation.modes];
    updatedModes.splice(index, 1);

    const totalDistance = updatedModes.reduce((sum, mode) => sum + mode.distance, 0);

    setFormData({
      ...formData,
      transportation: {
        ...formData.transportation,
        modes: updatedModes,
        totalDistance: totalDistance,
        primaryMode: updatedModes.length > 0 ? updatedModes[0].vehicleType : "car",
      },
    });
  };

  const nextTab = () => {
    if (activeTab === "transportation") setActiveTab("food");
    else if (activeTab === "food") setActiveTab("energy");
  };

  const prevTab = () => {
    if (activeTab === "food") setActiveTab("transportation");
    else if (activeTab === "energy") setActiveTab("food");
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-xl overflow-hidden">
      <Card className="border-2 border-primary/10 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardTitle className="text-2xl font-bold text-center">
            Daily Carbon Footprint Input
          </CardTitle>
          <CardDescription className="text-center">
            Track your daily activities to calculate your carbon footprint
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-8">
                <TabsTrigger
                  value="transportation"
                  className="flex items-center gap-2"
                >
                  <Car className="h-4 w-4" />
                  <span className="hidden sm:inline">Transportation</span>
                </TabsTrigger>
                <TabsTrigger value="food" className="flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  <span className="hidden sm:inline">Food</span>
                </TabsTrigger>
                <TabsTrigger value="energy" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Energy</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transportation" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {apiError && (
                    <div className="p-3 bg-red-900/30 border border-red-800 rounded-md text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {apiError}
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-3 bg-green-900/30 border border-green-800 rounded-md text-green-400 text-sm flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {successMessage}
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Your Transportation Modes</h3>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addTransportationMode}
                        className="bg-primary/10 hover:bg-primary/20"
                      >
                        + Add Transport Mode
                      </Button>
                    </div>

                    {/* List of transportation modes */}
                    {formData.transportation.modes.map((mode, index) => (
                      <div
                        key={index}
                        className="bg-card/50 border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Transport Mode {index + 1}</h4>
                          {formData.transportation.modes.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTransportationMode(index)}
                              className="h-8 text-red-500 hover:text-red-700 hover:bg-red-100/10"
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label>Vehicle Type</Label>
                            <Select
                              value={mode.vehicleType}
                              onValueChange={(value) =>
                                handleTransportationModeChange(index, "vehicleType", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select vehicle type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="car">Car</SelectItem>
                                <SelectItem value="motorcycle">Motorcycle</SelectItem>
                                <SelectItem value="bus">Bus</SelectItem>
                                <SelectItem value="train">Train</SelectItem>
                                <SelectItem value="bicycle">Bicycle</SelectItem>
                                <SelectItem value="walking">Walking</SelectItem>
                                <SelectItem value="ev">Electric Vehicle</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Distance Traveled (km)</Label>
                            <div className="flex items-center gap-4">
                              <Slider
                                min={0}
                                max={200}
                                step={1}
                                value={[mode.distance]}
                                onValueChange={(value) =>
                                  handleTransportationModeChange(index, "distance", value[0])
                                }
                                className="flex-1"
                              />
                              <span className="w-12 text-center">
                                {mode.distance}
                              </span>
                            </div>
                          </div>

                          {(mode.vehicleType === "car" || mode.vehicleType === "motorcycle") && (
                            <div>
                              <Label>Fuel Efficiency (km/L)</Label>
                              <div className="flex items-center gap-4">
                                <Slider
                                  min={5}
                                  max={50}
                                  step={1}
                                  value={[mode.fuelEfficiency || 25]}
                                  onValueChange={(value) =>
                                    handleTransportationModeChange(
                                      index,
                                      "fuelEfficiency",
                                      value[0],
                                    )
                                  }
                                  className="flex-1"
                                />
                                <span className="w-12 text-center">
                                  {mode.fuelEfficiency || 25}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Total distance summary */}
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total distance across all modes:</span>
                        <span className="font-bold">{formData.transportation.totalDistance} km</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      onClick={handleTransportationSubmit}
                      className="bg-green-600 hover:bg-green-700 group"
                      disabled={isLoading}
                    >
                      <motion.span
                        className="flex items-center"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {isLoading
                          ? "Calculating..."
                          : "Calculate & Save Transportation Data"}
                      </motion.span>
                    </Button>

                    <Button type="button" onClick={nextTab} className="group">
                      Next
                      <motion.span
                        className="ml-2 inline-block"
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.span>
                    </Button>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="food" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {apiError && (
                    <div className="p-3 bg-red-900/30 border border-red-800 rounded-md text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {apiError}
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-4 bg-green-900/30 border border-green-800 rounded-md text-green-400 flex flex-col gap-2">
                      <div className="flex items-center">
                        <Save className="h-4 w-4 mr-2" />
                        <span className="font-medium">Calculation Complete!</span>
                      </div>
                      <p>{successMessage}</p>
                      {formData.food.carbonFootprint && (
                        <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                          <div className="bg-green-950/30 p-2 rounded flex flex-col items-center">
                            <span className="text-xs opacity-80">Daily</span>
                            <span className="font-bold">{formData.food.carbonFootprint.dailyFootprint} kg</span>
                          </div>
                          <div className="bg-blue-950/30 p-2 rounded flex flex-col items-center">
                            <span className="text-xs opacity-80">Weekly</span>
                            <span className="font-bold text-blue-400">{formData.food.carbonFootprint.weeklyFootprint} kg</span>
                          </div>
                          <div className="bg-amber-950/30 p-2 rounded flex flex-col items-center">
                            <span className="text-xs opacity-80">Yearly</span>
                            <span className="font-bold text-amber-400">{formData.food.carbonFootprint.yearlyFootprint} kg</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <Label>Meat Consumption</Label>
                      <RadioGroup
                        value={formData.food.meatConsumption}
                        onValueChange={(value) =>
                          handleFoodChange("meatConsumption", value)
                        }
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="high" id="meat-high" />
                          <Label htmlFor="meat-high">High (Daily)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="meat-medium" />
                          <Label htmlFor="meat-medium">
                            Medium (Few times a week)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="low" id="meat-low" />
                          <Label htmlFor="meat-low">Low (Rarely/Never)</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label>Primary Cooking Method</Label>
                      <RadioGroup
                        value={formData.food.cookingMethod}
                        onValueChange={(value) =>
                          handleFoodChange("cookingMethod", value)
                        }
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="gas" id="cooking-gas" />
                          <Label htmlFor="cooking-gas">Gas Stove</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="electric"
                            id="cooking-electric"
                          />
                          <Label htmlFor="cooking-electric">
                            Electric Stove
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="induction"
                            id="cooking-induction"
                          />
                          <Label htmlFor="cooking-induction">
                            Induction Cooktop
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label>Locally Sourced Food</Label>
                      <RadioGroup
                        value={formData.food.locallySourced}
                        onValueChange={(value) =>
                          handleFoodChange("locallySourced", value)
                        }
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="mostly" id="local-mostly" />
                          <Label htmlFor="local-mostly">Mostly</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="sometimes"
                            id="local-sometimes"
                          />
                          <Label htmlFor="local-sometimes">Sometimes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="rarely" id="local-rarely" />
                          <Label htmlFor="local-rarely">Rarely</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={prevTab}>
                      Back
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleFoodSubmit}
                        className="bg-green-600 hover:bg-green-700 group relative overflow-hidden"
                      >
                        <motion.span
                          className="flex items-center"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Calculate & Save Food Data
                        </motion.span>
                      </Button>

                      <Button type="button" onClick={nextTab} className="group">
                        Next
                        <motion.span
                          className="ml-2 inline-block"
                          initial={{ x: 0 }}
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </motion.span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="energy" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {apiError && (
                    <div className="p-3 bg-red-900/30 border border-red-800 rounded-md text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {apiError}
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-4 bg-green-900/30 border border-green-800 rounded-md text-green-400 flex flex-col gap-2">
                      <div className="flex items-center">
                        <Save className="h-4 w-4 mr-2" />
                        <span className="font-medium">Energy Calculation Complete!</span>
                      </div>
                      <p>{successMessage}</p>
                      {formData.energy.carbonFootprint && (
                        <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                          <div className="bg-green-950/30 p-2 rounded flex flex-col items-center">
                            <span className="text-xs opacity-80">Daily</span>
                            <span className="font-bold">{formData.energy.carbonFootprint.dailyFootprint} kg</span>
                          </div>
                          <div className="bg-blue-950/30 p-2 rounded flex flex-col items-center">
                            <span className="text-xs opacity-80">Weekly</span>
                            <span className="font-bold text-blue-400">{formData.energy.carbonFootprint.weeklyFootprint} kg</span>
                          </div>
                          <div className="bg-amber-950/30 p-2 rounded flex flex-col items-center">
                            <span className="text-xs opacity-80">Monthly</span>
                            <span className="font-bold text-amber-400">{formData.energy.carbonFootprint.monthlyFootprint} kg</span>
                          </div>
                        </div>
                      )}
                      {formData.energy.carbonFootprint?.renewableSavings > 0 && (
                        <div className="mt-2 p-2 bg-emerald-950/30 border border-emerald-800/50 rounded">
                          <span className="text-emerald-400">
                            <span className="font-medium">✓ Renewable energy savings:</span> {formData.energy.carbonFootprint.renewableSavings} kg CO₂e per day
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="electricityUsage">
                        Electricity Usage (kWh/day)
                      </Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          id="electricityUsage"
                          min={0}
                          max={50}
                          step={1}
                          value={[formData.energy.electricityUsage]}
                          onValueChange={(value) =>
                            handleEnergyChange("electricityUsage", value[0])
                          }
                          className="flex-1"
                        />
                        <span className="w-12 text-center">
                          {formData.energy.electricityUsage}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="heatingUsage">
                        Heating/Cooling Usage (hours/day)
                      </Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          id="heatingUsage"
                          min={0}
                          max={24}
                          step={0.5}
                          value={[formData.energy.heatingUsage]}
                          onValueChange={(value) =>
                            handleEnergyChange("heatingUsage", value[0])
                          }
                          className="flex-1"
                        />
                        <span className="w-12 text-center">
                          {formData.energy.heatingUsage}
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="renewablePercentage">
                        Renewable Energy Percentage (%)
                      </Label>
                      <div className="flex items-center gap-4">
                        <Slider
                          id="renewablePercentage"
                          min={0}
                          max={100}
                          step={5}
                          value={[formData.energy.renewablePercentage]}
                          onValueChange={(value) =>
                            handleEnergyChange("renewablePercentage", value[0])
                          }
                          className="flex-1"
                        />
                        <span className="w-12 text-center">
                          {formData.energy.renewablePercentage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={prevTab}>
                      Back
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleEnergySubmit}
                        className="bg-green-600 hover:bg-green-700 group relative overflow-hidden"
                      >
                        <motion.span
                          className="flex items-center"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Calculate & Save Energy Data
                        </motion.span>
                      </Button>

                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 group"
                      >
                        <motion.span
                          className="flex items-center"
                          whileHover={{ scale: 1.05 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save All Data
                        </motion.span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </form>
        </CardContent>
        <CardFooter className="border-t bg-muted/20 flex justify-center text-sm text-muted-foreground">
          <p>Your data helps calculate your personal carbon footprint</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CarbonInputForm;
