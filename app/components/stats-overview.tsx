'use client';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatsOverviewProps {
  todaysPushups: number;
  totalPushups: number;
  completedDays: number;
  formatNumber: (num: number) => string;
}

export function StatsOverview({ todaysPushups, totalPushups, completedDays, formatNumber }: StatsOverviewProps) {
  return (
    <Card className="bg-gray-900/50 shadow-lg border border-red-500/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white mb-6">Stats Overview</CardTitle>
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
            <CardHeader className="flex flex-col items-center text-center">
              <CardTitle className="text-red-400">Progress</CardTitle>
              <CardDescription className="text-3xl font-bold text-white">
                {((completedDays / 366) * 100).toFixed(1)}%
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </CardHeader>
    </Card>
  );
} 