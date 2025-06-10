import GlobalSearchInput from "@/components/GlobalSearchInput";
import { Button } from "@/components/ui/button";
import { FilePlus2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import DocumentFormModal from "../components/dialog/DocumentFormModal";
import DocumentTable from "../components/DocumentTable";
import AccessDenied from "@/components/AccessDenied";
import { useAuth } from "@/contexts/AuthContext";
import { callSoapService } from "@/services/callSoapService";

const DocumentListPage = () => {
  const { userData } = useAuth();

  const formModalRef = useRef(null);
  const fetchDataRef = useRef(null);
  const location = useLocation();

  const [userRights, setUserRights] = useState("");

  const [globalFilter, setGlobalFilter] = useState("");

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
    const userType = userData.isAdmin ? "ADMINISTRATOR" : "USER";
    const payload = {
      UserName: userData.userName,
      FormName: "DMS-DOCUMENTLIST",
      FormDescription: "Document List",
      UserType: userType,
    };

    const response = await callSoapService(
      userData.clientURL,
      "DMS_CheckRights_ForTheUser",
      payload
    );

    setUserRights(response);
  };

  if (userRights !== "Allowed") {
    return <AccessDenied />;
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-2">
        <div className="w-full lg:w-1/2">
          <GlobalSearchInput value={globalFilter} onChange={setGlobalFilter} />
        </div>

        <Button onClick={() => formModalRef.current.showModal()}>
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
    </div>
  );
};

export default DocumentListPage;
