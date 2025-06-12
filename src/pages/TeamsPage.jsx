import GlobalSearchInput from "@/components/GlobalSearchInput";
import { useToast } from "@/hooks/use-toast";
import { callSoapService } from "@/services/callSoapService";
import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import TeamProfileCard from "../components/TeamProfileCard";
import { useAuth } from "../contexts/AuthContext";

const TeamsPage = () => {
  const { userData } = useAuth();
  const { toast } = useToast();

  const [usersData, setUsersData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const rights = await fetchUserRights();
      await fetchUsersAndImages(rights);
    };

    if (userData?.userEmail) {
      fetchData();
    }
  }, [userData.userEmail]);

  const fetchUserRights = async () => {
    try {
      const userType = userData.isAdmin ? "ADMINISTRATOR" : "USER";
      const payload = {
        UserName: userData.userName,
        FormName: "DMS-TEAMSFULLVIEW",
        FormDescription: "Teams All Users",
        UserType: userType,
      };

      const response = await callSoapService(
        userData.clientURL,
        "DMS_CheckRights_ForTheUser",
        payload
      );

      return response;
    } catch (error) {
      console.error("Failed to fetch user rights:", error);
      toast({
        variant: "destructive",
        title: error,
      });
      return "";
    }
  };

  const fetchUsersAndImages = async (rights) => {
    try {
      const payload = {
        UserName: userData.userName,
      };

      const userDetails = await callSoapService(
        userData.clientURL,
        "DMS_Get_All_ActiveUsers",
        payload
      );

      let usersArray = [];

      if (rights === "Allowed") {
        usersArray = Array.isArray(userDetails) ? userDetails : [userDetails];
      } else {
        usersArray = (
          Array.isArray(userDetails) ? userDetails : [userDetails]
        ).filter((user) => user.user_name === userData.userName);
      }

      const usersWithImages = await Promise.all(
        usersArray.map(async (user) => {
          try {
            const payload = {
              EmpNo: user.emp_no,
            };

            const imageData = await callSoapService(
              userData.clientURL,
              "getpic_bytearray",
              payload
            );

            return {
              ...user,
              image: imageData
                ? `data:image/jpeg;base64,${imageData}`
                : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbBa24AAg4zVSuUsL4hJnMC9s3DguLgeQmZA&s",
            };
          } catch (error) {
            console.error(
              `Error fetching image for user ${user.emp_no}:`,
              error
            );
            return {
              ...user,
              image:
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbBa24AAg4zVSuUsL4hJnMC9s3DguLgeQmZA&s",
            };
          }
        })
      );

      setUsersData(usersWithImages);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        variant: "destructive",
        title: error,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsersData = usersData.filter((user) => {
    const search = globalFilter?.toLowerCase();
    return user.user_name?.toLowerCase()?.includes(search);
  });

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="w-full lg:w-1/2">
        <GlobalSearchInput value={globalFilter} onChange={setGlobalFilter} />
      </div>

      {loading ? (
        <div className="flex justify-center items-start">
          <BarLoader color="#36d399" height={2} width="100%" />
        </div>
      ) : usersData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredUsersData.map((user, index) => (
            <TeamProfileCard key={`${user.emp_no}-${index}`} user={user} />
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-gray-400">No data found</p>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
