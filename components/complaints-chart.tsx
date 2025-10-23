
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { Department } from "@/lib/types"

interface DepartmentalPerformanceData {
    department: Department;
    total: number;
    resolved: number;
    pending: number;
}

interface ComplaintsChartProps {
    data: DepartmentalPerformanceData[];
}

export function ComplaintsChart({ data }: ComplaintsChartProps) {
  const chartConfig = {
    resolved: {
      label: "Resolved",
      color: "hsl(var(--chart-2))",
    },
    pending: {
      label: "Pending",
      color: "hsl(var(--chart-1))",
    },
  } satisfies React.ComponentProps<typeof ChartContainer>["config"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Departmental Performance</CardTitle>
        <CardDescription>Total, resolved, and pending complaints by department</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
             <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="department"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
              width={120}
            />
            <XAxis dataKey="total" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar dataKey="resolved" stackId="a" fill="var(--color-resolved)" radius={[0, 4, 4, 0]} />
            <Bar dataKey="pending" stackId="a" fill="var(--color-pending)" radius={[0, 0, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
