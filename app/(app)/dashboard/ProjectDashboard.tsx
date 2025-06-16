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
} from "recharts";

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

interface ProjectDashboardProps {
//   apiKey: string;
  projectId: string;
}

const formatCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ projectId }) => {
  const [usage, setUsage] = useState<UsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/v1/usage?projectId=${projectId}`
        );
        const json = await res.json();
        setUsage(json.data || []);
        console.log("Here the usage data")
        console.log(json.data)
      } catch (e) {
        setError("Failed to fetch usage data");
        console.log("Failed to fetch usage data")
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchUsage();
  }, [projectId]);

  // Aggregate data for summary cards
  const totalRequests = usage.length;
  const totalTokens = usage.reduce((sum, u) => sum + u.total_tokens, 0);
  const avgLatency =
    usage.length > 0
      ? Math.round(
          usage.reduce((sum, u) => sum + u.request_duration_ms, 0) / usage.length
        )
      : 0;
  const estimatedCost = usage.reduce((sum, u) => sum + u.total_cost, 0);

  // Prepare data for chart (group by day)
  const chartDataMap: Record<string, { date: string; requests: number; tokens: number }> = {};
  usage.forEach((u) => {
    const date = formatDate(u.timestamp);
    if (!chartDataMap[date]) {
      chartDataMap[date] = { date, requests: 0, tokens: 0 };
    }
    chartDataMap[date].requests += 1;
    chartDataMap[date].tokens += u.total_tokens;
  });
  const chartData = Object.values(chartDataMap).sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-muted/50 rounded-xl p-6 shadow flex flex-col items-start">
          <div className="text-sm text-muted-foreground">Total Requests</div>
          <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-muted/50 rounded-xl p-6 shadow flex flex-col items-start">
          <div className="text-sm text-muted-foreground">Total Tokens</div>
          <div className="text-2xl font-bold">{totalTokens.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-muted/50 rounded-xl p-6 shadow flex flex-col items-start">
          <div className="text-sm text-muted-foreground">Avg. Latency</div>
          <div className="text-2xl font-bold">{avgLatency}ms</div>
        </div>
        <div className="bg-white dark:bg-muted/50 rounded-xl p-6 shadow flex flex-col items-start">
          <div className="text-sm text-muted-foreground">Estimated Cost</div>
          <div className="text-2xl font-bold">{formatCurrency(estimatedCost)}</div>
        </div>
      </div>
      <div className="bg-white dark:bg-muted/50 rounded-xl p-6 shadow">
        <div className="text-lg font-semibold mb-4">Usage Overview</div>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" label={{ value: "Requests", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "Tokens", angle: 90, position: "insideRight" }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="requests" stroke="#8884d8" name="Requests" />
              <Line yAxisId="right" type="monotone" dataKey="tokens" stroke="#82ca9d" name="Tokens" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {loading && <div className="text-center text-muted-foreground">Loading...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}
    </div>
  );
}; 