import { Trash2, View, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useAuth } from "../contexts/AuthContext";
import {
  createAndSaveDMSDetails,
  deleteDMSDetails,
} from "../services/dmsService";
import { getFileIcon } from "../utils/getFileIcon";
import { readFileAsBase64 } from "../utils/soapUtils";
import LoadingSpinner from "./common/LoadingSpinner";
import axios from "axios";
import { getDataModelService } from "@/services/dataModelService";
import { Button } from "./ui/button";

const DocumentUpload = ({
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

        console.log(receivedDocs);
        
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
            isPrimary: false,
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
    const editError = canCurrentUserEdit(selectedDocument);
    if (editError) {
      alert(editError);
      return;
    }

    const hasPrimary = files.some((file) => file.isPrimaryDocument);
    if (!hasPrimary) {
      setErrorMsg("Please select a primary document before uploading.");
      alert("Please select a primary document before uploading.");
      setIsSubmitting(false);
      return;
    }

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
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error("Upload error:", error);
      setErrorMsg(`Upload failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <dialog
      ref={modalRefUpload}
      id="document-upload-form"
      name="document-upload-form"
      className="p-4 rounded-lg w-[90%] max-w-4xl"
    >
      <div className="modal-box w-11/12 max-w-5xl">
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center justify-between gap-2 w-full text-lg">
            <span className="flex items-center gap-2  font-semibold">
              Reference No:
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                {selectedDocument?.REF_SEQ_NO}
              </span>
            </span>
            <span className="flex items-center gap-2 font-semibold">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                {selectedDocument?.DOCUMENT_DESCRIPTION} | {existingDocs.length}{" "}
                files
              </span>
            </span>
          </div>
          <Button onClick={() => modalRefUpload.current?.close()}>
            <X />
          </Button>
        </div>

        {fetchError && (
          <div className="alert alert-error mb-1">
            <span>{fetchError}</span>
          </div>
        )}

        <div className="rounded-lg p-6 mb-2 bg-base-200">
          <div {...getRootProps()} className="text-center cursor-pointer">
            <input {...getInputProps()} />
            <p className="text-gray-500">
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
                  <div className="card card-compact bg-neutral text-neutral-content w-72">
                    <div className="card-body">
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-start gap-1">
                          <img
                            src={getFileIcon(doc.DOC_EXT)}
                            alt="Document type"
                            className="w-8 h-8"
                          />
                          <div className="flex-1">
                            <h5 className="text-md font-medium truncate">
                              {doc.DOC_NAME.length > 24
                                ? doc.DOC_NAME.substring(0, 24) + "..."
                                : doc.DOC_NAME}
                            </h5>
                            <div className="text-xs flex items-end gap-2">
                              <span className="text-gray-500">
                                Type: {doc.DOC_EXT}
                              </span>
                              {doc.IS_PRIMARY_DOCUMENT === "T" ? (
                                <span className="badge badge-primary badge-xs">
                                  Primary
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            icon={<View size={18} />}
                            onClick={() => handleViewDocs(doc)}
                            tooltip="View"
                            variant="ghost"
                          />
                          <Button
                            icon={<Trash2 size={18} />}
                            onClick={() => handleDelete(doc)}
                            tooltip="Delete"
                            variant="error"
                            className="text-red-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-xs text-center text-gray-500">
            No documents found for this reference
          </div>
        )}

        <div className="divider my-1"></div>

        {files.length > 0 && (
          <div>
            <div className="flex flex-wrap">
              {files.map((file, index) => (
                <div key={index} className="flex items-center p-2 rounded mb-2">
                  <div className="card card-compact bg-neutral text-neutral-content w-72">
                    <div className="card-body">
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-center gap-1">
                          <img
                            src={getFileIcon(file.docExtension)}
                            alt={file.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                          <div className="flex flex-col items-start">
                            <span className="text-md font-medium truncate">
                              {file.name.length > 24
                                ? file.name.substring(0, 24) + "..."
                                : file.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {file.size}
                            </span>
                          </div>
                        </div>

                        <button
                          className="btn btn-circle btn-ghost btn-xs"
                          onClick={() =>
                            setFiles((f) => f.filter((_, i) => i !== index))
                          }
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-2">
                        <label className="label cursor-pointer p-0">
                          <span className="label-text text-xs">
                            Primary Document
                          </span>
                          <input
                            type="radio"
                            name="primaryDoc"
                            checked={file.isPrimaryDocument}
                            onChange={() => handleSetPrimary(index)}
                            className="radio radio-primary radio-sm"
                          />
                        </label>
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

export default DocumentUpload;
