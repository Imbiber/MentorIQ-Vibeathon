import Link from 'next/link'
import { 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  Star, 
  ArrowRight, 
  Play, 
  Sparkles,
  Users,
  BarChart3,
  Mic,
  Calendar,
  CheckCircle,
  Globe,
  Layers,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AuthGate } from '@/components/auth/AuthGate'

export default function HomePage() {
  return (
    <AuthGate>
      <div className="min-h-screen bg-background">
        
        {/* Hero Section */}
        <section className="section-padding relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          
          <div className="container-custom text-center relative z-10">
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
              MentorIQ AI turns professional development conversations into trackable, 
              implementable action plans. Finally bridge the gap between advice and action.
            </p>

            {/* Problem Statement */}
            <div className="glass p-8 mb-12 max-w-3xl mx-auto rounded-2xl">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-accent/20 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6 text-accent-dark" />
                </div>
              </div>
              <p className="text-lg font-medium mb-2">The $366B Professional Development Problem</p>
              <p className="text-muted-foreground">
                77% of mentoring conversations result in zero behavior change. 
                Great advice gets lost in good intentions.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link href="/upload">
                <Button size="lg" className="btn-hero text-lg px-8 py-6">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </Link>
            </div>

            {/* Hero Visualization */}
            <div className="relative max-w-6xl mx-auto">
              <div className="glass rounded-3xl p-8 card-hover">
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
                    <div className="text-2xl font-bold text-destructive">23%</div>
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
                    <div className="text-2xl font-bold text-secondary">87%</div>
                    <p className="text-sm text-muted-foreground">Implementation Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section-padding bg-background">
          <div className="container-custom">
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
              {[
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
                  icon: Sparkles,
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
                }
              ].map((feature, index) => (
                <Card 
                  key={index} 
                  className="group relative border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden card-hover"
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <CardContent className="relative p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="section-padding bg-surface/50">
          <div className="container-custom">
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
              {[
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
                  icon: Zap,
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
              ].map((stat, index) => (
                <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
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

        {/* Final CTA */}
        <section className="section-padding">
          <div className="container-custom max-w-4xl text-center">
            <div className="glass p-12 rounded-3xl card-hover">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to <span className="gradient-text">Transform Your Growth?</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Join the behavior change revolution. Turn insights into action, 
                action into habits, habits into exponential success.
              </p>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <Link href="/upload">
                  <Button size="lg" className="btn-hero text-xl px-12 py-6">
                    <Sparkles className="mr-3 h-6 w-6" />
                    Start Your Journey
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </Link>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-5 h-5" />
                  <span>Free 30-day trial • No credit card required</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AuthGate>
  )
}