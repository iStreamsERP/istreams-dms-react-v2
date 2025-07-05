import { CategoryWisePieChart } from "@/components/charts/CategoryWisePieChart";
import ChannelPerformanceChart from "@/components/charts/ChannelPerformanceChart";
import DocumentChannelChart from "@/components/charts/DocumentChannelChart";
import DocumentDistributionChart from "@/components/charts/DocumentDistributionChart";
import { ModuleWisePieChart } from "@/components/charts/ModuleWisePieChart";
import SalesSummaryCard from "@/components/SalesSummaryCard";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { callSoapService } from "@/services/callSoapService";
import { useEffect, useState } from "react";
import AIPoweredInsights from "../components/AIPoweredInsights";
import { useTour } from "@reactour/tour";
import { usePermissions } from "@/hooks/usePermissions";

export default function DashboardPage() {
  const { setIsOpen, setSteps, setCurrentStep } = useTour();
  const { userData } = useAuth();
  const [filterDays, setFilterDays] = useState("365");
  const { hasPermission } = usePermissions();

  const [canViewFullDashboard, setCanViewFullDashboard] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      const result = await hasPermission("DASHBOARD_FULL_VIEW");
      setCanViewFullDashboard(result);
    };

    if (userData?.userEmail) {
      checkPermission();
    }
  }, [userData.userEmail]);

  // Define tour steps
  const dashboardSteps = [
    {
      selector: '[data-tour="time-range"]',
      content:
        "Here you can select different time ranges to filter dashboard data",
    },
    {
      selector: '[data-tour="sales-summary"]',
      content: "This shows key sales metrics for the selected period",
    },
    {
      selector: '[data-tour="document-distribution"]',
      content: "Visualizes document status across your organization",
    },
    {
      selector: '[data-tour="category-performance"]',
      content: "Shows performance breakdown by document categories",
    },
    {
      selector: '[data-tour="module-performance"]',
      content: "Displays performance metrics by business modules",
    },
    {
      selector: '[data-tour="ai-insights"]',
      content: "AI-powered analysis of your business data",
    },
    {
      selector: '[data-tour="channel-performance"]',
      content: "Compares performance across different channels",
    },
    {
      selector: '[data-tour="documents-by-channel"]',
      content: "Shows document distribution by channel source",
    },
    {
      selector: '[data-tour="restart-tour"]',
      content: "You can restart this tour anytime using this button",
      position: "top",
    },
  ];

  useEffect(() => {
    // Initialize tour steps
    setSteps(dashboardSteps);

    // Start tour on first visit
    const hasSeenTour = localStorage.getItem("dashboard_tour_seen");
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem("dashboard_tour_seen", "true");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {/* Header */}
      <div
        className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-end"
        data-tour="time-range"
      >
        <div className="flex flex-wrap justify-between items-center w-full gap-4">
          <h1 className="text-lg font-semibold">
            {userData?.isAdmin || canViewFullDashboard === "Allowed"
              ? "Admin Dashboard"
              : "User Dashboard"}
          </h1>
          <TimeRangeSelector onFilterChange={setFilterDays} />
        </div>
      </div>

      {/* Sales Summary */}
      <div
        className="col-span-1 md:col-span-2 lg:col-span-3"
        data-tour="sales-summary"
      >
        <SalesSummaryCard daysCount={filterDays} />
      </div>

      {/* First row of cards */}
      <Card
        className="col-span-1 md:col-span-1 lg:col-span-1"
        data-tour="document-distribution"
      >
        <CardHeader className="p-2">
          <CardTitle className="text-lg">
            Document Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <DocumentDistributionChart daysCount={filterDays} />
        </CardContent>
      </Card>

      <Card
        className="col-span-1 md:col-span-1 lg:col-span-1"
        data-tour="category-performance"
      >
        <CardHeader className="p-2">
          <CardTitle className="text-lg">Category Wise Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <CategoryWisePieChart daysCount={filterDays} />
        </CardContent>
      </Card>

      <Card
        className="col-span-1 md:col-span-1 lg:col-span-1"
        data-tour="module-performance"
      >
        <CardHeader className="p-2">
          <CardTitle className="text-lg">Module wise Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <ModuleWisePieChart daysCount={filterDays} />
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card
        className="col-span-1 md:col-span-1 lg:col-span-1"
        data-tour="ai-insights"
      >
        <CardHeader>
          <CardTitle>AI-Powered Insights</CardTitle>
        </CardHeader>
        <CardContent className="pl-6">
          <AIPoweredInsights />
        </CardContent>
      </Card>

      <Card
        className="col-span-1 md:col-span-1 lg:col-span-1"
        data-tour="channel-performance"
      >
        <CardHeader className="p-2">
          <CardTitle className="text-lg">Channel Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <ChannelPerformanceChart daysCount={filterDays} />
        </CardContent>
      </Card>

      <Card
        className="col-span-1 md:col-span-1 lg:col-span-1"
        data-tour="documents-by-channel"
      >
        <CardHeader className="p-2">
          <CardTitle className="text-lg">Documents by channel</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <DocumentChannelChart daysCount={filterDays} />
        </CardContent>
      </Card>

      {/* Tour Trigger Button */}
      <button
        onClick={startTour}
        className="fixed bottom-4 right-4 z-[9999] p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all"
        data-tour="restart-tour"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </button>
    </div>
  );
}
