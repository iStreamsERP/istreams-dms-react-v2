import SalesSummaryCard from "@/components/SalesSummaryCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toTitleCase } from "@/utils/stringUtils";
import { useState } from "react";
import AIPoweredInsights from "../components/AIPoweredInsights";
import ChannelPerformance from "../components/ChannelPerformance";
import DailyReports from "../components/DailyReports";
import DashboardFilter from "../components/DashboardFilter";
import DocumentChannelChart from "../components/DocumentChannelChart";
import DocumentDistribution from "../components/DocumentDistribution";
import TeamDashboard from "../components/TeamDashboard";

export default function DashboardPage() {
  const { userData } = useAuth();
  const [filterDays, setFilterDays] = useState("365");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
      <div className="col-span-2">
        <div>
          <h1 className="font-semibold">
            Welcome back, {toTitleCase(userData.currentUserName)} 👋
          </h1>
          <p className="text-gray-400 text-sm">
            here's what's happening with your account today
          </p>
        </div>
      </div>
      <div className="col-span-2 flex justify-end">
        <DashboardFilter onFilterChange={setFilterDays} />
      </div>

      <div className="col-span-2">
        <SalesSummaryCard daysCount={filterDays} />
      </div>

      <Card className="col-span-2 md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Document Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <DocumentDistribution daysCount={filterDays} />
        </CardContent>
      </Card>

      <Card className="col-span-2 md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Channel Performance</CardTitle>
        </CardHeader>
        <CardContent className="pl-6">
          <ChannelPerformance daysCount={filterDays} />
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
          <DailyReports />
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>My Team</CardTitle>
        </CardHeader>
        <CardContent className="pl-6">
          <TeamDashboard />
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
