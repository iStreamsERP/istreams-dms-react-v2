import { Eye, Trash2, View, X, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useAuth } from "../../contexts/AuthContext";
import {
  createAndSaveDMSDetails,
  deleteDMSDetails,
} from "../../services/dmsService";
import { getFileIcon } from "../../utils/getFileIcon";
import { readFileAsBase64 } from "../../utils/soapUtils";
import LoadingSpinner from "../common/LoadingSpinner";
import axios from "axios";
import { getDataModelService } from "@/services/dataModelService";
import { Button } from "../ui/button";
import { toast } from "@/hooks/use-toast";

const DocumentUploadModal = ({
  modalRefUpload,
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

  // Fetch existing documents and categories
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedDocument?.REF_SEQ_NO) return;

      setIsLoadingDocs(true);
      setFetchError("");

      try {
        // Fetch existing documents
        const docsResponse = await getDataModelService(
          {
            DataModelName: "synmview_dms_details_all",
            WhereCondition: `REF_SEQ_NO = ${selectedDocument.REF_SEQ_NO}`,
            Orderby: "",
          },
          selectedDocument.USER_NAME,
          userData.clientURL
        );

        // Handle different response formats
        const receivedDocs = Array.isArray(docsResponse)
          ? docsResponse
          : docsResponse?.Data || [];

        setExistingDocs(receivedDocs);
      } catch (err) {
        console.error("Fetch existing docs error:", err);
        setFetchError("Failed to load existing documents");
      } finally {
        setIsLoadingDocs(false);
      }
    };

    fetchData();
  }, [selectedDocument?.REF_SEQ_NO, userData.currentUserLogin]);

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
      const response = await getDataModelService(
        {
          DataModelName: "SYNM_DMS_DETAILS",
          WhereCondition: `REF_SEQ_NO = ${selectedDocument.REF_SEQ_NO}`,
          Orderby: "",
        },
        userData.currentUserLogin,
        userData.clientURL
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
    if (selectedDocument?.USER_NAME !== userData.currentUserName)
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

  // Download & view documents
  const handleViewDocs = async (selectedDocs) => {
    try {
      const response = await getDataModelService(
        {
          DataModelName: "SYNM_DMS_DETAILS",
          WhereCondition: `REF_SEQ_NO = ${selectedDocs.REF_SEQ_NO} AND SERIAL_NO = ${selectedDocs.SERIAL_NO}`,
          Orderby: "",
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

  const handleDelete = async (doc) => {
    const editError = canCurrentUserEdit(doc);
    if (editError) {
      alert(editError);
      return;
    }

    if (!window.confirm(`Delete ${doc.DOC_NAME}?`)) return;

    try {
      await deleteDMSDetails(
        {
          userName: userData.currentUserName,
          refSeqNo: selectedDocument.REF_SEQ_NO,
          serialNo: doc.SERIAL_NO,
        },
        userData.currentUserLogin,
        userData.clientURL
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
        description: "You can’t upload more than one primary document.",
      });
      return;
    }

    // 4. Ready to upload
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const email = userData.currentUserLogin;
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

        const uploadUrl = `https://cloud.istreams-erp.com:4440/api/megacloud/upload?email=${encodeURIComponent(
          email
        )}&refNo=${encodeURIComponent(refNo)}`;

        const uploadResponse = await axios.post(uploadUrl, formData, {
          headers: {
            // Let Axios set the correct Content-Type including boundaries
            "Content-Type": "multipart/form-data",
          },
        });

        if (uploadResponse.status !== 200) {
          throw new Error(
            `File upload failed with status ${uploadResponse.status}`
          );
        }

        const uploadResult = uploadResponse.data;

        const base64Data = await readFileAsBase64(file.file);

        const payload = {
          REF_SEQ_NO: selectedDocument.REF_SEQ_NO,
          SERIAL_NO: currentSerial,
          DOCUMENT_NO: selectedDocument.DOCUMENT_NO || "",
          DOCUMENT_DESCRIPTION: selectedDocument.DOCUMENT_DESCRIPTION || "",
          DOC_SOURCE_FROM: selectedDocument.DOC_SOURCE_FROM || "",
          DOC_RELATED_TO: selectedDocument.DOC_RELATED_TO || "",
          DOC_RELATED_CATEGORY: file.DOC_RELATED_CATEGORY || "",
          DOC_REF_VALUE: selectedDocument.DOC_REF_VALUE || "",
          USER_NAME: userData.currentUserName,
          COMMENTS: selectedDocument.COMMENTS || "",
          DOC_TAGS: selectedDocument.DOC_TAGS || "",
          FOR_THE_USERS: selectedDocument.FOR_THE_USERS || "",
          EXPIRY_DATE: file.EXPIRY_DATE || "",
          DOC_DATA: base64Data,
          DOC_NAME: file.name,
          DOC_EXT: file.name.split(".").pop(),
          FILE_PATH: "",
          IsPrimaryDocument: file.isPrimaryDocument,
        };

        await createAndSaveDMSDetails(
          payload,
          userData.currentUserLogin,
          userData.clientURL
        );
      }

      await refreshDocuments();
      setFiles([]);
      modalRefUpload.current?.close();
      onUploadSuccess();
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error || "An error occurred while uploading files.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <dialog
      ref={modalRefUpload}
      id="document-upload-form"
      name="document-upload-form"
      className="p-4 w-full rounded-xl max-w-4xl bg-white shadow-xl dark:bg-gray-800 text-gray-900 dark:text-gray-100 "
    >
      <div className="modal-box  max-w-5xl ">
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center justify-between gap-2 w-full text-sm">
            <span className="flex items-center gap-2  font-semibold">
              Reference No :
              <span className="bg-purple-100 text-purple-800 px-2  rounded-full text-sm">
                {selectedDocument?.REF_SEQ_NO}
              </span>
            </span>
            <span className="flex items-center gap-2 font-semibold">
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                {selectedDocument?.DOCUMENT_DESCRIPTION} | {existingDocs.length}{" "}
                files
              </span>
            </span>
          </div>
          <button
            className="btn btn-sm btn-circle hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full btn-ghost"
            onClick={() => modalRefUpload.current?.close()}
            type="button"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        {fetchError && (
          <div className="alert alert-error mb-1">
            <span>{fetchError}</span>
          </div>
        )}

        <div className=" bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
          <div {...getRootProps()} className="text-center cursor-pointer">
            <input {...getInputProps()} />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Drag & drop files or click to select
            </p>
          </div>
        </div>

        {isLoadingDocs ? (
          <LoadingSpinner />
        ) : existingDocs.length > 0 ? (
          <div>
            <div className="flex flex-wrap gap-2">
              {existingDocs.map((doc, index) => (
                <div
                  key={`${doc.REF_SEQ_NO}-${doc.SERIAL_NO}`}
                  className="flex items-center rounded"
                >
                  <div className="card bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 border border-gray-200 rounded-2xl mt-3 shadow-sm w-72 hover:shadow-md transition-shadow">
                    <div className="card-body p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-700 dark:border-gray-600">
                            <img
                              src={getFileIcon(doc.DOC_EXT)}
                              alt="Document type"
                              className="w-6 h-6"
                            />
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-300 truncate">
                              {doc.DOC_NAME.length > 24
                                ? doc.DOC_NAME.substring(0, 24) + "..."
                                : doc.DOC_NAME}
                            </h5>
                            <div className="text-xs flex items-center gap-2 mt-1">
                              <span className="text-gray-500 dark:text-gray-400">
                                {doc.DOC_EXT.toUpperCase()}
                              </span>
                              {doc.IS_PRIMARY_DOCUMENT === "T" && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  Primary
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleViewDocs(doc)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors dark:hover:bg-gray-700 dark:hover:text-blue-400"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors dark:hover:bg-gray-700 dark:hover:text-red-400"
                            title="Delete"
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
          </div>
        ) : (
          <div className="text-xs text-center text-gray-500 mt-2 border-b border-gray-200 dark:border-gray-700  p-1 mb-5">
            No documents found for this reference
          </div>
        )}

        <div className="divider my-1"></div>

        {files.length > 0 && (
          <div>
            <div className="flex flex-wrap">
              {files.map((file, index) => (
                <div key={index} className="flex items-center  m-1 p-2 mb-2">
                  <div className="card card-compact bg-neutral  text-neutral-content w-72">
                    <div className="card-body p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={getFileIcon(file.docExtension)}
                            alt={file.name}
                            className="w-8 h-8 object-contain rounded"
                          />
                          <div className="flex flex-col items-start min-w-0">
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[180px]">
                              {file.name.length > 24
                                ? file.name.substring(0, 24) + "..."
                                : file.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {file.size}
                            </span>
                          </div>
                        </div>

                        <button
                          className="btn btn-sm btn-circle hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded-full btn-ghost text-gray-500 dark:text-gray-400 transition-colors"
                          onClick={() =>
                            setFiles((f) => f.filter((_, i) => i !== index))
                          }
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <div className="relative">
                            <input
                              type="radio"
                              name="primaryDoc"
                              checked={file.isPrimaryDocument}
                              onChange={() => handleSetPrimary(index)}
                              className="sr-only peer"
                            />
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 peer-checked:border-blue-500 flex items-center justify-center transition-all">
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 scale-0 peer-checked:scale-100 transition-transform"></div>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
          </div>
        )}

        <div className="modal-action">
          <div className="flex justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => modalRefUpload.current?.close()}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload}>
              {isSubmitting ? (
                <>
                  Uploading...
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                </>
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