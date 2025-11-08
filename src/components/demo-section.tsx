import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Upload, 
  Brain, 
  Target, 
  BarChart3, 
  CheckCircle, 
  Clock,
  Mic,
  ArrowRight,
  Sparkles
} from "lucide-react";

const DemoSection = () => {
  const [activeStep, setActiveStep] = useState(0);

  const demoSteps = [
    {
      id: 0,
      title: "Upload Recording",
      description: "Drag and drop your meeting audio or video file",
      icon: Upload,
      status: "completed"
    },
    {
      id: 1,
      title: "AI Processing",
      description: "Advanced AI analyzes conversation for insights",
      icon: Brain,
      status: activeStep >= 1 ? "completed" : "pending"
    },
    {
      id: 2,
      title: "Generate Actions",
      description: "Creates specific, implementable action items",
      icon: Target,
      status: activeStep >= 2 ? "completed" : "pending"
    },
    {
      id: 3,
      title: "Track Progress",
      description: "Monitor implementation and behavior change",
      icon: BarChart3,
      status: activeStep >= 3 ? "completed" : "pending"
    }
  ];

  const sampleInsights = [
    {
      type: "High Priority Advice",
      title: "Implement Daily Stand-ups",
      confidence: 92,
      quote: "You should start having quick daily check-ins with your team...",
      action: "Schedule 15-minute daily team meetings at 9 AM",
      timeline: "Start Monday"
    },
    {
      type: "Learning Opportunity", 
      title: "Improve Delegation Skills",
      confidence: 88,
      quote: "I notice you're taking on too much yourself...",
      action: "Complete online delegation course and practice with 2 tasks",
      timeline: "2 weeks"
    },
    {
      type: "Behavior Pattern",
      title: "Time Management Focus",
      confidence: 85,
      quote: "Time blocking could really help with your productivity...",
      action: "Implement time blocking system using calendar",
      timeline: "This week"
    }
  ];

  return (
    <section id="demo" className="py-24 px-4 bg-surface/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Play className="w-4 h-4 mr-2" />
            Live Demo
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            See MentorTrack AI
            <span className="gradient-text"> In Action</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Watch how a simple mentoring conversation transforms into a comprehensive action plan
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Demo Process Visualization */}
          <Card className="mb-12 border-0 shadow-xl">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-4">Processing Pipeline</CardTitle>
              <div className="flex justify-center items-center gap-4 overflow-x-auto pb-4">
                {demoSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div 
                      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        step.status === "completed" 
                          ? "bg-secondary/10 border-2 border-secondary/20" 
                          : "bg-muted/50"
                      }`}
                      onClick={() => setActiveStep(step.id)}
                    >
                      <div className={`p-2 rounded-lg ${
                        step.status === "completed" 
                          ? "bg-secondary text-white" 
                          : "bg-muted-foreground/20"
                      }`}>
                        {step.status === "completed" ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <step.icon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="text-left min-w-0">
                        <div className="font-semibold text-sm">{step.title}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {step.description}
                        </div>
                      </div>
                    </div>
                    {index < demoSteps.length - 1 && (
                      <ArrowRight className="w-5 h-5 text-muted-foreground mx-2" />
                    )}
                  </div>
                ))}
              </div>
            </CardHeader>
          </Card>

          {/* Demo Results */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Original Audio Context */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Mic className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Sample Mentoring Session</CardTitle>
                    <p className="text-sm text-muted-foreground">28-minute career development conversation</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-2">Participants</p>
                  <p className="font-medium">Sarah Chen (Mentee) & David Rodriguez (Senior Manager)</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-2">Key Topics Discussed</p>
                  <div className="space-y-1">
                    <Badge variant="outline" className="mr-2">Time Management</Badge>
                    <Badge variant="outline" className="mr-2">Team Leadership</Badge>
                    <Badge variant="outline" className="mr-2">Career Growth</Badge>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <Play className="w-4 h-4 mr-2" />
                  Play Sample Audio
                </Button>
              </CardContent>
            </Card>

            {/* Generated Insights */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-secondary/10 rounded-xl">
                    <Sparkles className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <CardTitle>Generated Insights & Actions</CardTitle>
                    <p className="text-sm text-muted-foreground">Processed in 2 minutes 14 seconds</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {sampleInsights.map((insight, index) => (
                  <div key={index} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {insight.type}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {insight.confidence}% confidence
                      </div>
                    </div>
                    <h4 className="font-semibold mb-2">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground italic mb-3">
                      "{insight.quote}"
                    </p>
                    <div className="bg-secondary/5 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Action Plan:</p>
                      <p className="text-sm">{insight.action}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{insight.timeline}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Demo CTA */}
          <div className="text-center mt-16">
            <Card className="inline-block border-0 shadow-lg bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">
                  Ready to try it with your own conversations?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Upload your first recording and see the magic happen
                </p>
                <Button size="lg" className="btn-hero">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;