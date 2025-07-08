import GlobalSearchInput from "@/components/GlobalSearchInput";
import { Button } from "@/components/ui/button";
import { FilePlus2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import DocumentFormModal from "../components/dialog/DocumentFormModal";
import DocumentTable from "../components/DocumentTable";
import AccessDenied from "@/components/AccessDenied";
import { BarLoader } from "react-spinners";
import { usePermissions } from "@/hooks/usePermissions";
import { useTour } from "@reactour/tour";
import { useToast } from "@/hooks/use-toast";

const DocumentListPage = () => {
  const { toast } = useToast();
  const { setIsOpen, setSteps, setCurrentStep } = useTour();
  const formModalRef = useRef(null);
  const fetchDataRef = useRef(null);
  const location = useLocation();
  const [userRights, setUserRights] = useState("");
  const [rightsChecked, setRightsChecked] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const { hasPermission } = usePermissions();

  // Populate global filter from location state
  useEffect(() => {
    if (location.state?.userName) {
      setGlobalFilter(location.state.userName);
    }
  }, [location.state]);

  useEffect(() => {
    fetchUserRights();
  }, []);

  const fetchData = () => {
    fetchDataRef.current && fetchDataRef.current();
  };

  const fetchUserRights = async () => {
    try {
      const result = await hasPermission("VIEW_ALL_DOCS");
      setUserRights(result ? "Allowed" : "Denied");
    } catch (error) {
      console.error("Permission check failed:", error);
      toast({
        variant: "destructive",
        title: "Permission Error",
        description: error.message || "Failed to check document permissions.",
      });
    } finally {
      setRightsChecked(true);
    }
  };

  // Define tour steps
  const dashboardSteps = [
    {
      selector: '[data-tour="time-range"]',
      content:
        "Here you can select different time ranges to filter dashboard data.",
    },
    {
      selector: '[data-tour="restart-tour"]',
      content: "Click here anytime to restart the guided tour.",
    },
    {
      selector: '[data-tour="add-document"]',
      content: "Click this button to add a new document to the system.",
    },
  ];

  // Run tour on first load
  useEffect(() => {
    setSteps(dashboardSteps);

    const hasSeenTour = localStorage.getItem("dashboard_tour_seen");
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem("dashboard_tour_seen", "true");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [setSteps, setIsOpen]);

  const startTour = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  return (
    <div className="grid grid-cols-1 gap-2">
      {!rightsChecked ? (
        <div className="flex justify-center items-start">
          <BarLoader color="#36d399" height={2} width="100%" />
        </div>
      ) : userRights !== "Allowed" ? (
        <AccessDenied />
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-2">
            <div className="w-full lg:w-1/2" data-tour="time-range">
              <GlobalSearchInput
                value={globalFilter}
                onChange={setGlobalFilter}
              />
            </div>

            <Button
              onClick={() => formModalRef.current.showModal()}
              data-tour="add-document"
            >
              Add Document <FilePlus2 className="h-4 w-4" />
            </Button>
          </div>

          <DocumentTable
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            fetchDataRef={fetchDataRef}
          />

          <DocumentFormModal
            formModalRef={formModalRef}
            onUploadSuccess={fetchData}
          />
        </>
      )}

      {/* Tour Trigger Button */}
      <button
        onClick={startTour}
        className="fixed bottom-8 right-24 z-[9999] p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all"
        data-tour="restart-tour"
      >
        <p className="text-sm">Start Tour</p>
      </button>
    </div>
  );
};

export default DocumentListPage;
