import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { callSoapService } from "@/services/callSoapService";
import { getDashboardOverallSummary } from "@/services/dashboardService";
import {
  CheckCircle,
  ClipboardCheck,
  FileQuestion,
  FileText,
  Loader,
} from "lucide-react";
import { useEffect, useState } from "react";

const DocumentSummaryCard = ({ daysCount = 30 }) => {
  const [summaryData, setSummaryData] = useState(null);
  const { userData } = useAuth();

  // Fetch dashboard summary data
  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      try {
        if (!userData) return;

        const payloadForTheUser = userData.isAdmin
          ? ""
          : `${userData.userName}`;

        const payload = {
          NoOfDays: daysCount,
          ForTheUser: payloadForTheUser,
        };

        const response = await callSoapService(
          userData.clientURL,
          "DMS_GetDashboard_OverallSummary",
          payload
        );

        const summaryObj = response.reduce((acc, item) => {
          acc[item.CATEGORY] = Number(item.total_count);
          return acc;
        }, {});

        if (isMounted) setSummaryData(summaryObj);
      } catch (error) {
        if (isMounted)
          console.error("Error fetching dashboard summary:", error);
      }
    };

    if (daysCount != null) fetchSummary();
    return () => {
      isMounted = false;
    };
  }, [daysCount, userData]);

  const safePct = (value, total) => {
    if (typeof value !== "number" || typeof total !== "number" || total <= 0)
      return 0;
    const pct = (value / total) * 100;
    return isNaN(pct) ? 0 : +pct.toFixed(1);
  };

  const stats = summaryData
    ? [
        {
          title: "Total Documents",
          count: summaryData["Total Documents"] || 0,
          icon: FileText,
          color: "#6366F1",
          percentage: null,
        },
        {
          title: "Verified Documents",
          count: summaryData["Verified Documents"] || 0,
          icon: CheckCircle,
          color: "#22C55E",
          percentage: safePct(
            summaryData["Verified Documents"],
            summaryData["Total Documents"]
          ),
          name: "Total Documents",
        },
        {
          title: "Assigned Documents",
          count: summaryData["Assigned Documents"] || 0,
          icon: FileQuestion,
          color: "#EF4444",
          percentage: safePct(
            summaryData["Assigned Documents"],
            summaryData["Verified Documents"]
          ),
          name: "Verified Documents",
        },
        {
          title: "In-progress Documents",
          count: summaryData["In-progress Documents"] || 0,
          icon: Loader,
          color: "#3B82F6",
          percentage: safePct(
            summaryData["In-progress Documents"],
            summaryData["Verified Documents"]
          ),
          name: "Verified Documents",
        },
        {
          title: "Completed Documents",
          count: summaryData["Completed Documents"] || 0,
          icon: ClipboardCheck,
          color: "#F59E0B",
          percentage: safePct(
            summaryData["Completed Documents"],
            summaryData["Verified Documents"]
          ),
          name: "Verified Documents",
        },
      ]
    : [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
      {stats.map((stat, idx) => (
        <Card
          key={idx}
          className="bg-gradient-to-t from-slate-900 to-blue-900 text-white"
        >
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="flex justify-between w-full gap-1 items-center text-sm font-medium">
              {stat.title}
              <div className="p-2 bg-white rounded-full">
                <stat.icon className="h-4 w-4" color={stat.color} />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stat.count}</div>
            {stat.percentage != null && (
              <p className="text-xs text-muted-foreground mt-1">
                <span style={{ color: stat.color }}>
                  {stat.percentage.toFixed
                    ? stat.percentage
                    : (+stat.percentage).toFixed(1)}
                  %
                </span>{" "}
                of {stat.name}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DocumentSummaryCard;
