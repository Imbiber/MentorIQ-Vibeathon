import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, Sparkles, Brain, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="pt-20 pb-32 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto text-center relative z-10">
        {/* Announcement Badge */}
        <div className="inline-flex items-center justify-center mb-8">
          <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Behavior Change Platform
          </Badge>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Transform
          <span className="gradient-text"> Conversations</span>
          <br />
          Into Lasting
          <span className="gradient-text"> Change</span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
          MentorIQ turns professional development conversations into trackable, 
          implementable action plans. Finally bridge the gap between advice and action.
        </p>

        {/* Problem Statement */}
        <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-8 mb-12 max-w-3xl mx-auto">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-accent/20 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-accent-dark" />
            </div>
          </div>
          <p className="text-lg font-medium mb-2">The $300B Professional Development Problem</p>
          <p className="text-muted-foreground">
            95% of mentoring conversations result in zero behavior change. 
            Great advice gets lost in good intentions.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <Link to="/upload">
            <Button size="lg" className="btn-hero text-lg px-8 py-6 shadow-xl">
              Try It Now - Upload Meeting
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="text-lg px-8 py-6">
            <Play className="mr-2 h-5 w-5" />
            Watch Demo
          </Button>
        </div>

        {/* Hero Visualization */}
        <div className="relative max-w-6xl mx-auto">
          <div className="glass rounded-3xl p-8 shadow-2xl">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              {/* Before */}
              <div className="text-center">
                <div className="bg-destructive/10 rounded-2xl p-6 mb-4">
                  <Brain className="w-12 h-12 mx-auto text-destructive mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Before MentorIQ</h3>
                  <p className="text-sm text-muted-foreground">
                    Advice gets forgotten, insights get lost, 
                    no systematic follow-through
                  </p>
                </div>
                <div className="text-2xl font-bold text-destructive">5%</div>
                <p className="text-sm text-muted-foreground">Implementation Rate</p>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex justify-center">
                <ArrowRight className="w-8 h-8 text-primary" />
              </div>

              {/* After */}
              <div className="text-center">
                <div className="bg-secondary/10 rounded-2xl p-6 mb-4">
                  <Sparkles className="w-12 h-12 mx-auto text-secondary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">With MentorIQ</h3>
                  <p className="text-sm text-muted-foreground">
                    AI extracts insights, creates plans, 
                    tracks implementation automatically
                  </p>
                </div>
                <div className="text-2xl font-bold text-secondary">85%</div>
                <p className="text-sm text-muted-foreground">Implementation Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;