import { useEffect, useState } from "react";
import { updateRejectDmsDetails } from "../services/dmsService";
import { useAuth } from "../contexts/AuthContext";

const RejectModal = ({ modalRefReject, selectedDocument }) => {
  const { userData } = useAuth();

  const [remarks, setRemarks] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReject = async (selectedDocument) => {
    if (!remarks.trim()) {
      alert("Please enter remarks!");
      return;
    }
    setIsLoading(true);
    try {
      const updateRejectPayload = {
        ref_Seq_No: selectedDocument?.REF_SEQ_NO,
        currentUserName: userData?.currentUserName,
        documentDescription: selectedDocument?.DOCUMENT_DESCRIPTION,
        documentUserName: selectedDocument?.USER_NAME,
        rejectionRemarks: remarks,
      };

      const rejectionResponse = await updateRejectDmsDetails(
        updateRejectPayload,
        userData?.currentUserLogin,
        userData.clientURL
      );

      if (rejectionResponse) {
        alert("Document rejected successfully!");
        modalRefReject?.current?.close();
        setRemarks("");
      } else {
        setError("Failed to reject document. Please try again.");
      }
    } catch (error) {
      setError("Failed to reject document. Please try again.", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <dialog
      ref={modalRefReject}
      id="reject-document"
      className="modal modal-bottom sm:modal-middle"
    >
      <div className="modal-box">
        <p className="text-sm text-gray-500 mt-1 mb-3">
          Please provide a reason for rejecting:{" "}
          <b>{selectedDocument?.DOC_NAME}</b>
        </p>

        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="Enter rejection remarks..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        ></textarea>

        {/* Modal Actions */}
        <div className="modal-action flex justify-end gap-3 mt-4">
          <button
            type="button"
            className="btn btn-ghost px-4 py-2"
            onClick={() => modalRefReject?.current?.close()}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-error px-4 py-2"
            onClick={handleReject(selectedDocument)}
            disabled={isLoading}
          >
            {isLoading ? "Rejecting..." : "Reject"}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </dialog>
  );
};

export default RejectModal;
