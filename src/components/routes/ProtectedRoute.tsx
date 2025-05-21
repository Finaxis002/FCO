import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredPermission?: (permissions: any) => boolean; // optional permission check callback
  fallbackPath?: string; // redirect path if no access
}

export default function ProtectedRoute({
  children,
  requiredPermission,
  fallbackPath = "/unauthorized",
}: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const permissions = useSelector(
    (state: RootState) => state.permissions.permissions
  );
  const currentUser = useSelector((state: RootState) => state.users.currentUser);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Super Admin always allowed
  const isSuperAdmin = currentUser?.name === "Super Admin";

  console.log("Current user:", currentUser?.name, "Is Super Admin?", isSuperAdmin);

  // If no specific permission required, just allow access if logged in
  if (!requiredPermission) {
    return children;
  }

  // Check permission or super admin override
  if (isSuperAdmin || (permissions && requiredPermission(permissions))) {
    return children;
  }

  // Otherwise block access and redirect
  return <Navigate to={fallbackPath} replace />;
}
