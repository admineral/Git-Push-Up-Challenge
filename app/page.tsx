'use client';

import { useMemo, useCallback } from 'react';
import Image from "next/image";
import { PieChartComponent } from './components/pie-chart';

import { UpcomingDays } from './components/upcoming-days';
import { PushupLineChart } from './components/line-chart';

interface DayChallenge {
  date: string;
  pushups: number;
  completed: boolean;
}

interface ChartData {
  date: string;
  pushups: number;
  cumulativePushups: number;
  quarterMark?: boolean;
}

// Pre-calculate days in each month for the current year
const DAYS_IN_MONTH = Array.from({ length: 12 }, (_, month) => 
  new Date(new Date().getFullYear(), month + 1, 0).getDate()
);

// Pre-calculate cumulative days for faster day-of-year calculation
const CUMULATIVE_DAYS = DAYS_IN_MONTH.reduce((acc, days, index) => {
  acc[index] = (acc[index - 1] || 0) + days;
  return acc;
}, [] as number[]);

// Helper function to check if a date is a weekend
const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
};

// Calculate total weekdays in the year
const calculateTotalWeekdays = (year: number): number => {
  let count = 0;
  const startDate = new Date(year, 0, 1);  // January 1st
  const endDate = new Date(year, 11, 31);  // December 31st

  for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
    if (!isWeekend(d)) {
      count++;
    }
  }
  return count;
};

export default function Home() {
  // Memoize the calculation of pushups for a given date
  const calculatePushups = useCallback((month: number, day: number): number => {
    const date = new Date(new Date().getFullYear(), month, day);
    if (isWeekend(date)) {
      return 0;
    }
    const previousMonthsDays = month > 0 ? CUMULATIVE_DAYS[month - 1] : 0;
    return previousMonthsDays + day;
  }, []);

  // Memoize chart data generation with cumulative pushups
  const { data: chartData, total: totalPushups } = useMemo(() => {
    const data: ChartData[] = [];
    const year = new Date().getFullYear();
    let total = 0;
    let cumulative = 0;

    DAYS_IN_MONTH.forEach((daysInMonth, month) => {
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        if (!isWeekend(date)) {
          const pushups = calculatePushups(month, day);
          total += pushups;
          cumulative += pushups;

          // Add all weekdays to the data points
          data.push({
            date: date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            }),
            pushups,
            cumulativePushups: cumulative,
            quarterMark: day === 1 && month % 3 === 0
          });
        }
      }
    });

    return { data, total };
  }, [calculatePushups]);

  // Memoize upcoming days calculation
  const upcomingDays = useMemo(() => {
    const days: DayChallenge[] = [];
    const today = new Date();
    const currentDay = today.getDate();
    let daysAdded = 0;
    let i = 0;

    // Add next 10 weekdays
    while (daysAdded < 10) {
      const date = new Date(today);
      date.setDate(currentDay + i);
      
      if (!isWeekend(date)) {
        const month = date.getMonth();
        const day = date.getDate();
        
        days.push({
          date: date.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          }),
          pushups: calculatePushups(month, day),
          completed: daysAdded === 0
        });
        daysAdded++;
      }
      i++;
    }

    return days;
  }, [calculatePushups]);

  // Memoize today's pushups
  const todaysPushups = useMemo(() => {
    const today = new Date();
    if (isWeekend(today)) {
      return 0;
    }
    return calculatePushups(today.getMonth(), today.getDate());
  }, [calculatePushups]);

  // Calculate completed days (today's day of year, excluding weekends)
  const completedDays = useMemo(() => {
    const today = new Date();
    let count = 0;
    for (let d = new Date(today.getFullYear(), 0, 1); d <= today; d.setDate(d.getDate() + 1)) {
      if (!isWeekend(d)) {
        count++;
      }
    }
    return count;
  }, []);

  // Calculate total weekdays for the year
  const totalWeekdays = useMemo(() => {
    return calculateTotalWeekdays(new Date().getFullYear());
  }, []);

  const formatNumber = useCallback((num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-4 sm:p-6">
      <div className="mx-auto max-w-[1920px] space-y-4 sm:space-y-6">
        <div className="flex items-center justify-center gap-4 mb-8">
          <Image
            src="/pushup.png"
            alt="ACP Push Up Challenge Logo"
            width={200}
            height={200}
            priority
            className="w-[80px] h-auto sm:w-[100px]"
          />
          <h1 className="text-3xl sm:text-5xl font-bold text-red-600">
            DOA Push Up Challenge
          </h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-7 gap-4 sm:gap-6">
          {/* Line Chart */}
          <div className="xl:col-span-4 transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
            <PushupLineChart 
              chartData={chartData}
              formatNumber={formatNumber}
            />
          </div>

          <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-4 sm:gap-6">
            {/* Pie Chart */}
            <div className="transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
              <PieChartComponent 
                totalPushups={totalPushups}
                todaysPushups={todaysPushups}
                completedDays={completedDays}
                totalWeekdays={totalWeekdays}
              />
            </div>

            {/* Upcoming Days */}
            <div className="transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
              <UpcomingDays 
                upcomingDays={upcomingDays}
                formatNumber={formatNumber}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

