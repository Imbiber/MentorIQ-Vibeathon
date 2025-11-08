import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Calendar, 
  TrendingUp, 
  Shield, 
  Zap, 
  Users,
  Target,
  BarChart3,
  Lightbulb,
  Clock,
  CheckCircle,
  Sparkles
} from "lucide-react";

const FeatureGrid = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Advanced natural language processing extracts actionable insights from any conversation with 95% accuracy.",
      badge: "AI Core",
      gradient: "from-primary/10 to-primary/5"
    },
    {
      icon: Target,
      title: "Smart Action Planning",
      description: "Convert insights into specific, measurable actions using proven behavior science frameworks.",
      badge: "Behavior Science",
      gradient: "from-secondary/10 to-secondary/5"
    },
    {
      icon: Calendar,
      title: "Calendar Integration",
      description: "Automatically schedule implementation events and track progress through your existing calendar.",
      badge: "Automation",
      gradient: "from-accent/10 to-accent/5"
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      description: "Visualize behavior change patterns and predict success with comprehensive progress tracking.",
      badge: "Analytics",
      gradient: "from-primary/10 to-primary/5"
    },
    {
      icon: Lightbulb,
      title: "Pattern Recognition",
      description: "Identify recurring themes and growth opportunities across multiple conversations.",
      badge: "Intelligence",
      gradient: "from-secondary/10 to-secondary/5"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption and privacy controls ensure your sensitive conversations stay protected.",
      badge: "Security",
      gradient: "from-accent/10 to-accent/5"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share insights and track collective progress across your organization's development goals.",
      badge: "Collaboration",
      gradient: "from-primary/10 to-primary/5"
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      description: "Get insights and action plans within minutes of uploading your conversation recordings.",
      badge: "Speed",
      gradient: "from-secondary/10 to-secondary/5"
    },
    {
      icon: CheckCircle,
      title: "Implementation Coaching",
      description: "Receive personalized recommendations and reminders to maximize your follow-through rate.",
      badge: "Coaching",
      gradient: "from-accent/10 to-accent/5"
    }
  ];

  return (
    <section id="features" className="py-24 px-4 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Platform Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need to
            <span className="gradient-text"> Transform Advice into Action</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Powerful AI capabilities combined with behavior science to ensure your professional development conversations create lasting change
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group relative border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <CardHeader className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative">
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Set up in under 5 minutes</span>
            <span>•</span>
            <CheckCircle className="w-4 h-4" />
            <span>No technical expertise required</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;