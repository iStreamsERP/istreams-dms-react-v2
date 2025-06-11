import { ThemeProvider } from "@/components/theme-provider";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import CategoryAccessRightsPage from "./pages/CategoryAccessRightsPage";
import CategoryMasterPage from "./pages/CategoryMasterPage";
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
import UserAccessRightsPage from "./pages/UserAccessRightsPage";
import UserListPage from "./pages/UserListPage";
import UserRolePage from "./pages/UserRolePage ";
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

            { path: "/teams", element: <TeamsPage /> },
            { path: "/category-view", element: <CategoryViewPage /> },
            { path: "/document-list", element: <DocumentListPage /> },
            { path: "/document-view", element: <DocumentViewPage /> },
            { path: "task-view", element: <TaskView /> },
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

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App;
