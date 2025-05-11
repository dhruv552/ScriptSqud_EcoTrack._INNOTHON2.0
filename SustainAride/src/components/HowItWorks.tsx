import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Car, BarChart2, Award, Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  stepNumber: number;
}

const Step = (
  { icon, title, description, stepNumber }: StepProps = {
    icon: <Car />,
    title: "Take a Ride",
    description: "Choose an EV or shared ride option for your journey.",
    stepNumber: 1,
  },
) => {
  return (
    <div className="flex flex-col items-center text-center max-w-[250px] bg-white dark:bg-gray-800">
      <div className="relative mb-4">
        <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400">
          {icon}
        </div>
        <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
          {stepNumber}
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
    </div>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      icon: <Car className="h-6 w-6" />,
      title: "Take a Ride",
      description: "Choose an EV or shared ride option for your journey.",
      stepNumber: 1,
    },
    {
      icon: <BarChart2 className="h-6 w-6" />,
      title: "Track Carbon Savings",
      description:
        "Our app automatically calculates your CO₂ savings compared to regular rides.",
      stepNumber: 2,
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Earn Green Points",
      description:
        "Collect points based on your eco-friendly transportation choices.",
      stepNumber: 3,
    },
    {
      icon: <Gift className="h-6 w-6" />,
      title: "Redeem Rewards",
      description:
        "Use your points for discounts, perks, or donate to environmental causes.",
      stepNumber: 4,
    },
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>
          <motion.p
            className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Join our eco-friendly ride-sharing platform in four simple steps and
            start making a positive impact on the environment.
          </motion.p>
        </div>

        <div className="relative">
          {/* Desktop connector line */}
          <div className="hidden md:block absolute top-24 left-1/2 h-0.5 bg-green-200 dark:bg-green-800 w-[80%] -translate-x-1/2 z-0" />

          {/* Steps */}
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-10 md:gap-4 relative z-10">
            {steps.map((step, index) => (
              <React.Fragment key={step.stepNumber}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Step
                    icon={step.icon}
                    title={step.title}
                    description={step.description}
                    stepNumber={step.stepNumber}
                  />
                </motion.div>

                {index < steps.length - 1 && (
                  <div className="md:hidden">
                    <ArrowRight className="text-green-400 h-6 w-6 rotate-90" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="inline-block bg-green-50 border-green-100 dark:bg-green-900/30 dark:border-green-800">
            <CardContent className="p-6">
              <p className="text-green-800 dark:text-green-300 font-medium">
                Every ride with EcoTrack helps reduce carbon emissions and
                contributes to a healthier planet.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
