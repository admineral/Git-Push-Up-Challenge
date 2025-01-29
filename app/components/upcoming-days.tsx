'use client';

import {
  Card,
  CardContent,
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
    <Card className="bg-gray-900/50 shadow-lg border border-red-500/20 backdrop-blur-sm h-full">
      <CardHeader>
        <CardTitle className="text-white text-xl sm:text-2xl">Upcoming Days</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 grid-rows-2 gap-3 sm:gap-4">
          {upcomingDays.slice(0, 6).map((day, index) => (
            <div 
              key={index}
              className={`relative p-3 sm:p-4 rounded-lg ${
                day.completed 
                  ? 'bg-red-600/20 border-red-500/50 ring-2 ring-red-500/30 ring-offset-2 ring-offset-gray-900' 
                  : 'bg-gray-800/50 border-gray-700'
              } border backdrop-blur-sm shadow-sm hover:scale-[1.02] transition-transform duration-200`}
            >
              {day.completed && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                  Today
                </div>
              )}
              <p className={`text-xs sm:text-sm ${day.completed ? 'text-red-300' : 'text-gray-400'} mt-2`}>{day.date}</p>
              <p className={`${day.completed ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'} font-semibold text-white`}>
                {formatNumber(day.pushups)}
              </p>
              <p className={`text-xs ${day.completed ? 'text-red-400' : 'text-gray-500'}`}>pushups</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 
