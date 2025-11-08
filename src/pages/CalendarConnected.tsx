import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, ArrowRight } from "lucide-react";

const CalendarConnected = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Show success for a moment, then redirect
    const timer = setTimeout(() => {
      navigate('/upload');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Google Calendar Connected!</CardTitle>
          <CardDescription>
            Your calendar is now connected to MentorIQ. We can automatically schedule your action items.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium text-green-800">Integration Active</span>
            </div>
            <p className="text-sm text-green-700">
              Action items from your meeting analysis will be automatically added to your calendar.
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/upload')} 
            className="w-full"
            size="lg"
          >
            Start Processing Meetings
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4">
            Redirecting automatically in 3 seconds...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarConnected;