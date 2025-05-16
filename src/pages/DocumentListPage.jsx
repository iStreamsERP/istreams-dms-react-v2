import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilePlus2, RefreshCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import DocumentForm from "../components/DocumentForm";
import DocumentTable from "../components/DocumentTable";

const DocumentListPage = () => {
  const location = useLocation();
  const [globalFilter, setGlobalFilter] = useState("");
  const modalRefForm = useRef(null);
  const fetchDataRef = useRef(null);

  useEffect(() => {
    if (location.state?.userName) {
      setGlobalFilter(location.state.userName);
    }
  }, [location.state]);

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
        <div className="md:col-span-3">
          {/* Global Search Box in the Parent */}
          <Input
            type="text"
            className="grow"
            placeholder="Global Search..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        <div className="md:col-span-9 flex justify-end gap-2">
          <Button onClick={() => modalRefForm.current.showModal()}>
            Add Document <FilePlus2 className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={() => fetchDataRef.current && fetchDataRef.current()}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <DocumentTable
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        fetchDataRef={fetchDataRef}
      />

      <DocumentForm modalRefForm={modalRefForm} />
    </div>
  );
};

export default DocumentListPage;
