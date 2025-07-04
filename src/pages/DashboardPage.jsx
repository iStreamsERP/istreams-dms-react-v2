import ChannelPerformanceChart from "@/components/charts/ChannelPerformanceChart";
import DailyReportsChart from "@/components/charts/DailyReportsChart";
import DocumentChannelChart from "@/components/charts/DocumentChannelChart";
import DocumentDistributionChart from "@/components/charts/DocumentDistributionChart";
import SalesSummaryCard from "@/components/SalesSummaryCard";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toTitleCase } from "@/utils/stringUtils";
import { useEffect, useState } from "react";
import AIPoweredInsights from "../components/AIPoweredInsights";
import { callSoapService } from "@/services/callSoapService";

export default function DashboardPage() {
  const { userData } = useAuth();
  const [filterDays, setFilterDays] = useState("365");
  const [userRights, setUserRights] = useState("");

  useEffect(() => {
    fetchUserRights();
  }, []);

  const fetchUserRights = async () => {
    try {
      const userType = userData.isAdmin ? "ADMINISTRATOR" : "USER";
      const payload = {
        UserName: userData.userName,
        FormName: "DMS-DASHBOARDADMIN",
        FormDescription: "Dashboard Full View",
        UserType: userType,
      };

      const response = await callSoapService(
        userData.clientURL,
        "DMS_CheckRights_ForTheUser",
        payload
      );

      setUserRights(response);
    } catch (error) {
      console.error("Failed to fetch user rights:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {/* Header - Full width on all screens */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-end">
        <div className="flex flex-wrap justify-between items-center w-full gap-4">
          <h1 className="text-lg font-semibold">
            {userData?.isAdmin || userRights === "Allowed"
              ? "Admin Dashboard"
              : "User Dashboard"}
          </h1>
          <TimeRangeSelector onFilterChange={setFilterDays} />
        </div>
      </div>

      {/* Sales Summary - Full width */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <SalesSummaryCard daysCount={filterDays} />
      </div>

      {/* First row of cards - 3 columns on lg+ */}
      <Card className="col-span-1 md:col-span-1 lg:col-span-1">
        <CardHeader className="p-2">
          <CardTitle className="text-lg">
            Document Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <DocumentDistributionChart daysCount={filterDays} />
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-1 lg:col-span-1">
        <CardHeader className="p-2">
          <CardTitle className="text-lg">Category Wise Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <DocumentDistributionChart daysCount={filterDays} />
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-1 lg:col-span-1">
        <CardHeader className="p-2">
          <CardTitle className="text-lg">Module wise Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <DocumentDistributionChart daysCount={filterDays} />
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-1 lg:col-span-1">
        <CardHeader className="p-2">
          <CardTitle className="text-lg">Channel Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <ChannelPerformanceChart daysCount={filterDays} />
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-1 lg:col-span-1">
        <CardHeader className="p-2">
          <CardTitle className="text-lg">Documents by channel</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <DocumentChannelChart daysCount={filterDays} />
        </CardContent>
      </Card>

      {/* Second row of cards */}
      <Card className="col-span-1 md:col-span-1 lg:col-span-1">
        <CardHeader>
          <CardTitle>Daily Reports</CardTitle>
        </CardHeader>
        <CardContent className="pl-6">
          <DailyReportsChart />
        </CardContent>
      </Card>

      {/* AI Insights - Full width */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
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
