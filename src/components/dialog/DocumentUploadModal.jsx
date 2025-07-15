import { toast } from "@/hooks/use-toast";
import { callSoapService } from "@/api/callSoapService";
import axios from "axios";
import { Eye, X, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useAuth } from "../../contexts/AuthContext";
import { getFileIcon } from "../../utils/getFileIcon";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

const DocumentUploadModal = ({
  uploadModalRef,
  selectedDocument,
  onUploadSuccess,
}) => {
  const { userData } = useAuth();

  const [existingDocs, setExistingDocs] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [files, setFiles] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userViewRights, setUserViewRights] = useState("");

  // Fetch existing documents and categories
  useEffect(() => {
    fetchData();
    fetchUserViewRights();
  }, [selectedDocument?.REF_SEQ_NO, userData.userEmail]);

  const fetchData = async () => {
    if (!selectedDocument?.REF_SEQ_NO) return;

    setIsLoadingDocs(true);
    setFetchError("");

    try {
      // Fetch existing documents
      const payload = {
        DataModelName: "synmview_dms_details_all",
        WhereCondition: `REF_SEQ_NO = ${selectedDocument.REF_SEQ_NO}`,
        Orderby: "",
      };

      const response = await callSoapService(
        userData.clientURL,
        "DataModel_GetData",
        payload
      );

      // Handle different response formats
      const receivedDocs = Array.isArray(response)
        ? response
        : response?.Data || [];

      setExistingDocs(receivedDocs);
    } catch (err) {
      console.error("Fetch existing docs error:", err);
      setFetchError("Failed to load existing documents");
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const fetchUserViewRights = async () => {
    try {
      const userType = userData.isAdmin ? "ADMINISTRATOR" : "USER";
      const payload = {
        UserName: userData.userName,
        FormName: "DMS-DOCUMENTLISTVIEWALL",
        FormDescription: "View Rights For All Documents",
        UserType: userType,
      };

      const response = await callSoapService(
        userData.clientURL,
        "DMS_CheckRights_ForTheUser",
        payload
      );

      setUserViewRights(response);
    } catch (error) {
      console.error("Failed to fetch user rights:", error);
      toast({
        variant: "destructive",
        title: error,
      });
    }
  };

  const allowedMimeTypes = {
    "image/*": [],
    "application/pdf": [],
    "application/vnd.ms-excel": [],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
  };

  const disallowedExtensions = ["exe", "bat", "sh", "msi", "js"];

  const { getRootProps, getInputProps } = useDropzone({
    accept: allowedMimeTypes,
    multiple: true,
    onDrop: (acceptedFiles) => {
      setFiles((prev) => [
        ...prev,
        ...acceptedFiles.map((file) => {
          const ext = file.name.split(".").pop().toLowerCase();
          return {
            file,
            name: file.name,
            size: (file.size / 1024).toFixed(2) + " KB",
            docExtension: ext,
            isPrimaryDocument: false,
          };
        }),
      ]);
    },
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((rejection) => {
        const file = rejection.file;
        const ext = file.name.split(".").pop().toLowerCase();
        if (disallowedExtensions.includes(ext)) {
          alert(`"${ext}" File format is not allowed.`);
        } else {
          alert(
            `File "${file.name}" was rejected due to MIME type restrictions.`
          );
        }
      });
    },
  });

  const handleSetPrimary = (index) => {
    setFiles((prevFiles) =>
      prevFiles.map((file, i) => ({
        ...file,
        isPrimaryDocument: i === index,
      }))
    );
  };

  const refreshDocuments = async () => {
    try {
      const payload = {
        DataModelName: "SYNM_DMS_DETAILS",
        WhereCondition: `REF_SEQ_NO = ${selectedDocument.REF_SEQ_NO}`,
        Orderby: "",
      };

      const response = await callSoapService(
        userData.clientURL,
        "DataModel_GetData",
        payload
      );

      const updatedDocs = Array.isArray(response)
        ? response
        : response?.Data || [];
      setExistingDocs(updatedDocs);
    } catch (err) {
      console.error("Refresh error:", err);
    }
  };

  const canCurrentUserEdit = () => {
    if (selectedDocument?.USER_NAME !== userData.userName)
      return "Access Denied: This document is created by another user.";

    const STATUS = selectedDocument?.DOCUMENT_STATUS?.toUpperCase();

    if (STATUS === "VERIFIED")
      return "Access Denied: Document is verified and approved.";
    if (STATUS === "AWAITING FOR USER ACCEPTANCE")
      return `Access Denied: Document is assigned to ${selectedDocument.ASSIGNED_USER}.`;
    if (STATUS === "IN PROGRESS")
      return "Access Denied: Document is in progress.";
    if (STATUS === "COMPLETED")
      return "Access Denied: Document has been completed.";
    return "";
  };

  const handleViewDocs = async (selectedDocs) => {
    const hasAccess = String(userViewRights)?.toLowerCase() === "allowed";

    if (!hasAccess) {
      alert("You don't have permission to view documents.");
      return;
    }

    try {
      const payload = {
        DataModelName: "SYNM_DMS_DETAILS",
        WhereCondition: `REF_SEQ_NO = ${selectedDocs.REF_SEQ_NO} AND SERIAL_NO = ${selectedDocs.SERIAL_NO}`,
        Orderby: "",
      };

      const response = await callSoapService(
        userData.clientURL,
        "DataModel_GetData",
        payload
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

  const handleDelete = async (doc) => {
    const editError = canCurrentUserEdit(doc);
    if (editError) {
      alert(editError);
      return;
    }

    if (!window.confirm(`Delete ${doc.DOC_NAME}?`)) return;

    try {
      const payload = {
        USER_NAME: userData.userName,
        REF_SEQ_NO: selectedDocument.REF_SEQ_NO,
        SERIAL_NO: doc.SERIAL_NO,
      };

      const response = await callSoapService(
        userData.clientURL,
        "DMS_Delete_DMS_Detail",
        payload
      );

      await refreshDocuments();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete document");
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected for upload.",
        description: "Please select at least one document to upload.",
      });
      return;
    }

    const editError = canCurrentUserEdit(selectedDocument);
    if (editError) {
      toast({
        title: "Access Denied",
        description: editError,
      });
      return;
    }

    // 2. Count primaries
    const existingPrimaryCount = existingDocs.filter(
      (doc) => doc.IS_PRIMARY_DOCUMENT
    ).length;
    const newPrimaryCount = files.filter(
      (file) => file.isPrimaryDocument
    ).length;
    const totalPrimaryCount = existingPrimaryCount + newPrimaryCount;

    // 3. Enforce exactly one primary
    if (totalPrimaryCount === 0) {
      toast({
        title: "You must have one primary document.",
        description: "You must select one primary document before uploading.",
      });
      return;
    }

    if (totalPrimaryCount > 1) {
      toast({
        title: "Only one primary document allowed.",
        description: "You can't upload more than one primary document.",
      });
      return;
    }

    // 4. Ready to upload
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const email = userData.userEmail;
      const refNo = selectedDocument.REF_SEQ_NO;
      // Calculate next serial number
      const maxSerial = existingDocs.reduce(
        (max, doc) => Math.max(max, doc.SERIAL_NO || 0),
        0
      );
      let currentSerial = maxSerial;

      for (const [index, file] of files.entries()) {
        currentSerial += 1;

        const formData = new FormData();
        formData.append("file", file.file);

        console.log(file.file);

        const uploadUrl = `https://apps.istreams-erp.com:4440/api/megacloud/upload?email=${encodeURIComponent(
          email
        )}&refNo=${encodeURIComponent(refNo)}`;

        const uploadResponse = await axios.post(uploadUrl, formData, {
          headers: {
            // Let Axios set the correct Content-Type including boundaries
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("uploadResponse", uploadResponse);

        if (uploadResponse.status !== 200) {
          throw new Error(
            `File upload failed with status ${uploadResponse.status}`
          );
        }

        const uploadResult = uploadResponse.data.message;
      }

      await refreshDocuments();
      setFiles([]);
      uploadModalRef.current?.close();
      onUploadSuccess();
    } catch (error) {
      toast({
        title: "Upload Failed",
        description:
          error?.message || "An error occurred while uploading files.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <dialog
      ref={uploadModalRef}
      id="document-upload-form"
      name="document-upload-form"
      className="relative"
    >
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center"
        aria-hidden="true"
        style={{ isolation: "isolate" }}
      >
        <div className="flex flex-col justify-between h-[80%] p-4 w-full max-w-5xl rounded-xl bg-white shadow-xl dark:bg-slate-950 text-gray-900 dark:text-gray-100 overflow-y-auto">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex justify-between items-center w-full text-sm gap-2">
                <span className="flex items-center gap-2 font-semibold">
                  Reference No:
                  <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-sm">
                    {selectedDocument?.REF_SEQ_NO}
                  </span>
                </span>
                <span className="flex items-center gap-2 font-semibold">
                  <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">
                    {selectedDocument?.DOCUMENT_DESCRIPTION} |{" "}
                    {existingDocs.length} files
                  </span>
                </span>
              </div>
              <button
                className="text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                onClick={() => uploadModalRef.current?.close()}
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <Separator className="my-4" />
            {fetchError && (
              <div className="alert alert-error mb-1">
                <span>{fetchError}</span>
              </div>
            )}

            <div
              className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Drag & drop files or click to select
              </p>
            </div>

            {isLoadingDocs ? (
              <p>Loading...</p>
            ) : existingDocs.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-4">
                {existingDocs.map((doc) => (
                  <div
                    key={`${doc.REF_SEQ_NO}-${doc.SERIAL_NO}`}
                    className="w-72"
                  >
                    <div className="card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="card-body p-4">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="p-2 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg">
                              <img
                                src={getFileIcon(doc.DOC_EXT)}
                                alt="Document"
                                className="w-6 h-6"
                              />
                            </div>
                            <div className="min-w-0 flex-1 overflow-hidden">
                              <h5
                                className="text-sm font-semibold truncate text-gray-800 dark:text-gray-300"
                                title={doc.DOC_NAME}
                              >
                                {doc.DOC_NAME.length > 24
                                  ? doc.DOC_NAME.slice(0, 24) + "..."
                                  : doc.DOC_NAME}
                              </h5>
                              <div className="text-xs mt-1 flex items-center gap-2">
                                <span className="text-gray-500 dark:text-gray-400">
                                  {doc?.DOC_EXT?.toUpperCase()}
                                </span>
                                {doc.IS_PRIMARY_DOCUMENT === "T" && (
                                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                    Primary
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1 items-center">
                            <button
                              onClick={() => handleViewDocs(doc)}
                              title="View"
                              className="p-1.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 dark:hover:text-blue-400"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(doc)}
                              title="Delete"
                              className="p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 dark:hover:text-red-400"
                            >
                              <XIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-center text-gray-500 my-4">
                No documents found for this reference
              </div>
            )}

            {files.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <div key={index} className="w-72 m-1 p-2">
                    <div className="card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
                      <div className="card-body p-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex gap-3 items-center">
                            <img
                              src={getFileIcon(file.docExtension)}
                              alt={file.name}
                              className="w-8 h-8 object-contain rounded"
                            />
                            <div className="min-w-0">
                              <p
                                className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate block max-w-[180px]"
                                title={file.name}
                              >
                                {file.name.length > 24
                                  ? file.name.slice(0, 24) + "..."
                                  : file.name}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {file.size}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setFiles((f) => f.filter((_, i) => i !== index))
                            }
                            className="btn btn-sm btn-circle btn-ghost p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-3 pt-2 flex justify-between items-center border-t border-gray-100 dark:border-gray-700">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <div className="relative">
                              <input
                                type="radio"
                                name="primaryDoc"
                                className="sr-only peer"
                                checked={file.isPrimaryDocument}
                                onChange={() => handleSetPrimary(index)}
                              />
                              <div className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-600 peer-checked:border-blue-500 transition-all">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 scale-0 peer-checked:scale-100 transition-transform" />
                              </div>
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              Primary Document
                            </span>
                          </label>
                          {file.isPrimaryDocument && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                              Selected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 w-full mt-5">
            <Button
              variant="outline"
              onClick={() => uploadModalRef.current?.close()}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload}>
              {isSubmitting ? (
                <>Uploading...</>
              ) : (
                `Upload ${files.length} File${files.length !== 1 ? "s" : ""}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default DocumentUploadModal;
