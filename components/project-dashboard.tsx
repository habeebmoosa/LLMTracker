import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TrendingUp, TrendingDown, Hash, Zap, Clock, DollarSign, Activity, Server, AlertCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface UsageData {
  id: string;
  timestamp: string;
  model: string;
  provider: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  total_cost: number;
  currency: string;
  request_duration_ms: number;
  status_code: number;
  error_message: string | null;
  input_cost: number;
  output_cost: number;
}

const formatCurrency = (value: number | undefined | null) => {
  if (typeof value !== "number" || isNaN(value)) return "$0.00";
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

const formatNumber = (num: number | undefined | null) => {
  if (typeof num !== "number" || isNaN(num)) return "0";
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

export default function LLMUsageDashboard(
  project: any
) {
  const params = useParams();
  // const projectId = params?.projectId as string;
  const [usage, setUsage] = useState<UsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedMetric, setSelectedMetric] = useState("requests");

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(project)

        if (project.project?.id) {
          const response = await fetch(`/api/v1/usage?projectId=${project.project?.id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch usage data');
          }

          const result = await response.json();
          if (result.error) {
            // throw new Error(result.error);
            throw new Error(result.error)
          }

          setUsage(result.data || []);
        }
      } catch (err) {
        console.error('Error fetching usage data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch usage data');
        toast.error('Failed to load usage data');
      } finally {
        setLoading(false);
      }
    };

    if (project) {
      fetchUsageData();
    }
  }, [project]);

  // Filter data based on time range
  const getFilteredData = () => {
    const now = new Date();
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return usage.filter(u => new Date(u.timestamp) >= cutoff);
  };

  const filteredUsage = getFilteredData();

  // Calculate metrics
  const totalRequests = filteredUsage.length;
  const successfulRequests = filteredUsage.filter(u => u.status_code === 200).length;
  const totalTokens = filteredUsage.reduce((sum, u) => sum + u.total_tokens, 0);
  const avgLatency = filteredUsage.length > 0
    ? Math.round(filteredUsage.reduce((sum, u) => sum + u.request_duration_ms, 0) / filteredUsage.length)
    : 0;
  const estimatedCost = filteredUsage.reduce((sum, u) => sum + u.total_cost, 0);
  const errorRate = totalRequests > 0 ? ((totalRequests - successfulRequests) / totalRequests * 100) : 0;

  // Previous period for comparison
  const prevPeriodData = usage.filter(u => {
    const now = new Date();
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const currentCutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const prevCutoff = new Date(now.getTime() - 2 * days * 24 * 60 * 60 * 1000);
    const date = new Date(u.timestamp);
    return date >= prevCutoff && date < currentCutoff;
  });

  const prevRequests = prevPeriodData.length;
  const prevTokens = prevPeriodData.reduce((sum, u) => sum + u.total_tokens, 0);
  const prevCost = prevPeriodData.reduce((sum, u) => sum + u.total_cost, 0);
  const prevLatency = prevPeriodData.length > 0
    ? Math.round(prevPeriodData.reduce((sum, u) => sum + u.request_duration_ms, 0) / prevPeriodData.length)
    : 0;

  const getChangePercent = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100);
  };

  // Prepare chart data
  const chartDataMap: Record<string, { date: string; requests: number; tokens: number; cost: number; latency: number }> = {};
  filteredUsage.forEach((u) => {
    const date = formatDate(u.timestamp);
    if (!chartDataMap[date]) {
      chartDataMap[date] = { date, requests: 0, tokens: 0, cost: 0, latency: 0 };
    }
    chartDataMap[date].requests += 1;
    chartDataMap[date].tokens += u.total_tokens;
    chartDataMap[date].cost += u.total_cost;
    chartDataMap[date].latency = (chartDataMap[date].latency + u.request_duration_ms) / chartDataMap[date].requests;
  });

  const chartData = Object.values(chartDataMap).sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Model usage data
  const modelUsage = filteredUsage.reduce((acc, u) => {
    acc[u.model] = (acc[u.model] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const modelChartData = Object.entries(modelUsage).map(([model, count]) => ({
    name: model,
    value: count
  }));

  // Provider usage data
  const providerUsage = filteredUsage.reduce((acc, u) => {
    acc[u.provider] = (acc[u.provider] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const MetricCard = ({ title, value, change, icon: Icon, format = (v: any) => v }: any) => {
    const isPositive = change > 0;
    const isNegative = change < 0;

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{format(value)}</div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            {isPositive && <TrendingUp className="h-3 w-3 text-green-500" />}
            {isNegative && <TrendingDown className="h-3 w-3 text-red-500" />}
            <span className={isPositive ? "text-green-500" : isNegative ? "text-red-500" : ""}>
              {change > 0 ? "+" : ""}{change.toFixed(1)}%
            </span>
            <span>from last period</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-2">Error loading usage data</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading usage data...</p>
        </div>
      </div>
    );
  }

  if (!usage.length) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Server className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No usage data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">{project.project.name}' Usage</h1>
            <p className="text-muted-foreground">Monitor your AI model usage and performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Live
            </Badge>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Requests"
            value={totalRequests}
            change={getChangePercent(totalRequests, prevRequests)}
            icon={Hash}
            format={(v: number) => v.toLocaleString()}
          />
          <MetricCard
            title="Total Tokens"
            value={totalTokens}
            change={getChangePercent(totalTokens, prevTokens)}
            icon={Zap}
            format={formatNumber}
          />
          <MetricCard
            title="Avg. Latency"
            value={avgLatency}
            change={getChangePercent(avgLatency, prevLatency)}
            icon={Clock}
            format={(v: number) => `${v}ms`}
          />
          <MetricCard
            title="Estimated Cost"
            value={estimatedCost}
            change={getChangePercent(estimatedCost, prevCost)}
            icon={DollarSign}
            format={formatCurrency}
          />
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {((successfulRequests / totalRequests) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {successfulRequests} of {totalRequests} requests
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Error Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${errorRate < 5 ? 'text-green-600' : errorRate < 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                {errorRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                {totalRequests - successfulRequests} failed requests
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Cost per Request</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(estimatedCost / totalRequests || 0)}
              </div>
              <div className="text-xs text-muted-foreground">
                Per API call
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Usage Overview</CardTitle>
                  <CardDescription>Requests and tokens over time</CardDescription>
                </div>
                <ToggleGroup type="single" value={selectedMetric} onValueChange={setSelectedMetric}>
                  <ToggleGroupItem value="requests">Requests</ToggleGroupItem>
                  <ToggleGroupItem value="tokens">Tokens</ToggleGroupItem>
                  <ToggleGroupItem value="cost">Cost</ToggleGroupItem>
                </ToggleGroup>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="stroke-muted-foreground" />
                      <YAxis className="stroke-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey={selectedMetric}
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Model Distribution</CardTitle>
                  <CardDescription>Usage by AI model</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={modelChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {modelChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Provider Usage</CardTitle>
                  <CardDescription>Requests by provider</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(providerUsage).map(([provider, count]) => (
                      <div key={provider} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4" />
                          <span className="font-medium">{provider}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{count} requests</Badge>
                          <span className="text-sm text-muted-foreground">
                            {((count / totalRequests) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="models">
            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
                <CardDescription>Detailed breakdown by model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Model</th>
                        <th className="text-left py-3 px-4 font-medium">Requests</th>
                        <th className="text-left py-3 px-4 font-medium">Avg. Tokens</th>
                        <th className="text-left py-3 px-4 font-medium">Avg. Latency</th>
                        <th className="text-left py-3 px-4 font-medium">Total Cost</th>
                        <th className="text-left py-3 px-4 font-medium">Success Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(modelUsage).map(([model, count]) => {
                        const modelData = filteredUsage.filter(u => u.model === model);
                        const avgTokens = Math.round(modelData.reduce((sum, u) => sum + u.total_tokens, 0) / count);
                        const avgLatency = Math.round(modelData.reduce((sum, u) => sum + u.request_duration_ms, 0) / count);
                        const totalCost = modelData.reduce((sum, u) => sum + u.total_cost, 0);
                        const successRate = (modelData.filter(u => u.status_code === 200).length / count) * 100;

                        return (
                          <tr key={model} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">{model}</td>
                            <td className="py-3 px-4">{count.toLocaleString()}</td>
                            <td className="py-3 px-4">{formatNumber(avgTokens)}</td>
                            <td className="py-3 px-4">{avgLatency}ms</td>
                            <td className="py-3 px-4">{formatCurrency(totalCost)}</td>
                            <td className="py-3 px-4">
                              <Badge variant={successRate >= 95 ? "default" : successRate >= 90 ? "secondary" : "destructive"}>
                                {successRate.toFixed(1)}%
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Recent Requests</CardTitle>
                <CardDescription>Latest API calls and their details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Timestamp</th>
                        <th className="text-left py-3 px-4 font-medium">Model</th>
                        <th className="text-left py-3 px-4 font-medium">Tokens</th>
                        <th className="text-left py-3 px-4 font-medium">Duration</th>
                        <th className="text-left py-3 px-4 font-medium">Cost</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsage.slice(0, 10).map((request) => (
                        <tr key={request.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            {new Date(request.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{request.model}</Badge>
                          </td>
                          <td className="py-3 px-4">{formatNumber(request.total_tokens)}</td>
                          <td className="py-3 px-4">{request.request_duration_ms}ms</td>
                          <td className="py-3 px-4">{formatCurrency(request.total_cost)}</td>
                          <td className="py-3 px-4">
                            <Badge variant={request.status_code === 200 ? "default" : "destructive"}>
                              {request.status_code}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Latency and throughput analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="stroke-muted-foreground" />
                      <YAxis className="stroke-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="latency" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}