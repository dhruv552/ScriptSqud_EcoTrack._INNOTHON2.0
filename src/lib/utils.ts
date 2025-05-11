import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  FormData,
  TransportationData,
  FoodData,
  EnergyData,
} from "@/types/FormData";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to reset all data stored in local and session storage
export function resetAllData() {
  // Get current user
  const currentUser = sessionStorage.getItem("currentUser");

  if (currentUser) {
    // Clear all user-specific data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`${currentUser}_`)) {
        localStorage.removeItem(key);
      }
    });

    // Set a reset flag to ensure components use empty data
    localStorage.setItem(`${currentUser}_dataReset`, 'true');

    // Reset today's date entry with empty data
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const emptyData = {
      [today]: {
        transportation: {
          vehicleType: "None",
          distance: 0,
          fuelEfficiency: 0,
          carbonEmissions: {
            carbon_g: 0,
            carbon_kg: 0,
            carbon_lb: 0,
            carbon_mt: 0
          }
        },
        food: {
          meatConsumption: "low",
          cookingMethod: "efficient",
          locallySourced: "yes"
        },
        energy: {
          electricityUsage: 0,
          heatingUsage: 0,
          renewablePercentage: 0
        }
      }
    };

    // Store the empty data
    localStorage.setItem(`${currentUser}_carbonData`, JSON.stringify(emptyData));
  }

  // Remove any cached API data
  localStorage.removeItem("vehicleMakes");
  localStorage.removeItem("vehicleModels");

  // Clear any other application data that might be stored
  Object.keys(localStorage).forEach(key => {
    if (key.includes("carbon") || key.includes("eco") || key.includes("footprint")) {
      localStorage.removeItem(key);
    }
  });

  // Reset application state without logging out
  localStorage.setItem("appReset", new Date().toISOString());

  return true;
}

export function saveFormData(
  data: FormData | TransportationData | FoodData | EnergyData,
  section?: string,
) {
  // If no user is set in session storage, create a default one
  let currentUser = sessionStorage.getItem("currentUser");
  if (!currentUser) {
    currentUser = "default_user";
    sessionStorage.setItem("currentUser", currentUser);
  }

  // Get existing data or initialize
  const userDataKey = `${currentUser}_carbonData`;
  const existingDataJson = localStorage.getItem(userDataKey);
  let existingData: Record<string, any> = existingDataJson
    ? JSON.parse(existingDataJson)
    : {};

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  if (!existingData[today]) {
    existingData[today] = {
      transportation: {},
      food: {},
      energy: {},
    };
  }

  if (section) {
    // Save section data
    existingData[today][section] = data;
  } else {
    // Save full form data
    existingData[today] = {
      ...existingData[today],
      ...data,
    };
  }

  // Save to local storage
  localStorage.setItem(userDataKey, JSON.stringify(existingData));
  return true;
}

export function getFormData(date?: string) {
  // If no user is set in session storage, create a default one
  let currentUser = sessionStorage.getItem("currentUser");
  if (!currentUser) {
    currentUser = "default_user";
    sessionStorage.setItem("currentUser", currentUser);
  }

  const userDataKey = `${currentUser}_carbonData`;
  const dataJson = localStorage.getItem(userDataKey);
  if (!dataJson) return null;

  const data = JSON.parse(dataJson);

  if (date) {
    return data[date] || null;
  }

  // Return today's data or empty object
  const today = new Date().toISOString().split("T")[0];
  return data[today] || null;
}

