'use client'

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Calculate total pushups for each month (excluding weekends)
const calculateMonthlyPushups = () => {
  const year = new Date().getFullYear();
  const monthlyData = [];
  
  for (let month = 0; month < 12; month++) {
    let total = 0;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      if (!isWeekend) {
        const previousMonthsDays = month > 0 
          ? Array.from({ length: month }, (_, m) => 
              new Date(year, m + 1, 0).getDate()
            ).reduce((acc, days) => acc + days, 0)
          : 0;
        total += previousMonthsDays + day;
      }
    }
    
    monthlyData.push({
      month: new Date(year, month).toLocaleString('en-US', { month: 'long' }).toLowerCase(),
      pushups: total,
      fill: `rgb(${239 - (month * 15)}, ${68 - (month * 4)}, ${68 - (month * 4)})`,
    });
  }
  
  return monthlyData;
};

const monthlyData = calculateMonthlyPushups();

const chartConfig = {
  pushups: {
    label: "Pushups",
    color: "rgb(239, 68, 68)",
  },
  ...Object.fromEntries(
    monthlyData.map(({ month }) => [
      month,
      {
        label: month.charAt(0).toUpperCase() + month.slice(1),
        color: "rgb(239, 68, 68)",
      },
    ])
  ),
} satisfies ChartConfig;

export function PieChartComponent() {
  const id = "pie-interactive"
  const [activeMonth, setActiveMonth] = React.useState(monthlyData[0].month)

  const activeIndex = React.useMemo(
    () => monthlyData.findIndex((item) => item.month === activeMonth),
    [activeMonth]
  )
  const months = React.useMemo(() => monthlyData.map((item) => item.month), [])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <Card className="bg-gray-900/50 shadow-lg border border-red-500/20 backdrop-blur-sm">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle className="text-white">Monthly Pushup Distribution</CardTitle>
          <CardDescription className="text-gray-400">Total pushups per month</CardDescription>
        </div>
        <Select value={activeMonth} onValueChange={setActiveMonth}>
          <SelectTrigger
            className="ml-auto h-7 w-[130px] rounded-lg pl-2.5 bg-gray-800/50 border-red-500/20 text-white"
            aria-label="Select a month"
          >
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl bg-gray-900 border-red-500/20">
            {months.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig]

              if (!config) {
                return null
              }

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex text-white hover:bg-gray-800"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-sm"
                      style={{
                        backgroundColor: monthlyData.find(d => d.month === key)?.fill,
                      }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border border-red-500/20 bg-gray-900/95 p-3 shadow-xl backdrop-blur-sm">
                    <div className="grid gap-2">
                      <div className="text-white font-medium">
                        {data.month.charAt(0).toUpperCase() + data.month.slice(1)}
                      </div>
                      <div className="text-red-400 font-semibold">
                        {formatNumber(data.pushups)} pushups
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Pie
              data={monthlyData}
              dataKey="pushups"
              nameKey="month"
              innerRadius={60}
              strokeWidth={2}
              stroke="rgb(17, 24, 39)"
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-white text-3xl font-bold"
                        >
                          {formatNumber(monthlyData[activeIndex].pushups)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-gray-400 text-sm"
                        >
                          pushups
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
} 