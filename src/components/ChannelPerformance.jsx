import React, { useEffect, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useAuth } from "../contexts/AuthContext";
import { getDashboardChannelSummary } from "../services/dashboardService";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088FE",
  "#00C49F",
];

const ChannelPerformance = ({ daysCount = 30 }) => {
  const [channelData, setChannelData] = useState([]);
  const { userData, auth } = useAuth();

  useEffect(() => {
    const fetchChannelSummary = async () => {
      try {
        const payload = {
          NoOfDays: daysCount,
          ForTheUser: `${auth.isAdmin ? "" : userData.currentUserName}`,
        };

        const data = await getDashboardChannelSummary(
          payload,
          userData.currentUserLogin,
          userData.clientURL
        );

        // Map the service data to the format expected by Recharts
        const formattedData = data.map((item) => ({
          name:
            item.CHANNEL_SOURCE === " "
              ? userData.organization
              : item.CHANNEL_SOURCE,
          value: Number(item.total_count) || 0,
        }));
        setChannelData(formattedData);
      } catch (error) {
        console.error("Error fetching channel summary:", error);
      }
    };

    if (daysCount != null) {
      fetchChannelSummary();
    }
  }, [daysCount]);

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
    </div>
  );
};

export default ChannelPerformance;
