import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Award, Calculator } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <Card className="bg-white dark:bg-gray-800 h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 mb-4">
          {icon}
        </div>
        <CardTitle className="dark:text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base dark:text-gray-300">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

const FeatureCards = () => {
  const features = [
    {
      icon: <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />,
      title: "Real-Time Carbon Tracking",
      description:
        "Monitor your carbon footprint in real-time with every ride you take. Watch as your eco-friendly choices make a positive impact.",
    },
    {
      icon: <Award className="w-6 h-6 text-green-600 dark:text-green-400" />,
      title: "Green Rewards System",
      description:
        "Earn points for eco-friendly rides that can be redeemed for discounts, credits, or even donations to environmental causes.",
    },
    {
      icon: <Calculator className="w-6 h-6 text-green-600 dark:text-green-400" />,
      title: "Smart CO₂ Calculator",
      description:
        "Our advanced algorithm calculates precise carbon savings based on distance, vehicle type, and occupancy rate.",
    },
  ];

  return (
    <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Key Features
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            EcoTrack helps you make a positive environmental impact with every
            ride while earning rewards for your eco-friendly choices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
