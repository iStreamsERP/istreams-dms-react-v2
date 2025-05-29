import { ThemeProvider } from "@/components/theme-provider";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import CategoryAccessPage from "./pages/CategoryAccessPage";
import CategoryListPage from "./pages/CategoryListPage";
import CategoryViewPage from "./pages/CategoryViewPage";
import DashboardPage from "./pages/DashboardPage";
import DocumentListPage from "./pages/DocumentListPage";
import DocumentViewPage from "./pages/DocumentViewPage";
import ForgetPasswordPage from "./pages/ForgetPasswordPage";
import LoginFormPage from "./pages/LoginFormPage";
import NotFoundPage from "./pages/NotFoundPage";
import RoleAccessRightsPage from "./pages/RoleAccessRightsPage";
import SignUpPage from "./pages/SignUpPage";
import TaskPage from "./pages/TaskPage";
import TaskView from "./pages/TaskView";
import TeamsPage from "./pages/TeamsPage";
import TimeSheetPage from "./pages/TimeSheetPage";
import UserAccessRights from "./pages/UserAccessRights";
import UserListPage from "./pages/UserListPage";
import UserRole from "./pages/UserRole";
import Layout from "./routes/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";

const App = () => {
  const { userData } = useAuth();

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
      path: "/forgot-password",
      element: <ForgetPasswordPage />,
    },
    {
      path: "/",
      element: <ProtectedRoute />,
      children: [
        {
          element: <Layout />,
          children: [
            { index: true, element: <DashboardPage /> },

            ...(userData.isAdmin
              ? [{ path: "/teams", element: <TeamsPage /> }]
              : []),
            { path: "/category-view", element: <CategoryViewPage /> },
            { path: "/document-list", element: <DocumentListPage /> },
            { path: "/document-view", element: <DocumentViewPage /> },

            { path: "task-view", element: <TaskView /> },
            { path: "time-sheet", element: <TimeSheetPage /> },
            { path: "task", element: <TaskPage /> },
            { path: "users", element: <UserListPage /> },
            { path: "user-role", element: <UserRole /> },
            { path: "category-access", element: <CategoryAccessPage /> },
            { path: "user-access-rights", element: <UserAccessRights /> },
            { path: "role-access-rights", element: <RoleAccessRightsPage /> },
            { path: "category-list", element: <CategoryListPage /> },
          ],
        },
      ],
    },
    {
      path: "*",
      element: <NotFoundPage />,
    },
  ]);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App;
