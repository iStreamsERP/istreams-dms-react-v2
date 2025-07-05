import { DefaultLayout } from "@/layouts/DefaultLayout";
import { UploadLayout } from "@/layouts/UploadLayout";
import CategoryAccessRightsPage from "@/pages/CategoryAccessRightsPage";
import CategoryMasterPage from "@/pages/CategoryMasterPage";
import CategoryViewPage from "@/pages/CategoryViewPage";
import DashboardPage from "@/pages/DashboardPage";
import DocumentListPage from "@/pages/DocumentListPage";
import DocumentViewPage from "@/pages/DocumentViewPage";
import ForgetPasswordPage from "@/pages/ForgetPasswordPage";
import LoginFormPage from "@/pages/LoginFormPage";
import NotFoundPage from "@/pages/NotFoundPage";
import RoleAccessRightsPage from "@/pages/RoleAccessRightsPage";
import SignUpPage from "@/pages/SignUpPage";
import TaskPage from "@/pages/TaskPage";
import TaskViewPage from "@/pages/TaskView";
import TeamsPage from "@/pages/TeamsPage";
import TimeSheetPage from "@/pages/TimeSheetPage";
import { UploadDocumentPage } from "@/pages/UploadDocumentPage";
import UserAccessRightsPage from "@/pages/UserAccessRightsPage";
import UserListPage from "@/pages/UserListPage";
import UserRolePage from "@/pages/UserRolePage ";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginFormPage />,
  },
  {
    path: "/signup",
    element: <SignUpPage />,
  },
  {
    path: "/forget-password",
    element: <ForgetPasswordPage />,
  },
  {
    path: "/upload-document",
    element: <ProtectedRoute />,
    children: [
      {
        element: <UploadLayout />,
        children: [{ index: true, element: <UploadDocumentPage /> }],
      },
    ],
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <DefaultLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "teams", element: <TeamsPage /> },
          { path: "category-view", element: <CategoryViewPage /> },
          { path: "document-list", element: <DocumentListPage /> },
          { path: "document-view", element: <DocumentViewPage /> },
          { path: "task-view", element: <TaskViewPage /> },
          { path: "time-sheet", element: <TimeSheetPage /> },
          { path: "task", element: <TaskPage /> },
          { path: "users", element: <UserListPage /> },
          { path: "user-role", element: <UserRolePage /> },
          {
            path: "category-access-rights",
            element: <CategoryAccessRightsPage />,
          },
          { path: "user-access-rights", element: <UserAccessRightsPage /> },
          { path: "role-access-rights", element: <RoleAccessRightsPage /> },
          { path: "category-master", element: <CategoryMasterPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
