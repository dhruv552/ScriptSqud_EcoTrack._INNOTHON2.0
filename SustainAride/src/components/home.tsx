import HeroBanner from "./HeroBanner";
import FeatureCards from "./FeatureCards";
import HowItWorks from "./HowItWorks";
import DriverRewards from "./DriverRewards";
import { ThemeToggle } from "./theme/theme-toggle";

function Home() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <HeroBanner />
      <FeatureCards />
      <HowItWorks />
      <DriverRewards />
    </div>
  );
}

export default Home;
