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
import { getDashboardOverallSummary } from "../../services/dashboardService";

const DocumentDistributionChart = ({ daysCount = 30 }) => {
  const [overallSummaryData, setOverallSummaryData] = useState([]);
  const { userData } = useAuth();

  const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FED766", "#2AB7CA"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const payloadForTheUser = userData.isAdmin ? "" : `${userData.userName}`;

        const payload = {
          NoOfDays: daysCount,
          ForTheUser: payloadForTheUser,
        };

        const data = await getDashboardOverallSummary(
          payload,
          userData.userEmail,
          userData.clientURL
        );
        // Convert each object to the expected format for the chart
        const formattedData = data.map((item) => ({
          name: item.CATEGORY,
          value: Number(item.total_count) || 0,
        }));
        setOverallSummaryData(formattedData);
      } catch (error) {
        console.error("Error fetching dashboard summary:", error);
      }
    };

    if (daysCount != null) {
      fetchData();
    }
  }, [daysCount]);

  return (
    <div
      className="cust-card-group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div style={{ width: "100%", height: 300 }}>
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
      </div>
    </div>
  );
};
export default DocumentDistributionChart;
