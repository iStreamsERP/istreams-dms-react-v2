import {
  AlertTriangleIcon,
  Rotate3DIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useAuth } from "../contexts/AuthContext";
import { callSoapService } from "@/services/callSoapService";
import AccessDenied from "@/components/AccessDenied";

// Utility: Split an event into hour blocks with unique ids
function splitEventToHourBlocks(event) {
  const blocks = [];
  const startTotal = event.START_TIME * 60 + Number(event.startMinute);
  const endTotal = event.END_TIME * 60 + Number(event.endMinute);

  let blockStart = startTotal;
  while (blockStart < endTotal) {
    const nextHour = Math.floor(blockStart / 60) + 1;
    const blockEnd = Math.min(nextHour * 60, endTotal);
    const startHour = Math.floor(blockStart / 60);
    const startMinute = blockStart % 60;
    const endHour =
      Math.floor((blockEnd - 1) / 60) + (blockEnd % 60 === 0 ? 0 : 1);
    const endMinute = blockEnd === endTotal ? event.endMinute : 0;

    blocks.push({
      ...event,
      id: `${event.id}_${startHour}_${startMinute}`,
      blockParentId: event.id,
      blockStartHour: startHour,
      blockStartMinute: startMinute,
      blockEndHour: blockEnd === endTotal ? event.END_TIME : startHour + 1,
      blockEndMinute: endMinute,
    });

    blockStart = blockEnd;
  }
  return blocks;
}

