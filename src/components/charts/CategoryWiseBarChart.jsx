import { callSoapService } from "@/services/callSoapService";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { MoonLoader } from "react-spinners";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const CategoryWiseBarChart = ({ daysCount = 30 }) => {
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
      const payload = {
        NoOfDays: daysCount,
        ForTheUser: hasAccess ? "" : userData.userName,
      };

      const response = await callSoapService(
        userData.clientURL,
        "DMS_GetDashboard_CategoriesSummary",
        payload
      );

      const totalCount = response.reduce(
        (sum, item) => sum + (Number(item.total_count) || 0),
        0
      );

      const formattedData = response.map((item) => {
        const value = Number(item.total_count) || 0;
        const percentage = totalCount > 0 ? (value / totalCount) * 100 : 0;

        return {
          category: item.DOC_RELATED_CATEGORY,
          value,
          percentage: Number(percentage.toFixed(0)),
        };
      });

      setChannelData(formattedData);
    } catch (error) {
      console.error("Error fetching channel summary:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const showNoDataMessage =
    !isLoading &&
    (channelData.length === 0 || channelData.every((item) => item.value === 0));

  // Calculate total documents for footer
  const totalDocuments = channelData.reduce(
    (total, item) => total + item.value,
    0
  );

  // Find max value for scaling
  const maxValue = Math.max(...channelData.map((item) => item.value), 0);

  return (
    <>
      {isLoading ? (
        <div className="flex h-[300px] items-end justify-between gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton
                className="w-12 rounded-t-md"
                style={{ height: `${Math.random() * 80 + 20}%` }}
              />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      ) : showNoDataMessage ? (
        <div className="flex h-[300px] flex-col items-center justify-center text-center p-4">
          <span className="text-lg font-semibold">
            No data available for the selected period
          </span>
          <span className="text-gray-400 text-xs">
            Try selecting a different time range
          </span>
        </div>
      ) : (
        <div className="flex h-[300px] items-end justify-between gap-4">
          {channelData.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 flex-1 h-full"
            >
              <div className="text-sm font-medium text-gray-500">
                {item.value}
              </div>
              <div className="flex flex-col items-center justify-end w-full h-full">
                <div
                  className="w-full rounded-t-md transition-all duration-300 ease-in-out"
                  style={{
                    height: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 text-center h-10 flex items-center justify-center">
                {item.category}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
