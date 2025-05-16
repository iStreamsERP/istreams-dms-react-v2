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
    }
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
  const [showPopup, setShowPopup] = useState(false);
  const [taskDetails, setTaskDetails] = useState({
    TASK_ID: "",
    TASK_NAME: "",
    START_TIME: 8, // Changed from 7 to 8
    startMinute: "00",
    END_TIME: 9, // Changed from 8 to 9
    endMinute: "00",
    NO_OF_HOURS: "",
    NO_OF_MINUTES: "",
    PROJECT_NO: "",
    color: getRandomColor(),
  });

  // Set selectedDate to today and disable future dates
  const [selectedDate, setSelectedDate] = useState(new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const datePickerRef = useRef(null);
  const [resizingEvent, setResizingEvent] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);

  // Changed hours from 7 AM to 6 PM to 8 AM to 6 PM
  const hours = Array.from({ length: 11 }, (_, i) => 8 + i); // 8 AM to 6 PM
  const minutes = ["00", "15", "30", "45"];
  const rowHeight = 64; // 1 hour = 64px
  const minuteWidth = 100 / 67.0; // Each minute = 1.6667% of width inside 1 hour block

  useEffect(() => {
    const dateKey = formatDateKey(selectedDate);
    // Reset events for the new date
    setEvents(timesheetsByDate[dateKey] || []);
  }, [selectedDate, timesheetsByDate]);

  // Helper function to format date as YYYY-MM-DD
  const formatDateKey = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const updateEventInStorage = (updatedEvent) => {
    const dateKey = formatDateKey(selectedDate);

    // Update timesheetsByDate
    setTimesheetsByDate((prev) => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      ),
    }));

    // Update events state
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

    // Check if selected date is today
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

    // Check if selected date is today
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

    // Check if task already exists (excluding current event if editing)
    const taskAlreadyExists = events.some(
      (event) => event.TASK_NAME === taskTitle && event.id !== taskDetails.id
    );
    if (taskAlreadyExists) {
      alert("This task is already scheduled in the calendar.");
      return;
    }

    // Check for overlapping events
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

    // Calculate duration
    const NO_OF_MINUTES = calculateDuration(
      START_TIME,
      startMinute,
      END_TIME,
      endMinute
    );
    const NO_OF_HOURS = parseFloat((NO_OF_MINUTES / 60).toFixed(2));

    // Use the selected date directly
    const TRANS_DATE = formatDateKey(selectedDate);

    // Create the updated event object
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

      // If editing an existing event, return the original task to pending list if task name changed
      if (eventExists && taskDetails.id) {
        const oldEvent = currentDateEvents.find((e) => e.id === taskDetails.id);
        if (oldEvent && oldEvent.TASK_NAME !== updatedEvent.TASK_NAME) {
          // Return the old task to pending list
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

    setEvents((prevEvents) => {
      const eventExists = prevEvents.some((e) => e.id === updatedEvent.id);

      // Similar logic as above for the events state
      if (eventExists && taskDetails.id) {
        const oldEvent = prevEvents.find((e) => e.id === taskDetails.id);
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
        ? prevEvents.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
        : [...prevEvents, updatedEvent];
    });

    // If this is a new event, remove the task from pending list
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

    // Check if selected date is today
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

    // Changed validation from 7 AM to 6 PM to 8 AM to 6 PM
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
    // Check if selected date is today
    const todayKey = formatDateKey(new Date());
    const selectedDateKey = formatDateKey(selectedDate);

    if (selectedDateKey !== todayKey) {
      alert("You can only delete events for today's date.");
      return;
    }

    // Find the event being deleted
    const deletedEvent = events.find((event) => event.id === eventId);

    // Update timesheetsByDate
    setTimesheetsByDate((prev) => ({
      ...prev,
      [selectedDateKey]: (prev[selectedDateKey] || []).filter(
        (event) => event.id !== eventId
      ),
    }));

    // Update events state
    setEvents((prev) => prev.filter((event) => event.id !== eventId));

    // Return the task to pending list if it wasn't completed
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
      START_TIME: 8, // Changed from 7 to 8
      startMinute: "00",
      END_TIME: 9, // Changed from 8 to 9
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
      // after 6 PM

      return;
    }

    setDragging(true);
    setDragStart(hour);
    setDragEnd(hour);
  };

  const handleMouseMove = (_, hour) => {
    if (!dragging) return;

    if (hour >= 18) {
      // Stop dragging if user moves into invalid time

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

    // Check again: Prevent creating tasks beyond 6 PM
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
  };

  const getPositionBlocks = (event) => {
    const startTotalMinutes =
      (event.START_TIME - 8) * 60 + parseInt(event.startMinute); // Changed from 7 to 8
    const endTotalMinutes =
      (event.END_TIME - 8) * 60 + parseInt(event.endMinute); // Changed from 7 to 8

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

  const STEP = 15; // minutes snap step
  const START_OF_DAY = 8 * 60; // Changed from 7 to 8 (8 AM in minutes)
  const END_OF_DAY = 18 * 60; // 6 PM in minutes

  const checkOverlap = (newStartMinutes, newEndMinutes, currentEventId) => {
    return events.some((event) => {
      if (event.id === currentEventId) return false;
      const eventStart = event.START_TIME * 60 + event.startMinute;
      const eventEnd = event.END_TIME * 60 + event.endMinute;
      return newStartMinutes < eventEnd && newEndMinutes > eventStart;
    });
  };

  const handleRightResizeMouseDown = (e, targetEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if selected date is today
    const todayKey = formatDateKey(new Date());
    const selectedDateKey = formatDateKey(selectedDate);

    if (selectedDateKey !== todayKey) {
      alert("You can only edit events for today's date.");
      return;
    }

    const initialY = e.clientY;
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
      const deltaY = moveEvent.clientY - initialY;
      const pixelsPerMinute = rowHeight / 60;
      const movedMinutes = Math.round(deltaY / pixelsPerMinute);
      const deltaStepMinutes = Math.round(movedMinutes / STEP) * STEP;

      const startTotalMinutes = initialStartHour * 60 + initialStartMinute;
      let newEndTotalMinutes =
        initialEndHour * 60 + initialEndMinute + deltaStepMinutes;

      if (newEndTotalMinutes <= startTotalMinutes + STEP) {
        newEndTotalMinutes = startTotalMinutes + STEP;
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

    // Check if selected date is today
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
      const pixelsPerMinute = rowHeight / 60;
      const movedMinutes = Math.round(deltaX / pixelsPerMinute);
      const deltaStepMinutes = Math.round(movedMinutes / STEP) * STEP;

      const startTotalMinutes = initialStartHour * 60 + initialStartMinute;
      const endTotalMinutes = initialEndHour * 60 + initialEndMinute;
      let newStartTotalMinutes = startTotalMinutes + deltaStepMinutes;

      if (newStartTotalMinutes >= endTotalMinutes - STEP) {
        newStartTotalMinutes = endTotalMinutes - STEP;
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
    e.preventDefault();
    e.stopPropagation();

    // Check if selected date is today
    const todayKey = formatDateKey(new Date());
    const selectedDateKey = formatDateKey(selectedDate);

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

  // Function to check if a date is in the future
  const isFutureDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const handleComplete = (eventId, isChecked) => {
    // Find the event being completed
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    // Show an alert message
    alert(
      isChecked
        ? `Task "${event.TASK_NAME}" marked as Completed!`
        : `Task "${event.TASK_NAME}" marked as Pending.`
    );

    // Update the event in both events state and timesheetsByDate
    const updatedEvent = { ...event, isCompleted: isChecked };

    // Update events state
    setEvents((prev) => prev.map((e) => (e.id === eventId ? updatedEvent : e)));

    // Update timesheetsByDate
    const dateKey = formatDateKey(selectedDate);
    setTimesheetsByDate((prev) => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).map((e) =>
        e.id === eventId ? updatedEvent : e
      ),
    }));

    // Update the task in tasks array
    setTasks((prevTasks) => {
      const taskExists = prevTasks.some((t) => t.TASK_NAME === event.TASK_NAME);

      if (isChecked) {
        // If completing, update status or add if not exists
        return taskExists
          ? prevTasks.map((task) =>
              task.TASK_NAME === event.TASK_NAME
                ? { ...task, status: "Completed" }
                : task
            )
          : [
              ...prevTasks,
              {
                TASK_ID: event.TASK_ID,
                TASK_NAME: event.TASK_NAME,
                dmsNo: event.dmsNo,
                status: "Completed",
                PROJECT_NO: event.PROJECT_NO,
              },
            ];
      } else {
        // If unchecking, only update if task exists
        return taskExists
          ? prevTasks.map((task) =>
              task.TASK_NAME === event.TASK_NAME
                ? { ...task, status: "Pending" }
                : task
            )
          : prevTasks;
      }
    });
  };

  return (
    <>
      <form>
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-[20%]  h-[70vh]  text-xs overflow-y-scroll ">
            {/* Pending Tasks Section */}
            <div className="mt-4 mb-2 w-full sticky top-0 z-10 md:w-[100%]">
              <h3 className="text-sm rounded font-bold bg-orange-100 text-center border text-black border-gray-300 p-2">
                Pending Task
              </h3>
            </div>
            {tasks.filter((task) => task.status !== "Completed").length ===
            0 ? (
              <div className="p-4 text-center text-gray-500">
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
                      <p className="font-medium">{task.TASK_NAME}</p>
                    </div>
                    {/* <div className="flex items-center space-x-1 text-xs whitespace-nowrap font-semibold py-1 px-2 rounded-full bg-yellow-100 text-yellow-700">
                      <span>{task.status}</span>
                      <AlertTriangleIcon className="w-3 h-3" />
                    </div> */}
                  </div>
                ))
            )}

            {/* Completed Tasks Section */}
            <div className="mt-4 mb-2 w-full sticky top-0 z-10 md:w-[100%]">
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
                    className="flex items-center mb-1 justify-between p-3 border border-gray-400 hover:bg-green-50 transition-all duration-300 rounded-md shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3  rounded-full bg-green-500 animate-pulse" />
                      <p className="font-medium ">{task.TASK_NAME}</p>
                    </div>
                    {/* <div className="flex items-center space-x-1 text-xs font-semibold py-1 px-2 rounded-full bg-green-100 text-green-700">
                      <span>{task.status}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div> */}
                  </div>
                ))
            )}
          </div>
          {/* name of each tab group should be unique */}
          <div className="tabs tabs-border  tabs-bordered tabs-box  bg-transparent w-full md:w-[80%]  ">
            <input
              type="radio"
              name="my_tabs_3"
              className="tab  font-bold  border-2 border-gray-300 text-xs   border-box  w-full md:w-[20%] "
              aria-label="TimeSheet "
              defaultChecked
            />
            <div className="tab-content ">
              <div className="flex w-full flex-col md:flex-row">
                {/* Sidebar */}

                {/* Main Area */}
                <div className="flex-1 h-[70vh]  overflow-y-scroll">
                  <div className="rounded-xl w-[960px]  overflow-x-scroll  p-2  relative">
                    {/* Header */}
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
                        className="btn btn-xs mt-1 text-xs shadow-lg btn-outline"
                        onClick={openDatePicker}
                      >
                        Change Date <Rotate3DIcon className="w-3 h-3 " />
                      </button>

                      {/* Date Picker Modal */}
                      <dialog ref={datePickerRef} className="modal">
                        <div className="modal-box w-[350px]">
                          <div method="dialog">
                            <button
                              type="button"
                              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                              onClick={() => datePickerRef.current.close()}
                            >
                              ✕
                            </button>
                          </div>
                          <DayPicker
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                              if (isFutureDate(date)) {
                                alert("You can only select today's date.");
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
                      </dialog>
                    </div>

                    {/* Minutes as Top Labels */}
                    <div className="flex mb-2">
                      <div className="w-[100px] " />
                      <p className="w-[100px] absolute text-center left-1 bg-gradient-to-r from-cyan-400 to-blue-600 text-white border border-blue-300 font-semibold text-xs p-1 rounded">
                        Time
                      </p>
                      <div className="flex-1 grid grid-cols-4 gap-1">
                        {minutes.map((min, index) => {
                          const nextMin = minutes[index + 1] || "60";
                          return (
                            <div
                              key={min}
                              className="text-center border border-gray-400  font-semibold text-xs p-1 rounded"
                            >
                              {min}m - {nextMin}m
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Hours and Minute Blocks */}
                    <div className="relative">
                      {hours.map((hour) => (
                        <div
                          key={hour}
                          className="flex border-t  border-gray-400 relative"
                          style={{ height: `${rowHeight}px` }}
                          onMouseDown={() => handleMouseDown(hour)}
                          onMouseMove={(e) => handleMouseMove(e, hour)}
                          onMouseUp={handleMouseUp}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleDrop(e, hour)}
                        >
                          {/* Hour Label */}
                          <div className="w-[100px] flex items-center justify-center  text-sm font-semibold text-gray-700">
                            {formatTime(hour, "00")}
                          </div>

                          {/* Minute Blocks */}
                          <div className="flex-1 grid grid-cols-4 gap-1">
                            {minutes.map((_, i) => (
                              <div key={i} className="h-full transition" />
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Render Events */}
                      {events.map((event, index) => {
                        const blocks = getPositionBlocks(event);

                        return blocks.map((block, blockIndex) => (
                          <div
                            key={`${event.id}-${index}-${blockIndex}`}
                            className={`absolute p-2 rounded-md shadow-md  flex justify-between items-start text-sm overflow-hidden transition-all duration-200 ease-in-out group ${
                              event.color
                            } ${
                              resizingEvent?.eventId === event.id
                                ? "cursor-grabbing"
                                : "cursor-pointer"
                            }`}
                            style={{
                              top: `${block.top + 5}px`,
                              left: `calc(100px + ${block.left}%)`,
                              width: `${block.width - 0.4}%`,
                              height: `${block.height - 10}px`,
                            }}
                            onMouseDown={(e) => handleDragMouseDown(e, event)}
                            onDoubleClick={(e) => handleEdit(e, event)}
                            title="Double click to edit"
                          >
                            {/* Event Info */}
                            <div
                              className="flex-1 pr-2 cursor-pointer"
                              onClick={(e) => {
                                if (e.detail > 1) return;
                              }}
                            >
                              <div>
                                <span className="text-xs font-semibold text-black">
                                  {event.TASK_NAME}{" "}
                                </span>
                                <span className="text-xs text-black">
                                  (
                                  {formatTime(
                                    event.START_TIME,
                                    event.startMinute
                                  )}{" "}
                                  -{" "}
                                  {formatTime(event.END_TIME, event.endMinute)})
                                </span>{" "}
                                -{" "}
                                <span className="text-xs text-black">
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
                            </div>

                            {/* Delete Button */}
                            <div className="flex flex-col gap-1">
                              <button
                                className="text-black hover:text-red-600 transition-colors text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(event.id, event);
                                }}
                              >
                                <XIcon
                                  size={18}
                                  className="hover:bg-red-400 rounded-full p-1"
                                />
                              </button>
                              <div>
                                <input
                                  type="checkbox"
                                  className="checkbox border-1  border-gray-400 checkbox-xs"
                                  checked={event.isCompleted}
                                  onChange={(e) =>
                                    handleComplete(event.id, e.target.checked)
                                  }
                                />
                              </div>
                            </div>

                            {/* Left Resize Handle */}
                            <div
                              className="absolute top-0 bottom-0 left-0 w-2 bg-transparent hover:bg-gray-400 cursor-ew-resize"
                              onMouseDown={(e) =>
                                handleLeftResizeMouseDown(e, event)
                              }
                            />

                            {/* Right Resize Handle */}
                            <div
                              className="absolute top-0 bottom-0 right-0 w-2 bg-transparent hover:bg-gray-400 cursor-ew-resize"
                              onMouseDown={(e) =>
                                handleRightResizeMouseDown(e, event)
                              }
                            />

                            {/* Tooltip (shown on hover) */}
                            <div className="absolute -top-8 left-0  text-black text-xs px-2 py-1 rounded-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity rounded-md ">
                              Double click to edit event
                            </div>
                          </div>
                        ));
                      })}
                    </div>
                  </div>
                </div>

                {/* Popup Modal */}
                {showPopup && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-base-100 rounded-lg shadow-lg p-4 w-full max-w-sm h-[480px] overflow-y-scroll">
                      {" "}
                      {/* Smaller centered popup */}
                      <div className="flex justify-between  bg-base-100  items-center mb-4">
                        <h3 className="font-bold text-sm">
                          {taskDetails.id ? "Update Task" : "Add Task"}
                        </h3>
                      </div>
                      {/* Search Task Input */}
                      <div className="form-control mb-4">
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
                          className="input input-bordered input-md w-full text-sm input-sm"
                        />
                      </div>
                      {/* Task Selection */}
                      {/* Task Selection - Only show pending tasks not in calendar */}
                      {filteredTasks.filter(
                        (task) =>
                          task.status !== "Completed" &&
                          !events.some(
                            (event) => event.TASK_NAME === task.TASK_NAME
                          )
                      ).length > 0 ? (
                        <ul className="bg-base-200 text-xs rounded-lg p-1 mb-4 h-36 overflow-y-scroll space-y-2">
                          {filteredTasks
                            .filter(
                              (task) =>
                                task.status !== "Completed" &&
                                !events.some(
                                  (event) => event.TASK_NAME === task.TASK_NAME
                                )
                            )
                            .map((task) => (
                              <li key={task.id}>
                                <button
                                  className={`flex justify-between text-xs items-center w-full p-2 rounded-lg hover:bg-blue-50 ${
                                    selectedTask?.id === task.id
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
                                    <span className="text-xs">
                                      {task.status}
                                    </span>
                                    <AlertTriangleIcon className="w-3 h-3" />
                                  </div>
                                </button>
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <div className="bg-base-200 rounded-lg p-4 mb-4 h-48 flex items-center justify-center text-gray-500">
                          No pending tasks available
                        </div>
                      )}
                      {/* Time Inputs */}
                      <div className="flex justify-between flex-col gap-2">
                        {/* Start Time */}
                        <div className="flex-1">
                          <label className="label text-sm">
                            <span className="label-text">Start Time</span>
                          </label>
                          <div className="flex items-center gap-2">
                            {/* Hour Input */}
                            <div className="flex flex-col w-1/2">
                              <select
                                className="select select-bordered select-sm w-full text-sm"
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
                                        ? prev.startMinute
                                            .toString()
                                            .padStart(2, "0")
                                        : "00"
                                    } ${suffix}`,
                                  }));
                                }}
                              >
                                {Array.from({ length: 12 }, (_, i) => {
                                  const hour24 = 7 + i;
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

                            {/* Minute Input */}
                            <div className="flex flex-col w-1/2">
                              <div className="flex gap-1">
                                {["00", "15", "30", "45"].map((min) => (
                                  <button
                                    type="button"
                                    key={min}
                                    className={`btn btn-sm ${
                                      taskDetails.startMinute === Number(min)
                                        ? "btn-primary"
                                        : "btn-outline"
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

                        {/* End Time */}
                        <div className="flex-1">
                          <label className="label text-sm">
                            <span className="label-text">End Time</span>
                          </label>
                          <div className="flex items-center gap-2">
                            {/* Hour Input */}
                            <div className="flex flex-col w-1/2">
                              <select
                                className="select select-bordered select-sm w-full text-sm"
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

                                  // If 6 PM is selected, force minutes to "00"
                                  if (hour24 === 18) {
                                    setTaskDetails((prev) => ({
                                      ...prev,
                                      END_TIME: hour24,
                                      timeSuffixEnd: suffix,
                                      endMinute: 0, // Force minutes to 00
                                      formattedEndTime: `${hour12}:00 ${suffix}`,
                                    }));
                                  } else {
                                    setTaskDetails((prev) => ({
                                      ...prev,
                                      END_TIME: hour24,
                                      timeSuffixEnd: suffix,
                                      formattedEndTime: `${hour12}:${
                                        prev.endMinute
                                          ? prev.endMinute
                                              .toString()
                                              .padStart(2, "0")
                                          : "00"
                                      } ${suffix}`,
                                    }));
                                  }
                                }}
                              >
                                {Array.from({ length: 12 }, (_, i) => {
                                  const hour24 = 7 + i;
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

                            {/* Minute Input */}
                            <div className="flex flex-col w-1/2">
                              <div className="flex gap-1">
                                {["00", "15", "30", "45"].map((min) => {
                                  const minuteValue = Number(min);
                                  const is6PM = taskDetails.END_TIME === 18;
                                  const isDisabled = is6PM && minuteValue !== 0; // Disable all except "00" for 6 PM

                                  return (
                                    <button
                                      type="button"
                                      key={min}
                                      className={`btn btn-sm ${
                                        taskDetails.endMinute === minuteValue
                                          ? "btn-primary"
                                          : "btn-outline"
                                      } ${
                                        isDisabled
                                          ? "btn-disabled opacity-50 cursor-not-allowed"
                                          : ""
                                      }`}
                                      disabled={isDisabled}
                                      onClick={() => {
                                        if (is6PM && minuteValue !== 0) return; // Prevent any action for disabled buttons

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
                      <div className="flex gap-2 mt-8 justify-end">
                        {taskDetails.id && (
                          <button
                            className="btn btn-error btn-xs"
                            onClick={() => handleDelete(taskDetails.id)}
                          >
                            Delete
                          </button>
                        )}
                        <button
                          className="btn btn-outline btn-xs"
                          onClick={() => setShowPopup(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="btn btn-primary btn-xs"
                          onClick={handleSave}
                        >
                          {taskDetails.id ? "Update" : "Save"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <input
              type="radio"
              name="my_tabs_3"
              className="tab font-bold md:w-[20%]  border-2 text-xs border-gray-300  border-box w-full "
              aria-label="Table"
            />

            <div className="tab-content overflow-x-auto">
              <div className="h-[63vh] overflow-y-auto">
                <table className="table whitespace-nowrap table-zebra table-bordered w-full">
                  <thead className="sticky top-0 ">
                    <tr>
                      <th>Date</th>
                      <th>Task ID</th>
                      <th>Task Name</th>
                      <th>Project No</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Duration</th>
                      <th>Hours</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(timesheetsByDate).length === 0 ? (
                      <tr>
                        <td colSpan="10" className="text-center py-4">
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
                              <tr key={`${date}-${index}`}>
                                <td>{date}</td>
                                <td>{event.TASK_ID}</td>
                                <td>{event.TASK_NAME}</td>
                                <td>{event.PROJECT_NO}</td>
                                <td>
                                  {formatTime(
                                    event.START_TIME,
                                    event.startMinute
                                  )}
                                </td>
                                <td>
                                  {formatTime(event.END_TIME, event.endMinute)}
                                </td>
                                <td>{formatDuration(duration)}</td>
                                <td>{event.NO_OF_HOURS.toFixed(2)}</td>
                                <td>
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
                                <td>
                                  <button
                                    className="btn bg-transparent border-none hover:text-error  btn-xs"
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
      </form>
    </>
  );
}
