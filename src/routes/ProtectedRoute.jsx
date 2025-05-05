// ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = () => {
    const { auth } = useAuth();
    return auth.token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;