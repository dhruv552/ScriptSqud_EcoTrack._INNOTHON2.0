export interface UserData {
  username: string;
  password: string;
}

export interface TransportationMode {
  vehicleType: string;
  distance: number;
  fuelEfficiency?: number;
  vehicleMakeId?: string;
  vehicleModelId?: string;
  fuelUsedLiters?: number;
  carbonEmissions?: {
    carbon_g?: number;
    carbon_kg?: number;
    carbon_lb?: number;
    carbon_mt?: number;
  };
}

export interface TransportationData {
  primaryMode: string;
  modes: TransportationMode[];
  totalDistance: number;
  totalEmissions?: {
    carbon_g?: number;
    carbon_kg?: number;
    carbon_lb?: number;
    carbon_mt?: number;
  };
}

export interface FoodData {
  meatConsumption: string;
  cookingMethod: string;
  locallySourced: string;
}

export interface EnergyData {
  electricityUsage: number;
  heatingUsage: number;
  renewablePercentage: number;
}

export interface FormData {
  transportation: TransportationData;
  food: FoodData;
  energy: EnergyData;
  date?: string;
}

export interface VehicleMake {
  id: string;
  type: string;
  attributes: {
    name: string;
    number_of_models: number;
  };
}

export interface VehicleModel {
  id: string;
  type: string;
  attributes: {
    name: string;
    year: number;
    vehicle_make: string;
  };
}

export interface CarbonEstimate {
  id: string;
  type: string;
  attributes: {
    distance_value: number;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_year: number;
    vehicle_model_id: string;
    distance_unit: string;
    estimated_at: string;
    carbon_g: number;
    carbon_lb: number;
    carbon_kg: number;
    carbon_mt: number;
  };
}
