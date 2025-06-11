import { callSoapService } from "@/services/callSoapService";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "../../contexts/AuthContext";

const DocumentChannelChart = ({ daysCount = 30 }) => {
  const [channelData, setChannelData] = useState([]);
    const [userRights, setUserRights] = useState("");
  const { userData } = useAuth();

  const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"];

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

      const formattedData = data.map((item) => ({
        Name:
          item.CHANNEL_SOURCE === " "
            ? userData.organizationName
            : item.CHANNEL_SOURCE,
        Counts: Number(item.total_count) || 0,
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
      fetchData(); // This now runs *after* userRights is updated
    }
  }, [userRights]);

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={channelData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
          <XAxis dataKey="Name" stroke="#9CA3AF" fontSize={14} />
          <YAxis stroke="#9CA3AF" fontSize={14} />
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
          <Bar dataKey={"Counts"} fill="#8884d8">
            {channelData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DocumentChannelChart;
