'use client';

import { useMemo, useCallback } from 'react';
import { PieChartComponent } from './components/pie-chart';
import { StatsOverview } from './components/stats-overview';
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

          // Only add weekdays to reduce data points
          if (day % 2 === 0 || day === 1 || day === daysInMonth) {
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

  const formatNumber = useCallback((num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Stats Overview */}
        <StatsOverview 
          todaysPushups={todaysPushups}
          totalPushups={totalPushups}
          completedDays={completedDays}
          formatNumber={formatNumber}
        />

        {/* Pie Chart */}
        <PieChartComponent />

        {/* Line Chart */}
        <PushupLineChart 
          chartData={chartData}
          formatNumber={formatNumber}
        />

        {/* Upcoming Days */}
        <UpcomingDays 
          upcomingDays={upcomingDays}
          formatNumber={formatNumber}
        />
      </div>
    </div>
  );
}
