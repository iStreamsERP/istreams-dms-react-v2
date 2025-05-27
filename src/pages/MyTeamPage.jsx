import { SearchIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import LoadingSpinner from "../components/common/LoadingSpinner";
import TeamCard from "../components/TeamProfileCard";
import { useAuth } from "../contexts/AuthContext";
import { getAllDmsActiveUser } from "../services/dashboardService";
import { getEmployeeImage } from "../services/employeeService";
import { BarLoader } from "react-spinners";
import { Input } from "@/components/ui/input";

const MyTeamPage = () => {
  const { userData } = useAuth();
  const searchInputRef = useRef(null);

  const [usersData, setUsersData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsersAndImages = async () => {
      try {
        const userDetails = await getAllDmsActiveUser(
          "",
          userData.currentUserLogin,
          userData.clientURL
        );
        let usersArray = [];

        if (userDetails && Array.isArray(userDetails)) {
          usersArray = userDetails;
        } else {
          usersArray = userDetails ? [userDetails] : [];
        }

        const usersWithImages = await Promise.all(
          usersArray.map(async (user) => {
            try {
              const imageData = await getEmployeeImage(
                user.emp_no,
                userData.currentUserLogin,
                userData.clientURL
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
      } finally {
        setLoading(false);
      }
    };

    fetchUsersAndImages();
  }, [userData.currentUserLogin]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredUsersData = usersData.filter((user) => {
    const search = globalFilter.toLowerCase();
    return user.user_name.toLowerCase().includes(search);
  });

  return (
    <div className="grid grid-cols-1 gap-4">
      <Input
        ref={searchInputRef}
        type="text"
        className="w-1/2 md:w-1/3"
        placeholder="Global Search... (Ctrl+K)"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
      />

      {loading ? (
        <div className="flex justify-center items-start">
          <BarLoader color="#36d399" height={2} width="100%" />
        </div>
      ) : usersData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredUsersData.map((user, index) => (
            <TeamCard key={index} user={user} />
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

export default MyTeamPage;
