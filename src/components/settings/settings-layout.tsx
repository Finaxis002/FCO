"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ReactNode } from "react";
import { UserCog, Database, Settings as SettingsIconLucide } from "lucide-react"; // Renamed Settings to avoid conflict

// Define a mapping for icon strings to components
const iconMap: { [key: string]: React.ElementType } = {
  SettingsIcon: SettingsIconLucide,
  UserCog: UserCog,
  Database: Database,
  // Add other icons here as needed
};


export interface SettingsSection { // Exported for use in SettingsPage
  value: string;
  label: string;
  icon: string; // Changed from React.ElementType to string
  content: ReactNode;
}

interface SettingsLayoutProps {
  sections: SettingsSection[];
  defaultSection: string;
}

export default function SettingsLayout({ sections, defaultSection }: SettingsLayoutProps) {
  return (
    <Tabs defaultValue={defaultSection} className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-6">
        {sections.map((section) => {
          const IconComponent = iconMap[section.icon] || SettingsIconLucide; // Fallback to a default icon
          return (
            <TabsTrigger key={section.value} value={section.value} className="flex-1 flex items-center justify-center gap-2 py-2">
              <IconComponent className="h-4 w-4" />
              {section.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {sections.map((section) => (
        <TabsContent key={section.value} value={section.value}>
          {section.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
