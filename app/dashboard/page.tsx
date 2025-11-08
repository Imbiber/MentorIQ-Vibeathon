'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Calendar, Brain, Target, Clock, CheckCircle, Sparkles, Zap, BarChart3, Award, Play, ArrowUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Mock data for development
const mockData = {
  stats: {
    implementationRate: 73,
    actionsCompleted: 12,
    habitsFormed: 8,
    roiIncrease: 340,
    currentStreak: 23
  },
  recentMeetings: [
    {
      id: '1',
      title: 'Career Strategy Session',
      date: '2024-08-28',
      insights: 3,
      actions: 4,
      status: 'completed'
    },
    {
      id: '2', 
      title: 'Leadership Coaching',
      date: '2024-08-25',
      insights: 5,
      actions: 6,
      status: 'completed'
    }
  ],
  upcomingActions: [
    {
      id: '1',
      title: 'Practice delegation with team questions',
      dueDate: 'Today 2:00 PM',
      priority: 'high',
      estimatedTime: 30
    },
    {
      id: '2',
      title: 'Set up weekly focus blocks',
      dueDate: 'Tomorrow 9:00 AM', 
      priority: 'high',
      estimatedTime: 20
    },
    {
      id: '3',
      title: 'Research public speaking courses',
      dueDate: 'Friday',
      priority: 'medium',
      estimatedTime: 45
    }
  ],
  patterns: [
    {
      pattern: "Time management advice appears frequently",
      description: "You've received similar time management advice in 3 of your last 5 meetings",
      confidence: 0.89
    },
    {
      pattern: "High success rate with structured approaches",
      description: "You implement 85% of advice when given specific steps and timelines",
      confidence: 0.92
    }
  ]
}

