import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Clock, Settings } from "lucide-react";
import { format, addDays, setHours, setMinutes } from "date-fns";

interface ActionItemCustomizerProps {
  actionItems: any[];
  onSchedule: (customizedItems: any[]) => void;
  isScheduling: boolean;
}

interface CustomizedActionItem {
  originalAction: any;
  customDate: Date;
  customTime: string;
  estimatedDuration: number;
}

export const ActionItemCustomizer: React.FC<ActionItemCustomizerProps> = ({
  actionItems,
  onSchedule,
  isScheduling
}) => {
  const [customizedItems, setCustomizedItems] = useState<CustomizedActionItem[]>(
    actionItems.map(action => {
      const dueDate = new Date(action.dueDate);
      const defaultScheduleDate = new Date(dueDate.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days before due date
      defaultScheduleDate.setHours(10, 0, 0, 0); // 10 AM default
      
      return {
        originalAction: action,
        customDate: defaultScheduleDate,
        customTime: "10:00",
        estimatedDuration: action.estimatedTime || 60
      };
    })
  );

  const [showCustomizer, setShowCustomizer] = useState(false);

  const updateItemDate = (index: number, date: Date) => {
    setCustomizedItems(prev => {
      const updated = [...prev];
      updated[index].customDate = date;
      return updated;
    });
  };

  const updateItemTime = (index: number, time: string) => {
    setCustomizedItems(prev => {
      const updated = [...prev];
      updated[index].customTime = time;
      return updated;
    });
  };

  const updateItemDuration = (index: number, duration: number) => {
    setCustomizedItems(prev => {
      const updated = [...prev];
      updated[index].estimatedDuration = duration;
      return updated;
    });
  };

  const handleScheduleWithCustomDates = () => {
    const itemsWithCustomDates = customizedItems.map(item => {
      const [hours, minutes] = item.customTime.split(':').map(Number);
      const scheduledDateTime = setMinutes(setHours(item.customDate, hours), minutes);
      
      return {
        ...item.originalAction,
        customScheduleDate: scheduledDateTime,
        customDuration: item.estimatedDuration
      };
    });
    
    onSchedule(itemsWithCustomDates);
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = format(setMinutes(setHours(new Date(), hour), minute), 'h:mm a');
        times.push({ value: timeString, label: displayTime });
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  if (!showCustomizer) {
    return (
      <div className="flex flex-col space-y-3">
        <Button 
          onClick={handleScheduleWithCustomDates}
          className="btn-hero w-full"
          disabled={isScheduling}
          size="lg"
        >
          {isScheduling ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Scheduling Actions...
            </>
          ) : (
            <>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Add to Calendar
            </>
          )}
        </Button>
        
        <Button
          onClick={() => setShowCustomizer(true)}
          variant="outline"
          className="w-full"
          size="sm"
        >
          <Settings className="mr-2 h-4 w-4" />
          Customize Dates & Times
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Customize Calendar Schedule
          </span>
          <Button
            onClick={() => setShowCustomizer(false)}
            variant="ghost"
            size="sm"
          >
            ✕
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {customizedItems.map((item, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <h4 className="font-semibold text-sm leading-tight">{item.originalAction.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 truncate">{item.originalAction.description}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge 
                    variant={item.originalAction.priority === 'high' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {item.originalAction.priority}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Due: {format(new Date(item.originalAction.dueDate), 'MMM d')}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Date Picker */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Schedule Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal text-xs h-8"
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {format(item.customDate, 'MMM d, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={item.customDate}
                      onSelect={(date) => date && updateItemDate(index, date)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Picker */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Time</label>
                <Select value={item.customTime} onValueChange={(time) => updateItemTime(index, time)}>
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((timeOption) => (
                      <SelectItem key={timeOption.value} value={timeOption.value} className="text-xs">
                        {timeOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration Picker */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Duration (min)</label>
                <Select 
                  value={item.estimatedDuration.toString()} 
                  onValueChange={(duration) => updateItemDuration(index, parseInt(duration))}
                >
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="180">3 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview */}
            <div className="text-xs text-muted-foreground bg-slate-50 p-2 rounded">
              <Clock className="inline w-3 h-3 mr-1" />
              Scheduled for {format(item.customDate, 'EEEE, MMMM d')} at{' '}
              {format(setMinutes(setHours(new Date(), parseInt(item.customTime.split(':')[0])), parseInt(item.customTime.split(':')[1])), 'h:mm a')}
              {' '}({item.estimatedDuration} minutes)
            </div>
          </div>
        ))}

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            onClick={handleScheduleWithCustomDates}
            className="btn-hero flex-1"
            disabled={isScheduling}
          >
            {isScheduling ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Creating Calendar Events...
              </>
            ) : (
              <>
                <CalendarIcon className="mr-2 h-4 w-4" />
                Schedule {customizedItems.length} Actions
              </>
            )}
          </Button>
          
          <Button
            onClick={() => setShowCustomizer(false)}
            variant="outline"
            className="flex-1 sm:flex-initial"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};