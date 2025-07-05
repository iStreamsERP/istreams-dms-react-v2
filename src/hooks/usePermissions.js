import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const usePermissions = () => {
  const { userData, refreshPermissions } = useAuth();

  const hasPermission = useCallback(
    (permissionKey) => {
      return userData.permissions[permissionKey] === "Allowed";
    },
    [userData.permissions]
  );

  return {
    isAdmin: userData.isAdmin,
    hasPermission,
    docCategories: userData.docCategories,
    refreshPermissions,
  };
};