export async function fetchVehicleMakes() {
  try {
    // Get API key from apiKeys.ts
    const API_KEY = "YOUR_CARBON_INTERFACE_API_KEY";

    // Check if the API key is the placeholder
    if (API_KEY === "YOUR_CARBON_INTERFACE_API_KEY") {
      console.warn("Please configure a valid Carbon Interface API key in apiKeys.ts");
      return [];
    }

    const response = await fetch(
      "https://www.carboninterface.com/api/v1/vehicle_makes",
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching vehicle makes:", error);
    return [];
  }
}

export async function fetchVehicleModels(makeId: string) {
  try {
    // Get API key from apiKeys.ts
    const API_KEY = "YOUR_CARBON_INTERFACE_API_KEY";

    // Check if the API key is the placeholder
    if (API_KEY === "YOUR_CARBON_INTERFACE_API_KEY") {
      console.warn("Please configure a valid Carbon Interface API key in apiKeys.ts");
      return [];
    }

    const response = await fetch(
      `https://www.carboninterface.com/api/v1/vehicle_makes/${makeId}/vehicle_models`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching vehicle models:", error);
    return [];
  }
}

export async function calculateCarbonEmissions(
  distance: number,
  vehicleModelId: string,
  unit: string = "km",
) {
  try {
    // Get API key from apiKeys.ts
    const API_KEY = "YOUR_CARBON_INTERFACE_API_KEY";

    // Check if the API key is the placeholder
    if (API_KEY === "YOUR_CARBON_INTERFACE_API_KEY") {
      console.warn("Please configure a valid Carbon Interface API key in apiKeys.ts");
      return null;
    }

    const response = await fetch(
      "https://www.carboninterface.com/api/v1/estimates",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "vehicle",
          distance_unit: unit,
          distance_value: distance,
          vehicle_model_id: vehicleModelId,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error calculating carbon emissions:", error);
    return null;
  }
}

/**
 * Calculate carbon emissions based on distance traveled and fuel efficiency
 * @param distanceKm - Distance traveled in kilometers
 * @param fuelEfficiencyKmPerL - Vehicle fuel efficiency in km/L
 * @returns Object with emissions data
 */
export function calculateFuelEmissions(
  distanceKm: number,
  fuelEfficiencyKmPerL: number
) {
  // Emission factor for Petrol in kg CO2 per liter
  const PETROL_EMISSION_FACTOR = 2.31;

  // Validate input
  if (
    typeof distanceKm !== 'number' ||
    typeof fuelEfficiencyKmPerL !== 'number' ||
    distanceKm <= 0 ||
    fuelEfficiencyKmPerL <= 0
  ) {
    throw new Error('Invalid input values');
  }

  // Calculate fuel used
  const fuelUsedLiters = distanceKm / fuelEfficiencyKmPerL;

  // Calculate CO2 emission
  const co2EmissionKg = fuelUsedLiters * PETROL_EMISSION_FACTOR;
  const co2EmissionG = co2EmissionKg * 1000;
  const co2EmissionLb = co2EmissionKg * 2.20462; // Convert kg to lb
  const co2EmissionMt = co2EmissionKg / 1000; // Convert kg to metric tons

  return {
    distanceKm,
    fuelEfficiencyKmPerL,
    fuelUsedLiters: parseFloat(fuelUsedLiters.toFixed(2)),
    carbonEmissions: {
      carbon_g: parseFloat(co2EmissionG.toFixed(2)),
      carbon_kg: parseFloat(co2EmissionKg.toFixed(2)),
      carbon_lb: parseFloat(co2EmissionLb.toFixed(2)),
      carbon_mt: parseFloat(co2EmissionMt.toFixed(4))
    }
  };
}

/**
 * Calculate carbon footprint based on food consumption habits
 * @param meatLevel - Level of meat consumption ('high', 'medium', 'low')
 * @param cookingMethod - Cooking method used ('gas', 'electric', 'induction')
 * @param localSourcing - How often locally sourced food is consumed ('mostly', 'sometimes', 'rarely')
 * @returns Carbon footprint in kg CO₂e per week
 */
export function calculateFoodCarbonFootprint(meatLevel, cookingMethod, localSourcing) {
  // Emission factors (in kg CO₂e per week)
  const meatEmission = {
    high: 30,      // daily meat
    medium: 20,    // few times a week
    low: 10        // rarely/never
  };

  const cookingEmission = {
    gas: 5,
    electric: 4,
    induction: 3
  };

  const sourcingReduction = {
    mostly: 0.7,     // 30% reduction
    sometimes: 0.85, // 15% reduction
    rarely: 1        // no reduction
  };

  // Normalize inputs
  meatLevel = meatLevel.toLowerCase();
  cookingMethod = cookingMethod.toLowerCase();
  localSourcing = localSourcing.toLowerCase();

  // Calculate total before reduction
  const baseEmission = (meatEmission[meatLevel] || 0) + (cookingEmission[cookingMethod] || 0);

  // Apply local sourcing reduction
  const finalEmission = baseEmission * (sourcingReduction[localSourcing] || 1);

  return {
    baseEmission: Number(baseEmission.toFixed(2)),
    localSourcingReduction: Number(baseEmission - finalEmission).toFixed(2),
    finalEmission: Number(finalEmission.toFixed(2)), // return result with 2 decimal points
    weeklyFootprint: Number(finalEmission.toFixed(2)),
    dailyFootprint: Number((finalEmission / 7).toFixed(2)),
    yearlyFootprint: Number((finalEmission * 52).toFixed(2))
  };
}

/**
 * Calculate carbon footprint based on energy usage
 * @param electricityUsageKWhPerDay - Daily electricity usage in kWh
 * @param heatingCoolingHoursPerDay - Hours of heating/cooling per day
 * @param renewablePercentage - Percentage of renewable energy used (0-100)
 * @returns Carbon footprint data in kg CO₂e
 */
export function calculateEnergyFootprint(electricityUsageKWhPerDay, heatingCoolingHoursPerDay, renewablePercentage) {
  // Constants (Emission factors – can be adjusted to match your region/grid)
  const EMISSION_FACTOR_ELECTRICITY = 0.475; // kg CO₂e per kWh (global avg)
  const EMISSION_FACTOR_HVAC = 0.25;         // kg CO₂e per hour of HVAC

  // Clamp renewablePercentage between 0 and 100
  renewablePercentage = Math.max(0, Math.min(renewablePercentage, 100));
  const renewableFraction = renewablePercentage / 100;

  // Daily Emissions
  const dailyElectricityCO2 = electricityUsageKWhPerDay * EMISSION_FACTOR_ELECTRICITY;
  const adjustedElectricityCO2 = dailyElectricityCO2 * (1 - renewableFraction);
  const dailyHVACCO2 = heatingCoolingHoursPerDay * EMISSION_FACTOR_HVAC;
  const dailyTotalCO2 = adjustedElectricityCO2 + dailyHVACCO2;

  // Weekly total
  const weeklyCO2 = dailyTotalCO2 * 7;

  // Monthly and yearly estimates
  const monthlyCO2 = dailyTotalCO2 * 30;
  const yearlyCO2 = dailyTotalCO2 * 365;

  // Calculate the CO2 saved by renewable energy
  const renewableSavings = dailyElectricityCO2 * renewableFraction;

  return {
    dailyFootprint: Number(dailyTotalCO2.toFixed(2)),
    weeklyFootprint: Number(weeklyCO2.toFixed(2)),
    monthlyFootprint: Number(monthlyCO2.toFixed(2)),
    yearlyFootprint: Number(yearlyCO2.toFixed(2)),
    electricityEmissions: Number(adjustedElectricityCO2.toFixed(2)),
    hvacEmissions: Number(dailyHVACCO2.toFixed(2)),
    renewableSavings: Number(renewableSavings.toFixed(2))
  };
}

export async function calculateElectricityEmissions(
  electricityUsage: number,
  country: string = "us",
  state: string = "ca",
) {
  try {
    // Get API key from apiKeys.ts
    const API_KEY = "YOUR_CARBON_INTERFACE_API_KEY";

    // Check if the API key is the placeholder
    if (API_KEY === "YOUR_CARBON_INTERFACE_API_KEY") {
      console.warn("Please configure a valid Carbon Interface API key in apiKeys.ts");
      return null;
    }

    const response = await fetch(
      "https://www.carboninterface.com/api/v1/estimates",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "electricity",
          electricity_unit: "kwh",
          electricity_value: electricityUsage,
          country,
          state,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error calculating electricity emissions:", error);
    return null;
  }
}

/**
 * Calculate daily carbon footprint from food consumption
 * @param meatLevel - Level of meat consumption ('high', 'medium', 'low')
 * @param cookingMethod - Cooking method used ('gas', 'electric', 'induction')
 * @param localSourcing - How often locally sourced food is consumed ('mostly', 'sometimes', 'rarely')
 * @returns Daily food carbon footprint in kg CO₂e
 */
export function calculateFoodCarbonFootprintDaily(meatLevel, cookingMethod, localSourcing) {
  const meatEmission = { high: 4.3, medium: 2.9, low: 1.4 }; // kg CO₂e/day
  const cookingEmission = { gas: 0.7, electric: 0.6, induction: 0.5 }; // kg/day
  const sourcingReduction = { mostly: 0.7, sometimes: 0.85, rarely: 1 };

  meatLevel = meatLevel.toLowerCase();
  cookingMethod = cookingMethod.toLowerCase();
  localSourcing = localSourcing.toLowerCase();

  const base = (meatEmission[meatLevel] || 0) + (cookingEmission[cookingMethod] || 0);
  return base * (sourcingReduction[localSourcing] || 1);
}

/**
 * Calculate daily carbon footprint from vehicle usage
 * @param kmPerDay - Distance traveled per day in kilometers
 * @param vehicleType - Type of vehicle ('car', 'bike', 'bus', 'ev')
 * @returns Daily vehicle carbon footprint in kg CO₂e
 */
export function calculateVehicleCarbonFootprint(kmPerDay, vehicleType) {
  const emissionPerKm = {
    car: 0.21,    // kg CO₂e/km
    motorcycle: 0.11,
    bike: 0.05,
    bus: 0.1,
    train: 0.06,
    ev: 0.05,
    bicycle: 0,
    walking: 0
  };
  return kmPerDay * (emissionPerKm[vehicleType.toLowerCase()] || 0);
}

/**
 * Calculate daily carbon footprint from energy usage
 * @param electricityKWh - Daily electricity usage in kWh
 * @param hvacHours - Hours of heating/cooling per day
 * @param renewablePercent - Percentage of renewable energy used (0-100)
 * @returns Daily energy carbon footprint in kg CO₂e
 */
export function calculateEnergyCarbonFootprintDaily(electricityKWh, hvacHours, renewablePercent) {
  const EMISSION_FACTOR_ELECTRICITY = 0.475; // kg CO₂e/kWh
  const EMISSION_FACTOR_HVAC = 0.25;         // kg CO₂e/hour

  const renewableFraction = Math.max(0, Math.min(renewablePercent, 100)) / 100;

  const electricCO2 = electricityKWh * EMISSION_FACTOR_ELECTRICITY * (1 - renewableFraction);
  const hvacCO2 = hvacHours * EMISSION_FACTOR_HVAC;

  return electricCO2 + hvacCO2;
}

/**
 * Calculate total daily carbon footprint from all sources
 * @param userData - User data containing food, transportation, and energy information
 * @returns Object with carbon footprints for each category and the total
 */
export function calculateTotalDailyCarbonFootprint(userData) {
  let foodCO2 = 0;
  let vehicleCO2 = 0;
  let energyCO2 = 0;

  // Calculate food carbon footprint if data is available
  if (userData?.food) {
    foodCO2 = calculateFoodCarbonFootprintDaily(
      userData.food.meatConsumption || 'medium',
      userData.food.cookingMethod || 'electric',
      userData.food.locallySourced || 'sometimes'
    );
  }

  // Calculate vehicle carbon footprint if data is available
  if (userData?.transportation) {
    // Check if using the new multi-mode structure
    if (userData.transportation.modes && Array.isArray(userData.transportation.modes)) {
      // Sum up emissions from each transportation mode
      vehicleCO2 = userData.transportation.modes.reduce((total, mode) => {
        // If mode already has calculated emissions, use those
        if (mode.carbonEmissions && mode.carbonEmissions.carbon_kg) {
          return total + mode.carbonEmissions.carbon_kg;
        } else {
          // Otherwise calculate from scratch
          return total + calculateVehicleCarbonFootprint(
            mode.distance || 0,
            mode.vehicleType || 'car'
          );
        }
      }, 0);
    }
    // Fallback to legacy data structure
    else {
      vehicleCO2 = calculateVehicleCarbonFootprint(
        userData.transportation.distance || 0,
        userData.transportation.vehicleType || 'car'
      );
    }

    // If total emissions were pre-calculated, use those instead
    if (userData.transportation.totalEmissions && userData.transportation.totalEmissions.carbon_kg) {
      vehicleCO2 = userData.transportation.totalEmissions.carbon_kg;
    }
  }

  // Calculate energy carbon footprint if data is available
  if (userData?.energy) {
    energyCO2 = calculateEnergyCarbonFootprintDaily(
      userData.energy.electricityUsage || 0,
      userData.energy.heatingUsage || 0,
      userData.energy.renewablePercentage || 0
    );
  }

  const totalCO2 = foodCO2 + vehicleCO2 + energyCO2;
  const savedCO2 = calculateDailySavings(totalCO2);
  const treesSaved = calculateTreesSaved(savedCO2);

  return {
    foodCO2: Number(foodCO2.toFixed(2)),
    vehicleCO2: Number(vehicleCO2.toFixed(2)),
    energyCO2: Number(energyCO2.toFixed(2)),
    totalCO2: Number(totalCO2.toFixed(2)),
    savedCO2: Number(savedCO2.toFixed(2)),
    treesSaved: Number(treesSaved.toFixed(2))
  };
}

/**
 * Calculate how much CO2 was saved compared to average global emissions
 * @param userCO2Emission - User's daily CO2 emission in kg
 * @returns Amount of CO2 saved in kg
 */
export function calculateDailySavings(userCO2Emission) {
  const averageBaselineCO2 = 22; // average global daily CO₂ in kg
  const savedCO2 = Math.max(0, averageBaselineCO2 - userCO2Emission);
  return Number(savedCO2.toFixed(2));
}

/**
 * Calculate how many trees would be needed to absorb the CO2 saved
 * @param co2SavedTodayKg - Amount of CO2 saved today in kg
 * @returns Equivalent number of trees saved
 */
export function calculateTreesSaved(co2SavedTodayKg) {
  const DAILY_CO2_ABSORPTION_PER_TREE = 0.0596; // kg CO₂ per tree per day
  const treesSaved = co2SavedTodayKg / DAILY_CO2_ABSORPTION_PER_TREE;
  return Number(treesSaved.toFixed(2)); // Round to 2 decimals
}
