import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { calculateFuelEmissions } from "@/lib/utils";

interface CalculationResult {
  distanceKm: number;
  fuelEfficiencyKmPerL: number;
  fuelUsedLiters: number;
  carbonEmissions: {
    carbon_g: number;
    carbon_kg: number;
    carbon_lb: number;
    carbon_mt: number;
  };
}

const FuelEfficiencyCalculator: React.FC = () => {
  const [distanceKm, setDistanceKm] = useState<number>(150);
  const [fuelEfficiencyKmPerL, setFuelEfficiencyKmPerL] = useState<number>(15);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () => {
    try {
      setError(null);
      
      if (distanceKm <= 0 || fuelEfficiencyKmPerL <= 0) {
        setError("Distance and fuel efficiency must be positive numbers");
        return;
      }
      
      const calculationResult = calculateFuelEmissions(distanceKm, fuelEfficiencyKmPerL);
      setResult(calculationResult);
    } catch (err) {
      setError("An error occurred during calculation");
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">Fuel Efficiency & Carbon Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="distance">Distance (km):</Label>
            <Input
              id="distance"
              type="number"
              value={distanceKm.toString()}
              onChange={(e) => setDistanceKm(Number(e.target.value))}
              placeholder="Enter distance in km"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="efficiency">Fuel Efficiency (km/L):</Label>
            <Input
              id="efficiency"
              type="number"
              value={fuelEfficiencyKmPerL.toString()}
              onChange={(e) => setFuelEfficiencyKmPerL(Number(e.target.value))}
              placeholder="Enter fuel efficiency in km/L"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-500 p-2 rounded-md text-sm">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4">
          <Button onClick={handleCalculate} className="w-full">
            Calculate Emissions
          </Button>

          {result && (
            <div className="bg-card rounded-md p-4 border space-y-2">
              <h3 className="font-medium">Results:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span>Distance:</span>
                <span className="text-right font-medium">{result.distanceKm} km</span>
                
                <span>Fuel Efficiency:</span>
                <span className="text-right font-medium">{result.fuelEfficiencyKmPerL} km/L</span>
                
                <span>Fuel Used:</span>
                <span className="text-right font-medium">{result.fuelUsedLiters.toFixed(2)} L</span>
                
                <span>CO2 Emissions (g):</span>
                <span className="text-right font-medium">{result.carbonEmissions.carbon_g.toFixed(2)} g</span>
                
                <span>CO2 Emissions (kg):</span>
                <span className="text-right font-medium">{result.carbonEmissions.carbon_kg.toFixed(2)} kg</span>
                
                <span>CO2 Emissions (lb):</span>
                <span className="text-right font-medium">{result.carbonEmissions.carbon_lb.toFixed(2)} lb</span>
                
                <span>CO2 Emissions (mt):</span>
                <span className="text-right font-medium">{result.carbonEmissions.carbon_mt.toFixed(4)} mt</span>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default FuelEfficiencyCalculator;
