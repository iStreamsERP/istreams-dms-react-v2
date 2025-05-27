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
    title: "Main",
    links: [
      {
        label: "Dashboard",
        icon: Home,
        path: "/",
      },
      {
        label: "Teams",
        icon: Users,
        path: "/teams",
      },
      {
        label: "Categories",
        icon: LayoutGrid,
        path: "/category-view",
      },
    ],
  },
  {
    title: "Documents",
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
    title: "Tasks",
    links: [
      {
        label: "Task View",
        icon: ClipboardListIcon,
        path: "/task-view",
      },
      {
        label: "Time Sheet",
        icon: CalendarClock,
        path: "/time-sheet",
      },
      {
        label: "Task management",
        icon: ClipboardListIcon,
        path: "/task",
      },
    ],
  },
  {
    title: "Access Control",
    links: [
      {
        label: "User Administration",
        icon: FileText,
        children: [
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
            label: "User Access Rights",
            icon: ShieldUser,
            path: "/user-access-rights",
          },
          {
            label: "Role Access Rights",
            icon: ShieldUser,
            path: "/role-access-rights",
          },
        ],
      },
      {
        label: "Category Access Rights",
        icon: FileText,
        path: "/category-list",
      },
    ],
  },
];
