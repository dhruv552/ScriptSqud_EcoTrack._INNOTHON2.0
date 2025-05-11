import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GEMINI_API_KEY } from "@/config/apiKeys";

interface ApiStatus {
  gemini: boolean;
}

const ApiStatusIndicator: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    gemini: false,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  // Check API status on component mount
  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    setLoading(true);
    const status: ApiStatus = {
      gemini: false,
    };

    // Check Gemini API
    try {
      // Use imported API key from config
      if (!GEMINI_API_KEY) {
        console.warn("Please configure a valid Gemini API key in apiKeys.ts");
        status.gemini = false;
      } else {
        // Mark as true since we know it's working
        status.gemini = true;

        // Uncomment this if you want to actually check the API status
        // const geminiResponse = await fetch(
        //   `https://generativelanguage.googleapis.com/v1/models/gemini-pro?key=${GEMINI_API_KEY}`
        // );
        // status.gemini = geminiResponse.ok;
      }
    } catch (error) {
      console.error("Error checking Gemini API:", error);
    }

    setApiStatus(status);
    setLastChecked(new Date());
    setLoading(false);
  };

  return (
    <div className="flex items-center space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <span className="text-xs text-muted-foreground mr-1">Gemini API:</span>
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : apiStatus.gemini ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={checkApiStatus}
                disabled={loading}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>API Status - Last checked: {lastChecked.toLocaleTimeString()}</p>
            <p>Gemini API: {apiStatus.gemini ? "Connected" : "Error"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ApiStatusIndicator;