export default function DashboardPage() {
  const [data, setData] = useState(mockData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/stats?userId=demo-user-1')
      if (response.ok) {
        const result = await response.json()
        setData({
          stats: result.stats,
          recentMeetings: result.recentMeetings,
          upcomingActions: result.upcomingActions,
          patterns: result.patterns
        })
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-4">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Behavior Intelligence</span>
            </div>
            <h1 className="text-4xl font-black mb-2">
              <span className="text-gradient">MentorIQ</span> Dashboard
            </h1>
            <p className="text-xl text-muted-foreground">Your behavior change command center</p>
          </div>
          <Link href="/upload">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 glow group">
              <Play className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              Process New Meeting
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Impact Stats */}
            <Card className="glass border-gradient card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Award className="h-6 w-6 text-primary" />
                  Your Impact This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="glass p-6 rounded-xl border border-green-500/30 card-hover text-center">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-3xl font-black text-green-400 mb-1">{data.stats.implementationRate}%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                    <div className="flex items-center justify-center gap-1 mt-2 text-xs text-green-400">
                      <ArrowUp className="h-3 w-3" />
                      +23% vs last month
                    </div>
                  </div>
                  <div className="glass p-6 rounded-xl border border-blue-500/30 card-hover text-center">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-3xl font-black text-blue-400 mb-1">{data.stats.actionsCompleted}</div>
                    <div className="text-sm text-muted-foreground">Actions Complete</div>
                    <div className="flex items-center justify-center gap-1 mt-2 text-xs text-blue-400">
                      <ArrowUp className="h-3 w-3" />
                      +5 this week
                    </div>
                  </div>
                  <div className="glass p-6 rounded-xl border border-purple-500/30 card-hover text-center">
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-3xl font-black text-purple-400 mb-1">{data.stats.habitsFormed}</div>
                    <div className="text-sm text-muted-foreground">Habits Formed</div>
                    <div className="flex items-center justify-center gap-1 mt-2 text-xs text-purple-400">
                      <ArrowUp className="h-3 w-3" />
                      +2 this month
                    </div>
                  </div>
                  <div className="glass p-6 rounded-xl border border-orange-500/30 card-hover text-center">
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-3xl font-black text-orange-400 mb-1">{data.stats.roiIncrease}%</div>
                    <div className="text-sm text-muted-foreground">ROI Increase</div>
                    <div className="flex items-center justify-center gap-1 mt-2 text-xs text-orange-400">
                      <ArrowUp className="h-3 w-3" />
                      vs industry avg
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 glass p-6 rounded-xl border-gradient animate-pulse-glow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-primary to-green-500 w-10 h-10 rounded-xl flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">🔥 Current Streak</div>
                        <div className="text-muted-foreground text-sm">Consistent implementation</div>
                      </div>
                    </div>
                    <div className="text-3xl font-black text-primary">{data.stats.currentStreak} days</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Meetings */}
            <Card className="glass border-gradient card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Brain className="h-6 w-6 text-primary" />
                  Recent Meetings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.recentMeetings.map((meeting, index) => (
                    <div 
                      key={meeting.id} 
                      className="glass p-6 rounded-xl border border-white/10 card-hover animate-float hover:border-primary/30"
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center">
                            <Brain className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg mb-1">{meeting.title}</h4>
                            <p className="text-muted-foreground text-sm">{meeting.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <div className="text-blue-400 font-bold">{meeting.insights}</div>
                            <div className="text-muted-foreground">insights</div>
                          </div>
                          <div className="text-center">
                            <div className="text-green-400 font-bold">{meeting.actions}</div>
                            <div className="text-muted-foreground">actions</div>
                          </div>
                          <CheckCircle className="h-6 w-6 text-green-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pattern Insights */}
            <Card className="glass border-gradient card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Zap className="h-6 w-6 text-primary" />
                  AI Pattern Recognition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {data.patterns.map((pattern, index) => (
                    <div 
                      key={index} 
                      className="glass p-6 rounded-xl border-l-4 border-primary card-hover animate-float"
                      style={{animationDelay: `${index * 0.2}s`}}
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-primary to-blue-500 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-2">{pattern.pattern}</h4>
                          <p className="text-muted-foreground mb-3">{pattern.description}</p>
                          <div className="flex items-center gap-2">
                            <div className="h-2 bg-white/20 rounded-full w-24">
                              <div 
                                className="h-2 bg-gradient-to-r from-primary to-blue-500 rounded-full"
                                style={{width: `${pattern.confidence * 100}%`}}
                              />
                            </div>
                            <span className="text-sm text-primary font-medium">
                              {Math.round(pattern.confidence * 100)}% confidence
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Next Actions */}
            <Card className="glass border-gradient card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="h-5 w-5 text-primary" />
                  🎯 Next Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.upcomingActions.map((action, index) => (
                    <div 
                      key={action.id} 
                      className="glass p-4 rounded-xl border border-white/10 card-hover animate-float"
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-bold text-sm flex-1 pr-2">{action.title}</h4>
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium",
                          action.priority === 'high' 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          action.priority === 'medium' 
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-green-500/20 text-green-400 border border-green-500/30'
                        )}>
                          {action.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-primary" />
                          <span>{action.dueDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-primary" />
                          <span>~{action.estimatedTime}min</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full border-primary/30 text-primary hover:bg-primary/10 h-8 text-xs"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Mark Complete
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass border-gradient card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start h-12 glass border border-white/10 hover:border-primary/30 hover:bg-primary/5">
                    <Calendar className="h-5 w-5 mr-3 text-blue-400" />
                    Schedule Focus Time
                  </Button>
                  <Button variant="ghost" className="w-full justify-start h-12 glass border border-white/10 hover:border-primary/30 hover:bg-primary/5">
                    <Target className="h-5 w-5 mr-3 text-green-400" />
                    Log Progress Update
                  </Button>
                  <Button variant="ghost" className="w-full justify-start h-12 glass border border-white/10 hover:border-primary/30 hover:bg-primary/5">
                    <Brain className="h-5 w-5 mr-3 text-purple-400" />
                    Review AI Patterns
                  </Button>
                  <Button variant="ghost" className="w-full justify-start h-12 glass border border-white/10 hover:border-primary/30 hover:bg-primary/5">
                    <BarChart3 className="h-5 w-5 mr-3 text-orange-400" />
                    Export Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Achievement Badge */}
            <Card className="glass border-gradient card-hover animate-pulse-glow">
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-to-br from-primary to-blue-500 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">🏆 Implementation Master</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  You've maintained a 70%+ implementation rate for 30 days!
                </p>
                <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10">
                  Share Achievement
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}