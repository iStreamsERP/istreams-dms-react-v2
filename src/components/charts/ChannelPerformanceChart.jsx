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
  const fetchChannelSummary = async () => {
    try {
      const hasAccess = userData?.isAdmin || userRights === "Allowed";

      const payloadForTheUser = hasAccess ? "" : userData.userName;

      const payload = {
        NoOfDays: daysCount,
        ForTheUser: payloadForTheUser,
      };

      const data = await callSoapService(
        userData.clientURL,
        "DMS_GetDashboard_ChannelSummary",
        payload
      );

      // Map the service data to the format expected by Recharts
      const formattedData = data.map((item) => ({
        name:
          item.CHANNEL_SOURCE === " "
            ? userData.organizationName
            : item.CHANNEL_SOURCE,
        value: Number(item.total_count) || 0,
      }));
      setChannelData(formattedData);
    } catch (error) {
      console.error("Error fetching channel summary:", error);
    }
  };

  // Fetch dashboard summary data
  useEffect(() => {
    const initialize = async () => {
      await fetchUserRights(); // Only sets userRights, not summary
    };
    initialize();
  }, [daysCount, userData]);

  useEffect(() => {
    if (userRights !== "") {
      fetchChannelSummary(); // This now runs *after* userRights is updated
    }
  }, [userRights]);

  return (
    <div style={{ width: "100%", height: 300 }}>
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
    </div>
  );
};

export default ChannelPerformanceChart;
