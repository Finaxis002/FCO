import PageHeader from "@/components/ui/page-header";
import SettingsLayout from "@/components/settings/settings-layout";
import GeneralSettings from "@/components/settings/general-settings";
import DataManagementSettings from "@/components/settings/data-management-settings";
import RoleManagementSettings from "@/components/settings/role-management-settings";
import type { SettingsSection } from "@/components/settings/settings-layout"; 
import React from 'react';

export default function SettingsPage() {
  const settingsSections: SettingsSection[] = [
    {
      value: "general",
      label: "General",
      icon: "SettingsIcon", 
      content: <GeneralSettings />,
    },
    {
      value: "roles",
      label: "Roles & Permissions",
      icon: "UserCog", 
      content: <RoleManagementSettings />,
    },
    {
      value: "data",
      label: "Data Management",
      icon: "Database", 
      content: <DataManagementSettings />, 
    },
  ];

  return (
    <>
      <PageHeader 
        title="Application Settings"
        description="Configure and customize FranchiseFlow to your needs."
      />
      <SettingsLayout sections={settingsSections} defaultSection="general" />
    </>
  );
}
