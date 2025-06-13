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
import { callSoapService } from "@/services/callSoapService";
import { MoonLoader } from "react-spinners";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088FE",
  "#00C49F",
];

const ChannelPerformanceChart = ({ daysCount = 30 }) => {
  const [channelData, setChannelData] = useState([]);
  const [userRights, setUserRights] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { userData } = useAuth();

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

      const response = await callSoapService(
        userData.clientURL,
        "DMS_GetDashboard_ChannelSummary",
        payload
      );

      // Map the service data to the format expected by Recharts
      const formattedData = response.map((item) => ({
        name:
          item.CHANNEL_SOURCE === " "
            ? userData.organizationName
            : item.CHANNEL_SOURCE,
        value: Number(item.total_count) || 0,
      }));
      setChannelData(formattedData);
    } catch (error) {
      console.error("Error fetching channel summary:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch dashboard summary data
  useEffect(() => {
    const initialize = async () => {
      await fetchUserRights(); // Only sets userRights, not summary
    };
    initialize();
  }, [userData]);

  useEffect(() => {
    if (userRights !== "") {
      fetchData();
    }
  }, [userRights, daysCount]);

  const showNoDataMessage =
    !isLoading &&
    (channelData.length === 0 || channelData.every((item) => item.value === 0));

  return (
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
              data={channelData}
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
              {channelData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(12, 14, 16, 0.8)",
                borderColor: "#4B5563",
                borderRadius: "8px",
                padding: "6px",
                fontSize: "12px",
              }}
              itemStyle={{ fontSize: 12, color: "#E5E7EB" }}
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
  );
};

export default ChannelPerformanceChart;
