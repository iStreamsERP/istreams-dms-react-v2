import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SquarePen, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { callSoapService } from "@/api/callSoapService";
import { useAuth } from "@/contexts/AuthContext";
import AnalysisModal from "./AnalysisModal";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

const API_URL = "https://apps.istreams-erp.com:4493/api/SmartAsk/ask-from-file";

export default function AnalysisSummary({
  file,
  documentAnalysis,
  analysisSummary,
  setAnalysisSummary,
  isAnalysisModalOpen,
  setIsAnalysisModalOpen,
  isGeneratingSummary,
  setIsGeneratingSummary,
  showDropdown,
  setShowDropdown,
  confirmationFailed,
  setConfirmationFailed,
  selectedType,
  setSelectedType,
  isSubmitting,
  setIsSubmitting,
  activeRightTab,
}) {
  const { userData } = useAuth();
  const { toast } = useToast();
  const refKeysRef = useRef([]);
  const [documentTypeOptions, setDocumentTypeOptions] = useState([]);
  const [questionsCache, setQuestionsCache] = useState({});
  const [isFetchingQuestions, setIsFetchingQuestions] = useState(false);
  const [isCreatingDocument, setIsCreatingDocument] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch category names on mount
  useEffect(() => {
    fetchCategoryName();
  }, []);

  // Refetch questions when switching to Analysis Summary tab and selectedType exists
  useEffect(() => {
    if (activeRightTab === "summary" && selectedType && !isSubmitting) {
      fetchQuestionsAndGenerateSummary(selectedType);
    }
  }, [activeRightTab, selectedType]);

  const fetchCategoryName = async () => {
    try {
      const payload = {
        DataModelName: "SYNM_DMS_DOC_CATEGORIES",
        WhereCondition: "",
        Orderby: "",
      };

      const response = await callSoapService(
        userData.clientURL,
        "DataModel_GetData",
        payload
      );

      if (!response || !Array.isArray(response)) {
        throw new Error("Invalid response for document categories");
      }

      const categoryNames = response
        .map((item) => item.CATEGORY_NAME)
        .filter(Boolean);
      setDocumentTypeOptions(categoryNames);
    } catch (error) {
      console.error("Error fetching category names:", error);
      setError("Failed to load document types. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load document types. Please try again.",
      });
    }
  };

  const fetchQuestionsForCategory = async (category) => {
    if (!category) return [];

    setIsFetchingQuestions(true);
    try {
      const qaResponse = await callSoapService(
        userData.clientURL,
        "DataModel_GetData",
        {
          DataModelName: "SYNM_DMS_DOC_CATG_QA",
          WhereCondition: `CATEGORY_NAME = '${category}'`,
          Orderby: "",
        }
      );

      if (!qaResponse || qaResponse.length === 0) {
        console.warn("No questions found for category:", category);
        return [];
      }

      const refKeys = qaResponse.map((item) => item.REF_KEY || "");
      refKeysRef.current = refKeys;

      const questions = qaResponse
        .map((item) => item.QUESTION_FOR_AI?.trim())
        .filter(Boolean);

      const questionsMap = {};
      qaResponse.forEach((item) => {
        if (item.REF_KEY && item.QUESTION_FOR_AI) {
          questionsMap[item.QUESTION_FOR_AI] = item.REF_KEY;
        }
      });

      setQuestionsCache(questionsMap);

      return questions;
    } catch (error) {
      console.error("Error fetching questions:", error);
      throw error;
    } finally {
      setIsFetchingQuestions(false);
    }
  };

  const fetchQuestionsAndGenerateSummary = async (type) => {
    try {
      setError("");
      setSuccessMessage("");
      const questions = await fetchQuestionsForCategory(type);
      if (questions.length === 0) {
        setConfirmationFailed(true);
        setAnalysisSummary([]);
        setError(`No questions found for document type "${type}".`);
        toast({
          variant: "destructive",
          title: "No Questions Found",
          description: `No questions available for "${type}". Add questions in the Chat tab.`,
        });
        return;
      }
      await generateAnalysisSummary(questions, "replace");
      setSuccessMessage("Analysis summary updated successfully.");
      toast({
        title: "Success",
        description: "Analysis summary updated successfully.",
      });
    } catch (error) {
      setError("Failed to fetch questions or generate summary.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch questions or generate summary.",
      });
    }
  };

  const handleConfirmDocumentType = async (type) => {
    if (!type || !userData?.clientURL) return;

    try {
      setIsSubmitting(true);
      setConfirmationFailed(false);
      setError("");
      setSuccessMessage("");

      const keyword = type.toLowerCase().trim();

      // Try exact match
      let matchResponse = await callSoapService(
        userData.clientURL,
        "DataModel_GetData",
        {
          DataModelName: "SYNM_DMS_DOC_CATEGORIES",
          WhereCondition: `LOWER(CATEGORY_NAME) = '${keyword}'`,
          Orderby: "",
        }
      );

      // Try search tags if no exact match
      if (!matchResponse || matchResponse.length === 0) {
        matchResponse = await callSoapService(
          userData.clientURL,
          "DataModel_GetData",
          {
            DataModelName: "SYNM_DMS_DOC_CATEGORIES",
            WhereCondition: `LOWER(SEARCH_TAGS) LIKE '%${keyword}%'`,
            Orderby: "",
          }
        );
      }

      let matchedType = null;
      if (matchResponse?.length > 0) {
        const exactTagMatch = matchResponse.find((item) =>
          item.SEARCH_TAGS?.toLowerCase().split(",").includes(keyword)
        );
        matchedType =
          exactTagMatch?.CATEGORY_NAME || matchResponse[0].CATEGORY_NAME;
      }

      if (!matchedType) {
        setConfirmationFailed(true);
        setShowDropdown(true);
        setError(`Document type "${type}" not found. Please select a type.`);
        toast({
          variant: "destructive",
          title: "Invalid Document Type",
          description: `Document type "${type}" not found. Please select a type.`,
        });
        return;
      }

      setSelectedType(matchedType);
      setShowDropdown(false);

      await fetchQuestionsAndGenerateSummary(matchedType);
    } catch (error) {
      console.error("Error confirming document type:", error);
      setConfirmationFailed(true);
      setError("Failed to confirm document type. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to confirm document type. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateAnalysisSummary = async (questions, mode = "replace") => {
    if (!file || !questions) {
      setError("No file or questions provided.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "No file or questions provided.",
      });
      return;
    }

    const questionArray = Array.isArray(questions)
      ? questions
      : [questions].filter(Boolean);

    if (questionArray.length === 0) {
      setError("No valid questions provided.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "No valid questions provided.",
      });
      return;
    }

    setIsGeneratingSummary(true);
    try {
      const formData = new FormData();
      formData.append("File", file);
      formData.append("Question", `${questionArray.join(", ")}`);

      const res = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!res.data || typeof res.data !== "string") {
        throw new Error("Invalid response from analysis API");
      }

      const answerLines = res.data
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => line.replace(/^- /, "").trim());

      const newSummaryPoints = answerLines.map((line, index) => {
        const question = questionArray[index];
        const label = questionsCache[question] || question;

        return {
          text: line,
          label,
          question,
        };
      });

      if (mode === "replace") {
        setAnalysisSummary(newSummaryPoints);
      } else {
        setAnalysisSummary((prev) => [...prev, ...newSummaryPoints]);
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      setError("Failed to generate analysis summary.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate analysis summary.",
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleCreateDocument = async () => {
    if (!selectedType || analysisSummary.length === 0) {
      setError(
        "Please select a document type and generate a summary before creating a document."
      );
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Please select a document type and generate a summary before creating a document.",
      });
      return;
    }

    setIsCreatingDocument(true);
    setError("");
    setSuccessMessage("");

    try {
      const documentData = {
        CATEGORY_NAME: selectedType,
        QUESTIONS: analysisSummary.map((item) => ({
          QUESTION_FOR_AI: item.question,
          REF_KEY: questionsCache[item.question] || item.question,
          ANSWER: item.text,
        })),
      };

      const payload = {
        UserName: userData.userEmail,
        DModelData: convertDataModelToStringData(
          "SYNM_DMS_DOCUMENT",
          documentData
        ),
      };

      await callSoapService(
        userData.clientURL,
        "DataModel_CreateDocument",
        payload
      )
        .then((response) => {
          setSuccessMessage("Document created successfully!");
          toast({
            title: "Success",
            description: "Document created successfully!",
          });
        })
        .catch((error) => {
          console.error("Error creating document:", error);
          throw error;
        });
    } catch (error) {
      console.error("Error in handleCreateDocument:", error);
      setError("Failed to create document. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create document. Please try again.",
      });
    } finally {
      setIsCreatingDocument(false);
    }
  };

  const handleDropdownChange = (e) => {
    setSelectedType(e.target.value);
    setConfirmationFailed(false);
    setError("");
    setSuccessMessage("");
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
            disabled={isSubmitting || isGeneratingSummary || isCreatingDocument}
          >
            <SquarePen className="mr-2 h-5 w-5" />
            Edit Analysis
          </Button>
          <Button
            onClick={handleCreateDocument}
            disabled={isSubmitting || isGeneratingSummary || isCreatingDocument}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            {isCreatingDocument ? (
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

      {(error || successMessage) && (
        <Alert
          variant={error ? "destructive" : "default"}
          className={`mb-6 ${error ? "" : "border-green-500"}`}
        >
          {error ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          )}
          <AlertTitle>{error ? "Error" : "Success"}</AlertTitle>
          <AlertDescription>{error || successMessage}</AlertDescription>
        </Alert>
      )}

      {isFetchingQuestions && (
        <div className="text-center py-8">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-cyan-600 dark:text-cyan-400" />
          <p className="text-gray-600 dark:text-slate-400 mt-2">
            Loading questions for {selectedType}...
          </p>
        </div>
      )}

      {analysisSummary.length === 0 &&
        (documentAnalysis?.documentType || showDropdown) &&
        !isFetchingQuestions && (
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
                        disabled={isSubmitting || isGeneratingSummary}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white"
                      >
                        {isSubmitting ? (
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
                        disabled={isSubmitting}
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
                  disabled={isSubmitting || isGeneratingSummary}
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
                  disabled={
                    !selectedType || isSubmitting || isGeneratingSummary
                  }
                  onClick={() => handleConfirmDocumentType(selectedType)}
                >
                  {isSubmitting ? (
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

      {analysisSummary.length > 0 && !isFetchingQuestions && (
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
        !isFetchingQuestions &&
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
              disabled={isGeneratingSummary || isSubmitting}
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
          generateAnalysisSummary(questions, "append")
        }
        isGeneratingSummary={isGeneratingSummary}
      />
    </div>
  );
}
