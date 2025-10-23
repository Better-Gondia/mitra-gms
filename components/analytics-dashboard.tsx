
'use client';

import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend, TooltipProps } from 'recharts';
import { differenceInBusinessDays, differenceInHours, format, getDay, getHours, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { Complaint, ComplaintStatus, Department } from '@/lib/types';
import { useLanguage } from '@/hooks/use-language';
import { Star, Users, FileText, Divide, CheckCircle, Clock, AlertTriangle, Link2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { complaintWorkflow } from '@/lib/types';

interface AnalyticsDashboardProps {
  complaints: Complaint[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border p-2 rounded-md shadow-lg">
        <p className="font-bold">{label}</p>
        {payload.map((pld, index) => (
          <div key={index} style={{ color: pld.color }}>
            {pld.name}: {pld.value?.toLocaleString()}
          </div>
        ))}
      </div>
    );
  }
  return null;
};


export default function AnalyticsDashboard({ complaints }: AnalyticsDashboardProps) {
  const { t } = useLanguage();
  
  const analyticsData = useMemo(() => {
    const totalComplaints = complaints.length;
    const totalCitizens = 15234; // Placeholder
    const avgFeedback = 4.2; // Placeholder

    const activeComplaints = complaints.filter(c => !['Resolved', 'Invalid'].includes(c.status));
    const resolvedComplaints = complaints.filter(c => c.status === 'Resolved');
    
    // --- KPIs ---
    const totalOpen = complaints.filter(c => c.status === 'Open').length;
    const totalInProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolutionRate = totalComplaints > 0 ? (resolvedComplaints.length / totalComplaints) * 100 : 0;
    
    const resolutionTimes = resolvedComplaints.map(c => 
        differenceInBusinessDays(new Date(c.history.find(h => h.action.includes('Resolved'))?.timestamp || c.lastUpdated), new Date(c.submittedDate))
    );
    const avgResolutionTime = resolutionTimes.length > 0 ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length : 0;

    const highPriorityActive = activeComplaints.filter(c => c.priority === 'High').length;
    const staleComplaintsCount = activeComplaints.filter(c => differenceInHours(new Date(), new Date(c.lastUpdated)) > 72).length;
    const totalLinkedComplaints = complaints.reduce((acc, c) => acc + (c.linkedComplaintIds?.length || 0), 0) / 2; // Divide by 2 because each link is on two complaints
    const avgLinksPerComplaint = totalComplaints > 0 ? (totalLinkedComplaints * 2) / totalComplaints : 0;

    // --- Chart Data ---
    // Timeline of complaints (last 30 days)
    const trendData = Array.from({ length: 30 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateString = date.toISOString().split('T')[0];
      return { date: dateString, count: 0 };
    });
    complaints.forEach(c => {
      const submittedDateString = new Date(c.submittedDate).toISOString().split('T')[0];
      const trendEntry = trendData.find(d => d.date === submittedDateString);
      if (trendEntry) trendEntry.count++;
    });
    const formattedTrendData = trendData.map(d => ({
        ...d, 
        date: new Date(d.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    }));
    
    // Day wise/time wise complaints received (Heatmap)
    const hourlyCounts = Array(24).fill(0);
    complaints.forEach(c => {
        const hour = getHours(new Date(c.submittedDate));
        hourlyCounts[hour]++;
    });
    const formattedHourlyData = hourlyCounts.map((count, hour) => ({
        hour: `${hour}:00`,
        count
    }));


    // Average time taken by teams in lifecycle
    const lifecycleTimings: { [key: string]: number[] } = {
        'Open -> Assigned': [], 'Assigned -> In Progress': [], 'In Progress -> Resolved': [],
    };
    complaints.forEach(c => {
        const history = [...c.history].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const openTime = c.submittedDate;
        const assignedEntry = history.find(h => h.action.includes('Assigned'));
        const inProgressEntry = history.find(h => h.action.includes('In Progress'));
        const resolvedEntry = history.find(h => h.action.includes('Resolved'));

        if(assignedEntry) lifecycleTimings['Open -> Assigned'].push(differenceInHours(new Date(assignedEntry.timestamp), new Date(openTime)));
        if(assignedEntry && inProgressEntry) lifecycleTimings['Assigned -> In Progress'].push(differenceInHours(new Date(inProgressEntry.timestamp), new Date(assignedEntry.timestamp)));
        if(inProgressEntry && resolvedEntry) lifecycleTimings['In Progress -> Resolved'].push(differenceInHours(new Date(resolvedEntry.timestamp), new Date(inProgressEntry.timestamp)));
    });
    const avgLifecycleData = Object.entries(lifecycleTimings).map(([stage, times]) => ({
        stage,
        avgHours: times.length > 0 ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1) : 0,
    }));
    
    // Complaints by Department
    const complaintsByDept: {[key in Department]?: number} = {};
    complaints.forEach(c => {
        if(c.department) {
            if(!complaintsByDept[c.department]) complaintsByDept[c.department] = 0;
            complaintsByDept[c.department]!++;
        }
    });
    const deptData = Object.entries(complaintsByDept).map(([name, value]) => ({name, value})).sort((a,b) => b.value - a.value);

    // Complaints by Category
    const complaintsByCategory: {[key: string]: number} = {};
    complaints.forEach(c => {
        if(!complaintsByCategory[c.category]) complaintsByCategory[c.category] = 0;
        complaintsByCategory[c.category]++;
    });
    const categoryData = Object.entries(complaintsByCategory).map(([name, value]) => ({name, value})).sort((a,b) => b.value - a.value).slice(0, 10);
    
    // Complaints by Tehsil
    const complaintsByTehsil: {[key: string]: number} = {};
    const tehsils = ['Gondia', 'Goregaon', 'Tirora', 'Arjuni-Morgaon', 'Deori', 'Amgaon', 'Salekasa', 'Sadak-Arjuni'];
    tehsils.forEach(tehsil => complaintsByTehsil[tehsil] = 0);
    complaints.forEach(c => {
        const foundTehsil = tehsils.find(tehsil => c.location.includes(tehsil));
        if (foundTehsil) {
            complaintsByTehsil[foundTehsil]++;
        }
    });
    const tehsilData = Object.entries(complaintsByTehsil).map(([name, value]) => ({name, value})).sort((a,b) => b.value - a.value);

    return {
      totalCitizens, totalComplaints, totalOpen, totalInProgress, totalResolved: resolvedComplaints.length,
      complaintsPerCitizen: (totalComplaints / totalCitizens).toFixed(4), avgFeedback, resolutionRate,
      avgResolutionTime, highPriorityActive, staleComplaintsCount, totalLinkedComplaints, avgLinksPerComplaint,
      trendData: formattedTrendData, hourlyData: formattedHourlyData, avgLifecycleData, deptData, categoryData, tehsilData
    };
  }, [complaints]);

  const kpiCards = [
      { title: "Total Complaints", value: analyticsData.totalComplaints.toLocaleString(), icon: FileText },
      { title: "Active Complaints", value: (analyticsData.totalOpen + analyticsData.totalInProgress).toLocaleString(), icon: FileText },
      { title: "Resolved Complaints", value: analyticsData.totalResolved.toLocaleString(), icon: CheckCircle },
      { title: "Total Citizens", value: analyticsData.totalCitizens.toLocaleString(), icon: Users, isPlaceholder: true },
      { title: "Resolution Rate", value: `${analyticsData.resolutionRate.toFixed(1)}%`, icon: CheckCircle },
      { title: "Avg. Resolution Time (Days)", value: analyticsData.avgResolutionTime.toFixed(1), icon: Clock },
      { title: "High-Priority Active", value: analyticsData.highPriorityActive, icon: AlertTriangle },
      { title: "Stale (>3 days)", value: analyticsData.staleComplaintsCount, icon: AlertTriangle },
      { title: "Complaints w/ 'Co-signs'", value: analyticsData.totalLinkedComplaints.toLocaleString(), icon: Link2 },
      { title: "Avg. Citizen Rating", value: `${analyticsData.avgFeedback} / 5`, icon: Star, isPlaceholder: true },
  ];

  return (
    <div className="space-y-6">
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {kpiCards.map(kpi => (
                <Card key={kpi.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                        <kpi.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpi.value}</div>
                        {kpi.isPlaceholder && <p className="text-xs text-muted-foreground">(Placeholder)</p>}
                    </CardContent>
                </Card>
            ))}
        </div>
      
      <div className="grid gap-4 md:grid-cols-1">
         <Card>
          <CardHeader>
            <CardTitle>Daily Complaint Volume</CardTitle>
            <CardDescription>Volume of new complaints submitted over the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ count: { label: "Complaints", color: "hsl(var(--primary))" } }}>
              <LineChart data={analyticsData.trendData} margin={{ left: 0, right: 20 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} angle={-45} textAnchor="end" height={50} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="count" stroke="var(--color-count)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-4 md:grid-cols-1">
        <Card>
            <CardHeader>
                <CardTitle>Peak Complaint Times</CardTitle>
                <CardDescription>Number of complaints by hour of the day.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{ count: { label: "Complaints", color: "hsl(var(--chart-5))" } }}>
                    <BarChart data={analyticsData.hourlyData} margin={{ left: 0, right: 20 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="hour" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Avg. Lifecycle Stage Duration</CardTitle>
                <CardDescription>Average time (in hours) spent in each stage.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{ avgHours: { label: "Avg. Hours", color: "hsl(var(--chart-2))" } }}>
                    <BarChart data={analyticsData.avgLifecycleData} layout="vertical" margin={{ left: 50 }}>
                        <CartesianGrid horizontal={false} />
                        <YAxis dataKey="stage" type="category" tickLine={false} axisLine={false} tickMargin={10} width={120} style={{fontSize: '12px'}}/>
                        <XAxis dataKey="avgHours" type="number" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="avgHours" fill="var(--color-avgHours)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Departmental Load</CardTitle>
                <CardDescription>Total complaints assigned per department.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={{ value: { label: "Complaints", color: "hsl(var(--chart-1))" } }}>
                    <BarChart data={analyticsData.deptData} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid horizontal={false} />
                        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={10} width={100} style={{fontSize: '12px'}}/>
                        <XAxis dataKey="value" type="number" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>

       <div className="grid gap-4 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Top 10 Complaint Categories</CardTitle>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={{ value: { label: "Complaints", color: "hsl(var(--chart-3))" } }}>
                    <BarChart data={analyticsData.categoryData} margin={{ left: 0, right: 20 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} angle={-45} textAnchor="end" height={70} style={{fontSize: '12px'}} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Complaints by Tehsil</CardTitle>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={{ value: { label: "Complaints", color: "hsl(var(--chart-4))" } }}>
                    <BarChart data={analyticsData.tehsilData} margin={{ left: 0, right: 20 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} angle={-45} textAnchor="end" height={70} style={{fontSize: '12px'}} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
