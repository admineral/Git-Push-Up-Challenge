'use client';

import { TrendingUp } from "lucide-react";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
  DotProps,
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

interface ChartData {
  date: string;
  pushups: number;
  cumulativePushups: number;
  quarterMark?: boolean;
}

interface CustomDotProps extends DotProps {
  payload?: ChartData;
  cx?: number;
  cy?: number;
}

interface LineChartProps {
  chartData: ChartData[];
  formatNumber: (num: number) => string;
}

export function PushupLineChart({ chartData, formatNumber }: LineChartProps) {
  const chartConfig = {
    cumulativePushups: {
      label: "Total Pushups",
      color: "rgb(239, 68, 68)",
    },
  } satisfies ChartConfig;

  return (
    <Card className="bg-gray-900/50 shadow-lg border border-red-500/20 backdrop-blur-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="text-white text-xl sm:text-2xl">2025 Pushup Challenge</CardTitle>
        <CardDescription className="text-gray-400 text-sm sm:text-base">Daily Progress</CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <ChartContainer config={chartConfig}>
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 0,
              bottom: 20,
            }}
            className="w-full min-h-[300px] sm:min-h-[400px]"
          >
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              stroke="rgb(156, 163, 175)"
              tick={{ fill: 'rgb(156, 163, 175)', fontSize: 10, dy: 10 }}
              interval="preserveStartEnd"
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
              tick={{ fill: 'rgb(156, 163, 175)', fontSize: 10 }}
            />
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border border-red-500/20 bg-gray-900/95 p-2 sm:p-3 shadow-xl backdrop-blur-sm">
                    <div className="grid gap-2 sm:gap-3">
                      <div className="border-b border-red-500/20 pb-2">
                        <span className="text-white font-medium text-sm sm:text-base">{data.date}</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between gap-4 sm:gap-8">
                          <span className="text-gray-400 text-xs sm:text-sm">Today:</span>
                          <span className="font-semibold text-red-500 text-xs sm:text-sm">
                            {formatNumber(data.pushups)} pushups
                          </span>
                        </div>
                        <div className="flex justify-between gap-4 sm:gap-8">
                          <span className="text-gray-400 text-xs sm:text-sm">Total:</span>
                          <span className="font-semibold text-white text-xs sm:text-sm">
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
              dot={(props: CustomDotProps) => {
                const today = new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                });
                const dotId = `dot-${props?.payload?.date}`;
                
                if (props?.payload?.date === today) {
                  return (
                    <g key={dotId}>
                      {props.cx != null && props.cy != null && (
                        <>
                          <circle 
                            key={`${dotId}-circle`}
                            cx={props.cx} 
                            cy={props.cy} 
                            r={4}
                            fill="rgb(239, 68, 68)"
                          />
                          <text
                            key={`${dotId}-text`}
                            x={props.cx}
                            y={props.cy - 10}
                            textAnchor="middle"
                            fill="rgb(239, 68, 68)"
                            fontSize={10}
                            className="hidden sm:block"
                          >
                            {formatNumber(props.payload.cumulativePushups)}
                          </text>
                        </>
                      )}
                    </g>
                  );
                }
                return <g key={`empty-${dotId}`}></g>;
              }}
              activeDot={{ r: 6 }}
            >
              <LabelList
                dataKey="cumulativePushups"
                position="top"
                offset={12}
                className="fill-white hidden sm:block"
                fontSize={10}
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
                      fontSize={10}
                      className="hidden sm:block"
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
      <CardFooter className="flex-col items-start gap-2 text-xs sm:text-sm p-4 sm:p-6">
        <div className="flex gap-2 font-medium leading-none text-red-500">
          Next milestone: {formatNumber(48000)} pushups <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
        </div>
        <div className="leading-none text-gray-400">
          Showing daily progress excluding weekends
        </div>
      </CardFooter>
    </Card>
  );
} 