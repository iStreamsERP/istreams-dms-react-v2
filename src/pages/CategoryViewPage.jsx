import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BarLoader } from "react-spinners";
import DashboardFilter from "../components/DashboardFilter";
import { useAuth } from "../contexts/AuthContext";
import { getCategoriesSummary } from "../services/dmsService";

const CategoryViewPage = () => {
  const { userData, auth } = useAuth();
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
          ForTheUser: `${auth.isAdmin ? "" : userData.currentUserName}`,
        };

        const response = await getCategoriesSummary(
          payload,
          userData.currentUserLogin,
          userData.clientURL
        );

        setCategories(response);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard summary:", error);
      }
    };

    fetchData();
  }, [filterDays]);

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

  const filteredCategories = categories.filter((category) => {
    const search = globalFilter.toLowerCase();
    return category.DOC_RELATED_CATEGORY.toLowerCase().includes(search);
  });

  return (
    <div className="space-y-4">
      {/* CONTROLS ROW */}
      <div className="flex flex-col md:flex-row md:justify-between items-stretch gap-2">
        {/* Search */}
        <Input
        ref={searchInputRef}
          type="text"
          className="grow"
          placeholder="Global Search... (Ctrl+K)"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
        {/* Filter dropdown */}
        <div className="flex-shrink-0">
          <DashboardFilter onFilterChange={setFilterDays} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <BarLoader color="#36d399" height={2} width="100%" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <p>No data found...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCategories.map((category) => (
            <Card
              key={category.DOC_RELATED_CATEGORY}
              className="col-span-2 md:col-span-2 lg:col-span-1"
            >
              <CardContent className="p-2">
                <div className="text-center">
                  <div className="flex flex-col-reverse items-center">
                    <h1 className="text-sm font-bold">
                      ({category.total_count})
                    </h1>
                    <h6 className="text-sm">{category.DOC_RELATED_CATEGORY}</h6>
                  </div>

                  <div className="mt-2">
                    <Link
                      to="/document-view"
                      state={{ categoryName: category.DOC_RELATED_CATEGORY }}
                      className="inline-flex items-center gap-x-1 text-sm font-semibold rounded-lg border border-transparent text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-500 dark:hover:text-blue-600"
                    >
                      View Documents
                      <ChevronRight size={18} />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryViewPage;
