"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Info } from "lucide-react";

interface StatsOverviewProps {
  todaysPushups: number;
  totalPushups: number;
  completedDays: number;
  totalWeekdays: number;
  formatNumber: (num: number) => string;
}

export function StatsOverview({
  todaysPushups,
  totalPushups,
  completedDays,
  totalWeekdays,
  formatNumber,
}: StatsOverviewProps) {
  // Calculate total pushups for the year
  // (Sum of 1..totalWeekdays, because each weekday i requires i pushups)
  const totalYearPushups = Array.from({ length: totalWeekdays }, (_, i) => i + 1).reduce(
    (sum, day) => sum + day,
    0
  );

  // Calculate completion percentages
  const pushupProgress = ((totalPushups / totalYearPushups) * 100).toFixed(1);
  const timeProgress = ((completedDays / totalWeekdays) * 100).toFixed(1);

  return (
    <Card className="bg-gray-900/50 shadow-lg border border-red-500/20 backdrop-blur-sm">
      <CardHeader className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-xl sm:text-2xl">
            Pushup Challenge Stats
          </CardTitle>
          <div className="group relative">
            <Info className="h-4 w-4 text-gray-400 hover:text-white cursor-help" />
            <div className="absolute right-0 top-6 w-64 p-2 rounded-lg bg-gray-900/95 border border-red-500/20 backdrop-blur-sm shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 text-xs text-gray-400 z-50">
              Each weekday requires its day number in pushups.
              Weekend days are excluded from the challenge.
            </div>
          </div>
        </div>

        {/* 4-column grid to display all stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Today’s Pushups */}
          <Card className="bg-gray-900/50 shadow-lg border border-red-500/20 backdrop-blur-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-red-500 text-sm sm:text-base">
                Today’s Pushups
              </CardTitle>
              <CardDescription className="text-2xl sm:text-3xl font-bold text-white">
                {formatNumber(todaysPushups)}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Total Pushups Done */}
          <Card className="bg-gray-900/50 shadow-lg border border-red-500/20 backdrop-blur-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-white text-sm sm:text-base">
                Pushups Done
              </CardTitle>
              <CardDescription className="text-2xl sm:text-3xl font-bold text-white">
                {formatNumber(totalPushups)}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Total Required for Year */}
          <Card className="bg-gray-900/50 shadow-lg border border-red-500/20 backdrop-blur-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-white text-sm sm:text-base">
                Total Required
              </CardTitle>
              <CardDescription className="text-2xl sm:text-3xl font-bold text-white">
                {formatNumber(totalYearPushups)}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Completion Stats */}
          <Card className="bg-gray-900/50 shadow-lg border border-red-500/20 backdrop-blur-sm sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-col items-center text-center space-y-2">
              <CardTitle className="text-red-400 text-sm sm:text-base">
                Completion
              </CardTitle>
              <div className="space-y-1">
                {/* Percentage of total pushups completed */}
                <CardDescription className="text-2xl sm:text-3xl font-bold text-white">
                  {pushupProgress}%
                </CardDescription>
                <CardDescription className="text-sm text-gray-400">
                  of total pushups completed
                </CardDescription>

                {/* Percentage of weekdays elapsed */}
                <CardDescription className="text-2xl sm:text-3xl font-bold text-white">
                  {timeProgress}%
                </CardDescription>
                <CardDescription className="text-sm text-gray-400">
                  of weekdays completed
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>
      </CardHeader>
    </Card>
  );
}