import { ThemeProvider } from "@/components/theme-provider";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CategoryViewPage from "./pages/CategoryViewPage";
import DashboardPage from "./pages/DashboardPage";
import DocumentListPage from "./pages/DocumentListPage";
import DocumentViewPage from "./pages/DocumentViewPage";
import ForgetPasswordPage from "./pages/ForgetPasswordPage";
import LoginFormPage from "./pages/LoginFormPage";
import MyTeamPage from "./pages/MyTeamPage";
import NotFoundPage from "./pages/NotFoundPage";
import SignUpPage from "./pages/SignUpPage";
import TaskPage from "./pages/TaskPage";
import TaskView from "./pages/TaskView";
import TimeSheetPage from "./pages/TimeSheetPage";
import Layout from "./routes/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import CategoryFormPage from "./pages/CategoryFormPage";
import UserRole from "./pages/UserRole";
import CategoryAccessPage from "./pages/CategoryAccessPage";

const App = () => {
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

            { path: "my-team", element: <MyTeamPage /> },
            { path: "/category-view", element: <CategoryViewPage /> },
            { path: "/document-list", element: <DocumentListPage /> },
            { path: "/document-view", element: <DocumentViewPage /> },

            { path: "task-view", element: <TaskView /> },
            { path: "time-sheet", element: <TimeSheetPage /> },
            { path: "task", element: <TaskPage /> },
            { path: "category-form", element: <CategoryFormPage /> },
            { path: "user-role", element: <UserRole /> },
            { path: "category-access", element: <CategoryAccessPage /> },
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
