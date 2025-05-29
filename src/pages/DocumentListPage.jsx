import GlobalSearchInput from "@/components/GlobalSearchInput";
import { Button } from "@/components/ui/button";
import { FilePlus2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import DocumentFormModal from "../components/dialog/DocumentFormModal";
import DocumentTable from "../components/DocumentTable";

const DocumentListPage = () => {
  const formModalRef = useRef(null);
  const fetchDataRef = useRef(null);
  const location = useLocation();

  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    if (location.state?.userName) {
      setGlobalFilter(location.state.userName);
    }
  }, [location.state]);

  const fetchData = () => {
    fetchDataRef.current && fetchDataRef.current();
  };

  return (
    <div className="grid grid-cols-1 gap-2">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-2">
        <GlobalSearchInput value={globalFilter} onChange={setGlobalFilter} />

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
