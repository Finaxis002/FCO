import AppLayout from "@/components/layout/app-layout";
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import CasesPage from './pages/CasesPage';
import NewCasePage from './pages/NewCasePage';
import CaseDetailPage from './pages/CaseDetailPage';
// import CaseEditPage from './pages/CaseEditPage'; // Placeholder for edit page
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import { APP_NAME } from "@/lib/constants"; // For document title
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// GeistSans and GeistMono fonts should be imported in globals.css or linked in index.html
// For simplicity, assuming they are globally available via CSS.

const PlaceholderPage = ({ title }: { title: string }) => {
  useEffect(() => {
    document.title = `${title} | ${APP_NAME}`;
  }, [title]);
  return <div className="p-4 text-xl">{title} Page - To be implemented</div>;
};


export default function App() {
  const location = useLocation();

  useEffect(() => {
    // Basic title setting based on path, can be made more sophisticated
    const path = location.pathname;
    let title = APP_NAME;
    if (path === '/') title = `Dashboard | ${APP_NAME}`;
    else if (path.startsWith('/cases/new')) title = `New Case | ${APP_NAME}`;
    else if (path.startsWith('/cases/')) title = `Case Details | ${APP_NAME}`;
    else if (path.startsWith('/cases')) title = `Cases | ${APP_NAME}`;
    else if (path.startsWith('/users')) title = `Users | ${APP_NAME}`;
    else if (path.startsWith('/settings')) title = `Settings | ${APP_NAME}`;
    // Add more specific titles as needed
    document.title = title;
  }, [location.pathname]);

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/cases/new" element={<NewCasePage />} />
        <Route path="/cases/:caseId" element={<CaseDetailPage />} />
        {/* Example for an edit page, if created:
        <Route path="/cases/:caseId/edit" element={<CaseEditPage />} /> */}
        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/:userId/permissions" element={<PlaceholderPage title="User Permissions"/>} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<PlaceholderPage title="Profile"/>} />
        <Route path="/notifications" element={<PlaceholderPage title="Notifications"/>} />
        {/* Add a catch-all or a 404 component */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
