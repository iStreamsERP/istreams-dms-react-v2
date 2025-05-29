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
import { getDashboardChannelSummary } from "../../services/dashboardService";

const DocumentChannelChart = ({ daysCount = 30 }) => {
  const [channelData, setChannelData] = useState([]);
  const { userData } = useAuth();

  const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"];

  useEffect(() => {
    const fetchData = async () => {
      try {
         const payloadForTheUser = userData.isAdmin ? "" : `${userData.userName}`;

        const payload = {
          NoOfDays: daysCount,
          ForTheUser: payloadForTheUser,
        };

        const data = await getDashboardChannelSummary(
          payload,
          userData.userEmail,
          userData.clientURL
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

    if (daysCount != null) {
      fetchData();
    }
  }, [daysCount]);

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
