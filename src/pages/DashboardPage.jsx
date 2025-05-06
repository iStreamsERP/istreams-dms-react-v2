import { DashboardPieChart } from "@/components/dashboardCharts/DashboardPieChart";
import { TestChart } from "@/components/dashboardCharts/TestChart";
import { useAuth } from "@/contexts/AuthContext";
import { getUserTasks } from "@/services/taskService";
import { toTitleCase } from "@/utils/stringUtils";
import { useEffect } from "react";

const DashboardPage = () => {
  const { userData } = useAuth();

  useEffect(() => {
    fetchUser();
  });

  const fetchUser = async () => {
    const res = await getUserTasks(
      userData.currentUserLogin,
      userData.currentUserLogin,
      userData.clientURL
    );

    console.log(res);
  };

  return (
    <div className="flex flex-col gap-y-4">
      <div>
        <h1 className="font-semibold">
          Welcome back, {toTitleCase(userData.currentUserName)} 👋
        </h1>
        <p className="text-gray-400 text-sm">
          here's what's happening with your account today
        </p>

        <DashboardPieChart />
        <TestChart />
      </div>
    </div>
  );
};

export default DashboardPage;
