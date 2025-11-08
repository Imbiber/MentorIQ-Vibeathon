import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Mic, 
  Calendar, 
  BarChart3, 
  Lightbulb, 
  Zap,
  ArrowRight,
  Play,
  CheckCircle,
  Users,
  Clock,
  Sparkles
} from "lucide-react";
import HeroSection from "@/components/hero-section";
import FeatureGrid from "@/components/feature-grid";
import StatsSection from "@/components/stats-section";
import HowItWorks from "@/components/how-it-works";
import DemoSection from "@/components/demo-section";
import Navbar from "@/components/navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* How It Works */}
      <HowItWorks />
      
      {/* Feature Grid */}
      <FeatureGrid />
      
      {/* Demo Section */}
      <DemoSection />
      
      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your
              <span className="gradient-text"> Professional Growth?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of professionals who've turned advice into action with MentorIQ
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/upload">
                <Button size="lg" className="btn-hero text-lg px-8 py-6">
                  Upload Meeting Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Watch Demo
                <Play className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-surface border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">MentorIQ</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 MentorIQ. Turning conversations into transformation.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;