import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, Car } from "lucide-react";

interface HeroBannerProps {
  onExploreClick?: () => void;
  onJoinWaitlistClick?: () => void;
}

const HeroBanner = ({
  onExploreClick = () => {},
  onJoinWaitlistClick = () => {},
}: HeroBannerProps) => {
  return (
    <div className="relative w-full h-[600px] bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-green-100 dark:bg-green-900/30 opacity-30"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-1/4 bottom-1/4 w-32 h-32 rounded-full bg-green-200 dark:bg-green-800/20 opacity-20"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="container mx-auto h-full flex flex-col lg:flex-row items-center justify-between px-4 py-12 relative z-10">
        {/* Left content - Text and CTAs */}
        <div className="w-full lg:w-1/2 text-center lg:text-left mb-10 lg:mb-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-4">
              Drive Green. <span className="text-green-600 dark:text-green-400">Ride Smart.</span>{" "}
              Track Your Carbon Footprint.
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0">
              An intelligent ride-sharing platform rewarding eco-friendly
              choices — for drivers and passengers alike.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                onClick={onExploreClick}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Explore Features
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onJoinWaitlistClick}
                className="border-green-600 text-green-600 dark:border-green-500 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
              >
                Join Waitlist
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Right content - Illustration */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px] bg-white dark:bg-gray-800 rounded-full shadow-xl dark:shadow-gray-900/50 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-800/20 opacity-70"></div>
              </div>

              {/* Animated car */}
              <motion.div
                className="absolute"
                animate={{
                  rotate: [0, 360],
                  y: [0, -10, 0],
                }}
                transition={{
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                <div className="relative">
                  <Car className="h-16 w-16 text-green-600 dark:text-green-400" />
                  <div className="absolute -top-4 -right-2">
                    <Leaf className="h-8 w-8 text-green-500 dark:text-green-300" />
                  </div>
                </div>
              </motion.div>

              {/* Carbon meter */}
              <motion.div
                className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-48 h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                initial={{ width: "48px" }}
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-green-300 to-green-500 dark:from-green-500 dark:to-green-300"
                  animate={{ width: ["10%", "70%", "40%"] }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-200">
                  Carbon Footprint
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
