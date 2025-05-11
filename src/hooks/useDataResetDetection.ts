import { useEffect, useState } from "react";

/**
 * This hook will detect changes to localStorage data that might indicate a reset
 * @param key The localStorage key to monitor for resets
 * @returns boolean indicating if data was reset
 */
export function useDataResetDetection(key: string) {
  const [dataReset, setDataReset] = useState(false);
  const [lastValue, setLastValue] = useState<string | null>(null);

  useEffect(() => {
    // Function to check if data has been reset
    const checkDataReset = () => {
      // Check for explicit reset flag first
      const currentUser = sessionStorage.getItem("currentUser") || "default_user";
      const resetFlag = localStorage.getItem(`${currentUser}_dataReset`);
      
      if (resetFlag === 'true') {
        setDataReset(true);
        return;
      }
      
      // Check if the app reset flag has been set
      const appReset = localStorage.getItem("appReset");
      if (appReset) {
        // If reset was within the last 5 seconds, consider data reset
        const resetTime = new Date(appReset).getTime();
        const now = new Date().getTime();
        if (now - resetTime < 5000) {
          setDataReset(true);
          return;
        }
      }
      
      // Regular check for data changes
      const currentValue = localStorage.getItem(key);
      
      // If we had a value before but now it's null or empty, data was reset
      if (lastValue && (!currentValue || currentValue === "{}" || currentValue === "[]")) {
        setDataReset(true);
      } else {
        setDataReset(false);
      }
      
      setLastValue(currentValue);
    };

    // Check immediately
    checkDataReset();

    // Set up storage event listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key || e.key === null || e.key === "appReset" || e.key?.includes("dataReset")) {
        checkDataReset();
      }
    };

    // Set up an interval to check periodically
    const intervalId = setInterval(checkDataReset, 1000);

    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, [key, lastValue]);

  return dataReset;
}
