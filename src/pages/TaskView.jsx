import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowDownLeft, ArrowUpRight, IterationCwIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BarLoader } from "react-spinners";
import ConfirmationTaskModal from "../components/dialog/ConfirmationTaskModal";
import TransferTaskModal from "../components/dialog/TransferTaskModal";
import UpdateTaskModal from "../components/dialog/UpdateTaskModal";
import { useAuth } from "../contexts/AuthContext";
import { getEmployeeImage } from "../services/employeeService";
import {
  getUserTasks,
  transferUserTasks,
  updateUserTasks,
} from "../services/taskService";
import {
  convertServiceDate,
  formatDateParts,
  formatDateTime,
} from "../utils/dateUtils";
import { capitalizeFirstLetter } from "../utils/stringUtils";

const TaskView = () => {
  const { userData } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  // New assignment filter: "all", "assignedByMe", "assignedToMe"
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("name-asc"); // name-asc, name-desc, date-asc, date-desc
  const [searchText, setSearchText] = useState("");
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskData, setTaskData] = useState([]);

  // Modal state for the confirmation modal
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const DEFAULT_IMAGE =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbBa24AAg4zVSuUsL4hJnMC9s3DguLgeQmZA&s";

  const fetchUserTasks = useCallback(async () => {
    setLoadingTasks(true);
    try {
      const response = await getUserTasks(
        userData.currentUserName,
        userData.currentUserLogin,
        userData.clientURL
      );

      const taskDataArray = Array.isArray(response)
        ? response
        : response
        ? [response]
        : [];

      const tasksWithImages = await Promise.all(
        taskDataArray.map(async (task) => {
          try {
            const imageData = await getEmployeeImage(
              task.ASSIGNED_EMP_NO,
              userData.currentUserLogin,
              userData.clientURL
            );

            return {
              ...task,
              // If imageData is available, return the image data URL, else default image
              assignedEmpImage: imageData
                ? `data:image/jpeg;base64,${imageData}`
                : DEFAULT_IMAGE,
            };
          } catch (error) {
            console.error(
              `Error fetching image for assigned user ${task.ASSIGNED_EMP_NO}:`,
              error
            );
            return {
              ...task,
              assignedEmpImage: DEFAULT_IMAGE,
            };
          }
        })
      );

      setTaskData(tasksWithImages);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTaskData([]);
    } finally {
      setLoadingTasks(false);
    }
  }, [userData.currentUserLogin, userData.currentUserName, userData.clientURL]);

  useEffect(() => {
    fetchUserTasks();
  }, [fetchUserTasks]);

  // Filter tasks based on search text, status filter, and assignment filter.
  const filteredTasks = useMemo(() => {
    return taskData.filter((task) => {
      // Filter by status if filter is not "all"
      let statusMatch = true;
      if (statusFilter !== "all") {
        const statusMapping = {
          pending: "NEW",
          rejected: "REJECTED",
          accepted: "ACCEPTED",
        };
        statusMatch =
          task.STATUS === (statusMapping[statusFilter] || statusFilter);
      }

      // Filter by assignment filter
      let assignmentMatch = true;
      if (assignmentFilter === "assignedByMe") {
        assignmentMatch = task.CREATED_USER === userData.currentUserName;
      } else if (assignmentFilter === "assignedToMe") {
        assignmentMatch = task.ASSIGNED_USER === userData.currentUserName;
      }

      // Filter by search text: search in TASK_NAME and TASK_INFO (case-insensitive)
      const searchMatch =
        task.TASK_NAME?.toLowerCase().includes(searchText.toLowerCase()) ||
        task.TASK_INFO?.toLowerCase().includes(searchText.toLowerCase());

      return statusMatch && assignmentMatch && searchMatch;
    });
  }, [
    taskData,
    statusFilter,
    assignmentFilter,
    searchText,
    userData.currentUserName,
  ]);

  // Sort tasks based on sortOrder.
  const sortedTasks = useMemo(() => {
    const tasksCopy = [...filteredTasks];
    tasksCopy.sort((a, b) => {
      if (sortOrder.startsWith("name")) {
        const nameA = a.TASK_NAME.toLowerCase();
        const nameB = b.TASK_NAME.toLowerCase();
        if (nameA < nameB) return sortOrder === "name-asc" ? -1 : 1;
        if (nameA > nameB) return sortOrder === "name-asc" ? 1 : -1;
        return 0;
      } else if (sortOrder.startsWith("date")) {
        const dateA = new Date(a.CREATED_ON);
        const dateB = new Date(b.CREATED_ON);
        if (dateA < dateB) return sortOrder === "date-asc" ? -1 : 1;
        if (dateA > dateB) return sortOrder === "date-asc" ? 1 : -1;
        return 0;
      }
      return 0;
    });
    return tasksCopy;
  }, [filteredTasks, sortOrder]);

  const handleAcceptAndDeclineTask = (task) => {
    setSelectedTask(task);
    setIsConfirmationModalOpen(true);
  };

  const handleUpdateTask = (task) => {
    setSelectedTask(task);
    setIsUpdateModalOpen(true);
  };

  const handleTransferTask = (task) => {
    setSelectedTask(task);
    setIsTransferModalOpen(true);
  };

  // Handle modal actions
  const handleAction = async ({ status, date = "", remarks = "" }) => {
    try {
      const updateUserTasksPayload = {
        taskID: selectedTask.TASK_ID,
        taskStatus: status,
        statusDateTime: date || formatDateTime(new Date()),
        reason: remarks,
        userName: userData.currentUserName,
      };

      const updateResponse = await updateUserTasks(
        updateUserTasksPayload,
        userData.currentUserLogin,
        userData.clientURL
      );
    } catch (error) {
      console.error("Task update failed:", error);
    }

    setIsConfirmationModalOpen(false);
  };

  const handleTransfer = async (transferTaskData) => {
    try {
      const transferUserTasksPayload = {
        taskID: selectedTask.TASK_ID,
        userName: userData.currentUserName,
        notCompletionReason: transferTaskData.NotCompletionReason,
        subject: selectedTask.TASK_NAME,
        details: selectedTask.TASK_INFO,
        relatedTo: selectedTask.RELATED_ON,
        creatorReminderOn: transferTaskData.CreatorReminderOn,
        startDate: transferTaskData.StartDate,
        compDate: transferTaskData.CompDate,
        remindTheUserOn: transferTaskData.RemindTheUserOn,
        newUser: transferTaskData.NewUser,
      };

      const transferUserTasksResponse = await transferUserTasks(
        transferUserTasksPayload,
        userData.currentUserLogin,
        userData.clientURL
      );
    } catch (error) {
      console.error("Task transfer failed:", error);
    }

    setIsConfirmationModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsUpdateModalOpen(false);
    setIsConfirmationModalOpen(false);
    setIsTransferModalOpen(false);
  };

  const getButtons = (task) => {
    if (task.STATUS === "NEW")
      if (task.ASSIGNED_USER === userData.currentUserName) {
        return (
          <Button onClick={() => handleAcceptAndDeclineTask(task)}>
            Accept / Decline
          </Button>
        );
      } else if (task.CREATED_USER === userData.currentUserName) {
        return <Button onClick={() => handleUpdateTask(task)}>Update</Button>;
      }

    if (task.STATUS === "ACCEPTED") {
      if (task.ASSIGNED_USER === userData.currentUserName) {
        return <Button onClick={() => handleUpdateTask(task)}>Update</Button>;
      }
      if (task.CREATED_USER === userData.currentUserName) {
        return (
          <>
            <Button onClick={() => handleUpdateTask(task)}>Update</Button>
            <Button onClick={() => handleTransferTask(task)}>Transfer</Button>
          </>
        );
      }
    }

    return null; // No buttons if conditions don't match
  };

  return (
    <div className="container mx-auto space-y-6">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row md:justify-between gap-4">
        {/* Search and Sorting Inputs */}
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name: A-Z</SelectItem>
              <SelectItem value="name-desc">Name: Z-A</SelectItem>
              <SelectItem value="date-asc">Created: Oldest</SelectItem>
              <SelectItem value="date-desc">Created: Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
          {/* Assignment Filter Buttons */}
          <div className="flex gap-2">
            <Button
              variant={assignmentFilter === "all" ? "" : "outline"}
              onClick={() => setAssignmentFilter("all")}
            >
              All tasks
            </Button>
            <Button
              variant={assignmentFilter === "assignedByMe" ? "" : "outline"}
              onClick={() => setAssignmentFilter("assignedByMe")}
            >
              Assigned by me
            </Button>
            <Button
              variant={assignmentFilter === "assignedToMe" ? "" : "outline"}
              onClick={() => setAssignmentFilter("assignedToMe")}
            >
              Assigned to me
            </Button>
          </div>

          {/* Status Filter Select */}

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loadingTasks ? (
        <div className="flex justify-center items-start">
          <BarLoader color="#36d399" height={2} width="100%" />
        </div>
      ) : sortedTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {sortedTasks.map((task, index) => {
            const { day, month, year, daysRemaining } = formatDateParts(
              convertServiceDate(task.COMPLETION_DATE)
            );
            return (
              <Card key={index}>
                <CardContent className="p-4">
                  <div>
                    <div className="flex justify-between items-center gap-2 mb-4">
                      <span className="text-xs">Task ID: {task.TASK_ID}</span>
                      <span
                        className={`text-xs ${
                          task.STATUS === "ACCEPTED"
                            ? "text-green-500"
                            : task.STATUS === "REJECTED"
                            ? "text-red-500"
                            : "text-blue-500"
                        }`}
                      >
                        {task.STATUS === "NEW"
                          ? "Awaiting for Acceptance"
                          : task.STATUS}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-10 h-10">
                        <img
                          src={task.assignedEmpImage}
                          alt="User"
                          className="rounded-lg"
                        />
                      </div>
                      <div className="flex justify-between items-start gap-1 w-full">
                        <div className="flex-1">
                          {userData.currentUserName.toUpperCase() ===
                          task.ASSIGNED_USER.toUpperCase() ? (
                            <>
                              {/* When current user is the ASSIGNED_USER, display the CREATED_USER */}
                              <span className="text-xs font-medium text-gray-500 leading-none flex items-center gap-1">
                                {task.CREATED_USER.toUpperCase() ===
                                userData.currentUserName.toUpperCase()
                                  ? "Self Assigned" // Both created and assigned by current user
                                  : "Assigned to Me"}{" "}
                                {/* Current user is the assignee but not the creator */}
                                {task.CREATED_USER.toUpperCase() ===
                                userData.currentUserName.toUpperCase() ? (
                                  <IterationCwIcon className="h-4 w-4 text-indigo-500" />
                                ) : (
                                  <ArrowDownLeft className="h-4 w-4 text-teal-500" />
                                )}
                              </span>
                              <h2 className="text-md font-semibold leading-tight truncate">
                                {capitalizeFirstLetter(task.CREATED_USER)}
                              </h2>
                            </>
                          ) : userData.currentUserName.toUpperCase() ===
                            task.CREATED_USER.toUpperCase() ? (
                            <>
                              {/* When current user is the creator but not the assignee, show the assigned user */}
                              <span className="text-xs font-medium text-gray-500 leading-none flex items-center gap-1">
                                Assigned to
                                <ArrowUpRight className="h-4 w-4 text-orange-500" />
                              </span>
                              <h2 className="text-md font-semibold leading-tight truncate">
                                {capitalizeFirstLetter(task.ASSIGNED_USER)}
                              </h2>
                            </>
                          ) : null}
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 text-center">
                            Start Date:
                          </p>
                          <p className="font-medium text-sm">
                            {convertServiceDate(task.START_DATE)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-start justify-between gap-2">
                      <div className="h-24 overflow-y-auto flex-1">
                        <p className="text-lg font-semibold">
                          {task.TASK_NAME}
                        </p>
                        <p className="text-sm font-normal text-gray-500">
                          {task.TASK_INFO}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 text-center">
                          Due on:
                        </p>
                        <div className="bg-base-300 px-6 py-2 rounded-lg">
                          <p className="text-purple-600 font-bold text-xl leading-none">
                            {day}
                          </p>
                          <p className="text-xs font-medium">{month}</p>
                          <p className="text-xs font-medium">{year}</p>
                        </div>
                        <p className="text-red-500 font-medium text-xs">
                          {daysRemaining} days
                        </p>
                      </div>
                    </div>

                    <Separator className="my-4" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <p className="text-xs">
                        Created by:{" "}
                        {capitalizeFirstLetter(task.CREATED_USER) === "***00***"
                          ? "System"
                          : capitalizeFirstLetter(task.CREATED_USER)}
                      </p>
                      <p className="text-xs">
                        Created on: {convertServiceDate(task.CREATED_ON)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getButtons(task)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div>
          <p className="text-center text-gray-400">No tasks available.</p>
        </div>
      )}

      <ConfirmationTaskModal
        isOpen={isConfirmationModalOpen}
        onAction={handleAction}
        onClose={handleCloseModal}
      />

      <UpdateTaskModal
        isOpen={isUpdateModalOpen}
        onAction={handleAction}
        onClose={handleCloseModal}
      />

      <TransferTaskModal
        isOpen={isTransferModalOpen}
        onTransfer={handleTransfer}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default TaskView;
