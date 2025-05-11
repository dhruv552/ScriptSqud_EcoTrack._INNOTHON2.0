import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addMonths, subMonths } from "date-fns";

interface EmissionData {
  date: Date;
  total: number;
  transportation: number;
  food: number;
  energy: number;
  improvement?: boolean;
}

interface CalendarViewProps {
  emissionData?: EmissionData[];
  onDateSelect?: (date: Date) => void;
}

const CalendarView = ({
  emissionData = generateMockData(),
  onDateSelect = () => {},
}: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("daily");

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onDateSelect(date);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const getEmissionForDate = (
    date: Date | undefined,
  ): EmissionData | undefined => {
    if (!date) return undefined;
    return emissionData.find(
      (data) =>
        data.date.getDate() === date.getDate() &&
        data.date.getMonth() === date.getMonth() &&
        data.date.getFullYear() === date.getFullYear(),
    );
  };

  const selectedDayData = getEmissionForDate(selectedDate);

  // Function to determine the color of the day based on emission level
  const getDayColor = (day: Date): string => {
    const data = getEmissionForDate(day);
    if (!data) return "";

    if (data.total < 10) return "bg-green-500/20 text-green-500 font-bold";
    if (data.total < 20) return "bg-yellow-500/20 text-yellow-500 font-bold";
    return "bg-red-500/20 text-red-500 font-bold";
  };

  return (
    <div className="w-full h-full bg-background p-6 rounded-xl">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">
            Carbon Footprint History
          </h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-md font-medium">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 lg:col-span-2">
            <CardContent className="pt-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                month={currentMonth}
                className="rounded-md border"
                modifiers={{
                  improvement: (date) => {
                    const data = getEmissionForDate(date);
                    return !!data?.improvement;
                  },
                }}
                modifiersStyles={{
                  improvement: { border: "2px solid #10b981" },
                }}
                styles={{
                  day: (date) => ({
                    className: getDayColor(date),
                  }),
                }}
              />
              <div className="flex justify-center mt-4 space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm">Low Emissions</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-sm">Medium Emissions</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm">High Emissions</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full border-2 border-green-500 mr-2"></div>
                  <span className="text-sm">Improvement</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {selectedDate
                  ? format(selectedDate, "MMMM d, yyyy")
                  : "Select a date"}
                <CalendarIcon className="ml-2 h-5 w-5 text-muted-foreground" />
              </CardTitle>
              <CardDescription>
                {selectedDayData ? (
                  <div className="flex items-center">
                    <span>Total Emissions: {selectedDayData.total} kg CO₂</span>
                    {selectedDayData.improvement ? (
                      <Badge className="ml-2 bg-green-500" variant="secondary">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        Improved
                      </Badge>
                    ) : (
                      <Badge className="ml-2 bg-red-500" variant="secondary">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Increased
                      </Badge>
                    )}
                  </div>
                ) : (
                  "No data available for this date"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDayData ? (
                <Tabs
                  defaultValue="daily"
                  value={activeTab}
                  onValueChange={setActiveTab}
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="daily">Daily</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  </TabsList>
                  <TabsContent value="daily" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex justify-between items-center p-3 bg-primary/10 rounded-md">
                        <span>Transportation</span>
                        <span className="font-bold">
                          {selectedDayData.transportation} kg CO₂
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-primary/10 rounded-md">
                        <span>Food Consumption</span>
                        <span className="font-bold">
                          {selectedDayData.food} kg CO₂
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-primary/10 rounded-md">
                        <span>Energy Usage</span>
                        <span className="font-bold">
                          {selectedDayData.energy} kg CO₂
                        </span>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="weekly" className="space-y-4 mt-4">
                    <div className="h-40 flex items-center justify-center bg-primary/5 rounded-md">
                      <p className="text-muted-foreground">
                        Weekly comparison chart would appear here
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="monthly" className="space-y-4 mt-4">
                    <div className="h-40 flex items-center justify-center bg-primary/5 rounded-md">
                      <p className="text-muted-foreground">
                        Monthly comparison chart would appear here
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="h-40 flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Select a date to view details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate mock data - checks if we're in reset mode
function generateMockData(): EmissionData[] {
  const today = new Date();
  const data: EmissionData[] = [];
  
  // Check if we should use zeroed data (after reset) or mock data
  const currentUser = sessionStorage.getItem("currentUser");
  const isDataReset = currentUser ? 
    localStorage.getItem(`${currentUser}_dataReset`) === 'true' : false;
  
  // Generate data for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Use zeroed data if reset flag is true
    const transportation = isDataReset ? 0 : Math.random() * 10 + 2;
    const food = isDataReset ? 0 : Math.random() * 5 + 1;
    const energy = isDataReset ? 0 : Math.random() * 8 + 3;
    const total = transportation + food + energy;

    data.push({
      date,
      total: parseFloat(total.toFixed(1)),
      transportation: parseFloat(transportation.toFixed(1)),
      food: parseFloat(food.toFixed(1)),
      energy: parseFloat(energy.toFixed(1)),
      improvement: isDataReset ? false : Math.random() > 0.5,
    });
  }

  return data;
}

export default CalendarView;
