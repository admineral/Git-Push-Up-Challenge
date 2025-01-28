'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DayChallenge {
  date: string;
  pushups: number;
  completed: boolean;
}

interface UpcomingDaysProps {
  upcomingDays: DayChallenge[];
  formatNumber: (num: number) => string;
}

export function UpcomingDays({ upcomingDays, formatNumber }: UpcomingDaysProps) {
  return (
    <Card className="bg-gray-900/50 shadow-lg border border-red-500/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Upcoming Days</CardTitle>
        <CardDescription className="text-gray-400">Next 7 weekdays</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
          {upcomingDays.slice(0, 7).map((day, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg ${
                day.completed 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : 'bg-gray-800/50 border-gray-700'
              } border backdrop-blur-sm shadow-sm`}
            >
              <p className="text-sm text-gray-400">{day.date}</p>
              <p className="text-xl font-semibold text-white">
                {formatNumber(day.pushups)}
              </p>
              <p className="text-xs text-gray-500">pushups</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 