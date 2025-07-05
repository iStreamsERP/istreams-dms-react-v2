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
import { MoonLoader } from "react-spinners";

const DocumentChannelChart = ({ daysCount = 30 }) => {
  const [channelData, setChannelData] = useState([]);
  const [userRights, setUserRights] = useState("");
  const [isLoading, setIsLoading] = useState(true);
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
      fetchData(); // This now runs *after* userRights is updated
    }
  }, [userRights, daysCount]);

  // Check if we should show "no data" message
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
          <BarChart data={channelData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis dataKey="Name" stroke="#9CA3AF" fontSize={14} />
            <YAxis stroke="#9CA3AF" fontSize={14} />
            <Tooltip
              wrapperStyle={{ outline: "none" }}
              contentStyle={{
                backgroundColor: "#1F2937", // slate-800
                border: "1px solid #374151", // slate-700
                borderRadius: "0.5rem",
                padding: "0.5rem 0.75rem",
                color: "#F9FAFB", // text-white
                fontSize: "0.875rem", // text-sm
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
              itemStyle={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                color: "#E5E7EB", // slate-200
              }}
              labelStyle={{
                fontWeight: 600,
                fontSize: "0.875rem",
                color: "#93C5FD", // blue-300
              }}
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
      )}
    </div>
  );
};

export default DocumentChannelChart;
