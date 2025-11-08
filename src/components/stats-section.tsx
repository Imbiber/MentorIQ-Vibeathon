import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Clock, Target } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: TrendingUp,
      value: "85%",
      label: "Implementation Rate",
      description: "Of users complete their action plans",
      color: "text-secondary"
    },
    {
      icon: Users,
      value: "10,000+",
      label: "Conversations Analyzed",
      description: "Across leading organizations",
      color: "text-primary"
    },
    {
      icon: Clock,
      value: "15min",
      label: "Average Processing Time",
      description: "From recording to action plan",
      color: "text-accent-dark"
    },
    {
      icon: Target,
      value: "3.2x",
      label: "Faster Behavior Change",
      description: "Compared to traditional methods",
      color: "text-secondary"
    }
  ];

  return (
    <section className="py-20 bg-surface/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Proven Results Across
            <span className="gradient-text"> Leading Organizations</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join companies that have transformed their professional development with data-driven insights
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 p-4 rounded-2xl">
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </div>
                <div className={`text-4xl font-bold mb-2 ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-lg font-semibold mb-2">
                  {stat.label}
                </div>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 text-center">
          <p className="text-sm text-muted-foreground mb-8">
            Trusted by professionals at leading companies
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            {["Microsoft", "Google", "Meta", "Apple", "Amazon", "Tesla"].map((company, index) => (
              <div key={index} className="text-lg font-semibold text-muted-foreground">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;