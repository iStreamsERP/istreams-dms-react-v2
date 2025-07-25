// components/AnalysisSummary.jsx
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SquarePen, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import AnalysisModal from "./AnalysisModal";
import {
  fetchQuestionsAndGenerateSummary,
  createDocument,
  setSelectedType,
  appendAnalysisSummary,
  setError,
} from "@/app/actions";
import { callSoapService } from "@/api/callSoapService";
import DocumentFormModal from "./dialog/DocumentFormModal";

export default function AnalysisSummary() {
  const { userData } = useAuth();
  const { toast } = useToast();
  const dispatch = useDispatch();
  const formModalRef = useRef(null);

  const documentAnalysis = useSelector((state) => state.documentAnalysis);
  const isLoading = useSelector((state) => state.isLoading);
  const analysisSummary = useSelector((state) => state.analysisSummary);
  const localQuestions = useSelector((state) => state.localQuestions);
  const selectedType = useSelector((state) => state.selectedType);
  const successMessage = useSelector((state) => state.successMessage);
  const file = useSelector((state) => state.file);
  const error = useSelector((state) => state.error);
  const fetchedDocument = useSelector((state) => state.fetchedDocument); // Add fetchedDocument

  const [documentTypeOptions, setDocumentTypeOptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(
    !documentAnalysis?.documentType
  );
  const [confirmationFailed, setConfirmationFailed] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const hasFetchedRef = useRef(false);

  // Fetch document type options on mount
  useEffect(() => {
    fetchCategoryName();
  }, []);

  // Handle initial fetch for selectedType
  useEffect(() => {
    if (selectedType && file && !hasFetchedRef.current) {
      dispatch(
        fetchQuestionsAndGenerateSummary(selectedType, file, userData.clientURL)
      );
      hasFetchedRef.current = true;
    }
  }, [selectedType, file, dispatch, userData.clientURL]);

  // Show toast for success message
  useEffect(() => {
    if (successMessage) {
      toast({
        title: "Success",
        description: successMessage,
        variant: "default",
      });
    }
  }, [successMessage, toast]);

  // Append localQuestions to analysisSummary
  useEffect(() => {
    if (localQuestions.length > 0) {
      const existingQuestions = new Set(
        analysisSummary.map((item) => item.question)
      );
      const newLocalQuestions = localQuestions.filter(
        (item) => !existingQuestions.has(item.question)
      );
      if (newLocalQuestions.length > 0) {
        dispatch(appendAnalysisSummary(newLocalQuestions));
      }
    }
  }, [localQuestions, analysisSummary, dispatch]);

  const fetchCategoryName = async () => {
    try {
      const response = await callSoapService(
        userData.clientURL,
        "DataModel_GetData",
        {
          DataModelName: "SYNM_DMS_DOC_CATEGORIES",
          WhereCondition: "",
          Orderby: "",
        }
      );

      const categoryNames = response
        .map((item) => item.CATEGORY_NAME)
        .filter(Boolean);
      setDocumentTypeOptions(categoryNames);
    } catch (error) {
      dispatch(setError("Failed to load document types"));
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load document types",
      });
    }
  };

  const handleConfirmDocumentType = async (type) => {
    try {
      const matchResponse = await callSoapService(
        userData.clientURL,
        "DataModel_GetData",
        {
          DataModelName: "SYNM_DMS_DOC_CATEGORIES",
          WhereCondition: `LOWER(CATEGORY_NAME) = '${type
            .toLowerCase()
            .trim()}'`,
          Orderby: "",
        }
      );

      let matchedType = matchResponse?.[0]?.CATEGORY_NAME;
      if (!matchedType) {
        const tagResponse = await callSoapService(
          userData.clientURL,
          "DataModel_GetData",
          {
            DataModelName: "SYNM_DMS_DOC_CATEGORIES",
            WhereCondition: `LOWER(SEARCH_TAGS) LIKE '%${type
              .toLowerCase()
              .trim()}%'`,
            Orderby: "",
          }
        );
        matchedType = tagResponse?.[0]?.CATEGORY_NAME;
      }

      if (!matchedType) {
        setConfirmationFailed(true);
        setShowDropdown(true);
        dispatch(setError(`Document type "${type}" not found`));
        toast({
          variant: "destructive",
          title: "Error",
          description: `Document type "${type}" not found`,
        });
        return;
      }

      dispatch(setSelectedType(matchedType));
      setShowDropdown(false);
      hasFetchedRef.current = false;
      dispatch(
        fetchQuestionsAndGenerateSummary(matchedType, file, userData.clientURL)
      );
      hasFetchedRef.current = true;
    } catch (error) {
      setConfirmationFailed(true);
      dispatch(setError("Failed to confirm document type"));
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to confirm document type",
      });
    }
  };

  const handleCreateDocument = async () => {
    if (!file) {
      dispatch(setError("No file available to create document"));
      toast({
        variant: "destructive",
        title: "Error",
        description: "No file available to create document",
      });
      return;
    }

    try {
      const { refSeqNo, fetchedDocument } = await dispatch(
        createDocument(
          file,
          selectedType,
          analysisSummary,
          localQuestions,
          userData.clientURL,
          userData.userEmail
        )
      );

      if (fetchedDocument) {
        // Open the modal with the fetched document
        formModalRef.current.showModal();
      } else {
        dispatch(setError("Failed to fetch document after creation"));
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch document after creation",
        });
      }
    } catch (error) {
      // Error is already dispatched in createDocument
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create document",
      });
    }
  };

  const handleDropdownChange = (e) => {
    dispatch(setSelectedType(e.target.value));
    setConfirmationFailed(false);
    dispatch(setError(""));
    hasFetchedRef.current = false;
  };

  return (
    <div className="p-6 h-full overflow-auto bg-gray-50 dark:bg-slate-800 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-200">
          Analysis Summary
        </h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => setIsAnalysisModalOpen(true)}
            className="text-cyan-600 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/30"
            disabled={isLoading}
          >
            <SquarePen className="mr-2 h-5 w-5" />
            Edit Analysis
          </Button>
          <Button
            onClick={handleCreateDocument}
            disabled={
              isLoading || !selectedType || analysisSummary.length === 0
            }
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create as Document"
            )}
          </Button>
        </div>
      </div>

      {analysisSummary.length === 0 &&
        (documentAnalysis?.documentType || showDropdown) &&
        !isLoading && (
          <Alert
            variant="default"
            className="border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700"
          >
            {documentAnalysis?.documentType &&
              !confirmationFailed &&
              !showDropdown && (
                <>
                  <AlertTitle className="text-lg font-semibold">
                    Detected Document Type:{" "}
                    <strong>{documentAnalysis.documentType}</strong>
                  </AlertTitle>
                  <AlertDescription className="mt-4">
                    <p className="mb-4 text-gray-600 dark:text-slate-400">
                      Is this the correct document type?
                    </p>
                    <div className="flex gap-3 flex-wrap">
                      <Button
                        size="lg"
                        onClick={() =>
                          handleConfirmDocumentType(
                            documentAnalysis.documentType
                          )
                        }
                        disabled={isLoading}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Confirming...
                          </>
                        ) : (
                          "Yes, it is correct"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setShowDropdown(true)}
                        disabled={isLoading}
                        className="border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600"
                      >
                        No, select another type
                      </Button>
                    </div>
                  </AlertDescription>
                </>
              )}

            {confirmationFailed && (
              <AlertTitle className="text-amber-600 dark:text-amber-400">
                <strong>Category not found</strong> for "
                {documentAnalysis?.documentType}". Please select a document
                type.
              </AlertTitle>
            )}

            {!documentAnalysis?.documentType && !confirmationFailed && (
              <AlertTitle className="text-lg font-semibold">
                Select Document Type
              </AlertTitle>
            )}

            {showDropdown && (
              <div className="mt-4 space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                  {confirmationFailed
                    ? "Select the correct document type:"
                    : "Please select a document type:"}
                </label>
                <select
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-slate-600 dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:ring-2 focus:ring-cyan-500"
                  value={selectedType}
                  onChange={handleDropdownChange}
                  disabled={isLoading}
                >
                  <option value="">-- Select Document Type --</option>
                  {documentTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <Button
                  size="lg"
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                  disabled={!selectedType || isLoading}
                  onClick={() => handleConfirmDocumentType(selectedType)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Confirm Document Type"
                  )}
                </Button>
              </div>
            )}
          </Alert>
        )}

      {analysisSummary.length > 0 && !isLoading && (
        <div className="space-y-4 mt-6">
          {analysisSummary.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700"
            >
              <p className="font-medium text-gray-800 dark:text-slate-200 mb-2">
                {item.label}:
              </p>
              <p className="text-gray-600 dark:text-slate-400">{item.text}</p>
            </motion.div>
          ))}
        </div>
      )}

      {analysisSummary.length === 0 &&
        !isLoading &&
        !showDropdown &&
        !documentAnalysis?.documentType && (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 text-cyan-500 dark:text-cyan-400 mb-4" />
            <h4 className="text-xl font-semibold text-gray-800 dark:text-slate-200 mb-2">
              No Analysis Available
            </h4>
            <p className="text-gray-600 dark:text-slate-400 mb-6">
              Please select a document type to generate the analysis summary.
            </p>
            <Button
              onClick={() => setShowDropdown(true)}
              disabled={isLoading}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              Select Document Type
            </Button>
          </div>
        )}

      <AnalysisModal
        isOpen={isAnalysisModalOpen}
        setIsOpen={setIsAnalysisModalOpen}
        generateAnalysisSummary={(questions) =>
          dispatch(
            generateAnalysisSummary(
              questions,
              "append",
              file,
              userData.clientURL
            )
          )
        }
        isGeneratingSummary={isLoading}
      />

      <DocumentFormModal
        formModalRef={formModalRef}
        selectedDocument={fetchedDocument} // Use fetchedDocument, fallback to hardcoded
      />
    </div>
  );
}