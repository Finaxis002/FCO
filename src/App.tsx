import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ProtectedRoute from "@/components/routes/ProtectedRoute";
import Login from "./pages/Login";
import DashboardPage from "./pages/DashboardPage";
import CasesPage from "./pages/CasesPage";
import NewCasePage from "./pages/NewCasePage";
import CaseDetailPage from "./pages/CaseDetailPage";
// import CaseEditPage from './pages/CaseEditPage'; // Placeholder for edit page
import UsersPage from "./pages/UsersPage";
import UserPermissionsPage from "./pages/UserPermissionsPage";
import SettingsPage from "./pages/SettingsPage";
import OwnersPage from "./pages/OwnersPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage"; // Import the new ProfilePage
import { APP_NAME } from "@/lib/constants";
import EditCasePage from "./pages/EditCasePage";
import ClientCaseDetailWrapper from "./pages/ClientCaseDetailWrapper";
import AllRemarksPage from "./pages/AllRemarksPage";
import ServicesPage from "./pages/ServicesPage";
import { useAppName } from "@/contenxt/AppNameContext"; // <-- Import this
import { fetchPermissions } from "@/features/permissionsSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";

// Simplified PlaceholderPage for debugging

export default function App() {
  const [currentUser, setCurrentUser] = useState<{
    _id?: string;
    name: string;
    role?: string;
    userId?: string;
    permissions?: {
      canCreate?: boolean;
      canEdit?: boolean;
      canDelete?: boolean;
      canViewReports?: boolean;
      canAssignTasks?: boolean;
      allCaseAccess?: boolean;
      viewRights?: boolean;
      createCaseRights?: boolean;
      createUserRights?: boolean;
      userRolesAndResponsibility?: boolean;
      remarksAndChat?: boolean;
      canShare?: boolean;
    };
  } | null>(null);
  const location = useLocation();
  const { appName } = useAppName(); // <-- Use context value
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setCurrentUser({
          _id: parsedUser._id, // <-- include this
          name: parsedUser.name,
          role: parsedUser.role,
          userId: parsedUser._id || parsedUser.userId,
        });

        // Skip fetching permissions if Super Admin
        if (
          parsedUser.name !== "Super Admin" &&
          (parsedUser._id || parsedUser.userId)
        ) {
          dispatch(fetchPermissions(parsedUser._id || parsedUser.userId));
        }
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, [dispatch]);

  console.log("current user", currentUser);

  useEffect(() => {
    const path = location.pathname;

    

    const subscribeToPushNotifications = async () => {
      // Use the currentUser from auth context
     
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Notification permission granted.");
        const swRegistration = await navigator.serviceWorker.register(
          "/service-worker.js"
        );
        const subscription = await swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey:
            "BFiAnzKqV9C437P10UIT5_daMne46XuJiVuSn4zQh2MQBjUIwMP9PMgk2TFQL9LOSiQy17eie7XRYZcJ0NE7jMs",
        });

        try {
          const response = await fetch(
            "https://tumbledrybe.sharda.co.in/api/pushnotifications/save-subscription",
            {
              method: "POST",
              body: JSON.stringify({
                userId: currentUser?.userId, // Use the actual user ID
                subscription,
              }),
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to save subscription");
          }
          console.log("Subscription saved.");
        } catch (error) {
          console.error("Failed to save subscription:", error);
        }
      } else {
        console.error("Notification permission denied.");
      }
    };

    if (path === "/login") {
      document.title = `Login | ${appName}`;
      return;
    }

    if (location.pathname !== "/login") {
      subscribeToPushNotifications();
    }

    let pageTitleSegment = "Dashboard"; // Default title segment

    if (path === "/") {
      pageTitleSegment = "Dashboard";
    } else if (path.startsWith("/cases/new")) {
      pageTitleSegment = "New Case";
    } else if (
      path.startsWith("/cases/") &&
      path.split("/").length > 2 &&
      !path.endsWith("/edit")
    ) {
      // This will be handled by CaseDetailPage's own useEffect
      return;
    } else if (path.startsWith("/cases")) {
      pageTitleSegment = "Cases";
    } else if (path.startsWith("/services")) {
      // <-- Add this block
      pageTitleSegment = "Services";
    } else if (path.startsWith("/owners")) {
      pageTitleSegment = "Owners";
    } else if (path.startsWith("/users/") && path.endsWith("/permissions")) {
      // UserPermissionsPage will set its own title
      return;
    } else if (path.startsWith("/users")) {
      pageTitleSegment = "Users";
    } else if (path.startsWith("/settings")) {
      pageTitleSegment = "Settings";
    } else if (path.startsWith("/profile")) {
      // ProfilePage will set its own title
      return;
    } else if (path.startsWith("/notifications")) {
      // NotificationsPage will set its own title
      return;
    }

    document.title = `${pageTitleSegment} | ${appName}`;
  }, [location.pathname, currentUser]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/client/cases/:caseId"
        element={<ClientCaseDetailWrapper />}
      />
      {/* Protected Routes */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/cases" element={<CasesPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/cases/new" element={<NewCasePage />} />
                <Route path="/cases/:caseId" element={<CaseDetailPage />} />
                <Route path="/cases/:caseId/edit" element={<EditCasePage />} />
                <Route path="/owners" element={<OwnersPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route
                  path="/users/:userId/permissions"
                  element={<UserPermissionsPage />}
                />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/remarks" element={<AllRemarksPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
