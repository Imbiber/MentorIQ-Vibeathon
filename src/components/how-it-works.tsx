import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Brain, Target, BarChart3, ArrowRight } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      icon: Mic,
      title: "Record Your Conversation",
      description: "Upload audio or video from mentoring sessions, coaching calls, or team meetings. Support for all major formats.",
      features: ["Drag & drop upload", "Audio/video support", "Privacy protected"],
      color: "primary"
    },
    {
      step: "02",
      icon: Brain,
      title: "AI Extracts Insights",
      description: "Our AI analyzes the conversation to identify actionable advice, patterns, and opportunities for growth.",
      features: ["Pattern recognition", "Confidence scoring", "Context understanding"],
      color: "accent"
    },
    {
      step: "03",
      icon: Target,
      title: "Generate Action Plans",
      description: "Convert insights into specific, time-bound actions with implementation strategies based on behavior science.",
      features: ["SMART goals", "Implementation intentions", "Difficulty assessment"],
      color: "secondary"
    },
    {
      step: "04",
      icon: BarChart3,
      title: "Track & Optimize",
      description: "Monitor progress, build habits, and receive AI-powered recommendations for continuous improvement.",
      features: ["Progress tracking", "Habit formation", "Success prediction"],
      color: "primary"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            How It Works
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            From Conversation to
            <span className="gradient-text"> Transformation</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our AI-powered platform transforms the way you extract value from professional development conversations
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <Card 
              key={index} 
              className="group relative border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${
                step.color === 'primary' ? 'from-primary/5 to-primary/10' :
                step.color === 'secondary' ? 'from-secondary/5 to-secondary/10' :
                'from-accent/5 to-accent/10'
              } opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <CardHeader className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`text-6xl font-bold ${
                    step.color === 'primary' ? 'text-primary/20' :
                    step.color === 'secondary' ? 'text-secondary/20' :
                    'text-accent/20'
                  }`}>
                    {step.step}
                  </div>
                  <div className={`p-4 rounded-2xl ${
                    step.color === 'primary' ? 'bg-primary/10' :
                    step.color === 'secondary' ? 'bg-secondary/10' :
                    'bg-accent/10'
                  }`}>
                    <step.icon className={`w-8 h-8 ${
                      step.color === 'primary' ? 'text-primary' :
                      step.color === 'secondary' ? 'text-secondary' :
                      'text-accent-dark'
                    }`} />
                  </div>
                </div>
                <CardTitle className="text-2xl mb-4">{step.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="relative">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {step.description}
                </p>
                
                <div className="space-y-2">
                  {step.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <ArrowRight className={`w-4 h-4 ${
                        step.color === 'primary' ? 'text-primary' :
                        step.color === 'secondary' ? 'text-secondary' :
                        'text-accent-dark'
                      }`} />
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;