import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, Trash2 } from "lucide-react";

interface SavedRecommendation {
  date: string;
  content: string;
}

const SavedRecommendationsDialog: React.FC = () => {
  const [savedRecommendations, setSavedRecommendations] = useState<SavedRecommendation[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Load saved recommendations when the dialog opens
  useEffect(() => {
    if (dialogOpen) {
      loadSavedRecommendations();
    }
  }, [dialogOpen]);

  const loadSavedRecommendations = () => {
    const currentUser = sessionStorage.getItem("currentUser");
    if (currentUser) {
      const savedRecs = JSON.parse(
        localStorage.getItem(`${currentUser}_savedRecommendations`) || "[]"
      );
      setSavedRecommendations(savedRecs);
    }
  };

  const deleteSavedRecommendation = (index: number) => {
    const currentUser = sessionStorage.getItem("currentUser");
    if (currentUser) {
      const newRecs = [...savedRecommendations];
      newRecs.splice(index, 1);
      localStorage.setItem(
        `${currentUser}_savedRecommendations`,
        JSON.stringify(newRecs)
      );
      setSavedRecommendations(newRecs);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-green-600 text-green-700 hover:bg-green-50">
          <History className="mr-1 h-4 w-4" />
          View History
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Saved Carbon Reduction Recommendations</DialogTitle>
          <DialogDescription>
            Your history of personalized carbon reduction recommendations from Gemini AI
          </DialogDescription>
        </DialogHeader>
        {savedRecommendations.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <History className="mx-auto h-12 w-12 opacity-30 mb-3" />
            <p>You haven't saved any recommendations yet</p>
            <p className="text-sm mt-2">
              Generate some AI recommendations and click "Save" to store them here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[60vh]">
            <Tabs defaultValue="newest" className="w-full">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="newest" className="flex-1">Newest First</TabsTrigger>
                <TabsTrigger value="oldest" className="flex-1">Oldest First</TabsTrigger>
              </TabsList>

              <TabsContent value="newest" className="space-y-4">
                {[...savedRecommendations].reverse().map((rec, index) => (
                  <div key={`newest-${index}`} className="border rounded-lg p-4 relative">
                    <div className="text-xs text-muted-foreground mb-2">
                      {formatDate(rec.date)}
                    </div>
                    <div className="whitespace-pre-line text-sm prose prose-sm dark:prose-invert max-w-none">
                      {rec.content.includes("1.") ? (
                        <div dangerouslySetInnerHTML={{
                          __html: rec.content
                            .replace(/(\d+\.)/g, '<strong class="text-green-600">$1</strong>')
                            .replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-green-700">$1</span>')
                            .replace(/Recommendation (\d+):/g, '<h3 class="text-md font-semibold border-b pb-1 text-green-700">Recommendation $1:</h3>')
                            .split('\n').join('<br />')
                        }} />
                      ) : (
                        rec.content
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSavedRecommendation(savedRecommendations.length - 1 - index)}
                      className="absolute top-2 right-2 text-red-500 h-7 w-7 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="oldest" className="space-y-4">
                {savedRecommendations.map((rec, index) => (
                  <div key={`oldest-${index}`} className="border rounded-lg p-4 relative">
                    <div className="text-xs text-muted-foreground mb-2">
                      {formatDate(rec.date)}
                    </div>
                    <div className="whitespace-pre-line text-sm prose prose-sm dark:prose-invert max-w-none">
                      {rec.content.includes("1.") ? (
                        <div dangerouslySetInnerHTML={{
                          __html: rec.content
                            .replace(/(\d+\.)/g, '<strong class="text-green-600">$1</strong>')
                            .replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-green-700">$1</span>')
                            .replace(/Recommendation (\d+):/g, '<h3 class="text-md font-semibold border-b pb-1 text-green-700">Recommendation $1:</h3>')
                            .split('\n').join('<br />')
                        }} />
                      ) : (
                        rec.content
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSavedRecommendation(index)}
                      className="absolute top-2 right-2 text-red-500 h-7 w-7 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SavedRecommendationsDialog;
