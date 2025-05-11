import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Car, Users, Award, Gift, Leaf, Zap } from "lucide-react";

interface RewardBadge {
  name: string;
  icon: React.ReactNode;
  description: string;
  level: number;
  maxLevel: number;
}

interface PointsCategory {
  name: string;
  points: number;
  icon: React.ReactNode;
  description: string;
}

const DriverRewards = () => {
  // Default data for the component
  const pointsCategories: PointsCategory[] = [
    {
      name: "EV Rides",
      points: 5,
      icon: <Zap className="h-6 w-6 text-green-500 dark:text-green-400" />,
      description: "Points per kilometer for electric vehicle rides",
    },
    {
      name: "Shared Rides",
      points: 3,
      icon: <Users className="h-6 w-6 text-blue-500 dark:text-blue-400" />,
      description: "Points per kilometer for shared/carpool rides",
    },
    {
      name: "Low CO₂ Rides",
      points: 2,
      icon: <Leaf className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />,
      description: "Bonus points for maintaining low emissions",
    },
  ];

  const badges: RewardBadge[] = [
    {
      name: "EV Warrior",
      icon: <Car className="h-6 w-6 text-green-500 dark:text-green-400" />,
      description: "Complete 50 EV rides",
      level: 3,
      maxLevel: 5,
    },
    {
      name: "Carpool Hero",
      icon: <Users className="h-6 w-6 text-blue-500 dark:text-blue-400" />,
      description: "Complete 30 shared rides",
      level: 2,
      maxLevel: 5,
    },
    {
      name: "Green Leader",
      icon: <Award className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />,
      description: "Maintain low CO₂ for 3 months",
      level: 4,
      maxLevel: 5,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-green-50 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Driver Rewards System
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Earn points and unlock rewards for every eco-friendly ride you
            complete. The greener you drive, the more you earn!
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {pointsCategories.map((category, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full border-2 border-green-100 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300 dark:bg-gray-800">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="p-3 bg-green-50 dark:bg-green-900/40 rounded-full">
                      {category.icon}
                    </div>
                    <Badge
                      variant="outline"
                      className="text-lg font-bold bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-800"
                    >
                      {category.points} pts/km
                    </Badge>
                  </div>
                  <CardTitle className="mt-4 text-xl dark:text-white">
                    {category.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Earn up to {category.points * 20} points daily with regular{" "}
                    {category.name.toLowerCase()}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="mb-16">
          <motion.h3
            className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Unlock Achievement Badges
          </motion.h3>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {badges.map((badge, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="text-center border-2 border-green-100 dark:border-green-800 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all duration-300 dark:bg-gray-800">
                  <CardHeader>
                    <div className="mx-auto p-4 bg-green-50 dark:bg-green-900/40 rounded-full w-20 h-20 flex items-center justify-center">
                      {badge.icon}
                    </div>
                    <CardTitle className="mt-4 dark:text-white">{badge.name}</CardTitle>
                    <CardDescription className="dark:text-gray-300">{badge.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      Level {badge.level}/{badge.maxLevel}
                    </div>
                    <Progress
                      value={(badge.level / badge.maxLevel) * 100}
                      className="h-2"
                    />
                    <div className="mt-4 flex justify-center">
                      {Array.from({ length: badge.maxLevel }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 mx-1 rounded-full ${
                            i < badge.level 
                              ? "bg-green-500" 
                              : "bg-gray-200 dark:bg-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="bg-green-100 dark:bg-green-900/30 rounded-xl p-8 text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
            <Gift className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
            Ready to Start Earning?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Join our Eco Driver Program today and start earning rewards for
            every green mile you drive. Convert your points to discounts,
            credits, or donate them to environmental causes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Join Eco Driver Program
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-green-600 text-green-600 dark:border-green-500 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
            >
              Learn More
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DriverRewards;
