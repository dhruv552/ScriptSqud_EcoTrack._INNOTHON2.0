import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Car, Utensils, Lightbulb, Leaf, ChevronRight, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  icon?: React.ReactNode;
}

interface RecommendationsPanelProps {
  transportationRecommendations?: RecommendationItem[];
  foodRecommendations?: RecommendationItem[];
  energyRecommendations?: RecommendationItem[];
}

// Default recommendation when data is reset
const resetRecommendation: RecommendationItem = {
  id: "reset",
  title: "Start tracking your carbon footprint",
  description:
    "Begin by entering your transportation, food, and energy usage data to get personalized recommendations.",
  impact: "high",
  icon: <RefreshCw size={18} />,
};

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  transportationRecommendations = [
    {
      id: "t1",
      title: "Use public transportation",
      description:
        "Taking the bus or train can reduce your carbon emissions by up to 70% compared to driving alone.",
      impact: "high",
      icon: <Car size={18} />,
    },
    {
      id: "t2",
      title: "Carpool when possible",
      description:
        "Sharing rides with others can significantly reduce per-person emissions and traffic congestion.",
      impact: "medium",
      icon: <Car size={18} />,
    },
    {
      id: "t3",
      title: "Consider biking for short trips",
      description:
        "For distances under 5 miles, biking produces zero emissions and improves your health.",
      impact: "high",
      icon: <Car size={18} />,
    },
  ],
  foodRecommendations = [
    {
      id: "f1",
      title: "Reduce meat consumption",
      description:
        "Try having 1-2 meat-free days per week to lower your carbon footprint significantly.",
      impact: "high",
      icon: <Utensils size={18} />,
    },
    {
      id: "f2",
      title: "Buy local produce",
      description:
        "Food that travels shorter distances requires less transportation and produces fewer emissions.",
      impact: "medium",
      icon: <Utensils size={18} />,
    },
    {
      id: "f3",
      title: "Minimize food waste",
      description:
        "Plan meals ahead and properly store leftovers to reduce the environmental impact of wasted food.",
      impact: "medium",
      icon: <Utensils size={18} />,
    },
  ],
  energyRecommendations = [
    {
      id: "e1",
      title: "Switch to LED lighting",
      description:
        "LED bulbs use up to 80% less energy than traditional incandescent bulbs and last much longer.",
      impact: "medium",
      icon: <Lightbulb size={18} />,
    },
    {
      id: "e2",
      title: "Unplug electronics when not in use",
      description:
        "Many devices consume power even when turned off. Unplugging them can save energy and money.",
      impact: "low",
      icon: <Lightbulb size={18} />,
    },
    {
      id: "e3",
      title: "Adjust thermostat settings",
      description:
        "Lowering your heating by 1°C can reduce energy usage by up to 10% and save on carbon emissions.",
      impact: "high",
      icon: <Lightbulb size={18} />,
    },
  ],
}) => {
  const [isReset, setIsReset] = useState(false);

  useEffect(() => {
    // Check if data has been reset from localStorage flag
    const currentUser = sessionStorage.getItem("currentUser");
    if (currentUser) {
      const resetFlag = localStorage.getItem(`${currentUser}_dataReset`);
      setIsReset(resetFlag === 'true');
    } else {
      // Fallback check for reset status based on recommendations
      setIsReset(
        transportationRecommendations.length === 0 &&
          foodRecommendations.length === 0 &&
          energyRecommendations.length === 0
      );
    }
  }, [
    transportationRecommendations,
    foodRecommendations,
    energyRecommendations,
  ]);

  const getImpactColor = (impact: "high" | "medium" | "low") => {
    switch (impact) {
      case "high":
        return "bg-green-500 hover:bg-green-600";
      case "medium":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "low":
        return "bg-blue-500 hover:bg-blue-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const renderRecommendationItem = (
    item: RecommendationItem,
    index: number,
  ) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="mb-4 last:mb-0"
    >
      <Card
        className="bg-card hover:bg-card/90 transition-colors border-l-4"
        style={{
          borderLeftColor:
            item.impact === "high"
              ? "#22c55e"
              : item.impact === "medium"
                ? "#eab308"
                : "#3b82f6",
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                {item.icon || <Leaf size={18} />}
              </div>
              <div>
                <h4 className="font-medium text-sm">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.description}
                </p>
              </div>
            </div>
            <Badge
              className={`${getImpactColor(item.impact)} text-white text-xs`}
            >
              {item.impact} impact
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Card className="w-full h-full bg-background shadow-lg border-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Recommendations</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Personalized suggestions to reduce your carbon footprint
            </CardDescription>
          </div>
          <motion.div
            whileHover={{ rotate: 45 }}
            className="p-2 rounded-full bg-primary/10 text-primary"
          >
            <Leaf size={20} />
          </motion.div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4 pb-2">
        <Tabs defaultValue="transportation" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger
              value="transportation"
              className="flex items-center gap-2"
            >
              <Car size={16} />
              <span className="hidden sm:inline">Transport</span>
            </TabsTrigger>
            <TabsTrigger value="food" className="flex items-center gap-2">
              <Utensils size={16} />
              <span className="hidden sm:inline">Food</span>
            </TabsTrigger>
            <TabsTrigger value="energy" className="flex items-center gap-2">
              <Lightbulb size={16} />
              <span className="hidden sm:inline">Energy</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="transportation"
            className="space-y-4 max-h-[350px] overflow-y-auto pr-1"
          >
            {isReset
              ? renderRecommendationItem(resetRecommendation, 0)
              : transportationRecommendations.map((item, index) =>
                  renderRecommendationItem(item, index),
                )}
          </TabsContent>

          <TabsContent
            value="food"
            className="space-y-4 max-h-[350px] overflow-y-auto pr-1"
          >
            {isReset
              ? renderRecommendationItem(resetRecommendation, 0)
              : foodRecommendations.map((item, index) =>
                  renderRecommendationItem(item, index),
                )}
          </TabsContent>

          <TabsContent
            value="energy"
            className="space-y-4 max-h-[350px] overflow-y-auto pr-1"
          >
            {isReset
              ? renderRecommendationItem(resetRecommendation, 0)
              : energyRecommendations.map((item, index) =>
                  renderRecommendationItem(item, index),
                )}
          </TabsContent>
        </Tabs>

        <div className="mt-4 pt-2 border-t border-border">
          <motion.button
            whileHover={{ x: 5 }}
            className="text-sm text-primary flex items-center gap-1 hover:underline w-full justify-end"
          >
            View all recommendations <ChevronRight size={16} />
          </motion.button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationsPanel;
