import {
  CalendarClock,
  ClipboardListIcon,
  FileSearch,
  FileText,
  Home,
  LayoutGrid,
  ShieldUser,
  Users,
} from "lucide-react";

export const navbarLinks = [
  {
    title: "Dashboard",
    links: [
      {
        label: "Dashboard",
        icon: Home,
        path: "/",
      },
    ],
  },
  {
    title: "Teams",
    links: [
      {
        label: "My Team",
        icon: Users,
        path: "/my-team",
      },
    ],
  },
  {
    title: "Category",
    links: [
      {
        label: "Category",
        icon: LayoutGrid,
        path: "/category-view",
      },
    ],
  },
  {
    title: "Document",
    links: [
      {
        label: "Document List",
        icon: FileText,
        path: "/document-list",
      },
      {
        label: "Document View",
        icon: FileSearch,
        path: "/document-view",
      },
    ],
  },
  {
    title: "Task",
    links: [
      {
        label: "Task View",
        icon: ClipboardListIcon,
        path: "/task-view",
      },
      {
        label: "Tasks",
        icon: ClipboardListIcon,
        path: "/task",
      },
      {
        label: "Time Sheet",
        icon: CalendarClock,
        path: "/time-sheet",
      },
    ],
  },
  {
    title: "Forms",
    links: [
       {
        label: "Categories",
        icon: FileText,
        path: "/category-form",
      },
      {
        label: "User Role",
        icon: ShieldUser,
        path: "/user-role",
      },
      {
        label: "Category Access",
        icon: ShieldUser,
        path: "/category-access",
      },
      {
        label: "Access Rights",
        icon: ShieldUser,
        path: "/access-rights",
      },
    ],
  },
];
