import { callSoapService } from "@/services/callSoapService";
import { useEffect, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useAuth } from "../../contexts/AuthContext";
import { MoonLoader } from "react-spinners";

const DocumentDistributionChart = ({ daysCount = 30 }) => {
  const [overallSummaryData, setOverallSummaryData] = useState([]);
  const [userRights, setUserRights] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { userData } = useAuth();

  const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FED766", "#2AB7CA"];

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

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const hasAccess = userData?.isAdmin || userRights === "Allowed";
      const payloadForTheUser = hasAccess ? "" : userData.userName;

      const payload = {
        NoOfDays: daysCount,
        ForTheUser: payloadForTheUser,
      };

      const data = await callSoapService(
        userData.clientURL,
        "DMS_GetDashboard_OverallSummary",
        payload
      );
      // Convert each object to the expected format for the chart
      const formattedData = data.map((item) => ({
        name: item.CATEGORY,
        value: Number(item.total_count) || 0,
      }));

      setOverallSummaryData(formattedData);
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user rights
  useEffect(() => {
    const initialize = async () => {
      await fetchUserRights();
    };
    initialize();
  }, [userData]);

  useEffect(() => {
    if (userRights !== "") {
      fetchData();
    }
  }, [userRights, daysCount]);

  // Check if we should show "no data" message
  const showNoDataMessage =
    !isLoading &&
    (overallSummaryData.length === 0 ||
      overallSummaryData.every((item) => item.value === 0));

  return (
    <div
      className="cust-card-group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div style={{ width: "100%", height: 300 }}>
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <MoonLoader color="#36d399" height={2} width="100%" />
          </div>
        ) : showNoDataMessage ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <span className="text-lg font-semibold">
              No data available for the selected period
            </span>
            <span className="text-gray-400 text-xs">
              Try selecting a different time range
            </span>
          </div>
        ) : (
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={overallSummaryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                fontSize={14}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {overallSummaryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(31, 41, 55, 0.8)",
                  borderColor: "#4B5563",
                }}
                itemStyle={{ fontSize: 14, color: "#E5E7EB" }}
              />
              <Legend
                wrapperStyle={{ fontSize: 14 }}
                iconType="circle"
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
export default DocumentDistributionChart;
