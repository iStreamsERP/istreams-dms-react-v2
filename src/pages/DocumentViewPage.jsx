import GlobalSearchInput from "@/components/GlobalSearchInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileSearch } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import DocumentFormModal from "../components/dialog/DocumentFormModal";
import TaskForm from "../components/TaskForm";
import { useAuth } from "../contexts/AuthContext";
import { getAllDmsActiveUser } from "../services/dashboardService";
import { getDocMasterList, updateDmsAssignedTo } from "../services/dmsService";
import { formatDateTime } from "../utils/dateUtils";
import { callSoapService } from "@/services/callSoapService";

// Custom hook for debounced search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Skeleton loader for documents
const DocumentSkeleton = () => (
  <Card className="col-span-2 md:col-span-2 lg:col-span-1">
    <CardContent className="p-4">
      <div className="animate-pulse">
        <div className="flex items-start gap-2 mb-4">
          <div className="bg-gray-200 p-2 rounded-lg w-10 h-10"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="w-8 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="flex gap-2">
            <div className="flex-1 h-8 bg-gray-200 rounded"></div>
            <div className="flex-1 h-8 bg-gray-200 rounded"></div>
            <div className="w-16 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Memoized DocumentCard component
const DocumentCard = memo(
  ({
    doc,
    assignedUser,
    verifyEnabled,
    onVerify,
    onView,
    onEmployeeSelect,
    users,
    usersLoading,
  }) => {
    const handleEmployeeChange = useCallback(
      (value) => {
        onEmployeeSelect(doc, value);
      },
      [doc, onEmployeeSelect]
    );

    const handleVerifyClick = useCallback(() => {
      onVerify(doc);
    }, [doc, onVerify]);

    const handleViewClick = useCallback(() => {
      onView(doc);
    }, [doc, onView]);

    return (
      <Card className="col-span-2 md:col-span-2 lg:col-span-1">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 w-full mb-4">
            <div className="bg-neutral-100 p-2 rounded-lg ">
              <FileSearch className="w-4 h-4 text-neutral-900" />
            </div>
            <div className="flex justify-between items-start">
              <div className="truncate">
                <h2
                  className="text-lg font-semibold leading-tight mb-1 truncate w-full"
                  title={doc.DOCUMENT_DESCRIPTION}
                >
                  {doc.DOCUMENT_DESCRIPTION}
                </h2>
                <p className="text-xs text-gray-500 leading-none">
                  {doc.DOCUMENT_NO}
                </p>
              </div>
              <span className="text-xs badge badge-primary">
                {doc.REF_SEQ_NO}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-3">
            <div className="flex justify-between items-center w-full">
              <span className="text-sm font-medium">{doc.USER_NAME}</span>
              <span className="text-sm text-gray-500">
                {doc.NO_OF_DOCUMENTS} File(s)
              </span>
            </div>
            <p className="text-sm font-medium text-start w-full">
              Category :{" "}
              <span className="text-gray-500">{doc.DOC_RELATED_CATEGORY}</span>
            </p>
            <div className="flex items-end justify-between gap-2 w-full">
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-1 mb-3">
                  {doc.VERIFIED_BY ? (
                    <span
                      className={`text-xs text-gray-500 ${
                        doc.DOCUMENT_STATUS === "Rejected" ? "text-red-500" : ""
                      }`}
                    >
                      {doc.DOCUMENT_STATUS === "Rejected"
                        ? "Rejected by"
                        : "Verified by"}
                    </span>
                  ) : (
                    <span className="text-xs badge badge-error badge-outline leading-tight px-1">
                      Unverified
                    </span>
                  )}
                </div>
                <Button
                  className={`${
                    !doc.VERIFIED_BY
                      ? "btn btn-success btn-xs w-full"
                      : "btn btn-xs btn-active btn-ghost w-full"
                  }`}
                  onClick={!doc.VERIFIED_BY ? handleVerifyClick : undefined}
                  disabled={!verifyEnabled}
                >
                  {doc.VERIFIED_BY || "Verify"}
                </Button>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-3">Assign to</p>
                <Select
                  value={assignedUser || ""}
                  onValueChange={handleEmployeeChange}
                  disabled={!!assignedUser || !!doc.VERIFIED_BY || usersLoading}
                >
                  <SelectTrigger className="w-full text-center h-8 text-xs">
                    <SelectValue
                      placeholder={usersLoading ? "Loading..." : "Assign to"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user, userIndex) => (
                      <SelectItem
                        key={`user-${user.user_name}-${userIndex}`}
                        value={user.user_name}
                      >
                        {user.user_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" onClick={handleViewClick}>
                View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

DocumentCard.displayName = "DocumentCard";

export default function DocumentViewPage() {
  // Core data states
  const [docsData, setDocsData] = useState([]);
  const [users, setUsers] = useState([]);

  // Loading states
  const [isInitializing, setIsInitializing] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [processingAssignments, setProcessingAssignments] = useState(false);

  // UI states
  const [globalFilter, setGlobalFilter] = useState("");
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [docFormMode, setDocFormMode] = useState("view");

  // Assignment tracking
  const [verifyEnabled, setVerifyEnabled] = useState({});
  const [assignedUsers, setAssignedUsers] = useState({});

  // Pagination/virtualization
  const [displayedDocs, setDisplayedDocs] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const INITIAL_LOAD_COUNT = 12; // Show only 12 documents initially
  const LOAD_MORE_COUNT = 12; // Load 12 more each time

  const modalRefTask = useRef(null);
  const formModalRef = useRef(null);
  const { userData } = useAuth();
  const location = useLocation();

  // Debounce search
  const debouncedFilter = useDebounce(globalFilter, 300);

  // Memoize initial task data
  const initialTaskData = useMemo(
    () => ({
      userName: userData.userName,
      taskName: "",
      taskSubject: "",
      relatedTo: "",
      assignedTo: "",
      creatorReminderOn: formatDateTime(new Date(Date.now() + 2 * 86400000)),
      assignedDate: formatDateTime(new Date()),
      targetDate: formatDateTime(new Date(Date.now() + 86400000)),
      remindOnDate: formatDateTime(new Date()),
      refTaskID: -1,
      dmsSeqNo: 0,
      verifiedBy: userData.userName,
    }),
    [userData.userName]
  );

  const [taskData, setTaskData] = useState(initialTaskData);

  // Handle location state
  useEffect(() => {
    if (location.state?.categoryName) {
      setGlobalFilter(location.state.categoryName);
    }
  }, [location.state]);

  // Service call payload
  const getDocMasterListPayload = useMemo(
    () => ({
      whereCondition: "",
      orderby: "REF_SEQ_NO DESC",
      includeEmpImage: false,
    }),
    []
  );

  // Process assignment data
  const processAssignmentData = useCallback((docs) => {
    const newAssigned = {};
    const newVerify = {};

    docs.forEach((doc) => {
      if (doc.ASSIGNED_USER) {
        newAssigned[doc.REF_SEQ_NO] = doc.ASSIGNED_USER;
        newVerify[doc.REF_SEQ_NO] = true;
      }
    });

    return { newAssigned, newVerify };
  }, []);

  // Fetch documents
  const fetchDmsMaster = useCallback(async () => {
    setLoadingDocs(true);
    setError(null);

    try {
      const response = await getDocMasterList(
        getDocMasterListPayload,
        userData.userEmail,
        userData.clientURL
      );

      const docsArray = response?.length > 0 ? response : [];

      if (!docsArray.length) {
        setError("No documents available.");
        setDocsData([]);
        setDisplayedDocs([]);
      } else {
        setDocsData(docsArray);

        // Show only first batch initially
        const initialDocs = docsArray.slice(0, INITIAL_LOAD_COUNT);
        setDisplayedDocs(initialDocs);
        setShowMore(docsArray.length > INITIAL_LOAD_COUNT);

        // Process assignments for displayed docs only
        const { newAssigned, newVerify } = processAssignmentData(initialDocs);
        setAssignedUsers(newAssigned);
        setVerifyEnabled(newVerify);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError(err.message || "Error fetching documents.");
      setDocsData([]);
      setDisplayedDocs([]);
    } finally {
      setLoadingDocs(false);
    }
  }, [
    getDocMasterListPayload,
    userData.userEmail,
    userData.clientURL,
    processAssignmentData,
  ]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const userDetails = await getAllDmsActiveUser(
        userData.userName,
        userData.userEmail,
        userData.clientURL
      );
      setUsers(Array.isArray(userDetails) ? userDetails : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, [userData.userEmail, userData.clientURL, userData.userName]);

  // Load more documents
  const loadMoreDocs = useCallback(() => {
    const currentCount = displayedDocs.length;
    const nextBatch = docsData.slice(
      currentCount,
      currentCount + LOAD_MORE_COUNT
    );

    if (nextBatch.length > 0) {
      setDisplayedDocs((prev) => [...prev, ...nextBatch]);

      // Process assignments for new batch
      const { newAssigned, newVerify } = processAssignmentData(nextBatch);
      setAssignedUsers((prev) => ({ ...prev, ...newAssigned }));
      setVerifyEnabled((prev) => ({ ...prev, ...newVerify }));
    }

    setShowMore(currentCount + LOAD_MORE_COUNT < docsData.length);
  }, [displayedDocs.length, docsData, processAssignmentData]);

  // IMMEDIATE PAGE DISPLAY - Show skeleton first
  useEffect(() => {
    // Show page immediately with skeleton
    setIsInitializing(false);

    // Start loading docs after a tiny delay to allow page to render
    const timer = setTimeout(() => {
      fetchDmsMaster();
    }, 10);

    return () => clearTimeout(timer);
  }, [fetchDmsMaster]);

  // Load users after docs are loaded
  useEffect(() => {
    if (!loadingDocs && displayedDocs.length > 0) {
      const timer = setTimeout(() => {
        fetchUsers();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [loadingDocs, displayedDocs.length, fetchUsers]);

  // Filter documents efficiently
  const filteredDocs = useMemo(() => {
    if (!displayedDocs.length) return [];
    if (!debouncedFilter.trim()) return displayedDocs;

    const search = debouncedFilter.toLowerCase().trim();

    return displayedDocs.filter(
      (doc) =>
        doc.DOCUMENT_DESCRIPTION?.toLowerCase().includes(search) ||
        doc.DOCUMENT_NO?.toLowerCase().includes(search) ||
        doc.DOC_RELATED_TO?.toLowerCase().includes(search) ||
        doc.DOC_RELATED_CATEGORY?.toLowerCase().includes(search) ||
        doc.USER_NAME?.toLowerCase().includes(search) ||
        doc.REF_SEQ_NO?.toString().includes(search)
    );
  }, [displayedDocs, debouncedFilter]);

  // Event handlers
  const handleVerifySuccess = useCallback((refSeqNo, verifierName) => {
    setDocsData((prevDocs) =>
      prevDocs.map((doc) =>
        doc.REF_SEQ_NO === refSeqNo
          ? { ...doc, VERIFIED_BY: verifierName }
          : doc
      )
    );
    setDisplayedDocs((prevDocs) =>
      prevDocs.map((doc) =>
        doc.REF_SEQ_NO === refSeqNo
          ? { ...doc, VERIFIED_BY: verifierName }
          : doc
      )
    );
    formModalRef.current?.close();
    modalRefTask.current?.showModal();
  }, []);

  const handleVerify = useCallback((doc) => {
    setSelectedDocument(doc);
    setDocFormMode("verify");
    formModalRef.current?.showModal();
  }, []);

  const handleView = useCallback((doc) => {
    setSelectedDocument(doc);
    setDocFormMode("view");
    formModalRef.current?.showModal();
  }, []);

  const fetchCategories = useCallback(async (userName) => {
    try {
      const payload = {
        UserName: userName,
      };

      const response = await callSoapService(
        userData.clientURL,
        "DMS_Get_Allowed_DocCategories",
        payload
      );

      const categories = response.map((category) => category.CATEGORY_NAME);

      return categories;
    } catch (error) {
      console.log(error);
    }
  });

  const handleEmployeeSelect = useCallback(
    async (doc, selectedUserName) => {
      const isConfirm = window.confirm(
        "Are you sure you want to assign? This action cannot be undone."
      );
      if (!isConfirm) return;

      const categories = await fetchCategories(selectedUserName);

      const matchedUser = categories.includes(doc.DOC_RELATED_CATEGORY);

      if (matchedUser) {
        setTaskData((prev) => ({
          ...prev,
          taskName: doc.DOCUMENT_DESCRIPTION,
          relatedTo: doc.DOC_RELATED_TO,
          refSeqNo: doc.REF_SEQ_NO,
          dmsSeqNo: doc.REF_SEQ_NO,
          verifiedBy: doc.VERIFIED_BY,
          assignedTo: selectedUserName,
        }));

        const payload = {
          USER_NAME: userData.userName,
          ASSIGNED_TO: selectedUserName,
          REF_SEQ_NO: doc.REF_SEQ_NO,
        };

        setProcessingAssignments(true);

        try {
          await updateDmsAssignedTo(
            payload,
            userData.userEmail,
            userData.clientURL
          );
          setAssignedUsers((prev) => ({
            ...prev,
            [doc.REF_SEQ_NO]: selectedUserName,
          }));
          setVerifyEnabled((prev) => ({ ...prev, [doc.REF_SEQ_NO]: true }));
        } catch (error) {
          console.error("Error assigning document:", error);
        } finally {
          setProcessingAssignments(false);
        }
      } else {
        alert("Selected user does not have access to this category.");
      }
    },
    [userData.userName, userData.userEmail, userData.clientURL]
  );

  const handleTaskChange = useCallback((e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleTaskCreated = useCallback((newTask) => {
    setTaskData((prevTasks) => ({ ...prevTasks, newTask }));
  }, []);

  // Show page immediately - no initial loading screen
  if (isInitializing) {
    return null; // Render nothing briefly, then show skeleton
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        {/* Search and status */}
        <div className="relative">
          <GlobalSearchInput value={globalFilter} onChange={setGlobalFilter} />

          {/* Status indicators */}
          <div className="flex items-center gap-3 mt-2 min-h-[20px]">
            {loadingDocs && (
              <div className="flex items-center space-x-2 text-xs text-blue-600">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                <span>Loading documents...</span>
              </div>
            )}

            {loadingUsers && (
              <div className="flex items-center space-x-2 text-xs text-green-600">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                <span>Loading users...</span>
              </div>
            )}

            {processingAssignments && (
              <div className="flex items-center space-x-2 text-xs text-amber-600">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-600"></div>
                <span>Saving assignment...</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {error ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-red-500 font-medium">{error}</p>
            <Button onClick={fetchDmsMaster} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Documents grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {loadingDocs && displayedDocs.length === 0 ? (
                // Show skeleton while loading
                Array.from({ length: 6 }).map((_, i) => (
                  <DocumentSkeleton key={i} />
                ))
              ) : filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => (
                  <DocumentCard
                    key={doc.REF_SEQ_NO}
                    doc={doc}
                    assignedUser={assignedUsers[doc.REF_SEQ_NO]}
                    verifyEnabled={verifyEnabled[doc.REF_SEQ_NO]}
                    onVerify={handleVerify}
                    onView={handleView}
                    onEmployeeSelect={handleEmployeeSelect}
                    users={users}
                    usersLoading={loadingUsers}
                  />
                ))
              ) : debouncedFilter ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">
                    No documents match your search: "{debouncedFilter}"
                  </p>
                  <Button
                    onClick={() => setGlobalFilter("")}
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                </div>
              ) : displayedDocs.length === 0 && !loadingDocs ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-400">No documents available.</p>
                  <Button
                    onClick={fetchDmsMaster}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Refresh
                  </Button>
                </div>
              ) : null}
            </div>

            {/* Load more button */}
            {showMore && !debouncedFilter && (
              <div className="text-center py-4">
                <Button
                  onClick={loadMoreDocs}
                  variant="outline"
                  disabled={loadingDocs}
                >
                  {loadingDocs
                    ? "Loading..."
                    : `Load More (${
                        docsData.length - displayedDocs.length
                      } remaining)`}
                </Button>
              </div>
            )}

            {/* Documents count */}
            {displayedDocs.length > 0 && (
              <div className="text-center text-sm text-gray-500 py-2">
                Showing {Math.min(filteredDocs.length, displayedDocs.length)} of{" "}
                {docsData.length} documents
                {debouncedFilter && ` (filtered by "${debouncedFilter}")`}
              </div>
            )}
          </>
        )}
      </div>

      <TaskForm
        modalRefTask={modalRefTask}
        users={users}
        taskData={taskData}
        onTaskChange={handleTaskChange}
        onTaskCreated={handleTaskCreated}
      />

      <DocumentFormModal
        formModalRef={formModalRef}
        selectedDocument={selectedDocument}
        docMode={docFormMode}
        onSuccess={handleVerifySuccess}
      />
    </>
  );
}
