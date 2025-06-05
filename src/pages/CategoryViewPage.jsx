import GlobalSearchInput from "@/components/GlobalSearchInput";
import { Card } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BarLoader } from "react-spinners";
import TimeRangeSelector from "../components/TimeRangeSelector";
import { useAuth } from "../contexts/AuthContext";
import { getCategoriesSummary } from "../services/dmsService";
import { callSoapService } from "@/services/callSoapService";

const CategoryViewPage = () => {
  const { userData } = useAuth();
  const searchInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [filterDays, setFilterDays] = useState("365");
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const payload = {
          NoOfDays: filterDays,
          ForTheUser: `${userData.isAdmin ? "" : userData.userName}`,
        };

        const response = await callSoapService(
          userData.clientURL,
          "DMS_GetDashboard_CategoriesSummary",
          payload
        );

        setCategories(response);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard summary:", error);
      }
    };

    fetchData();
  }, [filterDays]);

  const filteredCategories = categories.filter((category) => {
    const search = globalFilter.toLowerCase();
    return category.DOC_RELATED_CATEGORY.toLowerCase().includes(search);
  });

  return (
    <div className="space-y-4">
      {/* CONTROLS ROW */}
      <div className="flex flex-col md:flex-row md:justify-between items-stretch gap-2">
        {/* Search */}
        <div className="w-full lg:w-1/2">
            <GlobalSearchInput
              value={globalFilter}
              onChange={setGlobalFilter}
            />
          </div>

        {/* Filter dropdown */}
        <div className="flex-shrink-0">
          <TimeRangeSelector onFilterChange={setFilterDays} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <BarLoader color="#36d399" height={2} width="100%" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <p className="text-center text-sm">No data found...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCategories.map((category) => (
            <Link
              to="/document-view"
              state={{ categoryName: category.DOC_RELATED_CATEGORY }}
              key={category.DOC_RELATED_CATEGORY}
              className="hover:scale-[1.01] transition-transform"
            >
              <Card className="h-20 flex items-center px-4 py-1 rounded-xl shadow-sm hover:shadow-md transition">
                <div className="flex items-center w-full gap-3">
                  <div className="bg-blue-100 text-blue-600 p-1 rounded-md">
                    📁
                  </div>

                  {/* Text Content */}
                  <div className="flex flex-col justify-center w-full overflow-hidden">
                    <h3
                      className="text-sm font-semibold truncate w-full
                      "
                      title={category.DOC_RELATED_CATEGORY}
                    >
                      {category.DOC_RELATED_CATEGORY}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {category.total_count}{" "}
                      {category.total_count === 1 ? "document" : "documents"}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryViewPage;
