import { useAuth } from "@/contexts/AuthContext";
import { toTitleCase } from "@/utils/stringUtils";

const DashboardPage = () => {
  const { userData } = useAuth();

  return (
    <div className="flex flex-col gap-y-4">
      <div>
        <h1 className="font-semibold">
          Welcome back, {toTitleCase(userData.currentUserName)} 👋
        </h1>
        <p className="text-gray-400 text-sm">
          here's what's happening with your account today
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
