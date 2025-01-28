'use client';

import { useMemo, useCallback } from 'react';
import { TrendingUp } from "lucide-react";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";

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

// Add interfaces for the chart props
interface DotProps {
  cx: number;
  cy: number;
  payload: {
    date: string;
    cumulativePushups: number;
  };
}

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

  const chartConfig = {
    cumulativePushups: {
      label: "Total Pushups",
      color: "rgb(239, 68, 68)",
    },
  } satisfies ChartConfig;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-900/50 shadow-lg border border-red-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-red-500">Today&apos;s Goal</CardTitle>
              <CardDescription className="text-3xl font-bold text-white">
                {formatNumber(todaysPushups)} pushups
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-gray-900/50 shadow-lg border border-red-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Total for Year</CardTitle>
              <CardDescription className="text-3xl font-bold text-white">
                {formatNumber(totalPushups)} pushups
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-gray-900/50 shadow-lg border border-red-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-red-400">Progress</CardTitle>
              <CardDescription className="text-3xl font-bold text-white">
                {((completedDays / 366) * 100).toFixed(1)}%
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Chart Card */}
        <Card className="bg-gray-900/50 shadow-lg border border-red-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">2025 Pushup Challenge</CardTitle>
            <CardDescription className="text-gray-400">Daily Progress</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <LineChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 50,
                  left: 0,
                  bottom: 20,
                }}
              >
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  stroke="rgb(156, 163, 175)"
                  tick={{ fill: 'rgb(156, 163, 175)', fontSize: 12 }}
                  interval={30}
                />
                <YAxis
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={50}
                  tickFormatter={formatNumber}
                  domain={[0, 48000]}
                  stroke="rgb(156, 163, 175)"
                  tick={{ fill: 'rgb(156, 163, 175)', fontSize: 12 }}
                />
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-red-500/20 bg-gray-900/95 p-3 shadow-xl backdrop-blur-sm">
                        <div className="grid gap-3">
                          <div className="border-b border-red-500/20 pb-2">
                            <span className="text-white font-medium">{data.date}</span>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between gap-8">
                              <span className="text-gray-400">Today:</span>
                              <span className="font-semibold text-red-500">
                                {formatNumber(data.pushups)} pushups
                              </span>
                            </div>
                            <div className="flex justify-between gap-8">
                              <span className="text-gray-400">Total:</span>
                              <span className="font-semibold text-white">
                                {formatNumber(data.cumulativePushups)} pushups
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativePushups"
                  name="cumulativePushups"
                  stroke="rgb(239, 68, 68)"
                  strokeWidth={2}
                  dot={(props: DotProps) => {
                    const today = new Date().toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    });
                    const dotId = `dot-${props?.payload?.date}`;
                    
                    if (props?.payload?.date === today) {
                      return (
                        <g key={dotId}>
                          <circle 
                            key={`${dotId}-circle`}
                            cx={props.cx} 
                            cy={props.cy} 
                            r={6} 
                            fill="rgb(239, 68, 68)"
                          />
                          <text
                            key={`${dotId}-text`}
                            x={props.cx}
                            y={props.cy - 12}
                            textAnchor="middle"
                            fill="rgb(239, 68, 68)"
                            fontSize={12}
                          >
                            {formatNumber(props.payload.cumulativePushups)}
                          </text>
                        </g>
                      );
                    }
                    return <g key={`empty-${dotId}`}></g>;
                  }}
                  activeDot={{ r: 8 }}
                >
                  <LabelList
                    dataKey="cumulativePushups"
                    position="top"
                    offset={12}
                    className="fill-white"
                    fontSize={12}
                    formatter={formatNumber}
                    content={(props) => {
                      if (!props || typeof props.value !== 'number') return null;
                      
                      const isQuarterMark = chartData.find(
                        (d) => d.cumulativePushups === props.value && d.quarterMark
                      );
                      const today = new Date().toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      });
                      const isToday = chartData.find(
                        (d) => d.cumulativePushups === props.value && d.date === today
                      );
                      
                      if (!isQuarterMark && !isToday) return null;
                      
                      const xPos = typeof props.x === 'number' ? props.x : 0;
                      const yPos = typeof props.y === 'number' ? props.y : 0;
                      
                      return (
                        <text
                          x={xPos}
                          y={yPos - 12}
                          textAnchor="middle"
                          fill="rgb(239, 68, 68)"
                          fontSize={12}
                        >
                          {formatNumber(props.value)}
                        </text>
                      );
                    }}
                  />
                </Line>
              </LineChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none text-red-500">
              Next milestone: {formatNumber(48000)} pushups <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-gray-400">
              Showing daily progress excluding weekends
            </div>
          </CardFooter>
        </Card>

        {/* Upcoming Days */}
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
      </div>
    </div>
  );
}
