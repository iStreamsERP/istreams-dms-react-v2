import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getDataModelService } from "@/services/dataModelService";
import { SelectPortal } from "@radix-ui/react-select";
import {
  CalendarDays,
  CircleCheckBig,
  Clock3,
  FileQuestion,
  FileText,
  Folder,
  Hash,
  Link,
  Loader,
  LocateFixed,
  MessageSquare,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  createAndSaveDMSMaster,
  updateDmsVerifiedBy,
} from "../services/dmsService";
import staticCategoryData from "../staticCategoryData";
import { convertServiceDate } from "../utils/dateUtils";
import RejectModal from "./RejectModal";
import { Button } from "./ui/button";

const DocumentForm = ({
  modalRefForm,
  selectedDocument,
  docMode,
  onSuccess,
}) => {
  const { userData } = useAuth();

  // Centralized initial form state
  const initialFormState = {
    REF_SEQ_NO: -1,
    DOCUMENT_NO: "",
    DOCUMENT_DESCRIPTION: "",
    DOC_SOURCE_FROM: "",
    DOC_RELATED_TO: "",
    DOC_RELATED_CATEGORY: "",
    DOC_REF_VALUE: "",
    USER_NAME: userData.currentUserName,
    COMMENTS: "",
    DOC_TAGS: "",
    FOR_THE_USERS: "",
    EXPIRY_DATE: new Date().toISOString().split("T")[0],
    REF_TASK_ID: 0,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [dmsMasterData, setDmsMasterData] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [existingDocs, setExistingDocs] = useState([]);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const modalRefReject = useRef(null);

  useEffect(() => {
    if (docMode === "view" || docMode === "verify") {
      setIsReadOnly(true);
    } else {
      setIsReadOnly(false);
    }
  }, [docMode]);

  useEffect(() => {
    if (selectedDocument && selectedDocument.REF_SEQ_NO !== -1) {
      const convertedExpiryDate = convertServiceDate(
        selectedDocument.EXPIRY_DATE
      );
      setFormData({
        ...initialFormState,
        ...selectedDocument,
        EXPIRY_DATE: convertedExpiryDate,
      });
    }
  }, [selectedDocument, userData.currentUserName]);

  // Fetch category data on component mount
  useEffect(() => {
    const fetchCategoryDataModel = async () => {
      try {
        const response = await getDataModelService(
          {
            DataModelName: "SYNM_DMS_DOC_CATEGORIES",
            WhereCondition: "",
            Orderby: "",
          },
          userData.currentUserLogin,
          userData.clientURL
        );

        // Ensure the data is an array.
        let data = Array.isArray(response) ? response : response.data;
        if (!Array.isArray(data)) {
          data = [data];
        }
        if (!data || data.length === 0) {
          setCategoryData(staticCategoryData);
        } else {
          setCategoryData(data);
        }
      } catch (err) {
        console.error("Error fetching data model:", err);
      }
    };
    fetchCategoryDataModel();
  }, []);

  // Fetch category data on component mount
  useEffect(() => {
    const fetchDmsMasterDataModel = async () => {
      try {
        const response = await getDataModelService(
          {
            dataModelName: "SYNM_DMS_MASTER",
            whereCondition: "",
            orderby: "",
          },
          userData.currentUserLogin,
          userData.clientURL
        );
        setDmsMasterData(response);
      } catch (err) {
        console.error("Error fetching data model:", err);
      }
    };
    fetchDmsMasterDataModel();
  }, [userData.currentUserLogin]);

  // Fetch existing documents and categories
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedDocument?.REF_SEQ_NO) return;

      setIsLoadingDocs(true);

      try {
        // Fetch existing documents
        const docsResponse = await getDataModelService(
          {
            dataModelName: "SYNM_DMS_DETAILS",
            whereCondition: `REF_SEQ_NO = ${selectedDocument.REF_SEQ_NO}`,
            orderby: "",
          },
          userData.currentUserLogin,
          userData.clientURL
        );

        // Handle different response formats
        const receivedDocs = Array.isArray(docsResponse)
          ? docsResponse
          : docsResponse?.Data || [];

        setExistingDocs(receivedDocs);
      } catch (err) {
        console.error("Fetch error:", err);
        // setFetchError("Failed to load documents");
      } finally {
        setIsLoadingDocs(false);
      }
    };

    fetchData();
  }, [selectedDocument?.REF_SEQ_NO, userData.currentUserLogin]);

  // Validate required fields
  const validateForm = () => {
    const newErrors = {};
    if (!formData.DOCUMENT_NO.trim())
      newErrors.DOCUMENT_NO = "Document Ref No is required";
    if (!formData.DOCUMENT_DESCRIPTION.trim())
      newErrors.DOCUMENT_DESCRIPTION = "Document Name is required";
    if (!formData.DOC_RELATED_TO.trim())
      newErrors.DOC_RELATED_TO = "Related To is required";
    if (!formData.DOC_RELATED_CATEGORY.trim())
      newErrors.DOC_RELATED_CATEGORY = "Related Category is required";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleViewDocs = async (selectedDocs) => {
    try {
      const response = await getDataModelService(
        {
          dataModelName: "SYNM_DMS_DETAILS",
          whereCondition: `REF_SEQ_NO = ${selectedDocs.REF_SEQ_NO} AND SERIAL_NO = ${selectedDocs.SERIAL_NO}`,
          orderby: "",
        },
        userData.currentUserLogin,
        userData.clientURL
      );

      if (!response?.length) {
        throw new Error("No documents found.");
      }

      // Since only one document is expected, take the first result.
      const doc = response[0];
      if (Array.isArray(doc.DOC_DATA)) {
        const blob = new Blob([new Uint8Array(doc.DOC_DATA)], {
          type: "application/octet-stream",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download =
          doc.DOC_NAME || `document_${selectedDocs.REF_SEQ_NO}.bin`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Error downloading documents:", err);
    }
  };

  const handleVerifyApprove = async () => {
    try {
      // if (userData.currentUserName === selectedDocument?.USER_NAME) {
      //   alert("Access Denied: You created this document.");
      //   return;
      // } else if (existingDocs.length === 0) {
      //   alert(
      //     "Warning: No associated documents found. Check with uploader or reject."
      //   );
      //   return; isVAndVProcess
      // }

      const verifyDmsPayload = {
        userName: userData.currentUserName,
        refSeqNo: selectedDocument.REF_SEQ_NO,
      };

      const verifyResponse = await updateDmsVerifiedBy(
        verifyDmsPayload,
        userData.currentUserLogin,
        userData.clientURL
      );

      if (verifyResponse === "SUCCESS") {
        onSuccess(selectedDocument.REF_SEQ_NO, userData.currentUserName);
      }
    } catch (error) {
      console.error("Verification failed:", error);
    }
  };

  const handleReject = async () => {
    // if (userData.currentUserName === selectedDocument?.USER_NAME) {
    //   alert("Access Denied: You created this document.");
    //   return;
    // }

    if (!showRejectModal) {
      setShowRejectModal(true);
    }
  };

  // Once the RejectModal is mounted, open it automatically
  useEffect(() => {
    if (showRejectModal && modalRefReject.current) {
      modalRefReject.current.showModal();
    }
  }, [showRejectModal]);

  const canCurrentUserEdit = (doc) => {
    if (!doc) return "";

    if (doc?.USER_NAME !== userData.currentUserName)
      return "Access Denied:This document is created by another user.";

    const status = doc?.DOCUMENT_STATUS?.toUpperCase();
    if (status === "VERIFIED")
      return "Access Denied: Document is verified and approved.";
    if (status === "AWAITING FOR USER ACCEPTANCE")
      return `Access Denied: Document is assigned to ${doc.ASSIGNED_USER}.`;
    if (status === "IN PROGRESS")
      return "Access Denied: Document is in progress.";
    if (status === "COMPLETED")
      return "Access Denied: Document has been completed.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const editError = canCurrentUserEdit(selectedDocument);
    if (editError) {
      alert(editError);
      return;
    }

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return; // Do not submit if there are errors
    }
    setIsSubmitting(true);
    try {
      const response = await createAndSaveDMSMaster(
        formData,
        userData.currentUserLogin,
        userData.clientURL
      );
      if (response) {
        // Reset form but retain the next reference number
        setFormData(initialFormState);
        modalRefForm.current?.close();
      } else {
        console.error("Failed to submit data. Please try again.");
      }
    } catch (error) {
      console.log(`An error occurred: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <dialog
        ref={modalRefForm}
        id="document-form"
        name="document-form"
        className="relative z-50"
      >
        <div
          className="fixed inset-0 bg-black/50 z-40"
          aria-hidden="true"
          style={{ isolation: "isolate" }}
        />

        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-100 transition-colors dark:bg-slate-950 text-black dark:text-white p-6 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="text-xl font-semibold">
                Reference ID:
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {formData.REF_SEQ_NO === -1 ? "(New)" : formData.REF_SEQ_NO}
                </span>
              </h3>
              <Button
                type="button"
                onClick={() => modalRefForm.current.close()}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="border-b border-gray-200 my-4" />

            <form
              onSubmit={handleSubmit}
              id="document-form"
              name="document-form"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side - Document Form */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Document Number */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Hash className="h-4 w-4 text-gray-600" />
                        <Label htmlFor="DOCUMENT_NO">Document Ref No</Label>
                        <div className="text-gray-400 cursor-help">
                          <FileQuestion className="w-4 h-4" />
                        </div>
                      </div>
                      <Input
                        type="text"
                        name="DOCUMENT_NO"
                        id="DOCUMENT_NO"
                        placeholder="Enter document ref no"
                        value={formData.DOCUMENT_NO}
                        onChange={handleChange}
                        readOnly={isReadOnly}
                      />
                      {errors.DOCUMENT_NO && (
                        <p className="text-red-500 text-sm">
                          {errors.DOCUMENT_NO}
                        </p>
                      )}
                    </div>

                    {/* Document Name */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <Label htmlFor="DOCUMENT_DESCRIPTION">
                          Document Name
                        </Label>
                      </div>
                      <Input
                        type="text"
                        name="DOCUMENT_DESCRIPTION"
                        id="DOCUMENT_DESCRIPTION"
                        placeholder="Enter document name"
                        value={formData.DOCUMENT_DESCRIPTION}
                        onChange={handleChange}
                        readOnly={isReadOnly}
                      />
                      {errors.DOCUMENT_DESCRIPTION && (
                        <p className="text-red-500 text-sm">
                          {errors.DOCUMENT_DESCRIPTION}
                        </p>
                      )}
                    </div>

                    {/* Related To */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Link className="h-4 w-4 text-gray-600" />
                        <Label htmlFor="DOC_RELATED_TO">Related To</Label>
                      </div>

                      <select
                        name="DOC_RELATED_TO"
                        value={formData.DOC_RELATED_TO}
                        onChange={handleChange}
                        disabled={isReadOnly}
                        className="w-full rounded-md border border-gray-300 p-2 text-sm
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
            dark:focus:ring-blue-400 dark:focus:border-blue-600
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            dark:disabled:text-gray-400"
                      >
                        <option
                          value=""
                          disabled
                          className="text-gray-400 dark:text-gray-500"
                        >
                          Select related to
                        </option>
                        <optgroup label="Related To" className="font-semibold">
                          <option value="HRMS & Payroll">HRMS & Payroll</option>
                          <option value="Material Management">
                            Material Management
                          </option>
                          <option value="Accounting">Accounting</option>
                          <option value="Sales (POS)">Sales (POS)</option>
                          <option value="Estimation">Estimation</option>
                          <option value="Projects">Projects</option>
                          <option value="Job Costing">Job Costing</option>
                          <option value="Production">Production</option>
                          <option value="Packing Delivery">
                            Packing Delivery
                          </option>
                          <option value="Task Management">
                            Task Management
                          </option>
                          <option value="Documents & Communications">
                            Documents & Communications
                          </option>
                          <option value="Product Administration">
                            Product Administration
                          </option>
                        </optgroup>
                      </select>

                      {errors.DOC_RELATED_TO && (
                        <p className="text-red-500 text-sm">
                          {errors.DOC_RELATED_TO}
                        </p>
                      )}
                    </div>

                    {/* Related Category */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Folder className="h-4 w-4 text-gray-600" />
                        <label htmlFor="DOC_RELATED_CATEGORY">
                          Related Category
                        </label>
                      </div>

                      <select
                        name="DOC_RELATED_CATEGORY"
                        value={formData.DOC_RELATED_CATEGORY}
                        onChange={handleChange}
                        disabled={isReadOnly}
                        className="w-full rounded-md border border-gray-300 p-2 text-sm
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
            dark:focus:ring-blue-400 dark:focus:border-blue-600
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            dark:disabled:text-gray-400"
                      >
                        <option
                          value=""
                          disabled
                          className="text-gray-400 dark:text-gray-500"
                        >
                          Select related to
                        </option>
                        <optgroup label="Categories" className="font-semibold">
                          {Array.isArray(categoryData) &&
                            categoryData.map((category) =>
                              category?.CATEGORY_NAME ? (
                                <option
                                  key={category.CATEGORY_NAME}
                                  value={category.CATEGORY_NAME}
                                >
                                  {category.CATEGORY_NAME}
                                </option>
                              ) : null
                            )}
                        </optgroup>
                      </select>

                      {errors.DOC_RELATED_CATEGORY && (
                        <p className="text-red-500 text-sm">
                          {errors.DOC_RELATED_CATEGORY}
                        </p>
                      )}
                    </div>

                    {/* Expiry Date */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarDays className="h-4 w-4 text-gray-600" />
                        <Label htmlFor="EXPIRY_DATE">Expiry Date</Label>
                      </div>
                      <Input
                        type="date"
                        name="EXPIRY_DATE"
                        id="EXPIRY_DATE"
                        value={formData.EXPIRY_DATE}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        readOnly={isReadOnly}
                      />
                    </div>

                    {/* Document Reference Value */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <LocateFixed className="h-4 w-4 text-gray-600" />
                        <Label htmlFor="DOC_REF_VALUE">
                          Document Reference Value
                        </Label>
                      </div>
                      <Input
                        type="text"
                        name="DOC_REF_VALUE"
                        id="DOC_REF_VALUE"
                        placeholder="Enter docs ref no"
                        value={formData.DOC_REF_VALUE}
                        onChange={handleChange}
                        readOnly={isReadOnly}
                      />
                    </div>

                    {/* Remarks */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MessageSquare className="h-4 w-4 text-gray-600" />
                        <label htmlFor="COMMENTS">Remarks</label>
                      </div>
                      <Textarea
                        name="COMMENTS"
                        id="COMMENTS"
                        placeholder="Add remarks"
                        value={formData.COMMENTS}
                        onChange={handleChange}
                        readOnly={isReadOnly}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Side - Activity Section */}
                <div className="bg-slate-200 transition-colors dark:bg-slate-900 p-4 rounded-lg space-y-4">
                  <h2 className="text-lg font-medium mb-2">Others Details:</h2>

                  {/* Details remain the same but styled with Tailwind */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-gray-600">
                        <UserRound className="h-4 w-4" />
                        <span className="text-sm">Uploader Name</span>
                      </div>
                      <span className="text-sm font-medium">
                        {formData.REF_SEQ_NO === -1
                          ? userData.currentUserName
                          : selectedDocument.USER_NAME}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 w-full">
                      <div className="flex items-center gap-1 text-gray-500">
                        <LocateFixed className="h-4 w-4" />
                        <label className="text-sm">
                          Document Received From
                        </label>
                      </div>
                      <p className="text-sm font-medium">
                        {formData.DOC_SOURCE_FROM}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 w-full">
                      <div className="flex items-center gap-1 text-gray-500">
                        <LocateFixed className="h-4 w-4" />
                        <label className="text-sm">Verified by</label>
                      </div>
                      <p className="text-sm font-medium">
                        {formData.VERIFIED_BY}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 w-full">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock3 className="h-4 w-4" />
                        <label className="text-sm">Verified date</label>
                      </div>
                      <p className="text-sm font-medium">
                        {convertServiceDate(formData.VERIFIED_DATE)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 w-full">
                      <div className="flex items-center gap-1 text-gray-500">
                        <LocateFixed className="h-4 w-4" />
                        <label className="text-sm">Reference Task ID</label>
                      </div>

                      <p className="text-sm font-medium">
                        {formData.REF_TASK_ID}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3 w-full">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Loader className="h-4 w-4" />
                        <label className="text-sm whitespace-nowrap">
                          Document Status
                        </label>
                      </div>
                      {formData.DOCUMENT_STATUS && (
                        <p className="badge badge-error text-xs font-medium whitespace-nowrap">
                          {formData.DOCUMENT_STATUS}
                        </p>
                      )}
                    </div>

                    {docMode === "verify" && (
                      <div className="flex gap-2 mt-4">
                        <Button
                          type="button"
                          onClick={handleVerifyApprove}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          <CircleCheckBig size={18} />
                          Verify & Approve
                        </Button>
                        <Button
                          type="button"
                          onClick={handleReject}
                          className="flex items-center gap-2 px-4 py-2 bg-transparent border border-red-600 text-red-600 rounded hover:bg-red-300"
                        >
                          <X size={18} />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!docMode && (
                <div className="mt-4 flex justify-center">
                  <Button type="submit" disabled={isSubmitting}>
                    {formData.REF_SEQ_NO === -1
                      ? "Create Document"
                      : "Save Changes"}
                    {isSubmitting && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </dialog>

      {showRejectModal && (
        <RejectModal
          modalRefReject={modalRefReject}
          selectedDocument={selectedDocument}
        />
      )}
    </>
  );
};

export default DocumentForm;