export default function TimeSheetPage() {
  const [userRights, setUserRights] = useState("");

  const [tasks, setTasks] = useState([
    {
      TASK_ID: 1,
      TASK_NAME: "Database Optimization",
      dmsNo: "30000001",
      status: "Completed",
      PROJECT_NO: "P1001",
    },
    {
      TASK_ID: 2,
      TASK_NAME: "Firewall Configuration",
      dmsNo: "30000002",
      status: "In Progress",
      PROJECT_NO: "P1002",
    },
    {
      TASK_ID: 3,
      TASK_NAME: "Employee Training Program",
      dmsNo: "30000003",
      status: "Pending",
      PROJECT_NO: "P1003",
    },
    {
      TASK_ID: 4,
      TASK_NAME: "Server Maintenance",
      dmsNo: "30000004",
      status: "Completed",
      PROJECT_NO: "P1004",
    },
    {
      TASK_ID: 5,
      TASK_NAME: "Mobile App Development",
      dmsNo: "30000005",
      status: "In Progress",
      PROJECT_NO: "P1005",
    },
    {
      TASK_ID: 6,
      TASK_NAME: "Data Migration",
      dmsNo: "30000006",
      status: "Pending",
      PROJECT_NO: "P1006",
    },
    {
      TASK_ID: 7,
      TASK_NAME: "Network Security Audit",
      dmsNo: "30000007",
      status: "Completed",
      PROJECT_NO: "P1007",
    },
    {
      TASK_ID: 8,
      TASK_NAME: "CRM Implementation",
      dmsNo: "30000008",
      status: "In Progress",
      PROJECT_NO: "P1008",
    },
    {
      TASK_ID: 9,
      TASK_NAME: "Budget Planning",
      dmsNo: "30000009",
      status: "Pending",
      PROJECT_NO: "P1009",
    },
    {
      TASK_ID: 10,
      TASK_NAME: "Cloud Storage Setup",
      dmsNo: "30000010",
      status: "Completed",
      PROJECT_NO: "P1010",
    },
    {
      TASK_ID: 11,
      TASK_NAME: "UI/UX Redesign",
      dmsNo: "30000011",
      status: "In Progress",
      PROJECT_NO: "P1011",
    },
    {
      TASK_ID: 12,
      TASK_NAME: "Vendor Contract Review",
      dmsNo: "30000012",
      status: "Pending",
      PROJECT_NO: "P1012",
    },
    {
      TASK_ID: 14,
      TASK_NAME: "API Integration",
      dmsNo: "30000014",
      status: "In Progress",
      PROJECT_NO: "P1014",
    },
    {
      TASK_ID: 15,
      TASK_NAME: "Inventory Audit",
      dmsNo: "30000015",
      status: "Pending",
      PROJECT_NO: "P1015",
    },
    {
      TASK_ID: 17,
      TASK_NAME: "Payment Gateway Setup",
      dmsNo: "30000017",
      status: "In Progress",
      PROJECT_NO: "P1017",
    },
    {
      TASK_ID: 18,
      TASK_NAME: "HR Policy Update",
      dmsNo: "30000018",
      status: "Pending",
      PROJECT_NO: "P1018",
    },
    {
      TASK_ID: 20,
      TASK_NAME: "Analytics Dashboard",
      dmsNo: "30000020",
      status: "In Progress",
      PROJECT_NO: "P1020",
    },
    {
      TASK_ID: 21,
      TASK_NAME: "Facility Maintenance",
      dmsNo: "30000021",
      status: "Pending",
      PROJECT_NO: "P1021",
    },
    {
      TASK_ID: 23,
      TASK_NAME: "E-commerce Platform",
      dmsNo: "30000023",
      status: "In Progress",
      PROJECT_NO: "P1023",
    },
    {
      TASK_ID: 24,
      TASK_NAME: "Legal Document Review",
      dmsNo: "30000024",
      status: "Pending",
      PROJECT_NO: "P1024",
    },
    {
      TASK_ID: 26,
      TASK_NAME: "Chatbot Implementation",
      dmsNo: "30000026",
      status: "In Progress",
      PROJECT_NO: "P1026",
    },
    {
      TASK_ID: 27,
      TASK_NAME: "Annual Report Preparation",
      dmsNo: "30000027",
      status: "Pending",
      PROJECT_NO: "P1027",
    },
  ]);

  const colorClasses = [
    // Blues
    "bg-blue-100 opacity-90",
    "bg-blue-200 opacity-85",
    "bg-blue-300 opacity-80",
    "bg-sky-100 opacity-90",
    "bg-sky-200 opacity-85",

    // Greens
    "bg-green-100 opacity-90",
    "bg-green-200 opacity-85",
    "bg-emerald-100 opacity-90",
    "bg-emerald-200 opacity-85",
    "bg-lime-100 opacity-90",

    // Yellows/Oranges
    "bg-yellow-100 opacity-90",
    "bg-amber-100 opacity-90",
    "bg-orange-100 opacity-90",

    // Reds
    "bg-red-100 opacity-90",
    "bg-rose-100 opacity-90",
    "bg-pink-100 opacity-90",

    // Purples
    "bg-purple-100 opacity-90",
    "bg-violet-100 opacity-90",
    "bg-indigo-100 opacity-90",
    "bg-fuchsia-100 opacity-90",

    // Teals/Cyans
    "bg-teal-100 opacity-90",
    "bg-cyan-100 opacity-90",

    // Special Colors
    "bg-amber-50 opacity-95",
    "bg-rose-50 opacity-95",
    "bg-indigo-50 opacity-95",
    "bg-emerald-50 opacity-95",

    // Darker variants
    "bg-blue-400 opacity-70",
    "bg-green-400 opacity-70",
    "bg-purple-400 opacity-70",
    "bg-pink-400 opacity-70",

    // Unique combinations
    "bg-gradient-to-br from-blue-100 to-blue-200 opacity-85",
    "bg-gradient-to-br from-green-100 to-teal-100 opacity-85",
    "bg-gradient-to-br from-purple-100 to-pink-100 opacity-85",
    "bg-gradient-to-br from-yellow-100 to-amber-100 opacity-85",

    // Additional colors
    "bg-cyan-200 opacity-85",
    "bg-lime-200 opacity-85",
    "bg-amber-200 opacity-85",
    "bg-violet-200 opacity-85",
    "bg-fuchsia-200 opacity-85",
    "bg-rose-200 opacity-85",
  ];
  const getRandomColor = () =>
    colorClasses[Math.floor(Math.random() * colorClasses.length)];

  const { userData } = useAuth();
  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const [selectedTask, setSelectedTask] = useState(null);
  const [timesheetsByDate, setTimesheetsByDate] = useState({});
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("timesheet-tab");
  const [showPopup, setShowPopup] = useState(false);
  const [taskDetails, setTaskDetails] = useState({
    TASK_ID: "",
    TASK_NAME: "",
    START_TIME: 8,
    startMinute: "00",
    END_TIME: 9,
    endMinute: "00",
    NO_OF_HOURS: "",
    NO_OF_MINUTES: "",
    PROJECT_NO: "",
    color: getRandomColor(),
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const datePickerRef = useRef(null);
  const [resizingEvent, setResizingEvent] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);

  const [deletedBlocks, setDeletedBlocks] = useState([]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = ["00", "15", "30", "45"];
  const rowHeight = 64; // pixels per hour row

  // Drag/resize constants
  const STEP = 15; // 15 minutes steps for snapping

  const MIN_DURATION = 15; // Minimum event duration in minutes
  const START_OF_DAY = 0; // 0:00
  const END_OF_DAY = 24 * 60; // 24:00

  // Ref for scrolling to 8 AM
  const timesheetScrollRef = useRef(null);

  // Scroll to 8 AM on mount or tab switch
  useEffect(() => {
    fetchUserRights();
    if (activeTab === "timesheet-tab" && timesheetScrollRef.current) {
      // Scroll to 8th hour (8 * rowHeight)
      timesheetScrollRef.current.scrollTop = 8 * rowHeight;
    }
  }, [activeTab, rowHeight]);

  const fetchUserRights = async () => {
    const userType = userData.isAdmin ? "ADMINISTRATOR" : "USER";
    const payload = {
      UserName: userData.userName,
      FormName: "DMS-TIMESHEETENTRY",
      FormDescription: "Time Sheet",
      UserType: userType,
    };

    const response = await callSoapService(
      userData.clientURL,
      "DMS_CheckRights_ForTheUser",
      payload
    );

    setUserRights(response);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const formatDateKey = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const updateEventInStorage = (updatedEvent) => {
    const dateKey = formatDateKey(selectedDate);
    setTimesheetsByDate((prev) => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      ),
    }));
    setEvents((prev) =>
      prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
    );
  };

  const openDatePicker = () => {
    if (datePickerRef.current) {
      datePickerRef.current.showModal();
    }
  };

  // 24-hour format with AM/PM
  const formatTime = (hour, minute) => {
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const displayMinute = minute.toString().padStart(2, "0");
    return `${displayHour}:${displayMinute} ${ampm}`;
  };

  function calculateDuration(START_TIME, startMinute, END_TIME, endMinute) {
    const startTotalMinutes =
      parseInt(START_TIME, 10) * 60 + parseInt(startMinute, 10);
    const endTotalMinutes =
      parseInt(END_TIME, 10) * 60 + parseInt(endMinute, 10);
    const duration = endTotalMinutes - startTotalMinutes;
    return duration > 0 ? duration : 0;
  }

  function formatDuration(durationInMinutes) {
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    return `${hours} hr ${minutes} min`;
  }

  const handleEdit = (e, event) => {
    e.preventDefault();
    if (!event) return;

    const todayKey = formatDateKey(new Date());
    const selectedDateKey = formatDateKey(selectedDate);

    // FIX: Allow editing for today only, but allow viewing for other dates
    if (selectedDateKey !== todayKey) {
      // Instead of alert, just open the popup in read-only mode or do nothing
      // Example: return; (no alert)
      return;
    }
    if (event.isCompleted) {
      alert(
        "This task is marked as completed. Please uncheck the checkbox to edit it."
      );
      return;
    }

    setTaskDetails(event);
    const foundTask = tasks.find((task) => task.TASK_NAME === event.TASK_NAME);
    setSelectedTask(foundTask || null);
    setShowPopup(true);
  };

  // FIX: Only store parent event, not blocks, to prevent duplication
  // ...existing code...
  const handleSave = (e) => {
    e.preventDefault();

    const todayKey = formatDateKey(new Date());
    const selectedDateKey = formatDateKey(selectedDate);

    if (selectedDateKey !== todayKey) {
      alert("You can only add events for today's date.");
      return;
    }

    const taskTitle = selectedTask
      ? selectedTask.TASK_NAME
      : taskDetails.TASK_NAME;

    if (!taskTitle) {
      alert("Task name is required.");
      return;
    }

    const {
      START_TIME = 0,
      startMinute = 0,
      END_TIME = 0,
      endMinute = 0,
    } = taskDetails;

    const startMins = parseInt(START_TIME) * 60 + parseInt(startMinute);
    const endMins = parseInt(END_TIME) * 60 + parseInt(endMinute);

    if (startMins >= endMins) {
      alert("End time must be after start time.");
      return;
    }

    let TASK_ID =
      taskDetails.TASK_ID || (selectedTask ? selectedTask.TASK_ID : null);
    let PROJECT_NO =
      taskDetails.PROJECT_NO || (selectedTask ? selectedTask.PROJECT_NO : null);
    let dmsNo = taskDetails.dmsNo || (selectedTask ? selectedTask.dmsNo : null);

    const NO_OF_MINUTES = calculateDuration(
      START_TIME,
      startMinute,
      END_TIME,
      endMinute
    );
    const NO_OF_HOURS = parseFloat((NO_OF_MINUTES / 60).toFixed(2));
    const TRANS_DATE = formatDateKey(selectedDate);

    // --- If editing a block, split parent event into up to 3 events ---
    if (editingBlock) {
      const { block, parentEvent } = editingBlock;
      const parentStart =
        parentEvent.START_TIME * 60 + Number(parentEvent.startMinute);
      const parentEnd =
        parentEvent.END_TIME * 60 + Number(parentEvent.endMinute);

      // The new block's time
      const newBlockStart = startMins;
      const newBlockEnd = endMins;

      // Check for overlap with other events (excluding this parent event)
      const overlappingEvent = events.some((event) => {
        if (event.id === parentEvent.id) return false;
        const eventStart = event.START_TIME * 60 + event.startMinute;
        const eventEnd = event.END_TIME * 60 + event.endMinute;
        return newBlockStart < eventEnd && newBlockEnd > eventStart;
      });
      if (overlappingEvent) {
        alert("This time slot overlaps with another event.");
        return;
      }

      // Prepare new events: before, edited block, after
      const newEvents = events.filter((ev) => ev.id !== parentEvent.id);

      // Before block
      if (newBlockStart > parentStart) {
        newEvents.push({
          ...parentEvent,
          id: parentEvent.id + "_before_" + newBlockStart,
          START_TIME: parentEvent.START_TIME,
          startMinute: parentEvent.startMinute,
          END_TIME: Math.floor(newBlockStart / 60),
          endMinute: newBlockStart % 60,
          NO_OF_MINUTES: newBlockStart - parentStart,
          NO_OF_HOURS: parseFloat(
            ((newBlockStart - parentStart) / 60).toFixed(2)
          ),
        });
      }
      // Edited block
      const updatedColor = taskDetails.color || getRandomColor();
      newEvents.push({
        ...parentEvent,
        id: parentEvent.id + "_edit_" + newBlockStart,
        TASK_NAME: taskTitle,
        TASK_ID,
        PROJECT_NO,
        dmsNo,
        START_TIME: parseInt(START_TIME),
        startMinute: parseInt(startMinute),
        END_TIME: parseInt(END_TIME),
        endMinute: parseInt(endMinute),
        color: updatedColor,
        USER_NAME: userData?.currentUserName || "",
        EMP_NO: userData?.currentUserEmpNo || "",
        NO_OF_HOURS,
        NO_OF_MINUTES,
        TRANS_DATE,
        isCompleted: taskDetails.isCompleted || false,
      });
      // After block
      if (newBlockEnd < parentEnd) {
        newEvents.push({
          ...parentEvent,
          id: parentEvent.id + "_after_" + newBlockEnd,
          START_TIME: Math.floor(newBlockEnd / 60),
          startMinute: newBlockEnd % 60,
          END_TIME: parentEvent.END_TIME,
          endMinute: parentEvent.endMinute,
          NO_OF_MINUTES: parentEnd - newBlockEnd,
          NO_OF_HOURS: parseFloat(((parentEnd - newBlockEnd) / 60).toFixed(2)),
        });
      }

      setTimesheetsByDate((prev) => ({
        ...prev,
        [TRANS_DATE]: newEvents,
      }));
      setEvents(newEvents);

      // --- Update color in pending/filtered tasks ---
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.TASK_NAME === taskTitle ? { ...t, color: updatedColor } : t
        )
      );
      setFilteredTasks((prevFiltered) =>
        prevFiltered.map((t) =>
          t.TASK_NAME === taskTitle ? { ...t, color: updatedColor } : t
        )
      );

      setEditingBlock(null);
      handleClosePopup();
      setSelectedTask(null);
      return;
    }

    // --- Normal add/update for full event ---
    // Prevent duplicate for same task in same day, except for the current editing event
    const taskAlreadyExists = events.some(
      (event) =>
        event.TASK_NAME === taskTitle &&
        event.id !== taskDetails.id &&
        formatDateKey(selectedDate) === event.TRANS_DATE
    );
    if (taskAlreadyExists) {
      alert("This task is already scheduled in the calendar.");
      return;
    }

    // Prevent overlap, except for the current editing event
    const overlappingEvent = events.some((event) => {
      if (event.id === taskDetails.id) return false;
      const eventStart = event.START_TIME * 60 + event.startMinute;
      const eventEnd = event.END_TIME * 60 + event.endMinute;
      return startMins < eventEnd && endMins > eventStart;
    });
    if (overlappingEvent) {
      alert("This time slot overlaps with another event.");
      return;
    }

    // Use the same id for update, or new id for new event
    const parentId = taskDetails.id || Date.now();

    const updatedColor = taskDetails.color || getRandomColor();

    const baseEvent = {
      id: parentId,
      TASK_NAME: taskTitle,
      TASK_ID,
      PROJECT_NO,
      dmsNo,
      START_TIME: parseInt(START_TIME),
      startMinute: parseInt(startMinute),
      END_TIME: parseInt(END_TIME),
      endMinute: parseInt(endMinute),
      color: updatedColor,
      USER_NAME: userData?.currentUserName || "",
      EMP_NO: userData?.currentUserEmpNo || "",
      NO_OF_HOURS,
      NO_OF_MINUTES,
      TRANS_DATE,
      isCompleted: taskDetails.isCompleted || false,
    };

    // Only store the parent event, not blocks
    setTimesheetsByDate((prev) => {
      const prevArr = prev[TRANS_DATE] || [];
      const filtered = prevArr.filter(
        (ev) => ev.id !== parentId && ev.id !== taskDetails.id
      );
      return {
        ...prev,
        [TRANS_DATE]: [...filtered, baseEvent],
      };
    });
    setEvents((prev) => {
      const filtered = prev.filter(
        (ev) => ev.id !== parentId && ev.id !== taskDetails.id
      );
      return [...filtered, baseEvent];
    });

    // --- Update color in pending/filtered tasks ---
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.TASK_NAME === taskTitle ? { ...t, color: updatedColor } : t
      )
    );
    setFilteredTasks((prevFiltered) =>
      prevFiltered.map((t) =>
        t.TASK_NAME === taskTitle ? { ...t, color: updatedColor } : t
      )
    );

    handleClosePopup();
    setSelectedTask(null);
  };
  // ...existing code...

  const handleSelectTask = (e, task) => {
    e.preventDefault();
    setSelectedTask(task);
    setTaskDetails((prev) => ({
      ...prev,
      TASK_NAME: task.TASK_NAME,
      TASK_ID: task.TASK_ID,
      PROJECT_NO: task.PROJECT_NO,
      dmsNo: task.dmsNo,
    }));
  };

  // FIX: Only store parent event, not blocks, to prevent duplication
  const handleDrop = (e, hour) => {
    e.preventDefault();

    const todayKey = formatDateKey(new Date());
    const selectedDateKey = formatDateKey(selectedDate);

    if (selectedDateKey !== todayKey) {
      alert("You can only add events for today's date.");
      return;
    }

    const taskData = e.dataTransfer.getData("task");
    if (!taskData) return;

    const task = JSON.parse(taskData);

    const boundingRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - boundingRect.left;
    const width = boundingRect.width;

    const minuteOffset = Math.floor((mouseX / width) * 60);
    let startMinute = Math.floor(minuteOffset / 15) * 15;

    let START_TIME = hour;
    let endMinute = startMinute + 15;
    let END_TIME = START_TIME;

    if (endMinute >= 60) {
      endMinute = 0;
      END_TIME += 1;
    }

    if (START_TIME < 0 || END_TIME > 24 || (END_TIME === 24 && endMinute > 0)) {
      alert("Tasks can only be scheduled between 12 AM and 12 PM.");
      return;
    }

    // Prepare event details
    const newId = Date.now();
    const TRANS_DATE = formatDateKey(selectedDate);
    const NO_OF_MINUTES =
      END_TIME * 60 + endMinute - (START_TIME * 60 + startMinute);
    const NO_OF_HOURS = parseFloat((NO_OF_MINUTES / 60).toFixed(2));
    const color = getRandomColor();

    const baseEvent = {
      id: newId,
      TASK_ID: task.TASK_ID,
      TASK_NAME: task.TASK_NAME,
      PROJECT_NO: task.PROJECT_NO,
      dmsNo: task.dmsNo,
      START_TIME,
      startMinute,
      END_TIME,
      endMinute,
      color,
      USER_NAME: userData?.currentUserName || "",
      EMP_NO: userData?.currentUserEmpNo || "",
      NO_OF_HOURS,
      NO_OF_MINUTES,
      TRANS_DATE,
      isCompleted: false,
    };

    // Prevent duplicate for same task in same day
    const taskAlreadyExists = events.some(
      (event) =>
        event.TASK_NAME === task.TASK_NAME &&
        formatDateKey(selectedDate) === event.TRANS_DATE
    );
    // if (taskAlreadyExists) {
    //   alert("This task is already scheduled in the calendar.");
    //   return;
    // }

    // Prevent overlap
    const startMins = START_TIME * 60 + startMinute;
    const endMins = END_TIME * 60 + endMinute;
    const overlappingEvent = events.some((event) => {
      const eventStart = event.START_TIME * 60 + event.startMinute;
      const eventEnd = event.END_TIME * 60 + event.endMinute;
      return startMins < eventEnd && endMins > eventStart;
    });
    if (overlappingEvent) {
      alert("This time slot overlaps with another event.");
      return;
    }

    // Only store the parent event, not blocks
    setTimesheetsByDate((prev) => {
      const prevArr = prev[TRANS_DATE] || [];
      return {
        ...prev,
        [TRANS_DATE]: [...prevArr, baseEvent],
      };
    });
    setEvents((prev) => [...prev, baseEvent]);

    // Optionally update color in pending list
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.TASK_NAME === task.TASK_NAME ? { ...t, color } : t
      )
    );
    setFilteredTasks((prevFiltered) =>
      prevFiltered.map((t) =>
        t.TASK_NAME === task.TASK_NAME ? { ...t, color } : t
      )
    );
  };

  const handleDelete = (e, eventId) => {
    e.preventDefault();
    const todayKey = formatDateKey(new Date());
    const selectedDateKey = formatDateKey(selectedDate);

    if (selectedDateKey !== todayKey) {
      alert("You can only delete events for today's date.");
      return;
    }

    // Find the parent event (by id)
    const eventToDelete = events.find((event) => event.id === eventId);
    if (!eventToDelete) return;

    // Remove the parent event
    setTimesheetsByDate((prev) => {
      const updatedEvents = (prev[selectedDateKey] || []).filter(
        (event) => event.id !== eventToDelete.id
      );
      if (updatedEvents.length === 0) {
        const { [selectedDateKey]: omit, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [selectedDateKey]: updatedEvents,
      };
    });

    setEvents((prev) => prev.filter((event) => event.id !== eventToDelete.id));

    if (eventToDelete && !eventToDelete.isCompleted) {
      setTasks((prevTasks) => {
        const taskExists = prevTasks.some(
          (t) => t.TASK_NAME === eventToDelete.TASK_NAME
        );
        if (!taskExists) {
          // Add back to pending, but with color removed
          return [
            ...prevTasks,
            {
              TASK_ID: eventToDelete.TASK_ID,
              TASK_NAME: eventToDelete.TASK_NAME,
              dmsNo: eventToDelete.dmsNo,
              status: "Pending",
              PROJECT_NO: eventToDelete.PROJECT_NO,
              color: undefined,
            },
          ];
        }
        // If already present, remove color
        return prevTasks.map((t) =>
          t.TASK_NAME === eventToDelete.TASK_NAME
            ? { ...t, color: undefined }
            : t
        );
      });
      setFilteredTasks((prevFiltered) =>
        prevFiltered.map((t) =>
          t.TASK_NAME === eventToDelete.TASK_NAME
            ? { ...t, color: undefined }
            : t
        )
      );
    }

    handleClosePopup();
  };

  // Delete a single hour block (not the whole event)
  const handleDeleteHourBlock = (blockId) => {
    // Find the block and its parent event
    let blockToDelete = null;
    let parentEvent = null;
    for (const event of events) {
      const blocks = splitEventToHourBlocks(event);
      const found = blocks.find((b) => b.id === blockId);
      if (found) {
        blockToDelete = found;
        parentEvent = event;
        break;
      }
    }
    if (!blockToDelete || !parentEvent) return;

    // Calculate times in minutes
    const parentStart =
      parentEvent.START_TIME * 60 + Number(parentEvent.startMinute);
    const parentEnd = parentEvent.END_TIME * 60 + Number(parentEvent.endMinute);
    const blockStart =
      blockToDelete.blockStartHour * 60 +
      Number(blockToDelete.blockStartMinute);
    const blockEnd =
      blockToDelete.blockEndHour * 60 + Number(blockToDelete.blockEndMinute);

    // Prepare new events (before and after the deleted block)
    const newEvents = events.filter((ev) => ev.id !== parentEvent.id);

    // Before block
    if (blockStart > parentStart) {
      newEvents.push({
        ...parentEvent,
        id: parentEvent.id + "_before_" + blockStart,
        START_TIME: parentEvent.START_TIME,
        startMinute: parentEvent.startMinute,
        END_TIME: blockToDelete.blockStartHour,
        endMinute: blockToDelete.blockStartMinute,
        NO_OF_MINUTES: blockStart - parentStart,
        NO_OF_HOURS: parseFloat(((blockStart - parentStart) / 60).toFixed(2)),
      });
    }
    // After block
    if (blockEnd < parentEnd) {
      newEvents.push({
        ...parentEvent,
        id: parentEvent.id + "_after_" + blockEnd,
        START_TIME: blockToDelete.blockEndHour,
        startMinute: blockToDelete.blockEndMinute,
        END_TIME: parentEvent.END_TIME,
        endMinute: parentEvent.endMinute,
        NO_OF_MINUTES: parentEnd - blockEnd,
        NO_OF_HOURS: parseFloat(((parentEnd - blockEnd) / 60).toFixed(2)),
      });
    }

    // If all blocks are deleted (no newEvents for this task), remove color from pending
    if (
      newEvents.filter((ev) => ev.TASK_NAME === parentEvent.TASK_NAME)
        .length === 0
    ) {
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.TASK_NAME === parentEvent.TASK_NAME ? { ...t, color: undefined } : t
        )
      );
      setFilteredTasks((prevFiltered) =>
        prevFiltered.map((t) =>
          t.TASK_NAME === parentEvent.TASK_NAME ? { ...t, color: undefined } : t
        )
      );
    }

    // Update state
    setEvents(newEvents);
    const dateKey = formatDateKey(selectedDate);
    setTimesheetsByDate((prev) => ({
      ...prev,
      [dateKey]: newEvents,
    }));
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setEditingBlock(null);
    setTaskDetails({
      TASK_ID: "",
      TASK_NAME: "",
      START_TIME: 8,
      startMinute: "00",
      END_TIME: 9,
      endMinute: "00",
      color: getRandomColor(),
    });
    setSelectedTask(null);
  };

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = tasks.filter((task) =>
      task.TASK_NAME.toLowerCase().includes(keyword)
    );
    setFilteredTasks(filtered);
  };

  const handleMouseDown = (hour) => {
    const todayKey = formatDateKey(new Date());
    const selectedDateKey = formatDateKey(selectedDate);

    if (selectedDateKey !== todayKey) {
      alert("You can only view events on previous dates.");
      return;
    }

    if (hour >= 24) {
      return;
    }

    setDragging(true);
    setDragStart(hour);
    setDragEnd(hour);
  };

  const handleMouseMove = (e, hour) => {
    if (!dragging) return;

    if (hour >= 24) {
      return;
    }

    if (hour !== dragEnd) {
      setDragEnd(hour);
    }
  };

  const handleMouseUp = () => {
    if (!dragging) return;

    setDragging(false);

    const start = Math.min(dragStart, dragEnd);
    const end = Math.max(dragStart, dragEnd) + 1;

    if (start >= 24 || end > 24) {
      alert("Tasks cannot start or end after 12 AM.");
      return;
    }

    setTaskDetails({
      id: null,
      TASK_NAME: "",
      START_TIME: start,
      startMinute: "00",
      END_TIME: end,
      endMinute: "00",
      color: getRandomColor(),
    });
    setShowPopup(true);
  };

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData("task", JSON.stringify(task));
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setDragImage(new Image(), 0, 0); // Hide default drag image
  };

  const checkOverlap = (newStartMinutes, newEndMinutes, currentEventId) => {
    return events.some((event) => {
      if (event.id === currentEventId) return false;
      const eventStart = event.START_TIME * 60 + event.startMinute;
      const eventEnd = event.END_TIME * 60 + event.endMinute;
      return newStartMinutes < eventEnd && newEndMinutes > eventStart;
    });
  };

  // --- FIX: Correct date check for resize handlers ---
  const handleRightResizeMouseDown = (e, targetEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const todayKey = formatDateKey(new Date());
    const selectedDateKey = formatDateKey(selectedDate);

    // FIX: Use correct date key comparison
    if (selectedDateKey !== todayKey) {
      alert("You can only edit events for today's date.");
      return;
    }

    const initialX = e.clientX;
    const initialEndHour = targetEvent.END_TIME;
    const initialEndMinute = targetEvent.endMinute;
    const initialStartHour = targetEvent.START_TIME;
    const initialStartMinute = targetEvent.startMinute;

    setResizingEvent({
      eventId: targetEvent.id,
      direction: "right",
    });

    document.body.style.cursor = "e-resize";

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - initialX;
      const sensitivity = Math.abs(deltaX) >= 60 ? 0.1 : 1;
      const pixelsPerMinute = 90 / 60;
      const movedMinutes = Math.round((deltaX * sensitivity) / pixelsPerMinute);
      const deltaStepMinutes = Math.round(movedMinutes / STEP) * STEP;

      const startTotalMinutes = initialStartHour * 60 + initialStartMinute;
      let newEndTotalMinutes =
        initialEndHour * 60 + initialEndMinute + deltaStepMinutes;

      // Enforce minimum duration
      if (newEndTotalMinutes <= startTotalMinutes + MIN_DURATION) {
        newEndTotalMinutes = startTotalMinutes + MIN_DURATION;
      }
      if (newEndTotalMinutes > END_OF_DAY) {
        newEndTotalMinutes = END_OF_DAY;
      }

      if (checkOverlap(startTotalMinutes, newEndTotalMinutes, targetEvent.id)) {
        return;
      }

      const newEndHour = Math.floor(newEndTotalMinutes / 60);
      const newEndMinute = newEndTotalMinutes % 60;

      const updatedEvent = {
        ...targetEvent,
        END_TIME: newEndHour,
        endMinute: newEndMinute,
        NO_OF_MINUTES: newEndTotalMinutes - startTotalMinutes,
        NO_OF_HOURS: parseFloat(
          ((newEndTotalMinutes - startTotalMinutes) / 60).toFixed(2)
        ),
      };

      updateEventInStorage(updatedEvent);
    };

    const onMouseUp = () => {
      setResizingEvent(null);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "default";
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleLeftResizeMouseDown = (e, targetEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const todayKey = formatDateKey(new Date());
    const selectedDateKey = formatDateKey(selectedDate);

    if (selectedDateKey !== todayKey) {
      alert("You can only edit events for today's date.");
      return;
    }

    const initialX = e.clientX;
    const initialStartHour = targetEvent.START_TIME;
    const initialStartMinute = targetEvent.startMinute;
    const initialEndHour = targetEvent.END_TIME;
    const initialEndMinute = targetEvent.endMinute;

    setResizingEvent({
      eventId: targetEvent.id,
      direction: "left",
    });

    document.body.style.cursor = "w-resize";

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - initialX;
      const sensitivity = Math.abs(deltaX) >= 60 ? 0.1 : 1;
      const pixelsPerMinute = 90 / 60;
      const movedMinutes = Math.round((deltaX * sensitivity) / pixelsPerMinute);
      const deltaStepMinutes = Math.round(movedMinutes / STEP) * STEP;

      const startTotalMinutes = initialStartHour * 60 + initialStartMinute;
      const endTotalMinutes = initialEndHour * 60 + initialEndMinute;
      // For left resize, subtract the delta
      let newStartTotalMinutes = startTotalMinutes + deltaStepMinutes;

      // Clamp to bounds and minimum duration
      if (newStartTotalMinutes < START_OF_DAY) {
        newStartTotalMinutes = START_OF_DAY;
      }
      if (newStartTotalMinutes > endTotalMinutes - MIN_DURATION) {
        newStartTotalMinutes = endTotalMinutes - MIN_DURATION;
      }

      if (checkOverlap(newStartTotalMinutes, endTotalMinutes, targetEvent.id)) {
        return;
      }

      const newStartHour = Math.floor(newStartTotalMinutes / 60);
      const newStartMinute = newStartTotalMinutes % 60;

      const updatedEvent = {
        ...targetEvent,
        START_TIME: newStartHour,
        startMinute: newStartMinute,
        NO_OF_MINUTES: endTotalMinutes - newStartTotalMinutes,
        NO_OF_HOURS: parseFloat(
          ((endTotalMinutes - newStartTotalMinutes) / 60).toFixed(2)
        ),
      };

      updateEventInStorage(updatedEvent);
    };

    const onMouseUp = () => {
      setResizingEvent(null);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "default";
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };
  // --- END FIX ---

  const handleDragMouseDown = (e, targetEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if selected date is today
    const todayKey = formatDateKey(new Date());
    const selectedDateKey = formatDateKey(selectedDate);

    // FIX: Use correct date key comparison
    if (selectedDateKey !== todayKey) {
      alert("You can only edit events for today's date.");
      return;
    }

    const initialY = e.clientY;
    const START_TIME = targetEvent.START_TIME;
    const startMinute = targetEvent.startMinute;
    const END_TIME = targetEvent.END_TIME;
    const endMinute = targetEvent.endMinute;

    const initialStartMinutes = START_TIME * 60 + startMinute;
    const initialEndMinutes = END_TIME * 60 + endMinute;

    setResizingEvent({
      eventId: targetEvent.id,
      direction: "move",
    });

    document.body.style.cursor = "grabbing";

    const onMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - initialY;
      const pixelsPerMinute = rowHeight / 60;
      const movedMinutes = Math.round(deltaY / pixelsPerMinute);
      const deltaStepMinutes = Math.round(movedMinutes / STEP) * STEP;

      let newStartMinutes = initialStartMinutes + deltaStepMinutes;
      let newEndMinutes = initialEndMinutes + deltaStepMinutes;

      const duration = initialEndMinutes - initialStartMinutes;

      if (newStartMinutes < START_OF_DAY) {
        newStartMinutes = START_OF_DAY;
        newEndMinutes = START_OF_DAY + duration;
      }
      if (newEndMinutes > END_OF_DAY) {
        newEndMinutes = END_OF_DAY;
        newStartMinutes = END_OF_DAY - duration;
      }

      if (checkOverlap(newStartMinutes, newEndMinutes, targetEvent.id)) {
        return;
      }

      const newStartHour = Math.floor(newStartMinutes / 60);
      const newStartMinute = newStartMinutes % 60;
      const newEndHour = Math.floor(newEndMinutes / 60);
      const newEndMinute = newEndMinutes % 60;

      const updatedEvent = {
        ...targetEvent,
        START_TIME: newStartHour,
        startMinute: newStartMinute,
        END_TIME: newEndHour,
        endMinute: newEndMinute,
      };

      updateEventInStorage(updatedEvent);
    };

    const onMouseUp = () => {
      setResizingEvent(null);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "default";
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const isFutureDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  // Fill only the double-clicked hour block to full hour, others remain unchanged
  const handleFillHourRight = (e, blockStartHour, blockStartMinute) => {
    e.preventDefault();
    e.stopPropagation();

    const todayKey = formatDateKey(new Date());
    const selectedDateKey = formatDateKey(selectedDate);
    if (selectedDateKey !== todayKey) {
      alert("You can only edit events for today's date.");
      return;
    }

    // Find the parent event and all its blocks
    let parentEvent = null;
    let parentBlocks = [];
    for (const event of events) {
      const blocks = splitEventToHourBlocks(event);
      if (
        blocks.some(
          (b) =>
            b.blockStartHour === blockStartHour &&
            Number(b.blockStartMinute) === Number(blockStartMinute)
        )
      ) {
        parentEvent = event;
        parentBlocks = blocks;
        break;
      }
    }
    if (!parentEvent) return;

    // Prepare new events: all blocks except the clicked one remain, clicked one is filled to hour
    const newEvents = events.filter((ev) => ev.id !== parentEvent.id);

    parentBlocks.forEach((block) => {
      if (
        block.blockStartHour === blockStartHour &&
        Number(block.blockStartMinute) === Number(blockStartMinute)
      ) {
        // Fill this block to the end of the hour
        const startTotal =
          block.blockStartHour * 60 + Number(block.blockStartMinute);
        const endTotal = (block.blockStartHour + 1) * 60;
        // Prevent overflow and overlap
        if (endTotal > END_OF_DAY) return;
        if (checkOverlap(startTotal, endTotal, parentEvent.id)) return;
        newEvents.push({
          ...parentEvent,
          id: `${parentEvent.id}_fill_${block.blockStartHour}`,
          START_TIME: block.blockStartHour,
          startMinute: Number(block.blockStartMinute),
          END_TIME: block.blockStartHour + 1,
          endMinute: 0,
          NO_OF_MINUTES: endTotal - startTotal,
          NO_OF_HOURS: parseFloat(((endTotal - startTotal) / 60).toFixed(2)),
        });
      } else {
        // Keep other blocks as they are
        const startTotal =
          block.blockStartHour * 60 + Number(block.blockStartMinute);
        const endTotal = block.blockEndHour * 60 + Number(block.blockEndMinute);
        newEvents.push({
          ...parentEvent,
          id: `${parentEvent.id}_keep_${block.blockStartHour}`,
          START_TIME: block.blockStartHour,
          startMinute: Number(block.blockStartMinute),
          END_TIME: block.blockEndHour,
          endMinute: Number(block.blockEndMinute),
          NO_OF_MINUTES: endTotal - startTotal,
          NO_OF_HOURS: parseFloat(((endTotal - startTotal) / 60).toFixed(2)),
        });
      }
    });

    setEvents(newEvents);
    const dateKey = formatDateKey(selectedDate);
    setTimesheetsByDate((prev) => ({
      ...prev,
      [dateKey]: newEvents,
    }));
  };

  const handleFillHourLeft = (e, blockStartHour, blockStartMinute) => {
    e.preventDefault();
    e.stopPropagation();

    const todayKey = formatDateKey(new Date());
    const selectedDateKey = formatDateKey(selectedDate);
    if (selectedDateKey !== todayKey) {
      alert("You can only edit events for today's date.");
      return;
    }

    // Find the parent event and all its blocks
    let parentEvent = null;
    let parentBlocks = [];
    for (const event of events) {
      const blocks = splitEventToHourBlocks(event);
      if (
        blocks.some(
          (b) =>
            b.blockStartHour === blockStartHour &&
            Number(b.blockStartMinute) === Number(blockStartMinute)
        )
      ) {
        parentEvent = event;
        parentBlocks = blocks;
        break;
      }
    }
    if (!parentEvent) return;

    // Prepare new events: all blocks except the clicked one remain, clicked one is filled from start of hour
    const newEvents = events.filter((ev) => ev.id !== parentEvent.id);

    parentBlocks.forEach((block) => {
      if (
        block.blockStartHour === blockStartHour &&
        Number(block.blockStartMinute) === Number(blockStartMinute)
      ) {
        // Fill this block from the start of the hour
        const startTotal = block.blockStartHour * 60;
        const endTotal =
          block.blockStartHour * 60 + Number(block.blockEndMinute);
        // Prevent underflow and overlap
        if (startTotal < START_OF_DAY) return;
        if (checkOverlap(startTotal, endTotal, parentEvent.id)) return;
        newEvents.push({
          ...parentEvent,
          id: `${parentEvent.id}_fill_left_${block.blockStartHour}`,
          START_TIME: block.blockStartHour,
          startMinute: 0,
          END_TIME: block.blockEndHour,
          endMinute: Number(block.blockEndMinute),
          NO_OF_MINUTES: endTotal - startTotal,
          NO_OF_HOURS: parseFloat(((endTotal - startTotal) / 60).toFixed(2)),
        });
      } else {
        // Keep other blocks as they are
        const startTotal =
          block.blockStartHour * 60 + Number(block.blockStartMinute);
        const endTotal = block.blockEndHour * 60 + Number(block.blockEndMinute);
        newEvents.push({
          ...parentEvent,
          id: `${parentEvent.id}_keep_${block.blockStartHour}`,
          START_TIME: block.blockStartHour,
          startMinute: Number(block.blockStartMinute),
          END_TIME: block.blockEndHour,
          endMinute: Number(block.blockEndMinute),
          NO_OF_MINUTES: endTotal - startTotal,
          NO_OF_HOURS: parseFloat(((endTotal - startTotal) / 60).toFixed(2)),
        });
      }
    });

    setEvents(newEvents);
    const dateKey = formatDateKey(selectedDate);
    setTimesheetsByDate((prev) => ({
      ...prev,
      [dateKey]: newEvents,
    }));
  };

  // Add this helper function inside your component
  function saveBlocksToState(blocks, dateKey) {
    setTimesheetsByDate((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), ...blocks],
    }));
    setEvents((prev) => [...prev, ...blocks]);
  }

  // --- NEW: Track which block is being edited ---
  const [editingBlock, setEditingBlock] = useState(null);

  // --- MODIFIED: Open popup for editing a specific hour block ---
  const handleEditBlock = (e, block, parentEvent) => {
    e.preventDefault();
    setEditingBlock({ block, parentEvent });
    setTaskDetails({
      ...parentEvent,
      START_TIME: block.blockStartHour,
      startMinute: block.blockStartMinute,
      END_TIME: block.blockEndHour,
      endMinute: block.blockEndMinute,
      color: parentEvent.color,
      id: parentEvent.id,
    });
    const foundTask = tasks.find(
      (task) => task.TASK_NAME === parentEvent.TASK_NAME
    );
    setSelectedTask(foundTask || null);
    setShowPopup(true);
  };

  if (userRights !== "Allowed") {
    return <AccessDenied />;
  }

  return (
    <>
      <form>
        <div className="flex flex-col md:flex-row w-[100%] h-full">
          {/* Sidebar: Pending & Completed Tasks */}
          <div className="w-[100%] md:w-[20%] h-[70vh] overflow-y-auto">
            <div className="mt-4 mb-2 w-full sticky top-0 z-10">
              <h3 className="text-sm rounded font-bold bg-orange-100 text-center border text-black border-gray-300 p-2">
                Pending Task
              </h3>
            </div>
            {tasks.filter((task) => task.status !== "Completed").length ===
            0 ? (
              <div className="p-4 text-xs text-center text-gray-500">
                No pending tasks
              </div>
            ) : (
              tasks
                .filter((task) => task.status !== "Completed")
                .map((task) => {
                  // Only show color if the task is present in events for the selected date
                  const isInTimesheet = events.some(
                    (ev) =>
                      ev.TASK_NAME === task.TASK_NAME &&
                      ev.TRANS_DATE === formatDateKey(selectedDate)
                  );
                  return (
                    <div
                      key={task.TASK_ID}
                      className={`
                        ${
                          isInTimesheet && task.color
                            ? task.color
                            : "bg-transparent"
                        }
                        flex items-center mb-1 justify-between text-black dark:text-white dark:hover:bg-gray-800  p-3 border border-gray-400
                        hover:bg-blue-100 transition-all duration-300 rounded-md shadow-sm hover:shadow-md cursor-pointer
                      `}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                    >
                      <div className="flex text-xs text-gray-500  dark:text-gray-600  items-center gap-2">
                        <div className="w-3 h-3 rounded-full text-xs animate-pulse bg-blue-500" />
                        <p className="font-medium">{task.TASK_NAME}</p>
                      </div>
                    </div>
                  );
                })
            )}

            {/* Completed Tasks Section */}
            <div className="mt-4 mb-2 w-full sticky top-0 z-10 md:w-[100%]">
              <h3 className="text-xs rounded font-bold bg-green-100 text-center border text-black border-gray-300 p-2">
                Completed Task
              </h3>
            </div>
            {tasks.filter((task) => task.status === "Completed").length ===
            0 ? (
              <div className="p-4 text-xs text-center text-gray-500">
                No completed tasks
              </div>
            ) : (
              tasks
                .filter((task) => task.status === "Completed")
                .map((task) => (
                  <div
                    key={task.TASK_ID}
                    className="flex items-center text-xs mb-1 justify-between p-3 border border-gray-400 hover:bg-green-50 transition-all duration-300 rounded-md shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <div className="flex items-center text-gray-500  dark:text-gray-600  text-xs gap-2">
                      <div className="w-3 h-3  rounded-full text-xs  bg-green-500 animate-pulse" />
                      <p className="font-medium ">{task.TASK_NAME}</p>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Main Content */}
          <div
            className="w-full md:w-[80%] bg-transparent h-full"
            style={{ minHeight: "400px" }}
          >
            <div className="flex border-b border-gray-300">
              <input
                type="radio"
                name="my_tabs_3"
                id="timesheet-tab"
                className="hidden"
                checked={activeTab === "timesheet-tab"}
                onChange={() => handleTabChange("timesheet-tab")}
              />
              <label
                htmlFor="timesheet-tab"
                className={`px-4 py-2 font-bold border-b-2 text-xs cursor-pointer ${
                  activeTab === "timesheet-tab"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-600"
                }`}
              >
                TimeSheet
              </label>

              <input
                type="radio"
                name="my_tabs_3"
                id="table-tab"
                className="hidden"
                checked={activeTab === "table-tab"}
                onChange={() => handleTabChange("table-tab")}
              />
              <label
                htmlFor="table-tab"
                className={`px-4 py-2 font-bold border-b-2 text-xs cursor-pointer ${
                  activeTab === "table-tab"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-600"
                }`}
              >
                Table
              </label>
            </div>

            {/* Timesheet Tab Content */}
            <div
              className={`tab-content h-[calc(100%-40px)] ${
                activeTab !== "timesheet-tab" ? "hidden" : ""
              }`}
            >
              <div
                className="w-full"
                style={{
                  minHeight: "400px",
                  height: "100%",
                }}
              >
                <div className="rounded-xl p-2 relative w-full overflow-x-auto md:overflow-x-hidden h-full">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h2 className="text-xl tracking-wider font-bold">
                      Time Sheet -{" "}
                      {selectedDate?.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h2>
                    <button
                      type="button"
                      className="mt-1 text-xs shadow-lg border border-gray-300 rounded px-3 py-1 dark:hover:bg-gray-800 hover:bg-gray-100"
                      onClick={openDatePicker}
                    >
                      Change Date{" "}
                      <Rotate3DIcon className="w-3 h-3 inline ml-1" />
                    </button>

                    <dialog
                      ref={datePickerRef}
                      className="fixed z-10 inset-0 overflow-y-auto"
                    >
                      <div className="flex items-center bg-black bg-opacity-50 dark:bg-opacity-100 justify-center overflow-y-auto overflow-x-auto h-[68vh] p-2 text-center">
                        <div
                          className="fixed inset-0 transition-opacity "
                          onClick={() => datePickerRef.current.close()}
                        >
                          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
                        </div>
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                          <div className="bg-white dark:bg-gray-800 text-black dark:text-gray-100 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex bg-white dark:bg-gray-800 sm:items-start">
                              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    className="text-gray-400 hover:text-gray-500"
                                    onClick={() =>
                                      datePickerRef.current.close()
                                    }
                                  >
                                    <span className="sr-only">Close</span>
                                    <svg
                                      className="h-6 w-6"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </button>
                                </div>
                                <DayPicker
                                  mode="single"
                                  selected={selectedDate}
                                  onSelect={(date) => {
                                    if (isFutureDate(date)) {
                                      alert(
                                        "You can only select today's date."
                                      );
                                      return;
                                    }
                                    setSelectedDate(date);
                                    datePickerRef.current.close();
                                  }}
                                  disabled={isFutureDate}
                                  className="rounded-lg mt-2 text-xs"
                                  classNames={{
                                    selected: "bg-blue-500 text-white rounded",
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </dialog>
                  </div>

                  <div className="flex mb-2 min-w-[600px]">
                    <p className="w-[22%] md:w-[10%] absolute text-center left-1 bg-gradient-to-r from-cyan-400 to-blue-600 text-white border border-blue-300 font-semibold text-xs p-1 rounded">
                      Time
                    </p>
                    <div className="w-full flex flex-row gap-1 ml-[10%] md:ml-[10%] me-3">
                      {minutes.map((min, index) => {
                        const nextMin = minutes[index + 1] || "60";
                        return (
                          <div
                            key={min}
                            className="text-center w-full border border-gray-400 font-semibold text-xs p-1 rounded"
                          >
                            {min}m - {nextMin}m
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* SCROLLABLE HOURS */}
                  <div
                    className="relative rounded-xl p-1 overflow-y-auto min-w-[600px]"
                    ref={timesheetScrollRef}
                    style={{
                      maxHeight: "calc(80vh - 120px)",
                      minHeight: "100px",
                      height: "100%",
                      scrollBehavior: "smooth",
                    }}
                  >
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="flex border-t border-gray-200 relative"
                        style={{ height: `${rowHeight}px` }}
                        onMouseDown={() => handleMouseDown(hour)}
                        onMouseMove={(e) => handleMouseMove(e, hour)}
                        onMouseUp={handleMouseUp}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, hour)}
                      >
                        <div className="w-[10%] md:w-[10%] flex items-center justify-center text-sm font-semibold text-gray-600">
                          {formatTime(hour, "00")}
                        </div>
                        {/* Responsive grid: 4 cols on md+, 2 cols on sm, 1 col on xs */}
                        <div className="w-full grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 gap-1 min-w-[320px]">
                          {minutes.map((_, i) => (
                            <div
                              key={i}
                              className="h-full w-full transition hover:bg-blue-100 dark:hover:bg-blue-800/20 rounded cursor-pointer"
                            />
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Render hour blocks with unique ids and delete per block */}
                    {events.flatMap((event, index) => {
                      const blocks = splitEventToHourBlocks(event).filter(
                        (block) => !deletedBlocks.includes(block.id)
                      );
                      return blocks.map((block, blockIndex) => {
                        const startTotalMinutes =
                          block.blockStartHour * 60 +
                          Number(block.blockStartMinute);
                        const endTotalMinutes =
                          block.blockEndHour * 60 +
                          Number(block.blockEndMinute);
                        const minuteInHour = startTotalMinutes % 60;
                        const durationInThisBlock =
                          endTotalMinutes - startTotalMinutes;

                        // Hide time range only if this block is exactly 15min (not the whole event)
                        const shortFormatTime = durationInThisBlock === 15;

                        // 10% for time label, 90% for grid
                        const leftPercent = (minuteInHour / 60) * 90;
                        const widthPercent = (durationInThisBlock / 60) * 90;

                        return (
                          <div
                            key={block.id}
                            className={`
                              absolute p-2 rounded-lg shadow-sm  flex justify-between items-start text-sm overflow-hidden
                              border border-transparent
                              ${block.color}
                              group
                              will-change-[top,left,width,height,transform,opacity]
                              transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]
                              hover:shadow-md
                            `}
                            style={{
                              top: `calc(${
                                Math.floor(startTotalMinutes / 60) * rowHeight +
                                8
                              }px)`,
                              left: `calc(10% + ${leftPercent}%)`,
                              width: `calc(${widthPercent}% - 0.4px)`,
                              height: `${rowHeight - 8}px`,
                              transform: "translateZ(0)",
                            }}
                            onMouseDown={(e) => handleDragMouseDown(e, event)}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              handleEditBlock(e, block, event);
                            }}
                            title="Double click to edit"
                          >
                            <div className="flex-1 pr-2 cursor-pointer relative z-10 transition-opacity duration-150 hover:opacity-90">
                              <div className="flex items-center whitespace-wrap gap-1">
                                <span className="text-xs font-semibold text-gray-900 truncate transition-all duration-200 hover:text-gray-700">
                                  {block.TASK_NAME}
                                </span>
                                {!shortFormatTime && (
                                  <span className="text-xs text-gray-700 whitespace-nowrap transition-opacity duration-200 group-hover:opacity-90">
                                    (
                                    {formatTime(
                                      block.blockStartHour,
                                      block.blockStartMinute
                                    )}{" "}
                                    -{" "}
                                    {formatTime(
                                      block.blockEndHour,
                                      block.blockEndMinute
                                    )}
                                    )
                                  </span>
                                )}
                              </div>

                              <span className="text-xs text-black transition-opacity duration-200 group-hover:opacity-90">
                                Duration:{" "}
                                {formatDuration(
                                  calculateDuration(
                                    event.START_TIME,
                                    event.startMinute,
                                    event.END_TIME,
                                    event.endMinute
                                  )
                                )}
                              </span>
                            </div>

                            <div className="flex flex-col gap-1 relative z-10">
                              <button
                                className="text-gray-700 hover:text-red-600 mt-2 transition-colors duration-200 ease-out text-xs transform hover:scale-110 active:scale-95"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteHourBlock(block.id);
                                }}
                              >
                                <XIcon
                                  size={18}
                                  className="hover:bg-red-100 rounded-full p-0.5 transition-all duration-150"
                                />
                              </button>
                            </div>

                            {/* Left resize handle */}
                            <div
                              className="absolute top-0 bottom-0 left-0 w-2 bg-transparent hover:bg-white/30 cursor-w-resize transition-all duration-200 z-20 opacity-0 group-hover:opacity-100"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleLeftResizeMouseDown(e, event);
                              }}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                handleFillHourLeft(
                                  e,
                                  block.blockStartHour,
                                  block.blockStartMinute
                                );
                              }}
                              title="Double click to fill hour"
                            >
                              <div className="absolute top-1/2 left-0.5 w-1 h-6 bg-gray-400 rounded-full transform -translate-y-1/2 transition-all duration-300 group-hover:bg-gray-500" />
                            </div>

                            {/* Right resize handle with dedicated tooltip */}
                            <div
                              className="absolute top-0 bottom-0 right-0 w-2 bg-transparent hover:bg-white/30 cursor-e-resize transition-all duration-200 z-20 opacity-0 group-hover:opacity-100"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleRightResizeMouseDown(e, event);
                              }}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                handleFillHourRight(
                                  e,
                                  block.blockStartHour,
                                  block.blockStartMinute
                                );
                              }}
                              title="Double click to fill hour"
                            >
                              <div className="absolute top-1/2 right-0.5 w-1 h-6 bg-gray-400 rounded-full transform -translate-y-1/2 transition-all duration-300 group-hover:bg-gray-500" />
                            </div>

                            {/* Tooltips */}
                            <div className="absolute -top-8 -right-2 text-gray-800 text-xs px-2 py-1 rounded-md pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out bg-white shadow-md border border-gray-200 whitespace-nowrap transform group-hover:translate-y-0 translate-y-1">
                              Double click to fill hour
                            </div>

                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-gray-800 text-xs px-2 py-1 rounded-md pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out bg-white shadow-md border border-gray-200 whitespace-nowrap transform group-hover:translate-y-0 translate-y-1">
                              Double click to edit • Drag to move
                            </div>
                          </div>
                        );
                      });
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Table Tab Content */}
            <div
              className={`tab-content h-[calc(100%-40px)] ${
                activeTab !== "table-tab" ? "hidden" : ""
              }`}
            >
              <div className="h-full overflow-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 ">
                    {Object.entries(timesheetsByDate).filter(
                      ([_, arr]) => arr.length > 0
                    ).length === 0 ? (
                      <tr>
                        <td
                          colSpan="10"
                          className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500"
                        >
                          No tasks added yet. Start by adding your first task!
                        </td>
                      </tr>
                    ) : (
                      Object.entries(timesheetsByDate)
                        .filter(([_, arr]) => arr.length > 0)
                        .flatMap(([date, dateEvents]) =>
                          dateEvents.flatMap((event) =>
                            splitEventToHourBlocks(event).map((block) => {
                              // Calculate duration for this block
                              const durationMinutes = calculateDuration(
                                block.blockStartHour,
                                block.blockStartMinute,
                                block.blockEndHour,
                                block.blockEndMinute
                              );
                              return (
                                <tr
                                  key={`${date}-${block.id}`}
                                  className="hover:bg-gray-100 text-gray-700 dark:text-white dark:hover:bg-gray-400"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {date}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {block.TASK_ID}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {block.TASK_NAME}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {block.PROJECT_NO}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatTime(
                                      block.blockStartHour,
                                      block.blockStartMinute
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatTime(
                                      block.blockEndHour,
                                      block.blockEndMinute
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDuration(durationMinutes)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {(durationMinutes / 60).toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                      {block.isCompleted
                                        ? "Completed"
                                        : "Pending"}
                                      {block.isCompleted ? (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-4 w-4 text-green-500"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1  1 0 011.414 0z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      ) : (
                                        <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <button
                                      className="text-gray-400 hover:text-red-500"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleDeleteHourBlock(block.id);
                                      }}
                                    >
                                      <Trash2Icon className="h-4 w-4" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )
                        )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Popup for Add/Edit Task */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-sm h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-base">
                  {taskDetails.id ? "Update Task" : "Add Task"}
                </h3>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  value={taskDetails.TASK_NAME}
                  placeholder="Search For A Task..."
                  onChange={(e) => {
                    setTaskDetails({
                      ...taskDetails,
                      TASK_NAME: e.target.value,
                    });
                    handleSearch(e);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 bg-white dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                {filteredTasks.filter(
                  (task) =>
                    task.status !== "Completed" &&
                    !events.some((event) => event.TASK_NAME === task.TASK_NAME)
                ).length > 0 ? (
                  <ul className="bg-gray-100 dark:bg-gray-800 text-xs rounded-lg p-1 h-36 overflow-y-scroll space-y-2">
                    {filteredTasks
                      .filter(
                        (task) =>
                          task.status !== "Completed" &&
                          !events.some(
                            (event) => event.TASK_NAME === task.TASK_NAME
                          )
                      )
                      .map((task) => (
                        <li key={task.TASK_ID}>
                          <button
                            className={`flex justify-between items-center w-full p-2 rounded-lg hover:bg-blue-50 ${
                              selectedTask?.TASK_ID === task.TASK_ID
                                ? "bg-blue-100"
                                : "bg-transparent"
                            }`}
                            onClick={(e) => handleSelectTask(e, task)}
                          >
                            <div className="flex flex-col text-left">
                              <span className="font-semibold">
                                {task.TASK_NAME}
                              </span>
                              <span className="text-xs text-gray-500">{`DMS No: ${task.dmsNo}`}</span>
                            </div>
                            <div
                              className={`flex items-center space-x-1 text-xs font-semibold py-1 px-2 rounded-full ${
                                task.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : task.status === "In Progress"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              <span>{task.status}</span>
                              <AlertTriangleIcon className="w-3 h-3" />
                            </div>
                          </button>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-4 h-24 flex items-center justify-center text-gray-500">
                    No pending tasks available
                  </div>
                )}

                {/* Start Time */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Time
                  </label>
                  <div className="flex gap-2">
                    <select
                      className="block w-1/2 rounded-md border-gray-300 bg-white dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5 dark:text-gray-200"
                      value={taskDetails.START_TIME ?? 8}
                      onChange={(e) => {
                        const hour24 = Number(e.target.value);
                        const suffix = hour24 >= 12 ? "PM" : "AM";
                        const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

                        setTaskDetails((prev) => ({
                          ...prev,
                          START_TIME: hour24,
                          timeSuffixStart: suffix,
                          formattedStartTime: `${hour12}:${
                            prev.startMinute?.toString().padStart(2, "0") ||
                            "00"
                          } ${suffix}`,
                        }));

                        // If new start time is after end time, adjust end time
                        if (
                          hour24 > (prev.END_TIME ?? 17) ||
                          (hour24 === prev.END_TIME &&
                            (prev.startMinute ?? 0) > (prev.endMinute ?? 0))
                        ) {
                          const newEndTime = Math.min(hour24 + 1, 24);
                          setTaskDetails((prev) => ({
                            ...prev,
                            END_TIME: newEndTime,
                            endMinute:
                              newEndTime === 24 ? 0 : prev.endMinute ?? 0,
                            timeSuffixEnd: newEndTime >= 12 ? "PM" : "AM",
                            formattedEndTime: `${
                              newEndTime % 12 === 0 ? 12 : newEndTime % 12
                            }:${
                              newEndTime === 24
                                ? "00"
                                : prev.endMinute?.toString().padStart(2, "0") ||
                                  "00"
                            } ${suffix}`,
                          }));
                        }
                      }}
                    >
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour12 = i % 12 === 0 ? 12 : i % 12;
                        return (
                          <option key={i} value={i}>
                            {hour12} {i >= 12 ? "PM" : "AM"}
                          </option>
                        );
                      })}
                    </select>
                    <div className="flex gap-1 w-1/2">
                      {["00", "15", "30", "45"].map((min) => (
                        <button
                          type="button"
                          key={min}
                          className={`px-2 py-1 text-xs rounded border ${
                            Number(taskDetails.startMinute) === Number(min)
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-white dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            const minuteValue = Number(min);
                            setTaskDetails((prev) => ({
                              ...prev,
                              startMinute: minuteValue,
                              formattedStartTime: `${
                                prev.START_TIME % 12 === 0
                                  ? 12
                                  : prev.START_TIME % 12
                              }:${min} ${prev.timeSuffixStart}`,
                            }));

                            // Validate against end time
                            if (
                              prev.START_TIME === prev.END_TIME &&
                              minuteValue > (prev.endMinute ?? 0)
                            ) {
                              setTaskDetails((prev) => ({
                                ...prev,
                                endMinute: minuteValue,
                                formattedEndTime: `${
                                  prev.END_TIME % 12 === 0
                                    ? 12
                                    : prev.END_TIME % 12
                                }:${min} ${prev.timeSuffixEnd}`,
                              }));
                            }
                          }}
                        >
                          {min}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* End Time */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Time
                  </label>
                  <div className="flex gap-2">
                    <select
                      className="block w-1/2 rounded-md border-gray-300 bg-white dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5 dark:text-gray-200"
                      value={taskDetails.END_TIME ?? 17}
                      onChange={(e) => {
                        const hour24 = Number(e.target.value);
                        const suffix = hour24 >= 12 ? "PM" : "AM";
                        const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

                        if (hour24 < taskDetails.START_TIME) {
                          alert("End Time cannot be earlier than Start Time.");
                          return;
                        }

                        setTaskDetails((prev) => ({
                          ...prev,
                          END_TIME: hour24,
                          timeSuffixEnd: suffix,
                          endMinute: hour24 === 24 ? 0 : prev.endMinute ?? 0,
                          formattedEndTime: `${hour12}:${
                            hour24 === 24
                              ? "00"
                              : prev.endMinute?.toString().padStart(2, "0") ||
                                "00"
                          } ${suffix}`,
                        }));
                      }}
                    >
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour12 = i % 12 === 0 ? 12 : i % 12;
                        return (
                          <option key={i} value={i}>
                            {hour12} {i >= 12 ? "PM" : "AM"}
                          </option>
                        );
                      })}
                      <option value={24}>12 AM</option>
                    </select>
                    <div className="flex gap-1 w-1/2">
                      {["00", "15", "30", "45"].map((min) => {
                        const minuteValue = Number(min);
                        const is12AM = taskDetails.END_TIME === 24;
                        const isDisabled = is12AM && minuteValue !== 0;
                        const isSelected =
                          Number(taskDetails.endMinute) === minuteValue;

                        return (
                          <button
                            type="button"
                            key={min}
                            className={`px-2 py-1 text-xs rounded border ${
                              isSelected
                                ? "bg-blue-500 text-white border-blue-500"
                                : "bg-white dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 text-gray-700 border-gray-300 hover:bg-gray-50"
                            } ${
                              isDisabled ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={isDisabled}
                            onClick={() => {
                              if (
                                taskDetails.START_TIME ===
                                  taskDetails.END_TIME &&
                                minuteValue < (taskDetails.startMinute ?? 0)
                              ) {
                                alert(
                                  "End Time cannot be earlier than Start Time."
                                );
                                return;
                              }

                              setTaskDetails((prev) => ({
                                ...prev,
                                endMinute: minuteValue,
                                formattedEndTime: `${
                                  prev.END_TIME % 12 === 0
                                    ? 12
                                    : prev.END_TIME % 12
                                }:${min} ${prev.timeSuffixEnd}`,
                              }));
                            }}
                          >
                            {min}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex gap-2 justify-end mt-8">
                <button
                  className="px-3 py-1 border border-gray-300 text-xs rounded hover:bg-gray-100"
                  onClick={() => setShowPopup(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  onClick={handleSave}
                >
                  {taskDetails.id ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </>
  );
}
