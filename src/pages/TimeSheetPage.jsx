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

export default function TimeSheetPage() {
  const [tasks, setTasks] = useState([
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
    {
      TASK_ID: 28,
      TASK_NAME: "Website Redesign",
      dmsNo: "30000028",
      status: "Completed",
      PROJECT_NO: "P1028",
    },
    {
      TASK_ID: 29,
      TASK_NAME: "Database Optimization",
      dmsNo: "30000029",
      status: "In Progress",
      PROJECT_NO: "P1029",
    },
    {
      TASK_ID: 30,
      TASK_NAME: "Mobile App Development",
      dmsNo: "30000030",
      status: "Pending",
      PROJECT_NO: "P1030",
    },
    {
      TASK_ID: 31,
      TASK_NAME: "Cloud Migration",
      dmsNo: "30000031",
      status: "Completed",
      PROJECT_NO: "P1031",
    },
    {
      TASK_ID: 32,
      TASK_NAME: "AI Model Training",
      dmsNo: "30000032",
      status: "In Progress",
      PROJECT_NO: "P1032",
    },
    {
      TASK_ID: 33,
      TASK_NAME: "Data Analysis",
      dmsNo: "30000033",
      status: "Pending",
      PROJECT_NO: "P1033",
    },
    {
      TASK_ID: 34,
      TASK_NAME: "Security Audit",
      dmsNo: "30000034",
      status: "Completed",
      PROJECT_NO: "P1034",
    },
    {
      TASK_ID: 35,
      TASK_NAME: "User Training",
      dmsNo: "30000035",
      status: "In Progress",
      PROJECT_NO: "P1035",
    },
    {
      TASK_ID: 36,
      TASK_NAME: "Performance Optimization",
      dmsNo: "30000036",
      status: "Pending",
      PROJECT_NO: "P1036",
    },
    {
      TASK_ID: 37,
      TASK_NAME: "API Integration",
      dmsNo: "30000037",
      status: "Completed",
      PROJECT_NO: "P1037",
    },
  ]);

  const colorClasses = [
    "bg-blue-200 opacity-70",
    "bg-green-200 opacity-70",
    "bg-yellow-200 opacity-70",
    "bg-red-200 opacity-70",
    "bg-purple-200 opacity-70",
    "bg-pink-200 opacity-70",
    "bg-indigo-200 opacity-70",
    "bg-teal-200 opacity-70",
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
  const [isDraggingEvent, setIsDraggingEvent] = useState(false);
  const [dragPreview, setDragPreview] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const hours = Array.from({ length: 11 }, (_, i) => 8 + i); // 8 AM to 6 PM
  const minutes = ["00", "15", "30", "45"];
  const rowHeight = 64; // pixels per hour row
  const minuteWidth = 90 / 60; // 90px wide for 60 minutes = 1.5px per minute

  // Drag/resize constants
  const STEP = 15; // 15 minutes steps for snapping

  const MIN_DURATION = 15; // Minimum event duration in minutes
  const START_OF_DAY = 8 * 60; // 8 AM
  const END_OF_DAY = 18 * 60; // 6 PM

  useEffect(() => {
    const dateKey = formatDateKey(selectedDate);
    setEvents(timesheetsByDate[dateKey] || []);
  }, [selectedDate, timesheetsByDate]);

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

    if (selectedDateKey !== todayKey) {
      alert("You can only edit events for today's date.");
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

    const taskAlreadyExists = events.some(
      (event) => event.TASK_NAME === taskTitle && event.id !== taskDetails.id
    );
    if (taskAlreadyExists) {
      alert("This task is already scheduled in the calendar.");
      return;
    }

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

    const NO_OF_MINUTES = calculateDuration(
      START_TIME,
      startMinute,
      END_TIME,
      endMinute
    );
    const NO_OF_HOURS = parseFloat((NO_OF_MINUTES / 60).toFixed(2));

    const TRANS_DATE = formatDateKey(selectedDate);

    const updatedEvent = {
      id: taskDetails.id || Date.now(),
      TASK_NAME: taskTitle,
      TASK_ID,
      PROJECT_NO,
      dmsNo,
      START_TIME: parseInt(START_TIME),
      startMinute: parseInt(startMinute),
      END_TIME: parseInt(END_TIME),
      endMinute: parseInt(endMinute),
      color: taskDetails.color || getRandomColor(),
      USER_NAME: userData?.currentUserName || "",
      EMP_NO: userData?.currentUserEmpNo || "",
      NO_OF_HOURS,
      NO_OF_MINUTES,
      TRANS_DATE,
      isCompleted: taskDetails.isCompleted || false,
    };

    const dateKey = formatDateKey(selectedDate);

    setTimesheetsByDate((prev) => {
      const currentDateEvents = prev[dateKey] || [];
      const eventExists = currentDateEvents.some(
        (e) => e.id === updatedEvent.id
      );

      if (eventExists && taskDetails.id) {
        const oldEvent = currentDateEvents.find((e) => e.id === taskDetails.id);
        if (oldEvent && oldEvent.TASK_NAME !== updatedEvent.TASK_NAME) {
          setTasks((prevTasks) => {
            const taskExists = prevTasks.some(
              (t) => t.TASK_NAME === oldEvent.TASK_NAME
            );
            if (!taskExists) {
              return [
                ...prevTasks,
                {
                  TASK_ID: oldEvent.TASK_ID,
                  TASK_NAME: oldEvent.TASK_NAME,
                  dmsNo: oldEvent.dmsNo,
                  status: "Pending",
                  PROJECT_NO: oldEvent.PROJECT_NO,
                },
              ];
            }
            return prevTasks;
          });
        }
      }

      const updatedEvents = eventExists
        ? currentDateEvents.map((e) =>
            e.id === updatedEvent.id ? updatedEvent : e
          )
        : [...currentDateEvents, updatedEvent];

      return {
        ...prev,
        [dateKey]: updatedEvents,
      };
    });

    setEvents((prev) => {
      const eventExists = prev.some((e) => e.id === updatedEvent.id);

      if (eventExists && taskDetails.id) {
        const oldEvent = prev.find((e) => e.id === taskDetails.id);
        if (oldEvent && oldEvent.TASK_NAME !== updatedEvent.TASK_NAME) {
          setTasks((prevTasks) => {
            const taskExists = prevTasks.some(
              (t) => t.TASK_NAME === oldEvent.TASK_NAME
            );
            if (!taskExists) {
              return [
                ...prevTasks,
                {
                  TASK_ID: oldEvent.TASK_ID,
                  TASK_NAME: oldEvent.TASK_NAME,
                  dmsNo: oldEvent.dmsNo,
                  status: "Pending",
                  PROJECT_NO: oldEvent.PROJECT_NO,
                },
              ];
            }
            return prevTasks;
          });
        }
      }

      return eventExists
        ? prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
        : [...prev, updatedEvent];
    });

    if (!taskDetails.id && selectedTask) {
      setTasks((prevTasks) =>
        prevTasks.filter((t) => t.TASK_NAME !== selectedTask.TASK_NAME)
      );
    }

    handleClosePopup();
    setSelectedTask(null);
  };

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

  const handleDrop = (e, hour) => {
    e.preventDefault();
    debugger;

    const todayKey = formatDateKey(new Date());
    const selectedDateKey = formatDateKey(selectedDate);

    if (selectedDateKey !== todayKey) {
      alert("You can only add events for today's date.");
      return;
    }

    const taskData = e.dataTransfer.getData("task");
    if (!taskData) return;

    const task = JSON.parse(taskData);

    const taskAlreadyExists = events.some(
      (event) => event.TASK_NAME === task.TASK_NAME
    );
    if (taskAlreadyExists) {
      alert("This task is already scheduled in the calendar.");
      return;
    }

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

    if (START_TIME < 8 || END_TIME > 18 || (END_TIME === 18 && endMinute > 0)) {
      alert("Tasks can only be scheduled between 8 AM and 6 PM.");
      return;
    }

    const startMinutes = START_TIME * 60 + startMinute;
    const endMinutes = END_TIME * 60 + endMinute;

    const overlappingEvent = events.some((event) => {
      const eventStart = event.START_TIME * 60 + event.startMinute;
      const eventEnd = event.END_TIME * 60 + event.endMinute;
      return startMinutes < eventEnd && endMinutes > eventStart;
    });

    if (overlappingEvent) {
      alert("This time slot overlaps with another event.");
      return;
    }

    const totalMinutes = endMinutes - startMinutes;
    const NO_OF_HOURS = parseFloat((totalMinutes / 60).toFixed(2));
    const NO_OF_MINUTES = totalMinutes;

    const TRANS_DATE = formatDateKey(selectedDate);
    const dateKey = formatDateKey(selectedDate);
    const newEvent = {
      id: Date.now(),
      TASK_ID: task.TASK_ID,
      TASK_NAME: task.TASK_NAME,
      PROJECT_NO: task.PROJECT_NO,
      dmsNo: task.dmsNo,
      START_TIME,
      startMinute,
      END_TIME,
      endMinute,
      color: getRandomColor(),
      USER_NAME: userData?.currentUserName || "",
      EMP_NO: userData?.currentUserEmpNo || "",
      NO_OF_HOURS,
      NO_OF_MINUTES,
      TRANS_DATE,
    };

    setTimesheetsByDate((prev) => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newEvent],
    }));

    setEvents((prev) => [...prev, newEvent]);
    setTasks((prevTasks) =>
      prevTasks.filter((t) => t.TASK_NAME !== task.TASK_NAME)
    );
  };

  const handleDelete = (eventId) => {
    const todayKey = formatDateKey(new Date());
    const selectedDateKey = formatDateKey(selectedDate);

    if (selectedDateKey !== todayKey) {
      alert("You can only delete events for today's date.");
      return;
    }

    const deletedEvent = events.find((event) => event.id === eventId);

    setTimesheetsByDate((prev) => ({
      ...prev,
      [selectedDateKey]: (prev[selectedDateKey] || []).filter(
        (event) => event.id !== eventId
      ),
    }));

    setEvents((prev) => prev.filter((event) => event.id !== eventId));

    if (deletedEvent && !deletedEvent.isCompleted) {
      setTasks((prevTasks) => {
        const taskExists = prevTasks.some(
          (t) => t.TASK_NAME === deletedEvent.TASK_NAME
        );
        if (!taskExists) {
          return [
            ...prevTasks,
            {
              TASK_ID: deletedEvent.TASK_ID,
              TASK_NAME: deletedEvent.TASK_NAME,
              dmsNo: deletedEvent.dmsNo,
              status: "Pending",
              PROJECT_NO: deletedEvent.PROJECT_NO,
            },
          ];
        }
        return prevTasks;
      });
    }

    handleClosePopup();
  };

  const handleClosePopup = () => {
    setShowPopup(false);
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
    debugger;
    const todayKey = formatDateKey(new Date());
    const selectedDateKey = formatDateKey(selectedDate);

    if (selectedDateKey !== todayKey) {
      alert("You can only view events on previous dates.");
      return;
    }

    if (hour >= 18) {
      return;
    }

    setDragging(true);
    setDragStart(hour);
    setDragEnd(hour);
  };

  const handleMouseMove = (e, hour) => {
    if (!dragging) return;

    if (hour >= 18) {
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

    if (start >= 18 || end > 18) {
      alert("Tasks cannot start or end after 6 PM.");
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

  const getPositionBlocks = (event) => {
    const startTotalMinutes =
      (event.START_TIME - 8) * 60 + parseInt(event.startMinute);
    const endTotalMinutes =
      (event.END_TIME - 8) * 60 + parseInt(event.endMinute);

    const blocks = [];
    let currentStartMinutes = startTotalMinutes;

    while (currentStartMinutes < endTotalMinutes) {
      const row = Math.floor(currentStartMinutes / 60);
      const minuteInHour = currentStartMinutes % 60;

      const blockStart = currentStartMinutes;
      const blockEnd = Math.min((row + 1) * 60, endTotalMinutes);

      const durationInThisBlock = blockEnd - blockStart;

      const top = row * rowHeight;
      const left = minuteInHour * minuteWidth;
      const width = durationInThisBlock * minuteWidth;
      const height = rowHeight;

      blocks.push({ top, left, width, height });

      currentStartMinutes = blockEnd;
    }

    return blocks;
  };

  const checkOverlap = (newStartMinutes, newEndMinutes, currentEventId) => {
    return events.some((event) => {
      if (event.id === currentEventId) return false;
      const eventStart = event.START_TIME * 60 + event.startMinute;
      const eventEnd = event.END_TIME * 60 + event.endMinute;
      return newStartMinutes < eventEnd && newEndMinutes > eventStart;
    });
  };

  const handleRightResizeMouseDown = (e, targetEvent) => {
    debugger;
    e.preventDefault();
    e.stopPropagation();

    const todayKey = formatDateKey(new Date());
    const selectedDateKey = formatDateKey(selectedDate);

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
      // Dynamic sensitivity: if moved more than 60px, use 1, else 0.1
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
      // Dynamic sensitivity: if moved more than 60px, use 0.1, else 1 (mirrored logic from right)
      const sensitivity = Math.abs(deltaX) >= 60 ? 0.1 : 1;
      const pixelsPerMinute = 90 / 60;
      const movedMinutes = Math.round((deltaX * sensitivity) / pixelsPerMinute);
      const deltaStepMinutes = Math.round(movedMinutes / STEP) * STEP;

      const startTotalMinutes = initialStartHour * 60 + initialStartMinute;
      const endTotalMinutes = initialEndHour * 60 + initialEndMinute;
      let newStartTotalMinutes = startTotalMinutes + deltaStepMinutes;

      // Enforce minimum duration
      if (newStartTotalMinutes >= endTotalMinutes - MIN_DURATION) {
        newStartTotalMinutes = endTotalMinutes - MIN_DURATION;
      }
      if (newStartTotalMinutes < START_OF_DAY) {
        newStartTotalMinutes = START_OF_DAY;
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

  const handleDragMouseDown = (e, targetEvent) => {
    debugger;
    e.preventDefault();
    e.stopPropagation();

    const todayKey = formatDateKey(new Date());
    const selectedDateKey = formatDateKey(selectedDate);

    if (selectedDateKey !== todayKey) {
      alert("You can only edit events for today's date.");
      return;
    }

    const initialY = e.clientY;
    const initialStartMinutes =
      targetEvent.START_TIME * 60 + targetEvent.startMinute;
    const initialEndMinutes = targetEvent.END_TIME * 60 + targetEvent.endMinute;
    const duration = initialEndMinutes - initialStartMinutes;

    // Calculate offset from top of event
    const eventRect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - eventRect.top;

    setResizingEvent({
      eventId: targetEvent.id,
      direction: "move",
    });
    setIsDraggingEvent(true);
    setDragOffset({ x: 0, y: offsetY });

    // Create a preview element
    setDragPreview({
      ...targetEvent,
      originalId: targetEvent.id,
      id: `preview-${targetEvent.id}`,
      style: {
        position: "absolute",
        top: `${
          eventRect.top -
          e.currentTarget.parentElement.getBoundingClientRect().top
        }px`,
        left: `${
          eventRect.left -
          e.currentTarget.parentElement.getBoundingClientRect().left
        }px`,
        width: `${eventRect.width}px`,
        height: `${eventRect.height}px`,
        opacity: 0.8,
        zIndex: 1000,
        pointerEvents: "none",
      },
    });

    document.body.style.cursor = "grabbing";

    const onMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - initialY; // Adjust for preview offset
      const pixelsPerMinute = rowHeight / 60;
      const movedMinutes = Math.round(deltaY / pixelsPerMinute);

      // Snap to 15-minute intervals
      const deltaStepMinutes = Math.round(movedMinutes / STEP) * STEP;

      let newStartMinutes = initialStartMinutes + deltaStepMinutes;
      let newEndMinutes = newStartMinutes + duration; // Maintain duration

      // Constrain to working hours (8AM-6PM)
      if (newStartMinutes < START_OF_DAY) {
        newStartMinutes = START_OF_DAY;
        newEndMinutes = newStartMinutes + duration;
      }
      if (newEndMinutes > END_OF_DAY) {
        newEndMinutes = END_OF_DAY;
        newStartMinutes = newEndMinutes - duration;
      }

      // Double check start time constraint after end time adjustment
      if (newStartMinutes < START_OF_DAY) {
        newStartMinutes = START_OF_DAY;
        newEndMinutes = newStartMinutes + duration;
      }

      if (checkOverlap(newStartMinutes, newEndMinutes, targetEvent.id)) {
        return;
      }

      // Update preview position
      const newTop = ((newStartMinutes - START_OF_DAY) / 60) * rowHeight;
      setDragPreview((prev) => ({
        ...prev,
        style: {
          ...prev.style,
          top: `${newTop + 5}px`,
        },
      }));

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
        NO_OF_MINUTES: duration, // Keep original duration
        NO_OF_HOURS: parseFloat((duration / 60).toFixed(2)), // Keep original duration in hours
      };

      updateEventInStorage(updatedEvent);
    };

    const onMouseUp = () => {
      setResizingEvent(null);
      setIsDraggingEvent(false);
      setDragPreview(null);
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

  const handleComplete = (taskId, isChecked) => {
    // Find the task in events
    const taskIndex = events.findIndex((e) => e.id === taskId);
    if (taskIndex === -1) return;

    // Create updated task
    const updatedTask = {
      ...events[taskIndex],
      status: isChecked ? "Completed" : "Pending",
    };

    // Update events state
    const updatedEvents = [...events];
    updatedEvents[taskIndex] = updatedTask;
    setEvents(updatedEvents);

    // Update timesheetsByDate
    const dateKey = formatDateKey(selectedDate);
    setTimesheetsByDate((prev) => ({
      ...prev,
      [dateKey]: updatedEvents.filter((e) => e.date === dateKey),
    }));

    // Update tasks state
    setTasks((prevTasks) => {
      const existingTaskIndex = prevTasks.findIndex(
        (t) => t.TASK_ID === updatedTask.TASK_ID
      );

      if (existingTaskIndex >= 0) {
        // Update existing task
        return prevTasks.map((task, index) =>
          index === existingTaskIndex
            ? { ...task, status: updatedTask.status }
            : task
        );
      } else if (isChecked) {
        // Add new completed task
        return [
          ...prevTasks,
          {
            TASK_ID: updatedTask.TASK_ID,
            TASK_NAME: updatedTask.TASK_NAME,
            dmsNo: updatedTask.dmsNo,
            status: "Completed",
            PROJECT_NO: updatedTask.PROJECT_NO,
          },
        ];
      }
      return prevTasks;
    });

    // Update taskDetails if it's the current task
    if (taskDetails.id === taskId) {
      setTaskDetails((prev) => ({
        ...prev,
        status: updatedTask.status,
      }));
    }

    alert(`Task "${updatedTask.TASK_NAME}" marked as ${updatedTask.status}`);
  };

  return (
    <>
      <style jsx>{`
        @keyframes glowResize {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
          }
          50% {
            box-shadow: 0 0 15px 5px rgba(255, 255, 255, 0.6);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
          }
        }

        @keyframes borderPulse {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 0.3;
          }
        }

        .animate-glow-resize {
          animation: glowResize 2s ease-in-out infinite;
          transition: all 500ms cubic-bezier(0.18, 0.89, 0.32, 1.28);
        }

        .animate-border-pulse {
          animation: borderPulse 2.5s ease-in-out infinite;
        }
      `}</style>

      <form>
        <div className="flex flex-col md:flex-row w-full h-[80vh]">
          {/* Sidebar: Pending & Completed Tasks */}
          <div className="w-full md:w-[20%] h-full overflow-y-auto">
            <div className="mt-4 mb-2 w-full sticky top-0 z-10">
              <h3 className="text-sm rounded font-bold bg-orange-100 text-center border text-black border-gray-300 p-2">
                Pending Task
              </h3>
            </div>
            {tasks.filter((task) => task.status !== "Completed").length ===
            0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No pending tasks
              </div>
            ) : (
              tasks
                .filter((task) => task.status !== "Completed")
                .map((task) => (
                  <div
                    key={task.TASK_ID}
                    className="flex items-center mb-1 justify-between p-3 border border-gray-400 hover:bg-blue-100 transition-all duration-300 rounded-md shadow-sm hover:shadow-md cursor-pointer"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                      <p className="font-medium text-sm">{task.TASK_NAME}</p>
                    </div>
                  </div>
                ))
            )}

            <div className="mt-4 mb-2 w-full sticky top-0 z-10">
              <h3 className="text-sm rounded font-bold bg-green-100 text-center border text-black border-gray-300 p-2">
                Completed Task
              </h3>
            </div>
            {tasks.filter((task) => task.status === "Completed").length ===
            0 ? (
              <div className="p-4 text-center text-gray-500">
                No completed tasks
              </div>
            ) : (
              tasks
                .filter((task) => task.status === "Completed")
                .map((task) => (
                  <div
                    key={task.TASK_ID}
                    className="flex items-center mb-1 justify-between p-3 border border-gray-400 hover:bg-green-50 transition-all duration-300 rounded-md shadow-sm hover:shadow-md cursor-pointer "
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                      <p className="font-medium text-sm">{task.TASK_NAME}</p>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Main Content */}
          <div className="w-full bg-transparent h-full">
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
              <div className="flex w-full h-full">
                <div className="w-full h-full overflow-auto">
                  <div className="rounded-xl w-full p-2 relative h-full">
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
                        className="mt-1 text-xs shadow-lg border border-gray-300 rounded px-3 py-1 hover:bg-gray-100"
                        onClick={openDatePicker}
                      >
                        Change Date{" "}
                        <Rotate3DIcon className="w-3 h-3 inline ml-1" />
                      </button>

                      <dialog
                        ref={datePickerRef}
                        className="fixed z-10 inset-0 overflow-y-auto"
                      >
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
                          <div
                            className="fixed inset-0 transition-opacity"
                            onClick={() => datePickerRef.current.close()}
                          >
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                          </div>
                          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                              <div className="sm:flex sm:items-start">
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
                                      selected:
                                        "bg-blue-500 text-white rounded",
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </dialog>
                    </div>

                    <div className="flex mb-2">
                      <p className="w-[10%]  absolute text-center left-1 bg-gradient-to-r from-cyan-400 to-blue-600 text-white border border-blue-300 font-semibold text-xs p-1 rounded">
                        Time
                      </p>
                      <div className="w-[100%] flex flex-row  gap-1 ml-[10%]">
                        {minutes.map((min, index) => {
                          const nextMin = minutes[index + 1] || "60";
                          return (
                            <div
                              key={min}
                              className="text-center w-[100%] border border-gray-400 font-semibold text-xs p-1 rounded"
                            >
                              {min}m - {nextMin}m
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="relative rounded-xl p-1 h-[calc(100%-50px)]">
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
                          <div className="w-[10%] flex items-center justify-center text-sm font-semibold text-gray-600">
                            {formatTime(hour, "00")}
                          </div>

                          <div className="w-[100%] grid grid-cols-4 gap-1 ">
                            {minutes.map((_, i) => (
                              <div
                                key={i}
                                className="h-full transition hover:bg-blue-100 dark:hover:bg-blue-800/20 rounded cursor-pointer"
                              />
                            ))}
                          </div>
                        </div>
                      ))}

                      {events.map((event, index) => {
                        const blocks = getPositionBlocks(event);
                        const isShortEvent =
                          calculateDuration(
                            event.START_TIME,
                            event.startMinute,
                            event.END_TIME,
                            event.endMinute
                          ) <= 15;

                        return blocks.map((block, blockIndex) => {
                          const isResizing =
                            resizingEvent?.eventId === event.id;
                          const isCompleted = event.isCompleted;

                          return (
                            <div
                              key={`${event.id}-${index}-${blockIndex}`}
                              className={`
                              absolute p-2 rounded-lg shadow-sm flex justify-between items-start text-sm overflow-hidden
                              border border-transparent
                              ${
                                isResizing
                                  ? "animate-glow-resize border-white/30 shadow-lg cursor-grabbing"
                                  : "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-move hover:shadow-md"
                              }
                              ${isCompleted ? "opacity-80 saturate-70" : ""}
                              ${event.color}
                              group
                              will-change-transform
                            `}
                              style={{
                                top: `${block.top + 8}px`,
                                left: `calc(10% + ${block.left}%)`,
                                width: `${block.width - 0.4}%`,
                                height: `${block.height - 8}px`,
                                transform: isResizing
                                  ? "scale(0.99) rotate(0.8deg) translateY(-1px)"
                                  : "scale(1) rotate(0deg) translateY(0)",
                                opacity: isResizing ? 1 : 1,
                                backgroundImage: isResizing
                                  ? `linear-gradient(135deg, rgba(255,255,255,0.3) 0%, ${event.color
                                      .replace("bg-", "rgba(")
                                      .replace("-", ",0.1)")} 100%)`
                                  : "",
                              }}
                              onMouseDown={(e) => {
                                if (!resizingEvent) {
                                  handleDragMouseDown(e, event);
                                }
                              }}
                              onDoubleClick={(e) => handleEdit(e, event)}
                              title="Double click to edit"
                            >
                              {/* Glow overlay effect */}
                              {isResizing && (
                                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/20 rounded-lg pointer-events-none" />
                              )}

                              {/* Animated border effect */}
                              {isResizing && (
                                <div className="absolute inset-0 border-2 border-white/30 rounded-lg pointer-events-none animate-border-pulse" />
                              )}

                              {/* Time indicator during resize */}
                              {isResizing && (
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white text-xs font-medium text-gray-700 px-2 py-1 rounded-full shadow-sm whitespace-nowrap">
                                  {formatDuration(
                                    calculateDuration(
                                      event.START_TIME,
                                      event.startMinute,
                                      event.END_TIME,
                                      event.endMinute
                                    )
                                  )}
                                </div>
                              )}

                              <div
                                className="flex-1 pr-2 cursor-pointer relative z-10"
                                onClick={(e) => {
                                  if (e.detail > 1) return;
                                }}
                              >
                                <div className="flex items-center whitespace-wrap gap-1">
                                  <span className="text-xs font-semibold  text-gray-900 truncate">
                                    {event.TASK_NAME}
                                  </span>
                                  {!isShortEvent && (
                                    <span className="text-xs text-gray-700 whitespace-nowrap">
                                      (
                                      {formatTime(
                                        event.START_TIME,
                                        event.startMinute
                                      )}{" "}
                                      -{" "}
                                      {formatTime(
                                        event.END_TIME,
                                        event.endMinute
                                      )}
                                      )
                                    </span>
                                  )}
                                </div>
                                {!isResizing && (
                                  <div className="text-xs text-gray-600 mt-0.5">
                                    Duration:{" "}
                                    {formatDuration(
                                      calculateDuration(
                                        event.START_TIME,
                                        event.startMinute,
                                        event.END_TIME,
                                        event.endMinute
                                      )
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col gap-1 relative z-10">
                                <button
                                  className="text-gray-700 hover:text-red-600 transition-colors duration-150 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(event.id, event);
                                  }}
                                >
                                  <XIcon
                                    size={18}
                                    className="hover:bg-red-100 rounded-full p-0.5 transition-all"
                                  />
                                </button>
                              </div>

                              {/* Resize handles with improved visual feedback */}
                              {!resizingEvent && (
                                <div
                                  className="absolute top-0 bottom-0 left-0 w-2 bg-transparent hover:bg-white/30 cursor-w-resize transition-all duration-200 z-20 group-hover:opacity-100"
                                  onMouseDown={(e) =>
                                    handleLeftResizeMouseDown(e, event)
                                  }
                                >
                                  <div className="absolute top-1/2 left-0.5 w-1 h-6 bg-gray-400 rounded-full transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              )}

                              {!resizingEvent && (
                                <div
                                  className="absolute top-0 bottom-0 right-0 w-2 bg-transparent hover:bg-white/30 cursor-e-resize transition-all duration-200 z-20 group-hover:opacity-100"
                                  onMouseDown={(e) =>
                                    handleRightResizeMouseDown(e, event)
                                  }
                                >
                                  <div className="absolute top-1/2 right-0.5 w-1 h-6 bg-gray-400 rounded-full transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              )}

                              {/* Floating tooltip */}
                              <div className="absolute -top-8 left-0 text-gray-800 text-xs px-2 py-1 rounded-md pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white shadow-md border border-gray-200 whitespace-nowrap">
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
                    {Object.keys(timesheetsByDate).length === 0 ? (
                      <tr>
                        <td
                          colSpan="10"
                          className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500"
                        >
                          No tasks added yet. Start by adding your first task!
                        </td>
                      </tr>
                    ) : (
                      Object.entries(timesheetsByDate).map(
                        ([date, dateEvents]) =>
                          dateEvents.map((event, index) => {
                            const duration = calculateDuration(
                              event.START_TIME,
                              event.startMinute,
                              event.END_TIME,
                              event.endMinute
                            );

                            return (
                              <tr
                                key={`${date}-${index}`}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {date}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {event.TASK_ID}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {event.TASK_NAME}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {event.PROJECT_NO}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatTime(
                                    event.START_TIME,
                                    event.startMinute
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatTime(event.END_TIME, event.endMinute)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDuration(duration)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {event.NO_OF_HOURS.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    {event.isCompleted
                                      ? "Completed"
                                      : "Pending"}
                                    {event.isCompleted ? (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 text-green-500"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
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
                                    onClick={(e) => handleDelete(event.id)}
                                  >
                                    <Trash2Icon className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
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
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 w-full max-w-sm h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm">
                  {taskDetails.id ? "Update Task" : "Add Task"}
                </h3>
              </div>
              <div className="mb-4">
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
              </div>
              {filteredTasks.filter(
                (task) =>
                  task.status !== "Completed" &&
                  !events.some((event) => event.TASK_NAME === task.TASK_NAME)
              ).length > 0 ? (
                <ul className="bg-gray-100 dark:bg-gray-800 text-xs rounded-lg p-1 mb-4 h-36 overflow-y-scroll space-y-2">
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
                          className={`flex justify-between text-xs items-center w-full p-2 rounded-lg hover:bg-blue-50 ${
                            selectedTask?.TASK_ID === task.TASK_ID
                              ? "bg-blue-100"
                              : "bg-transparent"
                          }`}
                          onClick={(e) => handleSelectTask(e, task)}
                        >
                          <div className="flex flex-col text-left text-xs">
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
                            <span className="text-xs">{task.status}</span>
                            <AlertTriangleIcon className="w-3 h-3" />
                          </div>
                        </button>
                      </li>
                    ))}
                </ul>
              ) : (
                <div className="bg-gray-100 rounded-lg p-4 mb-4 h-48 flex items-center justify-center text-gray-500">
                  No pending tasks available
                </div>
              )}

              <div className="flex justify-between  flex-col gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Time
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col w-1/2">
                      <select
                        className="block w-full rounded-md border-gray-300 bg-white dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5"
                        value={taskDetails.START_TIME || "00"}
                        onChange={(e) => {
                          const hour24 = Number(e.target.value);
                          const suffix = hour24 >= 12 ? "PM" : "AM";
                          const hour12 =
                            hour24 > 12
                              ? hour24 - 12
                              : hour24 === 0
                              ? 12
                              : hour24;
                          setTaskDetails((prev) => ({
                            ...prev,
                            START_TIME: hour24,
                            timeSuffixStart: suffix,
                            formattedStartTime: `${hour12}:${
                              prev.startMinute
                                ? prev.startMinute.toString().padStart(2, "0")
                                : "00"
                            } ${suffix}`,
                          }));
                        }}
                      >
                        {Array.from({ length: 11 }, (_, i) => {
                          const hour24 = 8 + i;
                          return (
                            <option key={hour24} value={hour24}>
                              {hour24 > 12
                                ? hour24 - 12
                                : hour24 === 0
                                ? 12
                                : hour24}{" "}
                              {hour24 >= 12 ? "PM" : "AM"}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="flex flex-col w-1/2">
                      <div className="flex gap-1 ">
                        {["00", "15", "30", "45"].map((min) => (
                          <button
                            type="button"
                            key={min}
                            className={`px-2 py-1 text-xs rounded border ${
                              Number(taskDetails.startMinute) === Number(min)
                                ? "bg-blue-500  text-white border-blue-500"
                                : "bg-white dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600  text-gray-700 border-gray-300 hover:bg-gray-50"
                            }`}
                            onClick={() => {
                              setTaskDetails((prev) => ({
                                ...prev,
                                startMinute: Number(min),
                                formattedStartTime: `${
                                  prev.START_TIME > 12
                                    ? prev.START_TIME - 12
                                    : prev.START_TIME === 0
                                    ? 12
                                    : prev.START_TIME
                                }:${min} ${prev.timeSuffixStart}`,
                              }));
                            }}
                          >
                            {min}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium  text-gray-700 dark:text-gray-300 mb-1">
                    End Time
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col w-1/2">
                      <select
                        className="block w-full rounded-md border-gray-300 bg-white dark:bg-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-1.5"
                        value={taskDetails.END_TIME || "00"}
                        onChange={(e) => {
                          const hour24 = Number(e.target.value);
                          const suffix = hour24 >= 12 ? "PM" : "AM";
                          const hour12 =
                            hour24 > 12
                              ? hour24 - 12
                              : hour24 === 0
                              ? 12
                              : hour24;

                          if (hour24 < taskDetails.START_TIME) {
                            alert(
                              "End Time cannot be earlier than Start Time."
                            );
                            return;
                          }

                          if (hour24 === 18) {
                            setTaskDetails((prev) => ({
                              ...prev,
                              END_TIME: hour24,
                              timeSuffixEnd: suffix,
                              endMinute: 0,
                              formattedEndTime: `${hour12}:00 ${suffix}`,
                            }));
                          } else {
                            setTaskDetails((prev) => ({
                              ...prev,
                              END_TIME: hour24,
                              timeSuffixEnd: suffix,
                              formattedEndTime: `${hour12}:${
                                prev.endMinute
                                  ? prev.endMinute.toString().padStart(2, "0")
                                  : "00"
                              } ${suffix}`,
                            }));
                          }
                        }}
                      >
                        {Array.from({ length: 11 }, (_, i) => {
                          const hour24 = 8 + i;
                          return (
                            <option key={hour24} value={hour24}>
                              {hour24 > 12
                                ? hour24 - 12
                                : hour24 === 0
                                ? 12
                                : hour24}{" "}
                              {hour24 >= 12 ? "PM" : "AM"}
                            </option>
                          );
                        })}
                        <option value={18}>6 PM</option>
                      </select>
                    </div>

                    <div className="flex flex-col w-1/2">
                      <div className="flex gap-1">
                        {["00", "15", "30", "45"].map((min) => {
                          const minuteValue = Number(min);
                          const is6PM = taskDetails.END_TIME === 18;
                          const isDisabled = is6PM && minuteValue !== 0;

                          return (
                            <button
                              type="button"
                              key={min}
                              className={`px-2 py-1 text-xs rounded border ${
                                Number(taskDetails.endMinute) === minuteValue
                                  ? "bg-blue-500 text-white border-blue-500"
                                  : "bg-white dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600  text-gray-700 border-gray-300 hover:bg-gray-50"
                              } ${
                                isDisabled
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              disabled={isDisabled}
                              onClick={() => {
                                if (is6PM && minuteValue !== 0) return;

                                if (
                                  taskDetails.END_TIME ===
                                    taskDetails.START_TIME &&
                                  minuteValue < taskDetails.startMinute
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
                                    prev.END_TIME > 12
                                      ? prev.END_TIME - 12
                                      : prev.END_TIME === 0
                                      ? 12
                                      : prev.END_TIME
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
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 justify-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500 h-3 w-3"
                    checked={taskDetails.status === "Completed"}
                    onChange={(e) =>
                      handleComplete(taskDetails.id, e.target.checked)
                    }
                  />
                  <span className="text-sm">Click To Complete Task</span>
                </div>
                <div className="flex gap-2 mt-8 justify-end">
                  {taskDetails.id && (
                    <button
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                      onClick={() => handleDelete(taskDetails.id)}
                    >
                      Delete
                    </button>
                  )}
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
          </div>
        )}
      </form>
    </>
  );
}
