import ChannelPerformanceChart from "@/components/charts/ChannelPerformanceChart";
import DailyReportsChart from "@/components/charts/DailyReportsChart";
import DocumentChannelChart from "@/components/charts/DocumentChannelChart";
import DocumentDistributionChart from "@/components/charts/DocumentDistributionChart";
import SalesSummaryCard from "@/components/SalesSummaryCard";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toTitleCase } from "@/utils/stringUtils";
import { useState } from "react";
import AIPoweredInsights from "../components/AIPoweredInsights";

export default function DashboardPage() {
  const { userData } = useAuth();
  const [filterDays, setFilterDays] = useState("365");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
      <div className="col-span-2">
        <div>
          <p className="text-xs text-gray-500">
            {userData.isAdmin ? "Admin Dashboard" : "User Dashboard"}
          </p>
          <h1 className="font-semibold">
            Welcome back, {toTitleCase(userData.userName)} 👋
          </h1>
          <p className="text-gray-400 text-sm">
            here's what's happening with your account today
          </p>
        </div>
      </div>
      <div className="col-span-2 flex justify-end">
        <TimeRangeSelector onFilterChange={setFilterDays} />
      </div>

      <div className="col-span-2">
        <SalesSummaryCard daysCount={filterDays} />
      </div>

      <Card className="col-span-2 md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Document Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <DocumentDistributionChart daysCount={filterDays} />
        </CardContent>
      </Card>

      <Card className="col-span-2 md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Channel Performance</CardTitle>
        </CardHeader>
        <CardContent className="pl-6">
          <ChannelPerformanceChart daysCount={filterDays} />
        </CardContent>
      </Card>

      <Card className="col-span-2 md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Documents by channel</CardTitle>
        </CardHeader>
        <CardContent className="pl-6">
          <DocumentChannelChart daysCount={filterDays} />
        </CardContent>
      </Card>

      <Card className="col-span-2 md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Daily Reports</CardTitle>
        </CardHeader>
        <CardContent className="pl-6">
          <DailyReportsChart />
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>AI-Powered Insights</CardTitle>
        </CardHeader>
        <CardContent className="pl-6">
          <AIPoweredInsights />
        </CardContent>
      </Card>
    </div>
  );
}
